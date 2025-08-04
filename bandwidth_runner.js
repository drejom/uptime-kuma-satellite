const BandwidthMonitor = require('./scripts/bandwidth_monitor');
const config = require('./config/bandwidth.json');

async function runMonitoring() {
    const monitor = new BandwidthMonitor(config);
    
    try {
        console.log('Starting bandwidth monitoring cycle...');
        const results = await monitor.runAllTests();
        await monitor.sendToUptime(results);
        console.log('Monitoring cycle completed successfully');
    } catch (error) {
        console.error('Monitoring cycle failed:', error);
    }
}

// Run immediately if called directly
if (require.main === module) {
    runMonitoring();
}

// Export for cron usage
module.exports = { runMonitoring };