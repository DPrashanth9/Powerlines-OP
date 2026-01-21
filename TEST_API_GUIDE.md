# 🧪 How to Test Your API - Step by Step Guide

## Step 1: Start the API Server

### Open a Terminal/PowerShell

1. **Open PowerShell** (or Command Prompt)
   - Press `Windows Key + X` and select "Windows PowerShell"
   - Or search for "PowerShell" in the Start menu

2. **Navigate to your backend folder**
   ```powershell
   cd C:\Users\dpras\Downloads\Powerlines-new\backend
   ```

3. **Start the server**
   ```powershell
   uvicorn main:app --reload
   ```

### What You Should See:

```
INFO:     Will watch for changes
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
🚀 Starting Power Grid Visualizer API...
✅ Successfully connected to Neo4j at bolt://localhost:7687
✅ Neo4j connection verified!
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**✅ Success!** Your server is now running!

**⚠️ Important:** Keep this terminal window open! The server needs to keep running.

---

## Step 2: Open the API Documentation

### In Your Web Browser:

1. **Open any web browser** (Chrome, Firefox, Edge, etc.)

2. **Go to this URL:**
   ```
   http://localhost:8000/docs
   ```

3. **You should see:**
   - A page titled "Power Grid Visualizer API"
   - A list of available endpoints
   - Interactive API documentation (Swagger UI)

---

## Step 3: Test Endpoints Interactively

### You'll see these endpoints:

1. **`GET /`** - Root endpoint
2. **`GET /api/health`** - Health check
3. **`GET /api/test-neo4j`** - Test Neo4j connection
4. **`GET /api/components`** - Get all components
5. **`GET /api/components/{component_id}`** - Get single component
6. **`GET /api/components/{component_id}/path-to-source`** - Get path to source

### How to Test Each Endpoint:

#### Test 1: Root Endpoint

1. Find **`GET /`** in the list
2. Click on it to expand
3. Click the **"Try it out"** button
4. Click the **"Execute"** button
5. **Scroll down** to see the response

**Expected Response:**
```json
{
  "message": "Power Grid Visualizer API is running",
  "status": "healthy"
}
```

#### Test 2: Health Check

1. Find **`GET /api/health`**
2. Click **"Try it out"**
3. Click **"Execute"**
4. Check the response

**Expected Response:**
```json
{
  "status": "healthy",
  "neo4j_connected": true,
  "neo4j_uri": "bolt://localhost:7687"
}
```

**✅ If `neo4j_connected` is `true`, everything is working!**

#### Test 3: Neo4j Connection Test

1. Find **`GET /api/test-neo4j`**
2. Click **"Try it out"**
3. Click **"Execute"**
4. View the detailed response

**Expected Response:**
```json
{
  "connected": true,
  "version": [
    {
      "name": "Neo4j Kernel",
      "version": "2025.11.2"
    }
  ],
  "node_count": 9,
  "message": "Neo4j connection successful!"
}
```

**This shows:**
- ✅ Neo4j is connected
- 📦 Database version
- 📊 Number of nodes in database (should be 9 from our sample data)

#### Test 4: Get All Components

1. Find **`GET /api/components`**
2. Click **"Try it out"**
3. Click **"Execute"**

**Note:** This endpoint might return a placeholder message since we haven't fully implemented it yet, but it should still work!

---

## Step 4: Alternative - Test in Browser Directly

You can also test endpoints directly in your browser address bar:

### Test Health Check:
```
http://localhost:8000/api/health
```

### Test Neo4j Connection:
```
http://localhost:8000/api/test-neo4j
```

### Test Root:
```
http://localhost:8000/
```

Just paste these URLs in your browser and press Enter!

---

## Step 5: Using the Test Script (Alternative Method)

If you prefer a script-based approach:

1. **Open a NEW terminal** (keep the server running in the first one!)

2. **Navigate to backend folder:**
   ```powershell
   cd C:\Users\dpras\Downloads\Powerlines-new\backend
   ```

3. **Install requests library** (if not already installed):
   ```powershell
   pip install requests
   ```

4. **Run the test script:**
   ```powershell
   python test_api.py
   ```

5. **Follow the prompts** - it will test all endpoints automatically

---

## 🎯 What Each Endpoint Does

| Endpoint | Purpose | What It Returns |
|----------|---------|-----------------|
| `GET /` | Basic health check | Server status message |
| `GET /api/health` | Detailed health check | API status + Neo4j connection status |
| `GET /api/test-neo4j` | Test Neo4j connection | Database version, node count, connection status |
| `GET /api/components` | Get all components | List of all power grid components |
| `GET /api/components/{id}` | Get one component | Details of a specific component |
| `GET /api/components/{id}/path-to-source` | Path traversal | Path from component back to power source |

---

## 🐛 Troubleshooting

### Problem: "Connection refused" or can't connect

**Solution:**
- Make sure the server is running (check the terminal)
- Make sure you're using `http://localhost:8000` (not `https://`)
- Check if port 8000 is already in use

### Problem: Server won't start

**Solution:**
- Make sure you're in the `backend` folder
- Check if Neo4j is running (should be green in Neo4j Desktop)
- Verify your `.env` file has correct credentials

### Problem: "Neo4j connection failed" in health check

**Solution:**
- Run `python test_connection.py` to verify Neo4j connection
- Check Neo4j Desktop - database should be running
- Verify password in `.env` matches Neo4j password

### Problem: Can't see the docs page

**Solution:**
- Make sure server is running (check terminal for "Uvicorn running")
- Try: http://127.0.0.1:8000/docs (instead of localhost)
- Check browser console for errors (F12)

---

## 📸 What the Docs Page Looks Like

The Swagger UI (docs page) has:
- **Top section:** API title and description
- **Endpoints list:** All available API endpoints grouped by tags
- **Expandable sections:** Click on any endpoint to see details
- **Try it out button:** Makes endpoints interactive
- **Execute button:** Actually calls the API
- **Response section:** Shows the JSON response

---

## ✅ Success Checklist

- [ ] Server starts without errors
- [ ] Can access http://localhost:8000/docs
- [ ] Health check shows `neo4j_connected: true`
- [ ] Neo4j test shows node count (should be 9)
- [ ] All endpoints respond (even if with placeholder data)

---

## 🎉 Next Steps After Testing

Once you've verified everything works:

1. **Implement the path traversal endpoint** - Make it actually query Neo4j
2. **Add component retrieval** - Return real data from database
3. **Import your GeoJSON data** - Add your real power grid data
4. **Connect the frontend** - Build the React app to use these APIs

---

## 💡 Pro Tips

1. **Keep the server terminal open** - It needs to keep running
2. **Use `--reload` flag** - Automatically restarts when you change code
3. **Check the terminal** - Error messages appear there
4. **Use the docs page** - It's the easiest way to test APIs
5. **Try different endpoints** - Experiment to learn how they work

---

## 🎓 What You're Learning

- **REST APIs** - How web services communicate
- **Interactive Documentation** - Swagger UI makes testing easy
- **HTTP Methods** - GET requests retrieve data
- **JSON Responses** - How data is formatted
- **API Testing** - How to verify endpoints work

Happy testing! 🚀
