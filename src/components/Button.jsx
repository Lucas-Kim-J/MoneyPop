export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false
}) {
  const colors = {
    primary: 'bg-yellow-400 hover:bg-yellow-300 text-black',
    success: 'bg-green-400 hover:bg-green-300 text-black',
    danger: 'bg-pink-500 hover:bg-pink-400 text-white',
    neutral: 'bg-white hover:bg-gray-100 text-black',
    black: 'bg-black text-white hover:bg-gray-800',
    magic: 'bg-purple-500 hover:bg-purple-400 text-white'
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
}
