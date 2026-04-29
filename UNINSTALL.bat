@echo off
color 0C
echo ==================================================
echo         SHYLOCK PROJECT UNINSTALL
echo ==================================================
echo.
echo This will remove the Python virtual environment and Node modules.
echo Press any key to continue or close this window to cancel.
pause >nul

echo.
echo Removing backend/venv...
rmdir /s /q backend\venv

echo Removing frontend/node_modules...
rmdir /s /q frontend\node_modules

echo Removing frontend/dist...
rmdir /s /q frontend\dist

echo.
echo ==================================================
echo UNINSTALL COMPLETE
echo ==================================================
pause
