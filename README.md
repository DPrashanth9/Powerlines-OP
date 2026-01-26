# ⚡ Power Grid Visualizer - Overland Park, Kansas

A full-stack web application for visualizing power infrastructure in Overland Park, Kansas using real OpenStreetMap data. Built with React, Mapbox, FastAPI, and Overpass API.

![Power Grid Visualizer](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.2-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.128-green)
![Mapbox](https://img.shields.io/badge/Mapbox-GL-blue)

## 🎯 Features

- **🗺️ Interactive Map Visualization** - Dark Mapbox map centered on Overland Park, Kansas
- **⚡ Real-Time Power Infrastructure** - Fetches live data from OpenStreetMap via Overpass API
- **🔌 Transmission Lines** - High-voltage transmission lines with yellow markers
- **📡 Distribution Lines** - Neighborhood distribution lines with purple markers
- **🏭 Substations** - Power substations with green markers
- **🎛️ Layer Controls** - Toggle visibility of transmission, distribution, and substations
- **📍 Point Markers** - Visual markers at line endpoints for easy identification
- **📊 Statistics Dashboard** - Real-time stats showing miles of lines and substation count
- **🖱️ Interactive Popups** - Click any feature to see details (voltage, operator, length, etc.)
- **✈️ Smooth Animations** - Fly-to feature with smooth zoom animations
- **🌐 Boundary Visualization** - Green outline showing Overland Park city boundaries
- **⚡ Performance Optimized** - Caching, debouncing, and efficient data loading

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │─────▶│   FastAPI   │─────▶│  Overpass   │
│  Frontend   │      │   Backend   │      │     API     │
│  (Mapbox)   │◀─────│   (Python)  │◀─────│ (OpenStreet)│
└─────────────┘      └─────────────┘      └─────────────┘
```

## 🚀 Tech Stack

### Frontend
- **React 18** - UI framework with TypeScript
- **Mapbox GL JS** - Interactive map visualization
- **Vite** - Fast build tool and dev server
- **Atomic Design** - Component architecture (Atoms, Molecules, Organisms)

### Backend
- **FastAPI** - Modern Python web framework
- **Overpass API** - Query OpenStreetMap data
- **httpx** - Async HTTP client for API requests
- **geojson** - GeoJSON data handling
- **Uvicorn** - ASGI server

### Data Source
- **OpenStreetMap** - Real-world power infrastructure data
- **Overpass API** - Query OSM data in real-time

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.10+ ([Download](https://www.python.org/))
- **Mapbox Account** ([Sign up](https://account.mapbox.com/)) - Free tier available
- **Git** - For cloning the repository

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/DPrashanth9/Powerlines-OP.git
cd Powerlines-OP
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload
```

**Backend will run at:** http://localhost:8000

**Test endpoints:**
- Health: http://localhost:8000/health
- Boundary: http://localhost:8000/api/op/boundary
- Power Data: http://localhost:8000/api/op/power?bbox=38.9820,-94.6900,38.9950,-94.6600

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your Mapbox token

# Start development server
npm run dev
```

**Frontend will run at:** http://localhost:5173

### 4. Environment Variables

#### Backend (.env) - Optional
```env
# Only needed if using Neo4j features (optional for map view)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

#### Frontend (.env) - Required
```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_API_URL=http://localhost:8000
```

**⚠️ Important:** 
- Never commit `.env` files to Git!
- Get your Mapbox token from: https://account.mapbox.com/access-tokens/

## 📁 Project Structure

```
Powerlines-OP/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   └── overland_park.py    # Overland Park endpoints
│   │   ├── services/
│   │   │   └── overpass_service.py # Overpass API integration
│   │   ├── database/              # Neo4j connection (optional)
│   │   └── models/                # Pydantic models
│   ├── main.py                   # FastAPI app entry
│   └── requirements.txt
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── organisms/
│   │   │       └── OverlandParkMap.tsx  # Main map component
│   │   ├── services/
│   │   │   └── api.ts            # API client
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 🎮 Usage

1. **Start Backend** - `cd backend && uvicorn main:app --reload`
2. **Start Frontend** - `cd frontend && npm run dev`
3. **Open Browser** - Navigate to http://localhost:5173
4. **Explore Map:**
   - Map loads centered on Overland Park, Kansas
   - Green boundary outline shows city limits
   - Zoom in to see power infrastructure
   - Yellow lines = Transmission lines
   - Purple lines = Distribution lines
   - Green circles = Substations
5. **Interact:**
   - Use layer toggles (top-right) to show/hide layers
   - Click any feature to see details and fly to location
   - View statistics in the dashboard

## 📚 API Endpoints

### Health Check
```
GET /health
Response: { "status": "ok" }
```

### Overland Park Boundary
```
GET /api/op/boundary
Response: GeoJSON FeatureCollection with city boundary
```

### Power Infrastructure
```
GET /api/op/power?bbox=south,west,north,east
Response: {
  "geojson": FeatureCollection,
  "stats": {
    "transmission_miles": number,
    "distribution_miles": number,
    "substation_count": number
  }
}
```

**Full API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🎨 Map Features

### Layer Types
- **Transmission Lines** (`power=line`) - Yellow, thicker lines
- **Distribution Lines** (`power=minor_line`) - Purple, thinner lines
- **Substations** (`power=substation`) - Green circles

### Markers
- Point markers at line endpoints for easy identification
- Markers scale with zoom level
- Color-coded to match layer types

### Interactions
- **Click Feature** - Fly to location and show popup with details
- **Layer Toggles** - Show/hide each layer type independently
- **Statistics** - Real-time stats for current view
- **Smooth Animations** - Fly-to with curve animations

## 🔧 Configuration

### Map Settings
- **Style:** Mapbox Dark (`mapbox://styles/mapbox/dark-v11`)
- **Center:** Overland Park, KS (38.9822, -94.6708)
- **Initial Zoom:** 12.5
- **Max View:** 60km diagonal (enforced by backend)

### Performance
- **Debounce:** 1.2 seconds for map move events
- **Caching:** 30 minutes for power data, 1 hour for boundary
- **Fallback Servers:** 4 Overpass API servers for reliability

## 🐛 Troubleshooting

### Map Not Loading
- Check `frontend/.env` has `VITE_MAPBOX_TOKEN`
- Verify token is valid at https://account.mapbox.com/
- Check browser console (F12) for errors
- Restart frontend server after changing `.env`

### No Power Lines Showing
- Zoom in closer (must be within 60km view)
- Wait 1-2 seconds after zooming for data to load
- Check backend is running: http://localhost:8000/health
- Check browser console for errors

### Backend Errors
- Ensure `httpx` and `geojson` are installed: `pip install httpx geojson`
- Check backend terminal for error messages
- Verify Overpass API is accessible (may be slow)

## 📖 Documentation

- [Step-by-Step Setup Guide](STEP_BY_STEP_SETUP.md)
- [Run Instructions](RUN_INSTRUCTIONS.md)
- [Performance Fixes](PERFORMANCE_FIX.md)
- [Layer Toggle Fix](LAYER_TOGGLE_FIX.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Mapbox](https://www.mapbox.com/) - Map visualization
- [OpenStreetMap](https://www.openstreetmap.org/) - Power infrastructure data
- [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) - OSM data queries
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework
- [React](https://react.dev/) - UI library

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for visualizing power infrastructure in Overland Park, Kansas**
