import React, { useState } from 'react';
import { Radio, Lock, Mail, LogIn, Shield, UserCheck, HardDrive, Cloud } from 'lucide-react';
import { User } from '../types';
import { getEnvironmentInfo } from '../utils/envUtils';

interface LoginViewProps {
  onLoginSuccess: (user: User, token: string) => void;
  authError?: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, authError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const envInfo = getEnvironmentInfo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const deviceName = typeof window !== 'undefined' ? window.navigator.userAgent : 'Web Browser';
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, device_name: deviceName }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message || 'Invalid login credentials');
        setIsLoading(false);
        return;
      }

      onLoginSuccess(json.data.user, json.data.token);
    } catch (err) {
      setError('Network connection error. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const displayMessage = error || authError;

  return (
    <div id="login-container" className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
      <div id="login-card" className="bg-[#121212] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-inner mb-2">
            <Radio className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-black text-2xl text-white tracking-tight">PentasLirik</h1>
          <p className="text-xs text-white/40">
            Low-Latency Live Streaming Lyric Control System
          </p>
          <div className="pt-1 flex justify-center">
            <span
              id="login-env-badge"
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border ${
                envInfo.isLocal
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
              }`}
            >
              {envInfo.isLocal ? (
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>{envInfo.label} ({envInfo.hostname})</span>
            </span>
          </div>
        </div>

        {displayMessage && (
          <div id="login-error-alert" className="p-3 bg-red-900/50 border border-red-500/50 text-red-200 text-xs rounded-lg text-center font-medium">
            {displayMessage}
          </div>
        )}


        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/30 absolute left-3 top-2.5" />
              <input
                id="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@pentaslirik.local"
                className="w-full bg-[#0F0F0F] border border-white/10 focus:border-blue-500/50 text-white text-xs pl-9 pr-3 py-2.5 rounded-lg outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/30 absolute left-3 top-2.5" />
              <input
                id="login-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0F0F0F] border border-white/10 focus:border-blue-500/50 text-white text-xs pl-9 pr-3 py-2.5 rounded-lg outline-none transition"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 transition"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Signing In...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider text-center">
            Quick Demo Accounts (1-Click Fill)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-quick-admin"
              type="button"
              onClick={() => fillQuickCredentials('admin@pentaslirik.local', 'password')}
              className="flex items-center justify-center gap-1.5 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-amber-300 font-medium transition"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Demo</span>
            </button>
            <button
              id="btn-quick-operator"
              type="button"
              onClick={() => fillQuickCredentials('operator@pentaslirik.local', 'password')}
              className="flex items-center justify-center gap-1.5 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-blue-300 font-medium transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Operator Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
