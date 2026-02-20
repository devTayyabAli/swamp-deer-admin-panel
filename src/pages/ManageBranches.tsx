import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchBranches } from '../store/slices/branchSlice';
import { getUsers, updateBranch as updateBranchService, getInvestors } from '../services/dataService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { User, Branch, Investor } from '../types';
import clsx from 'clsx';

const ManageBranches = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { items: branches, isLoading } = useSelector((state: RootState) => state.branches);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeCityFilter, setActiveCityFilter] = useState<string | null>(null);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [activeActionDropdown, setActiveActionDropdown] = useState<string | null>(null);

    // Linked Investors Modal State
    const [isInvestorsModalOpen, setIsInvestorsModalOpen] = useState(false);
    const [selectedBranchForInvestors, setSelectedBranchForInvestors] = useState<Branch | null>(null);
    const [branchInvestors, setBranchInvestors] = useState<Investor[]>([]);
    const [isFetchingInvestors, setIsFetchingInvestors] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        city: '',
        state: '',
        address: '',
        manager: ''
    });

    const itemsPerPage = 5;

    useEffect(() => {
        dispatch(fetchBranches({}));
        const fetchUsers = async () => {
            try {
                const users = await getUsers();
                setAllUsers(users);
            } catch (err) {
                console.error('Failed to fetch users', err);
            }
        };
        fetchUsers();
    }, [dispatch]);

    const cities = Array.from(new Set(branches.map(b => b.city))).sort();

    const filteredBranches = branches.filter(branch => {
        const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            branch.address.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCity = activeCityFilter ? branch.city === activeCityFilter : true;

        return matchesSearch && matchesCity;
    });

    const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
    const paginatedBranches = filteredBranches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleEditClick = (branch: Branch) => {
        setEditingBranch(branch);
        setFormData({
            name: branch.name,
            city: branch.city,
            state: branch.state,
            address: branch.address,
            manager: typeof branch.manager === 'object' ? branch.manager?._id : (branch.manager || '')
        });
        setIsEditModalOpen(true);
        setActiveActionDropdown(null);
    };

    const handleViewInvestors = async (branch: Branch) => {
        setSelectedBranchForInvestors(branch);
        setIsInvestorsModalOpen(true);
        setIsFetchingInvestors(true);
        setActiveActionDropdown(null);
        try {
            const response = await getInvestors(1, 100, { branchId: branch._id });
            setBranchInvestors(response.items);
        } catch (err) {
            toast.error('Failed to fetch linked investors');
            console.error(err);
        } finally {
            setIsFetchingInvestors(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBranch) return;

        setIsSubmitting(true);
        const toastId = toast.loading('Updating branch details...');
        try {
            await updateBranchService(editingBranch._id, formData);
            toast.success('Branch updated successfully', { id: toastId });
            setIsEditModalOpen(false);
            setEditingBranch(null);
            dispatch(fetchBranches({}));
        } catch (err) {
            toast.error('Failed to update branch', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading && branches.length === 0) {
        return (
            <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="size-12 border-4 border-forest-green/20 border-t-forest-green rounded-full animate-spin"></div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Loading Branches...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-black text-forest-green tracking-tight italic opacity-90 uppercase">Branches Management Overview</h1>
                </div>
                <button
                    onClick={() => navigate('/add-branch')}
                    className="bg-deep-green text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-forest-green transition-all shadow-md h-fit self-end md:self-auto"
                >
                    <span className="material-symbols-outlined text-sm">add_business</span>
                    Add New Branch
                </button>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[24px] border border-border-light shadow-sm overflow-hidden min-h-[500px] flex flex-col relative">
                <div className="p-6 border-b border-border-light flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-gray-900">Registered Branches</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                            <input
                                className="pl-10 pr-4 py-2 border border-border-light rounded-lg text-sm focus:ring-swamp-deer focus:border-swamp-deer w-64 bg-white shadow-sm"
                                placeholder="Search branch..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold transition-colors",
                                    activeCityFilter ? "bg-swamp-deer/5 border-swamp-deer text-swamp-deer" : "border-border-light text-gray-600 hover:bg-neutral-light"
                                )}
                            >
                                <span className="material-symbols-outlined text-sm">filter_list</span>
                                {activeCityFilter || 'Filter'}
                            </button>

                            {showFilterDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-border-light rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in duration-200">
                                    <button
                                        onClick={() => { setActiveCityFilter(null); setShowFilterDropdown(false); }}
                                        className="w-full text-left px-4 py-2 text-sm font-bold text-gray-500 hover:bg-neutral-light"
                                    >
                                        All Cities
                                    </button>
                                    {cities.map(city => (
                                        <button
                                            key={city}
                                            onClick={() => { setActiveCityFilter(city); setShowFilterDropdown(false); }}
                                            className={clsx(
                                                "w-full text-left px-4 py-2 text-sm font-bold hover:bg-neutral-light",
                                                activeCityFilter === city ? "text-swamp-deer" : "text-gray-700"
                                            )}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f9fafb] text-[#6b7280] border-b border-border-light">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Branch Name</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Location</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Total Sales Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Linked Investors Count</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                            {paginatedBranches.map((branch) => (
                                <tr key={branch._id} className="hover:bg-neutral-light/50 transition-colors group">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-forest-green/5 flex items-center justify-center text-forest-green">
                                                <span className="material-symbols-outlined text-xl">business</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{branch.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="text-sm font-medium text-gray-600 leading-relaxed max-w-[250px]">
                                            {branch.address}, {branch.city}, {branch.state}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="text-base font-black text-gray-900 tracking-tight">
                                            Rs {(branch.totalSalesAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="px-3 py-1.5 rounded-full bg-warm-gold/10 text-warm-gold text-xs font-black uppercase tracking-widest border border-warm-gold/5">
                                            {branch.linkedInvestorsCount || 0} Investors
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="relative inline-block text-left">
                                            <button
                                                onClick={() => setActiveActionDropdown(activeActionDropdown === branch._id ? null : branch._id)}
                                                className="p-2 text-gray-400 hover:text-swamp-deer hover:bg-swamp-deer/5 rounded-lg transition-all"
                                                title="Actions"
                                            >
                                                <span className="material-symbols-outlined text-[24px]">more_vert</span>
                                            </button>

                                            {activeActionDropdown === branch._id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setActiveActionDropdown(null)}
                                                    ></div>
                                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-border-light rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in duration-200">
                                                        <button
                                                            onClick={() => handleEditClick(branch)}
                                                            className="w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-neutral-light flex items-center gap-2"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">edit_square</span>
                                                            Edit Details
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewInvestors(branch)}
                                                            className="w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-neutral-light flex items-center gap-2"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">group</span>
                                                            Linked Investors
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredBranches.length === 0 && (
                        <div className="p-20 text-center flex flex-col items-center gap-3">
                            <span className="material-symbols-outlined text-4xl text-gray-200">business_off</span>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic leading-loose">No branch records found match your search criteria</p>
                        </div>
                    )}
                </div>

                {/* Footer / Pagination */}
                <div className="px-6 py-5 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">
                        Showing {Math.min(filteredBranches.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(currentPage * itemsPerPage, filteredBranches.length)} of {filteredBranches.length} registered branches
                    </span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg border border-border-light text-xs font-bold text-gray-500 hover:bg-neutral-light transition-all disabled:opacity-30 flex items-center gap-1"
                        >
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={clsx(
                                        "w-8 h-8 rounded-lg text-xs font-black transition-all",
                                        currentPage === i + 1
                                            ? "bg-forest-green text-white shadow-lg shadow-forest-green/20"
                                            : "text-gray-500 hover:bg-neutral-light"
                                    )}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-4 py-2 rounded-lg border border-border-light text-xs font-bold text-gray-500 hover:bg-neutral-light transition-all disabled:opacity-30 flex items-center gap-1"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-border-light flex items-center justify-between bg-neutral-light/30">
                            <div>
                                <h3 className="text-xl font-black text-forest-green italic tracking-tight">Edit Branch Details</h3>
                                <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">Update location and management</p>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1 opacity-60">Branch Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        className="w-full rounded-2xl border-border-light bg-neutral-light/50 focus:bg-white focus:ring-2 focus:ring-swamp-deer/10 focus:border-swamp-deer text-sm p-4 font-bold transition-all"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1 opacity-60">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleFormChange}
                                            className="w-full rounded-2xl border-border-light bg-neutral-light/50 focus:bg-white focus:ring-2 focus:ring-swamp-deer/10 focus:border-swamp-deer text-sm p-4 font-bold transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1 opacity-60">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleFormChange}
                                            className="w-full rounded-2xl border-border-light bg-neutral-light/50 focus:bg-white focus:ring-2 focus:ring-swamp-deer/10 focus:border-swamp-deer text-sm p-4 font-bold transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1 opacity-60">Full Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleFormChange}
                                        className="w-full rounded-2xl border-border-light bg-neutral-light/50 focus:bg-white focus:ring-2 focus:ring-swamp-deer/10 focus:border-swamp-deer text-sm p-4 font-bold transition-all"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1 opacity-60">Branch Manager</label>
                                    <select
                                        name="manager"
                                        value={formData.manager}
                                        onChange={handleFormChange}
                                        className="w-full rounded-2xl border-border-light bg-neutral-light/50 focus:bg-white focus:ring-2 focus:ring-swamp-deer/10 focus:border-swamp-deer text-sm p-4 font-bold transition-all appearance-none"
                                    >
                                        <option value="">Unassigned</option>
                                        {allUsers.filter(u => u.role === 'branch_manager' || u.role === 'super_admin').map(m => (
                                            <option key={m._id} value={m._id}>{m.name} ({m.role.replace('_', ' ')})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-8 py-4 rounded-2xl border border-border-light text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-neutral-light transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-8 py-4 rounded-2xl bg-deep-green text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-deep-green/20 hover:bg-forest-green hover:shadow-forest-green/30 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Processing...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Linked Investors Modal */}
            {isInvestorsModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col">
                        <div className="p-8 border-b border-border-light flex items-center justify-between bg-neutral-light/30">
                            <div>
                                <h3 className="text-xl font-black text-forest-green italic tracking-tight">
                                    Linked Investors: <span className="text-gray-900 not-italic ml-2">{selectedBranchForInvestors?.name}</span>
                                </h3>
                                <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">Showing all investors registered under this branch</p>
                            </div>
                            <button
                                onClick={() => setIsInvestorsModalOpen(false)}
                                className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-8">
                            {isFetchingInvestors ? (
                                <div className="py-20 text-center flex flex-col items-center gap-4">
                                    <div className="size-12 border-4 border-forest-green/20 border-t-forest-green rounded-full animate-spin"></div>
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Loading Investors...</p>
                                </div>
                            ) : branchInvestors.length > 0 ? (
                                <div className="border border-border-light rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#f9fafb] text-[#6b7280] border-b border-border-light">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Investor Name</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Contact Info</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Total Invested</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-light">
                                            {branchInvestors.map((investor) => (
                                                <tr key={investor._id} className="hover:bg-neutral-light/50 transition-colors group">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-forest-green text-white flex items-center justify-center text-sm font-black uppercase">
                                                                {investor.name?.charAt(0) || '?'}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-gray-900">{investor.name}</span>
                                                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter italic">UID: {investor.userName}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                                                <span className="material-symbols-outlined text-[14px]">mail</span>
                                                                {investor.email}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                                                <span className="material-symbols-outlined text-[14px]">call</span>
                                                                {investor.phone}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-sm font-black text-gray-900">
                                                            Rs {(investor.amountInvested || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={clsx(
                                                            "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                            investor.status === 'active' ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"
                                                        )}>
                                                            {investor.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-20 text-center flex flex-col items-center gap-3">
                                    <span className="material-symbols-outlined text-4xl text-gray-200">person_off</span>
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">No investors linked to this branch yet</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t border-border-light bg-neutral-light/10">
                            <button
                                onClick={() => setIsInvestorsModalOpen(false)}
                                className="w-full px-8 py-4 rounded-2xl bg-forest-green text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-forest-green/20 hover:bg-deep-green transition-all"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ManageBranches;
