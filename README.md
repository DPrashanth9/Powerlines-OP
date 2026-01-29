# ⚡ Power Grid Visualizer

An interactive web application for visualizing electrical power infrastructure in Overland Park, Kansas. Built with React, TypeScript, Mapbox GL JS, and FastAPI.

![Power Grid Visualizer](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.2-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![Mapbox](https://img.shields.io/badge/Mapbox-GL-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)

## 🎯 Features

- **🗺️ Interactive 3D Map** - Dark-themed Mapbox map with terrain and 3D buildings
- **⚡ Real-Time Power Infrastructure** - Live data from OpenStreetMap via Overpass API
- **🔌 Transmission Lines** - High-voltage lines (345kV+) in electric yellow
- **📡 Distribution Lines** - Neighborhood lines in neon purple
- **🏭 Transformers** - Power transformers with pulsing green markers
- **⚡ Energy Flow Animation** - Smooth animated white lines showing electricity flow
- **🎛️ Layer Controls** - Toggle visibility of infrastructure layers
- **📊 Statistics Dashboard** - Real-time metrics (miles, counts, voltages)
- **🖱️ Interactive Controls** - Rotate, pan, zoom with custom mouse interactions
- **🌐 City Boundary** - Visual outline of Overland Park

## 🏗️ Architecture

```
Frontend (React + Mapbox)  →  Backend (FastAPI)  →  OpenStreetMap (Overpass API)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Mapbox account and access token

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "VITE_MAPBOX_TOKEN=your_token_here" > .env
echo "VITE_API_URL=http://localhost:8000" >> .env

npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp env.example .env
# Edit .env with your configuration

uvicorn main:app --reload
```

## 📚 Documentation

- **[Complete Project Documentation](./PROJECT_DOCUMENTATION.md)** - Comprehensive guide covering architecture, API, components, and more
- **[GitHub Push Guide](./GITHUB_PUSH_GUIDE.md)** - Step-by-step instructions for pushing to GitHub

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Mapbox GL JS
- Vite
- Axios

### Backend
- FastAPI
- Python 3.9+
- Overpass API (OpenStreetMap)
- Neo4j (Optional - for path traversal)

## 📡 API Endpoints

- `GET /api/op/boundary` - Get city boundary
- `GET /api/op/power?bbox={south},{west},{north},{east}` - Get power infrastructure

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for detailed API documentation.

## 🎨 Map Interactions

- **Left-Click + Drag**: Rotate map
- **Double-Click + Drag**: Pan map
- **Mouse Wheel**: Zoom
- **3D Button**: Toggle terrain and 3D buildings
- **Energy Flow Button**: Toggle flow animation

## 🔒 Security

- All sensitive files (`.env`, passwords) are excluded via `.gitignore`
- Environment variables are required for configuration
- No hardcoded credentials in source code

## 📝 License

[Add your license here]

## 👥 Contributors

[Add contributors here]

## 📞 Support

For detailed setup instructions, troubleshooting, and API documentation, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md).

---

**Built with ❤️ for visualizing power infrastructure**
