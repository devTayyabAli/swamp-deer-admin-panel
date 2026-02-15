import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchInvestors } from '../store/slices/investorSlice';
import { toggleInvestorStatus, updateUser, getInvestorRewards, getSales } from '../services/dataService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import type { Investor, Sale } from '../types';
import { Calendar, Coins, History, TrendingUp, Users2, Wallet, Edit3, UserCheck, UserMinus, MoreHorizontal } from 'lucide-react';

interface EditInvestorModalProps {
    investor: Investor;
    onClose: () => void;
    onSave: (updatedData: Partial<Investor>) => Promise<void>;
}

const EditInvestorModal = ({ investor, onClose, onSave }: EditInvestorModalProps) => {
    const [fullName, setFullName] = useState(investor.fullName);
    const [email, setEmail] = useState(investor.email);
    const [phone, setPhone] = useState(investor.phone);
    const [address, setAddress] = useState(investor.address);
    const [productStatus, setProductStatus] = useState(investor.productStatus || 'without_product');
    const [profitRate, setProfitRate] = useState((investor.profitRate || 0.05) * 100);
    const [commissionRate, setCommissionRate] = useState((investor.commissionRate || 0.05) * 100);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({
                fullName,
                email,
                phone,
                address,
                productStatus,
                profitRate: profitRate / 100,
                commissionRate: commissionRate / 100
            });
            onClose();
        } catch (err) {
            toast.error('Failed to update investor');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-border-light flex justify-between items-center bg-neutral-light/30">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Edit Investor Details</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-gray-400">close</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input
                            required
                            className="w-full rounded-lg border-border-light bg-neutral-light/30 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm p-3 font-semibold transition-all"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input
                            required
                            type="email"
                            className="w-full rounded-lg border-border-light bg-neutral-light/30 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm p-3 font-semibold transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <input
                            required
                            className="w-full rounded-lg border-border-light bg-neutral-light/30 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm p-3 font-semibold transition-all"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address</label>
                        <textarea
                            required
                            rows={2}
                            className="w-full rounded-lg border-border-light bg-neutral-light/30 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm p-3 font-semibold transition-all resize-none"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Status</label>
                        <select
                            className="w-full rounded-lg border-border-light bg-neutral-light/30 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm p-3 font-semibold transition-all"
                            value={productStatus}
                            onChange={(e) => setProductStatus(e.target.value as any)}
                        >
                            <option value="with_product">With Product</option>
                            <option value="without_product">Without Product</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Profit Share (%)</label>
                            <input
                                type="number"
                                step="any"
                                className="w-full rounded-lg border-border-light bg-neutral-light/30 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm p-3 font-semibold transition-all"
                                value={profitRate}
                                onChange={(e) => setProfitRate(parseFloat(e.target.value))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Commission (%)</label>
                            <input
                                type="number"
                                step="any"
                                className="w-full rounded-lg border-border-light bg-neutral-light/30 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm p-3 font-semibold transition-all"
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-lg text-sm font-bold text-gray-500 hover:bg-neutral-light transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div >
        </div>
    );
};

const ReceiptViewModal = ({ path, onClose }: { path: string; onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-8 animate-in fade-in duration-300">
            <button
                onClick={onClose}
                className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all group active:scale-95 z-[210]"
            >
                <span className="material-symbols-outlined group-hover:rotate-90 transition-all">close</span>
            </button>
            <div className="relative max-w-full max-h-full flex items-center justify-center animate-in zoom-in-95 duration-300">
                <img
                    src={`${(import.meta.env.VITE_API_URL || '').replace('/api', '')}/${path}`}
                    alt="Investment Receipt"
                    className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain border border-white/10"
                />
                <div className="absolute -bottom-12 left-0 right-0 text-center">
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest italic">Encrypted Secure Asset Verification</p>
                </div>
            </div>
        </div>
    );
};

interface InvestmentHistoryModalProps {
    investor: Investor;
    onClose: () => void;
}

