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
    """Manage application lifespan - connect to Neo4j on startup (optional)"""
    # Startup: Try to connect to Neo4j (optional for map view)
    logger.info("🚀 Starting Power Grid Visualizer API...")
    logger.info("📡 Overland Park map endpoints available (Neo4j optional)")
    
    try:
        neo4j_driver.connect()
        if neo4j_driver.test_connection():
            logger.info("✅ Neo4j connection verified! (Path traversal features enabled)")
        else:
            logger.warning("⚠️ Neo4j connection test failed (Map view still works)")
    except Exception as e:
        logger.warning(f"⚠️ Neo4j not available: {e}")
        logger.info("ℹ️  Map view works without Neo4j. Start Neo4j for path traversal features.")
    
    yield
    
    # Shutdown: Close Neo4j connection if it exists
    logger.info("🛑 Shutting down...")
    try:
        neo4j_driver.close()
    except:
        pass  # Ignore if not connected


app = FastAPI(
    title="Power Grid Visualizer API",
    description="API for power grid component visualization and path traversal",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(components.router)
from app.api import overland_park
app.include_router(overland_park.router)


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
    try:
        neo4j_status = neo4j_driver.test_connection()
    except:
        neo4j_status = False
    
    return {
        "status": "ok",
        "neo4j_connected": neo4j_status,
        "neo4j_uri": neo4j_driver.uri if neo4j_status else None,
        "message": "Map endpoints work without Neo4j. Neo4j is optional for path traversal features."
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
