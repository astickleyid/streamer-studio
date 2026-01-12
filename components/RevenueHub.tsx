import React, { useState } from 'react';
import { DollarSign, Wallet, Download, ExternalLink, History, PieChart } from 'lucide-react';

const RevenueHub: React.FC = () => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  const transactions = [
    { type: 'Sub Revenue', amount: '+$420.00', date: 'Oct 24, 2024', status: 'Cleared' },
    { type: 'Bit Payout', amount: '+$85.50', date: 'Oct 22, 2024', status: 'Pending' },
    { type: 'Sponsorship', amount: '+$2,100.00', date: 'Oct 20, 2024', status: 'Cleared' },
  ];

  const handleWithdraw = () => {
    setIsWithdrawing(true);
    setTimeout(() => setIsWithdrawing(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="text-yellow-400" size={16} />
            <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.4em]">FinOps Dashboard</span>
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Revenue Hub</h2>
        </div>
        <button 
          onClick={handleWithdraw}
          disabled={isWithdrawing}
          className="px-8 py-4 bg-yellow-400 text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-4xl shadow-yellow-400/20"
        >
          {isWithdrawing ? 'PROCESSING...' : 'WITHDRAW FUNDS'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-[3.5rem] p-12 shadow-3xl space-y-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5">
              <Wallet size={120} className="text-white" />
           </div>
           <div>
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block mb-2">Available Balance</span>
              <h3 className="text-7xl font-black italic tracking-tighter text-white">$4,822.45</h3>
           </div>
           
           <div className="grid grid-cols-2 gap-8 pt-10 border-t border-zinc-800">
              <div>
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Lifetime Earnings</span>
                <span className="text-2xl font-black text-indigo-400">$12,450.00</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Active Subs</span>
                <span className="text-2xl font-black text-yellow-400">842</span>
              </div>
           </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[3.5rem] p-10 flex flex-col justify-between shadow-3xl">
           <div className="space-y-6">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <PieChart size={14}/> Revenue Split
              </h4>
              <div className="space-y-4">
                 {[
                   { label: 'Platform Fee', val: '5%', color: 'bg-zinc-800' },
                   { label: 'Tax Holdback', val: '20%', color: 'bg-indigo-600' },
                   { label: 'Creator Cut', val: '75%', color: 'bg-yellow-400' }
                 ].map((s, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400">
                        <span>{s.label}</span>
                        <span>{s.val}</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                        <div className={`h-full ${s.color}`} style={{ width: s.val }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <div className="pt-8 text-center">
             <p className="text-[9px] text-zinc-600 font-bold uppercase mb-4">Direct Payout to Stripe Connect</p>
             <button className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 justify-center mx-auto">
               <ExternalLink size={12}/> Edit Payout Settings
             </button>
           </div>
        </div>
      </div>

      <div className="space-y-6">
         <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
           <History size={14}/> Transaction Ledger
         </h4>
         <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            {transactions.map((t, i) => (
              <div key={i} className="px-10 py-6 border-b border-zinc-800 last:border-0 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600/10 rounded-xl text-indigo-400"><Download size={16}/></div>
                    <div>
                       <p className="text-sm font-black text-white uppercase italic">{t.type}</p>
                       <p className="text-[10px] text-zinc-600 font-bold uppercase">{t.date}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-black text-green-500">{t.amount}</p>
                    <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">{t.status}</p>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default RevenueHub;