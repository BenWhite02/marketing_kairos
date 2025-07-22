# scripts/dev/fix-icon-imports.ps1
# Simple PowerShell script to fix DuplicateIcon import issue

param(
    [switch]$DryRun = $false,
    [string]$SourcePath = "src"
)

Write-Host "KAIROS Icon Import Fixer" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Get all TypeScript/TSX files
$files = Get-ChildItem -Path $SourcePath -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | Where-Object { 
    $_.FullName -notmatch "node_modules" -and 
    $_.FullName -notmatch "\.d\.ts$" -and
    $_.FullName -notmatch "build" -and
    $_.FullName -notmatch "dist"
}

$totalFiles = $files.Count
$fixedFiles = 0

Write-Host "Found $totalFiles source files to check" -ForegroundColor Green

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace((Get-Location).Path, "").TrimStart('\', '/')
    
    try {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
        
        if ($content -match "DuplicateIcon") {
            Write-Host "Found DuplicateIcon in: $relativePath" -ForegroundColor Yellow
            
            if (-not $DryRun) {
                # Fix the import statement
                $newContent = $content -replace "\bDuplicateIcon\b", "DocumentDuplicateIcon"
                
                Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
                Write-Host "  Fixed DuplicateIcon -> DocumentDuplicateIcon" -ForegroundColor Green
                $fixedFiles++
            } else {
                Write-Host "  Would fix: DuplicateIcon -> DocumentDuplicateIcon" -ForegroundColor Yellow
            }
        }
    }
    catch {
        Write-Warning "Could not process file: $relativePath"
    }
}

# Summary
Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "Total files checked: $totalFiles" -ForegroundColor White
Write-Host "Files with DuplicateIcon: $fixedFiles" -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "`nDRY RUN MODE - No files were modified" -ForegroundColor Cyan
    Write-Host "Run without -DryRun to apply fixes" -ForegroundColor Yellow
} else {
    if ($fixedFiles -gt 0) {
        Write-Host "`nFixed $fixedFiles files" -ForegroundColor Green
        Write-Host "You can now run 'npm run dev' to test" -ForegroundColor Green
    } else {
        Write-Host "`nNo DuplicateIcon issues found" -ForegroundColor Green
    }
}

Write-Host "`nDone!" -ForegroundColor Green