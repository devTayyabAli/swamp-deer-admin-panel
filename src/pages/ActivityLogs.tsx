import React, { useState, useEffect } from 'react';
import { Clock, Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { getActivityLogs, getActiveAdmins } from '../services/dataService';
import toast from 'react-hot-toast';

interface Admin {
    _id: string;
    name: string;
    email: string;
}

interface ActivityLog {
    _id: string;
    adminName: string;
    adminEmail: string;
    action: string;
    actionCategory: string;
    targetType: string;
    targetName: string;
    changes: any;
    success: boolean;
    createdAt: string;
}

const ActivityLogs: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAdmin, setSelectedAdmin] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const categories = ['ALL', 'WITHDRAWAL', 'SALE', 'REWARD', 'USER', 'PLAN', 'BRANCH', 'OTHER'];

    const actionColorMap: Record<string, string> = {
        APPROVE_WITHDRAWAL: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        REJECT_WITHDRAWAL: 'bg-red-100 text-red-700 border-red-200',
        APPROVE_SALE: 'bg-blue-100 text-blue-700 border-blue-200',
        REJECT_SALE: 'bg-orange-100 text-orange-700 border-orange-200',
        APPROVE_REWARD: 'bg-purple-100 text-purple-700 border-purple-200',
        REJECT_REWARD: 'bg-pink-100 text-pink-700 border-pink-200',
        UPDATE_USER: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [page, selectedAdmin, selectedCategory, startDate, endDate]);

    const fetchAdmins = async () => {
        try {
            const response = await getActiveAdmins();
            setAdmins(response.data || []);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params: any = {
                page,
                limit: 20
            };

            if (selectedAdmin) params.adminId = selectedAdmin;
            if (selectedCategory && selectedCategory !== 'ALL') params.actionCategory = selectedCategory;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (searchTerm) params.search = searchTerm;

            const response = await getActivityLogs(params);

            if (response.success) {
                setLogs(response.data.logs || []);
                setTotalPages(response.data.totalPages || 1);
                setTotalCount(response.data.totalCount || 0);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch activity logs');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchLogs();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionColor = (action: string) => {
        return actionColorMap[action] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-main">Activity Logs</h1>
                <p className="text-text-muted">Track all admin actions and changes in the system</p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 bg-card-bg p-4 rounded-xl border border-border-subtle">
                <div>
                    <label className="block text-sm font-semibold text-text-muted mb-2">Admin</label>
                    <select
                        value={selectedAdmin}
                        onChange={(e) => {
                            setSelectedAdmin(e.target.value);
                            setPage(1);
                        }}
                        className="w-full px-3 py-2 bg-soft border border-border-subtle rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                        <option value="">All Admins</option>
                        {admins.map((admin) => (
                            <option key={admin._id} value={admin._id}>
                                {admin.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-text-muted mb-2">Category</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setPage(1);
                        }}
                        className="w-full px-3 py-2 bg-soft border border-border-subtle rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-text-muted mb-2">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-soft border border-border-subtle rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-text-muted mb-2">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-soft border border-border-subtle rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-text-muted mb-2">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-3 py-2 bg-soft border border-border-subtle rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="bg-card-bg p-4 rounded-xl border border-border-subtle">
                <p className="text-sm font-semibold text-text-muted">
                    Showing {logs.length} of {totalCount} total activities
                </p>
            </div>

            {/* Activity Table */}
            <div className="bg-card-bg rounded-xl border border-border-subtle overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-soft/50 border-b border-border-subtle">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Admin</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Target</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Changes</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                        Loading...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                        No activity logs found
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-soft/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-text-muted">
                                                <Clock className="w-4 h-4" />
                                                {formatDate(log.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-semibold text-text-main">{log.adminName}</div>
                                                <div className="text-xs text-text-muted">{log.adminEmail}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getActionColor(log.action)}`}>
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-text-main">{log.targetName || 'N/A'}</div>
                                            <div className="text-xs text-text-muted">{log.targetType}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.changes && log.changes.status && (
                                                <div className="text-xs">
                                                    <span className="text-text-muted">{log.changes.status.from}</span>
                                                    {' → '}
                                                    <span className="font-semibold text-primary">{log.changes.status.to}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.success ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-soft/30 border-t border-border-subtle flex items-center justify-between">
                    <div className="text-sm text-text-muted">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-white dark:bg-soft border border-border-subtle rounded-lg text-sm font-bold text-text-main disabled:opacity-50 disabled:cursor-not-allowed hover:bg-soft transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-white dark:bg-soft border border-border-subtle rounded-lg text-sm font-bold text-text-main disabled:opacity-50 disabled:cursor-not-allowed hover:bg-soft transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs;
