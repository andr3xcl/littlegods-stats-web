import React, { useRef, useEffect } from 'react';
import type { Transaction, EconomyData } from '../types';
import { useGSAP } from '../utils/gsap';
import { Wallet, TrendingUp, TrendingDown, History } from 'lucide-react';

interface EconomyProps {
  economyData: EconomyData;
}

const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const gsap = useGSAP();

  const handleRowHover = React.useCallback((element: HTMLElement, isHover: boolean) => {
    const backgroundColor = isHover ? 'rgba(30, 41, 59, 0.5)' : 'transparent';
    gsap.to(element, { backgroundColor, duration: 0.2, ease: "power2.out" });
  }, [gsap]);

  const isDeposit = transaction.amount > 0;
  return (
    <tr
      className="border-b border-slate-200/50 dark:border-slate-700/50 last:border-0 transition-colors"
      onMouseEnter={(e) => handleRowHover(e.currentTarget, true)}
      onMouseLeave={(e) => handleRowHover(e.currentTarget, false)}
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDeposit ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {isDeposit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
          <span className="text-slate-700 dark:text-slate-300 font-medium">{transaction.description}</span>
        </div>
      </td>
      <td className={`p-4 text-right font-mono font-bold ${isDeposit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isDeposit ? '+' : ''}{transaction.amount.toLocaleString()}
      </td>
      <td className="p-4 text-right text-slate-500 text-sm">{transaction.date}</td>
    </tr>
  );
}

const Economy: React.FC<EconomyProps> = ({ economyData }) => {
  const gsap = useGSAP();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [gsap]);

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-500/10 rounded-2xl">
          <Wallet className="w-8 h-8 text-indigo-500" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Economía</h2>
          <p className="text-slate-500 dark:text-slate-400">Gestiona tus puntos y transacciones</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 mb-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>

        <div className="relative z-10 text-center">
          <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-2">Saldo Actual</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter">
              {economyData.balance.toLocaleString()}
            </span>
            <span className="text-2xl text-slate-400 font-bold self-end mb-4">CP</span>
          </div>
          <p className="text-slate-400 mt-4 text-sm">Puntos CoD disponibles para gastar</p>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Historial de Transacciones</h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
            {economyData.transactions.length} movimientos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Descripción</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-right">Cantidad</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-right">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {economyData.transactions.map(tx => <TransactionRow key={tx.id} transaction={tx} />)}
              {economyData.transactions.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500">
                    No hay transacciones recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Economy;