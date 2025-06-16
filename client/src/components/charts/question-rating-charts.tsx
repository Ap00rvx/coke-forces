import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import LatestSubmissions from '../submissions-section';




// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Interface for submission data
export interface Submission {
  id: string;
  problem: {
    rating: number;
    name: string;
  };
  creationTimeSeconds: number;
}

// Props interface
export interface ProblemStatsProps {
  submissions: Submission[];
  allSubmissions:{
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
    contests: {
    ratingGraph: {
        date: string;
        rating: number;
    }[];
    contestList: {
        contestId: number;
        contestName: string;
        rank: number;
        ratingChange: number;
        unsolvedProblems: number;
    }[];
    }
}

const ProblemStats: React.FC<ProblemStatsProps> = ({ submissions, allSubmissions }) => {
  // State for selected time filter
  const [daysFilter, setDaysFilter] = useState<number>(90);

  // Current timestamp in seconds
  const now = Math.floor(Date.now() / 1000);

  // Filter submissions based on selected days
  const filteredSubmissions = useMemo(() => {
    const cutoff = now - daysFilter * 24 * 60 * 60;
    return submissions.filter((submission) => submission.creationTimeSeconds >= cutoff);
  }, [submissions, daysFilter]);

  // Prepare data for bar chart (problems solved per rating bucket)
  const ratingBuckets = useMemo(() => {
    const buckets: { [key: number]: number } = {};
    filteredSubmissions.forEach((submission) => {
      const rating = Math.floor(submission.problem.rating / 100) * 100; // Bucket by 100s
      buckets[rating] = (buckets[rating] || 0) + 1;
    });
    return buckets;
  }, [filteredSubmissions]);

  const barData = {
    labels: Object.keys(ratingBuckets).map((rating) => `${rating}-${parseInt(rating) + 99}`),
    datasets: [
      {
        label: 'Problems Solved',
        data: Object.values(ratingBuckets),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Problems Solved by Rating' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Number of Problems' } },
      x: { title: { display: true, text: 'Rating Range'
         

       } },
    },
  };

  return (
    <div className="p-4 max-w-5xl  w-full mx-auto">
      {/* Filter Buttons */}
      <div className="mb-4 flex justify-center space-x-4 dark:bg-gray-800 dark:text-white">
        {[7, 30, 90].map((days) => (
          <button
            key={days}
            className={`px-4 py-2 rounded dark:text-gray-800 dark:bg-gray-200 hover:bg-blue-500 hover:text-white transition-colors text-xs ${
              daysFilter === days ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setDaysFilter(days)}
          >
            Last {days} Days
          </button>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="mb-8">
        <Bar data={barData} options={barOptions} />
      </div>
      <LatestSubmissions submissions={allSubmissions}

      />
      
    </div>
  );
};

export default ProblemStats;