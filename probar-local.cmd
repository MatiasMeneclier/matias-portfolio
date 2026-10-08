@echo off
setlocal
cd /d "%~dp0"
set "PORTFOLIO_NODE="
where node.exe >nul 2>nul
if not errorlevel 1 set "PORTFOLIO_NODE=node.exe"
if not defined PORTFOLIO_NODE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "PORTFOLIO_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not defined PORTFOLIO_NODE (
  echo No se encontro Node.js. Instala Node.js y vuelve a abrir esta ventana.
  pause
  exit /b 1
)
if not exist "node_modules\next\dist\bin\next" (
  echo Faltan las dependencias del proyecto. Ejecuta pnpm install en esta carpeta.
  pause
  exit /b 1
)
if /i "%~1"=="--check" (
  "%PORTFOLIO_NODE%" --version
  exit /b
)
echo Vista local: abre la direccion Local que muestre Next.js.
echo Mantene esta ventana abierta. Para detenerlo: Ctrl+C.
echo Los cambios de codigo se ven localmente sin publicarse en tu servidor.
echo El admin real usa la misma base de datos que el sitio publicado.
"%PORTFOLIO_NODE%" node_modules\next\dist\bin\next dev --hostname 127.0.0.1
set "PORTFOLIO_EXIT_CODE=%ERRORLEVEL%"
pause
exit /b %PORTFOLIO_EXIT_CODE%
