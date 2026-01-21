# ⚡ Quick Start - Test Your API in 3 Steps

## 🚀 Method 1: Using the Batch Script (Easiest!)

1. **Double-click** `backend/start_server.bat`
   - The server will start automatically
   - A window will open showing server status

2. **Open your browser** and go to:
   ```
   http://localhost:8000/docs
   ```

3. **Test an endpoint:**
   - Click on `GET /api/health`
   - Click "Try it out"
   - Click "Execute"
   - See the response below!

**Done!** ✅

---

## 🖥️ Method 2: Manual Start (More Control)

### Step 1: Open PowerShell

Press `Windows Key + X` → Select "Windows PowerShell"

### Step 2: Navigate to Backend Folder

Type this and press Enter:
```powershell
cd C:\Users\dpras\Downloads\Powerlines-new\backend
```

### Step 3: Start the Server

Type this and press Enter:
```powershell
uvicorn main:app --reload
```

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
✅ Neo4j connection verified!
```

**✅ Server is running!** Keep this window open.

### Step 4: Open Browser

1. Open Chrome, Firefox, or Edge
2. Type in address bar: `http://localhost:8000/docs`
3. Press Enter

### Step 5: Test an Endpoint

1. You'll see a page with API documentation
2. Find `GET /api/health` in the list
3. Click on it (it will expand)
4. Click the blue **"Try it out"** button
5. Click the green **"Execute"** button
6. Scroll down to see the response!

**Expected Response:**
```json
{
  "status": "healthy",
  "neo4j_connected": true,
  "neo4j_uri": "bolt://localhost:7687"
}
```

If you see `"neo4j_connected": true`, everything is working! 🎉

---

## 🧪 What to Test

### 1. Health Check
- Endpoint: `GET /api/health`
- Should show: `neo4j_connected: true`

### 2. Neo4j Test
- Endpoint: `GET /api/test-neo4j`
- Should show: Database version and node count (9 nodes)

### 3. Root Endpoint
- Endpoint: `GET /`
- Should show: Welcome message

---

## 📸 Visual Guide

### The Docs Page Looks Like This:

```
┌─────────────────────────────────────────┐
│  Power Grid Visualizer API             │
│  API for power grid visualization...  │
├─────────────────────────────────────────┤
│                                         │
│  GET  /                                 │
│  GET  /api/health                       │
│  GET  /api/test-neo4j                   │
│  GET  /api/components                   │
│  GET  /api/components/{component_id}   │
│                                         │
└─────────────────────────────────────────┘
```

**Click any endpoint → Click "Try it out" → Click "Execute"**

---

## 🐛 Common Issues

### "Can't connect to server"
- Make sure the server is running (check the PowerShell window)
- Look for "Uvicorn running on http://127.0.0.1:8000"

### "Neo4j connection failed"
- Check Neo4j Desktop - database should be green (running)
- Run: `python test_connection.py` to verify

### "Port already in use"
- Another server might be running
- Close other terminals or change the port

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Server shows "Uvicorn running"
- ✅ Browser shows the docs page
- ✅ Health check returns `neo4j_connected: true`
- ✅ No error messages in the terminal

---

## 🎯 Next: Try These URLs Directly

You can also paste these directly in your browser:

- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/api/health
- **Neo4j Test:** http://localhost:8000/api/test-neo4j
- **Root:** http://localhost:8000/

Just copy and paste into your browser's address bar!

---

## 💡 Pro Tip

**Keep the server running** while you develop. The `--reload` flag means it automatically restarts when you change code!

To stop the server: Press `CTRL + C` in the terminal window.

---

Need more help? See `TEST_API_GUIDE.md` for detailed instructions!
