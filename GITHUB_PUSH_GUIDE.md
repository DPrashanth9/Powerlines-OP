# Guide: Push to New GitHub Repository

## Step-by-Step Instructions

### Prerequisites
- Git installed on your computer
- GitHub account
- All sensitive files removed/updated (already done)

---

## Step 1: Delete Old Repository (if exists)

1. Go to your GitHub account
2. Navigate to the old repository
3. Go to **Settings** → Scroll down to **Danger Zone**
4. Click **Delete this repository**
5. Confirm deletion

---

## Step 2: Create New Repository on GitHub

1. Go to [GitHub.com](https://github.com)
2. Click the **+** icon (top right) → **New repository**
3. Repository name: `power-grid-visualizer` (or your preferred name)
4. Description: `Interactive power grid visualization for Overland Park using React, TypeScript, and Mapbox GL JS`
5. Visibility: Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **Create repository**

---

## Step 3: Prepare Your Local Repository

Open PowerShell or Terminal in your project directory:

```powershell
# Navigate to your project
cd C:\Users\dpras\Downloads\Powerlines-new

# Remove old Git connection (if exists)
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue

# Initialize new Git repository
git init

# Add all files (respecting .gitignore)
git add .

# Check what will be committed (verify no sensitive files)
git status

# Create initial commit
git commit -m "Initial commit: Power Grid Visualizer"
```

---

## Step 4: Connect to New GitHub Repository

After creating the repository on GitHub, you'll see a page with setup instructions. Use these commands:

```powershell
# Add remote repository (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git

# Verify remote was added
git remote -v
```

---

## Step 5: Push to GitHub

```powershell
# Push to main branch
git branch -M main
git push -u origin main
```

If prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your GitHub password)
  - Generate token: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
  - Select scopes: `repo` (full control)
  - Copy token and use it as password

---

## Step 6: Verify Upload

1. Go to your GitHub repository page
2. Verify:
   - ✅ No `.md` files visible (except README.md if you keep it)
   - ✅ No `.env` files
   - ✅ No test files
   - ✅ No sensitive data
   - ✅ All source code is present

---

## Files That Will Be Pushed

✅ **Backend:**
- `backend/main.py`
- `backend/requirements.txt`
- `backend/env.example` (template, no real passwords)
- `backend/app/` (all Python source files)
- `backend/init_schema.py`

✅ **Frontend:**
- `frontend/src/` (all TypeScript/React source files)
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/vite.config.ts`
- `frontend/tsconfig.json`
- `frontend/index.html`

✅ **Root:**
- `.gitignore`
- `README.md` (if you want to keep it)

---

## Files That Will NOT Be Pushed (Protected by .gitignore)

❌ All `.md` files (except README.md)
❌ `.env` files
❌ `node_modules/`
❌ `__pycache__/`
❌ Test files
❌ Sensitive data
❌ IDE files
❌ Log files

---

## Troubleshooting

### Error: "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### Error: "failed to push some refs"
```powershell
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Want to update .gitignore after pushing?
```powershell
# Remove files from Git tracking (but keep locally)
git rm --cached -r node_modules/
git rm --cached *.md
git commit -m "Update .gitignore"
git push
```

---

## Next Steps After Pushing

1. Add a proper README.md (optional, but recommended)
2. Add repository description and topics on GitHub
3. Consider adding a LICENSE file
4. Set up GitHub Actions for CI/CD (optional)

---

## Security Checklist

Before pushing, verify:
- [ ] No passwords in `env.example`
- [ ] No API keys in code
- [ ] No personal information exposed
- [ ] `.gitignore` is comprehensive
- [ ] Test files excluded (if desired)
- [ ] Documentation files excluded

---

**You're all set! Your repository is now clean and ready for GitHub.**
