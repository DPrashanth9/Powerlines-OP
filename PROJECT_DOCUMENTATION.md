# Power Grid Visualizer - Complete Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Features](#features)
6. [Setup & Installation](#setup--installation)
7. [Configuration](#configuration)
8. [API Documentation](#api-documentation)
9. [Frontend Components](#frontend-components)
10. [Map Interactions](#map-interactions)
11. [Data Sources](#data-sources)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)
14. [Development Guidelines](#development-guidelines)

---

## 🎯 Project Overview

**Power Grid Visualizer** is an interactive web application that visualizes the electrical power infrastructure of Overland Park, Kansas. The application displays high-voltage transmission lines, neighborhood distribution lines, transformers, and energy flow animations on an interactive 3D map.

### Key Capabilities
- Real-time visualization of power grid infrastructure
- Interactive 3D map with terrain and building models
- Energy flow animations showing electricity movement
- Layer toggles for different infrastructure types
- Statistics dashboard with network metrics
- Responsive design with modern UI/UX

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Mapbox GL  │  │   React UI   │  │   API Calls  │ │
│  │      JS      │  │  Components  │  │   Service    │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (FastAPI)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   FastAPI    │  │  Overpass    │  │   Neo4j      │ │
│  │   Endpoints  │  │   Service    │  │  (Optional)  │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ API Calls
                          ▼
┌─────────────────────────────────────────────────────────┐
│              External Services                          │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │  OpenStreet  │  │   Mapbox     │                   │
│  │     Map      │  │     API      │                   │
│  │  (Overpass)  │  │              │                   │
│  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Interaction** → Frontend React components
2. **Map Rendering** → Mapbox GL JS renders map and layers
3. **Data Fetching** → Frontend calls FastAPI backend
4. **Data Processing** → Backend queries OpenStreetMap (Overpass API)
5. **Data Return** → Backend returns GeoJSON to frontend
6. **Visualization** → Frontend renders data on map

---

## 💻 Technology Stack

### Frontend
- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Mapbox GL JS** - Interactive map rendering
- **Axios** - HTTP client for API calls
- **CSS-in-JS** - Styling (inline styles)

### Backend
- **Python 3.9+** - Programming language
- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **Overpass API** - OpenStreetMap data queries
- **Neo4j** (Optional) - Graph database for path traversal
- **python-dotenv** - Environment variable management

### External Services
- **Mapbox** - Map tiles and rendering
- **OpenStreetMap** - Power infrastructure data source
- **Overpass API** - Query interface for OSM data

---

## 📁 Project Structure

```
Powerlines-new/
│
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── atoms/          # Basic UI components
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Icon.tsx
│   │   │   ├── molecules/      # Composite components
│   │   │   │   ├── ComponentCard.tsx
│   │   │   │   └── PathStep.tsx
│   │   │   └── organisms/     # Complex components
│   │   │       ├── MapView.tsx
│   │   │       ├── OverlandParkMap.tsx  # Main map component
│   │   │       └── Sidebar.tsx
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useComponents.ts
│   │   │   └── useMapbox.ts
│   │   ├── services/           # API service layer
│   │   │   └── api.ts
│   │   ├── types/              # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── App.tsx             # Main app component
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── index.html              # HTML template
│   ├── package.json            # Dependencies
│   ├── tsconfig.json           # TypeScript config
│   └── vite.config.ts          # Vite configuration
│
├── backend/                     # FastAPI backend application
│   ├── app/
│   │   ├── api/                # API route handlers
│   │   │   ├── components.py
│   │   │   └── overland_park.py
│   │   ├── database/           # Database connections
│   │   │   └── neo4j.py
│   │   ├── models/             # Data models
│   │   │   └── component.py
│   │   └── services/           # Business logic
│   │       ├── graph_service.py
│   │       └── overpass_service.py
│   ├── main.py                 # FastAPI app entry point
│   ├── requirements.txt        # Python dependencies
│   ├── env.example             # Environment variables template
│   └── init_schema.py         # Database initialization
│
├── .gitignore                  # Git ignore rules
└── README.md                   # Project readme (optional)
```

---

## ✨ Features

### 1. Interactive Map Visualization
- **Dark Theme Map**: Professional dark "Cyber Energy" theme
- **3D View**: Toggle terrain and 3D buildings with 60° pitch
- **Layer Controls**: Toggle visibility of transmission, distribution, and transformers
- **Energy Flow Animation**: Animated dashed lines showing electricity flow
- **City Boundary**: Visual boundary of Overland Park

### 2. Map Interactions
- **Left-Click + Drag**: Rotate map (bearing)
- **Double-Click + Drag**: Pan/move map
- **Right-Click**: Context menu (no rotation)
- **Mouse Wheel**: Zoom in/out
- **Compass Control**: Reset bearing to north
- **Zoom Controls**: +/- buttons for zoom

### 3. Dashboard Panel
- **Statistics Display**:
  - High-Voltage Lines (miles)
  - Neighborhood Lines (miles)
  - Transformers (count)
  - Highest/Lowest Voltage (kV)
  - City coverage information
- **Layer Toggles**: Enable/disable infrastructure layers
- **Legend**: Color-coded legend for map layers
- **Collapsible**: Expand/collapse dashboard panel

### 4. Energy Flow Animation
- **Transmission Flow**: Thicker, slower white animated lines
- **Distribution Flow**: Thinner, faster white animated lines
- **Smooth Animation**: Continuous dash offset animation
- **Glow Effects**: Subtle blur and opacity for visual appeal

### 5. Color Scheme
- **Transmission Lines**: #FFD700 (Electric Yellow)
- **Distribution Lines**: #A855F7 (Neon Purple)
- **Transformers**: #22C55E (Teal Green) with pulsing animation
- **City Boundary**: #38BDF8 (Soft Cyan)
- **Energy Flow**: #FFFFFF (White) with opacity

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Mapbox account and access token
- (Optional) Neo4j database

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
# Copy env.example or create .env with:
# VITE_MAPBOX_TOKEN=your_mapbox_token_here
# VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173` (or next available port)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
# Copy env.example to .env and configure:
# NEO4J_URI=bolt://localhost:7687
# NEO4J_USER=neo4j
# NEO4J_PASSWORD=your_password
# API_HOST=0.0.0.0
# API_PORT=8000

# Start development server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Backend will run on `http://localhost:8000`

### Neo4j Setup (Optional)

Neo4j is optional. The map visualization works without it. Neo4j is only needed for path traversal features.

1. Install Neo4j Desktop or Community Edition
2. Create a new database
3. Set password
4. Update `.env` with connection details
5. Run `python init_schema.py` to initialize schema

---

## ⚙️ Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
VITE_API_URL=http://localhost:8000
```

#### Backend (.env)
```env
# Neo4j Configuration (Optional)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password_here

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
```

### Mapbox Token Setup

1. Sign up at [mapbox.com](https://www.mapbox.com)
2. Go to Account → Access tokens
3. Create a new token or use default public token
4. Copy token and add to `frontend/.env` as `VITE_MAPBOX_TOKEN`

### CORS Configuration

Backend CORS is configured in `backend/main.py`:
- Allowed origins include common Vite dev ports (3000, 5173-5178)
- Update `ALLOWED_ORIGINS` for production deployment

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. Get City Boundary
```
GET /api/op/boundary
```
Returns GeoJSON boundary of Overland Park.

**Response:**
```json
{
  "type": "FeatureCollection",
  "features": [...]
}
```

#### 2. Get Power Infrastructure
```
GET /api/op/power?bbox={south},{west},{north},{east}
```
Returns power infrastructure data for specified bounding box.

**Parameters:**
- `bbox` (required): Bounding box in format `south,west,north,east`

**Example:**
```
GET /api/op/power?bbox=38.85,-94.80,39.10,-94.55
```

**Response:**
```json
{
  "transmission": {
    "type": "FeatureCollection",
    "features": [...]
  },
  "distribution": {
    "type": "FeatureCollection",
    "features": [...]
  },
  "transformers": {
    "type": "FeatureCollection",
    "features": [...]
  },
  "stats": {
    "transmission_miles": 45.2,
    "distribution_miles": 234.5,
    "transformer_count": 156,
    "highest_voltage": 345000,
    "lowest_voltage": 12000
  }
}
```

### API Response Format

All endpoints return GeoJSON FeatureCollection format:
- `type`: "FeatureCollection"
- `features`: Array of GeoJSON Feature objects
- Each feature contains:
  - `geometry`: GeoJSON geometry (Point, LineString, etc.)
  - `properties`: Metadata (voltage, type, etc.)

---

## 🎨 Frontend Components

### OverlandParkMap Component

Main map component located at `frontend/src/components/organisms/OverlandParkMap.tsx`

**Key Features:**
- Mapbox GL JS integration
- Layer management (transmission, distribution, transformers)
- 3D view toggle
- Energy flow animation
- Statistics calculation
- Interactive controls

**State Management:**
- `showTransmission`: Toggle transmission lines
- `showDistribution`: Toggle distribution lines
- `showTransformers`: Toggle transformers
- `is3D`: 3D view state
- `showFlowAnimation`: Energy flow animation state
- `mapLoaded`: Map initialization state
- `stats`: Network statistics

**Key Functions:**
- `toggle3D()`: Enable/disable 3D view with terrain
- `toggleFlowAnimation()`: Toggle energy flow animation
- `resetView()`: Reset map to default view
- `loadBoundary()`: Load city boundary
- `loadPowerData()`: Load power infrastructure data
- `animate()`: Energy flow animation loop

### Map Layers

1. **Boundary Layer** (`boundary-line`)
   - Type: Line
   - Color: #38BDF8 (Cyan)
   - Width: 3px

2. **Transmission Lines** (`transmission-lines`)
   - Type: Line
   - Color: #FFD700 (Yellow)
   - Width: 4px
   - Flow animation layer: `transmission-flow`

3. **Distribution Lines** (`distribution-lines`)
   - Type: Line
   - Color: #A855F7 (Purple)
   - Width: 2px
   - Flow animation layer: `distribution-flow`

4. **Transformers** (`transformers`)
   - Type: Circle
   - Color: #22C55E (Green)
   - Radius: 5-8px (pulsing)
   - Stroke: White

---

## 🗺️ Map Interactions

### Mouse Controls

| Action | Behavior |
|--------|----------|
| **Left-Click + Drag** | Rotate map (change bearing) |
| **Double-Click + Drag** | Pan/move map |
| **Right-Click** | Show context menu |
| **Mouse Wheel** | Zoom in/out |
| **Ctrl/Cmd + Scroll** | Zoom (alternative) |

### Keyboard Controls

- **Arrow Keys**: Pan map (if enabled)
- **+ / -**: Zoom in/out

### Touch Controls

- **Pinch**: Zoom
- **Two-finger rotate**: Rotate map
- **Two-finger drag**: Pitch/tilt map

### Map Controls

- **Zoom Buttons**: Top-right corner
- **Compass**: Top-right corner (reset bearing)
- **3D Button**: Top-right corner (toggle 3D view)
- **Energy Flow Button**: Top-right corner (toggle animation)
- **Reset View Button**: Bottom-left corner

---

## 📊 Data Sources

### OpenStreetMap (OSM)

Primary data source for power infrastructure:
- **Transmission Lines**: Tagged as `power=line` with `voltage>=345000`
- **Distribution Lines**: Tagged as `power=line` with `voltage<345000`
- **Transformers**: Tagged as `power=transformer` or `power=substation`

### Overpass API

Used to query OSM data:
- Endpoint: `https://overpass-api.de/api/interpreter`
- Query language: Overpass QL
- Returns: GeoJSON format

### Data Processing

1. Backend queries Overpass API with bounding box
2. Filters results by power infrastructure tags
3. Categorizes by voltage levels
4. Calculates statistics (miles, counts, voltages)
5. Returns GeoJSON to frontend

---

## 🚢 Deployment

### Frontend Deployment

**Vercel/Netlify:**
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

**Environment Variables:**
- `VITE_MAPBOX_TOKEN`: Your Mapbox token
- `VITE_API_URL`: Backend API URL

### Backend Deployment

**Railway/Render:**
- Connect GitHub repository
- Set environment variables
- Deploy from `backend/` directory
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Docker (Optional):**
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### CORS Configuration

Update `ALLOWED_ORIGINS` in `backend/main.py`:
```python
allowed_origins = [
    "https://your-frontend-domain.com",
    "http://localhost:5173"
]
```

---

## 🔧 Troubleshooting

### Map Not Loading

**Issue**: Black screen, "Map load timeout" error

**Solutions:**
1. Check Mapbox token is valid and starts with `pk.`
2. Verify token is in `frontend/.env` as `VITE_MAPBOX_TOKEN`
3. Restart frontend dev server after adding token
4. Check browser console for errors
5. Verify network connection

### CORS Errors

**Issue**: "Access-Control-Allow-Origin" error

**Solutions:**
1. Check backend CORS configuration
2. Add frontend URL to `ALLOWED_ORIGINS` in `backend/main.py`
3. Restart backend server
4. Verify backend is running on correct port

### No Data Displayed

**Issue**: Map loads but no power lines visible

**Solutions:**
1. Check layer toggles are enabled
2. Verify API endpoint is accessible
3. Check browser Network tab for API calls
4. Verify bounding box is correct
5. Check OpenStreetMap has data for area

### 3D View Not Working

**Issue**: 3D button doesn't enable terrain

**Solutions:**
1. Check Mapbox token has 3D terrain access
2. Verify map is fully loaded before toggling
3. Check browser console for errors
4. Try refreshing page

### Animation Not Smooth

**Issue**: Energy flow animation is choppy

**Solutions:**
1. Check browser performance (close other tabs)
2. Reduce animation complexity
3. Check `requestAnimationFrame` is working
4. Verify GPU acceleration is enabled

---

## 👨‍💻 Development Guidelines

### Code Style

**Frontend:**
- Use TypeScript for all components
- Follow React hooks best practices
- Use functional components
- Inline styles for UI (no CSS files)
- Descriptive variable names

**Backend:**
- Follow PEP 8 Python style guide
- Use type hints where possible
- Document functions with docstrings
- Use async/await for async operations

### Git Workflow

1. Create feature branch
2. Make changes
3. Test locally
4. Commit with descriptive messages
5. Push to GitHub
6. Create pull request (if team)

### Adding New Features

1. **New Map Layer:**
   - Add layer in `OverlandParkMap.tsx`
   - Add toggle state
   - Add to dashboard
   - Update legend

2. **New API Endpoint:**
   - Add route in `backend/app/api/`
   - Add service logic
   - Update frontend API service
   - Add error handling

3. **New UI Component:**
   - Create in appropriate folder (atoms/molecules/organisms)
   - Add TypeScript types
   - Export from component file
   - Use in parent component

### Performance Optimization

- Use `useCallback` for event handlers
- Use `useMemo` for expensive calculations
- Debounce API calls on map move
- Lazy load components if needed
- Optimize GeoJSON data size

---

## 📝 License

[Add your license here]

---

## 👥 Contributors

[Add contributors here]

---

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

**Last Updated**: [Current Date]
**Version**: 1.0.0
