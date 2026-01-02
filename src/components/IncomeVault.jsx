import { Banknote } from 'lucide-react';
import Card from './Card.jsx';

export default function IncomeVault({ totalIncome, netBalance }) {
  return (
    <Card color="bg-green-400" className="flex-1 flex flex-col justify-center">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-black uppercase flex items-center gap-2">
          <Banknote className="text-white" strokeWidth={3} />
          小金库
        </h2>
        <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded">净资产</span>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs font-bold opacity-80">总收入</p>
          <p className="text-2xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">+¥{totalIncome}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold opacity-80">结余</p>
          <p className="text-3xl font-black">¥{netBalance.toFixed(0)}</p>
        </div>
      </div>
    </Card>
  );
}
