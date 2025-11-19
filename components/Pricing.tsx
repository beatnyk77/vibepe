import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export const Pricing: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Simple pricing.</h2>
          <p className="text-xl text-gray-500">No monthly fees. No hidden costs.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Standard Plan */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm"
          >
            <h3 className="text-lg font-medium text-gray-500 mb-2">Standard</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold tracking-tight">2.9%</span>
              <span className="text-xl text-gray-400">+ ₹5</span>
            </div>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-black" /> International Cards
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-black" /> UPI Auto-detect
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-black" /> T+2 Settlements
              </li>
            </ul>
          </motion.div>

          {/* Beta Plan */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-black text-white p-8 rounded-3xl shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-white text-black text-xs font-bold px-3 py-1 rounded-bl-xl">
              FIRST 200 ONLY
            </div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">Founding Member</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold tracking-tight text-white">1.99%</span>
              <span className="text-xl text-gray-500">+ ₹0</span>
            </div>
            <ul className="space-y-4 text-gray-300">
               <li className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-white" /> Lifetime Discount
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-white" /> Priority Support
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-white" /> Early API Access
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};