const Student = require('../model/student.model');
const {fetchUserInfo, fetchUserRatingHistory, fetchUserSubmissions} = require('../service/cf.service');
const {sendMail} = require('../service/mail.service');
const {syncCodeforcesData} = require('../service/sync.service');
const Parser = require('json2csv').Parser;
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
            newStudent.lastOnline = userInfo.lastOnlineTime ? new Date(userInfo.lastOnlineTime * 1000) : null; 
            newStudent.organization = userInfo.organization || ""; 
            newStudent.registeredAt = new Date(userInfo.registrationTime * 1000); 
            newStudent.friendOfCount = userInfo.friendOfCount || 0;
            newStudent.lastSyncedAt = new Date();
            newStudent.dataSyncFrequency = 'daily'; 
            

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
   async getAllStudents(req, res) {
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
   async getHandleDetails(req, res) {
    const { handle } = req.params;
    const days = parseInt(req.query.days);
    const contestDays = parseInt(req.query.contestDays);
    const validDays = [7, 30, 90];
    const validContestDays = [30, 90, 365];

    // Validate input
    if (!handle) {
        return res.status(400).json({ message: 'Codeforces handle is required.' });
    }
    if (days && !validDays.includes(days)) {
        return res.status(400).json({ message: 'Days must be 7, 30, or 90.' });
    }
    if (contestDays && !validContestDays.includes(contestDays)) {
        return res.status(400).json({ message: 'Contest days must be 30, 90, or 365.' });
    }

    try {
        // Fetch student from database
        const student = await Student.findOne({ cfHandle: handle });
        if (!student) {
            return res.status(404).json({ message: 'Student not found with provided handle.' });
        }

        // Filter submissions by time period if specified
        const cutoffTime = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
        const filteredSubmissions = cutoffTime
            ? student.submissions.filter(sub => sub.time >= cutoffTime)
            : student.submissions;

        // Calculate submission metrics
        let hardestProblem = null;
        let totalSolved = 0;
        let totalRating = 0;
        const solvedSubmissions = filteredSubmissions.filter(sub => sub.verdict === 'OK');

        solvedSubmissions.forEach(sub => {
            totalSolved++;
            if (sub.rating) {
                totalRating += sub.rating;
                if (!hardestProblem || sub.rating > hardestProblem.rating) {
                    hardestProblem = {
                        problemName: sub.problemName,
                        contestId: sub.contestId,
                        index: sub.index,
                        rating: sub.rating,
                        verdict: sub.verdict,
                    };
                }
            }
        });

        const averageRating = totalSolved > 0 ? (totalRating / totalSolved).toFixed(2) : 0;
        const daysPeriod = days || (student.createdAt ? (Date.now() - student.createdAt.getTime()) / (24 * 60 * 60 * 1000) : 1);
        const averageProblemsPerDay = totalSolved > 0 ? (totalSolved / daysPeriod).toFixed(2) : 0;

        // Filter contests by time period if specified
        const contestCutoffTime = contestDays ? new Date(Date.now() - contestDays * 24 * 60 * 60 * 1000) : null;
        const filteredContests = contestCutoffTime
            ? student.contests.filter(contest => contest.date >= contestCutoffTime)
            : student.contests;

        // Calculate contest metrics
        const ratingGraph = filteredContests.map(contest => ({
            date: contest.date,
            rating: contest.newRating,
        }));

        const contestDetails = filteredContests.map(contest => {
            // Count unsolved problems in the contest
            const contestSubmissions = student.submissions.filter(sub => sub.contestId === contest.contestId);
            const solvedProblems = contestSubmissions.filter(sub => sub.verdict === 'OK').map(sub => sub.index);
            const allProblems = [...new Set(contestSubmissions.map(sub => sub.index))];
            const unsolvedProblems = allProblems.filter(index => !solvedProblems.includes(index)).length;

            return {
                contestId: contest.contestId,
                contestName: contest.contestName,
                rank: contest.rank,
                ratingChange: contest.ratingChange,
                unsolvedProblems,
            };
        });

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
            lastReminderSent: student.lastReminderSent,
            reminderCount: student.reminderCount,
            lastReminderSent: student.lastReminderSent ? student.lastReminderSent.toISOString() : null,
            lastSyncedAt: student.lastSyncedAt ? student.lastSyncedAt.toISOString() : null,

        };

        return res.status(200).json({
            student: studentDetails,
            days: isNaN(days) ? 'All Time' : days.toString(),
            contestDays: isNaN(contestDays) ? 'All Time' : contestDays.toString(),
            metrics: {
                hardestProblem,
                totalProblemsSolved: totalSolved,
                averageRating,
                averageProblemsPerDay,
                totalSubmissions: filteredSubmissions.length,
                totalSolved: solvedSubmissions.length,
            },
            contests: {
                ratingGraph,
                contestList: contestDetails,
            },
            submissions: filteredSubmissions,
        });
    } catch (error) {
        console.error('Error fetching handle details:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}
   async  updateStudentDetails(req, res) {
    const { handle } = req.params;
    const { name, email, phone, cfHandle } = req.body;
    if (!handle) {
        return res.status(400).json({ message: 'Codeforces handle is required.' });
    }

    const session = await Student.startSession();
    session.startTransaction();

    try {
        // Fetch student from database
        const student = await Student.findOne({ cfHandle: handle }).session(session);
        if (!student) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Student not found with provided handle.' });
        }

        // Update student details
        if (name) student.name = name;
        if (email) student.email = email;
        if (phone) student.phone = phone;

        if (cfHandle) {
            const existingStudent = await Student.findOne({ cfHandle }).session(session);
            if (existingStudent && existingStudent._id.toString() !== student._id.toString()) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: 'Codeforces handle already exists.' });
            }
            student.cfHandle = cfHandle;

            // Fetch updated Codeforces data
            const userInfo = await fetchUserInfo(cfHandle);
            if (!userInfo) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: 'Invalid Codeforces handle or unable to fetch data.' });
            }

            // Update Codeforces data
            student.rating = userInfo.rating || 0;
            student.maxRating = userInfo.maxRating || 0;
            student.rank = userInfo.rank || 'Unranked';
            student.titlePhoto = userInfo.titlePhoto || '';
            student.lastOnline = userInfo.lastOnlineTime ? new Date(userInfo.lastOnlineTime * 1000) : null;
            student.organization = userInfo.organization || '';
            student.registeredAt = userInfo.registrationTime ? new Date(userInfo.registrationTime * 1000) : null;
            student.friendOfCount = userInfo.friendOfCount || 0;

            // Fetch updated rating history
            const ratingHistory = await fetchUserRatingHistory(cfHandle);
            if (ratingHistory && ratingHistory.length > 0) {
                student.contests = ratingHistory.map(contest => ({
                    contestId: contest.contestId,
                    contestName: contest.contestName,
                    rank: contest.rank,
                    oldRating: contest.oldRating,
                    newRating: contest.newRating,
                    ratingChange: contest.ratingChange,
                    date: new Date(contest.ratingUpdateTimeSeconds * 1000),
                }));
            }

            // Fetch updated submission history
            const submissions = await fetchUserSubmissions(cfHandle);
            if (submissions && submissions.length > 0) {
                student.submissions = submissions.map(submission => ({
                    problemName: submission.problem.name,
                    contestId: submission.contestId,
                    index: submission.problem.index,
                    rating: submission.problem.rating || 0,
                    verdict: submission.verdict,
                    language: submission.programmingLanguage,
                    tags: submission.problem.tags || [],
                    time: new Date(submission.creationTimeSeconds * 1000),
                }));
            }
        }

        // Update sync metadata
        student.lastSyncedAt = new Date();
        await student.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            message: 'Student details updated successfully.',
            student: {
                id: student._id,
                cfHandle: student.cfHandle,
                name: student.name,
            },
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error updating student details:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}
   async deleteStudent(req, res) {
    const { handle } = req.params;
    try{
        const student = await Student.findOne({
            cfHandle: handle
        });
        if (!student) {
            return res.status(404).json({ message: 'Student not found with provided handle.' });
        }
        await Student.deleteOne({ cfHandle: handle });
        return res.status(200).json({ message: 'Student deleted successfully.' , handle: handle });
        } catch (error) {
        console.error('Error deleting student:', error);
        return res.status(500).json({ message: 'Internal server error.' });
        }
    }

   async  downloadStudentsCsv(req, res) {
    try {
        // Fetch all students from database
        const students = await Student.find();

        // Prepare data for CSV
        const studentData = students.map(student => {
            const solvedSubmissions = student.submissions.filter(sub => sub.verdict === 'OK').length;
            // Helper to format date as dd/mm/yyyy and time (HH:MM:SS)
            function formatDateTime(date) {
                if (!date) return '';
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                const hours = String(d.getHours()).padStart(2, '0');
                const minutes = String(d.getMinutes()).padStart(2, '0');
                const seconds = String(d.getSeconds()).padStart(2, '0');
                return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
            }

            return {
                name: student.name,
                email: student.email,
                phone: student.phone,
                cfHandle: student.cfHandle,
                rating: student.rating || 0,
                maxRating: student.maxRating || 0,
                rank: student.rank || 'Unranked',
                titlePhoto: student.titlePhoto || '',
                lastOnline: student.lastOnline ? formatDateTime(student.lastOnline) : '',
                registeredAt: student.registeredAt ? formatDateTime(student.registeredAt) : '',
                organization: student.organization || '',
                friendOfCount: student.friendOfCount || 0,
                submissionCount: student.submissions.length,
                totalProblemsSolved: solvedSubmissions,
            };
        });

        // Define CSV fields
        const fields = [
            { label: 'Name', value: 'name' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Codeforces Handle', value: 'cfHandle' },
            { label: 'Rating', value: 'rating' },
            { label: 'Max Rating', value: 'maxRating' },
            { label: 'Rank', value: 'rank' },
            { label: 'Title Photo', value: 'titlePhoto' },
            { label: 'Last Online', value: 'lastOnline' },
            { label: 'Registered At', value: 'registeredAt' },
            { label: 'Organization', value: 'organization' },
            { label: 'Friend of Count', value: 'friendOfCount' },
            { label: 'Submission Count', value: 'submissionCount' },
            { label: 'Total Problems Solved', value: 'totalProblemsSolved' },
        ];

        // Generate CSV
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(studentData);

        // Set response headers for CSV download
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        res.setHeader('Content-Disposition', `attachment; filename=students_export_${timestamp}.csv`);
        res.setHeader('Content-Type', 'text/csv');

        // Send CSV data
        res.status(200).send(csv);
    } catch (error) {
        console.error('Error generating students CSV:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}
   async  sendReminderEmail(req, res) {
        // Extract Codeforces handle from request body
        console.log(req.params);
        const { cfHandle } = req.params; 
        
        if (!cfHandle) {
            return res.status(400).json({ message: 'Codeforces handle is required.' });
        }
        try {
            // Fetch student from database
            const student = await Student.findOne({ cfHandle: cfHandle });
            if (!student) {
                return res.status(404).json({ message: 'Student not found with provided handle.' });
            }
            // Check if the student has solved any problems in the last 7 days.
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const hasAttemptedProblems = student.submissions.some(submission => {
                return submission.time >= sevenDaysAgo && submission.verdict === 'OK';}
            );  
            if (hasAttemptedProblems) {
                return res.status(400).json({ message: 'Student has solved problems in the last 7 days. No reminder needed.' });
                
            }
            // Send reminder email
            await sendMail(student.email, student.name, cfHandle);
            // Update reminder count and last reminder sent date
            student.reminderCount += 1;
            student.lastReminderSent = new Date();
            await student.save();
            return res.status(200).json({ message: 'Reminder email sent successfully.' });
        }catch (error) {
            console.error('Error sending reminder email:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }

    }

    async  syncStudentsData(req, res) {
    try {
        const result = await syncCodeforcesData();
        return res.status(200).json({
            message: 'Codeforces data sync completed.',
            updated: result.updated,
            skipped: result.skipped,
            errors: result.errors,
        });
    } catch (error) {
        console.error('Error syncing students data:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}



}



module.exports = new StudentController();