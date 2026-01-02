import {
  Coffee,
  ShoppingBag,
  Car,
  Home,
  Zap,
  CreditCard,
  Briefcase,
  TrendingUp,
  Gift,
  Smile
} from 'lucide-react';

export const EXPENSE_CATEGORIES = [
  { id: 'food', name: '餐饮', icon: <Coffee size={20} />, color: 'bg-orange-400' },
  { id: 'shopping', name: '购物', icon: <ShoppingBag size={20} />, color: 'bg-pink-400' },
  { id: 'transport', name: '交通', icon: <Car size={20} />, color: 'bg-blue-400' },
  { id: 'housing', name: '居住', icon: <Home size={20} />, color: 'bg-purple-400' },
  { id: 'entertainment', name: '娱乐', icon: <Zap size={20} />, color: 'bg-yellow-400' },
  { id: 'repayment', name: '还款', icon: <CreditCard size={20} />, color: 'bg-red-400' }
];

export const INCOME_CATEGORIES = [
  { id: 'salary', name: '薪资', icon: <Briefcase size={20} />, color: 'bg-green-400' },
  { id: 'bonus', name: '奖金', icon: <Zap size={20} />, color: 'bg-yellow-400' },
  { id: 'investment', name: '理财', icon: <TrendingUp size={20} />, color: 'bg-cyan-400' },
  { id: 'gift', name: '红包', icon: <Gift size={20} />, color: 'bg-pink-400' },
  { id: 'other', name: '其他', icon: <Smile size={20} />, color: 'bg-gray-300' }
];
