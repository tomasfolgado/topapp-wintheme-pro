param(
    [string]$Action = "status",
    [int]$Volume = -1,
    [int]$Brightness = -1,
    [string]$Mute = ""
)

try {
    $code = @'
using System;
using System.Runtime.InteropServices;

[Guid("5CDF2C82-841E-4546-9722-0CF74078229A"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IAudioEndpointVolume {
    [PreserveSig] int RegisterControlChangeNotify(IntPtr pNotify);
    [PreserveSig] int UnregisterControlChangeNotify(IntPtr pNotify);
    [PreserveSig] int GetChannelCount(out uint pnChannelCount);
    [PreserveSig] int SetMasterVolumeLevel(float fLevelDB, ref Guid pguidEventContext);
    [PreserveSig] int SetMasterVolumeLevelScalar(float fLevel, ref Guid pguidEventContext);
    [PreserveSig] int GetMasterVolumeLevel(out float pfLevelDB);
    [PreserveSig] int GetMasterVolumeLevelScalar(out float pfLevel);
    [PreserveSig] int SetChannelVolumeLevel(uint nChannel, float fLevelDB, ref Guid pguidEventContext);
    [PreserveSig] int SetChannelVolumeLevelScalar(uint nChannel, float fLevel, ref Guid pguidEventContext);
    [PreserveSig] int GetChannelVolumeLevel(uint nChannel, out float pfLevelDB);
    [PreserveSig] int GetChannelVolumeLevelScalar(uint nChannel, out float pfLevel);
    [PreserveSig] int SetMute([MarshalAs(UnmanagedType.Bool)] bool bMute, ref Guid pguidEventContext);
    [PreserveSig] int GetMute([MarshalAs(UnmanagedType.Bool)] out bool pbMute);
}

[Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IMMDevice {
    [PreserveSig] int Activate(ref Guid id, int clsCtx, IntPtr activationParams, [MarshalAs(UnmanagedType.IUnknown)] out object aev);
    [PreserveSig] int OpenPropertyStore(int stgmAccess, out IntPtr ppProperties);
    [PreserveSig] int GetId([MarshalAs(UnmanagedType.LPWStr)] out string ppstrId);
    [PreserveSig] int GetState(out int pdwState);
}

[Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IMMDeviceEnumerator {
    [PreserveSig] int EnumAudioEndpoints(int dataFlow, int dwStateMask, out IntPtr ppDevices);
    [PreserveSig] int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice endpoint);
}

[ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
public class MMDeviceEnumeratorComObject { }

public class AudioMaster {
    private static IAudioEndpointVolume GetEndpoint() {
        var enumerator = (IMMDeviceEnumerator)(new MMDeviceEnumeratorComObject());
        IMMDevice dev;
        enumerator.GetDefaultAudioEndpoint(0, 1, out dev);
        var iid = typeof(IAudioEndpointVolume).GUID;
        object epvObj;
        dev.Activate(ref iid, 23, IntPtr.Zero, out epvObj);
        return (IAudioEndpointVolume)epvObj;
    }

    public static float GetVolume() {
        try {
            var ep = GetEndpoint();
            float vol = 0;
            ep.GetMasterVolumeLevelScalar(out vol);
            return vol;
        } catch { return 0.5f; }
    }

    public static void SetVolume(float vol) {
        try {
            if (vol < 0f) vol = 0f;
            if (vol > 1f) vol = 1f;
            var ep = GetEndpoint();
            var g = Guid.Empty;
            ep.SetMasterVolumeLevelScalar(vol, ref g);
        } catch {}
    }

    public static bool GetMute() {
        try {
            var ep = GetEndpoint();
            bool m = false;
            ep.GetMute(out m);
            return m;
        } catch { return false; }
    }

    public static bool SetMute(bool mute) {
        try {
            var ep = GetEndpoint();
            var g = Guid.Empty;
            ep.SetMute(mute, ref g);
            return mute;
        } catch { return false; }
    }

    public static bool ToggleMute() {
        try {
            var ep = GetEndpoint();
            bool m = false;
            ep.GetMute(out m);
            var g = Guid.Empty;
            ep.SetMute(!m, ref g);
            return !m;
        } catch { return false; }
    }
}
'@
    Add-Type -TypeDefinition $code -Language CSharp -ErrorAction SilentlyContinue
} catch {}

# Action handlers
if ($Action -eq "set-volume" -and $Volume -ge 0) {
    try {
        $scalar = [float]($Volume / 100.0)
        [AudioMaster]::SetVolume($scalar)
        [AudioMaster]::SetMute($false) | Out-Null
    } catch {}
}

if ($Action -eq "toggle-mute") {
    try {
        [AudioMaster]::ToggleMute() | Out-Null
    } catch {}
}

if ($Action -eq "set-brightness" -and $Brightness -ge 0) {
    try {
        $wmi = Get-WmiObject -Namespace root/wmi -Class WmiMonitorBrightnessMethods -ErrorAction Stop
        $wmi.WmiSetBrightness(1, $Brightness) | Out-Null
    } catch {
        try {
            $cim = Get-CimInstance -Namespace root/wmi -ClassName WmiMonitorBrightnessMethods -ErrorAction SilentlyContinue
            if ($cim) {
                Invoke-CimMethod -InputObject $cim -MethodName WmiSetBrightness -Arguments @{ Timeout = [uint32]1; Brightness = [byte]$Brightness } -ErrorAction SilentlyContinue | Out-Null
            }
        } catch {}
    }
}

# Read current status
$curVol = 50
$curMute = $false
try {
    $curVol = [math]::Round([AudioMaster]::GetVolume() * 100)
    $curMute = [AudioMaster]::GetMute()
} catch {}

$curBright = 100
try {
    $bObj = Get-CimInstance -Namespace root/wmi -ClassName WmiMonitorBrightness -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($bObj -and $bObj.CurrentBrightness -ne $null) {
        $curBright = [int]$bObj.CurrentBrightness
    }
} catch {}

$hasBattery = $false
$batPercent = 100
$isCharging = $false
try {
    $bat = Get-CimInstance -ClassName Win32_Battery -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($bat) {
        $hasBattery = $true
        $batPercent = [int]$bat.EstimatedChargeRemaining
        $isCharging = ($bat.BatteryStatus -eq 2 -or $bat.BatteryStatus -ge 6)
    }
} catch {}

$res = [PSCustomObject]@{
    volume = $curVol
    isMuted = $curMute
    brightness = $curBright
    battery = $batPercent
    isCharging = $isCharging
    hasBattery = $hasBattery
}

$res | ConvertTo-Json -Compress
