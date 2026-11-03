import React from 'react';
import { 
  Snowflake, 
  LayoutDashboard, 
  Users, 
  Thermometer, 
  FileText, 
  Settings, 
  Boxes, 
  Package, 
  QrCode, 
  ArrowLeftRight, 
  Activity, 
  ShieldCheck, 
  FileCheck, 
  LogOut,
  Crown,
  Stethoscope,
  Shield
} from 'lucide-react';

export const Sidebar = ({
  currentRole,
  currentTab,
  onSelectTab,
  onLogout,
}) => {
  // Define exact navigation items per role based on the architecture diagram
  const getNavItems = () => {
    switch (currentRole) {
      case 'admin':
        return [
          { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'user-mgmt', label: 'User Mgmt', icon: Users },
          { id: 'fridge-mgmt', label: 'Fridge Mgmt', icon: Thermometer },
          { id: 'system-logs', label: 'System Logs', icon: FileText },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'pharmacist':
        return [
          { id: 'pharmacist-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'inventory', label: 'Inventory', icon: Boxes },
          { id: 'batch-mgmt', label: 'Batch Mgmt', icon: Package },
          { id: 'qr-codes', label: 'QR Codes', icon: QrCode },
          { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
        ];
      case 'inspector':
        return [
          { id: 'inspector-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'monitoring', label: 'Monitoring', icon: Activity },
          { id: 'temperature', label: 'Temperature', icon: Thermometer },
          { id: 'device-logs', label: 'Device Logs', icon: ShieldCheck },
          { id: 'reports', label: 'Reports', icon: FileCheck },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const roleMeta = {
    admin: { label: 'Admin Console', icon: Crown, badgeColor: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30' },
    pharmacist: { label: 'Pharmacy Unit', icon: Stethoscope, badgeColor: 'bg-sky-500/20 text-sky-200 border-sky-400/30' },
    inspector: { label: 'Audit & Inspector', icon: Shield, badgeColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' },
  };

  const currentRoleInfo = roleMeta[currentRole] || roleMeta.admin;
  const RoleIcon = currentRoleInfo.icon;

  return (
    <aside className="w-64 bg-[#141b4d] text-white flex flex-col justify-between p-5 shrink-0 select-none shadow-xl border-r border-slate-800/40 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Snowflake className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">ColdChain</h1>
            <p className="text-[11px] text-slate-300 font-normal leading-none tracking-tight">Safe Vaccines, Healthy Tomorrow.</p>
          </div>
        </div>

        {/* Role Detection Tag in Sidebar */}
        <div className={`mx-1 mb-5 px-3 py-1.5 rounded-xl border flex items-center gap-2 ${currentRoleInfo.badgeColor}`}>
          <RoleIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider">{currentRoleInfo.label}</span>
        </div>

        {/* Navigation items for detected role */}
        <nav className="space-y-1.5" aria-label="Role Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-[#5046e5] text-white shadow-lg shadow-indigo-600/35 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/8'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout button at bottom of all role trees matching diagram */}
      <div className="pt-4 border-t border-slate-700/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-rose-500/20 hover:border hover:border-rose-500/30 transition-all text-left group"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-400 transition-colors" />
          <span className="group-hover:text-rose-200">Logout</span>
        </button>
      </div>
    </aside>
  );
};
