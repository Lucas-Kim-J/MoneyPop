import { ArrowUpCircle, ArrowDownCircle, ArrowRightCircle } from 'lucide-react';

export default function HeaderSnapshot({ snapshot, dayDelta, weekDelta }) {
  const weekTrend =
    weekDelta > 0
      ? { icon: ArrowUpCircle, color: 'text-red-600', label: '上升' }
      : weekDelta < 0
        ? { icon: ArrowDownCircle, color: 'text-green-600', label: '下降' }
        : { icon: ArrowRightCircle, color: 'text-slate-500', label: '持平' };

  const TrendIcon = weekTrend.icon;

  return (
    <div className="bg-white border-4 border-black px-4 py-2 rounded-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">账户快照</div>
      <div className="text-sm font-black">
        今天 vs 昨天：¥{snapshot.todayExpense.toFixed(0)} / ¥{snapshot.yesterdayExpense.toFixed(0)}
      </div>
      <div className={`mt-1 text-xs font-bold ${dayDelta > 0 ? 'text-red-600' : dayDelta < 0 ? 'text-green-600' : 'text-slate-500'}`}>
        今日较昨 {dayDelta > 0 ? '+' : dayDelta < 0 ? '-' : ''}¥{Math.abs(dayDelta).toFixed(0)}
      </div>
      <div className={`mt-1 text-xs font-bold flex items-center gap-1 ${weekTrend.color}`}>
        <TrendIcon size={16} />
        本周趋势：{weekTrend.label}
        {weekDelta === 0 ? '' : ` ${weekDelta > 0 ? '+' : '-'}¥${Math.abs(weekDelta).toFixed(0)}`}
      </div>
    </div>
  );
}
