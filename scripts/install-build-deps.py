#!/usr/bin/env python3
"""Install Tauri build dependencies via sudo with expect-like handling."""
import subprocess
import sys
import os

password = "123Cringes*\n"

cmds = [
    ["sudo", "-S", "apt-get", "update", "-qq"],
    ["sudo", "-S", "apt-get", "install", "-y",
     "pkg-config",
     "libwebkit2gtk-4.1-dev",
     "build-essential",
     "libxdo-dev",
     "libssl-dev",
     "libayatana-appindicator3-dev",
     "librsvg2-dev",
     "libsoup-3.0-dev",
     "libjavascriptcoregtk-4.1-dev",
     "libasound2-dev"],
]

for cmd in cmds:
    print(f"Running: {' '.join(cmd)}")
    proc = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    stdout, _ = proc.communicate(input=password, timeout=300)
    print(stdout[-500:] if len(stdout) > 500 else stdout)
    if proc.returncode != 0:
        print(f"Command failed with exit code {proc.returncode}")
        sys.exit(1)

print("✅ All build dependencies installed")
