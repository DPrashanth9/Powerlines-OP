"""
Initialize Neo4j database schema for power grid components
Run this script once to set up the database structure
"""

from app.database.neo4j import neo4j_driver
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_constraints():
    """Create unique constraints and indexes for better performance"""
    constraints = [
        # Unique constraint on component IDs
        "CREATE CONSTRAINT component_id IF NOT EXISTS FOR (c:Component) REQUIRE c.id IS UNIQUE",
        
        # Indexes for faster lookups
        "CREATE INDEX component_type IF NOT EXISTS FOR (c:Component) ON (c.type)",
        "CREATE INDEX component_name IF NOT EXISTS FOR (c:Component) ON (c.name)",
    ]
    
    with neo4j_driver.get_session() as session:
        for constraint in constraints:
            try:
                session.run(constraint)
                logger.info(f"✅ Created constraint/index: {constraint.split()[2]}")
            except Exception as e:
                # Constraint might already exist, that's okay
                logger.debug(f"Constraint/index may already exist: {e}")


def create_sample_data():
    """
    Create sample power grid data for testing
    
    NOTE: This creates San Francisco demo data. 
    For Overland Park visualization, use Overpass API endpoints instead.
    This function is kept for Neo4j path traversal features but not used for map view.
    """
    # DISABLED: This creates SF demo data. Use Overpass API for real data instead.
    return 0
    
    # Original SF demo data (commented out):
    """
    sample_data = """
    // Create a sample power generation plant
    CREATE (pg:Component:PowerGeneration {
        id: 'plant-001',
        name: 'Solar Farm Alpha',
        type: 'PowerGeneration',
        generation_type: 'Solar',
        capacity: 100,
        longitude: -122.4194,
        latitude: 37.7749
    })
    
    // Create step-up substation
    CREATE (sus:Component:StepUpSubstation {
        id: 'substation-stepup-001',
        name: 'Step-Up Substation 1',
        type: 'StepUpSubstation',
        voltage_in: 13.8,
        voltage_out: 230,
        longitude: -122.4094,
        latitude: 37.7849
    })
    
    // Create transmission line
    CREATE (tl:Component:TransmissionLine {
        id: 'transmission-001',
        name: 'Main Transmission Line',
        type: 'TransmissionLine',
        voltage: 230,
        length: 50,
        longitude: -122.3994,
        latitude: 37.7949
    })
    
    // Create transmission substation
    CREATE (ts:Component:TransmissionSubstation {
        id: 'substation-trans-001',
        name: 'Transmission Substation 1',
        type: 'TransmissionSubstation',
        voltage_in: 230,
        voltage_out: 69,
        longitude: -122.3894,
        latitude: 37.8049
    })
    
    // Create distribution substation
    CREATE (ds:Component:DistributionSubstation {
        id: 'substation-dist-001',
        name: 'Distribution Substation 1',
        type: 'DistributionSubstation',
        voltage_in: 69,
        voltage_out: 12.47,
        longitude: -122.3794,
        latitude: 37.8149
    })
    
    // Create distribution line
    CREATE (dl:Component:DistributionLine {
        id: 'distribution-001',
        name: 'Neighborhood Distribution Line',
        type: 'DistributionLine',
        voltage: 12.47,
        longitude: -122.3694,
        latitude: 37.8249
    })
    
    // Create local transformer
    CREATE (lt:Component:LocalTransformer {
        id: 'transformer-001',
        name: 'Local Transformer 1',
        type: 'LocalTransformer',
        voltage_in: 12.47,
        voltage_out: 0.24,
        longitude: -122.3594,
        latitude: 37.8349
    })
    
    // Create service drop
    CREATE (sd:Component:ServiceDrop {
        id: 'service-001',
        name: 'Service Drop 1',
        type: 'ServiceDrop',
        meter_id: 'METER-001',
        longitude: -122.3494,
        latitude: 37.8449
    })
    
    // Create building
    CREATE (b:Component:Building {
        id: 'building-001',
        name: 'Residential Building 1',
        type: 'Building',
        address: '123 Main St',
        longitude: -122.3394,
        latitude: 37.8549
    })
    
    // Create relationships (FEEDS relationships)
    CREATE (pg)-[:FEEDS]->(sus)
    CREATE (sus)-[:FEEDS]->(tl)
    CREATE (tl)-[:FEEDS]->(ts)
    CREATE (ts)-[:FEEDS]->(ds)
    CREATE (ds)-[:FEEDS]->(dl)
    CREATE (dl)-[:FEEDS]->(lt)
    CREATE (lt)-[:FEEDS]->(sd)
    CREATE (sd)-[:FEEDS]->(b)
    
    RETURN count(*) as components_created
    """
    
    with neo4j_driver.get_session() as session:
        result = session.run(sample_data)
        count = result.single()["components_created"]
        logger.info(f"✅ Created {count} sample components with relationships")
        return count


def verify_schema():
    """Verify the schema was created correctly"""
    with neo4j_driver.get_session() as session:
        # Count nodes by type
        result = session.run("""
            MATCH (n:Component)
            RETURN n.type as type, count(n) as count
            ORDER BY type
        """)
        
        logger.info("\n📊 Database Statistics:")
        logger.info("-" * 50)
        for record in result:
            logger.info(f"  {record['type']}: {record['count']} nodes")
        
        # Count relationships
        rel_result = session.run("MATCH ()-[r:FEEDS]->() RETURN count(r) as count")
        rel_count = rel_result.single()["count"]
        logger.info(f"  FEEDS relationships: {rel_count}")
        logger.info("-" * 50)


def main():
    """Main initialization function"""
    logger.info("=" * 50)
    logger.info("Initializing Neo4j Database Schema")
    logger.info("=" * 50)
    
    try:
        # Connect to Neo4j
        logger.info("\n🔌 Connecting to Neo4j...")
        neo4j_driver.connect()
        
        if not neo4j_driver.test_connection():
            logger.error("❌ Failed to connect to Neo4j")
            return
        
        logger.info("✅ Connected to Neo4j\n")
        
        # Create constraints
        logger.info("📋 Creating constraints and indexes...")
        create_constraints()
        
        # Create sample data (DISABLED - using Overpass API for real data instead)
        # logger.info("\n📦 Creating sample power grid data...")
        # create_sample_data()
        logger.info("\n📦 Skipping demo data - using Overpass API for real Overland Park data")
        
        # Verify
        logger.info("\n🔍 Verifying schema...")
        verify_schema()
        
        logger.info("\n" + "=" * 50)
        logger.info("✅ Database initialization complete!")
        logger.info("=" * 50)
        logger.info("\n💡 You can now:")
        logger.info("   1. Test the API: uvicorn main:app --reload")
        logger.info("   2. Visit: http://localhost:8000/api/test-neo4j")
        logger.info("   3. Try path traversal: http://localhost:8000/api/components/building-001/path-to-source")
        
    except Exception as e:
        logger.error(f"\n❌ Error during initialization: {e}")
        raise
    finally:
        neo4j_driver.close()


if __name__ == "__main__":
    main()
