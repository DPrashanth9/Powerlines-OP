# 📝 Step-by-Step Setup Guide

## 🎯 What We're Doing

We're setting up the Overland Park Power Grid Visualizer with:
- Real OpenStreetMap data (not demo data)
- Mapbox dark map centered on Overland Park, Kansas
- Power infrastructure visualization (transmission lines, distribution lines, substations)

---

## ✅ Step 1: Install Backend Dependencies

### Open PowerShell

1. **Open a new PowerShell window**
2. **Navigate to backend folder:**
   ```powershell
   cd C:\Users\dpras\Downloads\Powerlines-new\backend
   ```

3. **Install new dependencies:**
   ```powershell
   pip install httpx geojson
   ```

   **OR install all requirements:**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Wait for installation to complete**
   - You should see: `Successfully installed httpx-x.x.x geojson-x.x.x`

---

## ✅ Step 2: Verify Backend Configuration

### Check .env File (Optional)

The backend `.env` file is **optional** for the map view (only needed if you use Neo4j features later).

**If you want to check it:**
```powershell
cd C:\Users\dpras\Downloads\Powerlines-new\backend
Get-Content .env
```

**Should show:**
```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

**Note:** The map will work even if Neo4j is not running. Neo4j is only for path traversal features.

---

## ✅ Step 3: Start Backend Server

### In the Same PowerShell Window:

1. **Make sure you're in backend folder:**
   ```powershell
   cd C:\Users\dpras\Downloads\Powerlines-new\backend
   ```

2. **Start the server:**
   ```powershell
   uvicorn main:app --reload
   ```

3. **You should see:**
   ```
   INFO:     Uvicorn running on http://127.0.0.1:8000
   INFO:     Application startup complete.
   ```

4. **Keep this window open!** The server needs to keep running.

---

## ✅ Step 4: Test Backend Endpoints

### Open a New Browser Tab

Test these URLs to verify backend is working:

#### Test 1: Health Check
**URL:** http://localhost:8000/health

**Expected Response:**
```json
{
  "status": "ok"
}
```

✅ **If you see this, backend is working!**

#### Test 2: Boundary Endpoint
**URL:** http://localhost:8000/api/op/boundary

**Expected Response:**
```json
{
  "type": "FeatureCollection",
  "features": [...]
}
```

✅ **If you see GeoJSON data, boundary endpoint works!**

**Note:** This might take 10-30 seconds on first call (fetching from Overpass API)

#### Test 3: Power Infrastructure
**URL:** http://localhost:8000/api/op/power?bbox=38.9820,-94.6900,38.9950,-94.6600

**Expected Response:**
```json
{
  "geojson": {
    "type": "FeatureCollection",
    "features": [...]
  },
  "stats": {
    "transmission_miles": 12.5,
    "distribution_miles": 45.2,
    "substation_count": 8
  }
}
```

✅ **If you see this, power endpoint works!**

**Note:** This might take 20-60 seconds (fetching from Overpass API)

---

## ✅ Step 5: Verify Frontend Configuration

### Check Frontend .env File

1. **Open File Explorer**
2. **Navigate to:** `C:\Users\dpras\Downloads\Powerlines-new\frontend`
3. **Check if `.env` file exists**

**If it doesn't exist, create it:**
- Right-click → New → Text Document
- Name it `.env` (not `.env.txt`)
- Open with Notepad
- Paste this:
  ```
  VITE_MAPBOX_TOKEN=pk.eyJ1IjoicHJhc2hhbnRoMDkiLCJhIjoiY21rZDQ1eW1tMDd2NzNlcTcxMGVreWM1MSJ9.kO15kPXsFajQZBODYDb5vw
  VITE_API_URL=http://localhost:8000
  ```
- Save and close

**If it exists, verify it has:**
- Your Mapbox token (starts with `pk.eyJ...`)
- API URL: `http://localhost:8000`

---

## ✅ Step 6: Start Frontend Server

### Open a NEW PowerShell Window

**Important:** Keep the backend window open, open a new window for frontend!

1. **Navigate to frontend folder:**
   ```powershell
   cd C:\Users\dpras\Downloads\Powerlines-new\frontend
   ```

2. **Start frontend server:**
   ```powershell
   npm run dev
   ```

3. **You should see:**
   ```
   VITE v5.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:5173/
   ```

4. **Keep this window open too!**

---

## ✅ Step 7: Open the Application

### In Your Browser:

