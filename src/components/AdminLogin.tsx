import React, { useState, useEffect } from 'react';
import { ShieldAlert, User, KeyRound, Lock } from 'lucide-react';
import { AdminRole } from '../types';
import { motion } from 'motion/react';

interface AdminLoginProps {
  onLogin: (role: AdminRole) => void;
}

const ROLES: { name: AdminRole; hash: string }[] = [
  { name: 'Mukesh Panwar', hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4' }, // 1234
  { name: 'Mayank Panwar', hash: '0079a490d16c52bbcb14a68778ce35817a151b753b8796db3ad6929f27329524' }, // 5678
  { name: 'Others', hash: '9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0' }, // 0000
];

async function hashPin(pin: string) {
  const msgBuffer = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [selectedRole, setSelectedRole] = useState<AdminRole>('Mukesh Panwar');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLocked) {
      timer = setTimeout(() => {
        setIsLocked(false);
        setAttempts(0);
        setError('');
      }, 30000);
    }
    return () => clearTimeout(timer);
  }, [isLocked]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const roleConfig = ROLES.find(r => r.name === selectedRole);
    if (!roleConfig) return;

    const inputHash = await hashPin(pin);
    
    if (roleConfig.hash === inputHash) {
      setError('');
      setIsSuccess(true);
      setAttempts(0);
      setTimeout(() => {
        onLogin(selectedRole);
      }, 1500);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setIsLocked(true);
        setError('Too many failed attempts. Try again in 30 seconds.');
      } else {
        setError(`Incorrect PIN. ${5 - newAttempts} attempts remaining.`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f9] dark:bg-deep-black flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Background aesthetics */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-royal-purple/20 via-transparent to-transparent opacity-60" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-divine-gold/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-royal-purple/10 rounded-full blur-[100px]" />
      </div>

      <div className="bg-white dark:bg-[#121212] p-8 md:p-12 rounded-3xl shadow-2xl max-w-md w-full border border-royal-purple/10 dark:border-white/5 relative z-10 backdrop-blur-sm transition-colors duration-500 overflow-hidden">
        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-10"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <User className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-serif text-royal-purple dark:text-gold-light mb-2 text-center">Welcome Back!</h2>
            <p className="text-lg font-sans text-gray-600 dark:text-gray-300 font-semibold">{selectedRole}</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-royal-purple to-deep-purple rounded-2xl flex items-center justify-center shadow-lg shadow-royal-purple/30 transform rotate-3">
                <ShieldAlert className="w-10 h-10 text-divine-gold transform -rotate-3" />
              </div>
            </div>
            
            <h1 className="text-3xl font-serif text-center text-royal-purple dark:text-gold-light mb-2">Admin Portal</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8 font-sans font-light">Secure access for authorized personnel only.</p>
            
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-2 ml-1">
                  <User size={14} /> Select User
                </label>
                <div className="relative">
                  <select 
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
                    disabled={isLocked}
                    className="w-full pl-4 pr-10 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl appearance-none focus:outline-none focus:border-royal-purple dark:focus:border-gold-light focus:ring-1 focus:ring-royal-purple dark:focus:ring-gold-light transition-all font-sans text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ROLES.map(role => (
                      <option key={role.name} value={role.name} className="dark:bg-[#121212]">{role.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* PIN Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-2 ml-1">
                  <KeyRound size={14} /> Security PIN
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    maxLength={4}
                    disabled={isLocked}
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-royal-purple dark:focus:border-gold-light focus:ring-1 focus:ring-royal-purple dark:focus:ring-gold-light transition-all font-sans tracking-widest text-lg text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1.5 ml-1 font-medium"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <button 
                type="submit"
                disabled={isLocked}
                className="w-full bg-royal-purple dark:bg-gold-light text-white dark:text-royal-purple font-serif font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity mt-2 shadow-lg shadow-royal-purple/20 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-700"
              >
                {isLocked ? <><Lock size={18} /> Locked</> : 'Access Portal'}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
