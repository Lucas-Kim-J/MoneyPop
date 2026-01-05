import { Trash2 } from 'lucide-react';

export default function TransactionList({
  transactions,
  expenseCategories,
  incomeCategories,
  onDelete,
  showAuthWarning
}) {
  const incomeCount = transactions.filter(t => t.type === 'income').length;
  const expenseCount = transactions.filter(t => t.type === 'expense').length;

  return (
    <div className="lg:col-span-7">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-2xl font-black bg-white inline-block px-1 border-2 border-black rotate-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          近期流水
        </h3>
        <div className="flex gap-2">
          <span className="font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm border-2 border-green-200">
            收 {incomeCount}
          </span>
          <span className="font-bold bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm border-2 border-red-200">
            支 {expenseCount}
          </span>
        </div>
      </div>

      {showAuthWarning && (
        <div className="mb-4 border-2 border-dashed border-yellow-400 bg-yellow-100 text-yellow-900 px-3 py-2 rounded-lg text-sm font-bold">
          未登录可能导致数据丢失，建议登录以同步到云端。
        </div>
      )}

      <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
        {transactions.length === 0 ? (
          <div className="text-center py-20 opacity-50 border-4 border-dashed border-slate-400 rounded-xl bg-slate-50">
            <div className="text-6xl mb-4">💤</div>
            <p className="font-bold text-xl">暂无记录，开始记账吧！</p>
          </div>
        ) : (
          transactions.map(tx => {
            const isExp = tx.type === 'expense';
            const cats = isExp ? expenseCategories : incomeCategories;
            const cat = cats.find(c => c.id === tx.category) || cats[0];

            return (
              <div key={tx.id} className="group relative">
                <div
                  className={`relative z-10 bg-white border-4 border-black rounded-xl p-4 flex items-center justify-between transition-transform hover:-translate-y-1 hover:translate-x-1 border-b-8 ${
                    tx.isImpulse ? 'border-r-8 border-pink-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${cat.color}`}
                    >
                      {cat.icon}
                    </div>
                    <div>
                      <div className="font-bold text-lg flex items-center gap-2">
                        {tx.description}
                        {tx.isImpulse && (
                          <span className="text-xs bg-pink-500 text-white px-1 border border-black rounded">后悔</span>
                        )}
                        {!isExp && (
                          <span className="text-xs bg-green-100 text-green-700 px-1 border border-green-300 rounded">收入</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-400">
                        {new Date(tx.date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`font-black text-xl ${isExp ? 'text-black' : 'text-green-600'}`}>
                      {isExp ? '-' : '+'}¥{tx.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => onDelete(tx.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-500 hover:text-white p-2 rounded border-2 border-transparent hover:border-black"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className={`absolute inset-0 rounded-xl translate-x-1 translate-y-1 z-0 ${isExp ? 'bg-black' : 'bg-green-800'}`}></div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
