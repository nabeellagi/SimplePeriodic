@echo off

echo ===============================
echo  Zig WASM Build Script
echo ===============================

set SOURCE=econf.zig
set OUTPUT=dist\econf.wasm

if not exist dist (
    mkdir dist
)

echo Compiling %SOURCE% to %OUTPUT% ...

zig build-exe econf.zig ^
-target wasm32-freestanding ^
-O ReleaseSmall ^
-fno-entry ^
-rdynamic ^
-femit-bin=%OUTPUT%

if %ERRORLEVEL% neq 0 (
    echo.
    echo Build failed!
    exit /b %ERRORLEVEL%
)

echo.
echo Build successful!
echo Output: %OUTPUT%