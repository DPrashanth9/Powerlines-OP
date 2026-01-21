# 🎨 Frontend Setup Guide

## 📋 Prerequisites

Before starting, you need:

1. **Node.js installed** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **Mapbox Access Token**
   - Sign up at: https://account.mapbox.com/
   - Get your free token from: https://account.mapbox.com/access-tokens/

---

## 🚀 Setup Steps

### Step 1: Install Node.js

1. Go to https://nodejs.org/
2. Download the LTS version (Long Term Support)
3. Install it (use default options)
4. Restart your terminal/PowerShell

### Step 2: Install Frontend Dependencies

Open PowerShell in the `frontend` folder and run:

```powershell
cd C:\Users\dpras\Downloads\Powerlines-new\frontend
npm install
```

This will install:
- React
- TypeScript
- Mapbox GL JS
- Axios (for API calls)
- Vite (build tool)

### Step 3: Configure Environment Variables

1. Copy the example file:
   ```powershell
   copy .env.example .env
   ```

2. Edit `.env` and add your Mapbox token:
   ```
   VITE_MAPBOX_TOKEN=your_actual_mapbox_token_here
   VITE_API_URL=http://localhost:8000
   ```

### Step 4: Start the Frontend Development Server

```powershell
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 5: Open in Browser

Go to: **http://localhost:5173**

---

## 📁 Project Structure

```
frontend/src/
├── components/
│   ├── atoms/          # Smallest components
│   │   ├── Button.tsx
│   │   ├── Icon.tsx
│   │   └── Badge.tsx
│   ├── molecules/      # Component combinations
│   │   ├── ComponentCard.tsx
│   │   └── PathStep.tsx
│   └── organisms/      # Complex sections
│       ├── MapView.tsx
│       └── Sidebar.tsx
├── hooks/              # Custom React hooks
│   ├── useComponents.ts
│   └── useMapbox.ts
├── services/           # API calls
│   └── api.ts
├── types/              # TypeScript types
│   └── index.ts
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

---

## 🎯 What's Implemented

### ✅ Atomic Components (Atoms)
- **Button** - Reusable button with variants
- **Icon** - Component type icons
- **Badge** - Status indicators

### ✅ Molecule Components
- **ComponentCard** - Component information display
- **PathStep** - Path visualization step

### ✅ Organism Components
- **MapView** - Mapbox map with components
- **Sidebar** - Component list and details

### ✅ Hooks
- **useComponents** - Fetch components from API
- **useMapbox** - Mapbox integration
- **useComponent** - Get single component
- **usePathToSource** - Get path to source

### ✅ Services
- **api.ts** - All API calls to backend

---

## 🧪 Testing

### Make Sure Backend is Running

1. Start your backend server:
   ```powershell
   cd backend
   uvicorn main:app --reload
   ```

2. Verify API is working:
   - Visit: http://localhost:8000/api/health
   - Should show: `{"status": "healthy", "neo4j_connected": true}`

### Test Frontend

1. Start frontend:
   ```powershell
   cd frontend
   npm run dev
   ```

2. Open browser: http://localhost:5173

3. You should see:
   - ✅ Map on the right side
   - ✅ Sidebar on the left with components
   - ✅ Component markers on the map

4. Click a component:
   - ✅ Component details appear in sidebar
   - ✅ Path to source is displayed
   - ✅ Path line appears on map

---

## 🐛 Troubleshooting

### "npm is not recognized"
- Install Node.js from nodejs.org
- Restart your terminal after installation

### "Cannot find module"
- Run `npm install` again
- Delete `node_modules` folder and `package-lock.json`, then `npm install`

### Map not showing / Mapbox error
- Check `.env` file has `VITE_MAPBOX_TOKEN`
- Verify token is valid at https://account.mapbox.com/access-tokens/
- Restart the dev server after changing `.env`

### "Network Error" / Can't connect to API
- Make sure backend server is running on port 8000
- Check `VITE_API_URL` in `.env` is correct
- Check browser console for errors

### Components not loading
- Verify backend is running
- Check browser console (F12) for errors
- Test API directly: http://localhost:8000/api/components

---

## 🎓 How It Works

### Data Flow

```
User clicks component
  ↓
ComponentCard onClick
  ↓
App state updates (selectedComponentId)
  ↓
useComponent hook fetches component details
  ↓
usePathToSource hook fetches path
  ↓
Sidebar displays component + path
  ↓
MapView adds path line to map
```

### Component Hierarchy

```
App
├── Sidebar (organisms)
│   ├── ComponentCard (molecules)
│   │   ├── Icon (atoms)
│   │   └── Badge (atoms)
│   └── PathStep (molecules)
│       └── Icon (atoms)
└── MapView (organisms)
    └── Mapbox markers
```

---

## 📚 Next Steps

1. **Customize styling** - Adjust colors, sizes, etc.
2. **Add more features** - Filtering, search, etc.
3. **Import real data** - Replace sample data with your GeoJSON
4. **Deploy** - Build and deploy to production

---

## 🎉 Success Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured with Mapbox token
- [ ] Backend server running
- [ ] Frontend server running (`npm run dev`)
- [ ] Browser shows map and components
- [ ] Clicking components shows path
- [ ] Path appears on map

---

## 💡 Tips

1. **Hot Reload** - Vite automatically refreshes when you save files
2. **Browser DevTools** - Press F12 to see errors and network requests
3. **API Testing** - Test endpoints directly at http://localhost:8000/docs
4. **Component Inspector** - Use React DevTools browser extension

Happy coding! 🚀
