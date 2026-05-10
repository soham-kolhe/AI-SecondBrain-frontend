import React, { useState } from 'react';
import api from '../../api/axiosConfig';

const AuthModal = ({ isOpen, onClose, isLoginView, setIsLoginView, setUser }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLoginView ? '/auth/login' : '/auth/signup';
    try {
      const res = await api.post(endpoint, formData);
      if (isLoginView) {
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        onClose();
      } else {
        alert("Account created! Please login.");
        setIsLoginView(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Auth Error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-[400px] bg-[#0F172A] border border-slate-800 p-8 rounded-[32px] shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white">×</button>
        
        <h2 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase">
          {isLoginView ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-[10px] text-slate-500 font-bold mb-8 uppercase tracking-widest">
          {isLoginView ? 'Login to access your permanent brain' : 'Join to start building your memory'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
            <input 
              type="text" placeholder="FULL NAME" 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          )}
          <input 
            type="email" placeholder="EMAIL ADDRESS" 
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="PASSWORD" 
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          
          <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all mt-4">
            {isLoginView ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-[11px] text-slate-500">
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLoginView(!isLoginView)} 
            className="text-cyan-500 font-bold hover:underline"
          >
            {isLoginView ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;