import { AlertTriangle } from 'lucide-react';
import Card from './Card.jsx';

export default function RegretCard({ impulseTotal }) {
  return (
    <Card color="bg-pink-400 text-white" className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-black uppercase flex items-center gap-2">
          <AlertTriangle className="text-yellow-300" strokeWidth={3} />
          后悔药
        </h2>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black drop-shadow-[3px_3px_0px_rgba(0,0,0,0.5)]">¥{impulseTotal}</span>
        <span className="text-xs font-bold bg-black/20 px-2 py-1 rounded">冲动金额</span>
      </div>
    </Card>
  );
}
