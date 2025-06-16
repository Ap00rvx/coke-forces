const Student = require('../model/student.model');
const { fetchUserInfo, fetchUserRatingHistory, fetchUserSubmissions } = require('./cf.service');
const {sendMail} = require("../service/mail.service");
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Syncs Codeforces data for all students with minimal MongoDB interactions.
 * @returns {Promise<{ updated: number, skipped: number, errors: string[] }>} Sync summary
 */
async function syncCodeforcesData() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istHour = new Date(now.getTime() ).getHours();
   
    const isPeakHour = istHour >= 8 && istHour < 12; // 8 AM to 10 PM IST

    if (isPeakHour) {
    console.log('Sync disabled during peak hours (8 AM to 10 PM IST).');
        return { updated: 0, skipped: 0, errors: ['Sync disabled during peak hours (8 AM to 10 PM IST).'] };
    }

    // Fetch all students once
    const students = await Student.find().select('cfHandle');
    const bulkOps = [];
    let updated = 0;
    let skipped = 0;
    const errors = [];

    // Process each student for Codeforces API calls
    for (const student of students) {
        try {
            const cfHandle = student.cfHandle;
            const userInfo = await fetchUserInfo(cfHandle);
            if (!userInfo) {
                throw new Error('Invalid Codeforces handle or unable to fetch data.');
            }

            // Prepare updated data
            const updateData = {
                rating: userInfo.rating || 0,
                maxRating: userInfo.maxRating || 0,
                rank: userInfo.rank || 'Unranked',
                titlePhoto: userInfo.titlePhoto || '',
                lastOnline: userInfo.lastOnlineTime ? new Date(userInfo.lastOnlineTime ) : null,
                organization: userInfo.organization || '',
                registeredAt: userInfo.registrationTime ? new Date(userInfo.registrationTime ) : null,
                friendOfCount: userInfo.friendOfCount || 0,
                contests: [],
                submissions: [],
                lastSyncedAt: new Date(),
            };

            // Fetch rating history
            const ratingHistory = await fetchUserRatingHistory(cfHandle);
            if (ratingHistory && ratingHistory.length > 0) {
                updateData.contests = ratingHistory.map(contest => ({
                    contestId: contest.contestId,
                    contestName: contest.contestName,
                    rank: contest.rank,
                    oldRating: contest.oldRating,
                    newRating: contest.newRating,
                    ratingChange: contest.newRating - contest.oldRating,
                    date: new Date(contest.ratingUpdateTimeSeconds * 1000),
                }));
            }

            // Fetch submissions
            const submissions = await fetchUserSubmissions(cfHandle);
            if (submissions && submissions.length > 0) {
                updateData.submissions = submissions.map(submission => ({
                    problemName: submission.problem.name,
                    contestId: submission.contestId,
                    index: submission.problem.index,
                    rating: submission.problem.rating || null,
                    verdict: submission.verdict,
                    language: submission.programmingLanguage,
                    tags: submission.problem.tags || [],
                    time: new Date(submission.creationTimeSeconds * 1000),
                }));
            }

            // Add update operation to bulkOps
            bulkOps.push({
                updateOne: {
                    filter: { cfHandle },
                    update: { $set: updateData },
                },
            });

            updated++;
            await delay(1000); // Respect Codeforces API rate limits (1 request/sec)
        } catch (error) {
            errors.push(`Failed to sync ${student.cfHandle}: ${error.message}`);
            skipped++;
        }
    }

    // Perform single batch update
    if (bulkOps.length > 0) {
        try {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);    
            await Student.bulkWrite(bulkOps, { ordered: false });
            const syncedStudents = await Student.find({emailRemindersDisabled: false});
            const inactiveStudents = syncedStudents.filter(student => 
            !student.submissions.some(sub => sub.time >= sevenDaysAgo)
        );

            for (const student of inactiveStudents) {
                sendMail(student.email, student.name, student.cfHandle);
                student.reminderCount = (student.reminderCount || 0) + 1;
                student.lastReminderSent = new Date();
                await student.save();
                console.log(`Reminder sent to ${student.cfHandle}. Total reminders sent: ${student.reminderCount}`);
            }
            
        } catch (error) {
            errors.push(`Batch update failed: ${error.message}`);
            // Adjust counts based on potential partial success
            updated = Math.max(0, updated - bulkOps.length);
            skipped += bulkOps.length;
        }
    }

    return { updated, skipped, errors };
}

module.exports = { syncCodeforcesData };