const { execSync } = require('child_process');
const fs = require('fs');

// ===== CONFIGURATION =====
const TEST_HOSTS = {
    cgt: 'cgt.coh.org',
    gemini: 'gemini-data1.coh.org',
    // Add more hosts here as needed:
    // server1: '192.168.1.100',
    // server2: 'myserver.domain.com',
};

const BANDWIDTH_TESTS = [
    {
        name: 'cgtToGemini',
        description: 'CGT to Gemini-Data1',
        source: TEST_HOSTS.cgt,
        target: TEST_HOSTS.gemini
    },
    {
        name: 'localToCgt',
        description: 'Local to CGT',
        source: 'local',
        target: TEST_HOSTS.cgt
    }
    // Add more tests here:
    // {
    //     name: 'localToServer1',
    //     description: 'Local to Server1',
    //     source: 'local',
    //     target: TEST_HOSTS.server1
    // }
];
// ========================

class BandwidthMonitor {
    constructor(config) {
        this.config = config;
        this.logFile = '/Users/domeally/workspaces/uptime-kuma-satellite/logs/bandwidth.log';
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        console.log(logMessage.trim());
        fs.appendFileSync(this.logFile, logMessage);
    }

    async runSpeedTest(source, target, description) {
        this.log(`Starting test: ${description} (${source} -> ${target})`);
        
        try {
            const startTime = Date.now();
            let command;
            
            if (source === 'local') {
                // Test from local system to target
                command = `dd if=/dev/zero bs=1M count=50 status=none 2>/dev/null | ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "${target}" 'cat > /dev/null'`;
            } else {
                // Test from source to target via SSH chain
                command = `ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "${source}" "dd if=/dev/zero bs=1M count=50 status=none 2>/dev/null | ssh -o ConnectTimeout=10 '${target}' 'cat > /dev/null'"`;
            }
            
            execSync(command, { timeout: 60000 });
            
            const endTime = Date.now();
            const elapsed = (endTime - startTime) / 1000; // Convert to seconds
            const speed = (50 / elapsed).toFixed(2); // MB/s
            
            this.log(`Success: ${description} - ${speed} MB/s`);
            return { success: true, speed: parseFloat(speed), elapsed };
            
        } catch (error) {
            this.log(`Failed: ${description} - ${error.message}`);
            return { success: false, speed: 0, error: error.message };
        }
    }

    async runAllTests() {
        const results = {};
        
        // Run all configured tests
        for (const test of BANDWIDTH_TESTS) {
            results[test.name] = await this.runSpeedTest(
                test.source,
                test.target,
                test.description
            );
        }
        
        return results;
    }

    async sendToUptime(results) {
        const { execSync } = require('child_process');
        
        for (const [testName, result] of Object.entries(results)) {
            const config = this.config.monitors[testName];
            if (!config) continue;
            
            const status = result.success ? 'up' : 'down';
            const ping = Math.round(result.speed); // Send actual speed as ping value
            const message = `${result.speed} MB/s`;
            
            try {
                const url = `${this.config.uptimeKumaUrl}/api/push/${config.pushToken}?status=${status}&msg=${encodeURIComponent(message)}&ping=${ping}`;
                
                // Use curl instead of axios to bypass cron network restrictions
                const curlCommand = `curl -s -m 10 "${url}"`;
                const response = execSync(curlCommand, { encoding: 'utf8' });
                
                // Check if response contains ok:true
                if (response.includes('"ok":true')) {
                    this.log(`Pushed to Uptime Kuma: ${config.description} - ${result.speed} MB/s`);
                } else {
                    this.log(`Failed to push ${testName}: Invalid response - ${response}`);
                }
            } catch (error) {
                this.log(`Failed to push ${testName}: ${error.message}`);
            }
        }
    }
}

module.exports = BandwidthMonitor;