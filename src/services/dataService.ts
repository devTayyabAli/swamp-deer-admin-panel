import api from '../lib/axios';
import type { Branch, Investor, Sale, CreateSaleDTO, User, PaginatedResponse, InvestmentPlan } from '../types';

export const getBranches = async (limit?: number, filters?: { startDate?: string, endDate?: string }): Promise<Branch[]> => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', limit.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await api.get<Branch[]>(`/branches?${params.toString()}`);
    return response.data;
};

export const createBranch = async (branchData: Omit<Branch, '_id'>): Promise<Branch> => {
    const response = await api.post<Branch>('/branches', branchData);
    return response.data;
};

export const getInvestors = async (page = 1, limit = 10, filters: { startDate?: string, endDate?: string, search?: string, branchId?: string } = {}): Promise<PaginatedResponse<Investor>> => {
    let url = `/investors?page=${page}&limit=${limit}`;
    if (filters.startDate) url += `&startDate=${filters.startDate}`;
    if (filters.endDate) url += `&endDate=${filters.endDate}`;
    if (filters.search) url += `&search=${filters.search}`;
    if (filters.branchId) url += `&branchId=${filters.branchId}`;


    const response = await api.get<PaginatedResponse<Investor>>(url);
    return response.data;
};

export const searchUsers = async (query: string): Promise<User[]> => {
    const response = await api.get<User[]>(`/investors/search?q=${encodeURIComponent(query)}`);
    return response.data;
};

export const getActivityLogs = async (params: {
    page?: number;
    limit?: number;
    adminId?: string;
    actionCategory?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            queryParams.append(key, value.toString());
        }
    });

    const response = await api.get(`/admin/activity-logs?${queryParams.toString()}`);
    return response.data;
};

export const getActiveAdmins = async () => {
    const response = await api.get('/admin/activity-logs/admins');
    return response.data;
};

export const toggleInvestorStatus = async (id: string): Promise<any> => {
    const response = await api.put<any>(`/investors/${id}/status`);
    return response.data;
};

export const createInvestor = async (investorData: Omit<Investor, '_id' | 'status' | 'createdAt' | 'amountInvested' | 'totalReward' | 'downlineCount'>): Promise<Investor> => {
    const response = await api.post<Investor>('/investors', investorData);
    return response.data;
};

export interface TeamMember extends Partial<Investor> {
    amount: number;
    profit: number;
    date: string;
    upline: string;
    uplineId?: string;
    type: 'direct' | 'indirect';
    level?: number;
}

export interface InvestorTeam {
    upline: Investor | null;
    current: Partial<Investor>;
    direct: TeamMember[];
    indirect: TeamMember[];
    all: TeamMember[];
    downline?: TeamMember[]; // Keeping for compatibility
}

export const getInvestorTeam = async (id: string): Promise<InvestorTeam> => {
    const response = await api.get<InvestorTeam>(`/investors/${id}/team`);
    return response.data;
};

export const getInvestorRewards = async (id: string, page = 1, limit = 10, filters: { type?: string, startDate?: string, endDate?: string } = {}): Promise<PaginatedResponse<any>> => {
    let url = `/rewards/investor/${id}?page=${page}&limit=${limit}`;
    if (filters.type) url += `&type=${filters.type}`;
    if (filters.startDate) url += `&startDate=${filters.startDate}`;
    if (filters.endDate) url += `&endDate=${filters.endDate}`;

    const response = await api.get<any>(url);
    return response.data?.data || response.data;
};
export const getSales = async (page = 1, limit = 10, filters: { branchId?: string, startDate?: string, endDate?: string, status?: string, investorId?: string } = {}): Promise<PaginatedResponse<Sale>> => {
    let url = `/sales?page=${page}&limit=${limit}`;
    if (filters.branchId) url += `&branchId=${filters.branchId}`;
    if (filters.startDate) url += `&startDate=${filters.startDate}`;
    if (filters.endDate) url += `&endDate=${filters.endDate}`;
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.investorId) url += `&investorId=${filters.investorId}`;

    const response = await api.get<PaginatedResponse<Sale>>(url);
    return response.data;
};

export const updateSaleStatus = async (id: string, status: string): Promise<Sale> => {
    const response = await api.put<Sale>(`/sales/${id}/status`, { status });
    return response.data;
};

export const createSale = async (saleData: CreateSaleDTO): Promise<Sale> => {
    const response = await api.post<Sale>('/sales', saleData);
    return response.data;
};

export const updateBranch = async (id: string, branchData: Partial<Branch>): Promise<Branch> => {
    const response = await api.put<Branch>(`/branches/${id}`, branchData);
    return response.data;
};

// Services for Users
export const getUsers = async (): Promise<User[]> => {
    const response = await api.get<any>('/auth/users?limit=-1');
    return response.data?.data?.items || response.data?.items || [];
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put<any>(`/auth/users/${id}`, userData);
    return response.data?.data || response.data;
};

// Services for Investment Plans
export const getPlans = async (scope?: string, scopeId?: string): Promise<InvestmentPlan[]> => {
    let url = '/plans';
    if (scope) url += `?scope=${scope}`;
    if (scopeId) url += `&scopeId=${scopeId}`;
    const response = await api.get<any>(url);
    return response.data?.data || response.data || [];
};

export const upsertPlan = async (planData: InvestmentPlan): Promise<InvestmentPlan> => {
    const response = await api.post<any>('/plans', planData);
    return response.data?.data || response.data;
};

export const deletePlan = async (id: string): Promise<any> => {
    const response = await api.delete<any>(`/plans/${id}`);
    return response.data;
};
