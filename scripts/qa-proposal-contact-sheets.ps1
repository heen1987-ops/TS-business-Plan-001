$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$taskRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$taskManifest=Get-Content -LiteralPath (Join-Path $taskRoot 'src/proposal-diagram-assets.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$taskOutput=Join-Path $taskRoot 'qa-output/diagram-contact-sheets'
[IO.Directory]::CreateDirectory($taskOutput) | Out-Null
$taskFont=[Drawing.Font]::new('Malgun Gothic',20,[Drawing.FontStyle]::Bold)
$taskBrush=[Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(30,55,75))
foreach($taskGroup in ($taskManifest.assets | Group-Object id)){
 $taskCanvas=[Drawing.Bitmap]::new(3344,1998)
 $taskGraphics=[Drawing.Graphics]::FromImage($taskCanvas)
 $taskGraphics.Clear([Drawing.Color]::White)
 $taskGraphics.InterpolationMode=[Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $taskIndex=0
 foreach($taskAsset in $taskGroup.Group){
  $taskX=($taskIndex%2)*1672
  $taskY=[Math]::Floor($taskIndex/2)*999
  $taskGraphics.DrawString(($taskAsset.id+' / '+$taskAsset.type),$taskFont,$taskBrush,$taskX+16,$taskY+8)
  $taskSource=Join-Path $taskRoot ('public/'+$taskAsset.path)
  $taskImage=[Drawing.Image]::FromFile($taskSource)
  $taskGraphics.DrawImage($taskImage,[Drawing.Rectangle]::new($taskX,$taskY+50,1672,941))
  $taskImage.Dispose()
  $taskIndex++
 }
 $taskCanvas.Save((Join-Path $taskOutput ($taskGroup.Name+'.png')),[Drawing.Imaging.ImageFormat]::Png)
 $taskGraphics.Dispose()
 $taskCanvas.Dispose()
}
$taskFont.Dispose()
$taskBrush.Dispose()
Write-Output ('검수 전용 contact sheet '+($taskManifest.assets.Count/4)+'개. 납품 PNG 원본 변경 없음.')
