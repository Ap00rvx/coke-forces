// {
//     "message": "Configuration updated successfully",
//     "value": "02 20 * * *",
//     "key": "CRON_SCHEDULE"
// }

import axios from "axios";

class ConfigService {
    async updateCron(value: string): Promise<string> {
        console.log("Cron value:", value);
        try {
            const resposne = await axios.put(`https://coke-forces-server.onrender.com/api/config/cron`,{
                value
            });
            console.log("Config updated  successfully:", resposne.data);
            return resposne.data["message"];
        }catch(err:unknown){
            console.error("Error fetching profile details:", err);
            throw new Error("Failed to fetch profile details");
        }
    }
}

export default new ConfigService()
