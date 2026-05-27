$WshShell = New-Object -ComObject WScript.Shell
$ShortcutPath = [System.IO.Path]::Combine([Environment]::GetFolderPath("Desktop"), "Josiah Pharmacy POS.lnk")
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "C:\Users\sagacious wizzy\Desktop\my pharmacy pos\PharmacyPOS.bat"
$Shortcut.WorkingDirectory = "C:\Users\sagacious wizzy\Desktop\my pharmacy pos\"
$Shortcut.IconLocation = "C:\Users\sagacious wizzy\Desktop\my pharmacy pos\pharmacy\public\favicon.ico"
$Shortcut.Save()
Write-Host "Desktop shortcut created!" -ForegroundColor Green