1. **Open Chrome, Firefox, or Edge**
2. **Go to:** http://localhost:5173
3. **You should see:**
   - ✅ Dark Mapbox map
   - ✅ Map centered on Overland Park, Kansas
   - ✅ Green boundary outline (may take a few seconds to load)
   - ✅ Layer controls in top-right corner

---

## ✅ Step 8: Test the Map Features

### Test Boundary:
1. **Wait a few seconds** for boundary to load
2. **You should see** a green outline around Overland Park

### Test Power Infrastructure:
1. **Zoom in** (mouse wheel or +/- buttons)
2. **Wait 1-2 seconds** after zooming
3. **You should see:**
   - Yellow lines (transmission lines)
   - Purple lines (distribution lines)
   - Green circles (substations)

### Test Click Functionality:
1. **Click on any power line or substation**
2. **Map should:**
   - Smoothly fly/zoom to that feature
   - Show a popup with details (name, operator, voltage, length, etc.)

### Test Layer Toggles:
1. **Look at top-right corner** - you should see checkboxes
2. **Uncheck "Transmission Lines"** - yellow lines should disappear
3. **Check it again** - yellow lines should reappear
4. **Try the same with other layers**

---

## 🐛 Troubleshooting

### Problem: Backend won't start

**Error:** `ModuleNotFoundError: No module named 'httpx'`

**Solution:**
```powershell
cd backend
pip install httpx geojson
```

---

### Problem: Frontend shows "Loading map..." forever

**Check 1:** Mapbox token
- Open browser console (F12)
- Type: `import.meta.env.VITE_MAPBOX_TOKEN`
- Should show your token (starts with `pk.eyJ...`)

**If shows `undefined`:**
- Check `.env` file exists in `frontend` folder
- Restart frontend server (CTRL+C, then `npm run dev` again)

**Check 2:** Backend is running
- Verify http://localhost:8000/health works
- Check backend terminal for errors

---

### Problem: No power lines showing

**Check 1:** Zoom level
- Zoom in closer (power data only loads when zoomed in)
- Maximum view: 60km diagonal

**Check 2:** Backend endpoint
- Test: http://localhost:8000/api/op/power?bbox=38.9820,-94.6900,38.9950,-94.6600
- Should return GeoJSON data

**Check 3:** Browser console
- Press F12 → Console tab
- Look for errors (red text)
- Check Network tab for failed requests

---

### Problem: "Zoom in" error message

**Solution:**
- Zoom in closer on the map
- Reduce the map view area
- Maximum allowed: 60km diagonal distance

---

### Problem: Boundary not showing

**Check 1:** Backend endpoint
- Test: http://localhost:8000/api/op/boundary
- Should return GeoJSON

**Check 2:** Wait time
- Boundary may take 10-30 seconds to load (first time)
- Overpass API can be slow

**Check 3:** Browser console
- Check for errors in F12 console

---

### Problem: Overpass API timeouts

**This is normal!** Overpass API can be slow.

**Solutions:**
- Wait 30-60 seconds for queries to complete
- Backend automatically tries 4 different Overpass servers
- Data is cached after first load (faster next time)
- Try refreshing the page

---

## ✅ Success Checklist

After following all steps, you should have:

- [ ] Backend server running (shows "Uvicorn running")
- [ ] Frontend server running (shows "Local: http://localhost:5173")
- [ ] Browser shows dark map centered on Overland Park
- [ ] Green boundary outline visible
- [ ] Can zoom in and see power lines
- [ ] Can click features to see popups
- [ ] Layer toggles work
- [ ] Smooth flyTo animations work

---

## 🎉 You're Done!

Once everything is working:

1. **Explore the map** - Zoom around Overland Park
2. **Click features** - See power infrastructure details
3. **Toggle layers** - Show/hide different power types
4. **Check stats** - See transmission/distribution miles in browser console

---

## 📚 Next Steps (Optional)

- **Import your own GeoJSON data** - Add custom power infrastructure
- **Customize styling** - Change colors, line widths, etc.
- **Add more features** - Search, filters, etc.
- **Deploy** - Share with others

---

## 🆘 Still Having Issues?

1. **Check both terminals** - Are both servers running?
2. **Check browser console** - F12 → Console tab for errors
3. **Check network tab** - F12 → Network tab for failed requests
4. **Verify endpoints** - Test backend URLs directly in browser
5. **Restart everything** - Stop both servers, restart them

Good luck! 🚀
