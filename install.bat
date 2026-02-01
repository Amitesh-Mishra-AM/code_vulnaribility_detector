@echo off
echo Installing dependencies...
npm install --legacy-peer-deps > install.log 2>&1
echo Done.
