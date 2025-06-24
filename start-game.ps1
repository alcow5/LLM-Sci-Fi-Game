# LLM Sci-Fi Game Service Manager (Minimal Version)
param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "status")]
    [string]$Action = "start"
)

$FrontendPort = 3000
$BackendPort = 5000
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Test-Port {
    param([int]$Port)
    $tcp = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $tcp -ne $null
}

function Get-ProcessByPort {
    param([int]$Port)
    $tcp = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($tcp) { return Get-Process -Id $tcp.OwningProcess -ErrorAction SilentlyContinue }
    return $null
}

function Start-Frontend {
    if (Test-Port $FrontendPort) {
        Write-Host "Frontend already running on port $FrontendPort"
        return
    }
    Set-Location $ProjectRoot
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
    Start-Sleep -Seconds 2
    if (Test-Port $FrontendPort) {
        Write-Host "Frontend started on port $FrontendPort"
    } else {
        Write-Host "Failed to start frontend"
    }
}

function Start-Backend {
    if (Test-Port $BackendPort) {
        Write-Host "Backend already running on port $BackendPort"
        return
    }
    Set-Location $ProjectRoot
    Start-Process -FilePath "python" -ArgumentList "backend/app.py" -WindowStyle Hidden
    Start-Sleep -Seconds 2
    if (Test-Port $BackendPort) {
        Write-Host "Backend started on port $BackendPort"
    } else {
        Write-Host "Failed to start backend"
    }
}

function Stop-Frontend {
    $proc = Get-ProcessByPort $FrontendPort
    if ($proc) {
        Stop-Process -Id $proc.Id -Force
        Write-Host "Frontend stopped"
    } else {
        Write-Host "Frontend not running"
    }
}

function Stop-Backend {
    $proc = Get-ProcessByPort $BackendPort
    if ($proc) {
        Stop-Process -Id $proc.Id -Force
        Write-Host "Backend stopped"
    } else {
        Write-Host "Backend not running"
    }
}

function Show-Status {
    if (Test-Port $FrontendPort) {
        Write-Host "Frontend running on port $FrontendPort"
    } else {
        Write-Host "Frontend not running"
    }
    if (Test-Port $BackendPort) {
        Write-Host "Backend running on port $BackendPort"
    } else {
        Write-Host "Backend not running"
    }
}

switch ($Action) {
    "start" {
        Start-Backend
        Start-Frontend
    }
    "stop" {
        Stop-Frontend
        Stop-Backend
    }
    "status" {
        Show-Status
    }
} 