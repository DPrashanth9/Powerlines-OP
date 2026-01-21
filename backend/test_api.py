"""
Simple script to test the API endpoints
Make sure the server is running first: uvicorn main:app --reload
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(name, url):
    """Test an API endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"URL: {url}")
    print(f"{'='*60}")
    
    try:
        response = requests.get(url, timeout=5)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Success!")
            data = response.json()
            print("\nResponse:")
            print(json.dumps(data, indent=2))
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed!")
        print("   Make sure the server is running:")
        print("   uvicorn main:app --reload")
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    print("="*60)
    print("Power Grid Visualizer API Test")
    print("="*60)
    print("\nMake sure the server is running:")
    print("  uvicorn main:app --reload")
    print("\nPress Enter to start testing...")
    input()
    
    # Test endpoints
    test_endpoint("Root", f"{BASE_URL}/")
    test_endpoint("Health Check", f"{BASE_URL}/api/health")
    test_endpoint("Neo4j Test", f"{BASE_URL}/api/test-neo4j")
    
    print("\n" + "="*60)
    print("Testing Complete!")
    print("="*60)
    print("\n💡 Try these in your browser:")
    print(f"   - API Docs: {BASE_URL}/docs")
    print(f"   - Health: {BASE_URL}/api/health")
    print(f"   - Neo4j Test: {BASE_URL}/api/test-neo4j")

if __name__ == "__main__":
    main()
