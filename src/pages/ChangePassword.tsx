import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        // Mock API call since backend endpoint might not exist yet
        const toastId = toast.loading('Updating password...');
        
        setTimeout(() => {
            toast.success('Password updated successfully', { id: toastId });
            setIsLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="max-w-2xl mx-auto">
             <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
                <p className="text-gray-500 mt-1">Update your account security credentials.</p>
            </div>
             <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
                <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-900" htmlFor="current-password">Current Password</label>
                        <div className="relative group">
                            <input 
                                className="w-full rounded-lg border-border-light focus-gold text-sm p-3 pr-10 transition-all" 
                                id="current-password" 
                                placeholder="Enter current password" 
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-deep-green transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">{showCurrentPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-900" htmlFor="new-password">New Password</label>
                        <div className="relative group">
                            <input 
                                className="w-full rounded-lg border-border-light focus-gold text-sm p-3 pr-10 transition-all" 
                                id="new-password" 
                                placeholder="Enter new password" 
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-deep-green transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">{showNewPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                        <p className="text-xs text-gray-400">Must be at least 8 characters long.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-900" htmlFor="confirm-password">Confirm New Password</label>
                        <div className="relative group">
                            <input 
                                className="w-full rounded-lg border-border-light focus-gold text-sm p-3 pr-10 transition-all" 
                                id="confirm-password" 
                                placeholder="Confirm new password" 
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-deep-green transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                         <button 
                            onClick={() => navigate(-1)}
                            className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-500 hover:bg-neutral-light transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-deep-green hover:bg-forest-green text-white text-sm font-bold transition-all shadow-md disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-sm">lock_reset</span>
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
