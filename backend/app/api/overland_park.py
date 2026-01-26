"""
API endpoints for Overland Park power infrastructure
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Tuple
from app.services.overpass_service import (
    get_overland_park_boundary,
    get_power_infrastructure,
    calculate_bbox_diagonal,
)

router = APIRouter(prefix="/api/op", tags=["overland-park"])


@router.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}


@router.get("/boundary")
async def get_boundary():
    """
    Get Overland Park, Kansas boundary as GeoJSON
    
    Returns:
        GeoJSON FeatureCollection with boundary polygon
    """
    try:
        boundary = await get_overland_park_boundary()
        return boundary
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch Overland Park boundary: {str(e)}"
        )


@router.get("/power")
async def get_power(
    bbox: str = Query(..., description="Bounding box as south,west,north,east")
):
    """
    Get power infrastructure for Overland Park within bounding box
    
    Args:
        bbox: Comma-separated string "south,west,north,east"
        
    Returns:
        Dict with 'geojson' (FeatureCollection) and 'stats' (dict)
    """
    try:
        # Parse bbox string
        parts = bbox.split(",")
        if len(parts) != 4:
            raise ValueError("bbox must be 'south,west,north,east'")
        
        bbox_tuple = tuple(float(x) for x in parts)
        south, west, north, east = bbox_tuple
        
        # Validate bbox order
        if south >= north or west >= east:
            raise ValueError("Invalid bbox: south must be < north, west must be < east")
        
        # Check bbox size
        diagonal_km = calculate_bbox_diagonal(bbox_tuple)
        if diagonal_km > 60:
            raise HTTPException(
                status_code=400,
                detail="Zoom in - bounding box too large (max 60km diagonal)"
            )
        
        result = await get_power_infrastructure(bbox_tuple)
        return result
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch power infrastructure: {str(e)}"
        )
