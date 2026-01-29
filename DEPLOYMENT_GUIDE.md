# 🚀 Free Hosting Deployment Guide

## Recommended Platforms (100% Free)

### **Option 1: Render (Recommended - Simplest)**
✅ Host both frontend and backend on one platform  
✅ Free tier with 750 hours/month  
✅ Automatic deployments from GitHub  
✅ Free SSL certificates  
✅ Easy environment variable management  

### **Option 2: Vercel (Frontend) + Render (Backend)**
✅ Vercel is excellent for React/Vite apps  
✅ Render for FastAPI backend  
✅ Both have generous free tiers  

### **Option 3: Netlify (Frontend) + Render (Backend)**
✅ Netlify great for static sites  
✅ Render for backend  

---

## 🎯 Recommended: Render (Both Frontend & Backend)

**Why Render?**
- One platform for everything
- Free tier: 750 hours/month (enough for 24/7)
- Automatic SSL
- Easy GitHub integration
- Good for FastAPI

**Limitations:**
- Services spin down after 15 minutes of inactivity (free tier)
- First request after spin-down takes ~30 seconds

---

## 📋 Step-by-Step: Deploy to Render

### Prerequisites
1. GitHub repository (you already have this!)
2. Render account (sign up at https://render.com - free)

---

## 🔧 Part 1: Deploy Backend (FastAPI)

### Step 1: Create Backend Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account (if not already)
4. Select your repository: `Powerlines-OP`
5. Configure service:
   - **Name**: `power-grid-backend` (or any name)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 2: Set Environment Variables

In Render dashboard, go to **Environment** section and add:

```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password_here
API_HOST=0.0.0.0
API_PORT=10000
```

**Note**: Neo4j is optional - you can leave Neo4j vars empty if not using it.

### Step 3: Deploy

Click **"Create Web Service"** and wait for deployment (5-10 minutes).

### Step 4: Get Backend URL

After deployment, you'll get a URL like:
```
https://power-grid-backend.onrender.com
```

**Save this URL** - you'll need it for frontend!

---

## 🎨 Part 2: Deploy Frontend (React)

### Step 1: Create Static Site on Render

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Select your repository: `Powerlines-OP`
3. Configure:
   - **Name**: `power-grid-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### Step 2: Set Environment Variables

Add these environment variables:

```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_API_URL=https://power-grid-backend.onrender.com
```

**Important**: Replace `power-grid-backend.onrender.com` with your actual backend URL!

### Step 3: Deploy

Click **"Create Static Site"** and wait for deployment.

### Step 4: Get Frontend URL

You'll get a URL like:
```
https://power-grid-frontend.onrender.com
```

**This is your live application!** 🎉

---

## 🔄 Alternative: Vercel for Frontend (Faster)

If you want faster frontend hosting, use Vercel:

### Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Import your repository: `Powerlines-OP`
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Add Environment Variables:
   ```
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   VITE_API_URL=https://power-grid-backend.onrender.com
   ```

7. Click **"Deploy"**

Vercel will give you a URL like:
```
https://power-grid-visualizer.vercel.app
```

**Benefits of Vercel:**
- Faster deployments
- Better CDN
- No spin-down delays
- Custom domains easier

---

## ⚙️ Configuration Updates Needed

### Update Backend CORS

Update `backend/main.py` to allow your frontend URL:

```python
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://localhost:5178,https://power-grid-frontend.onrender.com,https://power-grid-visualizer.vercel.app"
).split(",")
```

Or set `ALLOWED_ORIGINS` environment variable in Render:
```
ALLOWED_ORIGINS=https://power-grid-frontend.onrender.com,https://power-grid-visualizer.vercel.app
```

### Update Frontend API URL

Make sure `VITE_API_URL` in frontend environment variables points to your backend URL.

---

## 🔐 Environment Variables Summary

### Backend (Render)
```
NEO4J_URI=bolt://localhost:7687 (optional)
NEO4J_USER=neo4j (optional)
NEO4J_PASSWORD=your_password (optional)
API_HOST=0.0.0.0
API_PORT=10000
ALLOWED_ORIGINS=https://your-frontend-url.com
```

### Frontend (Render/Vercel)
```
VITE_MAPBOX_TOKEN=pk.your_mapbox_token
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## 🧪 Testing Your Deployment

1. **Test Backend:**
   - Visit: `https://your-backend.onrender.com/docs`
   - Should see Swagger API documentation
   - Test: `https://your-backend.onrender.com/health`

2. **Test Frontend:**
   - Visit your frontend URL
   - Map should load
   - Check browser console (F12) for errors

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend returns 503 or times out
- **Solution**: Free tier spins down after 15 min inactivity. First request takes ~30 seconds to wake up.

**Problem**: CORS errors
- **Solution**: Add frontend URL to `ALLOWED_ORIGINS` in backend environment variables.

**Problem**: Build fails
- **Solution**: Check build logs in Render dashboard. Ensure `requirements.txt` is correct.

### Frontend Issues

**Problem**: Map doesn't load
- **Solution**: Check `VITE_MAPBOX_TOKEN` is set correctly.

**Problem**: API calls fail
- **Solution**: Verify `VITE_API_URL` points to correct backend URL (with https://).

**Problem**: Build fails
- **Solution**: Check build logs. Ensure all dependencies are in `package.json`.

---

## 📊 Free Tier Limits

### Render
- **750 hours/month** (enough for 24/7)
- **512 MB RAM**
- **0.1 CPU**
- **Spins down after 15 min inactivity**

### Vercel
- **Unlimited** for personal projects
- **100 GB bandwidth/month**
- **No spin-down**

---

## 🎉 Success Checklist

- [ ] Backend deployed and accessible at `/docs`
- [ ] Frontend deployed and loads map
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] Mapbox token working
- [ ] API calls successful

---

## 🔄 Updating Your Deployment

After pushing to GitHub:
- **Render**: Automatically redeploys (watch dashboard)
- **Vercel**: Automatically redeploys (watch dashboard)

No manual steps needed! Just push to GitHub.

---

## 📝 Next Steps

1. Deploy backend to Render
2. Deploy frontend to Render (or Vercel)
3. Test everything works
4. Share your live URL! 🎊

---

**Need help?** Check Render/Vercel documentation or open an issue on GitHub.
