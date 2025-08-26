@echo off
echo ===============================================
echo    TIKTOK LIVE RULETA - DEPLOYMENT SCRIPT
echo ===============================================
echo.

echo [1/4] Deteniendo contenedores existentes...
docker-compose down

echo.
echo [2/4] Construyendo nueva imagen...
docker-compose build --no-cache

echo.
echo [3/4] Iniciando servicios...
docker-compose up -d

echo.
echo [4/4] Mostrando estado de contenedores...
docker-compose ps

echo.
echo ===============================================
echo    DESPLIEGUE COMPLETADO
echo ===============================================
echo.
echo Accede a tu aplicacion en:
echo - Admin Panel: http://localhost:3000/admin
echo - Ruleta: http://localhost:3000/ruleta
echo.
echo Para ver logs: docker-compose logs -f
echo Para detener: docker-compose down
echo.

pause
