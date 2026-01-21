# 🔍 Debug Map Loading Issue - Quick Steps

## I can see your app is running but map isn't loading!

Your components are showing (great!), but the map says "Loading map...". Let's fix this:

---

## ⚡ Quick Check - Browser Console

**This is the most important step!**

1. **Press F12** in your browser
2. **Click the "Console" tab**
3. **Look for errors** (red text)

### What to look for:

#### ✅ If you see: "✅ Mapbox token loaded: pk.eyJ..."
- Token is loading correctly
- Problem is likely something else

#### ❌ If you see: "❌ Mapbox token is missing!"
- `.env` file not loaded
- **Solution:** Restart frontend server after creating `.env`

#### ❌ If you see: "401 Unauthorized" or "Invalid token"
- Token is wrong or invalid
- **Solution:** Check token at mapbox.com

#### ❌ If you see: "Failed to fetch" or network errors
- Mapbox API call failing
- Check internet connection

---

## 🔧 Fix 1: Restart Frontend Server

**Important:** After creating/changing `.env`, you MUST restart:

1. **Stop the server:**
   - In the terminal where `npm run dev` is running
   - Press `CTRL + C`

2. **Start again:**
   ```powershell
   cd C:\Users\dpras\Downloads\Powerlines-new\frontend
   npm run dev
   ```

3. **Refresh browser**

---

## 🔧 Fix 2: Check .env File Location

The `.env` file MUST be in the `frontend` folder:

```
✅ CORRECT: C:\Users\dpras\Downloads\Powerlines-new\frontend\.env
❌ WRONG:   C:\Users\dpras\Downloads\Powerlines-new\.env
❌ WRONG:   C:\Users\dpras\Downloads\Powerlines-new\frontend\src\.env
```

---

## 🔧 Fix 3: Verify .env Content

Open `.env` file and check it looks exactly like this:

```
VITE_MAPBOX_TOKEN=pk.eyJ1IjoicHJhc2hhbnRoMDkiLCJhIjoiY21rZDQ1eW1tMDd2NzNlcTcxMGVreWM1MSJ9.kO15kPXsFajQZBODYDb5vw
VITE_API_URL=http://localhost:8000
```

**Important:**
- No quotes around the token
- No spaces before/after `=`
- No extra lines at the top

---

## 🔧 Fix 4: Test Token in Browser Console

1. **Open browser console** (F12)
2. **Type this and press Enter:**
   ```javascript
   import.meta.env.VITE_MAPBOX_TOKEN
   ```

**Should show:** `"pk.eyJ1IjoicHJhc2hhbnRoMDki..."`

**If shows:** `undefined`
- `.env` file not loading
- Restart server

---

## 🔧 Fix 5: Check if mapbox-gl is Installed

In your terminal (where `npm run dev` is running), check if you see any errors about mapbox.

**If you see errors:**
```powershell
cd C:\Users\dpras\Downloads\Powerlines-new\frontend
npm install mapbox-gl
```

---

## 🔧 Fix 6: Clear Browser Cache

Sometimes browsers cache old code:

1. **Hard refresh:** Press `CTRL + SHIFT + R`
2. **Or:** Press `CTRL + F5`
3. **Or:** Clear browser cache and reload

---

## 📋 Debugging Checklist

- [ ] Pressed F12 and checked console for errors
- [ ] Restarted frontend server after creating/changing `.env`
- [ ] `.env` file is in `frontend` folder (not root)
- [ ] `.env` file has correct token (no quotes, no spaces)
- [ ] Browser console shows token: `import.meta.env.VITE_MAPBOX_TOKEN`
- [ ] Hard refreshed browser (CTRL + SHIFT + R)
- [ ] Checked network tab for failed requests

---

## 🆘 What Error Do You See?

**Please share:**
1. What you see in browser console (F12 → Console tab)
2. What happens when you type: `import.meta.env.VITE_MAPBOX_TOKEN`

This will help me give you the exact fix!
