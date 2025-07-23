# scripts/generate-pwa-icons.ps1
# Kairos PWA Icon Generator Script
# Author: Sankhadeep Banerjee
# Purpose: Generate placeholder PWA icons to fix manifest.json errors

param(
    [string]$ProjectRoot = ".",
    [string]$IconText = "K",
    [string]$PrimaryColor = "#3b82f6",
    [string]$SecondaryColor = "#1d4ed8"
)

Write-Host "KAIROS PWA ICON GENERATOR" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check if we're in the right directory
$currentPath = Get-Location
Write-Host "Current directory: $currentPath" -ForegroundColor Yellow

# Create icons directory
$iconsDir = Join-Path $ProjectRoot "public\images\icons"
Write-Host "Creating icons directory: $iconsDir" -ForegroundColor Yellow

if (!(Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null
    Write-Host "Created directory: $iconsDir" -ForegroundColor Green
} else {
    Write-Host "Directory already exists: $iconsDir" -ForegroundColor Green
}

# Define required icon sizes
$iconSizes = @(72, 96, 128, 144, 152, 192, 384, 512)

Write-Host "Generating icons for sizes: $($iconSizes -join ', ')" -ForegroundColor Yellow

# Check if ImageMagick is available
$imagemagickAvailable = $false
try {
    $null = Get-Command "magick" -ErrorAction Stop
    $imagemagickAvailable = $true
    Write-Host "ImageMagick found - will generate high-quality icons" -ForegroundColor Green
} catch {
    Write-Host "ImageMagick not found - will create simple colored squares" -ForegroundColor Yellow
    Write-Host "Install ImageMagick for better icons: https://imagemagick.org/script/download.php#windows" -ForegroundColor Gray
}

# Function to create simple colored square (fallback method)
function Create-SimpleIcon {
    param(
        [int]$Size,
        [string]$OutputPath,
        [string]$Text,
        [string]$BgColor,
        [string]$TextColor = "#FFFFFF"
    )
    
    # Create a simple HTML canvas approach using PowerShell and .NET
    Add-Type -AssemblyName System.Drawing
    
    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Set high quality rendering
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    
    # Convert hex color to Color object
    $bgColorObj = [System.Drawing.ColorTranslator]::FromHtml($BgColor)
    $textColorObj = [System.Drawing.ColorTranslator]::FromHtml($TextColor)
    
    # Fill background with gradient effect
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new($Size, $Size),
        $bgColorObj,
        [System.Drawing.ColorTranslator]::FromHtml($SecondaryColor)
    )
    
    $graphics.FillRectangle($brush, 0, 0, $Size, $Size)
    
    # Add text
    $fontSize = [int]($Size * 0.4)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush($textColorObj)
    
    # Center the text
    $stringFormat = New-Object System.Drawing.StringFormat
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $rect = New-Object System.Drawing.RectangleF(0, 0, $Size, $Size)
    $graphics.DrawString($Text, $font, $textBrush, $rect, $stringFormat)
    
    # Save the image
    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $font.Dispose()
    $textBrush.Dispose()
}

# Generate icons
$successCount = 0
$totalIcons = $iconSizes.Count

