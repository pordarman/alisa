@echo off

:loop
node shard.js
timeout /nobreak /t 5 > nul 2>&1
goto loop