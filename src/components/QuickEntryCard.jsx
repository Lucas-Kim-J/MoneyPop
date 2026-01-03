import { Plus, Receipt } from 'lucide-react';
import Card from './Card.jsx';
import Button from './Button.jsx';

export default function QuickEntryCard({ onOpenForm }) {
  return (
    <Card color="bg-pink-400" className="flex-1 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute -bottom-4 -right-2 opacity-10 pointer-events-none">
        <Receipt size={120} className="text-black rotate-12" />
      </div>
      <div className="flex items-center justify-between mb-3 relative z-10">
        <h2 className="text-xl font-black uppercase flex items-center gap-2 bg-white border-2 border-black px-2 py-1 -rotate-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Receipt className="text-black" strokeWidth={3} />
          记一笔
        </h2>
        <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded">快捷入口</span>
      </div>
      <p className="text-sm font-bold text-slate-600 mb-4 relative z-10">弹出记账窗口，支持 AI 智能填单。</p>
      <div className="relative z-10">
        <Button onClick={onOpenForm} className="w-full py-4 text-lg" variant="black">
          <Plus size={18} /> 记一笔
        </Button>
      </div>
    </Card>
  );
}
