import { ArrowDownCircle, ArrowUpCircle, Sparkles, Bot, Wallet } from 'lucide-react';
import Card from './Card.jsx';
import Button from './Button.jsx';

export default function TransactionForm({
  type,
  setType,
  amount,
  setAmount,
  description,
  setDescription,
  category,
  setCategory,
  isImpulse,
  setIsImpulse,
  showSmartInput,
  setShowSmartInput,
  smartInputText,
  setSmartInputText,
  isAiProcessing,
  onSmartEntry,
  onSubmit,
  currentCategories
}) {
  return (
    <Card className="sticky top-24 transition-colors duration-300" color={type === 'expense' ? 'bg-white' : 'bg-green-50'}>
      <div className="flex items-center justify-between mb-6 gap-2">
        <div className="flex gap-2 flex-1">
          <button
            onClick={() => {
              setType('expense');
              setShowSmartInput(false);
            }}
            className={`flex-1 py-2 font-black text-sm md:text-base border-4 rounded-lg flex items-center justify-center gap-1 transition-all ${
              type === 'expense' && !showSmartInput
                ? 'bg-yellow-400 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1'
                : 'bg-white border-slate-300 text-slate-400 hover:border-slate-400'
            }`}
          >
            <ArrowDownCircle size={16} /> 支出
          </button>
          <button
            onClick={() => {
              setType('income');
              setShowSmartInput(false);
            }}
            className={`flex-1 py-2 font-black text-sm md:text-base border-4 rounded-lg flex items-center justify-center gap-1 transition-all ${
              type === 'income' && !showSmartInput
                ? 'bg-green-400 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1'
                : 'bg-white border-slate-300 text-slate-400 hover:border-slate-400'
            }`}
          >
            <ArrowUpCircle size={16} /> 收入
          </button>
        </div>
        <button
          onClick={() => setShowSmartInput(!showSmartInput)}
          className={`p-2 border-4 rounded-lg transition-all ${
            showSmartInput
              ? 'bg-purple-500 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1'
              : 'bg-white border-slate-300 text-purple-400 hover:border-purple-400'
          }`}
          title="AI 智能填单"
        >
          <Sparkles size={24} />
        </button>
      </div>

      {showSmartInput ? (
        <div className="space-y-4 animate-in fade-in zoom-in-95">
          <div className="bg-purple-100 border-4 border-purple-300 rounded-lg p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold text-purple-800 text-sm mb-2 flex items-center gap-2">
              <Bot size={16} /> AI 智能助手
            </p>
            <textarea
              value={smartInputText}
              onChange={e => setSmartInputText(e.target.value)}
              className="w-full bg-white border-2 border-purple-200 rounded p-2 font-bold focus:outline-none focus:border-purple-500 h-32 resize-none"
              placeholder="试试输入：&#10;“刚才打车花了35块”&#10;“发奖金5000元”&#10;“超市买零食128.5”"
            />
          </div>
          <Button onClick={onSmartEntry} variant="magic" className="w-full" disabled={isAiProcessing}>
            {isAiProcessing ? 'AI 正在分析...' : '✨ 一键识别'}
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 animate-in fade-in zoom-in-95">
          <div>
            <label className="block font-bold mb-1">{type === 'expense' ? '消费金额' : '入账金额'}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xl">¥</span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full border-4 border-black rounded-lg py-3 pl-8 pr-4 text-2xl font-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">描述</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border-4 border-black rounded-lg p-3 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
              placeholder={type === 'expense' ? '买了什么？' : '哪里来的钱？'}
            />
          </div>

          <div>
            <label className="block font-bold mb-2">分类</label>
            <div className="grid grid-cols-3 gap-2">
              {currentCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`border-4 rounded-lg p-2 flex flex-col items-center justify-center gap-1 transition-all ${
                    category === cat.id
                      ? `border-black ${cat.color} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]`
                      : 'border-slate-200 text-slate-400 hover:border-slate-400 bg-white'
                  }`}
                >
                  {cat.icon}
                  <span className="text-xs font-bold">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {type === 'expense' && (
            <div className="flex items-center gap-3 bg-red-50 p-3 rounded border-2 border-red-100 shadow-[2px_2px_0px_0px_rgba(254,202,202,1)]">
              <input
                type="checkbox"
                id="impulse"
                checked={isImpulse}
                onChange={e => setIsImpulse(e.target.checked)}
                className="w-6 h-6 border-4 border-black accent-pink-500 cursor-pointer"
              />
              <label htmlFor="impulse" className="font-bold text-red-500 cursor-pointer select-none">
                这是冲动消费 (加入后悔清单)
              </label>
            </div>
          )}

          <Button type="submit" className="w-full py-4 text-xl mt-4" variant={type === 'expense' ? 'primary' : 'success'}>
            {type === 'expense' ? '确认支出' : '确认入账'} <Wallet size={24} />
          </Button>
        </form>
      )}
    </Card>
  );
}
