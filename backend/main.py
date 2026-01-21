"""
Power Grid Visualizer - FastAPI Backend
Main entry point for the application
"""
from dotenv import load_dotenv
import os

load_dotenv()


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from app.database.neo4j import neo4j_driver
from app.api import components

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - connect to Neo4j on startup"""
    # Startup: Connect to Neo4j
    logger.info("🚀 Starting Power Grid Visualizer API...")
    try:
        neo4j_driver.connect()
        if neo4j_driver.test_connection():
            logger.info("✅ Neo4j connection verified!")
        else:
            logger.warning("⚠️ Neo4j connection test failed")
    except Exception as e:
        logger.error(f"❌ Failed to connect to Neo4j: {e}")
        logger.error("Please check your .env file and ensure Neo4j is running")
    
    yield
    
    # Shutdown: Close Neo4j connection
    logger.info("🛑 Shutting down...")
    neo4j_driver.close()


app = FastAPI(
    title="Power Grid Visualizer API",
    description="API for power grid component visualization and path traversal",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(components.router)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Power Grid Visualizer API is running",
        "status": "healthy"
    }


@app.get("/api/health")
async def health():
    """Health check endpoint with Neo4j connection status"""
    neo4j_status = neo4j_driver.test_connection()
    return {
        "status": "healthy",
        "neo4j_connected": neo4j_status,
        "neo4j_uri": neo4j_driver.uri if neo4j_status else None
    }


@app.get("/api/test-neo4j")
async def test_neo4j():
    """Test Neo4j connection and return database info"""
    try:
        with neo4j_driver.get_session() as session:
            # Get Neo4j version
            result = session.run("CALL dbms.components() YIELD name, versions RETURN name, versions[0] as version")
            version_info = [{"name": record["name"], "version": record["version"]} 
                          for record in result]
            
            # Count nodes
            node_count = session.run("MATCH (n) RETURN count(n) as count").single()["count"]
            
            return {
                "connected": True,
                "version": version_info,
                "node_count": node_count,
                "message": "Neo4j connection successful!"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Neo4j connection failed: {str(e)}")
