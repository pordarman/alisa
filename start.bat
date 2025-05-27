@echo off
SETLOCAL EnableDelayedExpansion

:: Botu çalıştırma ve yeniden başlatma döngüsü
:RESTART_LOOP

:: Botu başlat
node Shard.js

:: Botun kapanmasını bekle ve döngüyü tekrarla
timeout /t 5 /nobreak >nul
goto RESTART_LOOP