
import { BookOpen, Sparkles } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative logo-bounce">
        <BookOpen className={`${sizeClasses[size]} text-primary`} />
        <Sparkles className={`absolute -top-1 -right-1 ${size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} text-purple-400`} />
      </div>
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          PageFlip
        </span>
      )}
    </div>
  );
};
