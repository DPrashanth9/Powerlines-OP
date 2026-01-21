"""
Simple script to test Neo4j connection
Run this after installing Neo4j to verify everything works
"""

import os
import sys
from dotenv import load_dotenv
from neo4j import GraphDatabase

# Fix Windows console encoding for emojis
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load environment variables
load_dotenv()

def test_neo4j_connection():
    """Test connection to Neo4j database"""
    print("Testing Neo4j connection...")
    print("-" * 50)
    
    # Get connection details from environment
    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    user = os.getenv("NEO4J_USER", "neo4j")
    password = os.getenv("NEO4J_PASSWORD", "password")
    
    print(f"URI: {uri}")
    print(f"User: {user}")
    print(f"Password: {'*' * len(password)}")
    print("-" * 50)
    
    try:
        # Create driver
        driver = GraphDatabase.driver(uri, auth=(user, password))
        
        # Test connection
        print("Connecting...")
        driver.verify_connectivity()
        print("[OK] Connection successful!")
        
        # Get database info
        with driver.session() as session:
            # Get version
            result = session.run("CALL dbms.components() YIELD name, versions RETURN name, versions[0] as version LIMIT 1")
            version_record = result.single()
            if version_record:
                print(f"Neo4j Version: {version_record['version']}")
            
            # Count nodes
            result = session.run("MATCH (n) RETURN count(n) as count")
            count = result.single()["count"]
            print(f"Current nodes in database: {count}")
        
        driver.close()
        print("\n[SUCCESS] All tests passed! Your Neo4j setup is working correctly.")
        return True
        
    except Exception as e:
        print(f"\n[ERROR] Connection failed!")
        print(f"Error: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Make sure Neo4j is running (check Neo4j Desktop)")
        print("2. Check your .env file has correct credentials")
        print("3. Verify the URI is correct (bolt://localhost:7687)")
        print("4. Try resetting your Neo4j password")
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("Neo4j Connection Test")
    print("=" * 50)
    print()
    
    # Check if .env exists
    if not os.path.exists(".env"):
        print("[WARNING] .env file not found!")
        print("Creating .env from env.example...")
        if os.path.exists("env.example"):
            import shutil
            shutil.copy("env.example", ".env")
            print("[OK] Created .env file. Please edit it with your Neo4j credentials.")
            print()
        else:
            print("[ERROR] env.example not found. Please create .env manually.")
            exit(1)
    
    success = test_neo4j_connection()
    exit(0 if success else 1)
