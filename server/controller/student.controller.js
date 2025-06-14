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
                    time : new Date(submission.creationTimeSeconds * 1000), 
                }))
            }
            await newStudent.save();
            return res.status(201).json({ message: 'Student created successfully.', student: newStudent });
    }catch (error) {
        console.error('Error creating student:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}
   async  getAllStudents(req, res) {
    try {
        // Extract query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const minRating = parseInt(req.query.minRating) || 0;
        const maxRating = parseInt(req.query.maxRating) || Number.MAX_SAFE_INTEGER;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // Validate pagination parameters
        if (page < 1 || limit < 1) {
            return res.status(400).json({ message: 'Invalid page or limit value' });
        }

        // Build query for filtering
        const query = {};
        if (minRating || maxRating !== Number.MAX_SAFE_INTEGER) {
            query.rating = { $gte: minRating, $lte: maxRating };
        }

        // Fetch total count for pagination metadata
        const totalStudents = await Student.countDocuments(query);

        // Fetch students with pagination, filtering, and sorting
        const students = await Student.find(query)
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit);

        // Map student details
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

        // Prepare pagination metadata
        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalStudents / limit),
            totalStudents,
            limit,
        };

        return res.status(200).json({
            students: studentDetails,
            pagination,
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}
   async  getHandleDetails(req, res) {
    const { handle } = req.params;
    const days = parseInt(req.query.days);
    const validDays = [7, 30, 90];

    // Validate input
    if (!handle) {
        return res.status(400).json({ message: 'Codeforces handle is required.' });
    }
    if (days && !validDays.includes(days)) {
        return res.status(400).json({ message: 'Days must be 7, 30, or 90.' });
    }
    
    try {
        // Fetch student from database
        const student = await Student.findOne({ cfHandle: handle });
        if (!student) {
            return res.status(404).json({ message: 'Student not found with provided handle.' });
        }

        // Filter submissions by time period if specified
        const cutoffTime = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
        console.log(cutoffTime);
        const filteredSubmissions = cutoffTime
            ? student.submissions.filter(sub => sub.time >= cutoffTime)
            : student.submissions;

        // Calculate metrics
        let hardestProblem = null;
        let totalSolved = 0;
        let totalRating = 0;
        const solvedSubmissions = filteredSubmissions.filter(sub => sub.verdict === 'OK');
        console.log(solvedSubmissions);

        solvedSubmissions.forEach(sub => {
            totalSolved++;
           
                console.log(sub.rating);
                console.log(totalRating);
                totalRating += sub.rating || 0 ;
                if (!hardestProblem || sub.rating > hardestProblem.rating) {
                    hardestProblem = {
                        problemName: sub.problemName,
                        contestId: sub.contestId,
                        index: sub.index,
                        rating: sub.rating,
                        verdict: sub.verdict,
                    };
                }
            
        });

        const averageRating = totalSolved > 0 ? (totalRating / totalSolved).toFixed(2) : 0;
        const daysPeriod = days || (student.createdAt ? (Date.now() - student.createdAt.getTime()) / (24 * 60 * 60 * 1000) : 1);
        const averageProblemsPerDay = totalSolved > 0 ? (totalSolved / daysPeriod).toFixed(2) : 0;

        // Prepare student details
        const studentDetails = {
            id: student._id,
            cfHandle: student.cfHandle,
            name: student.name,
            email: student.email,
            phone: student.phone,
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
        };
        
        return res.status(200).json({
            student: studentDetails,
            days: days === NaN ? "All Time"  : days.toString(),
            metrics: {
                hardestProblem,
                totalProblemsSolved: totalSolved,
                averageRating,
                averageProblemsPerDay,
                totalSubmissions: filteredSubmissions.length,
                totalSolved:solvedSubmissions.length,
            },
            contests: student.contests,
            submissions: filteredSubmissions,
           
        });
    } catch (error) {
        console.error('Error fetching handle details:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}
   async updateStudentDetails(req, res) {
    const { handle } = req.params;
    const { name, email, phone,cfHandle } = req.body;
    if (!handle) {
        return res.status(400).json({ message: 'Codeforces handle is required.' });
    }
    try {
        // Fetch student from database
        const student = await Student.findOne({ cfHandle: handle });
        if (!student) {
            return res.status(404).json({ message: 'Student not found with provided handle.' });
        }
        // Update student details
        if (name) student.name = name;
        if (email) student.email = email;
        if (phone) student.phone = phone;
        if (cfHandle) {
            const existingStudent = await Student.findOne({
                cfHandle
            }); 
            if (existingStudent && existingStudent._id.toString() !== student._id.toString()) {
                return res.status(400).json({ message: 'Codeforces handle already exists.' });
            }
            student.cfHandle = cfHandle;
            
        }
        // Save updated student
        
    }
   }
}

module.exports = new StudentController();