# scripts/dev/diagnose-imports.ps1
# Simple KAIROS Import Diagnostic Tool

Write-Host "KAIROS Import Diagnostic Tool" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Check if critical files exist
$files = @(
    "src\stores\auth\index.ts",
    "src\stores\ui\themeStore.tsx", 
    "src\components\ui\Modal\index.tsx",
    "src\app\AppProviders.tsx"
)

foreach ($file in $files) {
    Write-Host ""
    Write-Host "Checking: $file" -ForegroundColor Yellow
    
    if (Test-Path $file) {
        Write-Host "  EXISTS" -ForegroundColor Green
        
        $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
        if ($content) {
            # Check for exports
            if ($content -match "export default") {
                Write-Host "  Has DEFAULT export" -ForegroundColor Cyan
            }
            if ($content -match "export const|export function|export class") {
                Write-Host "  Has NAMED exports" -ForegroundColor Cyan
            }
            if ($content -match "export \{") {
                Write-Host "  Has DESTRUCTURED exports" -ForegroundColor Cyan
            }
            
            # Show first few export lines
            $exportLines = $content -split "`n" | Where-Object { $_ -match "^export" }
            if ($exportLines) {
                Write-Host "  Export lines found:" -ForegroundColor Gray
                foreach ($line in $exportLines[0..2]) {
                    Write-Host "    $($line.Trim())" -ForegroundColor Gray
                }
            }
        }
    } else {
        Write-Host "  MISSING" -ForegroundColor Red
    }
}

# Show AppProviders imports
Write-Host ""
Write-Host "AppProviders.tsx imports:" -ForegroundColor Yellow
if (Test-Path "src\app\AppProviders.tsx") {
    $content = Get-Content "src\app\AppProviders.tsx" -Raw
    $importLines = $content -split "`n" | Where-Object { $_ -match "import.*@/" }
    foreach ($line in $importLines) {
        Write-Host "  $($line.Trim())" -ForegroundColor Gray
    }
} else {
    Write-Host "  AppProviders.tsx not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Done! Check the exports vs imports above." -ForegroundColor Green