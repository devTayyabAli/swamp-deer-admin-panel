import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { toast } from 'react-hot-toast';
import { Check, X, Search, Filter, Wallet, User, Calendar, History, Eye, Landmark, Phone, Mail, Hash, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface WithdrawalRequest {
    _id: string;
    userId: {
        _id: string;
        name: string;
        userName: string;
        email: string;
        phone?: string;
    };
    amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    method: 'CASH' | 'BANK';
    bankDetails?: {
        accountNumber: string;
        bankName: string;
        ifscCode: string;
        accountHolderName: string;
        branchName: string;
    };
    createdAt: string;
}

const WithdrawalHistory = () => {
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [processing, setProcessing] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/withdrawals');
            if (response.data.success) {
                setRequests(response.data.data);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch withdrawal history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            setProcessing(id);
            const response = await api.put(`/withdrawals/${id}/status`, { status });

            if (response.data.success) {
                toast.success(`Request ${status} successfully`);
                setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update request');
        } finally {
            setProcessing(null);
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesSearch =
            r.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.userId.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.amount.toString().includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-forest-green/10 rounded-2xl">
                        <History className="w-6 h-6 text-forest-green" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Withdrawal History</h2>
                        <p className="text-sm text-gray-500">Track and review all previous withdrawal transactions</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name, ID or amount..."
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
                        <option value="all">All Requests</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
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
                            <History className="w-12 h-12 opacity-20" />
                        </div>
                        <p className="font-medium text-lg tracking-tight">No history found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-light/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</th>
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
                                                    <p className="font-bold text-gray-900 leading-none mb-1">{request.userId?.name}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">ID: {request.userId?.userName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">Rs {request.amount.toLocaleString()}</span>
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Net: Rs {(request.amount * 0.95).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                                                request.method === 'BANK'
                                                    ? "bg-blue-50 text-blue-700 border-blue-100"
                                                    : "bg-orange-50 text-orange-700 border-orange-100"
                                            )}>
                                                {request.method === 'BANK' ? 'Bank Transfer' : 'Cash / USDT'}
                                            </span>
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
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 bg-neutral-light text-gray-600 rounded-xl hover:bg-forest-green hover:text-white transition-all shadow-sm border border-gray-100"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {request.status === 'pending' ? (
                                                    <>
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
                                                    </>
                                                ) : (
                                                    <span className={clsx(
                                                        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                        request.status === 'approved' || request.status === 'completed'
                                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                            : "bg-red-100 text-red-700 border-red-200"
                                                    )}>
                                                        {request.status}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-forest-green text-white">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Wallet className="w-6 h-6" />
                                Withdrawal Details
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            {/* User Info Section */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" />
                                    Partner Information
                                </h4>
                                <div className="grid grid-cols-2 gap-6 bg-neutral-light/50 p-4 rounded-2xl border border-gray-100">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Full Name</p>
                                        <p className="text-sm font-bold text-gray-900">{selectedRequest.userId.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Partner ID</p>
                                        <p className="text-sm font-black text-forest-green">{selectedRequest.userId.userName}</p>
                                    </div>
                                    <div className="space-y-1 flex items-start gap-2 col-span-2">
                                        <Mail className="w-4 h-4 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Email Address</p>
                                            <p className="text-sm font-bold text-gray-900">{selectedRequest.userId.email}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 flex items-start gap-2 col-span-2">
                                        <Phone className="w-4 h-4 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Phone Number</p>
                                            <p className="text-sm font-bold text-gray-900">{selectedRequest.userId.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Withdrawal Details Section */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Hash className="w-3.5 h-3.5" />
                                    Transaction Summary
                                </h4>
                                <div className="grid grid-cols-2 gap-6 bg-neutral-light/50 p-4 rounded-2xl border border-gray-100">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Gross Amount</p>
                                        <p className="text-lg font-black text-gray-900">Rs {selectedRequest.amount.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter text-red-500">Service Fee (5%)</p>
                                        <p className="text-sm font-bold text-red-500">-Rs {(selectedRequest.amount * 0.05).toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1 col-span-2 border-t border-gray-200 pt-3 flex justify-between items-center">
                                        <p className="text-sm font-black uppercase text-gray-600">Net Payable</p>
                                        <p className="text-xl font-black text-emerald-600">Rs {(selectedRequest.amount * 0.95).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Method Details Section */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    {selectedRequest.method === 'BANK' ? <Landmark className="w-3.5 h-3.5" /> : <Wallet className="w-3.5 h-3.5" />}
                                    Payment Method: {selectedRequest.method === 'BANK' ? 'Bank Transfer' : 'Cash / USDT'}
                                </h4>

                                {selectedRequest.method === 'BANK' ? (
                                    selectedRequest.bankDetails ? (
                                        <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-5 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Landmark size={80} />
                                            </div>
                                            <div className="space-y-1 col-span-2">
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Account Holder</p>
                                                <p className="text-base font-black text-blue-900">{selectedRequest.bankDetails.accountHolderName}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Bank Name</p>
                                                <p className="text-sm font-bold text-blue-900">{selectedRequest.bankDetails.bankName}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Account / IBAN</p>
                                                <p className="text-sm font-bold text-blue-900">{selectedRequest.bankDetails.accountNumber}</p>
                                            </div>
                                            {selectedRequest.bankDetails.ifscCode && (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">IFSC / Swift</p>
                                                    <p className="text-sm font-bold text-blue-900">{selectedRequest.bankDetails.ifscCode}</p>
                                                </div>
                                            )}
                                            {selectedRequest.bankDetails.branchName && (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Branch / City</p>
                                                    <p className="text-sm font-bold text-blue-900">{selectedRequest.bankDetails.branchName}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 flex items-center gap-3">
                                            <AlertCircle size={20} className="shrink-0" />
                                            <p className="text-xs font-bold uppercase tracking-tight">Bank details not provided with this request.</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="p-4 bg-neutral-light rounded-2xl border border-gray-100 flex items-center gap-3">
                                        <Check size={20} className="text-forest-green" />
                                        <p className="text-xs font-bold text-gray-600 uppercase tracking-tight italic">Regular payout method confirmed.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                            {selectedRequest.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => {
                                            handleUpdateStatus(selectedRequest._id, 'approved');
                                            setIsModalOpen(false);
                                        }}
                                        disabled={!!processing}
                                        className="flex-1 py-3 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                    >
                                        Approve Payment
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleUpdateStatus(selectedRequest._id, 'rejected');
                                            setIsModalOpen(false);
                                        }}
                                        disabled={!!processing}
                                        className="flex-1 py-3 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                                    >
                                        Reject Request
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className={clsx(
                                    "py-3 font-black rounded-xl transition-all border",
                                    selectedRequest.status === 'pending' ? "px-6 border-gray-200 text-gray-500 hover:bg-gray-100" : "flex-1 bg-forest-green text-white hover:bg-deep-green"
                                )}
                            >
                                {selectedRequest.status === 'pending' ? 'Cancel' : 'Close Details'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WithdrawalHistory;
