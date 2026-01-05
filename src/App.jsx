import { useState, useEffect, useMemo, useRef } from 'react';
import { AlertTriangle, Frown, Smile, Sparkles, Wallet, X, UserCircle2, LogIn, LogOut } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './data/categories.jsx';
import { callDeepSeek } from './services/deepseek.js';
import HeaderSnapshot from './components/HeaderSnapshot.jsx';
import BudgetOverview from './components/BudgetOverview.jsx';
import IncomeVault from './components/IncomeVault.jsx';
import QuickEntryCard from './components/QuickEntryCard.jsx';
import SubscriptionPanel from './components/SubscriptionPanel.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionList from './components/TransactionList.jsx';
import UndoSticker from './components/UndoSticker.jsx';
import BackgroundDecor from './components/BackgroundDecor.jsx';
import ExpenseCalendar from './components/ExpenseCalendar.jsx';
import AuthPanel from './components/AuthPanel.jsx';
import Button from './components/Button.jsx';
import { formatDateKey, formatDateLabel } from './utils/date.js';
import { supabase, supabaseEnabled } from './services/supabase.js';

function getTodayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateInput(value) {
  if (!value) return new Date();
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function mergeById(remoteItems, localItems) {
  const map = new Map();
  remoteItems.forEach(item => {
    map.set(item.id, item);
  });
  localItems.forEach(item => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('budget');
    return saved ? JSON.parse(saved) : 5000;
  });

  const [subscriptions, setSubscriptions] = useState(() => {
    const saved = localStorage.getItem('subscriptions');
    return saved ? JSON.parse(saved) : [];
  });

  const [pendingSubscriptions, setPendingSubscriptions] = useState(() => {
    const saved = localStorage.getItem('subscriptionPending');
    return saved ? JSON.parse(saved) : [];
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(!supabaseEnabled);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [hasDismissedAuthPrompt, setHasDismissedAuthPrompt] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [syncState, setSyncState] = useState('idle');
  const [syncError, setSyncError] = useState('');
  const [lastSyncAt, setLastSyncAt] = useState(null);

  const [subName, setSubName] = useState('');
  const [subAmount, setSubAmount] = useState('');
  const [subCategory, setSubCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [subFirstDate, setSubFirstDate] = useState(() => getTodayInputValue());

  const [currentDate, setCurrentDate] = useState(new Date());
  const [undoTx, setUndoTx] = useState(null);
  const [showUndoSticker, setShowUndoSticker] = useState(false);
  const undoTimerRef = useRef(null);
  const syncTimerRef = useRef(null);
  const isHydratingRef = useRef(false);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budget', JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    setNewBudgetInput(budget);
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('subscriptionPending', JSON.stringify(pendingSubscriptions));
  }, [pendingSubscriptions]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
        setAuthChecked(true);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthChecked(true);
      if (nextSession) {
        setHasDismissedAuthPrompt(true);
      } else {
        setHasDismissedAuthPrompt(false);
        setIsUserMenuOpen(false);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleDismissAuthPrompt = () => {
    setIsAuthPromptOpen(false);
    setHasDismissedAuthPrompt(true);
  };

  useEffect(() => {
    if (!isFormOpen && !selectedCalendarDate && !isAuthPromptOpen) return;
    const handleKeyDown = event => {
      if (event.key !== 'Escape') return;
      if (isAuthPromptOpen) {
        handleDismissAuthPrompt();
        return;
      }
      if (selectedCalendarDate) {
        setSelectedCalendarDate(null);
        return;
      }
      setIsFormOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormOpen, selectedCalendarDate, isAuthPromptOpen]);

  useEffect(() => {
    if (!supabaseEnabled) {
      setIsAuthPromptOpen(false);
      return;
    }
    if (!authChecked) return;
    if (session) {
      setIsAuthPromptOpen(false);
      setHasDismissedAuthPrompt(true);
      return;
    }
    if (!hasDismissedAuthPrompt) {
      setIsAuthPromptOpen(true);
    }
  }, [authChecked, session, hasDismissedAuthPrompt, supabaseEnabled]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const now = new Date();
    setPendingSubscriptions(prev => {
      const existing = new Set(prev.map(item => item.subscriptionId));
      const additions = [];

      subscriptions.forEach(sub => {
        const dueAt = new Date(sub.nextDueAt);
        if (dueAt <= now && !existing.has(sub.id)) {
          additions.push({
            id: `${sub.id}-${dueAt.getTime()}`,
            subscriptionId: sub.id,
            name: sub.name,
            amount: sub.amount,
            category: sub.category,
            dueAt: sub.nextDueAt
          });
        }
      });

      return additions.length ? [...additions, ...prev] : prev;
    });
  }, [subscriptions, currentDate]);

  useEffect(() => {
    if (!session || !supabase) {
      setSyncState('idle');
      setSyncError('');
      setLastSyncAt(null);
      return;
    }

    const hydrateFromSupabase = async () => {
      const userId = session.user.id;
      isHydratingRef.current = true;
      setSyncState('syncing');
      setSyncError('');

      try {
        const [txRes, subRes, pendingRes, settingsRes] = await Promise.all([
          supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
          supabase.from('subscriptions').select('*').eq('user_id', userId).order('next_due_at', { ascending: true }),
          supabase.from('subscription_pending').select('*').eq('user_id', userId).order('due_at', { ascending: true }),
          supabase.from('user_settings').select('budget, updated_at').eq('user_id', userId).single()
        ]);

        if (txRes.error) throw txRes.error;
        if (subRes.error) throw subRes.error;
        if (pendingRes.error) throw pendingRes.error;
        if (settingsRes.error && settingsRes.error.code !== 'PGRST116') throw settingsRes.error;

        const remoteTransactions = (txRes.data || []).map(row => ({
          id: row.id,
          type: row.type,
          amount: Number(row.amount),
          description: row.description,
          category: row.category,
          date: row.date,
          isImpulse: row.is_impulse
        }));

        const remoteSubscriptions = (subRes.data || []).map(row => ({
          id: row.id,
          name: row.name,
          amount: Number(row.amount),
          category: row.category,
          nextDueAt: row.next_due_at,
          active: row.active,
          createdAt: row.created_at
        }));

        const remotePending = (pendingRes.data || []).map(row => ({
          id: row.id,
          subscriptionId: row.subscription_id,
          name: row.name,
          amount: Number(row.amount),
          category: row.category,
          dueAt: row.due_at
        }));

        const mergedTransactions = mergeById(remoteTransactions, transactions).sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        const mergedSubscriptions = mergeById(remoteSubscriptions, subscriptions);
        const mergedPending = mergeById(remotePending, pendingSubscriptions);

        setTransactions(mergedTransactions);
        setSubscriptions(mergedSubscriptions);
        setPendingSubscriptions(mergedPending);

        if (settingsRes.data && typeof settingsRes.data.budget !== 'undefined') {
          setBudget(Number(settingsRes.data.budget));
        }

        setSyncState('success');
        setLastSyncAt(new Date());
      } catch (error) {
        console.error('Supabase hydrate failed', error);
        setSyncState('error');
        setSyncError('云端读取失败，请稍后重试');
      } finally {
        isHydratingRef.current = false;
      }
    };

    hydrateFromSupabase();
  }, [session]);

  const syncToSupabase = async () => {
    if (!session || !supabase) return;
    if (isHydratingRef.current || isSyncingRef.current) return;

    isSyncingRef.current = true;
    setSyncState('syncing');
    setSyncError('');

    const userId = session.user.id;
    const txPayload = transactions.map(tx => ({
      id: tx.id,
      user_id: userId,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      category: tx.category,
      date: tx.date,
      is_impulse: tx.isImpulse
    }));
    const subPayload = subscriptions.map(sub => ({
      id: sub.id,
      user_id: userId,
      name: sub.name,
      amount: sub.amount,
      category: sub.category,
      next_due_at: sub.nextDueAt,
      active: sub.active,
      created_at: sub.createdAt
    }));
    const pendingPayload = pendingSubscriptions.map(item => ({
      id: item.id,
      user_id: userId,
      subscription_id: item.subscriptionId,
      name: item.name,
      amount: item.amount,
      category: item.category,
      due_at: item.dueAt,
      created_at: item.createdAt || new Date().toISOString()
    }));

    const replaceTableData = async (table, rows) => {
      const { error: deleteError } = await supabase.from(table).delete().eq('user_id', userId);
      if (deleteError) throw deleteError;
      if (!rows.length) return;
      const { error: insertError } = await supabase.from(table).insert(rows);
      if (insertError) throw insertError;
    };

    try {
      await Promise.all([
        replaceTableData('transactions', txPayload),
        replaceTableData('subscriptions', subPayload),
        replaceTableData('subscription_pending', pendingPayload),
        supabase
          .from('user_settings')
          .upsert({ user_id: userId, budget, updated_at: new Date().toISOString() })
      ]);

      setSyncState('success');
      setLastSyncAt(new Date());
    } catch (error) {
      console.error('Supabase sync failed', error);
      setSyncState('error');
      setSyncError('云端同步失败，请检查网络或权限');
    } finally {
      isSyncingRef.current = false;
    }
  };

  useEffect(() => {
    if (!session || !supabase) return;
    if (isHydratingRef.current) return;

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }
    syncTimerRef.current = setTimeout(() => {
      syncToSupabase();
    }, 800);

    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [transactions, subscriptions, pendingSubscriptions, budget, session]);

  const totalSpent = useMemo(
    () => transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0),
    [transactions]
  );
  const totalIncome = useMemo(
    () => transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0),
    [transactions]
  );

  const expensesByDate = useMemo(() => {
    const map = new Map();
    transactions.forEach(tx => {
      if (tx.type !== 'expense') return;
      const key = formatDateKey(tx.date);
      const entry = map.get(key) || { total: 0, items: [] };
      entry.total += tx.amount;
      entry.items.push(tx);
      map.set(key, entry);
    });
    map.forEach(value => {
      value.items.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    return map;
  }, [transactions]);

  const selectedDateInfo = selectedCalendarDate ? expensesByDate.get(selectedCalendarDate) : null;
  const selectedDateItems = selectedDateInfo ? selectedDateInfo.items : [];
  const selectedDateTotal = selectedDateInfo ? selectedDateInfo.total : 0;
  const selectedDateLabel = selectedCalendarDate ? formatDateLabel(selectedCalendarDate) : '';
  const netBalance = totalIncome - totalSpent;
  const remainingBudget = budget - totalSpent;
  const progressPercent = Math.min((totalSpent / budget) * 100, 100);
  const showAuthWarning = supabaseEnabled && !session;
  const showUserWidget = supabaseEnabled && authChecked && (session || hasDismissedAuthPrompt);

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

  const handleSignIn = async () => {
    if (!supabase) return;
    if (!authEmail || !authPassword) {
      alert('请输入邮箱和密码');
      return;
    }
    setIsAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword
    });
    if (error) {
      alert(`登录失败：${error.message}`);
    }
    setIsAuthLoading(false);
  };

  const handleSignUp = async () => {
    if (!supabase) return;
    if (!authEmail || !authPassword) {
      alert('请输入邮箱和密码');
      return;
    }
    setIsAuthLoading(true);
    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword
    });
    if (error) {
      alert(`注册失败：${error.message}`);
    } else {
      alert('注册成功，请前往邮箱验证并登录');
    }
    setIsAuthLoading(false);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    setIsAuthLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(`退出失败：${error.message}`);
    }
    setIsAuthLoading(false);
  };

  const triggerUndoSticker = newTx => {
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
    setIsFormOpen(false);
    triggerUndoSticker(newTx);
  };

  const handleDelete = id => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateBudget = () => {
    setBudget(parseFloat(newBudgetInput));
    setIsEditingBudget(false);
  };

  const handleAddSubscription = e => {
    e.preventDefault();
    if (!subName.trim() || !subAmount || isNaN(subAmount) || subAmount <= 0) return;

    const dueDate = parseDateInput(subFirstDate);
    const newSub = {
      id: Date.now(),
      name: subName.trim(),
      amount: parseFloat(subAmount),
      category: subCategory,
      nextDueAt: dueDate.toISOString(),
      active: true,
      createdAt: new Date().toISOString()
    };

    setSubscriptions(prev => [newSub, ...prev]);
    setSubName('');
    setSubAmount('');
    setSubCategory(EXPENSE_CATEGORIES[0].id);
    setSubFirstDate(getTodayInputValue());
  };

  const handleDeleteSubscription = id => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    setPendingSubscriptions(prev => prev.filter(item => item.subscriptionId !== id));
  };

  const handleConfirmPending = pendingId => {
    const pending = pendingSubscriptions.find(item => item.id === pendingId);
    if (!pending) return;

    const newTx = {
      id: Date.now(),
      type: 'expense',
      amount: pending.amount,
      description: pending.name,
      category: pending.category,
      date: new Date().toISOString(),
      isImpulse: false
    };

    setTransactions(prev => [newTx, ...prev]);
    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === pending.subscriptionId ? { ...sub, nextDueAt: addDays(pending.dueAt, 30) } : sub
      )
    );
    setPendingSubscriptions(prev => prev.filter(item => item.id !== pendingId));
  };

  const handleSkipPending = pendingId => {
    const pending = pendingSubscriptions.find(item => item.id === pendingId);
    if (!pending) return;

    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === pending.subscriptionId ? { ...sub, nextDueAt: addDays(pending.dueAt, 30) } : sub
      )
    );
    setPendingSubscriptions(prev => prev.filter(item => item.id !== pendingId));
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
            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter drop-shadow-[4px_4px_0px_rgba(255,0,255,1)] bg-white inline-block px-2 border-4 border-black rotate-[-2deg]">
              MONEY<span className="text-cyan-500">POP</span>
            </h1>
            <p className="text-xl font-bold mt-4 text-slate-600 flex items-center gap-2 bg-white/80 inline-block px-2 backdrop-blur-sm border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              双向记账，拒绝隐形贫困。
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded border border-purple-200 flex items-center gap-1">
                <Sparkles size={12} /> AI Powered
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-start">
            <div className="bg-white border-4 border-black px-4 py-2 rounded-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 hover:rotate-2 transition-transform">
              <Wallet size={20} />
              <span>
                {currentDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                <span className="ml-2 font-black font-mono bg-yellow-300 px-1 rounded border-2 border-black">
                  {currentDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </span>
            </div>
            <HeaderSnapshot snapshot={snapshot} dayDelta={dayDelta} weekDelta={weekDelta} />

            {showUserWidget && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(prev => !prev)}
                  className="bg-white border-4 border-black px-3 py-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 font-bold text-xs"
                >
                  <UserCircle2 size={16} />
                  <span>{session ? '已登录' : '未登录'}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 z-20">
                    {session ? (
                      <div className="space-y-3">
                        <div className="text-xs font-bold text-slate-500">当前账号</div>
                        <div className="text-sm font-black break-all">{session.user.email}</div>
                        <Button
                          onClick={() => {
                            handleSignOut();
                            setIsUserMenuOpen(false);
                          }}
                          variant="neutral"
                          className="w-full !py-2 text-sm"
                        >
                          <LogOut size={16} /> 退出登录
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-xs font-bold text-slate-500">当前未登录</div>
                        <Button
                          onClick={() => {
                            setIsAuthPromptOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          variant="black"
                          className="w-full !py-2 text-sm"
                        >
                          <LogIn size={16} /> 去登录
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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
            <QuickEntryCard onOpenForm={() => setIsFormOpen(true)} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <TransactionList
            transactions={transactions}
            expenseCategories={EXPENSE_CATEGORIES}
            incomeCategories={INCOME_CATEGORIES}
            onDelete={handleDelete}
            showAuthWarning={showAuthWarning}
          />

          <div className="lg:col-span-5">
            <SubscriptionPanel
              subscriptions={subscriptions}
              pendingItems={pendingSubscriptions}
              formName={subName}
              formAmount={subAmount}
              formCategory={subCategory}
              formDate={subFirstDate}
              categories={EXPENSE_CATEGORIES}
              onNameChange={e => setSubName(e.target.value)}
              onAmountChange={e => setSubAmount(e.target.value)}
              onCategoryChange={e => setSubCategory(e.target.value)}
              onDateChange={e => setSubFirstDate(e.target.value)}
              onAdd={handleAddSubscription}
              onDelete={handleDeleteSubscription}
              onConfirmPending={handleConfirmPending}
              onSkipPending={handleSkipPending}
            />
          </div>
        </div>

        <div className="mt-12">
          <ExpenseCalendar
            expensesByDate={expensesByDate}
            selectedDate={selectedCalendarDate}
            onSelectDate={setSelectedCalendarDate}
          />
        </div>
      </div>

      <UndoSticker show={showUndoSticker} undoTx={undoTx} onUndo={handleUndoLast} />

      {isAuthPromptOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-10"
          onClick={handleDismissAuthPrompt}
        >
          <div className="w-full max-w-2xl" onClick={event => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white border-2 border-black px-2 py-1 rounded font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                登录提醒
              </div>
              <button
                type="button"
                onClick={handleDismissAuthPrompt}
                className="bg-white border-2 border-black p-2 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <X size={16} />
              </button>
            </div>
            <AuthPanel
              supabaseEnabled={supabaseEnabled}
              session={session}
              email={authEmail}
              password={authPassword}
              onEmailChange={e => setAuthEmail(e.target.value)}
              onPasswordChange={e => setAuthPassword(e.target.value)}
              onSignIn={handleSignIn}
              onSignUp={handleSignUp}
              onSignOut={handleSignOut}
              isAuthLoading={isAuthLoading}
              syncState={syncState}
              lastSyncAt={lastSyncAt}
              syncError={syncError}
              className=""
            />
            <div className="mt-3 text-xs font-bold text-slate-600 text-center">
              关闭后仍可使用，但未登录可能导致数据丢失。
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white border-2 border-black px-2 py-1 rounded font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                记一笔
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="bg-white border-2 border-black p-2 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <X size={16} />
              </button>
            </div>
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
              containerClassName="transition-colors duration-300"
            />
          </div>
        </div>
      )}

      {selectedCalendarDate && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-10"
          onClick={() => setSelectedCalendarDate(null)}
        >
          <div className="w-full max-w-xl" onClick={event => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white border-2 border-black px-2 py-1 rounded font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {selectedDateLabel}
              </div>
              <button
                type="button"
                onClick={() => setSelectedCalendarDate(null)}
                className="bg-white border-2 border-black p-2 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-white border-4 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-4">
                <div className="font-black text-lg">当日消费</div>
                <div className="font-black text-xl">-¥{selectedDateTotal.toFixed(2)}</div>
              </div>

              {selectedDateItems.length === 0 ? (
                <div className="text-center py-12 border-4 border-dashed border-slate-300 rounded-xl bg-slate-50">
                  <div className="text-4xl mb-2">🌤️</div>
                  <p className="font-bold text-sm">这一天没有消费记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateItems.map(tx => {
                    const cat = EXPENSE_CATEGORIES.find(c => c.id === tx.category);
                    return (
                      <div
                        key={tx.id}
                        className="border-2 border-black rounded-lg p-3 flex items-center justify-between bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <div>
                          <div className="font-bold">{tx.description}</div>
                          <div className="text-xs font-bold text-slate-400">
                            {new Date(tx.date).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {cat ? ` · ${cat.name}` : ''}
                          </div>
                        </div>
                        <div className="font-black text-lg text-black">-¥{tx.amount.toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
