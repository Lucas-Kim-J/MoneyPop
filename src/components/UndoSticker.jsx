export default function UndoSticker({ show, undoTx, onUndo }) {
  if (!show || !undoTx) return null;

  return (
    <button
      type="button"
      onClick={onUndo}
      className="fixed right-6 bottom-6 z-50 bg-yellow-200 border-4 border-black rounded-xl px-4 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:translate-x-1 transition-transform text-left"
      title="点击撤销这笔记账"
    >
      <div className="text-xs font-black uppercase text-slate-700">账单贴纸</div>
      <div className="text-sm font-black">
        {undoTx.type === 'expense' ? '-' : '+'}¥{undoTx.amount.toFixed(2)} {undoTx.description}
      </div>
      <div className="text-xs font-bold text-slate-600">点击撤销</div>
    </button>
  );
}
