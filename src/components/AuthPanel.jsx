import { UserCircle2 } from 'lucide-react';
import Card from './Card.jsx';
import Button from './Button.jsx';

export default function AuthPanel({
  supabaseEnabled,
  session,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onSignUp,
  onSignOut,
  isAuthLoading,
  syncState,
  lastSyncAt,
  syncError,
  className = ''
}) {
  if (!supabaseEnabled) {
    return (
      <Card color="bg-white" className={className}>
        <div className="flex items-center gap-2 font-black text-lg">
          <UserCircle2 size={20} />
          账户同步
        </div>
        <p className="mt-2 text-sm font-bold text-slate-600">
          需要配置 Supabase 环境变量才能启用登录与云端同步。
        </p>
      </Card>
    );
  }

  const syncLabel = (() => {
    if (syncState === 'syncing') return '同步中...';
    if (syncState === 'error') return '同步失败';
    if (syncState === 'success' && lastSyncAt) {
      return `已同步 ${lastSyncAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return '等待同步';
  })();

  const syncColor =
    syncState === 'error'
      ? 'bg-red-100 text-red-700 border-red-300'
      : syncState === 'syncing'
      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
      : 'bg-green-100 text-green-700 border-green-300';

  return (
    <Card color="bg-white" className={className}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-black uppercase flex items-center gap-2 bg-white border-2 border-black px-2 py-1 -rotate-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <UserCircle2 className="text-black" strokeWidth={3} />
            账户同步
          </h2>
          <span className={`text-xs font-bold px-2 py-1 rounded border-2 ${syncColor}`}>{syncLabel}</span>
        </div>

        {session ? (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-sm font-black">已登录</div>
              <div className="text-xs font-bold text-slate-600">{session.user.email}</div>
              {syncState === 'error' && syncError ? (
                <div className="text-xs font-bold text-red-600 mt-1">{syncError}</div>
              ) : null}
            </div>
            <Button onClick={onSignOut} variant="neutral" disabled={isAuthLoading}>
              退出登录
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-start">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="email"
                value={email}
                onChange={onEmailChange}
                className="w-full border-4 border-black rounded-lg p-2 font-bold"
                placeholder="邮箱"
                autoComplete="email"
              />
              <input
                type="password"
                value={password}
                onChange={onPasswordChange}
                className="w-full border-4 border-black rounded-lg p-2 font-bold"
                placeholder="密码"
                autoComplete="current-password"
              />
            </div>
            <div className="flex flex-row md:flex-col gap-2">
              <Button onClick={onSignIn} variant="black" disabled={isAuthLoading}>
                登录
              </Button>
              <Button onClick={onSignUp} variant="neutral" disabled={isAuthLoading}>
                注册
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
