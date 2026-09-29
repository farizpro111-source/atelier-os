param([string]$Target)
$baseline = "$Target.baseline"
if (!(Test-Path -LiteralPath $baseline)) { throw "missing sibling baseline: $baseline" }
[IO.File]::Copy((Resolve-Path -LiteralPath $baseline), (Resolve-Path -LiteralPath $Target), $true)
