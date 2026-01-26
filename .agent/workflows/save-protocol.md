---
description: Save Protocol - Git push and crash recovery email
---

# Save Protocol

When this workflow is triggered, perform the following steps:

## 1. Git Save & Push

// turbo

```bash
git add -A
```

// turbo

```bash
git commit -m "Auto-save: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
```

// turbo

```bash
git push origin main
```

## 2. Crash Recovery (If git push fails or system error detected)

If any step fails, compose and send a recovery email to: **<nearmiss1193@gmail.com>**

### Email Template

```
Subject: [ANTIGRAVITY] Recovery Protocol - Lakeland Local

## System Status
- Last successful operation: [timestamp]
- Error encountered: [error details]

## Current Capabilities
- Development server: npm run dev (port 3000)
- Production build: npm run build
- Database: Neon PostgreSQL via Drizzle ORM
- AI: Gemini API for vibe summaries

## Project Location
C:\Users\nearm\.gemini\antigravity\scratch\lakeland-local-prod

## Recommended Next Steps
1. Check git status: `git status`
2. Verify remote: `git remote -v`
3. If auth issue: Re-authenticate with GitHub
4. If merge conflict: `git stash && git pull && git stash pop`
5. Resume work: `npm run dev`

## Recovery Commands
```powershell
cd C:\Users\nearm\.gemini\antigravity\scratch\lakeland-local-prod
git status
npm run dev
```

```

## 3. Confirmation
After successful push, log confirmation message with commit hash.
