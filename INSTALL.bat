@echo off
color 0B
echo ==================================================
echo         SHYLOCK PROJECT INSTALLATION
echo ==================================================
echo.

echo [1/2] Installing Backend Dependencies (Python)
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..
echo.

echo [2/2] Installing Frontend Dependencies (Node.js)
cd frontend
call npm install
cd ..
echo.

echo ==================================================
echo INSTALLATION COMPLETE
echo You can now use Run_Project.bat to start Shylock.
echo ==================================================
pause
