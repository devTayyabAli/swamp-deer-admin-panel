import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchBranches } from '../store/slices/branchSlice';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateSalesAccount = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items: branches } = useSelector((state: RootState) => state.branches);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('sales_rep');
    const [branch, setBranch] = useState('');

    const { register, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchBranches({}));
    }, [dispatch]);

    const handleSubmit = async () => {
        if (!firstName || !lastName || !email) {
            toast.error('Please fill in required fields');
            return;
        }

        const toastId = toast.loading('Creating account...');
        try {
            await register({
                firstName,
                lastName,
                email,
                role,
                branch: branch || undefined
            });
            toast.success('Account created successfully!', { id: toastId });

            // Reset form
            setFirstName('');
            setLastName('');
            setEmail('');
            setRole('sales_rep');
            setBranch('');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || 'Failed to create account', { id: toastId });
            } else {
                toast.error('Failed to create account', { id: toastId });
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Create Sales Account</h1>
                <p className="text-gray-500 mt-1">Set up access for a new sales representative or manager.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
                <div className="p-6 sm:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-900" htmlFor="first-name">First Name</label>
                            <input
                                className="w-full rounded-lg border-border-light focus-gold text-sm p-3"
                                id="first-name"
                                placeholder="e.g. John"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-900" htmlFor="last-name">Last Name</label>
                            <input
                                className="w-full rounded-lg border-border-light focus-gold text-sm p-3"
                                id="last-name"
                                placeholder="e.g. Doe"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-900" htmlFor="email">Email Address</label>
                        <input
                            className="w-full rounded-lg border-border-light focus-gold text-sm p-3"
                            id="email"
                            placeholder="e.g. john.doe@company.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-900" htmlFor="role">Role</label>
                        <select
                            className="w-full rounded-lg border-border-light focus-gold text-sm p-3 bg-white"
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="sales_rep">Sales Representative</option>
                            <option value="branch_manager">Branch Manager</option>
                            <option value="super_admin">Admin</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-900" htmlFor="branch">Assigned Branch</label>
                        <select
                            className="w-full rounded-lg border-border-light focus-gold text-sm p-3 bg-white"
                            id="branch"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                        >
                            <option value="">Select a branch...</option>
                            {branches.map((b) => (
                                <option key={b._id} value={b._id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-500 hover:bg-neutral-light transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-deep-green hover:bg-forest-green text-white text-sm font-bold transition-all shadow-md disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-sm">person_add</span>
                            {isLoading ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateSalesAccount;
