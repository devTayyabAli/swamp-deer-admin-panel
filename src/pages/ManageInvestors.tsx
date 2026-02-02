import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchInvestors } from '../store/slices/investorSlice';
import { toggleInvestorStatus, getInvestorTeam, type InvestorTeam } from '../services/dataService';
import toast from 'react-hot-toast';
import TeamViewModal from '../components/TeamViewModal';
import { useNavigate } from 'react-router-dom';

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
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [selectedTeamData, setSelectedTeamData] = useState<InvestorTeam | null>(null);
    const [isTeamLoading, setIsTeamLoading] = useState(false);

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
        dispatch(fetchInvestors({ 
            page: currentPage, 
            limit: 10,
            startDate,
            endDate
        }));
    }, [dispatch, currentPage, startDate, endDate]);

    const handleToggleStatus = async (id: string) => {
        try {
            const res = await toggleInvestorStatus(id);
            toast.success(res.message);
            dispatch(fetchInvestors({ page: currentPage, limit: 10 })); // Refresh
        } catch (err: any) {
            toast.error('Failed to update status');
        }
    };

    const handleViewTeam = async (id: string) => {
        setIsTeamLoading(true);
        setIsTeamModalOpen(true);
        try {
            const team = await getInvestorTeam(id);
            setSelectedTeamData(team);
        } catch (err) {
            toast.error('Failed to load team data');
            setIsTeamModalOpen(false);
        } finally {
            setIsTeamLoading(false);
        }
    };

    const isLoading = isInvestorsLoading && (investors || []).length === 0;

    const filteredInvestors = (investors || []).filter(inv => 
        inv.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.phone.includes(searchTerm) ||
        inv.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                <div className="text-2xl font-black text-forest-green tracking-tighter">${pagination.totalAmountInvested.toLocaleString()}</div>
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
                                <div className="text-2xl font-black text-forest-green tracking-tighter">${pagination.totalRewardPaid.toLocaleString()}</div>
                             </div>
                             <div className="flex items-center justify-between relative z-10">
                                <span className="px-2 py-0.5 rounded-lg bg-swamp-deer/10 text-swamp-deer text-[8px] font-black uppercase tracking-widest border border-swamp-deer/10">Yield Generated</span>
                                <span className="material-symbols-outlined text-swamp-deer/40 text-lg group-hover:rotate-12 transition-transform">volunteer_activism</span>
                             </div>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/create-investor')} 
                    className="bg-deep-green text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-forest-green transition-all shadow-md h-fit self-start"
                >
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    Add New Investor
                </button>
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
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-right">Total Reward</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light">
                                {filteredInvestors.map((investor) => (
                                    <tr key={investor._id} className="hover:bg-neutral-light/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 leading-tight">{investor.fullName}</div>
                                            <div className="text-[11px] text-gray-500 font-medium">{investor.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{investor.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-warm-gold bg-warm-gold/10 px-2 py-1 rounded">
                                                ${(investor.amountInvested || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {investor.createdAt ? new Date(investor.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {investor.productStatus === 'with_product' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    With Product
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                                                    Without Product
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-swamp-deer text-right">
                                            ${(investor.totalReward || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2  transition-opacity">
                                                <button 
                                                    onClick={() => handleViewTeam(investor._id)}
                                                    className="p-2 text-forest-green hover:bg-forest-green/5 rounded-lg transition-colors border border-transparent hover:border-forest-green/10"
                                                    title="View Team"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">hub</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleToggleStatus(investor._id)}
                                                    className={clsx(
                                                        "p-2 rounded-lg transition-colors border border-transparent",
                                                        investor.status === 'banned' 
                                                            ? "text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100" 
                                                            : "text-red-600 hover:bg-red-50 hover:border-red-100"
                                                    )}
                                                    title={investor.status === 'banned' ? 'Unban' : 'Ban'}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        {investor.status === 'banned' ? 'check_circle' : 'block'}
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredInvestors.length === 0 && (
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

            <TeamViewModal 
                isOpen={isTeamModalOpen}
                onClose={() => setIsTeamModalOpen(false)}
                teamData={selectedTeamData}
                isLoading={isTeamLoading}
            />
        </div>
    );
};

export default ManageInvestors;
