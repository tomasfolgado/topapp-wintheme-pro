Add-Type -AssemblyName System.Drawing

$src = "C:\topapp-wintheme-pro\por modulos\assets\folder_custom.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)
$w = $bmp.Width
$h = $bmp.Height

$c0 = $bmp.GetPixel(0, 0)
Write-Output "Pixel (0,0): R=$($c0.R), G=$($c0.G), B=$($c0.B), A=$($c0.A)"

# Create a 32bppArgb bitmap
$outBmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Background color is what's at (0,0)
$bgR = $c0.R
$bgG = $c0.G
$bgB = $c0.B

$minX = $w
$maxX = 0
$minY = $h
$maxY = 0

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $p = $bmp.GetPixel($x, $y)
        $diff = [Math]::Abs($p.R - $bgR) + [Math]::Abs($p.G - $bgG) + [Math]::Abs($p.B - $bgB)
        if ($diff -lt 15) {
            # Background
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $outBmp.SetPixel($x, $y, $p)
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$bmp.Dispose()

Write-Output "Content bounding box: min=($minX, $minY), max=($maxX, $maxY)"

if ($maxX -gt $minX -and $maxY -gt $minY) {
    # Add a 2px padding
    $pad = 2
    $minX = [Math]::Max(0, $minX - $pad)
    $minY = [Math]::Max(0, $minY - $pad)
    $maxX = [Math]::Min($w - 1, $maxX + $pad)
    $maxY = [Math]::Min($h - 1, $maxY + $pad)

    $cropW = $maxX - $minX + 1
    $cropH = $maxY - $minY + 1
    $cropRect = New-Object System.Drawing.Rectangle $minX, $minY, $cropW, $cropH
    $cropped = $outBmp.Clone($cropRect, $outBmp.PixelFormat)
    $cropped.Save("C:\topapp-wintheme-pro\por modulos\assets\folder_clean.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    Write-Output "Successfully saved folder_clean.png ($cropW x $cropH)"
}

$outBmp.Dispose()
