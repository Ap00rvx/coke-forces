import React, { useMemo } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';


interface SubmissionHeatmapProps {
  submissions:{
    creationTimeSeconds: number; // 
    problem: {
        name: string;
        rating: number; 
    };
  }[];
  daysFilter: number;
}

const SubmissionHeatmap: React.FC<SubmissionHeatmapProps> = ({ submissions, daysFilter }) => {
  // Current timestamp in seconds
  const now = Math.floor(Date.now() / 1000);

  // Prepare data for submission heatmap
  const heatmapData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    submissions.forEach((submission) => {
      const date = new Date(submission.creationTimeSeconds * 1000);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }, [submissions]);

  return (
    <div className="w-full">

      <div className="w-full overflow-x-auto">
        <div style={{ width: '100%', padding: '20px' }}>
          <CalendarHeatmap
            
            showWeekdayLabels={true}
            weekdayLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
            startDate={new Date(now * 1000 - daysFilter * 24 * 60 * 60 * 1000)}
            endDate={new Date(now * 1000)}
            values={heatmapData}
            classForValue={(value) => {
              if (!value || typeof value.count !== 'number') return 'color-empty';
              if (value.count < 2) return 'color-scale-1';
              if (value.count < 5) return 'color-scale-2';
              if (value.count < 10) return 'color-scale-3';
              return 'color-scale-4';
            }}
          />
        </div>
      </div>
      {/* CSS for Heatmap Colors */}
      <style>{`
      .react-calendar-heatmap text {
  font-size: 1rem;         /* Change text size */
  fill: #374151;           /* Change text color */
  font-weight: 600;        /* Make text bold */
}

.react-calendar-heatmap .react-calendar-heatmap-weekday-label {
  font-size: 6px;
  fill: #6b7280; 
  font-weight: 100;
}

.react-calendar-heatmap .react-calendar-heatmap-month-label {
  font-size: 8px;
  fill: #6b7280;
  font-weight: 400;
}
        .color-empty { fill: #ebedf0; }
        .color-scale-1 { fill: #c6e48b; }
        .color-scale-2 { fill: #7bc96f; }
        .color-scale-3 { fill: #239a3b; }
        .color-scale-4 { fill: #196127; }
      `}</style>
    </div>
  );
};

export default SubmissionHeatmap;