import React, { useState } from 'react';
import { 
  Snowflake, 
  Mail, 
  Lock, 
  User, 
  Crown, 
  Stethoscope, 
  ShieldCheck, 
  Building
} from 'lucide-react';

export const LoginView = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [email, setEmail] = useState('admin@coldchain.health');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Dr. Sarah Connor');
  const [department, setDepartment] = useState('Central Bio-Logistics');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const detectRoleFromEmail = (inputEmail) => {
    const lower = inputEmail.toLowerCase();
    if (lower.includes('admin')) return 'admin';
    if (lower.includes('pharm')) return 'pharmacist';
    if (lower.includes('inspect') || lower.includes('audit')) return 'inspector';
    return selectedRole;
  };

  const roleCredentials = {
    admin: {
      email: 'admin@coldchain.health',
      name: 'Dr. Sarah Connor',
      label: 'Admin',
      icon: Crown,
      bg: 'bg-[#5046e5] text-white shadow-md shadow-indigo-600/30',
      idle: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    },
    pharmacist: {
      email: 'pharmacist@coldchain.health',
      name: 'Marcus Vance, PharmD',
      label: 'Pharmacist',
      icon: Stethoscope,
      bg: 'bg-sky-500 text-white shadow-md shadow-sky-400/30',
      idle: 'bg-sky-100/70 text-sky-800 hover:bg-sky-200/70',
    },
    inspector: {
      email: 'inspector@coldchain.health',
      name: 'Elena Rostova',
      label: 'Inspector',
      icon: ShieldCheck,
      bg: 'bg-emerald-500 text-white shadow-md shadow-emerald-400/30',
      idle: 'bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200/70',
    },
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail(roleCredentials[role].email);
    setName(roleCredentials[role].name);
    setPassword('••••••••••••');
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    const detected = detectRoleFromEmail(val);
    if (detected !== selectedRole) {
      setSelectedRole(detected);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email, selectedRole, name);
    }, 400);
  };

  const currentRoleMeta = roleCredentials[selectedRole];

  return (
    <div className="min-h-screen bg-[#e8eef8] flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left Half: Illustrated Vaccine Shield Artwork Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#cde0fd] via-[#bfdbfe] to-[#93c5fd] p-8 flex flex-col items-center justify-center relative overflow-hidden select-none">
          <div className="absolute w-96 h-96 rounded-full bg-white/20 blur-2xl -top-10 -left-10 pointer-events-none"></div>
          <div className="absolute w-72 h-72 rounded-full bg-blue-300/30 blur-xl -bottom-10 -right-10 pointer-events-none"></div>

          <div className="relative w-64 h-72 flex items-center justify-center">
            <div className="absolute w-48 h-60 bg-white/70 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white/80 flex items-center justify-center">
              <div className="absolute top-10 w-12 h-12 flex items-center justify-center">
                <div className="w-4 h-12 bg-sky-400 rounded-full"></div>
                <div className="w-12 h-4 bg-sky-400 rounded-full absolute"></div>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 w-28 h-44 bg-white/95 rounded-2xl shadow-2xl border-2 border-white flex flex-col items-center overflow-hidden z-10 transform -rotate-3 hover:rotate-0 transition-transform">
              <div className="w-16 h-4 bg-slate-300 rounded-t-lg border-b border-slate-400"></div>
              <div className="w-12 h-3 bg-slate-400"></div>
              <div className="w-full flex-1 bg-gradient-to-b from-sky-50 to-sky-200 p-2 flex flex-col justify-center items-center relative">
                <div className="w-full py-1.5 bg-white/90 shadow-xs border-y border-sky-300 text-center">
                  <span className="text-[11px] font-black tracking-widest text-indigo-900 block font-mono">
                    VACCINE
                  </span>
                </div>
                <div className="absolute bottom-0 inset-x-0 h-14 bg-sky-400/30 rounded-b-xl border-t border-sky-300/50"></div>
              </div>
            </div>

            <div className="absolute bottom-2 right-2 w-40 h-14 transform -rotate-35 z-20 pointer-events-none">
              <div className="relative w-full h-full flex items-center">
                <div className="w-10 h-[2px] bg-slate-400"></div>
                <div className="w-20 h-5 bg-white/90 border-2 border-sky-300 rounded-sm shadow-lg flex items-center px-1">
                  <div className="w-14 h-2.5 bg-sky-400/50 rounded-xs"></div>
                  <div className="w-1 h-4 bg-slate-600 ml-auto"></div>
                </div>
                <div className="w-6 h-2 bg-slate-400 flex items-center justify-end">
                  <div className="w-1 h-5 bg-slate-500 rounded-xs"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center z-10">
            <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
              WHO PQS E003 Accredited
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Strict 2°C to 8°C cold-chain verification
            </p>
          </div>
        </div>

        {/* Right Half: Form + Role Selector matching mockup & diagram */}
        <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-between min-h-full">
          {/* Top Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                <Snowflake className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">ColdChain</h1>
                <p className="text-[11px] text-slate-500 font-normal">Safe Vaccines, Healthy Tomorrow.</p>
              </div>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  authMode === 'register'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Middle Centered Section: Form + Role Selector */}
          <div className="flex-1 flex flex-col justify-center py-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {authMode === 'login' ? 'Login to Continue' : 'Register New Personnel'}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {authMode === 'register' && (
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full Name & Title"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        placeholder="Email Address"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {authMode === 'register' && (
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Building className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="Department / Facility"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {authMode === 'login' && (
                    <div className="flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <span>Remember Me</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => alert('Password reset verification link sent to registered enterprise inbox.')}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-[#5046e5] hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-white inline-block"></span>
                        <span>{authMode === 'login' ? 'Login' : 'Register Account'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="md:col-span-4 space-y-3">
                <span className="block text-xs font-bold text-slate-700 text-center uppercase tracking-wider mb-1">
                  Select Role
                </span>

                {['admin', 'pharmacist', 'inspector'].map((role) => {
                  const meta = roleCredentials[role];
                  const Icon = meta.icon;
                  const isSelected = selectedRole === role;

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleSelect(role)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs ${
                        isSelected
                          ? meta.bg
                          : meta.idle
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>© 2025 ColdChain Health Systems</span>
            <span className="font-mono">Role-Based Access Control (RBAC)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
