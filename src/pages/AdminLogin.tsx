import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { adminLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Verifying Admin Access...');
    try {
      await adminLogin({ email, password });
      toast.success('Admin access granted', { id: toastId });
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Access Denied', { id: toastId });
      } else {
        toast.error('Failed to login', { id: toastId });
      }
    }
  };

  return (
    <div className="bg-[#0a2e1e] font-display min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-2xl overflow-hidden relative">
        <div className="h-1.5 w-full bg-[#D4AF37]"></div>
        <div className="px-10 py-12 flex flex-col items-center">

          <div className="mb-8 flex flex-col items-center">
            <img src={logo} alt="SalesPro Logo" className="h-16 w-auto object-contain mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-1">Secure Access</span>
            <h1 className="text-[#0a2e1e] tracking-tight text-xl font-black uppercase">Super Admin Dashboard</h1>
          </div>

          <form className="w-full space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Admin Identity</label>
              <input
                className="w-full bg-[#f8f9f8] border border-gray-200 text-gray-900 rounded-lg p-3 text-sm font-bold focus:outline-none focus:border-[#0a2e1e] focus:ring-1 focus:ring-[#0a2e1e] transition-all placeholder:text-gray-300 placeholder:font-medium"
                placeholder="admin@company.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Secure Key</label>
              <div className="relative">
                <input
                  className="w-full bg-[#f8f9f8] border border-gray-200 text-gray-900 rounded-lg p-3 pr-10 text-sm font-bold focus:outline-none focus:border-[#0a2e1e] focus:ring-1 focus:ring-[#0a2e1e] transition-all placeholder:text-gray-300 placeholder:font-medium"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0a2e1e] transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              disabled={isLoading}
              className="w-full mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-full h-11 bg-[#0a2e1e] text-white text-[11px] font-black uppercase tracking-[0.15em] hover:bg-[#113d2a] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
              type="submit"
            >
              {isLoading ? (
                <div className="size-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Enter System</span>
                  <span className="material-symbols-outlined text-sm text-[#D4AF37]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <a href="/" className="text-gray-400 hover:text-[#0a2e1e] text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 group">
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_left_alt</span>
              Return to Staff Portal
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
