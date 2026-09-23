$ErrorActionPreference = 'Stop'
$baseDir = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$files = @('Public_AI_PMS_미확정사항_검토표_v0.1.docx','Public_AI_PMS_1차개발범위_정의서_v0.1.docx')
$wordApp = $null
$activeDoc = $null
$results = @()
try {
    $wordApp = New-Object -ComObject Word.Application
    $wordApp.Visible = $false
    $wordApp.DisplayAlerts = 0
    $wordApp.AutomationSecurity = 3
    foreach ($name in $files) {
        $docPath = Join-Path $baseDir $name
        $renderName = if ($name -match '검토표') { 'decisions_final' } else { 'scope_final' }
        $renderDir = Join-Path $PSScriptRoot $renderName
        New-Item -ItemType Directory -Path $renderDir -Force | Out-Null
        $pdfPath = Join-Path $renderDir 'word_export.pdf'
        $activeDoc = $wordApp.Documents.Open($docPath, $false, $false, $false)
        $activeDoc.Fields.Update() | Out-Null
        foreach ($toc in $activeDoc.TablesOfContents) {
            $toc.Update()
            $toc.Range.Font.Size = 10.5
            $toc.Range.ParagraphFormat.SpaceBefore = 0
            $toc.Range.ParagraphFormat.SpaceAfter = 3
            $toc.Range.ParagraphFormat.LineSpacingRule = 0
        }
        $activeDoc.Repaginate()
        foreach ($toc in $activeDoc.TablesOfContents) { $toc.UpdatePageNumbers() }
        $activeDoc.Save()
        $pages = $activeDoc.ComputeStatistics(2)
        $activeDoc.ExportAsFixedFormat($pdfPath, 17)
        $results += [PSCustomObject]@{ file=$name; directory=$renderDir; pages=$pages; pdf=$pdfPath; tocCount=$activeDoc.TablesOfContents.Count; renderer='Microsoft Word' }
        $activeDoc.Close(0)
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($activeDoc)
        $activeDoc = $null
    }
} finally {
    if ($null -ne $activeDoc) { $activeDoc.Close(0); [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($activeDoc) }
    if ($null -ne $wordApp) { $wordApp.Quit(0); [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($wordApp) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
$results | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'word_render_manifest.json') -Encoding utf8
$results | ConvertTo-Json -Depth 5


