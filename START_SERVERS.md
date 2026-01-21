# 🚀 How to Start Both Servers

## ⚠️ Important: Start in This Order!

1. **Neo4j Database** (must be first)
2. **Backend Server** (depends on Neo4j)
3. **Frontend Server** (depends on backend)

---

## Step 1: Start Neo4j Database

### Option A: Neo4j Desktop (Recommended)

1. **Open Neo4j Desktop**
   - Look for it in your Start Menu
   - Or search for "Neo4j Desktop"

2. **Find Your Database**
   - You should see your database listed
   - It should be named something like "PowerGrid" or similar

3. **Start the Database**
   - Click the **"Start"** button on your database
   - Wait for it to turn **GREEN** (running)
   - Status should say "Active" or "Running"

4. **Verify It's Running**
   - The button should change from "Start" to "Stop"
   - Database should be green/highlighted

### Option B: Check if Already Running

- If Neo4j Desktop shows your database as "Active" or "Running" → Skip to Step 2

---

## Step 2: Start Backend Server

### Open a New PowerShell Window

1. **Open PowerShell** (keep Neo4j Desktop open!)

2. **Navigate to backend folder:**
   ```powershell
   cd C:\Users\dpras\Downloads\Powerlines-new\backend
   ```

3. **Activate virtual environment** (if you have one):
   ```powershell
   .\venv\Scripts\Activate
   ```
   
   If you don't have a venv, that's okay - skip this step.

4. **Start the server:**
   ```powershell
   uvicorn main:app --reload
   ```

5. **You should see:**
   ```
   INFO:     Uvicorn running on http://127.0.0.1:8000
   🚀 Starting Power Grid Visualizer API...
   ✅ Successfully connected to Neo4j at bolt://localhost:7687
   ✅ Neo4j connection verified!
   INFO:     Application startup complete.
   ```

6. **Keep this window open!** The server needs to keep running.

---

## Step 3: Verify Backend is Working

### Test in Browser:

Open: **http://localhost:8000/api/health**

**Should show:**
```json
{
  "status": "healthy",
  "neo4j_connected": true,
  "neo4j_uri": "bolt://localhost:7687"
}
```

### Or Test API Docs:

Open: **http://localhost:8000/docs**

Should show the interactive API documentation.

---

## Step 4: Start Frontend Server

### Open Another New PowerShell Window

1. **Keep backend window open!**

2. **Open a NEW PowerShell window**

3. **Navigate to frontend folder:**
   ```powershell
   cd C:\Users\dpras\Downloads\Powerlines-new\frontend
   ```

4. **Start frontend:**
   ```powershell
   npm run dev
   ```

5. **You should see:**
   ```
   VITE v5.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:5173/
   ```

6. **Keep this window open too!**

---

## Step 5: Open Your App!

1. **Open browser**
2. **Go to:** http://localhost:5173
3. **You should see:**
   - ✅ Map on the right
   - ✅ Sidebar on the left with components
   - ✅ Component markers on the map

---

## 🎯 Quick Checklist

- [ ] Neo4j Desktop open and database is **STARTED** (green/running)
- [ ] Backend server running (shows "Uvicorn running on http://127.0.0.1:8000")
- [ ] Backend shows "✅ Neo4j connection verified!"
- [ ] Frontend server running (shows "Local: http://localhost:5173")
- [ ] Browser shows map and components

---

## 🐛 Troubleshooting

### "Neo4j connection failed"

**Problem:** Neo4j database not running

**Solution:**
1. Open Neo4j Desktop
2. Click "Start" on your database
3. Wait for it to turn green
4. Restart backend server

---

### "Failed to establish connection"

**Problem:** Neo4j not running or wrong credentials

**Solution:**
1. Check Neo4j Desktop - database should be green
2. Verify `.env` file in `backend` folder has correct password
3. Test connection: `python test_connection.py`

---

### Backend starts but shows "⚠️ Neo4j connection test failed"

**Problem:** Connection issue

**Solution:**
1. Check Neo4j Desktop - database must be running
2. Try restarting Neo4j database (Stop → Start)
3. Check `.env` file credentials

---

### "Port 8000 already in use"

**Problem:** Another backend server already running

**Solution:**
1. Find the other terminal running backend
2. Stop it (CTRL + C)
3. Or use a different port: `uvicorn main:app --reload --port 8001`

---

## 📝 Quick Commands Reference

### Start Backend:
```powershell
cd C:\Users\dpras\Downloads\Powerlines-new\backend
uvicorn main:app --reload
```

### Start Frontend:
```powershell
cd C:\Users\dpras\Downloads\Powerlines-new\frontend
npm run dev
```

### Test Backend:
```powershell
cd C:\Users\dpras\Downloads\Powerlines-new\backend
python test_connection.py
```

---

## 🎉 You're All Set!

Once all three are running:
- ✅ Neo4j Database (in Neo4j Desktop)
- ✅ Backend Server (PowerShell window 1)
- ✅ Frontend Server (PowerShell window 2)

Your app should be working! Open http://localhost:5173 in your browser.
