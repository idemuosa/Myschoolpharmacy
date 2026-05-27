$backendPath = "C:/Users/sagacious wizzy/Desktop/my pharmacy pos/backend"
$nodeBackendPath = "C:/Users/sagacious wizzy/Desktop/my pharmacy pos/node_backend"
$pharmacyPath = "C:/Users/sagacious wizzy/Desktop/my pharmacy pos/pharmacy"

Write-Host "Starting Django Backend..."
Start-Process -FilePath "powershell.exe" -ArgumentList "-Command", "cd '$backendPath'; .\venv\Scripts\python.exe manage.py runserver 8000" -NoNewWindow

Write-Host "Starting Node Backend..."
Start-Process -FilePath "powershell.exe" -ArgumentList "-Command", "cd '$nodeBackendPath'; npm start" -NoNewWindow

Write-Host "Starting Frontend..."
Start-Process -FilePath "powershell.exe" -ArgumentList "-Command", "cd '$pharmacyPath'; npm run dev -- --port 3000 --host" -NoNewWindow
