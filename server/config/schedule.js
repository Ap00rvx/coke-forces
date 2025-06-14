const Config = require('../model/config.model');

async function getCronSchedule() {
    const config = await Config.findOne({ key: 'CRON_SCHEDULE' });
    return config ? config.value : '0 2 * * *'; // Default: 2 AM daily
}

async function setCronSchedule(newSchedule) {
    // Upsert the CRON_SCHEDULE config
    await Config.findOneAndUpdate(
        { key: 'CRON_SCHEDULE' },
        { value: newSchedule },
        { upsert: true, new: true }
    );
}

async function createCronConfig(defaultSchedule = '0 2 * * *') {
    // Create only if not exists
    const exists = await Config.findOne({ key: 'CRON_SCHEDULE' });
    if (!exists) {
        await Config.create({ key: 'CRON_SCHEDULE', value: defaultSchedule });
    }
}

module.exports = { getCronSchedule, setCronSchedule, createCronConfig };