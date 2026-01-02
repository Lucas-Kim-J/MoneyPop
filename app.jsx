import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, TrendingUp, AlertTriangle, Wallet, Frown, Smile, ShoppingBag, Coffee, Car, Home, Zap, Heart, Briefcase, Gift, ArrowUpCircle, ArrowDownCircle, Banknote, CreditCard, Sparkles, Bot, MessageSquareQuote, Loader } from 'lucide-react';

// --- Gemini API Configuration ---
const apiKey = ""; // 系统会在运行时自动注入 API Key

async function callGemini(prompt) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}

// --- 组件部分 ---

const Card = ({ children, className = "", color = "bg-white" }) => (
  <div className={`border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6 transition-transform hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] ${color} ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", type = "button", disabled = false }) => {
  const colors = {
    primary: "bg-yellow-400 hover:bg-yellow-300 text-black",
    success: "bg-green-400 hover:bg-green-300 text-black",
    danger: "bg-pink-500 hover:bg-pink-400 text-white",
    neutral: "bg-white hover:bg-gray-100 text-black",
    black: "bg-black text-white hover:bg-gray-800",
    magic: "bg-purple-500 hover:bg-purple-400 text-white"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`font-bold border-4 border-black px-6 py-3 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${colors[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// --- 分类定义 ---

const EXPENSE_CATEGORIES = [
  { id: 'food', name: '餐饮', icon: <Coffee size={20} />, color: 'bg-orange-400' },
  { id: 'shopping', name: '购物', icon: <ShoppingBag size={20} />, color: 'bg-pink-400' },
  { id: 'transport', name: '交通', icon: <Car size={20} />, color: 'bg-blue-400' },
  { id: 'housing', name: '居住', icon: <Home size={20} />, color: 'bg-purple-400' },
  { id: 'entertainment', name: '娱乐', icon: <Zap size={20} />, color: 'bg-yellow-400' },
  { id: 'repayment', name: '还款', icon: <CreditCard size={20} />, color: 'bg-red-400' },
];

const INCOME_CATEGORIES = [
  { id: 'salary', name: '薪资', icon: <Briefcase size={20} />, color: 'bg-green-400' },
  { id: 'bonus', name: '奖金', icon: <Zap size={20} />, color: 'bg-yellow-400' },
  { id: 'investment', name: '理财', icon: <TrendingUp size={20} />, color: 'bg-cyan-400' },
  { id: 'gift', name: '红包', icon: <Gift size={20} />, color: 'bg-pink-400' },
  { id: 'other', name: '其他', icon: <Smile size={20} />, color: 'bg-gray-300' },
];

export default function App() {
  // --- State ---
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
  
  // Form State
  const [type, setType] = useState('expense'); // 'expense' | 'income'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [isImpulse, setIsImpulse] = useState(false);
  
  // AI State
  const [showSmartInput, setShowSmartInput] = useState(false);
  const [smartInputText, setSmartInputText] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiRoast, setAiRoast] = useState("");
  const [isRoasting, setIsRoasting] = useState(false);
  
  // UI State
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- Effects ---
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

  // --- Calculations ---
  const totalSpent = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0), [transactions]);
  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0), [transactions]);
  const impulseTotal = useMemo(() => transactions.filter(t => t.isImpulse && t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0), [transactions]);
  
  const netBalance = totalIncome - totalSpent;
  const remainingBudget = budget - totalSpent;
  const progressPercent = Math.min((totalSpent / budget) * 100, 100);
  
  const isOverBudget = totalSpent > budget;
  const isWarning = totalSpent > budget * 0.8 && !isOverBudget;

  // --- Handlers ---
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) return;

    const currentCats = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const catObj = currentCats.find(c => c.id === category);
    
    const newTx = {
      id: Date.now(),
      type, // 'expense' or 'income'
      amount: parseFloat(amount),
      description: description || (catObj ? catObj.name : "未知消费"),
      category: catObj ? category : currentCats[0].id,
      date: new Date().toISOString(),
      isImpulse: type === 'expense' ? isImpulse : false
    };

    setTransactions([newTx, ...transactions]);
    
    // Reset form
    setAmount('');
    setDescription('');
    setIsImpulse(false);
    setSmartInputText('');
    setShowSmartInput(false);
    
    // Feedback
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1000);
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleUpdateBudget = () => {
    setBudget(parseFloat(newBudgetInput));
    setIsEditingBudget(false);
  };

  // --- AI Features ---

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

    const result = await callGemini(prompt);
    
    if (result) {
      try {
        // Remove any markdown code blocks if Gemini adds them
        const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);
        
        if (data.type) setType(data.type);
        if (data.amount) setAmount(data.amount);
        if (data.description) setDescription(data.description);
        if (data.category) setCategory(data.category);
        
        // Auto switch to manual view to let user confirm
        setShowSmartInput(false);
      } catch (e) {
        console.error("Failed to parse AI response", e);
        alert("AI 解析失败，请重试或手动输入");
      }
    } else {
        alert("网络请求失败，请稍后再试");
    }
    setIsAiProcessing(false);
  };

  const handleGenerateRoast = async () => {
    setIsRoasting(true);
    const recentTx = transactions.slice(0, 5).map(t => `${t.type === 'expense' ? '-' : '+'}${t.amount} (${t.description})`).join(', ');
    
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

    const result = await callGemini(prompt);
    if (result) {
      setAiRoast(result);
    }
    setIsRoasting(false);
  };

  const getStatusMessage = () => {
    if (isOverBudget) return { text: "警告：该吃土了！已经超支！", color: "text-red-600", icon: <Frown size={28} /> };
    if (isWarning) return { text: "注意：余额告急，请理性消费。", color: "text-orange-600", icon: <AlertTriangle size={28} /> };
    return { text: "状态极佳！继续保持理财节奏。", color: "text-green-600", icon: <Smile size={28} /> };
  };

  const status = getStatusMessage();
  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 pb-20 selection:bg-pink-400 selection:text-white">
      {/* 顶部动态背景条 */}
      <div className="bg-black text-white py-2 overflow-hidden whitespace-nowrap sticky top-0 z-50 border-b-4 border-black">
        <div className="animate-marquee inline-block">
           $$$ 省钱就是赚钱 $$$ 别做月光族 $$$ 冲动是魔鬼 $$$ 你的钱去哪了？ $$$ 理性消费 $$$ 
           $$$ 每一笔收入都值得庆祝 $$$ 积少成多 $$$ 财富自由指日可待 $$$ 
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-8">
        
        {/* 标题区 */}
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
          
          <div className="flex gap-2">
             <div className="bg-white border-4 border-black px-4 py-2 rounded-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                <Wallet size={20} />
                <span>
                  {currentDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                  <span className="ml-2 font-black font-mono bg-yellow-300 px-1 rounded border-2 border-black">
                    {currentDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </span>
             </div>
          </div>
        </header>

        {/* 核心仪表盘 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          
          {/* 预算总览卡片 */}
          <Card className="md:col-span-7 relative overflow-hidden flex flex-col justify-between" color={isOverBudget ? 'bg-pink-200' : 'bg-yellow-200'}>
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div>
                <h2 className="text-2xl font-black uppercase">本月预算剩余</h2>
                <div className="flex items-center gap-2 mt-1 font-bold text-slate-700">
                  {status.icon} <span>{status.text}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleGenerateRoast}
                  className="bg-black text-white p-2 rounded hover:scale-110 transition-transform flex items-center gap-1"
                  title="让AI点评你的财务状况"
                >
                  <Bot size={20} />
                  <span className="text-xs font-bold hidden sm:inline">AI点评</span>
                </button>
                <button 
                  onClick={() => setIsEditingBudget(true)}
                  className="bg-white border-2 border-black text-black p-2 rounded hover:bg-slate-100 transition-colors"
                >
                  <TrendingUp size={20} />
                </button>
              </div>
            </div>

            {/* AI Roast Message Bubble */}
            {(aiRoast || isRoasting) && (
              <div className="mb-4 relative z-20 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-3 items-start">
                   <div className="bg-purple-500 text-white p-2 rounded border-2 border-black shrink-0">
                     {isRoasting ? <Loader className="animate-spin" size={20}/> : <MessageSquareQuote size={20} />}
                   </div>
                   <div className="font-bold text-sm md:text-base">
                     {isRoasting ? "正在翻看你的烂账..." : aiRoast}
                   </div>
                </div>
              </div>
            )}

            {isEditingBudget ? (
               <div className="flex gap-2 mb-4 relative z-10">
                 <input 
                   type="number" 
                   value={newBudgetInput} 
                   onChange={(e) => setNewBudgetInput(e.target.value)}
                   className="w-full border-4 border-black p-2 rounded font-bold text-xl"
                 />
                 <Button onClick={handleUpdateBudget} className="py-2 px-3" variant="black">OK</Button>
               </div>
            ) : (
              <div className="flex items-baseline gap-2 mb-4 relative z-10">
                <span className={`text-6xl font-black tracking-tight ${remainingBudget < 0 ? 'text-red-600' : 'text-black'}`}>
                  ¥{remainingBudget.toFixed(0)}
                </span>
                <span className="text-xl font-bold text-slate-600">/ 可支配</span>
              </div>
            )}

            {/* 巨大进度条 */}
            <div className="w-full h-10 border-4 border-black bg-white rounded-full relative overflow-hidden mb-2">
               <div 
                 className={`h-full border-r-4 border-black transition-all duration-500 ease-out ${isOverBudget ? 'bg-red-500 pattern-diagonal-lines' : 'bg-cyan-400'}`}
                 style={{ width: `${progressPercent}%` }}
               ></div>
            </div>
            
            <div className="flex justify-between font-bold text-sm relative z-10">
              <span>已支出: ¥{totalSpent}</span>
              <span>预算目标: ¥{budget}</span>
            </div>
          </Card>

          {/* 右侧数据列 */}
          <div className="md:col-span-5 flex flex-col gap-6">
            
            {/* 收入金库 */}
            <Card color="bg-green-400" className="flex-1 flex flex-col justify-center">
               <div className="flex justify-between items-center mb-2">
                 <h2 className="text-xl font-black uppercase flex items-center gap-2">
                   <Banknote className="text-white" strokeWidth={3} /> 
                   小金库
                 </h2>
                 <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded">净资产</span>
               </div>
               <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold opacity-80">总收入</p>
                    <p className="text-2xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">+¥{totalIncome}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold opacity-80">结余</p>
                    <p className="text-3xl font-black">¥{netBalance.toFixed(0)}</p>
                  </div>
               </div>
            </Card>

            {/* 后悔药 */}
            <Card color="bg-pink-400 text-white" className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-xl font-black uppercase flex items-center gap-2">
                  <AlertTriangle className="text-yellow-300" strokeWidth={3} /> 
                  后悔药
                </h2>
              </div>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black drop-shadow-[3px_3px_0px_rgba(0,0,0,0.5)]">
                   ¥{impulseTotal}
                 </span>
                 <span className="text-xs font-bold bg-black/20 px-2 py-1 rounded">冲动金额</span>
              </div>
            </Card>

          </div>
        </div>

        {/* 主功能区 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 左侧：记账表单 */}
          <div className="lg:col-span-5">
            <Card className="sticky top-24 transition-colors duration-300" color={type === 'expense' ? 'bg-white' : 'bg-green-50'}>
              
              {/* 类型切换 Tab + AI Toggle */}
              <div className="flex items-center justify-between mb-6 gap-2">
                 <div className="flex gap-2 flex-1">
                    <button 
                      onClick={() => { setType('expense'); setShowSmartInput(false); }}
                      className={`flex-1 py-2 font-black text-sm md:text-base border-4 rounded-lg flex items-center justify-center gap-1 transition-all ${type === 'expense' && !showSmartInput ? 'bg-yellow-400 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'bg-white border-slate-300 text-slate-400 hover:border-slate-400'}`}
                    >
                      <ArrowDownCircle size={16} /> 支出
                    </button>
                    <button 
                      onClick={() => { setType('income'); setShowSmartInput(false); }}
                      className={`flex-1 py-2 font-black text-sm md:text-base border-4 rounded-lg flex items-center justify-center gap-1 transition-all ${type === 'income' && !showSmartInput ? 'bg-green-400 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'bg-white border-slate-300 text-slate-400 hover:border-slate-400'}`}
                    >
                      <ArrowUpCircle size={16} /> 收入
                    </button>
                 </div>
                 <button 
                    onClick={() => setShowSmartInput(!showSmartInput)}
                    className={`p-2 border-4 rounded-lg transition-all ${showSmartInput ? 'bg-purple-500 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'bg-white border-slate-300 text-purple-400 hover:border-purple-400'}`}
                    title="AI 智能填单"
                 >
                    <Sparkles size={24} />
                 </button>
              </div>
              
              {showSmartInput ? (
                // AI 智能填单模式
                <div className="space-y-4 animate-in fade-in zoom-in-95">
                  <div className="bg-purple-100 border-4 border-purple-300 rounded-lg p-3">
                    <p className="font-bold text-purple-800 text-sm mb-2 flex items-center gap-2">
                      <Bot size={16}/> AI 智能助手
                    </p>
                    <textarea 
                      value={smartInputText}
                      onChange={(e) => setSmartInputText(e.target.value)}
                      className="w-full bg-white border-2 border-purple-200 rounded p-2 font-bold focus:outline-none focus:border-purple-500 h-32 resize-none"
                      placeholder="试试输入：&#10;“刚才打车花了35块”&#10;“发奖金5000元”&#10;“超市买零食128.5”"
                    />
                  </div>
                  <Button 
                    onClick={handleSmartEntry} 
                    variant="magic" 
                    className="w-full"
                    disabled={isAiProcessing}
                  >
                    {isAiProcessing ? 'AI 正在分析...' : '✨ 一键识别'}
                  </Button>
                </div>
              ) : (
                // 普通手动模式
                <form onSubmit={handleAddTransaction} className="space-y-4 animate-in fade-in zoom-in-95">
                  <div>
                    <label className="block font-bold mb-1">{type === 'expense' ? '消费金额' : '入账金额'}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xl">¥</span>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
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
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border-4 border-black rounded-lg p-3 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                      placeholder={type === 'expense' ? "买了什么？" : "哪里来的钱？"}
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
                          className={`border-4 rounded-lg p-2 flex flex-col items-center justify-center gap-1 transition-all ${category === cat.id ? `border-black ${cat.color} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]` : 'border-slate-200 text-slate-400 hover:border-slate-400'}`}
                        >
                          {cat.icon}
                          <span className="text-xs font-bold">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {type === 'expense' && (
                    <div className="flex items-center gap-3 bg-red-50 p-3 rounded border-2 border-red-100">
                      <input 
                        type="checkbox" 
                        id="impulse"
                        checked={isImpulse}
                        onChange={(e) => setIsImpulse(e.target.checked)}
                        className="w-6 h-6 border-4 border-black accent-pink-500 cursor-pointer"
                      />
                      <label htmlFor="impulse" className="font-bold text-red-500 cursor-pointer select-none">这是冲动消费 (加入后悔清单)</label>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full py-4 text-xl mt-4" 
                    variant={type === 'expense' ? 'primary' : 'success'}
                  >
                    {type === 'expense' ? '确认支出' : '确认入账'} <Wallet size={24} />
                  </Button>
                </form>
              )}
            </Card>
          </div>

          {/* 右侧：流水列表 */}
          <div className="lg:col-span-7">
             <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-black">近期流水</h3>
                <div className="flex gap-2">
                  <span className="font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm border-2 border-green-200">
                    收 {transactions.filter(t=>t.type==='income').length}
                  </span>
                  <span className="font-bold bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm border-2 border-red-200">
                    支 {transactions.filter(t=>t.type==='expense').length}
                  </span>
                </div>
             </div>

             <div className="space-y-4">
               {transactions.length === 0 ? (
                 <div className="text-center py-20 opacity-50 border-4 border-dashed border-slate-300 rounded-xl">
                    <div className="text-6xl mb-4">💤</div>
                    <p className="font-bold text-xl">暂无记录，开始记账吧！</p>
                 </div>
               ) : (
                 transactions.map((tx) => {
                   const isExp = tx.type === 'expense';
                   const cats = isExp ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
                   const cat = cats.find(c => c.id === tx.category) || cats[0];
                   
                   return (
                     <div key={tx.id} className="group relative">
                        {/* 卡片本体 */}
                        <div className={`relative z-10 bg-white border-4 border-black rounded-xl p-4 flex items-center justify-between transition-transform hover:-translate-y-1 hover:translate-x-1 border-b-8 ${tx.isImpulse ? 'border-r-8 border-pink-500' : ''}`}>
                          
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-lg border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${cat.color}`}>
                                {cat.icon}
                             </div>
                             <div>
                               <div className="font-bold text-lg flex items-center gap-2">
                                 {tx.description}
                                 {tx.isImpulse && <span className="text-xs bg-pink-500 text-white px-1 border border-black rounded">后悔</span>}
                                 {!isExp && <span className="text-xs bg-green-100 text-green-700 px-1 border border-green-300 rounded">收入</span>}
                               </div>
                               <div className="text-xs font-bold text-slate-400">
                                 {new Date(tx.date).toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})}
                               </div>
                             </div>
                          </div>

                          <div className="flex items-center gap-4">
                             <span className={`font-black text-xl ${isExp ? 'text-black' : 'text-green-600'}`}>
                               {isExp ? '-' : '+'}¥{tx.amount.toFixed(2)}
                             </span>
                             <button 
                               onClick={() => handleDelete(tx.id)}
                               className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-500 hover:text-white p-2 rounded border-2 border-transparent hover:border-black"
                             >
                               <Trash2 size={18} />
                             </button>
                          </div>
                        </div>
                        {/* 阴影占位 */}
                        <div className={`absolute inset-0 rounded-xl translate-x-1 translate-y-1 z-0 ${isExp ? 'bg-black' : 'bg-green-800'}`}></div>
                     </div>
                   );
                 })
               )}
             </div>
          </div>

        </div>
      </div>
      
      {/* CSS 动画定义 */}
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