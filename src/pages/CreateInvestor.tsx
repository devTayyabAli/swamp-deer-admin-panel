import { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { createNewInvestor } from '../store/slices/investorSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CreateInvestor = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    // Local loading state
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!fullName || !email || !phone || !address) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Synchronizing new investor profile...');
        try {
            await dispatch(createNewInvestor({
                fullName,
                email,
                phone,
                address,
                role: 'investor',
                isReferrer: false // Admins create investors by default here
            })).unwrap();

            toast.success('Investor profile created successfully', { id: toastId });
            navigate('/manage-investors');
        } catch (err: unknown) {
            if (typeof err === 'string') {
                toast.error(err, { id: toastId });
            } else {
                toast.error('Failed to create profile', { id: toastId });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[640px] w-full mx-auto py-12 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-12">
                <div className="inline-block p-3 rounded-2xl bg-warm-gold/10 text-warm-gold mb-4">
                    <span className="material-symbols-outlined text-3xl">person_add</span>
                </div>
                <h1 className="text-forest-green text-3xl font-black leading-tight tracking-tight mb-2 italic">Investor Account Setup</h1>
                <p className="text-[#61896f] text-base font-medium opacity-70">Register a new participating partner to the management directory</p>
            </div>

            <div className="bg-white rounded-[32px] shadow-2xl border border-[#dbe6df] overflow-hidden">
                <div className="p-8 sm:p-12 space-y-10">
                    <div className="grid grid-cols-1 gap-8">
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] ml-1 opacity-60" htmlFor="full-name">Full Name</label>
                            <input
                                className="w-full rounded-2xl border-[#dbe6df] bg-neutral-light/50 focus:bg-white focus:ring-2 focus:ring-swamp-deer/5 focus:border-swamp-deer text-sm p-4 placeholder:text-gray-400 font-bold transition-all"
                                id="full-name"
                                placeholder="e.g. Alexander Wright"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] ml-1 opacity-60" htmlFor="phone">Phone Number</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-lg opacity-50 font-variation-light">call</span>
                                    <input
                                        className="w-full rounded-2xl border-[#dbe6df] bg-neutral-light/50 focus:bg-white focus:ring-2 focus:ring-swamp-deer/5 focus:border-swamp-deer text-sm pl-12 p-4 placeholder:text-gray-400 font-bold transition-all"
                                        id="phone"
                                        placeholder="+1 (555) 000-0000"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <label className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] ml-1 opacity-60" htmlFor="email">Email Address</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-lg opacity-50">mail</span>
                                    <input
                                        className="w-full rounded-2xl border-[#dbe6df] bg-neutral-light/50 focus:bg-white focus:ring-2 focus:ring-swamp-deer/5 focus:border-swamp-deer text-sm pl-12 p-4 placeholder:text-gray-400 font-bold transition-all"
                                        id="email"
                                        placeholder="alex.wright@email.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>



                        <div className="flex flex-col gap-2.5">
                            <label className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] ml-1 opacity-60" htmlFor="address">Address</label>
                            <textarea
                                className="w-full rounded-2xl border-[#dbe6df] bg-neutral-light/50 focus:bg-white focus:ring-2 focus:ring-swamp-deer/5 focus:border-swamp-deer text-sm p-4 placeholder:text-gray-400 font-bold transition-all"
                                id="address"
                                placeholder="Enter residential or office address details..."
                                rows={3}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-[#f0f4f2] flex flex-col-reverse sm:flex-row items-center justify-between gap-6 sm:gap-0">
                        <button
                            type="button"
                            onClick={() => navigate('/manage-investors')}
                            className="text-[10px] font-black text-gray-400 hover:text-swamp-deer uppercase tracking-[0.25em] transition-colors"
                        >
                            Cancel and Return
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto flex items-center justify-center gap-4 px-12 py-5 rounded-2xl bg-swamp-deer hover:bg-forest-green text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-swamp-deer/30 disabled:opacity-50 group/btn active:scale-95"
                        >
                            <span>{isSubmitting ? 'Processing...' : 'Deploy Profile'}</span>
                            <span className="material-symbols-outlined text-sm group-hover:translate-x-1.5 transition-transform">rocket_launch</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateInvestor;
