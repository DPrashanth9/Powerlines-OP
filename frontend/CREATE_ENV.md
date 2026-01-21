# 🚀 Create .env File - Quick Guide

## Your Mapbox Token is Ready!

## Steps to Create .env File:

### Option 1: Using Notepad (Easiest)

1. **Navigate to the frontend folder:**
   ```
   C:\Users\dpras\Downloads\Powerlines-new\frontend
   ```

2. **Right-click** in the folder → **New** → **Text Document**

3. **Name it:** `.env`
   - Important: Make sure it's `.env` NOT `.env.txt`
   - If Windows asks about changing the extension, click "Yes"

4. **Open** the `.env` file with Notepad

5. **Paste this content:**
   ```
   VITE_MAPBOX_TOKEN=pk.eyJ1IjoicHJhc2hhbnRoMDkiLCJhIjoiY21rZDQ1eW1tMDd2NzNlcTcxMGVreWM1MSJ9.kO15kPXsFajQZBODYDb5vw
   VITE_API_URL=http://localhost:8000
   ```

6. **Save** the file (Ctrl+S)

7. **Close** Notepad

---

### Option 2: Using PowerShell

Open PowerShell in the `frontend` folder and run:

```powershell
cd C:\Users\dpras\Downloads\Powerlines-new\frontend

@"
VITE_MAPBOX_TOKEN=pk.eyJ1IjoicHJhc2hhbnRoMDkiLCJhIjoiY21rZDQ1eW1tMDd2NzNlcTcxMGVreWM1MSJ9.kO15kPXsFajQZBODYDb5vw
VITE_API_URL=http://localhost:8000
"@ | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
```

---

## ✅ Verify .env File Created

After creating the file, verify it exists:

```powershell
cd C:\Users\dpras\Downloads\Powerlines-new\frontend
Get-Content .env
```

You should see:
```
VITE_MAPBOX_TOKEN=pk.eyJ1IjoicHJhc2hhbnRoMDkiLCJhIjoiY21rZDQ1eW1tMDd2NzNlcTcxMGVreWM1MSJ9.kO15kPXsFajQZBODYDb5vw
VITE_API_URL=http://localhost:8000
```

---

## 🎯 Next Steps After Creating .env

1. **Install dependencies** (if not done):
   ```powershell
   cd C:\Users\dpras\Downloads\Powerlines-new\frontend
   npm install
   ```

2. **Make sure backend is running:**
   ```powershell
   cd C:\Users\dpras\Downloads\Powerlines-new\backend
   uvicorn main:app --reload
   ```

3. **Start frontend:**
   ```powershell
   cd C:\Users\dpras\Downloads\Powerlines-new\frontend
   npm run dev
   ```

4. **Open browser:** http://localhost:5173

---

## 📝 File Location

Your `.env` file should be here:
```
C:\Users\dpras\Downloads\Powerlines-new\frontend\.env
```

---

## ⚠️ Important Notes

- The `.env` file should be in the `frontend` folder, NOT the root folder
- Make sure there are no extra spaces or quotes around the token
- After creating/changing `.env`, restart the frontend server

---

## 🎉 You're All Set!

Once the `.env` file is created, you're ready to run the app!
