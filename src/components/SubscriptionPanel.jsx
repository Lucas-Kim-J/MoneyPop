import { Trash2, CalendarClock } from 'lucide-react';
import Card from './Card.jsx';
import Button from './Button.jsx';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
}

function daysUntil(dateStr) {
  const today = new Date();
  const target = new Date(dateStr);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = target - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function SubscriptionPanel({
  subscriptions,
  pendingItems,
  formName,
  formAmount,
  formCategory,
  formDate,
  categories,
  onNameChange,
  onAmountChange,
  onCategoryChange,
  onDateChange,
  onAdd,
  onDelete,
  onConfirmPending,
  onSkipPending
}) {
  const monthlyTotal = subscriptions.reduce((acc, sub) => acc + sub.amount, 0);

  return (
    <Card color="bg-white" className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black uppercase flex items-center gap-2 bg-white border-2 border-black px-2 py-1 rotate-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <CalendarClock className="text-black" strokeWidth={3} />
          订阅管理
        </h2>
        <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded">固定支出</span>
      </div>

      <div className="text-sm font-bold text-slate-700">本月订阅总额：¥{monthlyTotal.toFixed(0)}</div>
      <div className="text-xs font-bold text-slate-500 mt-1">每 30 天自动提醒，需确认后入账</div>

      {pendingItems.length > 0 && (
        <div className="mt-4 border-4 border-black rounded-lg p-3 bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-xs font-black text-slate-700 mb-2">待确认订阅</div>
          <div className="space-y-2">
            {pendingItems.map(item => (
              <div key={item.id} className="bg-white border-2 border-black rounded p-2 flex items-center justify-between">
                <div>
                  <div className="font-black text-sm">{item.name}</div>
                  <div className="text-xs text-slate-600">
                    ¥{item.amount.toFixed(2)} · 到期 {formatDate(item.dueAt)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onConfirmPending(item.id)}
                    className="text-xs font-black bg-black text-white px-2 py-1 rounded border-2 border-black"
                  >
                    确认
                  </button>
                  <button
                    type="button"
                    onClick={() => onSkipPending(item.id)}
                    className="text-xs font-black bg-white text-black px-2 py-1 rounded border-2 border-black"
                  >
                    跳过
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 border-t-2 border-dashed border-slate-300 pt-4">
        <div className="text-xs font-black text-slate-500 mb-2">订阅清单</div>
        {subscriptions.length === 0 ? (
          <div className="text-sm text-slate-500">暂无订阅，添加一个试试。</div>
        ) : (
          <div className="space-y-2">
            {subscriptions.map(sub => {
              const daysLeft = daysUntil(sub.nextDueAt);
              return (
                <div key={sub.id} className="bg-slate-50 border-2 border-black rounded p-2 flex items-center justify-between">
                  <div>
                    <div className="font-black text-sm">{sub.name}</div>
                    <div className="text-xs text-slate-600">
                      ¥{sub.amount.toFixed(2)} · 下次 {formatDate(sub.nextDueAt)} · {daysLeft}天后
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(sub.id)}
                    className="bg-white border-2 border-black p-1 rounded hover:bg-red-100"
                    title="删除订阅"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <form onSubmit={onAdd} className="mt-4 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            value={formName}
            onChange={onNameChange}
            className="w-full border-4 border-black rounded-lg p-2 font-bold"
            placeholder="订阅名称"
            required
          />
          <input
            type="number"
            step="0.01"
            value={formAmount}
            onChange={onAmountChange}
            className="w-full border-4 border-black rounded-lg p-2 font-bold"
            placeholder="金额"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select
            value={formCategory}
            onChange={onCategoryChange}
            className="w-full border-4 border-black rounded-lg p-2 font-bold bg-white"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={formDate}
            onChange={onDateChange}
            className="w-full border-4 border-black rounded-lg p-2 font-bold"
          />
        </div>
        <Button type="submit" className="w-full" variant="neutral">
          + 新增订阅
        </Button>
      </form>
    </Card>
  );
}
