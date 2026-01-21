"""
Graph traversal and Neo4j query services
"""

from typing import List, Dict, Any, Optional
from app.database.neo4j import neo4j_driver


class GraphService:
    """Service for graph operations"""
    
    @staticmethod
    def get_path_to_source(component_id: str) -> List[Dict[str, Any]]:
        """
        Find the path from a component back to its power source
        
        This uses Neo4j's variable-length relationship traversal to find
        all paths from PowerGeneration nodes to the specified component,
        then returns the longest path (most complete chain).
        
        Args:
            component_id: ID of the component to trace back from
            
        Returns:
            List of components in the path from source to target (ordered source -> target)
        """
        with neo4j_driver.get_session() as session:
            # Find all paths from any PowerGeneration to the selected component
            # [:FEEDS*] means "follow FEEDS relationships any number of times"
            query = """
                MATCH path = (source:Component:PowerGeneration)-[:FEEDS*]->(selected:Component)
                WHERE selected.id = $component_id
                RETURN path
                ORDER BY length(path) DESC
                LIMIT 1
            """
            
            result = session.run(query, component_id=component_id)
            record = result.single()
            
            if not record:
                return []
            
            # Extract nodes from the path
            path = record["path"]
            nodes = []
            
            # Iterate through all nodes in the path
            for node in path.nodes:
                nodes.append({
                    "id": node.get("id", ""),
                    "name": node.get("name", ""),
                    "type": node.get("type", ""),
                    "longitude": node.get("longitude", 0.0),
                    "latitude": node.get("latitude", 0.0),
                })
            
            return nodes
    
    @staticmethod
    def get_all_components(component_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get all components, optionally filtered by type
        
        Args:
            component_type: Optional filter by component type (e.g., "PowerGeneration")
            
        Returns:
            List of all components with their properties
        """
        with neo4j_driver.get_session() as session:
            if component_type:
                # Filter by type
                query = """
                    MATCH (n:Component)
                    WHERE n.type = $component_type
                    RETURN n.id as id, n.name as name, n.type as type, 
                           n.longitude as longitude, n.latitude as latitude
                    ORDER BY n.type, n.name
                """
                result = session.run(query, component_type=component_type)
            else:
                # Get all components
                query = """
                    MATCH (n:Component)
                    RETURN n.id as id, n.name as name, n.type as type,
                           n.longitude as longitude, n.latitude as latitude
                    ORDER BY n.type, n.name
                """
                result = session.run(query)
            
            components = []
            for record in result:
                components.append({
                    "id": record["id"],
                    "name": record["name"],
                    "type": record["type"],
                    "longitude": record["longitude"],
                    "latitude": record["latitude"],
                })
            
            return components
    
    @staticmethod
    def get_component_by_id(component_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a single component by its ID
        
        Args:
            component_id: The unique ID of the component
            
        Returns:
            Component data dictionary or None if not found
        """
        with neo4j_driver.get_session() as session:
            query = """
                MATCH (n:Component {id: $component_id})
                RETURN n.id as id, n.name as name, n.type as type,
                       n.longitude as longitude, n.latitude as latitude
            """
            
            result = session.run(query, component_id=component_id)
            record = result.single()
            
            if not record:
                return None
            
            return {
                "id": record["id"],
                "name": record["name"],
                "type": record["type"],
                "longitude": record["longitude"],
                "latitude": record["latitude"],
            }
