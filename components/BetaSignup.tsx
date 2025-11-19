import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Loader2, Check, X, ArrowRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
// Note: In a production Next.js app, move these to .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

type AvailabilityStatus = 'idle' | 'loading' | 'available' | 'unavailable';

export const BetaSignup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<AvailabilityStatus>('idle');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Debounce username check
  useEffect(() => {
    const checkAvailability = async () => {
      if (username.length < 3) {
        setStatus('idle');
        return;
      }
      
      setStatus('loading');
      
      try {
        // Check if we are in "demo/mock" mode (missing env vars)
        if (supabaseUrl.includes('placeholder')) {
           throw new Error('Missing Supabase Config');
        }

        // Real query: Check if username exists in 'users' table
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('username', username)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        // If data is returned, username is taken. If null, it's available.
        if (data) {
          setStatus('unavailable');
        } else {
          setStatus('available');
        }
      } catch (err) {
        // Fallback Mock Logic (for preview when Supabase isn't connected)
        console.warn("Using mock availability check (Supabase not configured).");
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network latency
        
        const mockTaken = ['elon', 'admin', 'root', 'vibepe', 'support', 'help'];
        if (mockTaken.includes(username.toLowerCase())) {
          setStatus('unavailable');
        } else {
          setStatus('available');
        }
      }
    };

    const timeoutId = setTimeout(() => {
        if(username) checkAvailability();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'available' || !email) return;

    // Simulate submission
    setIsSubmitted(true);
    fireConfetti();
  };

  const fireConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  return (
    <section id="beta" className="py-32 px-6">
      <div className="max-w-xl mx-auto text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
        >
          {!isSubmitted ? (
            <div className="space-y-8">
              <h2 className="text-4xl font-bold tracking-tight">Claim your handle.</h2>
              <p className="text-gray-500">Reserve your unique Vibepe username before the public launch.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4 text-left bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm">
                {/* Username Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    vibepe.com/pay/
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                      placeholder="username"
                      className={`w-full p-4 pr-12 bg-white border rounded-xl outline-none transition-all font-medium
                        ${status === 'unavailable' ? 'border-red-300 focus:border-red-500 text-red-900' : 
                          status === 'available' ? 'border-green-300 focus:border-green-500 text-black' : 
                          'border-gray-200 focus:border-black text-black'}`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {status === 'loading' && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                      {status === 'available' && <Check className="w-5 h-5 text-green-500" />}
                      {status === 'unavailable' && <X className="w-5 h-5 text-red-500" />}
                    </div>
                  </div>
                  {status === 'unavailable' && <p className="text-red-500 text-xs mt-2 ml-1">Username taken.</p>}
                  {status === 'available' && <p className="text-green-600 text-xs mt-2 ml-1">Available! Grab it.</p>}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@startup.com"
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:border-black transition-all font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status !== 'available' || !email}
                  className="w-full mt-4 bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Claim @{username || 'username'} <ArrowRight className="w-4 h-4" />
                </button>
                
                <p className="text-xs text-center text-gray-400 mt-4">
                  By clicking Claim, you agree to wait for the invite code via email.
                </p>
              </form>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 bg-green-50 rounded-3xl border border-green-100"
            >
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">You're on the list!</h3>
              <p className="text-gray-600">We've reserved <span className="font-bold text-black">@{username}</span> for you.</p>
              <p className="text-sm text-gray-500 mt-4">Check your email for next steps.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};