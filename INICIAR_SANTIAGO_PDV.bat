@echo off
title Santiago Acai & Cia - Sistema PDV & ERP
color 0B
echo ========================================================
echo        SANTIAGO ACAI & CIA - INICIANDO SISTEMA PDV
echo ========================================================
echo.

:: 1. Verificar se o Node.js esta instalado no computador
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] O Node.js nao foi encontrado neste computador!
    echo.
    echo Para rodar localmente, baixe e instale o Node.js gratis em:
    echo https://nodejs.org/ (Escolha a versao recomendada LTS)
    echo.
    echo Depois de instalar o Node.js, execute este arquivo novamente.
    echo ========================================================
    pause
    exit /b
)

:: 2. Se for a primeira vez no computador novo, instala as dependencias
if not exist "node_modules" (
    echo [1/2] Instalando componentes do sistema pela primeira vez...
    echo Isso pode levar de 1 a 2 minutos. Aguarde...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar modulos. Verifique sua conexao de internet.
        pause
        exit /b
    )
)

echo [2/2] Abrindo o Terminal do Santiago Acai...
echo.
echo ========================================================
echo Sistema pronto! Abrindo no seu navegador em instantes...
echo DICA: Para fechar o sistema, basta fechar esta janela preta.
echo ========================================================
echo.

:: 3. Abre o navegador automaticamente apos 2 segundos
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

:: 4. Executa o servidor Vite com suporte a rede local
call npm run dev -- --host 0.0.0.0 --port 3000

pause
