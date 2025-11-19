import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Play } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

export const Hero: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const snippet = `<script src="https://vibepe.com/pay/demo-user?price=49&currency=USD"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const subtextPhrases = [
    "Collect from anywhere.",
    "T+2 in your bank.",
    "2.9% flat."
  ];

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-6 py-20 max-w-5xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-8"
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1]">
          One line. <br />
          <span className="text-gray-400">Global money.</span>
        </h1>
        
        <div className="text-xl md:text-2xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
          <p>The invisible payments layer for indie founders.</p>
          <div className="flex flex-wrap justify-center gap-x-2 md:gap-x-3 mt-1">
            {subtextPhrases.map((text, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ 
                  delay: 0.6 + (i * 0.25), 
                  duration: 0.6, 
                  ease: "easeOut" 
                }}
                className="inline-block"
              >
                {text}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Code Snippet Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="mt-12 w-full max-w-3xl mx-auto"
        >
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            {/* Snippet Box */}
            <div className="flex-grow group relative bg-gray-50 border border-gray-200 rounded-xl p-6 md:p-8 text-left shadow-sm transition-all hover:shadow-md hover:border-gray-300">
              <div className="absolute top-4 right-4">
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-500 hover:text-black"
                  aria-label="Copy snippet"
                >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <div className="font-mono text-sm md:text-base text-gray-800 break-all pr-10">
                <span className="text-purple-600">&lt;script</span> <span className="text-blue-600">src</span>=
                <span className="text-orange-600">"https://vibepe.com/pay/<span className="font-bold text-black">demo-user</span>?price=49&currency=USD"</span>
                <span className="text-purple-600">&gt;&lt;/script&gt;</span>
              </div>
            </div>

            {/* Run Demo Button */}
            <button
              onClick={() => setShowDemo(true)}
              className="flex items-center justify-center gap-2 bg-black text-white px-8 py-6 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 whitespace-nowrap"
            >
              <Play className="w-5 h-5 fill-current" />
              Test Live
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-400 font-mono">
            Simply paste this into your index.html. No backend required.
          </p>
        </motion.div>
      </motion.div>
      
      {/* Payment Demo Modal */}
      <PaymentModal 
        isOpen={showDemo}
        onClose={() => setShowDemo(false)}
        username="demo-user"
        price={49}
        currency="USD"
        productName="Vibepe Starter Kit"
      />
    </section>
  );
};