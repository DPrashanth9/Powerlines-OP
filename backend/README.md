# Power Grid Visualizer - Backend

FastAPI backend with Neo4j graph database for power grid visualization.

## Structure

- `app/api/` - API route handlers
- `app/models/` - Pydantic data models
- `app/services/` - Business logic and graph operations
- `app/database/` - Neo4j connection management

## Prerequisites

1. **Python 3.10+** installed
2. **Neo4j** installed and running (see `NEO4J_SETUP_GUIDE.md` in project root)

## Quick Setup (Windows)

Run the setup script:
```powershell
.\setup.ps1
```

This will:
- Create virtual environment
- Install dependencies
- Create `.env` file

## Manual Setup

1. **Create a virtual environment:**
```powershell
python -m venv venv
venv\Scripts\activate
```

2. **Install dependencies:**
```powershell
pip install -r requirements.txt
```

3. **Configure environment:**
```powershell
copy env.example .env
# Edit .env with your Neo4j credentials
```

4. **Test Neo4j connection:**
```powershell
python test_connection.py
```

5. **Run the server:**
```powershell
uvicorn main:app --reload
```

## API Endpoints

- **Health Check**: http://localhost:8000/api/health
- **Test Neo4j**: http://localhost:8000/api/test-neo4j
- **API Docs**: http://localhost:8000/docs (Interactive Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc

## Environment Variables

Create a `.env` file with:
```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password_here
```

## Troubleshooting

### Neo4j Connection Issues

1. **Make sure Neo4j is running**
   - Check Neo4j Desktop (should be green/running)
   - Or check Docker container if using Docker

2. **Verify credentials in `.env`**
   - Username is usually `neo4j`
   - Password is what you set during Neo4j installation

3. **Test connection:**
   ```powershell
   python test_connection.py
   ```

4. **Check logs:**
   - When you start the server, it will show connection status
   - Look for ✅ or ❌ in the console output
