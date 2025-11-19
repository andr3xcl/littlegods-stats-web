import React, { useRef, useEffect } from 'react';
import type { Transaction, EconomyData } from '../types';
import { useGSAP } from '../utils/gsap';

interface EconomyProps {
  economyData: EconomyData;
}

const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  // GSAP hooks
  const gsap = useGSAP();

  const handleRowHover = React.useCallback((element: HTMLElement, isHover: boolean) => {
    const backgroundColor = isHover ? 'rgba(30, 41, 59, 1)' : 'transparent';
    gsap.to(element, { backgroundColor, duration: 0.2, ease: "power2.out" });
  }, [gsap]);

  const isDeposit = transaction.amount > 0;
  return (
    <tr
      className="border-b border-slate-700"
      onMouseEnter={(e) => handleRowHover(e.currentTarget, true)}
      onMouseLeave={(e) => handleRowHover(e.currentTarget, false)}
    >
      <td className="p-4 text-slate-300">{transaction.description}</td>
      <td className={`p-4 text-right font-mono ${isDeposit ? 'text-green-400' : 'text-red-500'}`}>
        {isDeposit ? '+' : ''}{transaction.amount.toLocaleString()}
      </td>
      <td className="p-4 text-right text-slate-500 text-sm">{transaction.date}</td>
    </tr>
  );
}

const Economy: React.FC<EconomyProps> = ({ economyData }) => {
  // GSAP hooks y referencias
  const gsap = useGSAP();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const balanceRef = useRef<HTMLDivElement>(null);
  const tableTitleRef = useRef<HTMLHeadingElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Animaciones de scroll
  useEffect(() => {
    if (titleRef.current) {
      gsap.animateFadeInOnScroll(titleRef.current, 0, "top 90%");
    }
    if (balanceRef.current) {
      gsap.animateScaleInOnScroll(balanceRef.current, 0.2);
    }
    if (tableTitleRef.current) {
      gsap.animateSlideInLeft(tableTitleRef.current, 0.4);
    }
    if (tableRef.current) {
      gsap.animateFadeInOnScroll(tableRef.current, 0.6);
    }
  }, [gsap]);

  return (
    <div>
      <h2 ref={titleRef} className="text-3xl font-bold text-slate-100 mb-6 border-b-2 border-slate-700 pb-2">Economía - Banco</h2>
      <div ref={balanceRef} className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8 text-center">
        <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Saldo Actual</p>
        <p className="text-6xl font-black text-slate-100 tracking-tighter my-2">
          {economyData.balance.toLocaleString()}
        </p>
        <p className="text-slate-400">Puntos CoD</p>
      </div>

      <h3 ref={tableTitleRef} className="text-2xl font-bold text-slate-100 mb-4">Historial de Transacciones</h3>
      <div ref={tableRef} className="overflow-hidden rounded-lg border border-slate-700">
        <table className="w-full text-left">
          <thead className="bg-slate-900/70">
            <tr>
              <th className="p-4 text-sm font-bold uppercase text-slate-400 tracking-wider">Descripción</th>
              <th className="p-4 text-sm font-bold uppercase text-slate-400 tracking-wider text-right">Cantidad</th>
              <th className="p-4 text-sm font-bold uppercase text-slate-400 tracking-wider text-right">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {economyData.transactions.map(tx => <TransactionRow key={tx.id} transaction={tx} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Economy;