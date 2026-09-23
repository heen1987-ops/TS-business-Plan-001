param([int]$OnlyDocument = 0)
$ErrorActionPreference = 'Stop'
$baseDir = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$taskTemp = Join-Path ([System.IO.Path]::GetTempPath()) ('pms_rfp_render_' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $taskTemp | Out-Null
$files = @('공공_정보화사업_AI_이행관리_제안요청서_v0.1.docx','공공_정보화사업_테일러링_내역서_v0.1.docx')
$results = @()
$wordApp = $null
$activeDoc = $null
try {
    $num = 0
    foreach ($name in $files) {
        $num++
        if ($OnlyDocument -ne 0 -and $num -ne $OnlyDocument) { continue }
        $wordApp = New-Object -ComObject Word.Application
        $wordApp.Visible = $false
        $wordApp.DisplayAlerts = 0
        $wordApp.AutomationSecurity = 3
        $wordApp.Options.PrintBackground = $false
        Write-Output 'Word 준비 완료'
        $tempDoc = Join-Path $taskTemp ('document_' + $num + '.docx')
        Copy-Item -LiteralPath (Join-Path $baseDir $name) -Destination $tempDoc
        $folder = if ($num -eq 1) { 'rfp_final' } else { 'tailoring_final' }
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
        for ($attempt = 0; $attempt -lt 20 -and -not (Test-Path -LiteralPath $tempPdf); $attempt++) { Start-Sleep -Milliseconds 250 }
        if (-not (Test-Path -LiteralPath $tempPdf)) { throw ('Word PDF 생성 실패: ' + $name) }
        Copy-Item -LiteralPath $tempPdf -Destination (Join-Path $renderDir 'word_export.pdf') -Force
        $results += [PSCustomObject]@{file=$name; directory=$renderDir; pages=$pages; pdf=(Join-Path $renderDir 'word_export.pdf'); renderer='Microsoft Word read-only copy'; sourceCopy=$tempDoc}
        $activeDoc.Close(0)
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($activeDoc)
        $activeDoc = $null
        $wordApp.Quit(0)
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($wordApp)
        $wordApp = $null
        Write-Output ('출력 완료 ' + $num)
    }
} finally {
    if ($null -ne $activeDoc) { try { $activeDoc.Close(0) } catch {} }
    if ($null -ne $wordApp) { try { $wordApp.Quit(0) } catch {} }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
if ($OnlyDocument -ne 0) {
    $oldResults = @(Get-Content -LiteralPath (Join-Path $PSScriptRoot 'word_render_manifest.json') -Raw | ConvertFrom-Json)
    $newNames = @($results | ForEach-Object { $_.file })
    $results = @($oldResults | Where-Object { $_.file -notin $newNames }) + @($results)
}
$results | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'word_render_manifest.json') -Encoding utf8
$results | ConvertTo-Json -Depth 5

