const cron = require('node-cron');
const { syncCodeforcesData } = require('../service/sync.service');
const { getCronSchedule } = require('../config/schedule');

// Ensure your DB connection is established before this runs!

async function startCronJob() {
    const cronSchedule = await getCronSchedule();
    cron.schedule(cronSchedule, async () => {
        console.log(`Starting scheduled Codeforces data sync at schedule: ${cronSchedule}`);
        try {
            const result = await syncCodeforcesData();
            console.log('Sync completed:', result);
        } catch (error) {
            console.error('Error during scheduled sync:', error);
        }
    });
    console.log(`Cron job scheduled with: ${cronSchedule}`);
}

exports.startCronJob = startCronJob;