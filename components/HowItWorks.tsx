import React from 'react';
import { motion } from 'framer-motion';
import { AtSign, Code2, Wallet } from 'lucide-react';

const steps = [
  {
    id: 1,
    icon: AtSign,
    title: "Claim Username",
    desc: "Secure your unique Vibepe handle. It's your global merchant ID.",
  },
  {
    id: 2,
    icon: Code2,
    title: "Paste Script",
    desc: "Drop one line of code into your site. Works with plain HTML, React, or Next.js.",
  },
  {
    id: 3,
    icon: Wallet,
    title: "Get Paid",
    desc: "Accept cards & UPI globally. Money hits your bank in T+2 days.",
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 px-6 border-t border-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex flex-col items-start space-y-4"
            >
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mb-2">
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight">
                {index + 1}. {step.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};