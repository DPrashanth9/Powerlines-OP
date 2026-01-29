"""
Overpass API service for fetching OpenStreetMap data
Handles Overland Park boundary and power infrastructure queries
"""

import httpx
import math
import re
from typing import List, Dict, Any, Optional, Tuple
from geojson import FeatureCollection, Feature, Point, LineString, Polygon
import logging

logger = logging.getLogger(__name__)

# Overpass API fallback servers
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://api.openstreetmap.fr/oapi/interpreter",
]

# Cache for boundary (TTL: 1 hour)
_boundary_cache: Optional[Dict[str, Any]] = None
_boundary_cache_time: float = 0
BOUNDARY_CACHE_TTL = 3600  # 1 hour

# Cache for power data (by bbox, TTL: 30 minutes)
_power_cache: Dict[str, Tuple[Dict[str, Any], float]] = {}
POWER_CACHE_TTL = 1800  # 30 minutes


def round_bbox(bbox: Tuple[float, float, float, float], decimals: int = 4) -> Tuple[float, float, float, float]:
    """
    Round bbox coordinates to reduce cache misses for similar views
    
    Args:
        bbox: (south, west, north, east)
        decimals: Number of decimal places
        
    Returns:
        Rounded bbox tuple
    """
    return tuple(round(coord, decimals) for coord in bbox)


def calculate_bbox_diagonal(bbox: Tuple[float, float, float, float]) -> float:
    """
    Calculate diagonal distance of bbox in kilometers
    
    Args:
        bbox: (south, west, north, east)
        
    Returns:
        Diagonal distance in km
    """
    south, west, north, east = bbox
    
    # Haversine formula for diagonal
    lat1, lon1 = math.radians(south), math.radians(west)
    lat2, lon2 = math.radians(north), math.radians(east)
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    
    # Earth radius in km
    R = 6371.0
    
    return R * c


