# ============================================================
#  Genera el favicon.ico de marca (reloj DWM) y crea un acceso
#  directo en el Escritorio para lanzar el frente Razor.
# ============================================================
Add-Type -AssemblyName System.Drawing

$root   = "C:\Users\rrsg_\OneDrive\Escritorio\UNPHU\Electiva 2 - Programacion Web"
$icoPath = Join-Path $root "RelojRazor\wwwroot\favicon.ico"

# --- 1) Dibujar el icono 256x256 -----------------------------------------
$size = 256
$bmp  = New-Object System.Drawing.Bitmap($size, $size)
$g    = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::Transparent)

function New-RoundedRect($x, $y, $w, $h, $r) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $path.AddArc($x,          $y,          $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y,          $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0,   90)
    $path.AddArc($x,          $y + $h - $d, $d, $d, 90,  90)
    $path.CloseFigure()
    return $path
}

# Colores de la marca
$ink       = [System.Drawing.Color]::FromArgb(255, 17, 17, 16)
$dial      = [System.Drawing.Color]::FromArgb(255, 26, 25, 23)
$dialEdge  = [System.Drawing.Color]::FromArgb(255, 58, 56, 53)
$pale      = [System.Drawing.Color]::FromArgb(255, 245, 236, 213)

# Pincel dorado con degradado (C9A84C -> B8922A)
$goldRect  = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
$gold      = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
                $goldRect,
                [System.Drawing.Color]::FromArgb(255, 201, 168, 76),
                [System.Drawing.Color]::FromArgb(255, 184, 146, 42),
                45.0)

# Fondo redondeado (tinta)
$bg = New-RoundedRect 0 0 256 256 56
$inkBrush = New-Object System.Drawing.SolidBrush($ink)
$g.FillPath($inkBrush, $bg)

# Corona de la relojeria (arriba)
$crown = New-RoundedRect 116 16 24 28 6
$g.FillPath($gold, $crown)

# Bisel exterior (aro dorado)
$bezelPen = New-Object System.Drawing.Pen($gold, 12)
$g.DrawEllipse($bezelPen, 40, 48, 176, 176)

# Esfera
$dialBrush = New-Object System.Drawing.SolidBrush($dial)
$g.FillEllipse($dialBrush, 56, 64, 144, 144)
$dialPen = New-Object System.Drawing.Pen($dialEdge, 4)
$g.DrawEllipse($dialPen, 56, 64, 144, 144)

# Marcadores 12 / 6 / 9 / 3
$g.FillPath($gold, (New-RoundedRect 122 72  12 20 4))
$g.FillPath($gold, (New-RoundedRect 122 180 12 20 4))
$g.FillPath($gold, (New-RoundedRect 64  130 20 12 4))
$g.FillPath($gold, (New-RoundedRect 172 130 20 12 4))

# Manecillas
$horaPen = New-Object System.Drawing.Pen($gold, 10)
$horaPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$horaPen.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawLine($horaPen, 128, 136, 128, 92)

$minPen = New-Object System.Drawing.Pen($pale, 9)
$minPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$minPen.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawLine($minPen, 128, 136, 164, 152)

# Eje central
$g.FillEllipse($gold, 118, 126, 20, 20)

$g.Dispose()

# --- 2) Guardar como .ico (envolviendo un PNG de 256px) ------------------
$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray()
$ms.Dispose()
$bmp.Dispose()

$icoStream = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($icoStream)
$bw.Write([UInt16]0)            # reservado
$bw.Write([UInt16]1)            # tipo = icono
$bw.Write([UInt16]1)            # cantidad de imagenes
$bw.Write([Byte]0)             # ancho  (0 = 256)
$bw.Write([Byte]0)             # alto   (0 = 256)
$bw.Write([Byte]0)             # paleta
$bw.Write([Byte]0)             # reservado
$bw.Write([UInt16]1)            # planos
$bw.Write([UInt16]32)           # bits por pixel
$bw.Write([UInt32]$png.Length)  # tamano de la imagen
$bw.Write([UInt32]22)           # offset (6 + 16)
$bw.Write($png)
$bw.Flush()
[System.IO.File]::WriteAllBytes($icoPath, $icoStream.ToArray())
$bw.Dispose()
Write-Host "OK -> icono creado en: $icoPath"

# --- 3) Crear el acceso directo en el Escritorio -------------------------
$desktop = [Environment]::GetFolderPath('Desktop')
$lnkPath = Join-Path $desktop "Iniciar DWM Razor.lnk"

$ws  = New-Object -ComObject WScript.Shell
$lnk = $ws.CreateShortcut($lnkPath)
$lnk.TargetPath       = Join-Path $root "Iniciar DWM Razor.bat"
$lnk.WorkingDirectory = $root
$lnk.IconLocation     = "$icoPath,0"
$lnk.Description       = "Dominican Watch Men - Razor Pages"
$lnk.WindowStyle      = 1
$lnk.Save()
Write-Host "OK -> acceso directo creado en: $lnkPath"
