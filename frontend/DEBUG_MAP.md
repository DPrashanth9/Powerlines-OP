# 🐛 Debugging Map Not Loading

## Quick Checks

### 1. Check Browser Console (Most Important!)

1. Open your browser
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Look for errors (red text)

**Common errors you might see:**
- "Mapbox token is missing!" → `.env` file not loaded
- "401 Unauthorized" → Invalid Mapbox token
- "Failed to fetch" → Backend not running
- Network errors → Check your internet connection

---

## Step-by-Step Debugging

### Step 1: Verify .env File

**Check if .env exists:**
```powershell
cd C:\Users\dpras\Downloads\Powerlines-new\frontend
Get-Content .env
```

**Should show:**
```
VITE_MAPBOX_TOKEN=pk.eyJ1IjoicHJhc2hhbnRoMDkiLCJhIjoiY21rZDQ1eW1tMDd2NzNlcTcxMGVreWM1MSJ9.kO15kPXsFajQZBODYDb5vw
VITE_API_URL=http://localhost:8000
```

**If not:**
- Make sure `.env` is in the `frontend` folder
- Check there are no extra spaces
- Check the file isn't named `.env.txt`

---

### Step 2: Restart Frontend Server

**Important:** After creating/changing `.env`, you MUST restart the server:

1. Stop the server (press `CTRL + C`)
2. Start it again:
   ```powershell
   npm run dev
   ```

**Vite needs to restart to load new environment variables!**

---

### Step 3: Check Mapbox Token in Browser

1. Open browser console (F12)
2. Type this and press Enter:
   ```javascript
   import.meta.env.VITE_MAPBOX_TOKEN
   ```

**Should show:** Your token (starts with `pk.eyJ...`)

**If it shows `undefined`:**
- `.env` file not loaded
- Server wasn't restarted after creating `.env`
- `.env` file is in wrong location

---

### Step 4: Test Mapbox Token

Open this URL in your browser:
```
https://api.mapbox.com/tokens/v2?access_token=YOUR_TOKEN
```

Replace `YOUR_TOKEN` with your actual token.

**Should show:** JSON with token information

**If it shows error:**
- Token might be invalid
- Check token at https://account.mapbox.com/access-tokens/

---

### Step 5: Check Backend is Running

1. Open: http://localhost:8000/api/health
2. Should show: `{"status": "healthy", "neo4j_connected": true}`

**If not:**
- Start backend: `cd backend && uvicorn main:app --reload`

---

### Step 6: Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for:
   - Requests to `api.mapbox.com` (should be successful - 200 status)
   - Requests to `localhost:8000/api/components` (should be successful)

**If you see 401 errors:**
- Invalid Mapbox token

**If you see CORS errors:**
- Backend CORS not configured correctly

---

## Common Issues & Solutions

### Issue: "Mapbox token is missing!" in console

**Solution:**
1. Verify `.env` file exists in `frontend` folder
2. Restart frontend server (`CTRL + C`, then `npm run dev`)
3. Check token format (no quotes, no spaces)

---

### Issue: Map shows blank/gray screen

**Possible causes:**
1. Invalid Mapbox token
2. Token not loaded (server not restarted)
3. Mapbox style URL issue
4. CSS not loading

**Solutions:**
1. Restart frontend server
2. Check browser console for errors
3. Try a different map style

---

### Issue: "401 Unauthorized" error

**Solution:**
- Your Mapbox token is invalid
- Get a new token from https://account.mapbox.com/access-tokens/
- Update `.env` file
- Restart server

---

### Issue: Map loads but no markers

**Solution:**
- Backend not running or not connected
- Check: http://localhost:8000/api/components
- Should return list of components

---

### Issue: Components load but map is blank

**Solution:**
- Check browser console for Mapbox errors
- Verify token is valid
- Check internet connection (Mapbox needs to load tiles)

---

## Quick Fix Script

Run this to verify everything:

```powershell
# Check .env exists
cd C:\Users\dpras\Downloads\Powerlines-new\frontend
if (Test-Path .env) {
    Write-Host "[OK] .env file exists" -ForegroundColor Green
    Get-Content .env
} else {
    Write-Host "[ERROR] .env file missing!" -ForegroundColor Red
}

# Check backend
Write-Host "`nChecking backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing
    Write-Host "[OK] Backend is running" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Backend not running!" -ForegroundColor Red
}
```

---

## Still Not Working?

1. **Share the console errors** - Screenshot of F12 console
2. **Check network tab** - Are Mapbox requests failing?
3. **Verify token** - Test it at mapbox.com
4. **Check server logs** - Any errors in the terminal?
