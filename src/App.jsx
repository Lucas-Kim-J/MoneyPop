import { useState, useEffect, useMemo, useRef } from 'react';
import { AlertTriangle, Frown, Smile, Sparkles, Wallet } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './data/categories.jsx';
import { callDeepSeek } from './services/deepseek.js';
import HeaderSnapshot from './components/HeaderSnapshot.jsx';
import BudgetOverview from './components/BudgetOverview.jsx';
import IncomeVault from './components/IncomeVault.jsx';
import RegretCard from './components/RegretCard.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionList from './components/TransactionList.jsx';
import UndoSticker from './components/UndoSticker.jsx';
import BackgroundDecor from './components/BackgroundDecor.jsx';

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('budget');
    return saved ? JSON.parse(saved) : 5000;
  });

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetInput, setNewBudgetInput] = useState(budget);

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [isImpulse, setIsImpulse] = useState(false);

  const [showSmartInput, setShowSmartInput] = useState(false);
  const [smartInputText, setSmartInputText] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiRoast, setAiRoast] = useState('');
  const [isRoasting, setIsRoasting] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [undoTx, setUndoTx] = useState(null);
  const [showUndoSticker, setShowUndoSticker] = useState(false);
  const undoTimerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budget', JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  const totalSpent = useMemo(
    () => transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0),
    [transactions]
  );
  const totalIncome = useMemo(
    () => transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0),
    [transactions]
  );
  const impulseTotal = useMemo(
    () =>
      transactions
        .filter(t => t.isImpulse && t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0),
    [transactions]
  );

  const netBalance = totalIncome - totalSpent;
  const remainingBudget = budget - totalSpent;
  const progressPercent = Math.min((totalSpent / budget) * 100, 100);

  const isOverBudget = totalSpent > budget;
  const isWarning = totalSpent > budget * 0.8 && !isOverBudget;

  const snapshot = useMemo(() => {
    const now = new Date(currentDate);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const startOfWeek = new Date(startOfToday);
    const day = startOfWeek.getDay();
    const diffToMonday = (day + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
    const startOfNextWeek = new Date(startOfWeek);
    startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    let todayExpense = 0;
    let yesterdayExpense = 0;
    let thisWeekExpense = 0;
    let lastWeekExpense = 0;

    transactions.forEach(tx => {
      if (tx.type !== 'expense') return;
      const txDate = new Date(tx.date);
      if (txDate >= startOfToday && txDate < startOfTomorrow) {
        todayExpense += tx.amount;
      }
      if (txDate >= startOfYesterday && txDate < startOfToday) {
        yesterdayExpense += tx.amount;
      }
      if (txDate >= startOfWeek && txDate < startOfNextWeek) {
        thisWeekExpense += tx.amount;
      }
      if (txDate >= startOfLastWeek && txDate < startOfWeek) {
        lastWeekExpense += tx.amount;
      }
    });

    return {
      todayExpense,
      yesterdayExpense,
      thisWeekExpense,
      lastWeekExpense
    };
  }, [transactions, currentDate]);

  const dayDelta = snapshot.todayExpense - snapshot.yesterdayExpense;
  const weekDelta = snapshot.thisWeekExpense - snapshot.lastWeekExpense;

  const handleAddTransaction = e => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) return;

    const currentCats = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const catObj = currentCats.find(c => c.id === category);

    const newTx = {
      id: Date.now(),
      type,
      amount: parseFloat(amount),
      description: description || (catObj ? catObj.name : '未知消费'),
      category: catObj ? category : currentCats[0].id,
      date: new Date().toISOString(),
      isImpulse: type === 'expense' ? isImpulse : false
    };

    setTransactions(prev => [newTx, ...prev]);

    setAmount('');
    setDescription('');
    setIsImpulse(false);
    setSmartInputText('');
    setShowSmartInput(false);

    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
    setUndoTx(newTx);
    setShowUndoSticker(true);
    undoTimerRef.current = setTimeout(() => {
      setShowUndoSticker(false);
      setUndoTx(null);
    }, 6000);
  };

  const handleDelete = id => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateBudget = () => {
    setBudget(parseFloat(newBudgetInput));
    setIsEditingBudget(false);
  };

  const handleUndoLast = () => {
    if (!undoTx) return;
    setTransactions(prev => prev.filter(t => t.id !== undoTx.id));
    setUndoTx(null);
    setShowUndoSticker(false);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
  };

  const handleSmartEntry = async () => {
    if (!smartInputText.trim()) return;
    setIsAiProcessing(true);

    const prompt = `
      You are a smart financial assistant. Extract transaction details from this text: "${smartInputText}".
      Current Categories for 'expense': ${EXPENSE_CATEGORIES.map(c => c.id).join(', ')}.
      Current Categories for 'income': ${INCOME_CATEGORIES.map(c => c.id).join(', ')}.
      
      Rules:
      1. Determine if it is 'expense' or 'income'.
      2. Extract the numeric amount.
      3. Create a short description.
      4. Match to the closest category ID.
      
      Return ONLY valid JSON format like this:
      {
        "type": "expense" or "income",
        "amount": 0.00,
        "description": "string",
        "category": "category_id"
      }
    `;

    const result = await callDeepSeek(prompt);

    if (result) {
      try {
        const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);

        if (data.type) setType(data.type);
        if (data.amount) setAmount(data.amount);
        if (data.description) setDescription(data.description);
        if (data.category) setCategory(data.category);

        setShowSmartInput(false);
      } catch (error) {
        console.error('Failed to parse AI response', error);
        alert('AI 解析失败，请重试或手动输入');
      }
    } else {
      alert('网络请求失败，请稍后再试');
    }
    setIsAiProcessing(false);
  };

  const handleGenerateRoast = async () => {
    setIsRoasting(true);
    const recentTx = transactions
      .slice(0, 5)
      .map(t => `${t.type === 'expense' ? '-' : '+'}${t.amount} (${t.description})`)
      .join(', ');

    const prompt = `
      Act as a sarcastic, brutally honest, Neo-Brutalism style financial advisor. 
      Analyze the user's financial status:
      - Budget Remaining: ${remainingBudget} (Total Budget: ${budget})
      - Impulse Spending: ${impulseTotal}
      - Recent Transactions: ${recentTx}
      
      Generate a short, punchy, funny, or roasting comment (max 40 words) in Chinese.
      If they are saving well, be hype/excited but still edgy.
      If they are overspending, roast them hard.
      Use emojis.
    `;

    const result = await callDeepSeek(prompt);
    if (result) {
      setAiRoast(result);
    }
    setIsRoasting(false);
  };

  const getStatusMessage = () => {
    if (isOverBudget) return { text: '警告：该吃土了！已经超支！', icon: <Frown size={28} /> };
    if (isWarning) return { text: '注意：余额告急，请理性消费。', icon: <AlertTriangle size={28} /> };
    return { text: '状态极佳！继续保持理财节奏。', icon: <Smile size={28} /> };
  };

  const status = getStatusMessage();
  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="min-h-screen font-sans text-slate-900 pb-20 selection:bg-pink-400 selection:text-white relative overflow-x-hidden bg-dot-pattern">
      <BackgroundDecor />
      <div className="bg-black text-white py-2 overflow-hidden whitespace-nowrap sticky top-0 z-50 border-b-4 border-black">
        <div className="animate-marquee inline-block">
          $$$ 省钱就是赚钱 $$$ 别做月光族 $$$ 冲动是魔鬼 $$$ 你的钱去哪了？ $$$ 理性消费 $$$
          $$$ 每一笔收入都值得庆祝 $$$ 积少成多 $$$ 财富自由指日可待 $$$
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-8 relative z-10">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter drop-shadow-[4px_4px_0px_rgba(255,0,255,1)]">
              MONEY<span className="text-cyan-500">POP</span>
            </h1>
            <p className="text-xl font-bold mt-2 text-slate-600 flex items-center gap-2">
              双向记账，拒绝隐形贫困。
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded border border-purple-200 flex items-center gap-1">
                <Sparkles size={12} /> AI Powered
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="bg-white border-4 border-black px-4 py-2 rounded-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
              <Wallet size={20} />
              <span>
                {currentDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                <span className="ml-2 font-black font-mono bg-yellow-300 px-1 rounded border-2 border-black">
                  {currentDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </span>
            </div>
            <HeaderSnapshot snapshot={snapshot} dayDelta={dayDelta} weekDelta={weekDelta} />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          <BudgetOverview
            status={status}
            isOverBudget={isOverBudget}
            isEditingBudget={isEditingBudget}
            newBudgetInput={newBudgetInput}
            onBudgetInputChange={e => setNewBudgetInput(e.target.value)}
            onUpdateBudget={handleUpdateBudget}
            onEditBudget={() => setIsEditingBudget(true)}
            onGenerateRoast={handleGenerateRoast}
            aiRoast={aiRoast}
            isRoasting={isRoasting}
            remainingBudget={remainingBudget}
            progressPercent={progressPercent}
            totalSpent={totalSpent}
            budget={budget}
          />

          <div className="md:col-span-5 flex flex-col gap-6">
            <IncomeVault totalIncome={totalIncome} netBalance={netBalance} />
            <RegretCard impulseTotal={impulseTotal} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <TransactionForm
              type={type}
              setType={setType}
              amount={amount}
              setAmount={setAmount}
              description={description}
              setDescription={setDescription}
              category={category}
              setCategory={setCategory}
              isImpulse={isImpulse}
              setIsImpulse={setIsImpulse}
              showSmartInput={showSmartInput}
              setShowSmartInput={setShowSmartInput}
              smartInputText={smartInputText}
              setSmartInputText={setSmartInputText}
              isAiProcessing={isAiProcessing}
              onSmartEntry={handleSmartEntry}
              onSubmit={handleAddTransaction}
              currentCategories={currentCategories}
            />
          </div>

          <TransactionList
            transactions={transactions}
            expenseCategories={EXPENSE_CATEGORIES}
            incomeCategories={INCOME_CATEGORIES}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <UndoSticker show={showUndoSticker} undoTx={undoTx} onUndo={handleUndoLast} />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .pattern-diagonal-lines {
          background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, #cc3333 10px, #cc3333 20px);
        }
      `}</style>
    </div>
  );
}
