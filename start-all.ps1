# TAI - Start All Services Script
# This script starts all required services automatically

Write-Host "Starting TAI Multi-tenant Platform..." -ForegroundColor Green
Write-Host ""

# Get the root directory of the project
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Project root: $rootDir" -ForegroundColor Cyan

$pythonExe = Join-Path $rootDir ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    Write-Host " Python virtual environment not found at $pythonExe" -ForegroundColor Red
    Write-Host "   Create it first: python -m venv .venv" -ForegroundColor Yellow
    exit 1
}
Write-Host " Using Python: $pythonExe" -ForegroundColor Cyan

# Check and start Docker Desktop if needed
Write-Host ""
Write-Host " Checking Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = $false

# Initial check
try {
    $output = & docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
        Write-Host " Docker is already running" -ForegroundColor Green
    }
} catch {
    # Docker command not found or failed
}

if (-not $dockerRunning) {
    Write-Host " Docker is not running. Starting Docker Desktop..." -ForegroundColor Yellow
    
    # Start Docker Desktop
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Write-Host " Launching Docker Desktop..." -ForegroundColor Cyan
        & $dockerPath
        Write-Host " Waiting for Docker daemon to initialize (60 seconds)..." -ForegroundColor Magenta
        
        # Wait for Docker to be ready - much longer timeout
        $maxAttempts = 60
        $attempt = 0
        while ($attempt -lt $maxAttempts) {
            Start-Sleep -Seconds 1
            $attempt++
            
            try {
                $output = & docker ps 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host " Docker is now ready!" -ForegroundColor Green
                    $dockerRunning = $true
                    break
                }
            } catch {
                # Still waiting
            }
            
            if (($attempt % 10) -eq 0) {
                Write-Host "   Waiting for daemon... ($attempt/$maxAttempts)" -ForegroundColor Gray
            }
        }
        
        if (-not $dockerRunning) {
            Write-Host ""
            Write-Host "  Docker daemon failed to initialize within 60 seconds." -ForegroundColor Red
            Write-Host ""
            Write-Host "  Troubleshooting steps:" -ForegroundColor Yellow
            Write-Host "  1. Ensure WSL2 is installed and enabled" -ForegroundColor Gray
            Write-Host "  2. Check Docker Desktop settings (Settings > Resources > WSL integration)" -ForegroundColor Gray
            Write-Host "  3. Try restarting Docker Desktop manually" -ForegroundColor Gray
            Write-Host "  4. Check if 'dockerDesktopLinuxEngine' is working properly" -ForegroundColor Gray
            Write-Host ""
            Write-Host "  Press any key to continue anyway, or Ctrl+C to exit..." -ForegroundColor Red
            Read-Host
        }
    } else {
        Write-Host " Docker Desktop not found at $dockerPath" -ForegroundColor Red
        Write-Host "   Please install Docker Desktop and try again." -ForegroundColor Red
        exit 1
    }
}

# Additional wait to ensure Docker daemon is fully ready to pull images
Write-Host ""
Write-Host " Giving Docker daemon extra time to fully initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Service 1: Docker Compose (Postgres, Redis, RabbitMQ)
Write-Host ""
Write-Host " Starting Docker Compose (Postgres, Redis, RabbitMQ)..." -ForegroundColor Yellow
$composePath = Join-Path $rootDir "services\api-gateway"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$composePath'; Write-Host 'Starting Docker Compose...' -ForegroundColor Cyan; docker-compose up" -WindowStyle Normal

# Wait for Docker services to start
Write-Host " Waiting 15 seconds for Docker services to initialize..." -ForegroundColor Magenta
Start-Sleep -Seconds 15

# Clean and reset database
Write-Host ""
Write-Host " Resetting database..." -ForegroundColor Yellow
$composePath = Join-Path $rootDir "services\api-gateway"

