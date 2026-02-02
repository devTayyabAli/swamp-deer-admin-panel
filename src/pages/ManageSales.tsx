import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchAllUsers, toggleStatus } from '../store/slices/usersSlice';
import { fetchBranches } from '../store/slices/branchSlice';
import { updateUser } from '../services/dataService';
import toast from 'react-hot-toast';
import type { User } from '../types';

interface EditModalProps {
    user: User;
    onClose: () => void;
    onSave: (updatedData: Partial<User>) => Promise<void>;
    branches: any[];
}

const EditModal = ({ user, onClose, onSave, branches }: EditModalProps) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [role, setRole] = useState(user.role);
    const [branchId, setBranchId] = useState(typeof user.branchId === 'string' ? user.branchId : (user.branchId as any)?._id || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({ name, email, role, branchId });
            onClose();
        } catch (err) {
            toast.error('Failed to update user');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-border-light flex justify-between items-center bg-neutral-light/30">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Edit Sales Account</h3>
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
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                            <select 
                                className="w-full rounded-lg border-border-light bg-neutral-light/30 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm p-3 font-semibold transition-all"
                                value={role}
                                onChange={(e) => setRole(e.target.value as User['role'])}
                            >
                                <option value="sales_rep">Sales Rep</option>
                                <option value="branch_manager">Branch Manager</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Branch</label>
                            <select 
                                className="w-full rounded-lg border-border-light bg-neutral-light/30 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm p-3 font-semibold transition-all"
                                value={branchId}
                                onChange={(e) => setBranchId(e.target.value)}
                            >
                                <option value="">No Branch</option>
                                {branches.map(b => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))}
                            </select>
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
            </div>
        </div>
    );
};

const ManageSales = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items: users, isLoading: isUsersLoading, pagination } = useSelector((state: RootState) => state.users);
    const { items: branches } = useSelector((state: RootState) => state.branches);
    const { page, pages, total } = pagination;

    const [currentPage, setCurrentPage] = useState(1);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        dispatch(fetchAllUsers({ page: currentPage, limit: 10, roles: ['sales_rep', 'branch_manager'] }));
        dispatch(fetchBranches({ limit: -1 }));
    }, [dispatch, currentPage]);

    const handleToggleStatus = async (id: string) => {
        try {
            const res = await dispatch(toggleStatus(id)).unwrap();
            toast.success(res.message);
        } catch (err: any) {
            toast.error('Failed to update status');
        }
    };

    const handleUpdateUser = async (updatedData: Partial<User>) => {
        if (!editingUser) return;
        try {
            await updateUser(editingUser._id, updatedData);
            toast.success('User updated successfully');
            dispatch(fetchAllUsers({ page: currentPage, limit: 10, roles: ['sales_rep', 'branch_manager'] }));
        } catch (err) {
            throw err;
        }
    };

    const isLoading = isUsersLoading && users.length === 0;

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
            <div className="mb-8 flex justify-between items-center animate-in fade-in slide-in-from-top duration-500">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Manage Sales Accounts</h2>
                    <p className="text-gray-500 mt-1 font-medium">View and manage status of sales representatives and managers ({total} total).</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-border-light overflow-hidden animate-in fade-in slide-in-from-bottom duration-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-neutral-light/50 border-b border-border-light">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-neutral-light/30 transition-all duration-200">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                        <div className="text-[11px] text-gray-400 font-medium tracking-tight">
                                            {branches.find(b => b._id === (typeof user.branchId === 'string' ? user.branchId : (user.branchId as any)?._id))?.name || 'Unassigned'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border shadow-sm ${
                                            user.role === 'branch_manager' 
                                                ? 'bg-amber-50 text-amber-600 border-amber-200' 
                                                : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                                        }`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            user.status === 'banned' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        }`}>
                                            <span className={`size-1.5 rounded-full ${user.status === 'banned' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                            {user.status || 'active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            <button 
                                                onClick={() => setEditingUser(user)}
                                                className="text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleToggleStatus(user._id)}
                                                className={`text-[11px] font-black uppercase tracking-widest transition-colors ${
                                                    user.status === 'banned' ? 'text-emerald-600 hover:text-emerald-700' : 'text-red-600 hover:text-red-700'
                                                }`}
                                            >
                                                {user.status === 'banned' ? 'Unban' : 'Ban'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && <div className="p-12 text-center text-gray-400 font-bold italic">No sales accounts found.</div>}
                </div>
                
                {/* Footer / Pagination */}
                <div className="bg-neutral-light/20 px-6 py-5 border-t border-border-light flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">
                        Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total.toLocaleString()} Accounts
                    </span>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="size-10 rounded-xl border border-border-light bg-white hover:bg-neutral-light text-gray-400 hover:text-gray-900 transition-all disabled:opacity-30 flex items-center justify-center shadow-sm"
                        >
                            <span className="material-symbols-outlined text-xl">chevron_left</span>
                        </button>
                        
                        <div className="flex items-center gap-1.5">
                            {[...Array(pages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={clsx(
                                        "size-10 rounded-xl text-xs font-black transition-all shadow-sm",
                                        currentPage === i + 1 
                                            ? "bg-emerald-600 text-white shadow-emerald-200" 
                                            : "bg-white hover:bg-neutral-light text-gray-500 border border-border-light"
                                    )}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
                            disabled={currentPage === pages}
                            className="size-10 rounded-xl border border-border-light bg-white hover:bg-neutral-light text-gray-400 hover:text-gray-900 transition-all disabled:opacity-30 flex items-center justify-center shadow-sm"
                        >
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {editingUser && (
                <EditModal 
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleUpdateUser}
                    branches={branches}
                />
            )}
        </div>
    );
};

export default ManageSales;
