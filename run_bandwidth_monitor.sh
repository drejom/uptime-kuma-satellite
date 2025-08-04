#!/bin/bash

# Set up environment for cron on macOS
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
export HOME="/Users/domeally"

# Source bash profile to get nvm and other env vars
[ -f "$HOME/.bash_profile" ] && source "$HOME/.bash_profile"
[ -f "$HOME/.bashrc" ] && source "$HOME/.bashrc"

# Ensure we're in the right directory
cd /Users/domeally/workspaces/uptime-kuma-satellite

# Run the bandwidth monitor
/Users/domeally/.nvm/versions/node/v20.19.3/bin/node bandwidth_runner.js