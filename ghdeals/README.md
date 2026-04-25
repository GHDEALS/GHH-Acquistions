# GH Deals — Wholesale Operating System

## Deploy to Vercel (10 minutes, free forever)

### Step 1 — Get the code on GitHub
1. Go to github.com → sign up or log in (free)
2. Click **"New repository"** → name it `gh-deals` → click **Create**
3. Download the project zip from Claude and unzip it
4. Open Terminal (Mac) or Command Prompt (Windows)
5. Run these commands:
   ```
   cd gh-deals
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/YOUR_USERNAME/gh-deals.git
   git push -u origin main
   ```

### Step 2 — Deploy on Vercel
1. Go to vercel.com → sign up with your GitHub account
2. Click **"Add New Project"**
3. Select your `gh-deals` repository
4. Leave all settings as default
5. Click **Deploy**

Done. Your site will be live at `gh-deals.vercel.app` in ~60 seconds.

### Step 3 — Every time you want to update the site
Just push to GitHub again and Vercel auto-deploys.

---

## What's in the app

| Module | What it does |
|--------|-------------|
| Deal Analyzer | AI-powered ARV, MAO, repairs, comps with Zillow/Redfin links |
| Deal History | Every saved deal with status tracking and PDF export |
| Seller Leads | Full pipeline (New → Contacted → Negotiating → Under Contract) |
| Cash Buyers | CRM with markets, price range, property type, contact log |

## Data
All data saves to your browser's localStorage — no database needed, no monthly fees.
