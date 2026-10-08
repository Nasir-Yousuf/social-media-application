Add-Type -AssemblyName System.Drawing

function Convert-CarToTransparentPng($srcPath, $dstPath) {
    $src = New-Object System.Drawing.Bitmap((Resolve-Path $srcPath).Path)
    $dst = New-Object System.Drawing.Bitmap($src.Width, $src.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    $w = $src.Width
    $h = $src.Height

    # Lock bits for high-speed processing
    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $srcData = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $dstData = $dst.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    $bytes = [Math]::Abs($srcData.Stride) * $h
    $rgbValues = New-Object byte[] $bytes
    [System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $rgbValues, 0, $bytes)

    # BFS queue for flood-filling background from boundaries
    $visited = New-Object bool[] ($w * $h)
    $queue = New-Object System.Collections.Generic.Queue[int]

    # Helper: check if a pixel is backdrop (dark, or floor gray)
    # Backdrop in studio render:
    # 1. Top half: dark vignetted studio (brightness < 60)
    # 2. Bottom area: studio floor (neutral gray with low saturation: |R-G| < 12 and |G-B| < 15 and max < 140)
    # AND outside the car bounds
    function Is-Backdrop($x, $y) {
        $idx = ($y * $w + $x) * 4
        $b = $rgbValues[$idx]
        $g = $rgbValues[$idx + 1]
        $r = $rgbValues[$idx + 2]
        
        $max = [Math]::Max($r, [Math]::Max($g, $b))
        $min = [Math]::Min($r, [Math]::Min($g, $b))
        $diff = $max - $min

        # If top area and dark
        if ($y -lt $h * 0.7) {
            return ($max -lt 65 -and $diff -lt 25)
        }
        # If bottom area and neutral studio floor
        if ($y -ge $h * 0.85) {
            # Floor is neutral grey/dark
            return ($diff -lt 22 -and $max -lt 150)
        }
        # Sides
        if ($x -lt $w * 0.14 -or $x -gt $w * 0.86) {
            return ($diff -lt 25 -and $max -lt 120)
        }
        return ($max -lt 45 -and $diff -lt 20)
    }

    # Add outer borders to queue
    for ($x = 0; $x -lt $w; $x++) {
        $queue.Enqueue(0 * $w + $x)
        $visited[0 * $w + $x] = $true
        $queue.Enqueue(($h - 1) * $w + $x)
        $visited[($h - 1) * $w + $x] = $true
    }
    for ($y = 0; $y -lt $h; $y++) {
        $queue.Enqueue($y * $w + 0)
        $visited[$y * $w + 0] = $true
        $queue.Enqueue($y * $w + ($w - 1))
        $visited[$y * $w + ($w - 1)] = $true
    }

    while ($queue.Count -gt 0) {
        $curr = $queue.Dequeue()
        $cx = $curr % $w
        $cy = [Math]::Floor($curr / $w)

        if (Is-Backdrop $cx $cy) {
            # Set alpha to 0 in output buffer
            $rgbValues[($curr * 4) + 3] = 0

            # 4 neighbors
            $neighbors = @(
                @($cx + 1, $cy),
                @($cx - 1, $cy),
                @($cx, $cy + 1),
                @($cx, $cy - 1)
            )

            foreach ($n in $neighbors) {
                $nx = $n[0]
                $ny = $n[1]
                if ($nx -ge 0 -and $nx -lt $w -and $ny -ge 0 -and $ny -lt $h) {
                    $nIdx = $ny * $w + $nx
                    if (-not $visited[$nIdx]) {
                        $visited[$nIdx] = $true
                        $queue.Enqueue($nIdx)
                    }
                }
            }
        }
    }

    [System.Runtime.InteropServices.Marshal]::Copy($rgbValues, 0, $dstData.Scan0, $bytes)
    $src.UnlockBits($srcData)
    $dst.UnlockBits($dstData)
    $src.Dispose()

    $dst.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dst.Dispose()
    Write-Output "Created transparent PNG: $dstPath"
}

Convert-CarToTransparentPng "client/public/racing/shadow_v12.jpg" "client/public/racing/shadow_v12.png"
Convert-CarToTransparentPng "client/public/racing/street_phantom.jpg" "client/public/racing/street_phantom.png"
Convert-CarToTransparentPng "client/public/racing/neon_gt.jpg" "client/public/racing/neon_gt.png"
Convert-CarToTransparentPng "client/public/racing/cyber_cruiser.jpg" "client/public/racing/cyber_cruiser.png"
Convert-CarToTransparentPng "client/public/racing/thunder_rs.jpg" "client/public/racing/thunder_rs.png"
Convert-CarToTransparentPng "client/public/racing/apex_x.jpg" "client/public/racing/apex_x.png"
