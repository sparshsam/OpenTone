#!/bin/bash
# Install Tauri build dependencies for WSL
set -e

sudo apt-get update -qq
sudo apt-get install -y \
  pkg-config \
  libwebkit2gtk-4.1-dev \
  build-essential \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev \
  libasound2-dev

echo "✅ All build dependencies installed"
