# 🚀 Quick Start Guide - Get Your App Running!

## ⚠️ Important: Restart Your Terminal First!

After installing Node.js, you need to **restart your terminal/PowerShell** for it to recognize Node.js.

1. **Close** this terminal/PowerShell window
2. **Open a NEW** PowerShell window
3. **Try again** with the steps below

---

## 📋 Step-by-Step Setup

### Step 1: Verify Node.js is Working

Open a **NEW** PowerShell window and run:

```powershell
node --version
npm --version
```

**Expected output:**
```
v20.x.x  (or similar)
10.x.x   (or similar)
```

If you still see "not recognized", restart your computer and try again.

---

### Step 2: Navigate to Frontend Folder

```powershell
cd C:\Users\dpras\Downloads\Powerlines-new\frontend
```

---

### Step 3: Install Dependencies

```powershell
npm install
```

**This will take 1-2 minutes.** You'll see it installing packages like:
- react
- typescript
- mapbox-gl
- vite
- etc.

**Wait until you see:**
```
added X packages
```

---

### Step 4: Get Mapbox Token (Free)

1. **Go to:** https://account.mapbox.com/
2. **Sign up** for a free account (if you don't have one)
3. **Go to:** https://account.mapbox.com/access-tokens/
4. **Copy your default token** (or create a new one)

---

### Step 5: Create .env File

In the `frontend` folder, create a file named `.env`:

**Option A: Using PowerShell**
```powershell
cd C:\Users\dpras\Downloads\Powerlines-new\frontend
New-Item -Path .env -ItemType File
notepad .env
```

**Option B: Manually**
1. Open `frontend` folder in File Explorer
2. Right-click → New → Text Document
3. Name it `.env` (make sure it's `.env` not `.env.txt`)
4. Double-click to open

**Paste this content:**
```
VITE_MAPBOX_TOKEN=paste_your_mapbox_token_here
VITE_API_URL=http://localhost:8000
```

**Replace `paste_your_mapbox_token_here`** with your actual Mapbox token from Step 4.

**Save and close** the file.

---

### Step 6: Make Sure Backend is Running

Open a **NEW** PowerShell window and run:

```powershell
cd C:\Users\dpras\Downloads\Powerlines-new\backend
uvicorn main:app --reload
```

**Keep this window open!** The backend needs to keep running.

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
✅ Neo4j connection verified!
```

---

### Step 7: Start Frontend Server

In your **first PowerShell window** (the one where you ran `npm install`):

```powershell
cd C:\Users\dpras\Downloads\Powerlines-new\frontend
npm run dev
```

**You should see:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

### Step 8: Open Your App!

1. **Open your web browser** (Chrome, Firefox, Edge)
2. **Go to:** http://localhost:5173
3. **You should see:**
   - ✅ Map on the right side
   - ✅ Sidebar on the left with components
   - ✅ Component markers on the map

---

## 🎯 Test Your App

### Click a Component:
1. Click any component in the sidebar (or on the map)
2. You should see:
   - ✅ Component details appear
   - ✅ "Path to Source" section appears
   - ✅ Path line appears on the map

### Try Different Components:
- Click "building-001" - See path from solar farm to building
- Click "transformer-001" - See path from solar farm to transformer
- Click "plant-001" - See just the power generation (it's the source!)

---

## 🐛 Troubleshooting

### "node is not recognized"
**Solution:** 
- Restart your terminal/PowerShell
- If still not working, restart your computer
- Check Node.js installed correctly: Look for it in Start Menu

### "npm install" fails
**Solution:**
- Make sure you're in the `frontend` folder
- Check your internet connection
- Try: `npm install --legacy-peer-deps`

### "Cannot connect to API"
**Solution:**
- Make sure backend is running (Step 6)
- Check http://localhost:8000/api/health in browser
- Should show: `{"status": "healthy", "neo4j_connected": true}`

### Map not showing / "Mapbox token invalid"
**Solution:**
- Check `.env` file exists in `frontend` folder
- Verify token is correct (no extra spaces)
- Restart frontend server after changing `.env`

### "Port 5173 already in use"
**Solution:**
- Another app is using that port
- Change port: `npm run dev -- --port 3000`
- Or stop the other app

---

## ✅ Success Checklist

- [ ] Node.js and npm working (`node --version` shows a version)
- [ ] Frontend dependencies installed (`npm install` completed)
- [ ] `.env` file created with Mapbox token
- [ ] Backend server running (shows "Uvicorn running")
- [ ] Frontend server running (shows "Local: http://localhost:5173")
- [ ] Browser shows map and components
- [ ] Can click components and see paths

---

## 🎉 You're Done!

Once everything is running, you have:
- ✅ Full-stack application working
- ✅ Map visualization with Mapbox
- ✅ Component interaction
- ✅ Path traversal visualization
- ✅ Complete power grid visualization system!

---

## 📚 Next Steps

1. **Import your real data** - Replace sample data with your GeoJSON
2. **Customize styling** - Make it look exactly how you want
3. **Add features** - Search, filtering, etc.
4. **Deploy** - Share it with others!

Happy coding! 🚀
