import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, IndianRupee, Plus, Receipt } from 'lucide-react';
import { useAdminData } from './AdminDataContext';

export function AdminSales() {
  const { sales, addSale, addToast } = useAdminData();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    addSale({
      amount: Number(amount),
      description: description || 'Direct Sale',
      date: Date.now()
    });
    setAmount('');
    setDescription('');
    addToast('Sale recorded successfully!', 'success');
  };

  // Analytics Calculations
  const totalRevenue = useMemo(() => sales.reduce((acc, sale) => acc + sale.amount, 0), [sales]);
  const todayRevenue = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return sales.filter(s => new Date(s.date).setHours(0, 0, 0, 0) === today).reduce((acc, sale) => acc + sale.amount, 0);
  }, [sales]);
  const thisMonthRevenue = useMemo(() => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    return sales.filter(s => s.date >= startOfMonth).reduce((acc, sale) => acc + sale.amount, 0);
  }, [sales]);

  // Chart Data (Last 7 days)
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.setHours(0,0,0,0)).getTime();
      const end = new Date(d.setHours(23,59,59,999)).getTime();
      const dayTotal = sales.filter(s => s.date >= start && s.date <= end).reduce((sum, s) => sum + s.amount, 0);
      days.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), total: dayTotal });
    }
    const max = Math.max(...days.map(d => d.total), 1);
    return days.map(d => ({ ...d, height: (d.total / max) * 100 }));
  }, [sales]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl pb-10">
      <div>
        <h1 className="text-3xl font-serif text-royal-purple dark:text-gold-light mb-2">Monitor Sales</h1>
        <p className="text-gray-500 dark:text-gray-400 font-sans text-sm">Track your revenue, enter new sales, and view analytics.</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-divine-gold/20 flex items-center justify-center text-royal-purple dark:text-divine-gold">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Total Revenue</p>
            <p className="text-2xl font-serif text-gray-900 dark:text-white mt-1">₹ {totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">This Month</p>
            <p className="text-2xl font-serif text-gray-900 dark:text-white mt-1">₹ {thisMonthRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Receipt size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Today's Sales</p>
            <p className="text-2xl font-serif text-gray-900 dark:text-white mt-1">₹ {todayRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-royal-purple dark:text-gold-light" size={20} />
            <h2 className="font-serif text-xl text-gray-900 dark:text-white">Last 7 Days</h2>
          </div>
          <div className="flex-1 flex items-end gap-2 sm:gap-4 h-64 mt-auto">
            {chartData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative flex-1 flex items-end justify-center rounded-t-sm">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${day.height}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, type: 'spring' }}
                    className="w-full bg-gradient-to-t from-royal-purple to-deep-purple dark:from-divine-gold dark:to-gold-light rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      ₹{day.total.toLocaleString('en-IN')}
                    </div>
                  </motion.div>
                </div>
                <span className="text-xs font-sans text-gray-500 dark:text-gray-400 uppercase mt-2">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Add Form */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Plus className="text-royal-purple dark:text-gold-light" size={20} />
            <h2 className="font-serif text-xl text-gray-900 dark:text-white">Record Sale</h2>
          </div>
          <form onSubmit={handleAddSale} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Amount (₹)</label>
              <input 
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:border-royal-purple dark:focus:border-divine-gold focus:ring-1 focus:ring-royal-purple dark:focus:ring-divine-gold outline-none font-sans text-lg text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Description</label>
              <input 
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. 5 boxes of Marble"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:border-royal-purple dark:focus:border-divine-gold focus:ring-1 focus:ring-royal-purple dark:focus:ring-divine-gold outline-none font-sans text-gray-900 dark:text-white"
              />
            </div>
            <button 
              type="submit"
              className="w-full mt-2 bg-royal-purple dark:bg-divine-gold dark:text-royal-purple text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> Add Sale
            </button>
          </form>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden mt-6">
        <div className="p-6 border-b border-gray-100 dark:border-white/10">
          <h2 className="font-serif text-xl text-gray-900 dark:text-white">Recent Sales Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Date</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Description</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Logged By</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {sales.slice(0, 10).map(sale => (
                <tr key={sale.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {new Date(sale.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{sale.description}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 dark:bg-white/10 text-xs">
                      {sale.loggedBy}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold text-right">
                    ₹ {sale.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No sales recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
