const Student = require('../model/student.model');
const {fetchUserInfo, fetchUserRatingHistory, fetchUserSubmissions} = require('../service/cf.service');

class StudentController {

    // Create a new student
    async createStudent(req, res) {
        const { name, email, phone, cfHandle } = req.body;
            if (!name || !email || !phone || !cfHandle) {
                return res.status(400).json({ message: 'Name, email, phone, and Codeforces handle are required.' });
            }
        try {
        const existingStudent = await Student.findOne({ cfHandle}); 
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this Codeforces handle already exists.' });
        }
            const newStudent = new Student({
                name,
                email,
                phone,
                cfHandle,
            }); 
            // Fetch Codeforces data
            const userInfo = await fetchUserInfo(cfHandle);
            if (!userInfo) {
                return res.status(400).json({ message: 'Invalid Codeforces handle or unable to fetch data.' });
            }
            newStudent.rating = userInfo.rating;
            newStudent.maxRating = userInfo.maxRating;
            newStudent.rank = userInfo.rank;
            newStudent.titlePhoto = userInfo.titlePhoto || "";
            newStudent.lastOnline = userInfo.lastOnlineTime;
            newStudent.organization = userInfo.organization || "";
            newStudent.registeredAt = userInfo.registrationTime;
            newStudent.friendOfCount = userInfo.friendOfCount || 0;

            // Fetch rating history
            const ratingHistory = await fetchUserRatingHistory(cfHandle);
            if (ratingHistory && ratingHistory.length > 0) {
                newStudent.contests = ratingHistory.map(contest => ({
                    contestId: contest.contestId,
                    contestName: contest.contestName,
                    rank: contest.rank,
                    oldRating: contest.oldRating,
                    newRating: contest.newRating,
                    ratingChange: contest.newRating - contest.oldRating,
                    date: new Date(contest.ratingUpdateTimeSeconds * 1000), 

                }));
            }

            // Fetch submission history
            const submissions = await fetchUserSubmissions(cfHandle);
            if (submissions && submissions.length > 0) {
                newStudent.submissions = submissions.map(submission => ({
                    problemName: submission.problem.name,
                    contestId: submission.problem.contestId,
                    index: submission.problem.index,
                    rating: submission.problem.rating || null,
                    verdict: submission.verdict,
                    language: submission.programmingLanguage,
                    tags: submission.problem.tags || [],
                }))
            }
            await newStudent.save();
            return res.status(201).json({ message: 'Student created successfully.', student: newStudent });
    }catch (error) {
        console.error('Error creating student:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}
    async getAllStudents(req, res) {
        try {
            const students = await Student.find().sort({ createdAt: -1 });
            // return only student details like name,email,phone,cfHandle,rating,maxRating,rank,titlePhoto,lastOnline,organization,registeredAt,friendOfCount,contestCount,submissionCount
            const studentDetails = students.map(student => ({
                id: student._id,
                name: student.name,
                email: student.email,
                phone: student.phone,
                cfHandle: student.cfHandle,
                rating: student.rating,
                maxRating: student.maxRating,
                rank: student.rank,
                titlePhoto: student.titlePhoto,
                lastOnline: student.lastOnline,
                registeredAt: student.registeredAt,
                organization: student.organization,
                friendOfCount: student.friendOfCount,
                contestCount: student.contests.length,
                submissionCount: student.submissions.length,
                createdAt: student.createdAt,
                updatedAt: student.updatedAt,
            }));

            return res.status(200).json({ students: studentDetails });
        }
        catch (error) {
            console.error('Error fetching students:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    } 
}

module.exports = new StudentController();