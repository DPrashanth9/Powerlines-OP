# 🚀 Deployment Guide - Host Your Project Publicly

## 🎯 Recommended Platforms

### Option 1: **Railway** (Recommended - Easiest) ⭐
- ✅ Free tier available ($5 credit/month)
- ✅ Easy deployment for both frontend & backend
- ✅ Automatic deployments from GitHub
- ✅ Built-in environment variables
- ✅ Good for full-stack apps

### Option 2: **Render** (Great Alternative)
- ✅ Free tier available
- ✅ Easy setup
- ✅ Auto-deploy from GitHub
- ✅ Good documentation

### Option 3: **Vercel (Frontend) + Railway/Render (Backend)**
- ✅ Vercel: Best for React/Vite frontend
- ✅ Railway/Render: Backend deployment
- ✅ Separate deployments (more control)

---

## 🚀 Option 1: Railway (Recommended)

### Why Railway?
- **Easiest setup** - Connect GitHub, auto-deploy
- **Full-stack support** - Deploy both frontend & backend
- **Free tier** - $5 credit/month (enough for small projects)
- **Environment variables** - Easy to configure
- **Automatic HTTPS** - SSL certificates included

### Step-by-Step Deployment

#### Part 1: Deploy Backend

1. **Sign up for Railway**
   - Go to: https://railway.app/
   - Click "Start a New Project"
   - Sign up with GitHub (recommended)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `Powerlines-OP`

3. **Configure Backend Service**
   - Railway will detect it's a Python project
   - Select the `backend` folder as root directory
   - Or create a new service and point to `backend/`

4. **Set Environment Variables**
   - Go to "Variables" tab
   - Add these (if using Neo4j):
     ```
     NEO4J_URI=bolt://your-neo4j-instance
     NEO4J_USER=neo4j
     NEO4J_PASSWORD=your_password
     ```
   - **Note:** For map view, Neo4j is optional

5. **Configure Build Settings**
   - Railway auto-detects Python
   - It will run: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

6. **Get Backend URL**
   - Railway will generate a URL like: `https://your-app.up.railway.app`
   - Copy this URL (you'll need it for frontend)

#### Part 2: Deploy Frontend

1. **Create New Service in Same Project**
   - In Railway dashboard, click "+ New"
   - Select "Deploy from GitHub repo"
   - Choose same repository

2. **Configure Frontend Service**
   - Set root directory to `frontend/`
   - Railway will detect it's a Node.js project

3. **Set Environment Variables**
   - Go to "Variables" tab
   - Add:
     ```
     VITE_MAPBOX_TOKEN=your_mapbox_token
     VITE_API_URL=https://your-backend-url.up.railway.app
     ```
   - **Important:** Use your Railway backend URL!

4. **Configure Build Settings**
   - Build command: `npm run build`
   - Start command: `npm run preview` (or use a static file server)
   - **OR** use Railway's static file serving

5. **Get Frontend URL**
   - Railway will generate a URL
   - Your app should be live!

---

## 🌐 Option 2: Render

### Why Render?
- **Free tier** - 750 hours/month
- **Easy setup** - Similar to Railway
- **Good documentation**

### Step-by-Step Deployment

#### Part 1: Deploy Backend

1. **Sign up for Render**
   - Go to: https://render.com/
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `Powerlines-OP`

3. **Configure Service**
   - **Name:** `powerlines-backend`
   - **Environment:** Python 3
   - **Build Command:** `cd backend && pip install -r requirements.txt`
   - **Start Command:** `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables**
   - Scroll to "Environment Variables"
   - Add Neo4j vars (if needed)

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Copy the URL (e.g., `https://powerlines-backend.onrender.com`)

#### Part 2: Deploy Frontend

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect same repository

2. **Configure**
   - **Name:** `powerlines-frontend`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`

3. **Set Environment Variables**
   - Add:
     ```
     VITE_MAPBOX_TOKEN=your_token
     VITE_API_URL=https://powerlines-backend.onrender.com
     ```

4. **Deploy**
   - Click "Create Static Site"
   - Your app is live!

---

## ⚡ Option 3: Vercel (Frontend) + Railway (Backend)

### Why This Combo?
- **Vercel:** Best performance for React/Vite
- **Railway:** Easy backend deployment
- **Separate control** over each service

### Deploy Backend (Railway)
- Follow Railway steps above

### Deploy Frontend (Vercel)

1. **Sign up for Vercel**
   - Go to: https://vercel.com/
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import `Powerlines-OP` repository

3. **Configure**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Environment Variables**
   - Add:
     ```
     VITE_MAPBOX_TOKEN=your_token
     VITE_API_URL=https://your-backend-url.up.railway.app
     ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will auto-deploy on every push!

---

## 🔧 Important Configuration Changes

### Backend Changes Needed

You may need to update CORS settings in `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://your-frontend-url.vercel.app",  # Add your frontend URL
        "https://your-frontend-url.railway.app",  # Or Railway URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Frontend Changes

Make sure `frontend/.env` uses your production backend URL:
```env
VITE_API_URL=https://your-backend-url.up.railway.app
```

---

## 📋 Pre-Deployment Checklist

- [ ] Backend tested locally
- [ ] Frontend tested locally
- [ ] Environment variables documented
- [ ] CORS configured for production URLs
- [ ] `.env` files NOT committed to Git
- [ ] Mapbox token is valid
- [ ] Backend endpoints tested

---

## 🐛 Common Issues & Solutions

### Issue: CORS Errors
**Solution:** Update CORS in `backend/main.py` to include your frontend URL

### Issue: Environment Variables Not Working
**Solution:** 
- Check variable names match exactly
- Restart service after adding variables
- For Vite: Variables must start with `VITE_`

### Issue: Backend Not Starting
**Solution:**
- Check build logs in Railway/Render dashboard
- Verify `requirements.txt` is correct
- Check Python version compatibility

### Issue: Frontend Can't Connect to Backend
**Solution:**
- Verify `VITE_API_URL` is correct
- Check backend is running (visit backend URL)
- Check CORS settings

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| **Railway** | $5 credit/month | $5+/month |
| **Render** | 750 hours/month | $7+/month |
| **Vercel** | Unlimited (hobby) | $20+/month |
| **Fly.io** | 3 VMs free | $1.94+/month |

**Recommendation:** Start with Railway (easiest) or Render (most free hours)

---

## 🎯 Quick Start Recommendation

**For beginners:** Use **Railway** (Option 1)
- Easiest setup
- Deploy both frontend & backend together
- Good free tier

**For more control:** Use **Vercel + Railway** (Option 3)
- Best performance
- Separate deployments
- More configuration options

---

## 📚 Next Steps

1. Choose a platform (Railway recommended)
2. Follow the step-by-step guide above
3. Test your deployed app
4. Share your live URL!

**Need help?** Check the platform's documentation or open an issue on GitHub.

---

## 🔗 Useful Links

- Railway Docs: https://docs.railway.app/
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Fly.io Docs: https://fly.io/docs/

Good luck with your deployment! 🚀
