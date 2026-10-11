Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class MemoryCleaner {
    [DllImport("psapi.dll")]
    public static extern int EmptyWorkingSet(IntPtr hwProc);
}
"@

$before = (Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory
$procs = Get-Process
$count = 0

foreach ($p in $procs) {
    try {
        if ($p.Handle -ne [IntPtr]::Zero) {
            [MemoryCleaner]::EmptyWorkingSet($p.Handle) | Out-Null
            $count++
        }
    } catch {}
}

[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()

$after = (Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory
$freedMB = [Math]::Max(0, [Math]::Round(($after - $before) / 1024, 1))

$totalMem = (Get-CimInstance Win32_OperatingSystem).TotalVisibleMemorySize
$usedAfter = [Math]::Round(($totalMem - $after) / (1024 * 1024), 2)
$totalGB = [Math]::Round($totalMem / (1024 * 1024), 2)

$res = @{
    processesCleaned = $count
    freedMB = $freedMB
    ramUsedGB = $usedAfter
    ramTotalGB = $totalGB
}

ConvertTo-Json $res -Compress
