# Preview the site locally before pushing to GitHub.
# Usage: double-click preview.cmd, or run `.\preview.ps1` from this folder.
# Then open http://localhost:4000 - the page reloads when you save a file.
# Press Ctrl+C in this window to stop.

param([switch]$NoBrowser)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Get-Command bundle -ErrorAction SilentlyContinue)) {
    $ruby = "D:\vg_outdev\Ruby33\bin"
    if (Test-Path $ruby) { $env:Path = "$ruby;$env:Path" }
    else { throw "Ruby not found. Install it from https://rubyinstaller.org (Ruby+Devkit 3.3)." }
}

# Native tools write progress to stderr; don't let PowerShell treat that as fatal.
$ErrorActionPreference = "Continue"

cmd /c "bundle check >nul 2>&1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing gems (first run only, can take several minutes)..."
    cmd /c "bundle install"
    if ($LASTEXITCODE -ne 0) { throw "bundle install failed" }
}

if (-not $NoBrowser) {
    Start-Job { Start-Sleep 8; Start-Process "http://localhost:4000" } | Out-Null
}
bundle exec jekyll serve --livereload
