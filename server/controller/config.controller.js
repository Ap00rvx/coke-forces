const Config = require("../model/config.model");
const key = "CRON_SCHEDULE";
class ConfigController {
        async getConfig(req, res) {
                try {
                        const config = await Config.findOne({ key: key });
                        if (!config) {
                                return res.status(404).json({ message: "Configuration not found" });
                        }
                        return res.status(200).json({ value: config.value, key: config.key });
                }catch (error) {
                        console.error("Error fetching configuration:", error);
                        return res.status(500).json({ message: "Internal server error" });
                }
    }
        async setConfig(req, res) {
                const { value } = req.body;
                if (!value) {
                        return res.status(400).json({ message: "Value is required" });

                }
                try {
                        const config = await Config.findOneAndUpdate({ key: key }, { value: value }, { new: true, upsert: true });
                        //restart cron job if the key is CRON_SCHEDULE
                        if (key === "CRON_SCHEDULE") {
                                const cron = require('../cron/cron');
                                cron.startCronJob();
                        }
                        return res.status(200).json({ message: "Configuration updated successfully", value: config.value, key: config.key });
                } catch (error) {
                        console.error("Error updating configuration:", error);
                        return res.status(500).json({ message: "Internal server error" });
                }
        }
}

module.exports = new ConfigController();