# 🎯 Complete Startup Guide

## 🚀 Start Everything in 3 Steps

---

## ✅ Step 1: Start Neo4j (REQUIRED FIRST!)

### Check Neo4j Desktop:

1. **Open Neo4j Desktop** from Start Menu

2. **Look for your database:**
   - Should show something like "PowerGrid" or your database name
   - Check if it says "Active" or "Running"

3. **If NOT running:**
   - Click the **"Start"** button
   - Wait for it to turn **GREEN**
   - Status should say "Active"

4. **✅ Neo4j is ready when it's GREEN/RUNNING**

---

## ✅ Step 2: Start Backend Server

### Method 1: Using Batch File (Easiest)

1. **Navigate to backend folder in File Explorer:**
   ```
   C:\Users\dpras\Downloads\Powerlines-new\backend
   ```

2. **Double-click:** `start_server.bat`

3. **Keep the window open!**

### Method 2: Using PowerShell

1. **Open PowerShell**

2. **Run:**
   ```powershell
   cd C:\Users\dpras\Downloads\Powerlines-new\backend
   uvicorn main:app --reload
   ```

3. **You should see:**
   ```
   ✅ Neo4j connection verified!
   INFO:     Uvicorn running on http://127.0.0.1:8000
   ```

4. **✅ Backend is ready!**

---

## ✅ Step 3: Start Frontend Server

1. **Open a NEW PowerShell window** (keep backend running!)

2. **Run:**
   ```powershell
   cd C:\Users\dpras\Downloads\Powerlines-new\frontend
   npm run dev
   ```

3. **You should see:**
   ```
   ➜  Local:   http://localhost:5173/
   ```

4. **✅ Frontend is ready!**

---

## 🎉 Open Your App!

1. **Open browser**
2. **Go to:** http://localhost:5173
3. **You should see:**
   - Map on the right
   - Components list on the left
   - Everything working!

---

## 🔍 Verify Everything is Running

### Check 1: Neo4j
- ✅ Neo4j Desktop shows database as "Active" or "Running"

### Check 2: Backend
- ✅ Open: http://localhost:8000/api/health
- ✅ Should show: `{"status": "healthy", "neo4j_connected": true}`

### Check 3: Frontend
- ✅ Browser shows map and components
- ✅ Can click components and see paths

---

## 📝 What You Need Running

```
┌─────────────────────┐
│  Neo4j Desktop      │  ← Database (must be green/running)
│  [Your Database]    │
└─────────────────────┘
         ↓
┌─────────────────────┐
│  Backend Server     │  ← Terminal 1
│  Port 8000          │     uvicorn main:app --reload
└─────────────────────┘
         ↓
┌─────────────────────┐
│  Frontend Server    │  ← Terminal 2
│  Port 5173          │     npm run dev
└─────────────────────┘
         ↓
┌─────────────────────┐
│  Your Browser       │  ← http://localhost:5173
│  Power Grid App     │
└─────────────────────┘
```

---

## 🆘 If Something Doesn't Work

### Backend shows "Connection failed"
→ **Neo4j not running** - Go to Step 1, start Neo4j database

### Frontend shows "Failed to fetch"
→ **Backend not running** - Go to Step 2, start backend

### Map doesn't load
→ Check browser console (F12) for errors
→ Make sure `.env` file has Mapbox token
→ Restart frontend server

---

## 🎯 Quick Commands

**Start Backend:**
```powershell
cd C:\Users\dpras\Downloads\Powerlines-new\backend
uvicorn main:app --reload
```

**Start Frontend:**
```powershell
cd C:\Users\dpras\Downloads\Powerlines-new\frontend
npm run dev
```

**Test Backend:**
- Browser: http://localhost:8000/api/health
- Docs: http://localhost:8000/docs

**Test Frontend:**
- Browser: http://localhost:5173

---

Good luck! 🚀
