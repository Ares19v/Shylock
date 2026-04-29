@echo off
chcp 65001 >nul
color 0F
cls

echo.
echo     [97m███████╗██╗  ██╗██╗   ██╗██╗      ██████╗  ██████╗██╗  ██╗[0m
echo     [97m██╔════╝██║  ██║╚██╗ ██╔╝██║     ██╔═══██╗██╔════╝██║ ██╔╝[0m
echo     [97m███████╗███████║ ╚████╔╝ ██║     ██║   ██║██║     █████╔╝ [0m
echo     [97m╚════██║██╔══██║  ╚██╔╝  ██║     ██║   ██║██║     ██╔═██╗ [0m
echo     [97m███████║██║  ██║   ██║   ███████╗╚██████╔╝╚██████╗██║  ██╗[0m
echo     [97m╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝[0m
echo.
echo  ══════════════════════════════════════════════════════════════
echo   SHYLOCK UNINSTALL
echo  ══════════════════════════════════════════════════════════════
echo.
echo  This will remove the Python virtual environment, Node modules,
echo  and the build output. Your source code and .env will be kept.
echo.
echo  Press any key to continue, or close this window to cancel.
pause >nul

echo.
echo  Removing backend\venv...
if exist "backend\venv" (
    rmdir /s /q backend\venv
    echo  Done.
) else (
    echo  Not found — skipping.
)

echo  Removing frontend\node_modules...
if exist "frontend\node_modules" (
    rmdir /s /q frontend\node_modules
    echo  Done.
) else (
    echo  Not found — skipping.
)

echo  Removing frontend\dist...
if exist "frontend\dist" (
    rmdir /s /q frontend\dist
    echo  Done.
) else (
    echo  Not found — skipping.
)

echo.
echo  ══════════════════════════════════════════════════════════════
echo   UNINSTALL COMPLETE
echo   Run INSTALL.bat to reinstall.
echo  ══════════════════════════════════════════════════════════════
echo.
pause
