import { Bot, TrendingUp, MessageSquareQuote, Loader } from 'lucide-react';
import Card from './Card.jsx';
import Button from './Button.jsx';

export default function BudgetOverview({
  status,
  isOverBudget,
  isEditingBudget,
  newBudgetInput,
  onBudgetInputChange,
  onUpdateBudget,
  onEditBudget,
  onGenerateRoast,
  aiRoast,
  isRoasting,
  remainingBudget,
  progressPercent,
  totalSpent,
  budget
}) {
  return (
    <Card
      className="md:col-span-7 relative overflow-hidden flex flex-col justify-between"
      color={isOverBudget ? 'bg-pink-200' : 'bg-yellow-200'}
    >
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <h2 className="text-2xl font-black uppercase">本月预算剩余</h2>
          <div className="flex items-center gap-2 mt-1 font-bold text-slate-700">
            {status.icon} <span>{status.text}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onGenerateRoast}
            className="bg-black text-white p-2 rounded hover:scale-110 transition-transform flex items-center gap-1"
            title="让AI点评你的财务状况"
          >
            <Bot size={20} />
            <span className="text-xs font-bold hidden sm:inline">AI点评</span>
          </button>
          <button
            onClick={onEditBudget}
            className="bg-white border-2 border-black text-black p-2 rounded hover:bg-slate-100 transition-colors"
          >
            <TrendingUp size={20} />
          </button>
        </div>
      </div>

      {(aiRoast || isRoasting) && (
        <div className="mb-4 relative z-20 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-3 items-start">
            <div className="bg-purple-500 text-white p-2 rounded border-2 border-black shrink-0">
              {isRoasting ? <Loader className="animate-spin" size={20} /> : <MessageSquareQuote size={20} />}
            </div>
            <div className="font-bold text-sm md:text-base">{isRoasting ? '正在翻看你的烂账...' : aiRoast}</div>
          </div>
        </div>
      )}

      {isEditingBudget ? (
        <div className="flex gap-2 mb-4 relative z-10">
          <input
            type="number"
            value={newBudgetInput}
            onChange={onBudgetInputChange}
            className="w-full border-4 border-black p-2 rounded font-bold text-xl"
          />
          <Button onClick={onUpdateBudget} className="py-2 px-3" variant="black">
            OK
          </Button>
        </div>
      ) : (
        <div className="flex items-baseline gap-2 mb-4 relative z-10">
          <span className={`text-6xl font-black tracking-tight ${remainingBudget < 0 ? 'text-red-600' : 'text-black'}`}>
            ¥{remainingBudget.toFixed(0)}
          </span>
          <span className="text-xl font-bold text-slate-600">/ 可支配</span>
        </div>
      )}

      <div className="w-full h-10 border-4 border-black bg-white rounded-full relative overflow-hidden mb-2">
        <div
          className={`h-full border-r-4 border-black transition-all duration-500 ease-out ${
            isOverBudget ? 'bg-red-500 pattern-diagonal-lines' : 'bg-cyan-400'
          }`}
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="flex justify-between font-bold text-sm relative z-10">
        <span>已支出: ¥{totalSpent}</span>
        <span>预算目标: ¥{budget}</span>
      </div>
    </Card>
  );
}
