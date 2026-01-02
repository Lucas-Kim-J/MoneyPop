import { AlertTriangle } from 'lucide-react';
import Card from './Card.jsx';

export default function RegretCard({ impulseTotal }) {
  return (
    <Card color="bg-pink-400 text-white" className="flex-1 relative overflow-hidden">
      <div className="absolute -bottom-4 -left-4 opacity-10 pointer-events-none">
        <AlertTriangle size={120} className="text-black -rotate-12" />
      </div>
      <div className="flex justify-between items-center mb-1 relative z-10">
        <h2 className="text-xl font-black uppercase flex items-center gap-2 bg-white text-black border-2 border-black px-2 py-1 -rotate-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <AlertTriangle className="text-yellow-500" strokeWidth={3} />
          后悔药
        </h2>
      </div>
      <div className="flex items-baseline gap-2 relative z-10">
        <span className="text-4xl font-black drop-shadow-[3px_3px_0px_rgba(0,0,0,0.5)]">¥{impulseTotal}</span>
        <span className="text-xs font-bold bg-black/20 px-2 py-1 rounded">冲动金额</span>
      </div>
    </Card>
  );
}
