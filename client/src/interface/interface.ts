
export interface CreateStudentRequest { 
    name: string;
    email: string;
    phone: string;
    cfHandle: string;
}
export interface UpdateStudentRequest {
    name?: string;
    email?: string;
    phone?: string;
    cfHandle?: string;
}
export interface StudentDetails {
    id: string;
    name: string;
    email: string;
    phone: string;
    cfHandle: string;
    rating: number;
    maxRating: number;
    rank: string;
    titlePhoto: string;
    lastOnline: string;      
    registeredAt: string;   
    organization: string;
    friendOfCount: number;
    contestCount: number;
    submissionCount: number;
    createdAt: string;      
    updatedAt: string;       
}
export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalStudents: number;
    limit: number;
}

export interface StudentListResponse {
    students: StudentDetails[];
    pagination: Pagination;
}

export interface StudentHandleResponse {
  student: {
    id: string;
    cfHandle: string;
    name: string;
    email: string;
    phone: string;
    rating: number;
    maxRating: number;
    rank: string;
    titlePhoto: string;
    lastOnline: string;
    registeredAt: string;
    organization: string;
    friendOfCount: number;
    contestCount: number;
    submissionCount: number;
    lastReminderSent: string | null;
    reminderCount: number;
    lastSyncedAt: string;
  };
  days: string;
  contestDays: string;
  metrics: {
    hardestProblem: {
      problemName: string;
      contestId: number;
      index: string;
      rating: number;
      verdict: string;
    };
    totalProblemsSolved: number;
    averageRating: string;
    averageProblemsPerDay: string;
    totalSubmissions: number;
    totalSolved: number;
  };
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
  };
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