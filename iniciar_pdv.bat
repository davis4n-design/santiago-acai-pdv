@echo off
title Santiago Acai e Cia - Terminal PDV
color 5F

echo =======================================================
echo     SANTIAGO ACAI E CIA - INICIANDO SISTEMA PDV
echo =======================================================
echo.
echo Iniciando servidor local do caixa...

:: Inicia o servidor PowerShell em segundo plano (escondido)
start /B powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -File "%~dp0server.ps1"

:: Aguarda 1 segundo para o servidor subir
timeout /t 1 /nobreak >nul

echo Abrindo o Terminal PDV em tela de aplicativo...

:: Tenta abrir no Microsoft Edge em modo App (tela limpa de PDV)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000
    exit
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000
    exit
)

:: Se não tiver Edge, tenta Google Chrome em modo App
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000
    exit
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000
    exit
)

:: Caso padrão
start http://localhost:3000
exit
