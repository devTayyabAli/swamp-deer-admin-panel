import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Calendar, Wallet, ArrowLeft, ArrowUpRight, User, Users } from 'lucide-react';
// import { cn } from '../lib/utils';
import { getInvestorTeam, type InvestorTeam } from '../services/dataService';
import toast from 'react-hot-toast';

type TeamType = 'direct' | 'indirect' | 'all';

export default function InvestorTeamPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TeamType>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<string>('all');
    const [teamData, setTeamData] = useState<InvestorTeam | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const data = await getInvestorTeam(id);
                setTeamData(data);
            } catch (err) {
                toast.error('Failed to load team data');
                navigate('/manage-investors');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeam();
    }, [id, navigate]);

    const getTeamList = () => {
        if (!teamData) return [];
        if (activeTab === 'direct') return teamData.direct || [];
        if (activeTab === 'indirect') return teamData.indirect || [];
        return teamData.all || [];
    };

    const filteredMembers = getTeamList().filter(member => {
        const name = member.name || member.fullName || '';
        const email = member.email || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLevel = selectedLevel === 'all' || member.level?.toString() === selectedLevel;

        return matchesSearch && matchesLevel;
    });

    if (isLoading) {
        return (
            <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="size-12 border-4 border-forest-green/20 border-t-forest-green rounded-full animate-spin"></div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Compiling Network Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/manage-investors')}
                        className="p-2 hover:bg-neutral-light rounded-xl transition-colors border border-border-light text-gray-400 hover:text-forest-green"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase italic">Referral Network Audit</h1>
                        <p className="text-gray-500 text-sm font-medium">Viewing network context for <span className="text-swamp-deer font-bold">{teamData?.current.fullName}</span></p>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upline Section */}
                <div className="lg:col-span-1 space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-2">
                        <ArrowUpRight size={14} className="text-swamp-deer" />
                        Upline Partner
                    </h4>
                    {teamData?.upline ? (
                        <div className="bg-white border border-border-light rounded-[24px] p-6 flex items-center gap-4 group transition-all hover:shadow-xl hover:shadow-forest-green/5 hover:border-swamp-deer/30">
                            <div className="size-14 rounded-2xl bg-forest-green flex items-center justify-center text-warm-gold font-black text-lg shadow-lg group-hover:scale-105 transition-transform">
                                {teamData.upline.name?.substring(0, 2).toUpperCase() || 'UP'}
                            </div>
                            <div>
                                <p className="text-forest-green font-black text-lg tracking-tighter leading-none">{teamData.upline.name}</p>
                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-2">{teamData.upline.phone}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-dashed border-border-light rounded-[24px] p-8 text-center flex flex-col items-center justify-center h-[100px]">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider italic">Direct Corporate Entry</p>
                        </div>
                    )}
                </div>

                {/* Current Subject */}
                <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-2">
                        <User size={14} className="text-forest-green" />
                        Current Partner Context
                    </h4>
                    <div className="bg-swamp-deer text-warm-gold p-6 rounded-[24px] shadow-2xl shadow-swamp-deer/20 flex flex-col sm:flex-row items-center gap-6 w-full border border-warm-gold/20 relative overflow-hidden group">
                        <div className="size-20 rounded-[20px] bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-3xl group-hover:scale-110 transition-transform">
                            <User size={40} className="text-white" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <p className="text-white text-3xl font-black tracking-tight italic uppercase">{teamData?.current.fullName}</p>
                            <p className="text-warm-gold/70 text-xs font-bold uppercase tracking-[0.2em] mt-2">{teamData?.current.phone}</p>
                        </div>
                        <div className="flex gap-8 text-right border-l border-white/10 pl-8 hidden sm:flex">
                            <div>
                                <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Portfolio Valuation</p>
                                <p className="text-2xl font-black text-white leading-none tracking-tighter">Rs {(teamData?.current as any).amountInvested?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-swamp-deer/70 uppercase tracking-[0.2em] mb-1">Total Profits</p>
                                <p className="text-2xl font-black text-warm-gold leading-none tracking-tighter">Rs {(teamData?.current as any).totalReward?.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 size-32 bg-white/5 rounded-full blur-2xl"></div>
                    </div>
                </div>
            </div>

            {/* Search & Tabs */}
            <div className="flex flex-col xl:flex-row gap-6 items-center justify-between">
                <div className="bg-white p-1 rounded-2xl border border-border-light shadow-sm flex items-center gap-1 w-full xl:w-auto overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={
                            `px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                            ${activeTab === 'all'
                                ? "bg-forest-green text-white shadow-xl shadow-forest-green/20"
                                : "text-gray-400 hover:text-forest-green hover:bg-neutral-light"
                            }`
                        }
                    >
                        Master Ledger ({teamData?.all?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('direct')}
                        className={
                            `px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                            ${activeTab === 'direct'
                                ? "bg-forest-green text-white shadow-xl shadow-forest-green/20"
                                : "text-gray-400 hover:text-forest-green hover:bg-neutral-light"
                            }`
                        }
                    >
                        Direct Recruits ({teamData?.direct?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('indirect')}
                        className={
                            `px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                            ${activeTab === 'indirect'
                                ? "bg-forest-green text-white shadow-xl shadow-forest-green/20"
                                : "text-gray-400 hover:text-forest-green hover:bg-neutral-light"
                            }`
                        }
                    >
                        Indirect Network ({teamData?.indirect?.length || 0})
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full xl:max-w-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Scan entries by name or email identifier..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-border-light rounded-2xl focus:ring-2 focus:ring-forest-green/10 focus:border-forest-green transition-all outline-none text-sm font-bold shadow-sm"
                        />
                    </div>
                    <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="px-4 py-4 bg-white border border-border-light rounded-2xl focus:ring-2 focus:ring-forest-green/10 focus:border-forest-green transition-all outline-none text-sm font-bold shadow-sm min-w-[140px]"
                    >
                        <option value="all">Every Level</option>
                        {Array.from({ length: 8 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>Tier Level {i + 1}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Team Table */}
            <div className="bg-white rounded-[24px] border border-border-light shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-light/50 border-b border-border-light">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Node Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap text-center">Level</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Capital Valuation</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Deployment Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Upline Reference</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Generated Yield</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Node Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light/50">
                            {filteredMembers.map((member) => (
                                <tr key={member._id} className="hover:bg-neutral-light/30 transition-all duration-200 group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-forest-green/5 text-forest-green flex items-center justify-center font-black text-[11px] group-hover:bg-forest-green group-hover:text-white transition-all shadow-inner">
                                                {(member.name || (member as any).fullName || '').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-gray-900 tracking-tight">{member.name || (member as any).fullName}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{member.email || (member as any).phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="inline-flex items-center px-2 py-1 bg-forest-green/5 text-forest-green rounded-lg text-[10px] font-black italic border border-forest-green/10 shadow-xs">
                                            TIER {member.level || (member.type === 'direct' ? 1 : 2)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-sm font-black text-forest-green tracking-tighter">
                                            <Wallet className="w-4 h-4 text-emerald-500/60" />
                                            Rs {member.amount?.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-gray-600 font-bold">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-300" />
                                            {member.date ? new Date(member.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                                            {typeof member.upline === 'string' ? member.upline : (member.upline as any)?.name || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-black text-swamp-deer tracking-tighter">Rs {member.profit?.toLocaleString()}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {member.type === 'direct' ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-xs">
                                                Direct Node
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs">
                                                Indirect Node
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredMembers.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-300">
                                            <div className="p-4 bg-neutral-light rounded-full">
                                                <Users className="w-12 h-12 opacity-30" />
                                            </div>
                                            <p className="font-black text-[11px] uppercase tracking-[0.2em] italic">No matching node records identified in this segment</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-8 py-5 bg-neutral-light/20 border-t border-border-light flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">
                        Audit Summary: {filteredMembers.length} Unique Nodes Identified
                    </span>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 text-[#006820] font-black text-[8px] uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg shadow-sm border border-forest-green/5">
                            <span className="material-symbols-outlined text-[13px]">verified</span>
                            Protocol Active
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
