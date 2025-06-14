export interface StudentQueryParams {
    page?: number;
    limit?: number;
    minRating?: number;
    maxRating?: number;
    sortBy?: string;
    sortOrder?:string;
}