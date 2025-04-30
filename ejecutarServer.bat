@echo off
setlocal

:: Iniciar el servidor en puerto 8000
echo Iniciando servidor HTTP en el puerto 8000...

start "" cmd /c "python -m http.server 8000"

:: Esperar un momento para asegurarnos que el servidor ya arrancó
timeout /t 2 >nul

:: Abrir navegador automáticamente
start http://localhost:8000

pause