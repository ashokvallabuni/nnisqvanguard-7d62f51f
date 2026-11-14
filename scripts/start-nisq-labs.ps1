# NISQ Vanguard — Cyber Lab Runner Startup & Verification Script
param (
    [int]$Port = 8080,
    [string]$Secret = "nisq_lab_runner_secret_2026_dev"
)

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "NISQ VANGUARD CYBER LAB RUNNER INITIATING..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Check Docker Availability
Write-Host "[1/4] Checking Docker Engine status..." -ForegroundColor Yellow
$dockerWorking = $false
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerWorking = $true
    }
} catch {
    $dockerWorking = $false
}

if (-not $dockerWorking) {
    Write-Host "WARNING: Docker Desktop is not running or not responding." -ForegroundColor Red
    Write-Host "Checking if Docker Desktop can be launched..." -ForegroundColor Yellow
    
    $dockerPaths = @(
        "C:\Users\$env:USERNAME\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe",
        "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    )
    
    $launched = $false
    foreach ($path in $dockerPaths) {
        if (Test-Path $path) {
            Write-Host "Starting Docker Desktop from $path..." -ForegroundColor Cyan
            Start-Process $path
            $launched = $true
            break
        }
    }

    if ($launched) {
        Write-Host "Waiting up to 45 seconds for Docker engine to become ready..." -ForegroundColor Yellow
        for ($i = 1; $i -le 45; $i++) {
            Start-Sleep -Seconds 1
            try {
                $null = docker info 2>&1
                if ($LASTEXITCODE -eq 0) {
                    $dockerWorking = $true
                    Write-Host "Docker engine is now ONLINE!" -ForegroundColor Green
                    break
                }
            } catch {}
            Write-Host -NoNewline "."
        }
        Write-Host ""
    }
}

if (-not $dockerWorking) {
    Write-Host "------------------------------------------------------------" -ForegroundColor Red
    Write-Host "ERROR: Docker Desktop is not running." -ForegroundColor Red
    Write-Host "Please start Docker Desktop manually and run this script again." -ForegroundColor Red
    Write-Host "------------------------------------------------------------" -ForegroundColor Red
    exit 1
}

Write-Host "Docker Engine: READY" -ForegroundColor Green

# 2. Check and Build Lab Image
Write-Host "[2/4] Verifying NISQ Lab Image (nisqvanguard/linux-security:latest)..." -ForegroundColor Yellow
$imageFound = $false
try {
    $null = docker image inspect nisqvanguard/linux-security:latest 2>&1
    if ($LASTEXITCODE -eq 0) {
        $imageFound = $true
    }
} catch {
    $imageFound = $false
}

if (-not $imageFound) {
    Write-Host "Building Docker lab image from lab-runner/docker/linux-security..." -ForegroundColor Cyan
    $dockerContext = Join-Path $PSScriptRoot "..\lab-runner\docker\linux-security"
    docker build -t nisqvanguard/linux-security:latest -t nisq-linux-security-fundamentals:local $dockerContext
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to build Docker lab image." -ForegroundColor Red
        exit 1
    }
}
Write-Host "Lab Image: READY" -ForegroundColor Green

# 3. Configure Runner Environment
$env:LAB_RUNNER_PORT = "$Port"
$env:PORT = "$Port"
$env:LAB_RUNNER_HOST = "127.0.0.1"
$env:LAB_RUNNER_SECRET = "$Secret"
$env:LAB_RUNNER_ENABLED = "true"
$env:LAB_DOCKER_ENABLED = "true"
$env:LAB_DOCKER_IMAGE = "nisqvanguard/linux-security:latest"

# 4. Launch the Lab Runner Server
Write-Host "[3/4] Building and Launching NISQ Lab Runner on 127.0.0.1:$Port..." -ForegroundColor Yellow
$labRunnerDir = Join-Path $PSScriptRoot "..\lab-runner"

# Compile and start
Write-Host "Installing dependencies and building server..." -ForegroundColor Yellow
Start-Process -FilePath "npm.cmd" -ArgumentList "install" -WorkingDirectory $labRunnerDir -Wait -NoNewWindow
Start-Process -FilePath "npm.cmd" -ArgumentList "run", "build" -WorkingDirectory $labRunnerDir -Wait -NoNewWindow

Write-Host "[4/4] Starting server process..." -ForegroundColor Yellow
Start-Process -FilePath "npm.cmd" -ArgumentList "start" -WorkingDirectory $labRunnerDir -NoNewWindow

Write-Host "Waiting up to 15 seconds for server to become ready..." -ForegroundColor Yellow
$serverReady = $false
for ($i = 1; $i -le 15; $i++) {
    Start-Sleep -Seconds 1
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        $serverReady = $true
        break
    } catch {}
    Write-Host -NoNewline "."
}
Write-Host ""

if ($serverReady) {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/health" -Method Get -TimeoutSec 5
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "NISQ CYBER LAB RUNNER" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "Docker:    READY" -ForegroundColor Green
    Write-Host "Lab Image: READY" -ForegroundColor Green
    Write-Host "Runner:    READY" -ForegroundColor Green
    Write-Host "Endpoint:  http://127.0.0.1:$Port" -ForegroundColor Green
    Write-Host "Status:    ONLINE" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Running automated smoke and E2E tests..." -ForegroundColor Yellow
    Set-Location (Join-Path $PSScriptRoot "..")
    npm run test:labs:e2e
} else {
    Write-Host "ERROR: Runner failed to start or health check timed out. Verification failed." -ForegroundColor Red
    exit 1
}
