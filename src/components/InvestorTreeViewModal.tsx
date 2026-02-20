import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { getInvestorTeam, type InvestorTeam, type TeamMember } from '../services/dataService';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface InvestorTreeViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    investorId: string;
    investorName: string;
}

interface MemberNodeProps {
    member: TeamMember;
    level: number;
}

const MemberNode: React.FC<MemberNodeProps> = ({ member, level }) => {
    return (
        <div className="relative group">
            {/* Member Box */}
            <div className="px-4 py-3 bg-white border border-border-light rounded-xl shadow-sm hover:shadow-xl hover:border-forest-green/30 transition-all cursor-pointer min-w-[160px] text-center group/node">
                <div className="size-8 rounded-lg bg-forest-green/5 text-forest-green flex items-center justify-center font-black text-[10px] mx-auto mb-2 group-hover/node:bg-forest-green group-hover/node:text-white transition-all">
                    {member.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="font-black text-xs text-gray-900 truncate leading-none">{member.name}</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-60">Level {level}</div>
            </div>

            {/* Hover Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 bg-white border border-border-light rounded-2xl shadow-2xl p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] ring-1 ring-black/[0.05]">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="border-b border-border-light pb-3">
                        <h3 className="font-black text-gray-900 text-sm tracking-tight">{member.name}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{member.email}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">{member.phone}</p>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">Investment</span>
                            <span className="text-xs font-black text-forest-green">Rs {member.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">Reward Earned</span>
                            <span className="text-xs font-black text-swamp-deer">Rs {member.profit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">Node Type</span>
                            <span className={clsx(
                                "text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border",
                                member.type === 'direct'
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            )}>
                                {member.type} Node
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">Deployment</span>
                            <span className="text-[10px] font-bold text-gray-600">
                                {new Date(member.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tooltip Arrow */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-border-light rotate-45"></div>
            </div>
        </div>
    );
};

const InvestorTreeViewModal: React.FC<InvestorTreeViewModalProps> = ({ isOpen, onClose, investorId, investorName }) => {
    const [teamData, setTeamData] = useState<InvestorTeam | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            if (!isOpen || !investorId) return;
            setIsLoading(true);
            try {
                const data = await getInvestorTeam(investorId);
                setTeamData(data);
            } catch (err) {
                toast.error('Failed to load team tree data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeam();
    }, [isOpen, investorId]);

    const MAX_LEVELS = 8;

    const organizeByLevels = () => {
        if (!teamData) return [];
        const levels: TeamMember[][] = [];
        const processed = new Set<string>();

        // Level 1: Direct members
        const level1 = teamData.all.filter(m => m.uplineId === investorId);
        if (level1.length > 0) {
            levels.push(level1);
            level1.forEach(m => processed.add(m._id!));
        }

        // Build subsequent levels
        let currentLevel = level1;
        while (currentLevel.length > 0 && levels.length < MAX_LEVELS) {
            const nextLevel: TeamMember[] = [];
            currentLevel.forEach(parent => {
                const children = teamData.all.filter(m => m.uplineId === parent._id && !processed.has(m._id!));
                children.forEach(child => {
                    nextLevel.push(child);
                    processed.add(child._id!);
                });
            });
            if (nextLevel.length > 0) {
                levels.push(nextLevel);
            }
            currentLevel = nextLevel;
        }

        return levels;
    };

    const levels = organizeByLevels();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-border-light">
                {/* Header */}
                <div className="px-10 py-8 bg-forest-green text-white flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="size-14 bg-warm-gold rounded-[20px] flex items-center justify-center text-forest-green shadow-lg shadow-black/10">
                            <Users size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tight leading-tight uppercase italic">Strategic Referral Tree</h3>
                            <p className="text-white/60 text-[11px] font-bold uppercase tracking-[0.2em] mt-1">
                                Partner: <span className="text-warm-gold">{investorName}</span> • Architecture Analysis
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="relative z-10 p-3 hover:bg-white/10 rounded-full transition-all text-white/70 hover:text-white group active:scale-90"
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform" />
                    </button>
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 size-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                </div>

                {/* Tree Content */}
                <div className="flex-1 overflow-auto p-12 bg-neutral-light/20 scrollbar-thin scrollbar-thumb-gray-200">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 gap-4">
                            <div className="size-16 border-4 border-forest-green/20 border-t-forest-green rounded-full animate-spin"></div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Mapping Neural Network...</p>
                        </div>
                    ) : levels.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                            <div className="size-24 bg-gray-100 rounded-[32px] flex items-center justify-center mb-6 opacity-30">
                                <Users size={40} className="text-gray-400" />
                            </div>
                            <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">Empty Structure</h4>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 max-w-xs mx-auto opacity-70 italic">This partner has not yet deployed any direct nodes into the referral network.</p>
                        </div>
                    ) : (
                        <div className="min-w-max flex flex-col items-center">
                            {/* Root Node */}
                            <div className="flex flex-col items-center mb-16 relative">
                                <div className="px-10 py-5 bg-gradient-to-br from-swamp-deer to-swamp-deer/90 text-white rounded-[24px] shadow-2xl shadow-swamp-deer/20 font-black text-lg border border-warm-gold/20 flex flex-col items-center">
                                    <span className="text-[9px] font-black text-warm-gold/70 uppercase tracking-[0.3em] mb-1">Network Base</span>
                                    {investorName}
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-16 bg-gradient-to-b from-swamp-deer/40 to-forest-green/20"></div>
                            </div>

                            {/* Levels */}
                            {levels.map((levelMembers, levelIndex) => (
                                <div key={levelIndex} className="mb-16 w-full">
                                    {/* Level Indicator */}
                                    <div className="flex items-center justify-center mb-10 gap-4">
                                        <div className="h-px w-24 bg-gradient-to-r from-transparent to-border-light"></div>
                                        <div className="flex items-center gap-3 px-4 py-2 bg-white border border-border-light rounded-full shadow-sm">
                                            <div className="size-6 rounded-full bg-forest-green text-white flex items-center justify-center text-[9px] font-black italic">
                                                {levelIndex + 1}
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tier Level</span>
                                            <div className="px-2 py-0.5 bg-forest-green/5 rounded-md text-[9px] font-black text-forest-green">
                                                {levelMembers.length} {levelMembers.length === 1 ? 'Node' : 'Nodes'}
                                            </div>
                                        </div>
                                        <div className="h-px w-24 bg-gradient-to-l from-transparent to-border-light"></div>
                                    </div>

                                    {/* Members Grid */}
                                    <div className="flex justify-center">
                                        <div className="flex flex-wrap gap-8 justify-center max-w-7xl relative">
                                            {levelMembers.map((member) => (
                                                <div key={member._id} className="relative">
                                                    {/* Vertical Connector */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-px h-10 bg-forest-green/10"></div>
                                                    <MemberNode member={member} level={levelIndex + 1} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Vertical Connector to Next Level */}
                                    {levelIndex < levels.length - 1 && (
                                        <div className="flex justify-center mt-10">
                                            <div className="w-px h-10 bg-gradient-to-b from-forest-green/10 to-transparent"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-10 py-6 bg-white border-t border-border-light flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 p-1.5 px-3 bg-neutral-light/50 rounded-xl border border-border-light">
                            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Protocol Sync: Active</span>
                        </div>
                        <div className="flex items-center gap-2 p-1.5 px-3 bg-neutral-light/50 rounded-xl border border-border-light">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Hierarchy Depth: <span className="text-forest-green">{levels.length} Tiers</span></span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-8 py-3.5 bg-forest-green text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-forest-green/20 hover:bg-deep-green transition-all active:scale-95"
                    >
                        Close Analytics
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvestorTreeViewModal;
