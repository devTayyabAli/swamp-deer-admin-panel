import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchSales } from '../store/slices/salesSlice';
import { fetchBranches } from '../store/slices/branchSlice';

const SuperAdmin = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items: sales, isLoading: isSalesLoading } = useSelector((state: RootState) => state.sales);
    const { items: branches, isLoading: isBranchesLoading } = useSelector((state: RootState) => state.branches);

    const isLoading = isSalesLoading || isBranchesLoading;

    useEffect(() => {
        dispatch(fetchSales({ limit: 100 }));
        dispatch(fetchBranches({}));
    }, [dispatch]);

    // Branch stats calculation
    const branchStats = (branches || []).map(branch => {
        const branchSales = (sales || []).filter(s => {
            const bId = typeof s.branchId === 'string' ? s.branchId : (s.branchId as any)?._id;
            return bId === branch._id && s.status === 'completed';
        });
        const profit = branchSales.reduce((acc, curr) => acc + (curr.amount - curr.commission), 0);
        const investorsCount = new Set(branchSales.map(s => typeof s.investorId === 'string' ? s.investorId : (s.investorId as any)?._id).filter(id => !!id)).size;
        return { ...branch, profit, investors: investorsCount };
    });

    const sortedByProfit = [...branchStats].sort((a, b) => b.profit - a.profit);
    const sortedByInvestors = [...branchStats].sort((a, b) => b.investors - a.investors);

    // Filtered sales for metrics
    const completedSales = (sales || []).filter(s => s.status === 'completed');
    const rejectedSalesCount = (sales || []).filter(s => s.status === 'rejected').length;

    const highestProfitBranch = sortedByProfit[0];
    const mostInvestorsBranch = sortedByInvestors[0];

    // Global stats
    const totalAmount = completedSales.reduce((acc, curr) => acc + curr.amount, 0);
    const totalCommission = completedSales.reduce((acc, curr) => acc + curr.commission, 0);
    const totalProfit = totalAmount - totalCommission;

    if (isLoading) return <div>Loading dashboard...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-xl font-black text-forest-green tracking-tight italic opacity-90 uppercase flex items-center gap-3">
                    <span className="material-symbols-outlined text-swamp-deer">monitoring</span>
                    Enterprise Performance Intelligence
                </h1>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Total Profit Card */}
                    <div className="bg-white p-5 rounded-[20px] border border-border-light shadow-sm flex flex-col justify-between group hover:shadow-lg transition-all duration-300 relative overflow-hidden h-32">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Total Profit (Lifetime)</div>
                            <div className="text-2xl font-black text-forest-green tracking-tighter">Rs {totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-500/10">System Performance</span>
                            <span className="material-symbols-outlined text-emerald-500/40 text-lg group-hover:rotate-12 transition-transform">trending_up</span>
                        </div>
                    </div>

                    {/* Total Sales Volume Card */}
                    <div className="bg-white p-5 rounded-[20px] border border-border-light shadow-sm flex flex-col justify-between group hover:shadow-lg transition-all duration-300 relative overflow-hidden h-32">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-warm-gold/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Total Sales Volume</div>
                            <div className="text-2xl font-black text-forest-green tracking-tighter">Rs {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <span className="px-2 py-0.5 rounded-lg bg-warm-gold/10 text-warm-gold text-[8px] font-black uppercase tracking-widest border border-warm-gold/10">Strategic Growth</span>
                            <span className="material-symbols-outlined text-warm-gold/40 text-lg group-hover:rotate-12 transition-transform">stars</span>
                        </div>
                    </div>

                    {/* Total Commission Paid Card */}
                    <div className="bg-white p-5 rounded-[20px] border border-border-light shadow-sm flex flex-col justify-between group hover:shadow-lg transition-all duration-300 relative overflow-hidden h-32">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-swamp-deer/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Total Commission Paid</div>
                            <div className="text-2xl font-black text-forest-green tracking-tighter">Rs {totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <span className="px-2 py-0.5 rounded-lg bg-swamp-deer/10 text-swamp-deer text-[8px] font-black uppercase tracking-widest border border-swamp-deer/10">Real-time Sync</span>
                            <span className="material-symbols-outlined text-swamp-deer/40 text-lg group-hover:rotate-12 transition-transform">schedule</span>
                        </div>
                    </div>

                    {/* Rejected Transactions Card */}
                    <div className="bg-white p-5 rounded-[20px] border border-border-light shadow-sm flex flex-col justify-between group hover:shadow-lg transition-all duration-300 relative overflow-hidden h-32">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Rejected Transactions</div>
                            <div className="text-2xl font-black text-red-600 tracking-tighter">{rejectedSalesCount}</div>
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-600 text-[8px] font-black uppercase tracking-widest border border-red-500/10">Action Required</span>
                            <span className="material-symbols-outlined text-red-500/40 text-lg group-hover:rotate-12 transition-transform">block</span>
                        </div>
                    </div>
                </div>
            </div>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-swamp-deer">analytics</span>
                    Branch Performance Analysis
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {highestProfitBranch && (
                        <div className="bg-forest-green text-white p-5 rounded-[20px] shadow-lg ring-1 ring-warm-gold/20 relative overflow-hidden group h-36 flex flex-col justify-between">
                            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:scale-125 transition-transform duration-700">
                                <span className="material-symbols-outlined text-7xl font-black">insights</span>
                            </div>
                            <div className="relative z-10">
                                <span className="text-[8px] font-black px-2 py-0.5 bg-warm-gold text-forest-green rounded uppercase tracking-widest mb-3 inline-block shadow-sm">Top Performer</span>
                                <div className="text-[10px] opacity-60 uppercase tracking-[0.2em] font-black mb-1">{highestProfitBranch.name}</div>
                                <div className="text-2xl font-black text-warm-gold tracking-tighter">Rs {highestProfitBranch.profit.toLocaleString()}</div>
                            </div>
                            <div className="relative z-10 flex items-center gap-1.5 text-warm-gold/60">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                <span className="text-[8px] font-black uppercase tracking-widest">Leading Yield</span>
                            </div>
                        </div>
                    )}
                    {mostInvestorsBranch && mostInvestorsBranch._id !== highestProfitBranch?._id && (
                        <div className="bg-white p-5 rounded-[20px] border border-border-light shadow-sm flex flex-col justify-between h-36 group hover:border-warm-gold/30 transition-all duration-300">
                            <div className="relative z-10">
                                <span className="text-[8px] font-black px-2 py-0.5 bg-neutral-light text-swamp-deer rounded uppercase tracking-widest mb-3 inline-block border border-border-light">Active Network</span>
                                <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-1">{mostInvestorsBranch.name}</div>
                                <div className="text-2xl font-black text-forest-green tracking-tighter">Rs {mostInvestorsBranch.profit.toLocaleString()}</div>
                            </div>
                            <div className="relative z-10 flex items-center justify-between text-swamp-deer/40">
                                <span className="text-[8px] font-black uppercase tracking-widest">Network Growth</span>
                                <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">hub</span>
                            </div>
                        </div>
                    )}
                    {branchStats.slice(0, 4).map(b => {
                        if (b._id === highestProfitBranch?._id || b._id === mostInvestorsBranch?._id) return null;
                        return (
                            <div key={b._id} className="bg-white p-5 rounded-[20px] border border-border-light shadow-sm flex flex-col justify-between h-36 group hover:border-warm-gold/20 transition-all duration-300">
                                <div className="relative">
                                    <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-1">{b.name}</div>
                                    <div className="text-2xl font-black text-forest-green tracking-tighter">Rs {b.profit.toLocaleString()}</div>
                                </div>
                                <div className="flex items-center justify-between text-gray-300">
                                    <span className="text-[8px] font-black uppercase tracking-widest">Regional Hub</span>
                                    <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform opacity-30">store</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="animate-in slide-in-from-bottom duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h2 className="text-lg font-bold text-gray-900 border-l-4 border-swamp-deer pl-3">Recent Enterprise Activity</h2>
                    <a href="/history" className="text-swamp-deer font-bold text-xs uppercase tracking-widest mb-4 hover:text-warm-gold transition-colors flex items-center gap-1 group">
                        Enter History Vault
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                    </a>
                </div>
                <div className="bg-white rounded-2xl border border-border-light shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#fbfcfa] border-b border-border-light">
                                <tr>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction Date</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stakeholder</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Regional Branch</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Nominal Amount</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Net Profit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light/50">
                                {sales.slice(0, 5).map((sale) => (
                                    <tr key={sale._id} className="hover:bg-neutral-light transition-colors group">
                                        <td className="px-6 py-5 text-sm text-gray-500 font-medium whitespace-nowrap">
                                            {new Date(sale.date || sale.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-full bg-forest-green text-warm-gold flex items-center justify-center font-black text-[10px] group-hover:scale-110 transition-transform">
                                                    {(sale.investorId as any)?.fullName?.substring(0, 2).toUpperCase() || 'NI'}
                                                </div>
                                                <span className="font-bold text-forest-green tracking-tight">{(sale.investorId as any)?.fullName || 'No Investor'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-gray-600 whitespace-nowrap">
                                            {typeof sale.branchId === 'object' ? sale.branchId.name : (branches.find(b => b._id === sale.branchId)?.name || "N/A")}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${sale.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                sale.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-black text-forest-green">Rs {sale.amount.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-sm font-black text-swamp-deer text-right">
                                            <span className={`px-2 py-1 rounded ${sale.status === 'rejected' ? 'bg-gray-50 text-gray-400 line-through' : 'bg-emerald-50 text-emerald-700'}`}>
                                                +Rs {(sale.amount - sale.commission).toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {sales.length === 0 && (
                            <div className="p-12 text-center">
                                <span className="material-symbols-outlined text-gray-200 text-6xl mb-4">database_off</span>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No ledger entries detected</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SuperAdmin;
