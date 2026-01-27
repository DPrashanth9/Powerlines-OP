# ⚡ Quick Deploy to Railway - Step by Step

## 🎯 Railway is Recommended Because:
- ✅ **Easiest setup** - Just connect GitHub
- ✅ **Free tier** - $5 credit/month
- ✅ **Auto-deploy** - Deploys on every push
- ✅ **Full-stack** - Deploy both frontend & backend
- ✅ **HTTPS included** - SSL certificates automatic

---

## 🚀 Step-by-Step Guide

### Step 1: Sign Up for Railway

1. Go to: https://railway.app/
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended - easiest)
4. Authorize Railway to access your repositories

---

### Step 2: Deploy Backend

1. **Create New Project**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Find and select: `Powerlines-OP`
   - Click **"Deploy Now"**

2. **Configure Backend Service**
   - Railway will auto-detect Python
   - Click on the service to configure
   - Go to **"Settings"** tab
   - Set **Root Directory** to: `backend`
   - Or leave it as root (Railway will detect `backend/`)

3. **Set Start Command**
   - Go to **"Settings"** → **"Deploy"**
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Railway will auto-detect this, but verify it's correct

4. **Add Environment Variables** (Optional - only if using Neo4j)
   - Go to **"Variables"** tab
   - Click **"New Variable"**
   - Add:
     ```
     NEO4J_URI=bolt://your-neo4j-instance
     NEO4J_USER=neo4j
     NEO4J_PASSWORD=your_password
     ```
   - **Note:** For map view, Neo4j is optional - you can skip this!

5. **Wait for Deployment**
   - Railway will automatically:
     - Install dependencies (`pip install -r requirements.txt`)
     - Start your server
   - Watch the logs to see progress
   - Wait for "Deployment successful"

6. **Get Backend URL**
   - Go to **"Settings"** → **"Networking"**
   - Copy the **"Public Domain"** URL
   - Example: `https://powerlines-backend-production.up.railway.app`
   - **Save this URL** - you'll need it for frontend!

---

### Step 3: Deploy Frontend

1. **Add New Service**
   - In your Railway project, click **"+ New"**
   - Select **"GitHub Repo"**
   - Choose the same repository: `Powerlines-OP`

2. **Configure Frontend Service**
   - Railway will detect Node.js
   - Go to **"Settings"** → **"Root Directory"**
   - Set to: `frontend`

3. **Set Build & Start Commands**
   - Go to **"Settings"** → **"Deploy"**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview` (or Railway's static file serving)

4. **Add Environment Variables** (IMPORTANT!)
   - Go to **"Variables"** tab
   - Click **"New Variable"**
   - Add:
     ```
     VITE_MAPBOX_TOKEN=pk.eyJ1IjoicHJhc2hhbnRoMDkiLCJhIjoiY21rZDQ1eW1tMDd2NzNlcTcxMGVreWM1MSJ9.kO15kPXsFajQZBODYDb5vw
     ```
   - Add another variable:
     ```
     VITE_API_URL=https://your-backend-url.up.railway.app
     ```
   - **Replace** `your-backend-url` with your actual backend URL from Step 2!

5. **Update Backend CORS** (IMPORTANT!)
   - Go back to your backend service
   - Go to **"Variables"** tab
   - Add:
     ```
     ALLOWED_ORIGINS=https://your-frontend-url.up.railway.app,http://localhost:5173
     ```
   - **Replace** `your-frontend-url` with your frontend URL (you'll get this after deployment)

6. **Wait for Deployment**
   - Railway will build your frontend
   - Watch the logs
   - Wait for "Deployment successful"

7. **Get Frontend URL**
   - Go to **"Settings"** → **"Networking"**
   - Copy the **"Public Domain"** URL
   - This is your live app URL! 🎉

---

### Step 4: Update CORS (After Getting Frontend URL)

1. **Go to Backend Service**
   - Click on your backend service
   - Go to **"Variables"** tab
   - Update `ALLOWED_ORIGINS`:
     ```
     ALLOWED_ORIGINS=https://your-frontend-url.up.railway.app,http://localhost:5173
     ```
   - Railway will auto-redeploy

---

## ✅ Testing Your Deployment

1. **Test Backend:**
   - Visit: `https://your-backend-url.up.railway.app/health`
   - Should see: `{"status": "ok"}`

2. **Test Frontend:**
   - Visit your frontend URL
   - Map should load
   - Power infrastructure should appear

---

## 🔧 Troubleshooting

### Backend Not Starting
- Check logs in Railway dashboard
- Verify `requirements.txt` is correct
- Check Python version (Railway uses Python 3.11 by default)

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` is correct in frontend variables
- Check CORS settings in backend
- Make sure backend URL includes `https://`

### CORS Errors
- Update `ALLOWED_ORIGINS` in backend variables
- Include your frontend URL
- Restart backend service

### Environment Variables Not Working
- Variables must be set in Railway dashboard
- For Vite: Variables must start with `VITE_`
- Restart service after adding variables

---

## 💰 Railway Pricing

- **Free Tier:** $5 credit/month
- **Hobby Plan:** $5/month (if you exceed free tier)
- **Pro Plan:** $20/month (for production apps)

**For this project:** Free tier should be enough!

---

## 🎉 You're Done!

Your app should now be live at your Railway frontend URL!

**Next Steps:**
- Share your live URL
- Add it to your README
- Test all features
- Monitor usage in Railway dashboard

---

## 📚 Railway Resources

- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app/

Good luck! 🚀
