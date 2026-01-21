# Neo4j Installation & Setup Guide

## What is Neo4j?

Neo4j is a **graph database** - think of it like a network diagram where:
- **Nodes** = Your power grid components (power plants, substations, lines, etc.)
- **Relationships** = Connections between components (like "FEEDS" or "CONNECTS_TO")

Unlike regular databases that store data in tables, Neo4j stores data as a network/graph, which is perfect for tracing paths (like electricity flow from source to destination).

---

## Installation Options (Choose ONE)

### Option 1: Neo4j Desktop (Recommended for Beginners) ⭐

**Best for**: Learning, development, visual interface

#### Steps:

1. **Download Neo4j Desktop**
   - Go to: https://neo4j.com/download/
   - Click "Download Neo4j Desktop" (free)
   - Choose Windows version

2. **Install**
   - Run the installer
   - Follow the installation wizard
   - Create a Neo4j account (free) when prompted

3. **Create a New Database**
   - Open Neo4j Desktop
   - Click "New Project" → Name it "PowerGrid"
   - Click "Add Database" → "Create a Local Database"
   - Set password: `powergrid123` (or your choice - remember it!)
   - Click "Create"

4. **Start the Database**
   - Click the "Start" button on your database
   - Wait for it to turn green (running)
   - Click "Open" to open Neo4j Browser (web interface)

5. **Verify Connection**
   - In Neo4j Browser, you should see a welcome screen
   - Try running: `MATCH (n) RETURN n LIMIT 25`
   - If it works, you're connected! ✅

**Connection Details:**
- URI: `bolt://localhost:7687`
- Username: `neo4j`
- Password: (the one you set, e.g., `powergrid123`)

---

### Option 2: Docker (For Advanced Users)

**Best for**: If you already use Docker

#### Steps:

1. **Install Docker Desktop** (if not installed)
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop

2. **Run Neo4j Container**
   ```powershell
   docker run -d `
     --name neo4j-powergrid `
     -p 7474:7474 -p 7687:7687 `
     -e NEO4J_AUTH=neo4j/powergrid123 `
     -e NEO4J_PLUGINS='["apoc"]' `
     neo4j:latest
   ```

3. **Verify**
   - Open browser: http://localhost:7474
   - Login with: `neo4j` / `powergrid123`
   - You should see Neo4j Browser ✅

**Connection Details:**
- URI: `bolt://localhost:7687`
- Username: `neo4j`
- Password: `powergrid123`

---

### Option 3: Neo4j Aura (Cloud - Free Tier)

**Best for**: No local installation, cloud-based

#### Steps:

1. **Sign Up**
   - Go to: https://neo4j.com/cloud/aura/
   - Create free account
   - Create a free instance

2. **Get Connection String**
   - Copy the connection URI (looks like: `neo4j+s://xxxxx.databases.neo4j.io`)
   - Copy username and password

**Connection Details:**
- URI: (from Aura dashboard)
- Username: (from Aura dashboard)
- Password: (from Aura dashboard)

---

## After Installation: Configure Your Backend

1. **Copy the environment file**
   ```powershell
   cd backend
   copy env.example .env
   ```

2. **Edit `.env` file** with your Neo4j credentials:
   ```
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=powergrid123
   ```

3. **Test the connection** (we'll do this next!)

---

## Troubleshooting

### "Connection refused" error
- Make sure Neo4j is **running** (green status in Desktop)
- Check if port 7687 is available
- Try restarting Neo4j

### "Authentication failed" error
- Double-check your password in `.env`
- If using Neo4j Desktop, reset password: Database → Settings → Reset Password

### Port already in use
- Another Neo4j instance might be running
- Stop other instances or change the port

---

## Next Steps

Once Neo4j is installed and running:
1. ✅ Test connection with our backend
2. ✅ Create the database schema (nodes and relationships)
3. ✅ Import your power grid data
