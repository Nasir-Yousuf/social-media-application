Add-Type -AssemblyName System.Drawing
$filePath = Resolve-Path "client/public/racing/shadow_v12.jpg"
$bmp = New-Object System.Drawing.Bitmap($filePath.Path)
$c0 = $bmp.GetPixel(0, 0)
$c1 = $bmp.GetPixel(10, 10)
$cBotLeft = $bmp.GetPixel(10, $bmp.Height - 10)
$cCenter = $bmp.GetPixel([int]($bmp.Width / 2), [int]($bmp.Height / 2))
$cTaillight = $bmp.GetPixel([int]($bmp.Width / 2), [int]($bmp.Height * 0.48))
$bmp.Dispose()

Write-Output "Top-Left (0,0): R=$($c0.R), G=$($c0.G), B=$($c0.B)"
Write-Output "Top-Left (10,10): R=$($c1.R), G=$($c1.G), B=$($c1.B)"
Write-Output "Bottom-Left (10, H-10): R=$($cBotLeft.R), G=$($cBotLeft.G), B=$($cBotLeft.B)"
Write-Output "Center: R=$($cCenter.R), G=$($cCenter.G), B=$($cCenter.B)"
Write-Output "Taillight: R=$($cTaillight.R), G=$($cTaillight.G), B=$($cTaillight.B)"
