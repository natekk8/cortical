# Cloudflare Pages Configuration
# GitHub Deployment

## Build Command
```
cd artifacts/cortical && pnpm install --ignore-scripts && pnpm run build
```

## Build Output Directory
```
artifacts/cortical/dist
```

## Root Directory
```
.
```

## Environment Variables (set in Cloudflare Dashboard)
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = eyJxx...
```

## Setup na Cloudflare Pages:

1. Przejdź do Cloudflare Dashboard
2. **Pages** → **Connect to Git** → Wybierz repo
3. **Build settings:**
   - Framework: None
   - Build command: `cd artifacts/cortical && pnpm install --ignore-scripts && pnpm run build`
   - Build output directory: `artifacts/cortical/dist`
   - Root directory: `.`
4. **Environment variables**:
   - VITE_SUPABASE_URL = [z Cloudflare Env Variables]
   - VITE_SUPABASE_ANON_KEY = [z Cloudflare Env Variables]
5. Deploy!

App będzie dostępna na: `https://your-project.pages.dev`
