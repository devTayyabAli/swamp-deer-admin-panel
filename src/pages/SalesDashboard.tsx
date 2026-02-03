import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchSales } from '../store/slices/salesSlice';

const SalesDashboard = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items: sales, isLoading } = useSelector((state: RootState) => state.sales);

    useEffect(() => {
        dispatch(fetchSales({}));
    }, [dispatch]);

    // Filtered sales for display and stats
    const activeSales = (sales || []).filter(s => s.status !== 'rejected');

    // Derived stats
    const totalAmount = activeSales.reduce((acc, curr) => acc + curr.amount, 0);
    const totalCommission = activeSales.reduce((acc, curr) => acc + curr.commission, 0);
    const stats = { totalAmount, totalCommission };

    if (isLoading && sales.length === 0) {
        return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Branch Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Welcome back. Here's your sales overview.</p>
                </div>
                <button onClick={() => window.location.href = '/log-sale'} className="w-full sm:w-auto bg-deep-green text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-forest-green transition-all shadow-lg shadow-deep-green/10">
                    <span className="material-symbols-outlined">add_circle</span>
                    Log New Sale
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500 font-medium">Total Sales Amount</span>
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <span className="material-symbols-outlined text-deep-green">trending_up</span>
                        </div>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-bold text-warm-gold">Rs {stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                    <p className="text-sm text-emerald-600 mt-2 font-medium">Lifetime total</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500 font-medium">Total Commission Earned</span>
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <span className="material-symbols-outlined text-warm-gold">payments</span>
                        </div>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-bold text-warm-gold">Rs {stats.totalCommission.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                    <p className="text-sm text-emerald-600 mt-2 font-medium">Lifetime total</p>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-border-light flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">My Recent Sales</h2>
                    <a className="text-deep-green text-sm font-bold hover:underline" href="#">View All</a>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-light border-b border-border-light">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Commission</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                            {activeSales.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No sales found. Start by logging a new sale!</td>
                                </tr>
                            ) : (
                                activeSales.map((sale) => (
                                    <tr key={sale._id} className="hover:bg-neutral-light transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            {new Date(sale.date || sale.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-xs">
                                                    {sale.customerName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-gray-900">{sale.customerName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{sale.description}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">Rs {sale.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-warm-gold text-right">Rs {sale.commission.toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
