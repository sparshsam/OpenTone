#!/bin/bash
# OpenTone — system dependency installer
# Run this once to install Tauri v2 prerequisites for Ubuntu/WSL

set -e

echo "==> Installing Tauri v2 system dependencies..."
sudo apt-get update -qq
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev

echo "==> All system dependencies installed."
echo "==> You can now run: npm install && npm run tauri dev"
