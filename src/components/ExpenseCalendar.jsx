import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from './Card.jsx';
import { formatDateKey } from '../utils/date.js';

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

function buildMonthCells(year, month) {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - startDay + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }
    return new Date(year, month, dayNumber);
  });
}

function formatAmountShort(amount) {
  return amount.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}

export default function ExpenseCalendar({ expensesByDate, selectedDate, onSelectDate }) {
  const [displayDate, setDisplayDate] = useState(() => new Date());
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const monthLabel = displayDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
  const todayKey = formatDateKey(new Date());

  const monthCells = useMemo(() => buildMonthCells(year, month), [year, month]);

  const monthStats = useMemo(() => {
    const totals = {};
    let max = 0;
    let total = 0;

    monthCells.forEach(date => {
      if (!date) return;
      const key = formatDateKey(date);
      const dayTotal = expensesByDate.get(key)?.total || 0;
      totals[key] = dayTotal;
      total += dayTotal;
      if (dayTotal > max) {
        max = dayTotal;
      }
    });

    return { totals, max, total };
  }, [monthCells, expensesByDate]);

  const handlePrevMonth = () => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleJumpToday = () => {
    setDisplayDate(new Date());
  };

  return (
    <Card className="relative overflow-hidden" color="bg-white">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-2xl font-black uppercase bg-white inline-flex items-center gap-2 px-2 border-2 border-black -rotate-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <CalendarDays size={20} />
              开销日历
            </h3>
            <p className="text-sm font-bold text-slate-600 mt-2">
              颜色越深，支出越高。 本月合计 ¥{formatAmountShort(monthStats.total)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="bg-white border-2 border-black p-2 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
              aria-label="上一月"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="bg-yellow-200 border-2 border-black px-3 py-1 rounded font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {monthLabel}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="bg-white border-2 border-black p-2 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
              aria-label="下一月"
            >
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={handleJumpToday}
              className="bg-black text-white border-2 border-black px-3 py-1 rounded font-bold text-xs shadow-[2px_2px_0px_0px_rgba(128,128,128,1)] hover:-translate-y-0.5 transition-transform"
            >
              今天
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-xs font-bold text-slate-500">
          {WEEK_DAYS.map(day => (
            <div key={day} className="text-center">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {monthCells.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="h-20 sm:h-24 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50"
                />
              );
            }

            const key = formatDateKey(date);
            const dayTotal = monthStats.totals[key] || 0;
            const intensity = monthStats.max > 0 ? dayTotal / monthStats.max : 0;
            const isSelected = key === selectedDate;
            const isToday = key === todayKey;
            const tint = dayTotal
              ? `rgba(255, 214, 102, ${0.15 + intensity * 0.35})`
              : 'transparent';

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectDate(key)}
                className={`relative h-20 sm:h-24 border-2 border-black rounded-lg p-2 text-left flex flex-col justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 ${
                  isSelected ? 'ring-4 ring-black' : ''
                }`}
                style={{ backgroundColor: tint }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black">{date.getDate()}</span>
                  {isToday && (
                    <span className="text-[10px] font-black bg-black text-white px-1 rounded">今天</span>
                  )}
                </div>
                {dayTotal ? (
                  <div className="text-[11px] font-black text-black">-¥{formatAmountShort(dayTotal)}</div>
                ) : (
                  <div className="text-[10px] text-slate-400">无消费</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
