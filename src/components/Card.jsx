export default function Card({ children, className = '', color = 'bg-white' }) {
  return (
    <div
      className={`border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6 transition-transform hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10 ${color} ${className}`}
    >
      {children}
    </div>
  );
}
