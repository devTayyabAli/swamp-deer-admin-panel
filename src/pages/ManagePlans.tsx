import { useState, useEffect } from 'react';
import { getPlans, upsertPlan, getBranches, getUsers } from '../services/dataService';
import type { InvestmentPlan, Branch, User, PhaseConfig, RankTarget } from '../types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const ManagePlans = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [scope, setScope] = useState<'global' | 'branch' | 'user'>('global');
    const [scopeId, setScopeId] = useState<string>('');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    // Initial default state matched with backend defaults
    const [formData, setFormData] = useState<Omit<InvestmentPlan, '_id'>>({
        scope: 'global',
        referralBonusRates: [0.06, 0.025, 0.02, 0.015, 0.015, 0.01, 0.01, 0.005],
        matchingBonusRates: [0.06, 0.05, 0.04, 0.03, 0.03, 0.02, 0.02, 0.01],
        withProductPhases: [
            { phase: 1, months: 4, rate: 0.05, description: 'First 4 months at 5% monthly' },
            { phase: 2, months: 4, rate: 0.06, description: 'Second 4 months at 6% monthly' },
            { phase: 3, months: 4, rate: 0.07, description: 'Third 4 months at 7% monthly' }
        ],
        withoutProductPhases: [
            { phase: 1, months: 3, rate: 0.07, description: 'First 3 months at 7% monthly' },
            { phase: 2, months: 3, rate: 0.08, description: 'Second 3 months at 8% monthly' },
            { phase: 3, months: 3, rate: 0.09, description: 'Third 3 months at 9% monthly' },
            { phase: 4, months: 3, rate: 0.10, description: 'Fourth 3 months at 10% monthly' }
        ],
        rankTargets: [
            { rankId: 1, title: 'Sales Executive', withoutProduct: 1500000, withProduct: 3000000 },
            { rankId: 2, title: 'Sales Officer', withoutProduct: 4500000, withProduct: 9000000 },
            { rankId: 3, title: 'Sales Manager', withoutProduct: 13500000, withProduct: 27000000 },
            { rankId: 4, title: 'Regional Sales Manager', withoutProduct: 40500000, withProduct: 81000000 },
            { rankId: 5, title: 'Regional Director', withoutProduct: 121500000, withProduct: 243000000 },
            { rankId: 6, title: 'Zonal Head', withoutProduct: 364500000, withProduct: 729000000 },
            { rankId: 7, title: 'Director', withoutProduct: 1093500000, withProduct: 2187000000 },
            { rankId: 8, title: 'Ambassador', withoutProduct: 3280500000, withProduct: 6561000000 }
        ],
        profitCapMultiplier: 5
    });



    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [b, u] = await Promise.all([
                    getBranches(-1),
                    getUsers()
                ]);
                setBranches(b);
                setUsers(u.filter(usr => ['sales_rep', 'branch_manager'].includes(usr.role)));
            } catch (err) {
                toast.error('Failed to load branches/users');
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        const fetchCurrentPlan = async () => {
            if (scope !== 'global' && !scopeId) {
                return;
            }
            setLoading(true);
            try {
                const plans = await getPlans(scope, scopeId);
                if (plans.length > 0) {
                    setFormData(plans[0]);
                } else if (scope === 'global') {
                    toast.error('Global plan not found');
                } else {
                    // For branch/user overrides, keep previous data as template but reset ID
                    setFormData(prev => ({ ...prev, _id: undefined, scope, scopeId }));
                }
            } catch (err) {
                toast.error('Failed to fetch plan config');
            } finally {
                setLoading(false);
            }
        };
        fetchCurrentPlan();
    }, [scope, scopeId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await upsertPlan({ ...formData, scope, scopeId: scope === 'global' ? undefined : scopeId });
            toast.success('Configuration updated successfully');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update plan');
        } finally {
            setSaving(false);
        }
    };

    if (loading && (scope === 'global' || scopeId)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="size-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Configuration...</p>
            </div>
        );
    }

    const updatePhase = (planType: 'with' | 'without', index: number, field: keyof PhaseConfig, value: any) => {
        const phases = planType === 'with' ? [...formData.withProductPhases] : [...formData.withoutProductPhases];
        phases[index] = { ...phases[index], [field]: value };
        if (planType === 'with') setFormData({ ...formData, withProductPhases: phases });
        else setFormData({ ...formData, withoutProductPhases: phases });
    };

    const updateRank = (index: number, field: keyof RankTarget, value: any) => {
        const targets = [...formData.rankTargets];
        targets[index] = { ...targets[index], [field]: value };
        setFormData({ ...formData, rankTargets: targets });
    };

    const updateBonus = (type: 'referral' | 'matching', index: number, value: string) => {
        const val = parseFloat(value) / 100; // Store as decimal
        if (type === 'referral') {
            const rates = [...formData.referralBonusRates];
            rates[index] = val;
            setFormData({ ...formData, referralBonusRates: rates });
        } else {
            const rates = [...formData.matchingBonusRates];
            rates[index] = val;
            setFormData({ ...formData, matchingBonusRates: rates });
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <header className="animate-in fade-in slide-in-from-top duration-500">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Investment Plan Management</h2>
                <p className="text-gray-500 mt-1 font-medium italic">Configure ROI phases, referral bonuses, matching rewards, and rank targets across different scopes.</p>
            </header>

            {/* Scope Selection */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-border-light p-6 animate-in fade-in slide-in-from-bottom duration-700">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Configuration Scope</label>
                        <div className="flex p-1 bg-neutral-light rounded-xl gap-1">
                            {(['global', 'branch', 'user'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => { setScope(s); setScopeId(''); }}
                                    className={clsx(
                                        "flex-1 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all",
                                        scope === s ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-gray-500 hover:text-gray-900"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {scope === 'branch' && (
                        <div className="flex-1 space-y-1.5 animate-in slide-in-from-left duration-300">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Branch</label>
                            <select
                                className="w-full rounded-xl border-border-light bg-neutral-light/50 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm p-3 font-semibold transition-all"
                                value={scopeId}
                                onChange={(e) => setScopeId(e.target.value)}
                            >
                                <option value="">-- Choose Branch --</option>
                                {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                    )}

                    {scope === 'user' && (
                        <div className="flex-1 space-y-1.5 animate-in slide-in-from-left duration-300">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Sales/Team Lead</label>
                            <select
                                className="w-full rounded-xl border-border-light bg-neutral-light/50 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm p-3 font-semibold transition-all"
                                value={scopeId}
                                onChange={(e) => setScopeId(e.target.value)}
                            >
                                <option value="">-- Choose User --</option>
                                {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role.replace('_', ' ')})</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {(scope === 'global' || scopeId) && (
                <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-500">

                    {/* ROI PHASES SECTION */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* With Product Phases */}
                        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-border-light overflow-hidden">
                            <div className="p-5 bg-neutral-light/50 border-b border-border-light flex justify-between items-center">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-sm">inventory_2</span>
                                    With Product ROI Phases
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                {formData.withProductPhases.map((phase, idx) => (
                                    <div key={idx} className="flex gap-4 items-end p-4 bg-neutral-light/20 rounded-xl border border-dashed border-border-light">
                                        <div className="w-12 text-center">
                                            <span className="text-[10px] font-black text-gray-400 block mb-1 uppercase">Phase</span>
                                            <span className="text-lg font-black text-emerald-600">P{phase.phase}</span>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <span className="text-[10px] font-black text-gray-400 block uppercase">Months</span>
                                            <input
                                                type="number"
                                                className="w-full rounded-lg border-border-light text-sm p-2 font-bold"
                                                value={phase.months}
                                                onChange={(e) => updatePhase('with', idx, 'months', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <span className="text-[10px] font-black text-gray-400 block uppercase">Monthly ROI %</span>
                                            <input
                                                type="number" step="0.5"
                                                className="w-full rounded-lg border-border-light text-sm p-2 font-bold"
                                                value={parseFloat((phase.rate * 100).toFixed(4))}
                                                onChange={(e) => updatePhase('with', idx, 'rate', parseFloat(e.target.value) / 100)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Without Product Phases */}
                        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-border-light overflow-hidden">
                            <div className="p-5 bg-neutral-light/50 border-b border-border-light flex justify-between items-center">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-sm">payments</span>
                                    Without Product ROI Phases
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                {formData.withoutProductPhases.map((phase, idx) => (
                                    <div key={idx} className="flex gap-4 items-end p-4 bg-neutral-light/20 rounded-xl border border-dashed border-border-light">
                                        <div className="w-12 text-center">
                                            <span className="text-[10px] font-black text-gray-400 block mb-1 uppercase">Phase</span>
                                            <span className="text-lg font-black text-emerald-600">P{phase.phase}</span>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <span className="text-[10px] font-black text-gray-400 block uppercase">Months</span>
                                            <input
                                                type="number"
                                                className="w-full rounded-lg border-border-light text-sm p-2 font-bold"
                                                value={phase.months}
                                                onChange={(e) => updatePhase('without', idx, 'months', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <span className="text-[10px] font-black text-gray-400 block uppercase">Monthly ROI %</span>
                                            <input
                                                type="number" step="0.5"
                                                className="w-full rounded-lg border-border-light text-sm p-2 font-bold"
                                                value={parseFloat((phase.rate * 100).toFixed(4))}
                                                onChange={(e) => updatePhase('without', idx, 'rate', parseFloat(e.target.value) / 100)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* BONUSES SECTION */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Referral Bonuses */}
                        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-border-light overflow-hidden">
                            <div className="p-5 bg-neutral-light/50 border-b border-border-light">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-600 text-sm">hub</span>
                                    Instant Referral Bonuses (L1-L8)
                                </h3>
                            </div>
                            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {formData.referralBonusRates.map((rate, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Level {idx + 1} %</label>
                                        <input
                                            type="number" step="0.01"
                                            className="w-full rounded-lg border-border-light text-xs p-2 font-bold focus:border-indigo-500"
                                            value={(rate * 100).toFixed(2)}
                                            onChange={(e) => updateBonus('referral', idx, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Matching Bonuses */}
                        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-border-light overflow-hidden">
                            <div className="p-5 bg-neutral-light/50 border-b border-border-light">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-600 text-sm">join_inner</span>
                                    Matching ROI Bonuses (L1-L8)
                                </h3>
                            </div>
                            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {formData.matchingBonusRates.map((rate, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Level {idx + 1} %</label>
                                        <input
                                            type="number" step="0.01"
                                            className="w-full rounded-lg border-border-light text-xs p-2 font-bold focus:border-indigo-500"
                                            value={(rate * 100).toFixed(2)}
                                            onChange={(e) => updateBonus('matching', idx, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RANK TARGETS SECTION */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-border-light overflow-hidden">
                        <div className="p-5 bg-neutral-light/50 border-b border-border-light">
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-600 text-sm">military_tech</span>
                                Rank Upgrade Targets (Business Volume)
                            </h3>
                        </div>
                        <div className="p-6 overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-border-light">
                                        <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Rank ID</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Title</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Without Product Target</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">With Product Target</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light">
                                    {formData.rankTargets.map((rank, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-light/20 transition-all">
                                            <td className="px-4 py-3 text-xs font-black text-emerald-600">R{rank.rankId}</td>
                                            <td className="px-4 py-3">
                                                <input
                                                    className="w-full rounded-lg border-border-light text-xs p-2 font-bold bg-transparent"
                                                    value={rank.title}
                                                    onChange={(e) => updateRank(idx, 'title', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    className="w-full rounded-lg border-border-light text-xs p-2 font-bold bg-transparent"
                                                    value={rank.withoutProduct}
                                                    onChange={(e) => updateRank(idx, 'withoutProduct', parseInt(e.target.value))}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    className="w-full rounded-lg border-border-light text-xs p-2 font-bold bg-transparent"
                                                    value={rank.withProduct}
                                                    onChange={(e) => updateRank(idx, 'withProduct', parseInt(e.target.value))}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* GENERAL SETTINGS */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-border-light overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-6">
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Overall Profit Cap (X Multiple)</label>
                                    <input
                                        type="number"
                                        className="w-full max-w-xs rounded-xl border-border-light bg-neutral-light/50 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm p-3 font-semibold transition-all"
                                        value={formData.profitCapMultiplier}
                                        onChange={(e) => setFormData({ ...formData, profitCapMultiplier: parseInt(e.target.value) })}
                                    />
                                    <p className="text-[10px] text-gray-400 font-medium px-1 italic mt-1">Example: 5 means total earnings are capped at 5x the investment.</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-12 py-4 rounded-xl bg-forest-green hover:bg-forest-green/90 text-warm-gold text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50"
                                >
                                    {saving ? 'Processing...' : 'Save Configuration'}
                                </button>
                            </div>
                        </div>
                    </div>

                </form>
            )}

            {!scopeId && scope !== 'global' && (
                <div className="p-20 text-center bg-white rounded-2xl border border-dashed border-border-light animate-in zoom-in-95 duration-500">
                    <span className="material-symbols-outlined text-6xl text-gray-200 mb-4 block">fact_check</span>
                    <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest">Select a {scope} to start configuring</h3>
                    <p className="text-gray-400 text-sm font-medium mt-1 italic">Overrides take precedence over global settings.</p>
                </div>
            )}
        </div>
    );
};

export default ManagePlans;
