import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Interface for contest data
interface ContestData {
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

// Props interface
interface RatingGraphProps {
  contests: ContestData;
}

const RatingGraph: React.FC<RatingGraphProps> = ({ contests }) => {
  // State for selected time filter ('all' for all time)
  const [daysFilter, setDaysFilter] = useState<string>('all');

  // Current timestamp in milliseconds
  const now = Date.now();

  // Filter rating graph data based on selected days
  const filteredRatingData = useMemo(() => {
    if (daysFilter === 'all') {
      return contests.ratingGraph;
    }
    const cutoff = now - parseInt(daysFilter) * 24 * 60 * 60 * 1000;
    return contests.ratingGraph.filter((entry) => new Date(entry.date).getTime() >= cutoff);
  }, [contests.ratingGraph, daysFilter]);

  // Create a map of contest indices to contest details for tooltip
  const contestMap = useMemo(() => {
    const map: { [date: string]: { contestName: string; ratingChange: number } } = {};
    // Since contestList lacks date, assume sequential alignment with ratingGraph
    contests.ratingGraph.forEach((entry, index) => {
      if (contests.contestList[index]) {
        map[entry.date] = {
          contestName: contests.contestList[index].contestName,
          ratingChange: contests.contestList[index].ratingChange,
        };
      }
    });
    return map;
  }, [contests.contestList, contests.ratingGraph]);

  // Prepare data for line chart
  const lineData = {

    labels: filteredRatingData.map((entry) => new Date(entry.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Rating',
        data: filteredRatingData.map((entry) => entry.rating),
        fill: true,
        borderColor: '#4CAF50', // Codeforces green
        backgroundColor: '#4CAF50',
        tension: 0.2,
        pointRadius: 4,
        pointHoverRadius: 10,
        pointBackgroundColor: '#4CAF50',
        pointBorderColor: '#4CAF50',
        pointBorderWidth: 1,
        pointHoverBackgroundColor: 'radial-gradient(circle, rgba(76,175,80,0.8) 0%, rgba(76,175,80,0.4) 100%)',
        pointHoverBorderColor: '#388E3C',
        pointHoverBorderWidth: 4,
        pointStyle: "circle",
        pointShadow: '0 0 5px rgba(0,0,0,0.3)', // Custom shadow effect
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuad' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 10 },
          color: '#333',
        },
      },
      title: {
        display: true,
        text: 'Rating Progression',
        font: { size: 18, weight: 'bold' as const },
        color: '#999',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        callbacks: {
          title: (tooltipItems: import('chart.js').TooltipItem<'line'>[]) => tooltipItems[0].label,
          label: (context: import('chart.js').TooltipItem<'line'>) => {
            const rating = context.parsed.y;
            const date = filteredRatingData[context.dataIndex].date;
            const contestInfo = contestMap[date];
            if (contestInfo) {
              return [
                `Rating: ${rating}`,
                `Contest: ${contestInfo.contestName}`,
                `Rating Change: ${contestInfo.ratingChange > 0 ? '+' : ''}${contestInfo.ratingChange}`,
              ];
            }
            return `Rating: ${rating}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Date', font: { size: 10 } },
        grid: { display: true },
        ticks: { color: '#966', font: { size: 10 }  
     },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Rating', font: { size: 14 } },
        suggestedMin: filteredRatingData.length
          ? Math.min(...filteredRatingData.map((entry) => entry.rating)) - 100
          : 0,
        suggestedMax: filteredRatingData.length
          ? Math.max(...filteredRatingData.map((entry) => entry.rating)) + 100
          : 1000,
        grid: { color: 'rgba(0, 0, 0, 0.1)', drawBorder: false },
        ticks: {
          color: '#966',
          stepSize: 100, // Default gap of 100
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <div className="p-6 max-w-5xl mx-auto ">
      {/* Filter Buttons */}
      <div className="mb-6 flex justify-center space-x-3">
        {['all', '30', '90', '365'].map((filter) => (
          <button
            key={filter}
            className={`px-5 py-2 rounded-lg font-medium  transition-all md:text-sm  text-xs ${
              daysFilter === filter
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-green-400 hover:text-white'
            }`}
            onClick={() => setDaysFilter(filter)}
          >
            {filter === 'all' ? 'All Time' : `Last ${filter} Days`}
          </button>
        ))}
      </div>

      {/* Line Chart */}
      <div className="p-1 rounded-lg">
        <Line data={lineData} options={lineOptions} />
      </div>
    </div>
  );
};

export default RatingGraph;