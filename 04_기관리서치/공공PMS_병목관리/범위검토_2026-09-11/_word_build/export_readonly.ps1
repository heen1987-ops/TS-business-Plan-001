$ErrorActionPreference = 'Stop'
$baseDir = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$taskTemp = Join-Path ([System.IO.Path]::GetTempPath()) ('pms_scope_render_' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $taskTemp | Out-Null
$files = @('Public_AI_PMS_미확정사항_검토표_v0.1.docx','Public_AI_PMS_1차개발범위_정의서_v0.1.docx')
$results = @()
$wordApp = $null
$activeDoc = $null
try {
    $wordApp = New-Object -ComObject Word.Application
    $wordApp.Visible = $false
    $wordApp.DisplayAlerts = 0
    $wordApp.AutomationSecurity = 3
    Write-Output 'Word 준비 완료'
    $num = 0
    foreach ($name in $files) {
        $num++
        $tempDoc = Join-Path $taskTemp ('document_' + $num + '.docx')
        Copy-Item -LiteralPath (Join-Path $baseDir $name) -Destination $tempDoc
        $folder = if ($num -eq 1) { 'decisions_v2' } else { 'scope_v2' }
        $renderDir = Join-Path $PSScriptRoot $folder
        New-Item -ItemType Directory -Path $renderDir -Force | Out-Null
        $tempPdf = Join-Path $taskTemp ('document_' + $num + '.pdf')
        Write-Output ('열기 시작 ' + $num)
        $activeDoc = $wordApp.Documents.Open($tempDoc, $false, $true, $false)
        Write-Output ('열기 완료 ' + $num)
        $activeDoc.Repaginate()
        $pages = $activeDoc.ComputeStatistics(2)
        Write-Output ('출력 시작 ' + $num + ' / ' + $pages + '쪽')
        $activeDoc.ExportAsFixedFormat($tempPdf, 17)
        Copy-Item -LiteralPath $tempPdf -Destination (Join-Path $renderDir 'word_export.pdf') -Force
        $results += [PSCustomObject]@{file=$name; directory=$renderDir; pages=$pages; pdf=(Join-Path $renderDir 'word_export.pdf'); renderer='Microsoft Word read-only copy'; sourceCopy=$tempDoc}
        $activeDoc.Close(0)
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($activeDoc)
        $activeDoc = $null
        Write-Output ('출력 완료 ' + $num)
    }
} finally {
    if ($null -ne $activeDoc) { try { $activeDoc.Close(0) } catch {} }
    if ($null -ne $wordApp) { try { $wordApp.Quit(0) } catch {} }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
$results | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'word_render_manifest.json') -Encoding utf8
$results | ConvertTo-Json -Depth 5
