import api from '../lib/axios';
import type { Branch, Investor, Sale, CreateSaleDTO, User, PaginatedResponse } from '../types';

export const getBranches = async (limit?: number): Promise<Branch[]> => {
    let url = '/branches';
    if (limit !== undefined) url += `?limit=${limit}`;
    const response = await api.get<Branch[]>(url);
    return response.data;
};

export const createBranch = async (branchData: Omit<Branch, '_id'>): Promise<Branch> => {
    const response = await api.post<Branch>('/branches', branchData);
    return response.data;
};

export const getInvestors = async (page = 1, limit = 10, filters: { startDate?: string, endDate?: string, search?: string } = {}): Promise<PaginatedResponse<Investor>> => {
    let url = `/investors?page=${page}&limit=${limit}`;
    if (filters.startDate) url += `&startDate=${filters.startDate}`;
    if (filters.endDate) url += `&endDate=${filters.endDate}`;
    if (filters.search) url += `&search=${filters.search}`;

    const response = await api.get<PaginatedResponse<Investor>>(url);
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

export interface InvestorTeam {
    upline: Investor | null;
    current: Partial<Investor>;
    direct: Partial<Investor>[];
    indirect: Partial<Investor>[];
    all: Partial<Investor>[];
    downline?: Partial<Investor>[]; // Keeping for compatibility
}

export const getInvestorTeam = async (id: string): Promise<InvestorTeam> => {
    const response = await api.get<InvestorTeam>(`/investors/${id}/team`);
    return response.data;
};

export const getSales = async (page = 1, limit = 10, filters: { branchId?: string, startDate?: string, endDate?: string, status?: string } = {}): Promise<PaginatedResponse<Sale>> => {
    let url = `/sales?page=${page}&limit=${limit}`;
    if (filters.branchId) url += `&branchId=${filters.branchId}`;
    if (filters.startDate) url += `&startDate=${filters.startDate}`;
    if (filters.endDate) url += `&endDate=${filters.endDate}`;
    if (filters.status) url += `&status=${filters.status}`;

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
