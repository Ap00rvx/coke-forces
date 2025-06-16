import axios from "axios";
import type { StudentQueryParams } from "../interface/query";
import type { StudentListResponse,CreateStudentRequest, UpdateStudentRequest } from "../interface/interface";


class StudentService {
    async getAllStudent(
        query: StudentQueryParams = { page: 1, limit: 7, minRating: 0, sortBy: 'rating', sortOrder: "asc" }
    ): Promise<StudentListResponse> { 
        console.log("Fetching students with query:", query);    
        try{
                const response =  await axios.get('https://coke-forces-server.onrender.com/api/student', 
                    {
            params : {
                page: query.page,
                limit: query.limit,
                minRating: query.minRating,
                maxRating: query.maxRating,
                sortBy: query.sortBy,
                sortOrder: query.sortOrder
            }
        });
        console.log("Response received:", response.data);

        const studentListResponse: StudentListResponse = response.data;
        return studentListResponse;
        }catch(error:unknown) { {
            console.error("Error fetching students:", error);
            throw new Error( "Failed to fetch students");

        }
    }
}
    async createStudentDetails(
        studentData: CreateStudentRequest
    ){
        console.log("Creating student with data:", studentData);
        try {
            const response = await axios.post('https://coke-forces-server.onrender.com/api/student', studentData);
            console.log("Student created successfully:", response.data);
            return response.data
        }catch(err:unknown) {
            console.error("Error creating student:", err);
            throw new Error("Failed to create student");
        }

    }
    async deleteStudent(
        handle:string): Promise<void> {
        console.log("Deleting student with handle:", handle);
        try{
            const response = await axios.delete(`https://coke-forces-server.onrender.com/api/student/${handle}`);
            console.log("Student deleted successfully:", response.data);
            return response.data;
        }catch(error:unknown) {
            console.error("Error deleting student:", error);
            throw new Error("Failed to delete student");
        }
        }
    async updateStudent(
        studentData:UpdateStudentRequest,handle:string
    ){
        console.log("Updating student with data:", studentData);
        try {
            const response = await axios.put(`https://coke-forces-server.onrender.com/api/student/${handle}`, studentData);
            console.log("Student updated successfully:", response.data);
            return response.data;
        }
        catch(err:unknown) {
            console.error("Error updating student:", err);
            throw new Error("Failed to update student");
        }
    }



}
export default new StudentService();