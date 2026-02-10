import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { toast } from 'react-hot-toast';
import { Check, X, Search, Filter, Trophy, User, Calendar, Gift } from 'lucide-react';
import clsx from 'clsx';

interface RewardRequest {
    _id: string;
    userId: {
        _id: string;
        name: string;
        userName: string;
        email: string;
    };
    rankId: number;
    giftId: {
        _id: string;
        title: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

const ApproveRewards = () => {
    const [requests, setRequests] = useState<RewardRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/rewards/requests?status=${statusFilter === 'all' ? '' : statusFilter}`);
            if (response.data.success) {
                setRequests(response.data.data.items);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch reward requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            setProcessing(id);
            const response = await api.put(`/rewards/requests/${id}`, { status });

            if (response.data.success) {
                toast.success(`Request ${status} successfully`);
                setRequests(prev => prev.filter(r => r._id !== id));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update request');
        } finally {
            setProcessing(null);
        }
    };

    const filteredRequests = requests.filter(r =>
        r.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userId.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.giftId.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-swamp-deer/10 rounded-2xl">
                        <Trophy className="w-6 h-6 text-swamp-deer" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-swamp-deer">Reward Approvals</h2>
                        <p className="text-sm text-gray-500">Review and approve user rank achievement rewards</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name, ID or reward..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-neutral-light border-none rounded-xl text-sm focus:ring-2 focus:ring-forest-green/20"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-gray-400 w-4 h-4" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 bg-neutral-light border-none rounded-xl text-sm py-2 px-4 focus:ring-2 focus:ring-forest-green/20"
                    >
                        <option value="pending">Pending Only</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="all">All Requests</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green"></div>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 gap-4">
                        <div className="p-4 bg-gray-50 rounded-full">
                            <Gift className="w-12 h-12 opacity-20" />
                        </div>
                        <p className="font-medium text-lg tracking-tight">No reward requests found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-light/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reward Info</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRequests.map((request) => (
                                    <tr key={request._id} className="hover:bg-neutral-light/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-forest-green/5 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-forest-green" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-none mb-1">{request.userId.name}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">ID: {request.userId.userName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-warm-gold uppercase tracking-widest mb-1 italic">Rank {request.rankId}</span>
                                                <span className="text-sm font-bold text-gray-900">{request.giftId.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(request.createdAt).toLocaleDateString(undefined, {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {request.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(request._id, 'approved')}
                                                        disabled={!!processing}
                                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-100 disabled:opacity-50"
                                                        title="Approve"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(request._id, 'rejected')}
                                                        disabled={!!processing}
                                                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100 disabled:opacity-50"
                                                        title="Reject"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={clsx(
                                                    "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                    request.status === 'approved'
                                                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                        : "bg-red-100 text-red-700 border-red-200"
                                                )}>
                                                    {request.status}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApproveRewards;
