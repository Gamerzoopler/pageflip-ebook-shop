
import { useState, useEffect } from 'react';

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
    <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
      <div className="text-sm font-medium">
        Free Access Active: {formatTime(timeLeft)}
      </div>
      {children}
    </div>
  );
};
