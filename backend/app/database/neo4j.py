"""
Neo4j database connection and session management
"""

from neo4j import GraphDatabase
from dotenv import load_dotenv
import os
from typing import Optional
import logging

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)


class Neo4jDriver:
    """Manages Neo4j database connection"""
    
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.user = os.getenv("NEO4J_USER", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver: Optional[GraphDatabase.driver] = None
    
    def connect(self):
        """Establish connection to Neo4j"""
        try:
            self.driver = GraphDatabase.driver(
                self.uri, 
                auth=(self.user, self.password)
            )
            # Test the connection
            self.driver.verify_connectivity()
            logger.info(f"✅ Successfully connected to Neo4j at {self.uri}")
            return self.driver
        except Exception as e:
            logger.error(f"❌ Failed to connect to Neo4j: {e}")
            raise
    
    def close(self):
        """Close database connection"""
        if self.driver:
            self.driver.close()
            logger.info("Neo4j connection closed")
    
    def get_session(self):
        """Get a new database session"""
        if not self.driver:
            self.connect()
        return self.driver.session()
    
    def test_connection(self) -> bool:
        """Test if connection to Neo4j is working"""
        try:
            with self.get_session() as session:
                result = session.run("RETURN 1 as test")
                result.single()
                return True
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            return False


# Global instance
neo4j_driver = Neo4jDriver()