const InvestmentHistoryModal = ({ investor, onClose }: InvestmentHistoryModalProps) => {
    const [investments, setInvestments] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

    const fetchInvestments = async () => {
        try {
            setLoading(true);
            const res = await getSales(1, 100, {
                investorId: investor._id
            });
            if (res.items) {
                setInvestments(res.items);
            }
        } catch (error) {
            toast.error('Failed to fetch investment history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvestments();
    }, []);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-border-light flex justify-between items-center bg-neutral-light/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-forest-green/10 rounded-2xl">
                            <Coins className="w-6 h-6 text-forest-green" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight italic">Investment Asset Ledger</h3>
                            <p className="text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-widest leading-none opacity-80">
                                Portfolio: <span className="text-forest-green">{investor.fullName}</span> • Capital Deployment Tracking
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all group active:scale-95">
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-900 group-hover:rotate-90 transition-all">close</span>
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-auto bg-white">
                    <div className="border border-border-light rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-light/50 border-b border-border-light">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-3 border-forest-green/20 border-t-forest-green rounded-full animate-spin"></div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accessing Vault...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : investments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-30">
                                                <History className="w-12 h-12 text-gray-400" />
                                                <p className="text-xs font-black uppercase tracking-widest">No deployed capital found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : investments.map((sale) => (
                                    <tr key={sale._id} className="hover:bg-neutral-light/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-gray-900 tracking-tight">
                                                {new Date(sale.date || sale.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                                                {sale.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
                                                sale.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    sale.status === 'rejected' ? "bg-red-50 text-red-600 border-red-100" :
                                                        "bg-amber-50 text-amber-600 border-amber-100"
                                            )}>
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-xs font-black text-forest-green">
                                                Rs {sale.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {sale.paymentMethod === 'Bank account' && sale.receiptPath ? (
                                                <button
                                                    onClick={() => setViewingReceipt(sale.receiptPath!)}
                                                    className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">image</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4">View Receipt</span>
                                                </button>
                                            ) : (
                                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">No Media</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4 bg-neutral-light/30 border-t border-border-light flex justify-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Secured by Swamp Deer Blockchain Ledger Technology</p>
                </div>
            </div>

            {viewingReceipt && (
                <ReceiptViewModal path={viewingReceipt} onClose={() => setViewingReceipt(null)} />
            )}
        </div>
    );
};

interface RewardDetailsModalProps {
    investor: Investor;
    onClose: () => void;
}

const RewardDetailsModal = ({ investor, onClose }: RewardDetailsModalProps) => {
    const [rewards, setRewards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [rewardType, setRewardType] = useState('all');
    const [filteredTotal, setFilteredTotal] = useState<number | null>(null);

    const fetchRewards = async () => {
        try {
            setLoading(true);
            const res = await getInvestorRewards(investor._id, currentPage, 10, {
                type: rewardType === 'all' ? undefined : rewardType
            });
            if (res.items) {
                setRewards(res.items);
                setPagination({
                    page: res.page,
                    pages: res.pages,
                    total: res.total
                });
                setFilteredTotal(res.filteredTotal ?? null);
            }
        } catch (error) {
            toast.error('Failed to fetch rewards');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, [currentPage, rewardType]);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-border-light flex justify-between items-center bg-neutral-light/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-swamp-deer/10 rounded-2xl">
                            <History className="w-6 h-6 text-swamp-deer" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight italic">Reward Harvest Detailed Ledger</h3>
                            <p className="text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-widest leading-none opacity-80">
                                Portfolio: <span className="text-swamp-deer">{investor.fullName}</span> • Strategic Asset Tracking
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all group active:scale-95">
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-900 group-hover:rotate-90 transition-all">close</span>
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-auto bg-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2 bg-neutral-light/50 p-1.5 rounded-2xl w-fit">
                            {['all', 'staking', 'direct_income', 'level_income'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => { setRewardType(t); setCurrentPage(1); }}
                                    className={clsx(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        rewardType === t
                                            ? "bg-white text-swamp-deer shadow-sm ring-1 ring-border-light"
                                            : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    {t.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">
                                {rewardType === 'all' ? 'Total Ledger Yield: ' : 'Filtered Total: '}
                            </span>
                            <span className="text-lg font-black text-forest-green italic ml-1">
                                Rs {(filteredTotal ?? (rewardType === 'all' ? (investor.totalReward || 0) : 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                    <div className="border border-border-light rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-light/50 border-b border-border-light">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Execution Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reward Type</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Origin</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Yield Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-3 border-swamp-deer/20 border-t-swamp-deer rounded-full animate-spin"></div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Syncing Ledger...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : rewards.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-300">
                                                <Coins className="w-10 h-10 opacity-20" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">No yield records found</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    rewards.map((reward) => (
                                        <tr key={reward._id} className="hover:bg-neutral-light/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                                                    {new Date(reward.createdAt).toLocaleDateString(undefined, {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={clsx(
                                                    "inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                    reward.type === 'staking' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        reward.type === 'direct_income' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                                            "bg-warm-gold/10 text-warm-gold border-warm-gold/20"
                                                )}>
                                                    <TrendingUp className="w-3 h-3 mr-1" />
                                                    {reward.type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-[200px]">
                                                    <p className="text-xs font-bold text-gray-900 truncate">
                                                        {reward.stakeId?.user?.name || 'Vested Stake'}
                                                    </p>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter opacity-60">
                                                        Principal: Rs {reward.stakeId?.amount?.toLocaleString()}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-black text-forest-green italic tracking-tight">
                                                        +Rs {reward.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none mt-0.5">Verified Asset</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-neutral-light/30 px-6 py-4 border-t border-border-light flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">
                        Entry {(pagination.page - 1) * 10 + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total} records
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || loading}
                            className="p-1 px-3 rounded-lg border border-border-light hover:bg-white text-gray-400 hover:text-swamp-deer transition-all disabled:opacity-30"
                        >
                            <span className="material-symbols-outlined align-middle">chevron_left</span>
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                            disabled={currentPage === pagination.pages || loading}
                            className="p-1 px-3 rounded-lg border border-border-light hover:bg-white text-gray-400 hover:text-swamp-deer transition-all disabled:opacity-30"
                        >
                            <span className="material-symbols-outlined align-middle">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActionDropdown = ({
    investor,
    onViewTeam,
    onViewRewards,
    onViewInvestments,
    onEdit,
    onToggleStatus
}: {
    investor: Investor;
    onViewTeam: (id: string) => void;
    onViewRewards: (investor: Investor) => void;
    onViewInvestments: (investor: Investor) => void;
    onEdit: (investor: Investor) => void;
    onToggleStatus: (id: string) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 border shadow-sm",
                    isOpen ? "bg-forest-green text-white border-forest-green shadow-forest-green/20" : "bg-white text-gray-400 border-border-light hover:border-forest-green/30 hover:text-forest-green"
                )}
            >
                <MoreHorizontal className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl border border-border-light rounded-[24px] shadow-2xl z-[100] py-2.5 animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black/[0.05]">
                    <div className="px-5 py-2 border-b border-border-light/50 mb-2">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">Investor Actions</p>
                    </div>

                    <div className="px-2 space-y-0.5">
                        <button
                            onClick={() => { onViewTeam(investor._id); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-left hover:bg-forest-green/5 group transition-all"
                        >
                            <div className="w-8 h-8 rounded-xl bg-forest-green/10 flex items-center justify-center text-forest-green group-hover:bg-forest-green group-hover:text-white transition-all shadow-sm">
                                <Users2 className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-gray-600 group-hover:text-forest-green transition-colors tracking-tight">View Team Network</span>
                        </button>

                        <button
                            onClick={() => { onViewRewards(investor); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-left hover:bg-swamp-deer/5 group transition-all"
                        >
                            <div className="w-8 h-8 rounded-xl bg-swamp-deer/10 flex items-center justify-center text-swamp-deer group-hover:bg-swamp-deer group-hover:text-white transition-all shadow-sm">
                                <Wallet className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-gray-700 group-hover:text-swamp-deer transition-colors tracking-tight">View Reward Ledger</span>
                        </button>

                        <button
                            onClick={() => { onViewInvestments(investor); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-left hover:bg-amber-600/5 group transition-all"
                        >
                            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
                                <Coins className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-gray-600 group-hover:text-amber-600 transition-colors tracking-tight">View Investments</span>
                        </button>

                        <button
                            onClick={() => { onEdit(investor); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-left hover:bg-indigo-600/5 group transition-all"
                        >
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                <Edit3 className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-600 transition-colors tracking-tight">Edit Investor Details</span>
                        </button>
                    </div>

                    <div className="my-2 mx-5 border-t border-border-light/50"></div>

                    <div className="px-2">
                        <button
                            onClick={() => { onToggleStatus(investor._id); setIsOpen(false); }}
                            className={clsx(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-left group transition-all",
                                investor.status === 'banned' ? "hover:bg-emerald-600/5" : "hover:bg-red-600/5"
                            )}
                        >
                            <div className={clsx(
                                "w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-sm",
                                investor.status === 'banned'
                                    ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                                    : "bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white"
                            )}>
                                {investor.status === 'banned' ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                            </div>
                            <span className={clsx(
                                "text-xs font-bold transition-colors tracking-tight",
                                investor.status === 'banned' ? "text-emerald-700 group-hover:text-emerald-800" : "text-red-600 group-hover:text-red-700"
                            )}>
                                {investor.status === 'banned' ? 'Unban Investor' : 'Ban Investor'}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ManageInvestors = () => {

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { items: investors, isLoading: isInvestorsLoading, pagination } = useSelector((state: RootState) => state.investors);
    const { page, pages, total } = pagination;

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('All time');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
    const [viewingRewardsInvestor, setViewingRewardsInvestor] = useState<Investor | null>(null);
    const [viewingInvestmentsInvestor, setViewingInvestmentsInvestor] = useState<Investor | null>(null);

    // Calculate dates based on filter type
    useEffect(() => {
        const today = new Date();
        let start = '';
        let end = '';

        if (dateFilter === 'Today') {
            start = today.toISOString().split('T')[0];
            end = start;
        } else if (dateFilter === 'This Week') {
            const current = new Date();
            const first = current.getDate() - current.getDay();
            const firstDay = new Date(current.setDate(first));
            start = firstDay.toISOString().split('T')[0];
            end = new Date().toISOString().split('T')[0];
        } else if (dateFilter === 'This Month') {
            start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
            end = new Date().toISOString().split('T')[0];
        } else if (dateFilter === 'All time') {
            start = '';
            end = '';
        }

        if (dateFilter !== 'Custom') {
            setStartDate(start);
            setEndDate(end);
        }
    }, [dateFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(fetchInvestors({
                page: currentPage,
                limit: 10,
                startDate,
                endDate,
                search: searchTerm
            }));
        }, 500);
        return () => clearTimeout(timer);
    }, [dispatch, currentPage, startDate, endDate, searchTerm]);

    const handleToggleStatus = async (id: string) => {
        try {
            const res = await toggleInvestorStatus(id);
            toast.success(res.message);
            dispatch(fetchInvestors({ page: currentPage, limit: 10 })); // Refresh
        } catch (err: any) {
            toast.error('Failed to update status');
        }
    };

    const handleViewTeam = (id: string) => {
        navigate(`/manage-investors/${id}/team`);
    };

    const handleUpdateInvestor = async (updatedData: Partial<Investor>) => {
        if (!editingInvestor) return;
        try {
            // Map fullName to name since backend expects 'name'
            const dataToUpdate = {
                ...updatedData,
                name: updatedData.fullName
            };
            await updateUser(editingInvestor._id, dataToUpdate);
            toast.success('Investor updated successfully');
            dispatch(fetchInvestors({
                page: currentPage,
                limit: 10,
                startDate,
                endDate
            }));
        } catch (err) {
            throw err;
        }
    };

    const isLoading = isInvestorsLoading && (investors || []).length === 0;

    const displayInvestors = investors || [];

    if (isLoading) {
        return (
            <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="size-12 border-4 border-forest-green/20 border-t-forest-green rounded-full animate-spin"></div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Compiling Investor Directory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                    <h1 className="text-xl font-black text-forest-green tracking-tight italic opacity-90 uppercase">Investors Management Overview</h1>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Total Investors Card */}
                        <div className="bg-white p-5 rounded-[20px] border border-border-light shadow-sm flex flex-col justify-between group hover:shadow-lg transition-all duration-300 relative overflow-hidden h-32">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-warm-gold/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Strategic Partners</div>
                                <div className="text-2xl font-black text-forest-green tracking-tighter">{pagination.total.toLocaleString()}</div>
                            </div>
                            <div className="flex items-center justify-between relative z-10">
                                <span className="px-2 py-0.5 rounded-lg bg-warm-gold/10 text-warm-gold text-[8px] font-black uppercase tracking-widest border border-warm-gold/10">Active Count</span>
                                <span className="material-symbols-outlined text-warm-gold/40 text-lg group-hover:rotate-12 transition-transform">groups</span>
                            </div>
                        </div>

                        {/* Total Amount Invested Card */}
                        <div className="bg-white p-5 rounded-[20px] border border-border-light shadow-sm flex flex-col justify-between group hover:shadow-lg transition-all duration-300 relative overflow-hidden h-32">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Gross Capital</div>
                                <div className="text-2xl font-black text-forest-green tracking-tighter">Rs {pagination.totalAmountInvested.toLocaleString()}</div>
                            </div>
                            <div className="flex items-center justify-between relative z-10">
                                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-500/10">Principal Vault</span>
                                <span className="material-symbols-outlined text-emerald-500/40 text-lg group-hover:rotate-12 transition-transform">payments</span>
                            </div>
                        </div>

                        {/* Total Reward Paid Card */}
                        <div className="bg-white p-5 rounded-[20px] border border-border-light shadow-sm flex flex-col justify-between group hover:shadow-lg transition-all duration-300 relative overflow-hidden h-32">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-swamp-deer/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Partner Profits</div>
                                <div className="text-2xl font-black text-forest-green tracking-tighter">Rs {pagination.totalRewardPaid.toLocaleString()}</div>
                            </div>
                            <div className="flex items-center justify-between relative z-10">
                                <span className="px-2 py-0.5 rounded-lg bg-swamp-deer/10 text-swamp-deer text-[8px] font-black uppercase tracking-widest border border-swamp-deer/10">Yield Generated</span>
                                <span className="material-symbols-outlined text-swamp-deer/40 text-lg group-hover:rotate-12 transition-transform">volunteer_activism</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <button
                    onClick={() => navigate('/create-investor')}
                    className="bg-deep-green text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-forest-green transition-all shadow-md h-fit self-start"
                >
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    Add New Investor
                </button> */}
            </div>

            {/* Content Section */}
            <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-swamp-deer">groups</span>
                        Investor Directory
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                            <input
                                className="pl-10 pr-4 py-2 border border-border-light rounded-lg text-sm focus:ring-swamp-deer focus:border-swamp-deer w-64 bg-white shadow-sm"
                                placeholder="Search investors..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Date Filter Dropdown */}
                        <div className="flex items-center gap-2 bg-white border border-border-light rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-swamp-deer/20 transition-all">
                            <span className="material-symbols-outlined text-gray-400 text-lg">calendar_today</span>
                            <select
                                className="border-none bg-transparent text-xs font-bold focus:ring-0 p-0 pr-8"
                                value={dateFilter}
                                onChange={(e) => {
                                    setDateFilter(e.target.value);
                                    if (e.target.value !== 'Custom') {
                                        setCurrentPage(1);
                                    }
                                }}
                            >
                                <option value="All time">All time</option>
                                <option value="Today">Today</option>
                                <option value="This Week">This Week</option>
                                <option value="This Month">This Month</option>
                                <option value="Custom">Custom Range</option>
                            </select>
                        </div>

                        {dateFilter === 'Custom' && (
                            <div className="flex items-center gap-2 animate-in slide-in-from-right duration-300">
                                <input
                                    type="date"
                                    className="border border-border-light rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-swamp-deer focus:border-swamp-deer bg-white shadow-sm"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                                <span className="text-gray-400 text-xs font-black">—</span>
                                <input
                                    type="date"
                                    className="border border-border-light rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-swamp-deer focus:border-swamp-deer bg-white shadow-sm"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-light border-b border-border-light text-gray-500">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Investor Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Phone Number</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Amount Invested</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Date of Joining</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Product Status</th>
                                    {/* <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Rates (P/C)</th> */}
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-right">Total Reward</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light">
                                {displayInvestors.map((investor) => (
                                    <tr key={investor._id} className="hover:bg-neutral-light/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 leading-tight">{investor.fullName}</div>
                                            <div className="text-[11px] text-gray-500 font-medium">{investor.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{investor.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900 tracking-tight">
                                                    Rs {(investor.amountInvested || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-[9px] font-black text-warm-gold uppercase tracking-widest opacity-70">Capital Investment</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-border-light"></div>
                                                {investor.createdAt ? new Date(investor.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {investor.productStatus === 'with_product' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    Vested Strategy
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 border border-gray-100">
                                                    Standard Yield
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-forest-green italic tracking-tight">
                                                    Rs {(investor.totalReward || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest leading-none mt-0.5">Total Harvested</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end pr-2">
                                                <ActionDropdown
                                                    investor={investor}
                                                    onViewTeam={handleViewTeam}
                                                    onViewRewards={setViewingRewardsInvestor}
                                                    onViewInvestments={setViewingInvestmentsInvestor}
                                                    onEdit={setEditingInvestor}
                                                    onToggleStatus={handleToggleStatus}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {displayInvestors.length === 0 && (
                            <div className="p-20 text-center border-t border-border-light flex flex-col items-center gap-3">
                                <span className="material-symbols-outlined text-4xl text-gray-200">person_off</span>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">No investor records found match your search criteria</p>
                            </div>
                        )}
                    </div>

                    {/* Footer / Pagination */}
                    <div className="bg-neutral-light/30 px-6 py-4 border-t border-border-light flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">
                            Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total.toLocaleString()} investors
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1 px-3 rounded-lg border border-border-light hover:bg-white text-gray-400 hover:text-swamp-deer transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <span className="material-symbols-outlined align-middle">chevron_left</span>
                            </button>

                            {[...Array(pages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={clsx(
                                        "w-8 h-8 rounded-lg text-sm font-bold transition-all",
                                        currentPage === i + 1
                                            ? "bg-swamp-deer text-white shadow-lg"
                                            : "hover:bg-white hover:text-swamp-deer text-gray-500"
                                    )}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
                                disabled={currentPage === pages}
                                className="p-1 px-3 rounded-lg border border-border-light hover:bg-white text-gray-400 hover:text-swamp-deer transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <span className="material-symbols-outlined align-middle">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {editingInvestor && (
                <EditInvestorModal
                    investor={editingInvestor}
                    onClose={() => setEditingInvestor(null)}
                    onSave={handleUpdateInvestor}
                />
            )}

            {viewingRewardsInvestor && (
                <RewardDetailsModal
                    investor={viewingRewardsInvestor}
                    onClose={() => setViewingRewardsInvestor(null)}
                />
            )}

            {viewingInvestmentsInvestor && (
                <InvestmentHistoryModal
                    investor={viewingInvestmentsInvestor}
                    onClose={() => setViewingInvestmentsInvestor(null)}
                />
            )}
        </div>
    );
};

export default ManageInvestors;