try {
    # Wait for Postgres to be fully ready
    Write-Host " Waiting for Postgres to be ready..." -ForegroundColor Cyan
    $maxAttempts = 30
    $attempt = 0
    $postgresReady = $false
    
    while ($attempt -lt $maxAttempts) {
        try {
            $output = & docker-compose -f "$composePath\docker-compose.yml" exec -T postgres pg_isready -U postgres 2>&1
            if ($LASTEXITCODE -eq 0) {
                $postgresReady = $true
                Write-Host " Postgres is ready!" -ForegroundColor Green
                break
            }
        } catch {
            # Still waiting, retry
        }
        
        Start-Sleep -Seconds 1
        $attempt++
        
        if (($attempt % 5) -eq 0) {
            Write-Host "   Still waiting for Postgres... ($attempt/$maxAttempts)" -ForegroundColor Gray
        }
    }
    
    if ($postgresReady) {
        # Drop existing database if it exists
        Write-Host " Dropping existing database..." -ForegroundColor Cyan
        & docker-compose -f "$composePath\docker-compose.yml" exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS api_gateway;" *>&1 | Out-Null
        
        # Create fresh database
        Write-Host " Creating fresh database..." -ForegroundColor Cyan
        & docker-compose -f "$composePath\docker-compose.yml" exec -T postgres psql -U postgres -c "CREATE DATABASE api_gateway;" *>&1 | Out-Null
        
        Write-Host " Database reset complete!" -ForegroundColor Green
        
        # Run migrations in two phases.
        # Phase 1 upgrades to 0008 so the alembic_version table exists.
        # Then widen version_num to support longer custom revision ids.
        # Phase 2 upgrades to head.
        Write-Host " Running database migrations..." -ForegroundColor Cyan
        Push-Location $composePath
        & $pythonExe -m alembic upgrade 0008_enforce_documents_rls
        if ($LASTEXITCODE -ne 0) {
            Pop-Location
            throw "Alembic upgrade to 0008_enforce_documents_rls failed."
        }

        & docker-compose -f "$composePath\docker-compose.yml" exec -T postgres psql -U postgres -d api_gateway -c "ALTER TABLE alembic_version ALTER COLUMN version_num TYPE VARCHAR(128);"
        if ($LASTEXITCODE -ne 0) {
            Pop-Location
            throw "Failed to widen alembic_version.version_num column."
        }

        & $pythonExe -m alembic upgrade head
        if ($LASTEXITCODE -ne 0) {
            Pop-Location
            throw "Alembic upgrade to head failed."
        }

        Pop-Location
        Write-Host " Migrations complete!" -ForegroundColor Green
    } else {
        Write-Host " Warning: Postgres did not become ready in time. Skipping database reset." -ForegroundColor Yellow
        Write-Host " You may need to manually run: alembic upgrade head" -ForegroundColor Yellow
    }
} catch {
    Write-Host " Warning: Could not reset database: $_" -ForegroundColor Yellow
    Write-Host " You may need to manually run: alembic upgrade head" -ForegroundColor Yellow
}

# Service 2: FastAPI Server
Write-Host ""
Write-Host " Starting FastAPI Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$composePath'; Write-Host 'Starting FastAPI server on http://127.0.0.1:8000' -ForegroundColor Cyan; & '$pythonExe' ./start_simple.py" -WindowStyle Normal

# Wait a bit for FastAPI to start
Start-Sleep -Seconds 3

# Service 3: Frontend
Write-Host ""
Write-Host " Starting Frontend..." -ForegroundColor Yellow
$frontendPath = Join-Path $rootDir "Fontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Starting Frontend on http://127.0.0.1:3000' -ForegroundColor Cyan; ./start.bat" -WindowStyle Normal

Write-Host ""
Write-Host " All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "  Service URLs:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://127.0.0.1:3000" -ForegroundColor White
Write-Host "   API Gateway: http://127.0.0.1:8000" -ForegroundColor White
Write-Host "   Database:  http://127.0.0.1:55432" -ForegroundColor White
Write-Host ""
Write-Host " Each service is running in its own terminal window." -ForegroundColor Gray
Write-Host "   Close each window to stop the respective service." -ForegroundColor Gray
Write-Host ""
