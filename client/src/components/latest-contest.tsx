import React, { useState, useMemo } from 'react';

// Interface for contest data


// Props interface
interface LatestContestsProps {
  contestList: {
   
      contestId: number;
      contestName: string;
      rank: number;
      ratingChange: number;
      unsolvedProblems: number;
    
  }[];
}

const LatestContests: React.FC<LatestContestsProps> = ({ contestList }) => {
  // State for current page
  const [currentPage, setCurrentPage] = useState<number>(1);
  const contestsPerPage = 5;

  // Paginate contests (assuming input is ordered by recency)
  const paginatedContests = useMemo(() => {
    const startIndex = (currentPage - 1) * contestsPerPage;
    return contestList.slice(startIndex, startIndex + contestsPerPage);
  }, [contestList, currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(contestList.length / contestsPerPage);

  // Handle page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="mt-2  max-w-5xl mx-auto ">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Latest Contests</h2>

      {/* Contests Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600">
                Contest Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600">
                Rank
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600">
                Rating Change
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600">
                Unsolved Problems
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedContests.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-2 text-center text-gray-600 dark:text-gray-400"
                >
                  No contests found.
                </td>
              </tr>
            ) : (
              paginatedContests.map((contest) => (
                <tr
                  key={contest.contestId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 border-b dark:border-gray-700"
                >
                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                    {contest.contestName}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                    {contest.rank}
                  </td>
                  <td
                    className={`px-4 py-2 text-sm ${
                      contest.ratingChange >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {contest.ratingChange >= 0 ? '+' : ''}{contest.ratingChange}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                    {contest.unsolvedProblems}
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

export default LatestContests;