import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Signing in...');
    try {
      await login({ email, password });
      toast.success('Welcome back!', { id: toastId });
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to login', { id: toastId });
      } else {
        toast.error('Failed to login', { id: toastId });
      }
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[480px] bg-white dark:bg-[#1a2e21] rounded-xl shadow-xl border border-gray-100 dark:border-emerald-900/20 overflow-hidden">
          <div className="px-6 sm:px-8 pt-10 pb-12 flex flex-col">
            <div className="mb-8 flex flex-col items-center">
              <img src={logo} alt="SalesPro Logo" className="h-16 w-auto object-contain mb-6" />
              <h1 className="text-[#111813] dark:text-white tracking-light text-2xl sm:text-[32px] font-bold leading-tight text-center pb-2">Welcome Back</h1>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex flex-col">
                <label className="flex flex-col w-full">
                  <p className="text-[#111813] dark:text-emerald-50 text-base font-medium leading-normal pb-2">Email</p>
                  <input
                    className="gold-focus form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-[#111813] dark:text-white border border-[#dbe6df] dark:border-emerald-900/50 bg-white dark:bg-[#122419] h-14 placeholder:text-[#61896f] p-[15px] text-base font-normal leading-normal"
                    placeholder="e.g. name@company.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              </div>
              <div className="flex flex-col">
                <label className="flex flex-col w-full">
                  <p className="text-[#111813] dark:text-emerald-50 text-base font-medium leading-normal pb-2">Password</p>
                  <div className="flex w-full items-stretch rounded-lg">
                    <input
                      className="gold-focus form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-r-none border-r-0 text-[#111813] dark:text-white border border-[#dbe6df] dark:border-emerald-900/50 bg-white dark:bg-[#122419] h-14 placeholder:text-[#61896f] p-[15px] text-base font-normal leading-normal"
                      placeholder="Enter your password"
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="text-[#61896f] dark:text-emerald-400/70 flex border border-[#dbe6df] dark:border-emerald-900/50 bg-white dark:bg-[#122419] items-center justify-center pr-[15px] rounded-r-lg border-l-0 cursor-pointer">
                      <span className="material-symbols-outlined">visibility</span>
                    </div>
                  </div>
                </label>
              </div>
              <button
                disabled={isLoading}
                className="w-full flex cursor-pointer items-center justify-center rounded-lg h-14 px-4 bg-primary text-[#111813] text-lg font-bold leading-normal tracking-[0.015em] hover:brightness-105 transition-all shadow-lg shadow-primary/20 mt-4 disabled:opacity-50"
                type="submit"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-[#61896f] dark:text-emerald-400/50 text-xs px-4">
        <p>© {new Date().getFullYear()} Swamp Deer. All rights reserved.</p>
        {/* <div className="flex justify-center gap-4 mt-2">
          <a className="hover:text-primary" href="#">Privacy Policy</a>
          <a className="hover:text-primary" href="#">Terms of Service</a>
        </div> */}
      </footer>
    </div>
  );
};

export default Login;
