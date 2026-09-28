@echo off
title Instalador - Santiago Acai e Cia PDV
color 5F

echo ===============================================================
echo        INSTALADOR OFICIAL - SANTIAGO ACAI E CIA (PDV)
echo ===============================================================
echo.
echo Este instalador ira configurar o sistema diretamente no computador.
echo Nao e necessario instalar Node.js nem programas adicionais!
echo.
echo Pressione qualquer tecla para iniciar a instalacao...
pause >nul

echo.
echo [1/3] Criando pasta do sistema em C:\SantiagoPDV...
if not exist "C:\SantiagoPDV" mkdir "C:\SantiagoPDV"

echo [2/3] Copiando arquivos do aplicativo...
xcopy "%~dp0dist" "C:\SantiagoPDV\dist" /E /I /Y /Q >nul
copy /Y "%~dp0server.ps1" "C:\SantiagoPDV\server.ps1" >nul
copy /Y "%~dp0INICIAR_PDV.bat" "C:\SantiagoPDV\INICIAR_PDV.bat" >nul
if exist "%~dp0dist\logo.ico" copy /Y "%~dp0dist\logo.ico" "C:\SantiagoPDV\logo.ico" >nul

echo [3/3] Criando atalho na Area de Trabalho...
powershell.exe -ExecutionPolicy Bypass -NoProfile -Command ^
  "$WshShell = New-Object -comObject WScript.Shell; ^
   $DesktopPath = [System.Environment]::GetFolderPath('Desktop'); ^
   $Shortcut = $WshShell.CreateShortcut(\"$DesktopPath\Santiago Acai - PDV.lnk\"); ^
   $Shortcut.TargetPath = 'C:\SantiagoPDV\INICIAR_PDV.bat'; ^
   $Shortcut.WorkingDirectory = 'C:\SantiagoPDV'; ^
   $Shortcut.Description = 'Santiago Acai e Cia - Terminal PDV'; ^
   if (Test-Path 'C:\SantiagoPDV\logo.ico') { $Shortcut.IconLocation = 'C:\SantiagoPDV\logo.ico,0' }; ^
   $Shortcut.Save()"

echo.
echo ===============================================================
echo          INSTALACAO CONCLUIDA COM SUCESSO!
echo ===============================================================
echo.
echo O icone "Santiago Acai - PDV" ja esta na Area de Trabalho!
echo.
set /p ABRIR="Deseja abrir o PDV agora? (S/N): "
if /i "%ABRIR%"=="S" (
    start "" "C:\SantiagoPDV\INICIAR_PDV.bat"
)
exit
