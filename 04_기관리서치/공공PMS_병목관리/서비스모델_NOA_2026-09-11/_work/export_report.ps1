$ErrorActionPreference = 'Stop'
$baseDir = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$taskTemp = Join-Path ([System.IO.Path]::GetTempPath()) ('noa_model_render_' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $taskTemp | Out-Null
$name = 'NOA_기반_공공PMS_서비스모델_검토서_v0.1.docx'
$renderDir = Join-Path $PSScriptRoot 'qa_final'
New-Item -ItemType Directory -Path $renderDir -Force | Out-Null
$wordApp = $null
$activeDoc = $null
try {
    $wordApp = New-Object -ComObject Word.Application
    $wordApp.Visible = $false
    $wordApp.DisplayAlerts = 0
    $wordApp.AutomationSecurity = 3
    $wordApp.Options.PrintBackground = $false
    $tempDoc = Join-Path $taskTemp 'report.docx'
    Copy-Item -LiteralPath (Join-Path $baseDir $name) -Destination $tempDoc
    $tempPdf = Join-Path $taskTemp 'report.pdf'
    $activeDoc = $wordApp.Documents.Open($tempDoc, $false, $true, $false)
    $activeDoc.Repaginate()
    $pages = $activeDoc.ComputeStatistics(2)
    $activeDoc.ExportAsFixedFormat($tempPdf, 17)
    if (-not (Test-Path -LiteralPath $tempPdf)) { throw 'Word PDF 생성 실패' }
    Copy-Item -LiteralPath $tempPdf -Destination (Join-Path $renderDir 'word_export.pdf') -Force
    $result = [PSCustomObject]@{file=$name; directory=$renderDir; pages=$pages; pdf=(Join-Path $renderDir 'word_export.pdf'); renderer='Microsoft Word read-only copy'}
    $result | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'word_render_manifest.json') -Encoding utf8
    $result | ConvertTo-Json -Depth 5
} finally {
    if ($null -ne $activeDoc) { try { $activeDoc.Close(0) } catch {} }
    if ($null -ne $wordApp) { try { $wordApp.Quit(0) } catch {} }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
