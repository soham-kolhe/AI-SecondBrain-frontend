import React from "react";

const Navbar = ({
  user,
  onLoginClick,
  onLogout,
}) => {
  return (
    // 'flex justify-between items-center' ensures Left and Right sections are perfectly aligned
    <nav className="px-8 py-4 border-b border-slate-800 bg-[#0B0F1A] z-20 shadow-2xl flex justify-between items-center">
      {/* 🟢 LEFT SECTION: Logo */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-cyan-500 rounded flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.4)]">
          <span className="text-black font-black text-[10px]">AI</span>
        </div>
        <h1 className="text-sm font-bold tracking-widest text-slate-100 uppercase">
          Second Brain
        </h1>
      </div>

      {/* 🔵 RIGHT SECTION: Auth */}
      <div className="flex items-center gap-6">
        {/* 2. Authentication (Top Right Corner) */}
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                {/* Fallback to user.name if user.user.name is not structured that way */}
                <p className="text-[10px] font-black text-slate-100 uppercase leading-none">
                  {user.user?.name || user.name}
                </p>
                <p className="text-[8px] text-cyan-500 font-bold uppercase mt-1 tracking-widest">
                  Pro Member
                </p>
              </div>
              <button
                onClick={onLogout}
                className="bg-slate-800 text-slate-400 px-3 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all text-[10px] font-bold uppercase tracking-wider"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-500 transition-all border border-slate-800 px-5 py-2 rounded-xl hover:bg-slate-800"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
