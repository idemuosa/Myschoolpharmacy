# backup_db.ps1 - Automated PostgreSQL Backup
$ProjectName = "pharmacy"
$BackupDir = "backups"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = "$BackupDir/$ProjectName`_$Timestamp.sql"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir
}

Write-Host "Starting database backup..." -ForegroundColor Cyan

# Use docker to run pg_dump if postgres is in docker
docker-compose exec -T db pg_dump -U pharmacy_user pharmacy_db > $BackupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup successful: $BackupFile" -ForegroundColor Green
} else {
    Write-Host "Backup failed. Ensure Docker and the 'db' service are running." -ForegroundColor Red
}
