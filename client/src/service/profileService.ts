import axios from "axios";
import type { StudentHandleResponse } from "../interface/interface";

class ProfileService{
    async getProfileDetails(handle: string): Promise<StudentHandleResponse> {
        console.log("Fetching profile details for handle:", handle);
        try {
            const resposne = await axios.get(`https://coke-forces-server.onrender.com/api/student/${handle}`);
            console.log("Profile details fetched successfully:", resposne.data);
            return resposne.data;
        }catch(err:unknown){
            console.error("Error fetching profile details:", err);
            throw new Error("Failed to fetch profile details");
        }
    }
    async updateReminder(handle: string, reminder: boolean): Promise<string> {
        console.log("Updating reminder for handle:", handle, "to:", reminder);
        try {
            const response = await axios.put(`https://coke-forces-server.onrender.com/api/student/${handle}/update-reminder`, {
                value : reminder
            });
            console.log("Reminder updated successfully:", response.data);
            return response.data["message"];
        }catch(err:unknown){
            console.error("Error updating reminder:", err);
            throw new Error("Failed to update reminder");
        }
    }
}

export default new ProfileService()