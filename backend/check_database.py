"""
Script to check what's in the Neo4j database
Shows all nodes and their relationships
"""

from app.database.neo4j import neo4j_driver
import json

def check_database():
    """Check database contents"""
    print("=" * 60)
    print("Neo4j Database Contents Check")
    print("=" * 60)
    
    try:
        neo4j_driver.connect()
        
        with neo4j_driver.get_session() as session:
            # Count total nodes
            result = session.run("MATCH (n) RETURN count(n) as total")
            total_nodes = result.single()["total"]
            print(f"\nTotal nodes in database: {total_nodes}")
            
            # Count by type
            print("\n" + "-" * 60)
            print("Nodes by Type:")
            print("-" * 60)
            result = session.run("""
                MATCH (n)
                RETURN labels(n)[0] as type, count(n) as count
                ORDER BY count DESC
            """)
            
            for record in result:
                print(f"  {record['type'] or 'No label'}: {record['count']} nodes")
            
            # Count relationships
            print("\n" + "-" * 60)
            print("Relationships:")
            print("-" * 60)
            result = session.run("""
                MATCH ()-[r]->()
                RETURN type(r) as rel_type, count(r) as count
                ORDER BY count DESC
            """)
            
            for record in result:
                print(f"  {record['rel_type']}: {record['count']} relationships")
            
            # Show sample components
            print("\n" + "-" * 60)
            print("Sample Components (first 10):")
            print("-" * 60)
            result = session.run("""
                MATCH (n:Component)
                RETURN n.id as id, n.name as name, n.type as type
                LIMIT 10
            """)
            
            for record in result:
                print(f"  ID: {record['id']}")
                print(f"    Name: {record['name']}")
                print(f"    Type: {record['type']}")
                print()
            
            # Check for duplicates
            print("-" * 60)
            print("Checking for duplicate IDs...")
            print("-" * 60)
            result = session.run("""
                MATCH (n:Component)
                WITH n.id as id, count(n) as count
                WHERE count > 1
                RETURN id, count
            """)
            
            duplicates = list(result)
            if duplicates:
                print(f"⚠️  Found {len(duplicates)} duplicate IDs:")
                for record in duplicates:
                    print(f"  ID: {record['id']} appears {record['count']} times")
            else:
                print("✅ No duplicate IDs found")
            
            # Check path from power generation to buildings
            print("\n" + "-" * 60)
            print("Path Examples:")
            print("-" * 60)
            result = session.run("""
                MATCH path = (source:PowerGeneration)-[:FEEDS*]->(target:Building)
                RETURN source.id as source_id, target.id as target_id, length(path) as path_length
                LIMIT 5
            """)
            
            paths = list(result)
            if paths:
                print(f"Found {len(paths)} paths from PowerGeneration to Building:")
                for record in paths:
                    print(f"  {record['source_id']} → {record['target_id']} ({record['path_length']} relationships)")
            else:
                print("No paths found from PowerGeneration to Building")
                print("(This might be okay if you haven't created relationships yet)")
        
        print("\n" + "=" * 60)
        print("Check complete!")
        print("=" * 60)
        
    except Exception as e:
        print(f"[ERROR] {e}")
    finally:
        neo4j_driver.close()

if __name__ == "__main__":
    check_database()
