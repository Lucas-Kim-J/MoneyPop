import { Star, Hexagon, Circle } from 'lucide-react';

export default function BackgroundDecor() {
  return (
    <div className="pointer-events-none" aria-hidden="true">
      <div className="fixed top-20 right-[-50px] rotate-12 opacity-50 z-0">
        <Star size={180} fill="#fde047" strokeWidth={3} className="text-black" />
      </div>
      <div className="fixed bottom-10 left-[-40px] -rotate-12 opacity-40 z-0">
        <Hexagon size={200} fill="#a5f3fc" strokeWidth={3} className="text-black" />
      </div>
      <div className="fixed top-1/2 left-1/4 -translate-x-1/2 rotate-45 opacity-20 z-0">
        <div className="text-9xl font-black text-black select-none">¥</div>
      </div>
      <div className="fixed bottom-1/4 right-10 rotate-[-15deg] opacity-60 z-0">
        <Circle size={100} fill="#fca5a5" strokeWidth={3} className="text-black" />
      </div>
    </div>
  );
}