def haversine_distance(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """
    Calculate distance between two coordinates in kilometers
    
    Args:
        coord1: (lat, lon)
        coord2: (lat, lon)
        
    Returns:
        Distance in km
    """
    lat1, lon1 = math.radians(coord1[0]), math.radians(coord1[1])
    lat2, lon2 = math.radians(coord2[0]), math.radians(coord2[1])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    
    return 6371.0 * c  # Earth radius in km


def calculate_linestring_length(coordinates: List[List[float]]) -> float:
    """
    Calculate total length of a LineString in kilometers
    
    Args:
        coordinates: List of [lon, lat] pairs
        
    Returns:
        Length in km
    """
    if len(coordinates) < 2:
        return 0.0
    
    total_km = 0.0
    for i in range(len(coordinates) - 1):
        # OSM/GeoJSON uses [lon, lat] order
        coord1 = (coordinates[i][1], coordinates[i][0])  # (lat, lon)
        coord2 = (coordinates[i + 1][1], coordinates[i + 1][0])
        total_km += haversine_distance(coord1, coord2)
    
    return total_km


async def query_overpass(query: str, timeout: int = 60) -> Dict[str, Any]:
    """
    Query Overpass API with fallback servers
    
    Args:
        query: Overpass QL query string
        timeout: Request timeout in seconds (reduced to 60s for faster failures)
        
    Returns:
        Overpass API response JSON
        
    Raises:
        Exception: If all servers fail
    """
    last_error = None
    
    for url in OVERPASS_URLS:
        try:
            # Use shorter timeout for faster response
            async with httpx.AsyncClient(timeout=httpx.Timeout(timeout, connect=10)) as client:
                response = await client.post(
                    url,
                    data=query,
                    headers={"Content-Type": "text/plain"},
                )
                response.raise_for_status()
                return response.json()
        except httpx.TimeoutException as e:
            last_error = e
            logger.warning(f"Overpass server {url} timed out: {e}, trying next...")
            continue
        except Exception as e:
            last_error = e
            logger.warning(f"Overpass server {url} failed: {e}, trying next...")
            continue
    
    raise Exception(f"All Overpass servers failed. Last error: {last_error}")


async def get_overland_park_boundary() -> FeatureCollection:
    """
    Fetch Overland Park, Kansas boundary from OpenStreetMap
    
    Returns:
        GeoJSON FeatureCollection with boundary polygon
    """
    global _boundary_cache, _boundary_cache_time
    import time
    
    # Check cache
    current_time = time.time()
    if _boundary_cache and (current_time - _boundary_cache_time) < BOUNDARY_CACHE_TTL:
        logger.info("Returning cached boundary")
        return _boundary_cache
    
    # Overpass query for Overland Park boundary
    # Try multiple queries to find the boundary
    query = """
    [out:json][timeout:180];
    (
      relation["name"="Overland Park"]["admin_level"="8"](38.95,-94.75,39.0,-94.6);
      relation["name"="Overland Park"]["place"="city"](38.95,-94.75,39.0,-94.6);
      relation["name"="Overland Park"]["type"="boundary"](38.95,-94.75,39.0,-94.6);
    );
    out geom;
    """
    
    try:
        result = await query_overpass(query)
        
        if not result.get("elements"):
            raise Exception("No boundary found for Overland Park")
        
        # Convert Overpass relation to GeoJSON
        features = []
        for element in result["elements"]:
            if element.get("type") == "relation" and "members" in element:
                # Extract outer way coordinates
                outer_ways = []
                for member in element.get("members", []):
                    if member.get("role") == "outer" and member.get("type") == "way":
                        # Get way coordinates from geometry if available
                        if "geometry" in member:
                            coords = [[node["lon"], node["lat"]] for node in member["geometry"]]
                            if coords:
                                outer_ways.append(coords)
                
                if outer_ways:
                    # Create polygon from outer ways
                    # For simplicity, use first outer way as main polygon
                    polygon_coords = outer_ways[0]
                    if polygon_coords[0] != polygon_coords[-1]:
                        polygon_coords.append(polygon_coords[0])  # Close polygon
                    
                    feature = Feature(
                        geometry=Polygon([polygon_coords]),
                        properties={
                            "name": element.get("tags", {}).get("name", "Overland Park"),
                            "type": "boundary",
                        }
                    )
                    features.append(feature)
        
        if not features:
            # Fallback: create a simple bounding box for Overland Park
            # Approximate city boundaries
            logger.warning("Could not extract boundary geometry from OSM, using approximate bounding box")
            bbox = [
                [-94.75, 38.95],   # SW
                [-94.75, 39.0],    # NW
                [-94.6, 39.0],     # NE
                [-94.6, 38.95],    # SE
                [-94.75, 38.95],   # Close
            ]
            features.append(Feature(
                geometry=Polygon([bbox]),
                properties={"name": "Overland Park", "type": "boundary", "note": "approximate"}
            ))
        
        feature_collection = FeatureCollection(features)
        
        # Cache result
        _boundary_cache = feature_collection
        _boundary_cache_time = current_time
        
        return feature_collection
        
    except Exception as e:
        logger.error(f"Error fetching Overland Park boundary: {e}")
        raise


async def get_power_infrastructure(bbox: Tuple[float, float, float, float]) -> Dict[str, Any]:
    """
    Fetch power infrastructure from OpenStreetMap for given bounding box
    
    Args:
        bbox: (south, west, north, east) in decimal degrees
        
    Returns:
        Dict with 'geojson' (FeatureCollection) and 'stats' (dict)
    """
    global _power_cache
    import time
    
    # Round bbox for caching (use 3 decimals for better cache hits)
    rounded_bbox = round_bbox(bbox, decimals=3)
    bbox_key = str(rounded_bbox)
    
    # Check cache
    current_time = time.time()
    if bbox_key in _power_cache:
        cached_data, cache_time = _power_cache[bbox_key]
        if (current_time - cache_time) < POWER_CACHE_TTL:
            logger.info(f"✅ Cache HIT for bbox {bbox_key} (age: {current_time - cache_time:.1f}s)")
            return cached_data
    
    logger.info(f"⏳ Fetching power data for bbox {bbox_key} (cache miss)")
    start_time = time.time()
    
    # Validate bbox size
    diagonal_km = calculate_bbox_diagonal(bbox)
    if diagonal_km > 60:
        raise ValueError("Zoom in - bounding box too large (max 60km diagonal)")
    
    south, west, north, east = bbox
    
    # Optimized Overpass query for power infrastructure
    # Using shorter timeout and optimized output format
    query = f"""
    [out:json][timeout:25];
    (
      way["power"="line"]({south},{west},{north},{east});
      way["power"="minor_line"]({south},{west},{north},{east});
      node["power"="transformer"]({south},{west},{north},{east});
    );
    out geom;
    """
    
    try:
        result = await query_overpass(query)
        
        features = []
        transmission_miles = 0.0
        distribution_miles = 0.0
        transformer_count = 0
        voltage_values = []  # Track all voltage values for analysis
        
        for element in result.get("elements", []):
            element_type = element.get("type")
            tags = element.get("tags", {})
            power_type = tags.get("power", "")
            
            if element_type == "way" and power_type in ["line", "minor_line"]:
                # Extract coordinates
                if "geometry" in element:
                    coordinates = [[node["lon"], node["lat"]] for node in element["geometry"]]
                    if len(coordinates) >= 2:
                        # Calculate length
                        length_km = calculate_linestring_length(coordinates)
                        length_miles = length_km * 0.621371
                        
                        # Add to totals
                        if power_type == "line":
                            transmission_miles += length_miles
                        else:
                            distribution_miles += length_miles
                        
                        # Track voltage for analysis
                        voltage_str = tags.get("voltage", "")
                        if voltage_str:
                            try:
                                # Extract numeric voltage value (handle formats like "138000", "138 kV", etc.)
                                voltage_match = re.search(r'(\d+)', str(voltage_str).replace(',', ''))
                                if voltage_match:
                                    voltage_val = int(voltage_match.group(1))
                                    voltage_values.append(voltage_val)
                            except (ValueError, AttributeError):
                                pass
                        
                        # Include ALL tags from OSM, plus computed fields
                        # Filter out empty values during construction for better performance
                        properties = {
                            "power": power_type,
                            "osm_id": element.get("id"),
                            "length_km": round(length_km, 3),
                            "length_miles": round(length_miles, 3),
                        }
                        # Add all non-empty tags
                        for k, v in tags.items():
                            if v and str(v).strip():  # Only add non-empty values
                                properties[k] = v
                        
                        feature = Feature(
                            geometry=LineString(coordinates),
                            properties=properties
                        )
                        features.append(feature)
            
            elif element_type == "node" and power_type == "transformer":
                # Extract coordinates
                lon = element.get("lon")
                lat = element.get("lat")
                if lon is not None and lat is not None:
                    transformer_count += 1
                    # Include ALL tags from OSM, plus computed fields
                    # Filter out empty values during construction for better performance
                    properties = {
                        "power": "transformer",
                        "osm_id": element.get("id"),
                    }
                    # Add all non-empty tags
                    for k, v in tags.items():
                        if v and str(v).strip():  # Only add non-empty values
                            properties[k] = v
                    
                    # Track voltage for analysis
                    voltage_str = tags.get("voltage", "")
                    if voltage_str:
                        try:
                            # Extract numeric voltage value (handle formats like "138000", "138 kV", etc.)
                            voltage_match = re.search(r'(\d+)', str(voltage_str).replace(',', ''))
                            if voltage_match:
                                voltage_val = int(voltage_match.group(1))
                                voltage_values.append(voltage_val)
                                logger.debug(f"Found voltage {voltage_val} from transformer {element.get('id')}")
                        except (ValueError, AttributeError) as e:
                            logger.debug(f"Could not parse voltage '{voltage_str}': {e}")
                            pass
                    
                    feature = Feature(
                        geometry=Point([lon, lat]),
                        properties=properties
                    )
                    features.append(feature)
        
        feature_collection = FeatureCollection(features)
        
        # Calculate voltage statistics
        highest_voltage = None
        lowest_voltage = None
        if voltage_values:
            highest_voltage = max(voltage_values)
            lowest_voltage = min(voltage_values)
            logger.info(f"Voltage range: {lowest_voltage}V - {highest_voltage}V ({len(voltage_values)} values found)")
        else:
            logger.info("No voltage data found in current view")
        
        result_data = {
            "geojson": feature_collection,
            "stats": {
                "transmission_miles": round(transmission_miles, 2),
                "distribution_miles": round(distribution_miles, 2),
                "transformer_count": transformer_count,
                "highest_voltage": highest_voltage,
                "lowest_voltage": lowest_voltage,
            }
        }
        
        logger.info(f"Returning stats: transformers={transformer_count}, voltage_range={lowest_voltage}-{highest_voltage}")
        
        # Cache result
        _power_cache[bbox_key] = (result_data, current_time)
        
        elapsed = time.time() - start_time
        logger.info(f"✅ Power data fetched in {elapsed:.2f}s - {len(features)} features, cache updated")
        
        return result_data
        
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Error fetching power infrastructure: {e}")
        raise
