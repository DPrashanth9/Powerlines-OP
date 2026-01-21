"""
API endpoints for power grid components
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.graph_service import GraphService
from app.models.component import Component, PathToSource, PathNode, ComponentType

router = APIRouter(prefix="/api/components", tags=["components"])


@router.get("/", response_model=list[Component])
async def get_components(component_type: Optional[str] = Query(None, description="Filter by component type")):
    """
    Get all components
    
    - Returns all power grid components
    - Optionally filter by component type (e.g., PowerGeneration, Building)
    """
    try:
        components = GraphService.get_all_components(component_type)
        return components
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching components: {str(e)}")


@router.get("/{component_id}", response_model=Component)
async def get_component(component_id: str):
    """
    Get a single component by ID
    
    - Returns details of a specific component
    - Returns 404 if component not found
    """
    try:
        component = GraphService.get_component_by_id(component_id)
        if not component:
            raise HTTPException(status_code=404, detail=f"Component with id '{component_id}' not found")
        return component
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching component: {str(e)}")


@router.get("/{component_id}/path-to-source", response_model=PathToSource)
async def get_path_to_source(component_id: str):
    """
    Get the path from a component back to its power source
    
    This endpoint traces the electricity flow backwards from any component
    to find the complete path back to the power generation source.
    
    - Returns the complete path from power source to the selected component
    - Path is ordered from source (first) to target (last)
    - Returns empty path if component not found or not connected to a source
    """
    try:
        # Verify component exists
        component = GraphService.get_component_by_id(component_id)
        if not component:
            raise HTTPException(status_code=404, detail=f"Component with id '{component_id}' not found")
        
        # Get the path
        path_nodes = GraphService.get_path_to_source(component_id)
        
        # Convert to PathNode objects
        path = [
            PathNode(
                id=node["id"],
                name=node["name"],
                type=node["type"],
                longitude=node["longitude"],
                latitude=node["latitude"]
            )
            for node in path_nodes
        ]
        
        return PathToSource(
            component_id=component_id,
            path=path
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding path: {str(e)}")
