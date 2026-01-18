# Self-Hosted GitHub Actions Runner Setup Guide

This guide walks you through setting up a GitHub Actions self-hosted runner on your Windows 10 server.

## Prerequisites

Before you begin, ensure you have:
- ✅ Admin access to the GitHub repository
- ✅ Node.js installed (you already have this)
- ✅ Git installed and configured
- ✅ PowerShell 5.1 or later

## Step 1: Install PM2 (Process Manager)

PM2 keeps your Node.js applications running. Open PowerShell as Administrator:

```powershell
npm install -g pm2
npm install -g pm2-windows-startup

# Set PM2 to start on Windows boot
pm2-startup install
```

## Step 2: Download the GitHub Actions Runner

1. Go to your GitHub repository
2. Navigate to **Settings** → **Actions** → **Runners**
3. Click **New self-hosted runner**
4. Select **Windows** as the operating system
5. Follow the on-screen instructions to download

Or run these commands in PowerShell (replace with actual download link from GitHub):

```powershell
# Create a folder for the runner
mkdir C:\actions-runner
cd C:\actions-runner

# Download the runner (get latest link from GitHub)
Invoke-WebRequest -Uri https://github.com/actions/runner/releases/download/v2.XXX.X/actions-runner-win-x64-2.XXX.X.zip -OutFile actions-runner.zip

# Extract the runner
Expand-Archive -Path actions-runner.zip -DestinationPath .
```

## Step 3: Configure the Runner

Run the configuration script (get your token from GitHub → Settings → Actions → Runners):

```powershell
cd C:\actions-runner
.\config.cmd --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN
```

When prompted:
- **Runner group**: Press Enter for default
- **Runner name**: Enter a name like `e-file-server`
- **Labels**: Press Enter for default (or add custom labels)
- **Work folder**: Press Enter for default

## Step 4: Install Runner as Windows Service

This ensures the runner starts automatically on boot:

```powershell
cd C:\actions-runner
.\svc.cmd install
.\svc.cmd start
```

Verify the service is running:

```powershell
Get-Service actions.runner.*
```

## Step 5: Verify the Setup

1. Go to GitHub → **Settings** → **Actions** → **Runners**
2. Your runner should appear with a **green** status indicator
3. Make a small commit to trigger the workflow
4. Check the **Actions** tab to see it running

## Troubleshooting

### Runner shows as offline
```powershell
cd C:\actions-runner
.\svc.cmd stop
.\svc.cmd start
```

### Check runner logs
```powershell
Get-Content C:\actions-runner\_diag\Runner_*.log -Tail 50
```

### PM2 not starting apps
```powershell
pm2 list
pm2 logs e-file-backend
pm2 resurrect
```

## Environment Variables

Create a `.env` file in the backend folder if not exists. The CI/CD pipeline will preserve your existing `.env` file.

## Security Notes

> ⚠️ **Important**: Self-hosted runners execute any code pushed to your repository. 
> - Keep your repository **private** or carefully review all pull requests
> - Never store secrets in your code; use GitHub Secrets or local `.env` files