foreach ($size in $iconSizes) {
    $iconPath = Join-Path $iconsDir "icon-${size}x${size}.png"
    
    Write-Host "Generating ${size}x${size} icon..." -ForegroundColor Cyan
    
    try {
        if ($imagemagickAvailable) {
            # Use ImageMagick for high-quality icons
            $magickCmd = "magick -size ${size}x${size} gradient:$PrimaryColor-$SecondaryColor " +
                        "-pointsize $([int]($size * 0.4)) -fill white -gravity center " +
                        "-annotate +0+0 '$IconText' '$iconPath'"
            
            Invoke-Expression $magickCmd
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   Created with ImageMagick: icon-${size}x${size}.png" -ForegroundColor Green
                $successCount++
            } else {
                throw "ImageMagick failed"
            }
        } else {
            # Fallback to .NET Graphics
            Create-SimpleIcon -Size $size -OutputPath $iconPath -Text $IconText -BgColor $PrimaryColor
            Write-Host "   Created with .NET Graphics: icon-${size}x${size}.png" -ForegroundColor Green
            $successCount++
        }
    } catch {
        Write-Host "   Failed to create icon-${size}x${size}.png: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Generate additional PWA assets
Write-Host ""
Write-Host "Generating additional PWA assets..." -ForegroundColor Yellow

# Create favicon.ico (copy from 32x32 version)
$faviconPath = Join-Path $ProjectRoot "public\favicon.ico"
$icon32Path = Join-Path $iconsDir "icon-32x32.png"

if ($imagemagickAvailable) {
    try {
        # Create 32x32 icon first
        $magickCmd = "magick -size 32x32 gradient:$PrimaryColor-$SecondaryColor " +
                    "-pointsize 12 -fill white -gravity center " +
                    "-annotate +0+0 '$IconText' '$icon32Path'"
        Invoke-Expression $magickCmd
        
        # Convert to ICO
        $magickCmd = "magick '$icon32Path' '$faviconPath'"
        Invoke-Expression $magickCmd
        
        Write-Host "Created favicon.ico" -ForegroundColor Green
    } catch {
        Write-Host "Could not create favicon.ico: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Create apple-touch-icon.png (180x180)
$appleTouchIconPath = Join-Path $ProjectRoot "public\apple-touch-icon.png"
if ($imagemagickAvailable) {
    try {
        $magickCmd = "magick -size 180x180 gradient:$PrimaryColor-$SecondaryColor " +
                    "-pointsize 72 -fill white -gravity center " +
                    "-annotate +0+0 '$IconText' '$appleTouchIconPath'"
        Invoke-Expression $magickCmd
        
        Write-Host "Created apple-touch-icon.png" -ForegroundColor Green
    } catch {
        Write-Host "Could not create apple-touch-icon.png: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Summary
Write-Host ""
Write-Host "GENERATION SUMMARY" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "Successfully created: $successCount/$totalIcons icons" -ForegroundColor Green

if ($successCount -eq $totalIcons) {
    Write-Host "All PWA icons generated successfully!" -ForegroundColor Green
} elseif ($successCount -gt 0) {
    Write-Host "Some icons were created, but there were issues" -ForegroundColor Yellow
} else {
    Write-Host "No icons were created successfully" -ForegroundColor Red
}

# List created files
Write-Host ""
Write-Host "Created files:" -ForegroundColor Yellow
Get-ChildItem $iconsDir -Filter "*.png" | ForEach-Object {
    $fileSize = [math]::Round($_.Length / 1KB, 2)
    Write-Host "   $($_.Name) ($fileSize KB)" -ForegroundColor Gray
}

# Next steps
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Restart your development server: npm run dev" -ForegroundColor Gray
Write-Host "2. Check browser console - PWA icon errors should be resolved" -ForegroundColor Gray
Write-Host "3. Test PWA functionality in Chrome DevTools > Application > Manifest" -ForegroundColor Gray
Write-Host "4. Replace placeholder icons with professional designs when ready" -ForegroundColor Gray

# Instructions for professional icons
Write-Host ""
Write-Host "FOR PROFESSIONAL ICONS:" -ForegroundColor Yellow
Write-Host "- Use tools like Figma, Sketch, or Canva to design your Kairos logo" -ForegroundColor Gray
Write-Host "- Export as PNG with transparent background" -ForegroundColor Gray
Write-Host "- Use https://realfavicongenerator.net/ for comprehensive PWA icon generation" -ForegroundColor Gray
Write-Host "- Replace the generated placeholder icons with your professional designs" -ForegroundColor Gray

Write-Host ""
Write-Host "PWA Icon generation complete!" -ForegroundColor Green
Write-Host "Please restart your dev server to see the changes." -ForegroundColor Cyan