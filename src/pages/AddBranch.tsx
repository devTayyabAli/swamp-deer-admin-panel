import { useState, useEffect } from 'react';
import { createBranch, getUsers } from '../services/dataService';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { User } from '../types';

const AddBranch = () => {
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [address, setAddress] = useState('');
    const [managerId, setManagerId] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const fetchedUsers = await getUsers();
                // Optionally filter for specific roles if needed, e.g., role === 'branch_manager'
                setUsers(fetchedUsers);
            } catch (error) {
                console.error('Failed to fetch users', error);
                toast.error('Could not load users for manager assignment');
            }
        };
        fetchUsers();
    }, []);

    const handleSubmit = async () => {
        if (!name || !city || !state || !address) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Adding branch...');
        try {
            await createBranch({ 
                name, 
                city, 
                state, 
                address, 
                manager: managerId || undefined 
            });
            toast.success('Branch added successfully', { id: toastId });
            navigate('/dashboard'); 
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || 'Failed to add branch', { id: toastId });
            } else {
                toast.error('Failed to add branch', { id: toastId });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
             <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Add New Branch</h1>
                <p className="text-gray-500 mt-1">Register a new office location for sales operations.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
                <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-900" htmlFor="branch-name">Branch Name</label>
                        <input 
                            className="w-full rounded-lg border-border-light focus-gold text-sm p-3" 
                            id="branch-name" 
                            placeholder="e.g. North Point Regional" 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-900" htmlFor="city">City</label>
                            <input 
                                className="w-full rounded-lg border-border-light focus-gold text-sm p-3" 
                                id="city" 
                                placeholder="e.g. New York" 
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-900" htmlFor="state">State/Region</label>
                            <input 
                                className="w-full rounded-lg border-border-light focus-gold text-sm p-3" 
                                id="state" 
                                placeholder="e.g. NY" 
                                type="text"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-900" htmlFor="address">Full Address</label>
                        <textarea 
                            className="w-full rounded-lg border-border-light focus-gold text-sm p-3" 
                            id="address" 
                            placeholder="Enter complete street address..." 
                            rows={3}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-900" htmlFor="manager">Assign Branch Manager</label>
                         <select 
                            className="w-full rounded-lg border-border-light focus-gold text-sm p-3 bg-white" 
                            id="manager"
                            value={managerId}
                            onChange={(e) => setManagerId(e.target.value)}
                        >
                            <option value="">Select a manager...</option>
                            {(users || []).map(user => (
                                <option key={user._id} value={user._id}>
                                    {user.name} ({user.email}) - {user.role}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                         <button 
                            type="button"
                            onClick={() => navigate('/manage-branches')}
                            className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-500 hover:bg-neutral-light transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-deep-green hover:bg-forest-green text-white text-sm font-bold transition-all shadow-md disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-sm">add_business</span>
                            {isLoading ? 'Adding...' : 'Add Branch'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddBranch;
