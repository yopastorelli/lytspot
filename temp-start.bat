@echo off
cd /d %~dp0
echo Iniciando servidor Astro diretamente...
npx astro dev --port 4321 --host
