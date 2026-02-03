import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchSales } from '../store/slices/salesSlice';
import { fetchBranches } from '../store/slices/branchSlice';

const AdminSalesHistory = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items: sales, pagination } = useSelector((state: RootState) => state.sales);
    const { items: branches } = useSelector((state: RootState) => state.branches);

    // Filtering and Pagination state
    const [selectedBranch, setSelectedBranch] = useState('All Branches');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        dispatch(fetchBranches({}));
    }, [dispatch]);

    useEffect(() => {
        const branchList = branches || [];
        const branchObj = branchList.find(b => b.name === selectedBranch);
        dispatch(fetchSales({
            page: currentPage,
            limit,
            branchId: branchObj?._id,
            startDate,
            endDate,
            status: status === 'All' ? undefined : status.toLowerCase()
        }));
    }, [dispatch, currentPage, selectedBranch, startDate, endDate, status]);



    // Use items directly since backend now handles filtering
    const displaySales = sales;

    // if (isLoading && sales.length === 0) return <div>Loading history...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="border-l-4 border-swamp-deer pl-4">
                    <h1 className="text-2xl font-black text-forest-green tracking-tight">Enterprise History Vault</h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Secured Ledger of All Regional Transactions</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {/* Branch Filter */}
                    <div className="flex items-center gap-3 bg-white border border-border-light rounded-2xl px-4 py-2.5 shadow-sm hover:border-warm-gold hover:shadow-md transition-all group">
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-warm-gold transition-colors text-sm">filter_list</span>
                        <select
                            className="border-none bg-transparent text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer p-0 text-forest-green"
                            value={selectedBranch}
                            onChange={(e) => {
                                setSelectedBranch(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="All Branches">All Regional Hubs</option>
                            {(branches || []).map(b => (
                                <option key={b._id} value={b.name}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range Selector */}
                    <div className="flex items-center gap-3 bg-white border border-border-light rounded-2xl px-4 py-2.5 shadow-sm focus-within:border-warm-gold focus-within:ring-4 focus-within:ring-warm-gold/5 transition-all">
                        <span className="material-symbols-outlined text-gray-400 text-sm">calendar_month</span>
                        <input
                            type="date"
                            className="border-none bg-transparent text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer p-0 w-32 text-forest-green"
                            value={startDate}
                            title="Start Date"
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <span className="text-gray-200 font-black">—</span>
                        <input
                            type="date"
                            className="border-none bg-transparent text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer p-0 w-32 text-forest-green"
                            value={endDate}
                            title="End Date"
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-3 bg-white border border-border-light rounded-2xl px-4 py-2.5 shadow-sm hover:border-warm-gold hover:shadow-md transition-all group">
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-warm-gold transition-colors text-sm">assignment_turned_in</span>
                        <select
                            className="border-none bg-transparent text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer p-0 text-forest-green"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    {(startDate || endDate || selectedBranch !== 'All Branches' || status !== 'All') && (
                        <button
                            onClick={() => {
                                setStartDate('');
                                setEndDate('');
                                setSelectedBranch('All Branches');
                                setStatus('All');
                                setCurrentPage(1);
                            }}
                            className="text-swamp-deer text-[10px] font-black uppercase tracking-[0.2em] hover:text-warm-gold transition-colors flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">backspace</span>
                            Reset Filters
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-border-light shadow-2xl overflow-hidden animate-in zoom-in duration-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#fbfcfa] border-b border-border-light">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction Date</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stakeholder</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Regional Hub</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Method</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Valuation</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Yield (Profit)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light/40">
                            {displaySales.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20">
                                            <span className="material-symbols-outlined text-6xl">query_stats</span>
                                            <p className="text-xs font-black uppercase tracking-[0.3em]">No Historical Data Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displaySales.map((sale) => (
                                    <tr key={sale._id} className="hover:bg-neutral-light transition-colors group">
                                        <td className="px-6 py-5 text-sm text-gray-500 font-medium whitespace-nowrap">
                                            {new Date(sale.date || sale.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-xl bg-forest-green text-warm-gold flex items-center justify-center font-black text-[10px] shadow-lg group-hover:rotate-6 transition-all">
                                                    {(sale.investorId as any)?.fullName?.substring(0, 2).toUpperCase() || 'NI'}
                                                </div>
                                                <span className="font-bold text-forest-green tracking-tight">{(sale.investorId as any)?.fullName || 'No Investor'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-gray-600 whitespace-nowrap">
                                            <span className="bg-neutral-light px-2 py-1 rounded text-[10px] uppercase font-black tracking-widest">
                                                {typeof sale.branchId === 'object' ? sale.branchId.name : ((branches || []).find(b => b._id === sale.branchId)?.name || "N/A")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{sale.paymentMethod}</span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className={clsx(
                                                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                sale.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    sale.status === 'rejected' ? "bg-red-50 text-red-600 border-red-100" :
                                                        "bg-amber-50 text-amber-600 border-amber-100"
                                            )}>
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-black text-forest-green">Rs {sale.amount.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-sm font-black text-swamp-deer text-right">
                                            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px]">
                                                +Rs {(sale.amount - sale.commission).toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="bg-neutral-light/30 px-6 py-4 border-t border-border-light flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">
                        Displaying {(pagination.page - 1) * limit + 1} to {Math.min(pagination.page * limit, pagination.total)} of {pagination.total.toLocaleString()} Entries
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1 px-3 rounded-lg border border-border-light hover:bg-white text-gray-400 hover:text-swamp-deer transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <span className="material-symbols-outlined align-middle">chevron_left</span>
                        </button>

                        {[...Array(pagination.pages)].map((_, i) => (
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
                            onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                            disabled={currentPage === pagination.pages}
                            className="p-1 px-3 rounded-lg border border-border-light hover:bg-white text-gray-400 hover:text-swamp-deer transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <span className="material-symbols-outlined align-middle">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSalesHistory;
