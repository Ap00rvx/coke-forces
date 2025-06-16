import React, { useState, useMemo } from 'react';



// Props interface
interface LatestSubmissionsProps {
  submissions: {
      problemName: string;
  contestId: number;
  index: string;
  rating: number | null;
  verdict: string;
  language: string;
  tags: string[];
  time: string;
  _id: string;
  }[];
}

const LatestSubmissions: React.FC<LatestSubmissionsProps> = ({ submissions }) => {
  // State for current page
  const [currentPage, setCurrentPage] = useState<number>(1);
  const submissionsPerPage = 5;

  // Sort submissions by time (most recent first) and paginate
  const paginatedSubmissions = useMemo(() => {
    const sortedSubmissions = [...submissions].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
    const startIndex = (currentPage - 1) * submissionsPerPage;
    return sortedSubmissions.slice(startIndex, startIndex + submissionsPerPage);
  }, [submissions, currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(submissions.length / submissionsPerPage);

  // Handle page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="mt-3 max-w-4xl mx-auto bg-white dark:bg-gray-900 ">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Latest Submissions</h2>

      {/* Submissions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600">
                Problem Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600">
                Rating
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600">
                Verdict
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600">
                Language
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedSubmissions.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-2 text-center text-gray-600 dark:text-gray-400"
                >
                  No submissions found.
                </td>
              </tr>
            ) : (
              paginatedSubmissions.map((submission) => (
                <tr
                  key={submission._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 border-b dark:border-gray-700"
                >
                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                    {submission.problemName}{" "}{submission.index}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                    {submission.rating !== null ? submission.rating : 'N/A'}
                  </td>
                  <td
                    className={`px-4 py-2 text-sm ${
                      submission.verdict === 'OK'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {submission.verdict}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                    {submission.language}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center space-x-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-lg text-sm ${
              currentPage === 1
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-green-500 hover:text-white'
            }`}
          >
            Previous
          </button>
          <span className="text-sm text-gray-800 dark:text-gray-200">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-lg text-sm ${
              currentPage === totalPages
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-green-500 hover:text-white'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default LatestSubmissions;