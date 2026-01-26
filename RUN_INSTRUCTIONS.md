# 🚀 Run Instructions - Overland Park Power Grid Visualizer

## Quick Start

### Step 1: Install Backend Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

**New dependencies added:**
- `httpx` - For async HTTP requests to Overpass API
- `geojson` - For GeoJSON data handling

### Step 2: Configure Backend

The backend `.env` file is optional for this feature (Neo4j not required for map view):

```env
# Optional - only needed if using Neo4j features
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

### Step 3: Start Backend Server

```powershell
cd backend
uvicorn main:app --reload
```

**Backend will run at:** http://localhost:8000

**Test endpoints:**
- http://localhost:8000/health → `{"status":"ok"}`
- http://localhost:8000/api/op/boundary → GeoJSON boundary
- http://localhost:8000/api/op/power?bbox=38.9820,-94.6900,38.9950,-94.6600 → Power infrastructure

### Step 4: Configure Frontend

Make sure `frontend/.env` has your Mapbox token:

```env
VITE_MAPBOX_TOKEN=pk.eyJ1IjoicHJhc2hhbnRoMDkiLCJhIjoiY21rZDQ1eW1tMDd2NzNlcTcxMGVreWM1MSJ9.kO15kPXsFajQZBODYDb5vw
VITE_API_URL=http://localhost:8000
```

### Step 5: Install Frontend Dependencies (if not done)

```powershell
cd frontend
npm install
```

### Step 6: Start Frontend Server

```powershell
cd frontend
npm run dev
```

**Frontend will run at:** http://localhost:5173

### Step 7: Open Browser

Navigate to: **http://localhost:5173**

---

## ✅ What You Should See

1. **Dark Mapbox map** centered on Overland Park, Kansas
2. **Green boundary outline** around Overland Park
3. **Yellow transmission lines** (power=line)
4. **Purple distribution lines** (power=minor_line)
5. **Green circles** for substations (power=substation)
6. **Layer toggles** in top-right corner
7. **Click any feature** to:
   - Fly/zoom to that feature
   - Show popup with details (name, operator, voltage, length, etc.)

---

## 🎯 Features

### Map Controls
- **Zoom in/out** - Mouse wheel or +/- buttons
- **Pan** - Click and drag
- **Layer toggles** - Checkboxes in top-right to show/hide layer types

### Click Behavior
- **Click transmission/distribution line**:
  - Map flies to clicked location (zoom 15)
  - Popup shows: Name, Type, Voltage, Operator, Length (miles), OSM ID

- **Click substation**:
  - Map flies to clicked location (zoom 15)
  - Popup shows: Name, Operator, Voltage, Type, OSM ID

### Auto-loading
- Power infrastructure **automatically loads** when you pan/zoom
- Data is **cached** for 30 minutes per view area
- **Debounced** (1 second delay) to avoid excessive API calls

---

## 🐛 Troubleshooting

### Map shows "Loading map..." forever
- **Check:** Mapbox token in `frontend/.env`
- **Check:** Browser console (F12) for errors
- **Fix:** Restart frontend server after changing `.env`

### No power lines showing
- **Check:** Backend is running (http://localhost:8000/health)
- **Check:** Zoom level (must be zoomed in, max 60km view)
- **Check:** Browser console for API errors
- **Check:** Network tab for failed requests

### "Zoom in" error message
- **Solution:** Zoom in closer (reduce map view area)
- Maximum view: 60km diagonal distance

### Boundary not showing
- **Check:** Backend `/api/op/boundary` endpoint works
- **Check:** Browser console for errors
- Boundary may take a few seconds to load

### Overpass API timeouts
- **Automatic:** Backend tries multiple Overpass servers
- **Wait:** Some queries can take 30-60 seconds
- **Retry:** Refresh the page or pan the map

---

## 📊 API Endpoints

### GET /health
Returns: `{"status": "ok"}`

### GET /api/op/boundary
Returns: GeoJSON FeatureCollection with Overland Park boundary polygon

### GET /api/op/power?bbox=south,west,north,east
Returns:
```json
{
  "geojson": FeatureCollection,
  "stats": {
    "transmission_miles": 12.5,
    "distribution_miles": 45.2,
    "substation_count": 8
  }
}
```

**Bbox format:** `38.9820,-94.6900,38.9950,-94.6600` (south,west,north,east)

---

## 🔧 Development

### Backend Logs
Watch for:
- `✅ Map loaded successfully!` - Map initialization
- `Returning cached power data` - Cache hits
- `Overpass server X failed, trying next...` - Fallback working

### Frontend Console
Watch for:
- `✅ Mapbox token loaded` - Token working
- `✅ Map loaded successfully!` - Map initialized
- `Power infrastructure loaded: {...}` - Data loaded
- Any red errors - Issues to fix

---

## 📝 Notes

- **Neo4j is optional** - Map view works without it
- **San Francisco demo data is disabled** - Won't interfere with map
- **Real-time OSM data** - Fetched from OpenStreetMap via Overpass API
- **Caching enabled** - Reduces API calls and improves performance
- **Multiple Overpass servers** - Automatic fallback if one fails

---

## 🎉 Success!

Once everything is running:
1. ✅ Dark map visible
2. ✅ Overland Park boundary outline visible
3. ✅ Power lines and substations visible (after zooming in)
4. ✅ Click features to see details
5. ✅ Smooth flyTo animations work

Enjoy exploring Overland Park's power infrastructure! ⚡
