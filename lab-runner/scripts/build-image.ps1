# PowerShell script to build the NISQ Linux Security Lab Image
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$dockerContext = Join-Path $scriptDir "..\docker\linux-security"

Write-Host "Building Docker image: nisqvanguard/linux-security:latest..." -ForegroundColor Cyan

docker build -t nisqvanguard/linux-security:latest -t nisq-linux-security-fundamentals:local $dockerContext

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully built nisqvanguard/linux-security:latest" -ForegroundColor Green
} else {
    Write-Error "Failed to build Docker image."
}
