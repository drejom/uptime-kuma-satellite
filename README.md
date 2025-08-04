# Uptime Kuma Satellite - Bandwidth Monitor

A lightweight bandwidth monitoring tool that acts as a satellite for Uptime Kuma, measuring network speeds between different hosts and reporting back via push monitors.

## Features

- Measures bandwidth between any SSH-accessible hosts
- Uses standard Unix tools (`dd`, SSH, curl) - minimal dependencies
- Reports to Uptime Kuma via push monitors
- Configurable test hosts and routes
- Automatic monitoring via cron
- Simple Node.js wrapper for orchestration

## Requirements

- Node.js 18+ 
- SSH key-based access to target hosts
- Uptime Kuma instance with push monitors configured
- Unix-like operating system (macOS, Linux)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/uptime-kuma-satellite.git
cd uptime-kuma-satellite
```

2. Install dependencies:
```bash
npm install
```

3. Copy and configure the config file:
```bash
cp config/bandwidth.json.example config/bandwidth.json
```

4. Edit `config/bandwidth.json` with your Uptime Kuma URL and push tokens

5. Set up the cron job:
```bash
# Run every 20 minutes
*/20 * * * * /path/to/uptime-kuma-satellite/run_bandwidth_monitor.sh >> /path/to/logs/cron.log 2>&1
```

## Configuration

### Adding Test Hosts

Edit the top of `scripts/bandwidth_monitor.js`:

```javascript
const TEST_HOSTS = {
    cgt: 'cgt.coh.org',
    gemini: 'gemini-data1.coh.org',
    server1: '192.168.1.100',  // Add your hosts here
};
```

### Adding Test Routes

Add new tests to the `BANDWIDTH_TESTS` array:

```javascript
const BANDWIDTH_TESTS = [
    {
        name: 'serverToServer',
        description: 'Server1 to Server2',
        source: TEST_HOSTS.server1,
        target: TEST_HOSTS.server2
    }
];
```

### Uptime Kuma Setup

1. Create a Push monitor for each test
2. Set Heartbeat Interval to 1500 seconds (25 minutes) for buffer
3. Copy the push token from the URL
4. Add to `config/bandwidth.json`

## How It Works

1. The script runs bandwidth tests using `dd` to generate data and SSH to transfer it
2. Measures the time to transfer 50MB between hosts
3. Calculates speed in MB/s
4. Reports to Uptime Kuma via push monitors
5. Uptime Kuma tracks the bandwidth as "ping" values and shows status

## File Structure

```
uptime-kuma-satellite/
├── bandwidth_runner.js      # Main entry point
├── scripts/
│   └── bandwidth_monitor.js # Core monitoring logic
├── config/
│   └── bandwidth.json       # Configuration (gitignored)
├── logs/                    # Log files (gitignored)
├── run_bandwidth_monitor.sh # Cron wrapper script
└── package.json            # Node dependencies
```

## Troubleshooting

### Cron not running
- Check that Node.js path is correct in `run_bandwidth_monitor.sh`
- Verify cron has permission to run
- Check logs in `logs/cron.log`

### SSH connection issues
- Verify SSH key access: `ssh user@host`
- Check firewall rules
- Ensure hosts are reachable

### Uptime Kuma not receiving data
- Verify push tokens are correct
- Check Uptime Kuma URL is accessible
- Look for errors in `logs/bandwidth.log`

## License

MIT