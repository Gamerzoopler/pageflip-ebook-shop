
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CreditCard, DollarSign } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebook: {
    id: string;
    title: string;
    price: number;
    author: string;
  };
  onSuccess: () => void;
}

export const PaymentModal = ({ isOpen, onClose, ebook, onSuccess }: PaymentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'direct'>('paypal');
  const { user } = useAuth();

  const handlePayPalPayment = async () => {
    if (!user) {
      toast.error('Please sign in to purchase');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating PayPal order for ebook:', ebook.id);
      
      // Create PayPal order
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-paypal-order', {
        body: {
          ebookId: ebook.id,
          amount: ebook.price,
          currency: 'USD'
        }
      });

      if (orderError) {
        throw new Error(orderError.message);
      }

      if (orderData?.approvalUrl) {
        // Redirect to PayPal for payment
        window.open(orderData.approvalUrl, '_blank');
        
        // Set up polling to check payment status
        const checkPaymentStatus = setInterval(async () => {
          const { data: validateData, error: validateError } = await supabase.functions.invoke('validate-purchase', {
            body: { ebookId: ebook.id }
          });

          if (validateData?.hasPurchased) {
            clearInterval(checkPaymentStatus);
            toast.success('Payment successful! You can now download the book.');
            onSuccess();
            onClose();
          }
        }, 3000);

        // Clear interval after 10 minutes
        setTimeout(() => clearInterval(checkPaymentStatus), 600000);
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectPurchase = async () => {
    if (!user) {
      toast.error('Please sign in to purchase');
      return;
    }

    setLoading(true);
    try {
      console.log('Processing direct purchase for ebook:', ebook.id);
      
      const { data, error } = await supabase.functions.invoke('process-purchase', {
        body: {
          ebookId: ebook.id,
          paymentMethod: 'direct',
          paymentDetails: {
            amount: ebook.price,
            currency: 'USD'
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        toast.success('Purchase successful! You can now download the book.');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Direct purchase error:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Book</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold">{ebook.title}</h3>
            <p className="text-sm text-gray-600">by {ebook.author}</p>
            <p className="text-lg font-bold text-green-600 mt-2">
              ${ebook.price.toFixed(2)}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Choose Payment Method:</h4>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'paypal')}
                  className="text-blue-600"
                />
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span>PayPal</span>
              </label>

              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="direct"
                  checked={paymentMethod === 'direct'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'direct')}
                  className="text-green-600"
                />
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Direct Purchase</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button
              onClick={paymentMethod === 'paypal' ? handlePayPalPayment : handleDirectPurchase}
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${ebook.price.toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
