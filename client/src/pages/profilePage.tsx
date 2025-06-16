import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import profileService from "../service/profileService";
import type { StudentHandleResponse } from "../interface/interface";
import Navbar from "../components/navbar";
import QuestionRatingChart from "../components/charts/question-rating-charts";
import SubmissionHeatmap from "../components/charts/heat-map";
import RatingGraph from "../components/charts/contest-rating-graph";
import LatestContests from "../components/latest-contest";

const ProfilePage = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentHandleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) {
      setError("No handle provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    profileService
      .getProfileDetails(handle)
      .then((data) => {
        setProfile(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Failed to load profile.");
      })
      .finally(() => setLoading(false));
  }, [handle]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent"></div>
        <span className="ml-3 sm:ml-4 text-gray-700 dark:text-gray-200 text-sm sm:text-base">
          Loading profile...
        </span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
        <div className="text-red-600 dark:text-red-400 text-base sm:text-lg mb-3 sm:mb-4">
          {error || "Profile not found."}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded text-sm sm:text-base hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { student, metrics } = profile;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8 ">
        <div className=" mx-auto space-y-6">
          {/* Profile Card */}
          <div className=" mx-auto bg-white dark:bg-gray-800 rounded-lg  flex min-[1310px]:flex-row flex-col shadow-lg justify-center items-center">
            <div className="bg-white dark:bg-gray-800  p-4 sm:p-6 ">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 ">
              <img
                src={student.titlePhoto}
                alt={student.name}
                className="w-20 h-20 sm:w-26 sm:h-26 rounded-full object-cover border-4 border-blue-500"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}`;
                }}
              />
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h2>
                <div className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">@{student.cfHandle}</div>
                <div className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <div>
                    Rank:{" "}
                    <span
                      className={`font-semibold capitalize ${
                        student.rank === 'legendary grandmaster'
                          ? 'text-[#FF8C00]'
                          : student.rank === 'international grandmaster'
                          ? 'text-red-600'
                          : student.rank === 'grandmaster'
                          ? 'text-red-500'
                          : student.rank === 'international master'
                          ? 'text-orange-500'
                          : student.rank === 'master'
                          ? 'text-orange-400'
                          : student.rank === 'candidate master'
                          ? 'text-purple-500'
                          : student.rank === 'expert'
                          ? 'text-blue-600'
                          : student.rank === 'specialist'
                          ? 'text-cyan-600'
                          : student.rank === 'pupil'
                          ? 'text-green-600'
                          : student.rank === 'newbie'
                          ? 'text-gray-500 dark:text-gray-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {student.rank}
                    </span>
                  </div>
                  <div>Rating: <span className="font-semibold">{student.rating}</span> / {student.maxRating}</div>
                  <div>Organization: {student.organization || "N/A"}</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <div className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-1">Email</div>
                <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{student.email}</div>
              </div>
              <div>
                <div className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-1">Phone</div>
                <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{student.phone}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <div className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-1">Reminder Enabled</div>
                <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{student.emailRemindersDisabled ? 
                  "Disabled" : "Enabled"}</div>
              </div>
              <div>
                <div className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-1">Reminder sent till now</div>
                <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{student.reminderCount}</div>
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Profile Metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-300">{metrics.totalProblemsSolved}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Problems Solved</div>
                </div>
                <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-300">{metrics.totalSubmissions}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Total Submissions</div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-yellow-700 dark:text-yellow-300">{metrics.averageRating}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Avg. Rating</div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-purple-700 dark:text-purple-300">{metrics.averageProblemsPerDay}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Problems/Day</div>
                </div>
              </div>
            </div>
            <div className="mb-6">
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-300">{profile.contests.contestList.length}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Total Contest</div>
                </div>
                <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-300">{profile.student.maxRating}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Highest rating</div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-yellow-700 dark:text-yellow-300">{profile.student.friendOfCount}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Friends</div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-md  sm:text-xl font-bold text-purple-700 dark:text-purple-300">{profile.student.registeredAt.split("T")[0]}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Registered</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Hardest Problem Solved</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  {metrics.hardestProblem.problemName}{" "}
                  <span className="text-xs text-gray-500 dark:text-gray-300">
                    (Rating: {metrics.hardestProblem.rating})
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  Contest: {metrics.hardestProblem.contestId} {metrics.hardestProblem.index}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  Verdict: {metrics.hardestProblem.verdict}
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 ">
            <LatestContests contestList={profile.contests.contestList} />
          </div>
          </div>

       
          

          {/* Recent Activity (Question Rating Chart) */}
          <div className="bg-white dark:bg-gray-800  p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Recent Activity
            </h3>
            <QuestionRatingChart
              submissions={profile.submissions
                .filter((submission) => submission.rating !== null && submission.verdict === "OK")
                .map((submission) => ({
                  id: submission._id,
                  problem: {
                    rating: submission.rating || 0,
                    name: submission.problemName,
                  },
                  creationTimeSeconds: new Date(submission.time).getTime() / 1000,
                }))}
              contests={profile.contests}
              allSubmissions={profile.submissions}
            />
          </div>
          </div>

          {/* Yearly Submission Heatmap */}
          <div className="bg-white dark:bg-gray-800  p-4 sm:p-6">
            <h2 className="text-base sm:text-xl font-bold mb-4 text-gray-900 dark:text-white text-center">
              Yearly Submission Heatmap
            </h2>
            <SubmissionHeatmap
              submissions={profile.submissions.map((submission) => ({
                creationTimeSeconds: new Date(submission.time).getTime() / 1000,
                problem: {
                  name: submission.problemName,
                  rating: submission.rating || 0,
                },
              }))}
              daysFilter={365}
            />
          </div>

          {/* Rating Graph */}
          <div className="bg-white dark:bg-gray-800  p-4 sm:p-6">
            <h2 className="text-base sm:text-xl font-bold mb-4 text-gray-900 dark:text-white text-center">
              Rating Progression
            </h2>
            <RatingGraph contests={profile.contests} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;