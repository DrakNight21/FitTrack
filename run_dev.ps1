# FitTrack Development Launch Script

Write-Host "=========================================" -ForegroundColor Green
Write-Host "  FITTRACK - Modern Gym Management SaaS  " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

Write-Host ""
Write-Host "[1/2] Starting Django REST Backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python manage.py runserver 8000"

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting React + Vite Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "FitTrack is launching!" -ForegroundColor Green
Write-Host "Access the frontend at: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Django REST API at:     http://127.0.0.1:8000/api/" -ForegroundColor Yellow
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor White
Write-Host "  - Admin:   admin@fittrack.com / admin123" -ForegroundColor Gray
Write-Host "  - Trainer: alex@fittrack.com  / trainer123" -ForegroundColor Gray
Write-Host "  - Member:  rahul@example.com  / member123" -ForegroundColor Gray
