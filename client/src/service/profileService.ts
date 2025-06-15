import axios from "axios";
import type { StudentHandleResponse } from "../interface/interface";

class ProfileService{
    async getProfileDetails(handle: string): Promise<StudentHandleResponse> {
        console.log("Fetching profile details for handle:", handle);
        try {
            const resposne = await axios.get(`/api/student/${handle}`);
            console.log("Profile details fetched successfully:", resposne.data);
            return resposne.data;
        }catch(err:unknown){
            console.error("Error fetching profile details:", err);
            throw new Error("Failed to fetch profile details");
        }
    }
}

export default new ProfileService()