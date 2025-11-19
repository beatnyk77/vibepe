import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, CreditCard, Smartphone, Loader2, CheckCircle2, Globe } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  price: number;
  currency: string;
  productName: string;
}

type Provider = 'Cashfree' | 'LemonSqueezy' | null;
type PaymentStatus = 'idle' | 'processing' | 'success';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  username,
  price,
  currency,
  productName
}) => {
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>(null);
  const [status, setStatus] = useState<PaymentStatus>('idle');

  // 1. Simulate Script Load & Geo-IP Detection
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setStatus('idle');
      
      // Simulate network request to Vibepe Edge / IPAPI
      const detectLocation = async () => {
        try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          const detectedCountry = data.country_code || 'US';
          
          setCountry(detectedCountry);
          
          // Vibepe Routing Logic
          // India -> Cashfree (Low fees, UPI)
          // Global -> Lemon Squeezy (Merchant of Record, Tax handling)
          if (detectedCountry === 'IN') {
            setProvider('Cashfree');
          } else {
            setProvider('LemonSqueezy');
          }
        } catch (error) {
          // Fallback to Global if IP check fails
          setProvider('LemonSqueezy');
          setCountry('US');
        } finally {
          setLoading(false);
        }
      };

      detectLocation();
    }
  }, [isOpen]);

  const handlePayment = () => {
    setStatus('processing');
    
    // Simulate Provider Latency
    setTimeout(() => {
      setStatus('success');
      
      // Success Confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999
      });

      // Auto-close after success
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 3000);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm">
                  V
                </div>
                <span className="font-medium text-gray-900">Pay @{username}</span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {loading ? (
                <div className="h-48 flex flex-col items-center justify-center gap-3 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-black" />
                  <p className="text-sm">Optimizing route...</p>
                </div>
              ) : status === 'success' ? (
                <div className="h-48 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Payment Successful</h3>
                    <p className="text-sm text-gray-500 mt-1">Receipt sent to your email.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Product Info */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{productName}</h3>
                      <p className="text-sm text-gray-500 mt-1">One-time secure payment</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold tracking-tight">
                        {currency === 'USD' ? '$' : '₹'}{price}
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mt-1 flex items-center justify-end gap-1">
                        <Globe className="w-3 h-3" />
                        {country} Detected
                      </div>
                    </div>
                  </div>

                  {/* Provider Badge */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-3 text-sm">
                     <div className={`w-2 h-2 rounded-full ${provider === 'Cashfree' ? 'bg-orange-500' : 'bg-purple-500'}`} />
                     <span className="text-gray-600">
                       Routing via <span className="font-semibold text-black">{provider}</span>
                       {provider === 'Cashfree' ? ' (UPI/Netbanking)' : ' (Cards/Apple Pay)'}
                     </span>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={handlePayment}
                    disabled={status === 'processing'}
                    className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                  >
                    {status === 'processing' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Pay {currency === 'USD' ? '$' : '₹'}{price}
                      </>
                    )}
                  </button>
                  
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" />
                      Encrypted by Vibepe. 
                      <span className="hidden sm:inline">We do not store card details.</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
