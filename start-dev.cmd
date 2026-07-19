@echo off
REM Start the Vistral ERP project from the repository root.
REM Usage: double-click this file or run start-dev.cmd from any folder.
pushd "%~dp0"
npm run dev
popd
