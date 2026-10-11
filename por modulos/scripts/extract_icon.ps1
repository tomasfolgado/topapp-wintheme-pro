param(
    [string]$Path = "",
    [string[]]$BatchPaths = @()
)

$code = @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public class HighResIcon {
    [DllImport("shell32.dll", EntryPoint = "#727")]
    public static extern int SHGetImageList(int iImageList, ref Guid riid, out IImageList ppv);

    [DllImport("shell32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr SHGetFileInfo(string pszPath, int dwFileAttributes, ref SHFILEINFO psfi, uint cbFileInfo, uint uFlags);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool DestroyIcon(IntPtr hIcon);

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
    public struct SHFILEINFO {
        public IntPtr hIcon;
        public int iIcon;
        public uint dwAttributes;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 260)]
        public string szDisplayName;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 80)]
        public string szTypeName;
    }

    [ComImport]
    [Guid("46EB5926-582E-4017-9FDF-E8998DAA0950")]
    [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    public interface IImageList {
        [PreserveSig] int Add(IntPtr hbmImage, IntPtr hbmMask, ref int pi);
        [PreserveSig] int ReplaceIcon(int i, IntPtr hicon, ref int pi);
        [PreserveSig] int SetOverlayImage(int iImage, int iOverlay);
        [PreserveSig] int Replace(int i, IntPtr hbmImage, IntPtr hbmMask);
        [PreserveSig] int AddMasked(IntPtr hbmImage, int crMask, ref int pi);
        [PreserveSig] int Draw(ref object pimldp);
        [PreserveSig] int Remove(int i);
        [PreserveSig] int GetIcon(int i, int flags, out IntPtr picon);
    }

    public static string ExtractBase64(string filePath) {
        if (string.IsNullOrEmpty(filePath)) return null;
        if (!File.Exists(filePath) && !Directory.Exists(filePath)) return null;
        try {
            SHFILEINFO shinfo = new SHFILEINFO();
            uint SHGFI_SYSICONINDEX = 0x4000;
            SHGetFileInfo(filePath, 0, ref shinfo, (uint)Marshal.SizeOf(shinfo), SHGFI_SYSICONINDEX);
            int iconIndex = shinfo.iIcon;

            Guid iidImageList = new Guid("46EB5926-582E-4017-9FDF-E8998DAA0950");
            IImageList iml;
            // 4 = SHIL_JUMBO (256x256), 2 = SHIL_EXTRALARGE (48x48)
            int hr = SHGetImageList(4, ref iidImageList, out iml);
            if (hr != 0 || iml == null) {
                hr = SHGetImageList(2, ref iidImageList, out iml);
            }
            if (hr == 0 && iml != null) {
                IntPtr hIcon = IntPtr.Zero;
                iml.GetIcon(iconIndex, 1 /* ILD_TRANSPARENT */, out hIcon);
                if (hIcon != IntPtr.Zero) {
                    using (Icon icon = Icon.FromHandle(hIcon)) {
                        using (Bitmap bmp = icon.ToBitmap()) {
                            DestroyIcon(hIcon);
                            using (MemoryStream ms = new MemoryStream()) {
                                bmp.Save(ms, ImageFormat.Png);
                                return "data:image/png;base64," + Convert.ToBase64String(ms.ToArray());
                            }
                        }
                    }
                }
            }
        } catch {}
        return null;
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

if ($Path -and $Path.Trim()) {
    $target = $Path.Trim()
    $result = [HighResIcon]::ExtractBase64($target)
    if ($result) {
        Write-Output $result
    }
} elseif ($BatchPaths -and $BatchPaths.Count -gt 0) {
    $map = @{}
    foreach ($p in $BatchPaths) {
        if ($p -and $p.Trim()) {
            $ico = [HighResIcon]::ExtractBase64($p.Trim())
            if ($ico) {
                $map[$p] = $ico
            }
        }
    }
    ConvertTo-Json -InputObject $map -Compress
}
