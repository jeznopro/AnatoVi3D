@echo off
echo ==============================================
echo        KHOI DONG ANATOVI 3D (SERVER)
echo ==============================================
echo Dang khoi dong may chu cuc bo tai cong 8000...
echo.
echo Vui long KHONG TAT cua so mau den nay trong luc su dung app!
echo.

:: Mo trinh duyet tu dong
start http://localhost:8000

:: Chay server bang Python
python -m http.server 8000
