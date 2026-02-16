import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchSales } from '../store/slices/salesSlice';
import { updateSaleStatus } from '../services/dataService';
import toast from 'react-hot-toast';

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

const ApproveSales = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items: sales, isLoading } = useSelector((state: RootState) => state.sales);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchSales({ page: 1, limit: 100, status: 'pending' }));
    }, [dispatch]);

    const handleAction = async (id: string, status: 'completed' | 'rejected') => {
        setIsUpdating(id);
        const toastId = toast.loading(`Processing sale...`);
        try {
            await updateSaleStatus(id, status);
            toast.success(`Sale ${status === 'completed' ? 'approved' : 'rejected'} successfully`, { id: toastId });
            dispatch(fetchSales({ page: 1, limit: 100, status: 'pending' }));
        } catch (err) {
            toast.error('Failed to update sale status', { id: toastId });
        } finally {
            setIsUpdating(null);
        }
    };

    const pendingSales = sales.filter(s => s.status === 'pending');

    if (isLoading && sales.length === 0) {
        return (
            <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="size-12 border-4 border-swamp-deer/20 border-t-swamp-deer rounded-full animate-spin"></div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Scanning Pending Requests...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="border-l-4 border-swamp-deer pl-4">
                <h1 className="text-2xl font-black text-forest-green tracking-tight">Sale Approval Gateway</h1>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Review and Authorize Incoming Regional Transactions</p>
            </div>

            <div className="bg-white rounded-3xl border border-border-light shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#fbfcfa] border-b border-border-light">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction Date</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Upline</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Investor</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Regional Hub</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">P. Method</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Valuation</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light/40">
                            {pendingSales.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20">
                                            <span className="material-symbols-outlined text-6xl">verified</span>
                                            <p className="text-xs font-black uppercase tracking-[0.3em]">All Transactions Clear</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pendingSales.map((sale) => (
                                    <tr key={sale._id} className="hover:bg-neutral-light/50 transition-colors group">
                                        <td className="px-6 py-5 text-sm font-medium text-gray-500 whitespace-nowrap">
                                            {new Date(sale.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 leading-tight">
                                                    {(sale.referrerId as any)?.name || (sale.user as any)?.name || 'Direct'}
                                                </span>
                                                <span className="text-[9px] font-black text-forest-green/60 uppercase tracking-widest mt-0.5">
                                                    ID: {(sale.referrerId as any)?.userName || (sale.user as any)?.userName || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="font-bold text-forest-green tracking-tight">{(sale.investorId as any)?.fullName || 'No Investor'}</span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="bg-neutral-light px-2 py-1 rounded text-[10px] uppercase font-black tracking-widest">
                                                {(sale.branchId as any)?.name || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{sale.paymentMethod}</span>
                                                {sale.paymentMethod === 'Bank account' && sale.receiptPath && (
                                                    <button
                                                        onClick={() => setViewingReceipt(sale.receiptPath!)}
                                                        className="flex items-center gap-1 text-[9px] font-black text-primary hover:text-deep-green uppercase tracking-tighter transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">visibility</span>
                                                        View Receipt
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-black text-forest-green">Rs {sale.amount.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-right whitespace-nowrap space-x-2">
                                            <button
                                                disabled={!!isUpdating}
                                                onClick={() => handleAction(sale._id, 'completed')}
                                                className="bg-forest-green text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-forest-green/90 transition-all shadow-lg hover:shadow-forest-green/20 disabled:opacity-50"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                disabled={!!isUpdating}
                                                onClick={() => handleAction(sale._id, 'rejected')}
                                                className="bg-white border-2 border-red-500 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {viewingReceipt && (
                <ReceiptViewModal
                    path={viewingReceipt}
                    onClose={() => setViewingReceipt(null)}
                />
            )}
        </div>
    );
};

export default ApproveSales;
