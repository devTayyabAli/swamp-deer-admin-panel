import { X, ArrowDown, Users, User, ArrowUpRight } from 'lucide-react';
import type { InvestorTeam } from '../services/dataService';

interface TeamViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamData: InvestorTeam | null;
    isLoading: boolean;
}

const TeamViewModal = ({ isOpen, onClose, teamData, isLoading }: TeamViewModalProps) => {
    if (!isOpen) return null;

    const directDownline = teamData?.direct || teamData?.downline || [];

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-border-light animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 bg-forest-green text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-warm-gold rounded-xl flex items-center justify-center text-forest-green">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight leading-tight uppercase">Referral Network Audit</h3>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-0.5">Hierarchy & Downline Verification</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-12">
                    {isLoading ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <div className="size-12 border-4 border-forest-green/20 border-t-forest-green rounded-full animate-spin"></div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Compiling Network Data...</p>
                        </div>
                    ) : teamData ? (
                        <div className="space-y-10">
                            {/* Upline Section */}
                            <div className="relative">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                                    <ArrowUpRight size={14} className="text-swamp-deer" />
                                    Upline Partner (Recruiter)
                                </h4>
                                {teamData.upline ? (
                                    <div className="bg-neutral-light/50 border border-border-light rounded-2xl p-5 flex items-center justify-between group transition-all hover:bg-white hover:shadow-xl hover:shadow-forest-green/5 hover:border-swamp-deer/30">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-xl bg-forest-green flex items-center justify-center text-warm-gold font-black text-xs shadow-lg">
                                                {teamData.upline.fullName?.substring(0, 2).toUpperCase() || 'UP'}
                                            </div>
                                            <div>
                                                <p className="text-forest-green font-black tracking-tight">{teamData.upline.fullName}</p>
                                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{teamData.upline.phone}</p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-swamp-deer/10 text-swamp-deer rounded-lg text-[9px] font-black uppercase tracking-widest border border-swamp-deer/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Fixed Upline
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-border-light rounded-2xl p-6 text-center">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider italic">Direct Corporate Entry (No External Upline)</p>
                                    </div>
                                )}

                                <div className="absolute left-[26px] -bottom-10 h-10 w-0.5 bg-linear-to-b from-border-light to-transparent"></div>
                            </div>

                            {/* Current Subject */}
                            <div className="flex flex-col items-center relative py-2">
                                <div className="bg-swamp-deer text-warm-gold p-6 rounded-[24px] shadow-2xl shadow-swamp-deer/20 flex flex-col items-center gap-3 w-full border border-warm-gold/20 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="size-14 rounded-2xl bg-white text-forest-green flex items-center justify-center font-black text-lg shadow-inner">
                                            <User size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between items-start">
                                                <div>
                                                    <p className="text-white text-xl font-black tracking-tighter leading-none">{teamData.current.fullName || 'Unknown Partner'}</p>
                                                    <p className="text-warm-gold/70 text-[11px] font-bold uppercase tracking-widest mt-2">{teamData.current.phone}</p>
                                                </div>
                                                <div className="flex gap-6 text-right">
                                                    <div>
                                                        <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Total Valuation</p>
                                                        <p className="text-lg font-black text-white leading-none">Rs {(teamData.current as any).amountInvested?.toLocaleString() || '0'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-swamp-deer/70 uppercase tracking-[0.2em] mb-1">Total Profits</p>
                                                        <p className="text-lg font-black text-warm-gold leading-none">Rs {(teamData.current as any).totalReward?.toLocaleString() || '0'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {teamData.current.isReferrer && (
                                        <div className="absolute -top-3 -right-3 bg-white text-swamp-deer text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-xl border border-swamp-deer/10">
                                            Master Referrer
                                        </div>
                                    )}
                                </div>

                                {directDownline.length > 0 && (
                                    <div className="h-10 w-0.5 bg-linear-to-b from-swamp-deer/30 to-border-light"></div>
                                )}
                            </div>

                            {/* Downline Section */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                                    <ArrowDown size={14} className="text-forest-green" />
                                    Downline Network ({directDownline.length} Direct Recruits)
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {directDownline.length > 0 ? (
                                        directDownline.map((recruit) => (
                                            <div key={recruit._id} className="bg-white border border-border-light rounded-2xl p-4 flex flex-col gap-4 transition-all hover:shadow-lg hover:border-forest-green/20 group cursor-default relative overflow-hidden">
                                                <div className="flex items-center gap-3 relative z-10">
                                                    <div className="size-10 rounded-lg bg-neutral-light text-forest-green flex items-center justify-center text-[10px] font-black uppercase group-hover:bg-forest-green group-hover:text-white transition-colors">
                                                        {recruit.fullName?.substring(0, 2).toUpperCase() || 'DR'}
                                                    </div>
                                                    <div>
                                                        <p className="text-forest-green font-bold text-sm tracking-tight leading-tight">{recruit.fullName}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">{recruit.phone}</p>
                                                    </div>
                                                    {recruit.isReferrer && (
                                                        <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 bg-swamp-deer/10 rounded-lg">
                                                            <div className="size-1.5 rounded-full bg-swamp-deer animate-pulse"></div>
                                                            <span className="text-[8px] font-black text-swamp-deer uppercase tracking-widest">Master</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-dashed border-border-light relative z-10">
                                                    <div className="bg-neutral-light/50 p-2 rounded-xl">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Valuation</p>
                                                        <p className="text-[11px] font-black text-forest-green">Rs {(recruit as any).amount?.toLocaleString() || '0'}</p>
                                                    </div>
                                                    <div className="bg-neutral-light/50 p-2 rounded-xl">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Generated</p>
                                                        <p className="text-[11px] font-black text-swamp-deer">Rs {(recruit as any).profit?.toLocaleString() || '0'}</p>
                                                    </div>
                                                </div>

                                                <div className="absolute top-0 right-0 w-16 h-16 bg-forest-green/5 rounded-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full border border-dashed border-border-light rounded-2xl p-8 text-center flex flex-col items-center gap-2">
                                            <Users size={24} className="text-gray-200" />
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider italic">No Active Downline Network Identified</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">Error loading team context.</div>
                    )}
                </div>

                {/* Footer Insight */}
                <div className="px-8 py-5 bg-neutral-light/50 border-t border-border-light flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#006820] font-black text-[9px] uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg shadow-sm border border-forest-green/5">
                        <span className="material-symbols-outlined text-[14px]">verified_user</span>
                        Security Protocol Verified
                    </div>
                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest opacity-50">SalesPro Network Analytics v2.0</p>
                </div>
            </div>
        </div>
    );
};

export default TeamViewModal;
