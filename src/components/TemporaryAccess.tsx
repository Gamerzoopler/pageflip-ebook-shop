
import { useState, useEffect } from 'react';
import { Clock, Sparkles } from 'lucide-react';

interface TemporaryAccessProps {
  children: React.ReactNode;
  onAccessExpired: () => void;
}

export const TemporaryAccess = ({ children, onAccessExpired }: TemporaryAccessProps) => {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          onAccessExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onAccessExpired]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <div className="fixed top-4 right-4 z-50 gradient-purple text-white px-6 py-3 rounded-lg shadow-2xl border border-purple-300/20 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 animate-pulse" />
        <div className="text-sm font-medium">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Premium Access: {formatTime(timeLeft)}</span>
          </div>
          <div className="text-xs opacity-90 mt-1">All books free during trial</div>
        </div>
      </div>
      {children}
    </div>
  );
};
