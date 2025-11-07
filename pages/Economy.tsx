import React from 'react';
import type { Transaction, EconomyData } from '../types';

interface EconomyProps {
  economyData: EconomyData;
}

const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const isDeposit = transaction.amount > 0;
  return (
    <tr className="border-b border-slate-700 hover:bg-slate-800">
      <td className="p-4 text-slate-300">{transaction.description}</td>
      <td className={`p-4 text-right font-mono ${isDeposit ? 'text-green-400' : 'text-red-500'}`}>
        {isDeposit ? '+' : ''}{transaction.amount.toLocaleString()}
      </td>
      <td className="p-4 text-right text-slate-500 text-sm">{transaction.date}</td>
    </tr>
  );
}

const Economy: React.FC<EconomyProps> = ({ economyData }) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-100 mb-6 border-b-2 border-slate-700 pb-2">Economía - Banco</h2>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8 text-center">
        <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Saldo Actual</p>
        <p className="text-6xl font-black text-slate-100 tracking-tighter my-2">
          {economyData.balance.toLocaleString()}
        </p>
        <p className="text-slate-400">Puntos CoD</p>
      </div>

      <h3 className="text-2xl font-bold text-slate-100 mb-4">Historial de Transacciones</h3>
      <div className="overflow-hidden rounded-lg border border-slate-700">
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