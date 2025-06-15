import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import profileService from "../service/profileService";
import type { StudentHandleResponse } from "../interface/interface";

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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <span className="ml-4 text-gray-700 dark:text-gray-200">Loading profile...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-red-600 dark:text-red-400 text-lg mb-4">{error || "Profile not found."}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { student, metrics } = profile;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-6 mb-8">
          <img
            src={student.titlePhoto}
            alt={student.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}`;
            }}
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h2>
            <div className="text-gray-600 dark:text-gray-300">@{student.cfHandle}</div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="mr-4">Rank: <span className="font-semibold capitalize">{student.rank}</span></span>
              <span>Rating: <span className="font-semibold">{student.rating}</span> / {student.maxRating}</span>
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Organization: {student.organization || "N/A"}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="text-gray-700 dark:text-gray-300 mb-1">Email</div>
            <div className="font-medium text-gray-900 dark:text-white">{student.email}</div>
          </div>
          <div>
            <div className="text-gray-700 dark:text-gray-300 mb-1">Phone</div>
            <div className="font-medium text-gray-900 dark:text-white">{student.phone}</div>
          </div>
          <div>
            <div className="text-gray-700 dark:text-gray-300 mb-1">Registered At</div>
            <div className="font-medium text-gray-900 dark:text-white">
              {new Date(student.registeredAt).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-gray-700 dark:text-gray-300 mb-1">Last Online</div>
            <div className="font-medium text-gray-900 dark:text-white">
              {new Date(student.lastOnline).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Profile Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{metrics.totalProblemsSolved}</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Problems Solved</div>
            </div>
            <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{metrics.totalSubmissions}</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Total Submissions</div>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{metrics.averageRating}</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Avg. Rating</div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{metrics.averageProblemsPerDay}</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Problems/Day</div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Hardest Problem Solved</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="font-medium text-gray-900 dark:text-white">
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
      </div>
    </div>
  );
};

export default ProfilePage;