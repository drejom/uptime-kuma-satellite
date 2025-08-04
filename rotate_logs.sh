#!/bin/bash

# Log rotation script for uptime-kuma-satellite
LOG_DIR="/Users/domeally/workspaces/uptime-kuma-satellite/logs"
MAX_SIZE=10485760  # 10MB in bytes
MAX_ARCHIVES=5     # Keep 5 archived logs

# Function to rotate a log file
rotate_log() {
    local log_file="$1"
    local base_name="${log_file%.log}"
    
    if [ ! -f "$log_file" ]; then
        return
    fi
    
    # Check file size
    local file_size=$(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file" 2>/dev/null)
    
    if [ "$file_size" -gt "$MAX_SIZE" ]; then
        echo "Rotating $log_file (size: $file_size bytes)"
        
        # Remove oldest archive if we have too many
        if [ -f "${base_name}.${MAX_ARCHIVES}.gz" ]; then
            rm -f "${base_name}.${MAX_ARCHIVES}.gz"
        fi
        
        # Shift existing archives
        for i in $(seq $((MAX_ARCHIVES-1)) -1 1); do
            if [ -f "${base_name}.${i}.gz" ]; then
                mv "${base_name}.${i}.gz" "${base_name}.$((i+1)).gz"
            fi
        done
        
        # Compress and archive current log
        gzip -c "$log_file" > "${base_name}.1.gz"
        
        # Clear the current log file
        > "$log_file"
        
        echo "Log rotation complete for $log_file"
    fi
}

# Rotate all log files
rotate_log "$LOG_DIR/bandwidth.log"
rotate_log "$LOG_DIR/cron.log"
rotate_log "$LOG_DIR/cron_test.log"