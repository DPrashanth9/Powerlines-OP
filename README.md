# Power Grid Visualizer

A full-stack application for visualizing power grid infrastructure and tracing electricity flow from generation to consumption.

![Power Grid Visualizer](https://img.shields.io/badge/Status-In%20Development-yellow)
![React](https://img.shields.io/badge/React-18.2-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.128-green)
![Neo4j](https://img.shields.io/badge/Neo4j-5.14-orange)

## 🎯 Features

- **Interactive Map Visualization** - View power grid components on an interactive Mapbox map
- **Path Traversal** - Click any component to trace the path back to its power source
- **Graph Database** - Neo4j stores component relationships efficiently
- **Real-time Updates** - Dynamic visualization of electricity flow paths
- **Component Details** - View detailed information about each power grid component

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │─────▶│   FastAPI   │─────▶│   Neo4j     │
│  Frontend   │      │   Backend   │      │  Database   │
│  (Mapbox)   │◀─────│   (Python)  │◀─────│  (Graph)    │
└─────────────┘      └─────────────┘      └─────────────┘
```

## 🚀 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Mapbox GL JS** - Map visualization
- **Vite** - Build tool
- **Atomic Design** - Component architecture

### Backend
- **FastAPI** - Python web framework
- **Neo4j** - Graph database
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Database
- **Neo4j** - Graph database for relationship storage

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.10+ ([Download](https://www.python.org/))
- **Neo4j** Desktop or Docker ([Download](https://neo4j.com/download/))
- **Mapbox Account** ([Sign up](https://account.mapbox.com/))

## 🛠️ Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Powerlines-new
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp env.example .env
# Edit .env with your Neo4j credentials

# Initialize database
python init_schema.py

# Start server
uvicorn main:app --reload
```

Backend will run at: http://localhost:8000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your Mapbox token

# Start development server
npm run dev
```

Frontend will run at: http://localhost:5173

### 4. Neo4j Setup

1. Install Neo4j Desktop from [neo4j.com](https://neo4j.com/download/)
2. Create a new database
3. Start the database
4. Update `backend/.env` with your Neo4j credentials

## 📁 Project Structure

```
Powerlines-new/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── database/    # Neo4j connection
│   │   ├── models/      # Pydantic models
│   │   └── services/    # Business logic
│   ├── main.py         # FastAPI app entry
│   └── requirements.txt
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/ # Atomic design components
│   │   │   ├── atoms/
│   │   │   ├── molecules/
│   │   │   └── organisms/
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # API client
│   │   └── types/      # TypeScript types
│   └── package.json
└── data/               # GeoJSON data files
```

## 🔑 Environment Variables

### Backend (.env)
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

### Frontend (.env)
```env
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_API_URL=http://localhost:8000
```

**⚠️ Important:** Never commit `.env` files to Git! They contain sensitive credentials.

## 🎮 Usage

1. **Start Neo4j** - Open Neo4j Desktop and start your database
2. **Start Backend** - `cd backend && uvicorn main:app --reload`
3. **Start Frontend** - `cd frontend && npm run dev`
4. **Open Browser** - Navigate to http://localhost:5173
5. **Click Components** - Click any component to see its path to the power source

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing

### Backend
```bash
cd backend
python test_connection.py  # Test Neo4j connection
python test_api.py        # Test API endpoints
```

### Frontend
```bash
cd frontend
npm run dev  # Development server with hot reload
```

## 📖 Documentation

- [Neo4j Setup Guide](NEO4J_SETUP_GUIDE.md)
- [Backend Setup](backend/README.md)
- [Frontend Setup](frontend/README.md)
- [API Testing Guide](TEST_API_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Mapbox](https://www.mapbox.com/) for map visualization
- [Neo4j](https://neo4j.com/) for graph database
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent Python framework
- [React](https://react.dev/) for the UI library

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Note:** This is a learning project. Feel free to use it as a reference or starting point for your own projects!
