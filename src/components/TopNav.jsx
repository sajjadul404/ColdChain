import React, { useState } from 'react';
import { Search, Bell, ChevronDown, CheckCircle2, User, Shield, Stethoscope, LogOut } from 'lucide-react';

export const TopNav = ({
  searchQuery,
  onSearchChange,
  currentRole,
  onChangeRole,
  onLogout,
  unreadCount = 2,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const roleLabels = {
    admin: { label: 'Admin', icon: Shield, color: 'text-indigo-600' },
    pharmacist: { label: 'Pharmacist', icon: Stethoscope, color: 'text-sky-600' },
    inspector: { label: 'Inspector', icon: CheckCircle2, color: 'text-emerald-600' },
  };

  const currentRoleMeta = roleLabels[currentRole] || roleLabels.admin;

  return (
    <header className="h-18 px-8 flex items-center justify-between border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-30">
      {/* Search Bar matching screenshot */}
      <div className="relative w-96">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Right controls: Notifications & User profile */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationModal(!showNotificationModal)}
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="System Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {showNotificationModal && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                  {unreadCount} New
                </span>
              </div>
              <div className="mt-3 space-y-2.5">
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-900">System Telemetry Optimal</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Fridge A temperature stable at 2.5°C within 2°C - 8°C range.</p>
                    <span className="text-[10px] text-emerald-600 font-mono mt-1 block">10 mins ago</span>
                  </div>
                </div>
                <div className="p-2.5 bg-sky-50/70 border border-sky-100 rounded-xl flex items-start gap-3">
                  <Shield className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-sky-900">Cryptographic Integrity Pass</p>
                    <p className="text-[11px] text-sky-700 mt-0.5">Tamper-evident hash ledger verified with 0 invalid records.</p>
                    <span className="text-[10px] text-sky-600 font-mono mt-1 block">35 mins ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center font-semibold text-xs shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-800 capitalize">{currentRoleMeta.label}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Role Dropdown */}
          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Switch Active Role
              </div>
              {['admin', 'pharmacist', 'inspector'].map((role) => {
                const Icon = roleLabels[role].icon;
                const isSelected = currentRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => {
                      onChangeRole(role);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isSelected ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${roleLabels[role].color}`} />
                      <span className="capitalize">{roleLabels[role].label}</span>
                    </div>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                  </button>
                );
              })}
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => {
                  setShowRoleDropdown(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
