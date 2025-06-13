
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const { signIn, signUp, resendConfirmation } = useAuth();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setShowResendOption(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        console.log('Submitting sign up form...');
        const { error } = await signUp(email, password, fullName);
        if (!error) {
          // Don't close modal immediately for sign up, user might need to confirm email
          resetForm();
          setShowResendOption(true);
        } else if (error.message?.includes('User already registered')) {
          setIsSignUp(false);
          setShowResendOption(true);
        }
      } else {
        console.log('Submitting sign in form...');
        const { error } = await signIn(email, password);
        if (!error) {
          onClose();
          resetForm();
        } else if (error.message?.includes('Email not confirmed')) {
          setShowResendOption(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) return;
    
    setLoading(true);
    try {
      await resendConfirmation(email);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          {isSignUp && (
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={6}
                disabled={loading}
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || (isSignUp && password !== confirmPassword)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </Button>

          {showResendOption && email && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendConfirmation}
              disabled={loading}
            >
              <Mail className="mr-2 h-4 w-4" />
              Resend Confirmation Email
            </Button>
          )}
          
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={switchMode}
            disabled={loading}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
