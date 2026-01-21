@echo off
echo ========================================
echo Starting Backend Server
echo ========================================
echo.
echo Checking Neo4j connection first...
echo.

cd /d %~dp0
python test_connection.py

echo.
echo ========================================
echo Starting FastAPI Server
echo ========================================
echo.
echo Server will be available at:
echo   - API: http://localhost:8000
echo   - Docs: http://localhost:8000/docs
echo.
echo Press CTRL+C to stop the server
echo.
echo ========================================
echo.

uvicorn main:app --reload

pause
