import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar.jsx';
import { TopNav } from './components/TopNav.jsx';
import { LiveDashboard } from './components/LiveDashboard.jsx';
import { InventoryView } from './components/InventoryView.jsx';
import { QRCheckView } from './components/QRCheckView.jsx';
import { DeviceSecurityView } from './components/DeviceSecurityView.jsx';
import { TamperEvidentLogsView } from './components/TamperEvidentLogsView.jsx';
import { SettingsView } from './components/SettingsView.jsx';
import { LoginView } from './components/LoginView.jsx';
import { UserManagementView } from './components/UserManagementView.jsx';
import { BatchManagementView } from './components/BatchManagementView.jsx';
import { TransfersView } from './components/TransfersView.jsx';
import { TemperatureView } from './components/TemperatureView.jsx';
import { ReportsView } from './components/ReportsView.jsx';
import { AddVaccineModal } from './components/AddVaccineModal.jsx';
import { 
  INITIAL_VACCINES, 
  INITIAL_LOGS, 
  INITIAL_FRIDGES, 
  INITIAL_TEMPERATURE_TREND,
  INITIAL_USERS,
  INITIAL_TRANSFERS,
  INITIAL_REPORTS,
} from './data/mockData.js';
import { sha256 } from './utils/crypto.js';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  Boxes, 
  Package, 
  QrCode, 
  ArrowLeftRight, 
  Activity, 
  Thermometer, 
  FileCheck 
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentRole, setCurrentRole] = useState('admin');
  const [currentUser, setCurrentUser] = useState({
    name: 'Dr. Sarah Connor',
    email: 'admin@coldchain.health',
  });

  const [currentTab, setCurrentTab] = useState('admin-dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [vaccines, setVaccines] = useState(INITIAL_VACCINES);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [fridges, setFridges] = useState(INITIAL_FRIDGES);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [transfers, setTransfers] = useState(INITIAL_TRANSFERS);
  const [reports, setReports] = useState(INITIAL_REPORTS);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [selectedVaccineForQr, setSelectedVaccineForQr] = useState(undefined);

  const appendAuditLog = async (action, details) => {
    const prevLog = logs[0];
    const prevHash = prevLog ? prevLog.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const now = new Date();
    const dateTime =
      now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' +
      now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const newHash = await sha256(`${prevHash}:${action}:${currentRole}:${details}:${dateTime}`);

    const newLogEntry = {
      id: `log-${Date.now()}`,
      dateTime,
      action,
      performedBy: currentRole,
      details,
      hashStatus: 'Valid',
      prevHash,
      currentHash: newHash,
    };

    setLogs((prev) => [newLogEntry, ...prev]);
  };

  const handleSaveVaccine = async (vaccineData, editId) => {
    if (editId) {
      setVaccines((prev) =>
        prev.map((v) => (v.id === editId ? { ...v, ...vaccineData } : v))
      );
      await appendAuditLog('Update Inventory', `Updated batch ${vaccineData.batchNumber} info`);
    } else {
      const newVac = {
        ...vaccineData,
        id: `vac-${Date.now()}`,
      };
      setVaccines((prev) => [newVac, ...prev]);
      await appendAuditLog('Batch Receipt', `Registered ${newVac.quantity} doses ${newVac.batchNumber} in ${newVac.fridge}`);
    }
  };

  const handleMoveVaccine = async (vaccineId, from, to) => {
    setVaccines((prev) =>
      prev.map((v) => (v.id === vaccineId ? { ...v, fridge: to } : v))
    );
    const vac = vaccines.find((v) => v.id === vaccineId);
    
    const newTransfer = {
      id: `tr-${Date.now()}`,
      vaccineName: vac?.name || 'Vaccine',
      batchNumber: vac?.batchNumber || 'BATCH',
      quantity: vac?.quantity || 250,
      fromFridge: from,
      toFridge: to,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      authorizedBy: currentRole,
      status: 'Completed',
    };
    setTransfers((prev) => [newTransfer, ...prev]);

    await appendAuditLog('Transfer Vaccine', `Moved ${vac?.name || 'vaccine'} from ${from} to ${to}`);
  };

  const handleExecuteTransfer = async (vaccineId, fromFridge, toFridge, quantity) => {
    const vac = vaccines.find((v) => v.id === vaccineId);
    if (!vac) return;

    setVaccines((prev) =>
      prev.map((v) => (v.id === vaccineId ? { ...v, fridge: toFridge } : v))
    );

    const newTransfer = {
      id: `tr-${Date.now()}`,
      vaccineName: vac.name,
      batchNumber: vac.batchNumber,
      quantity,
      fromFridge,
      toFridge,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      authorizedBy: currentRole,
      status: 'Completed',
    };
    setTransfers((prev) => [newTransfer, ...prev]);

    await appendAuditLog('Transfer Vaccine', `Authorized dispatch of ${quantity} doses ${vac.name} to ${toFridge}`);
  };

  const handleAddUser = async (user) => {
    const newUser = {
      ...user,
      id: `usr-${Date.now()}`,
      lastLogin: 'Pending First Sign-in',
    };
    setUsers((prev) => [newUser, ...prev]);
    await appendAuditLog('Provision User', `Admin created ${newUser.role} account for ${newUser.name}`);
  };

  const handleToggleUserStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' }
          : u
      )
    );
  };

  const handleChangeUserRole = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleGenerateReport = async (report) => {
    const newRep = {
      ...report,
      id: `rep-${Date.now().toString().slice(-4)}`,
    };
    setReports((prev) => [newRep, ...prev]);
    await appendAuditLog('Generate Inspection Report', `Inspector signed report ${newRep.id}: ${newRep.complianceScore}% Score`);
  };

  const handleTamperSimulate = (logId) => {
    setLogs((prev) =>
      prev.map((l) =>
        l.id === logId
          ? {
              ...l,
              details: l.details + ' [TAMPERED RECORD]',
              hashStatus: 'Tampered',
            }
          : l
      )
    );
  };

  const handleRestoreLogs = () => {
    setLogs(INITIAL_LOGS);
  };

  const handleRoleChange = (role) => {
    setCurrentRole(role);
    if (role === 'admin') setCurrentTab('admin-dashboard');
    else if (role === 'pharmacist') setCurrentTab('pharmacist-dashboard');
    else if (role === 'inspector') setCurrentTab('inspector-dashboard');
  };

  const handleLoginSuccess = async (email, role, name) => {
    setCurrentRole(role);
    setCurrentUser({
      name: name || (role === 'admin' ? 'Dr. Sarah Connor' : role === 'pharmacist' ? 'Marcus Vance, PharmD' : 'Elena Rostova'),
      email,
    });
    setIsAuthenticated(true);
    handleRoleChange(role);
    await appendAuditLog('Login', `${role} logged in (${email})`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const getMobileBottomNav = () => {
    switch (currentRole) {
      case 'admin':
        return [
          { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'user-mgmt', label: 'Users', icon: Users },
          { id: 'system-logs', label: 'Logs', icon: FileText },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'pharmacist':
        return [
          { id: 'pharmacist-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'inventory', label: 'Stock', icon: Boxes },
          { id: 'batch-mgmt', label: 'Batches', icon: Package },
          { id: 'qr-codes', label: 'QR', icon: QrCode },
          { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
        ];
      case 'inspector':
        return [
          { id: 'inspector-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'monitoring', label: 'Monitor', icon: Activity },
          { id: 'temperature', label: 'Temp', icon: Thermometer },
          { id: 'reports', label: 'Reports', icon: FileCheck },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col antialiased">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentRole={currentRole}
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onLogout={handleLogout}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopNav
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentRole={currentRole}
            onChangeRole={handleRoleChange}
            onLogout={handleLogout}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
            {/* ADMIN BRANCH */}
            {currentTab === 'admin-dashboard' && (
              <LiveDashboard
                fridges={fridges}
                temperatureTrend={INITIAL_TEMPERATURE_TREND}
              />
            )}

            {currentTab === 'user-mgmt' && (
              <UserManagementView
                users={users}
                onAddUser={handleAddUser}
                onToggleStatus={handleToggleUserStatus}
                onChangeUserRole={handleChangeUserRole}
              />
            )}


            {currentTab === 'system-logs' && (
              <TamperEvidentLogsView
                logs={logs}
                searchQuery={searchQuery}
                onTamperSimulate={handleTamperSimulate}
                onRestoreLogs={handleRestoreLogs}
              />
            )}

            {currentTab === 'settings' && <SettingsView />}

            {/* PHARMACIST BRANCH */}
            {currentTab === 'pharmacist-dashboard' && (
              <LiveDashboard
                fridges={fridges}
                temperatureTrend={INITIAL_TEMPERATURE_TREND}
              />
            )}

            {currentTab === 'inventory' && (
              <InventoryView
                vaccines={vaccines}
                fridges={fridges}
                searchQuery={searchQuery}
                onAddVaccine={() => {
                  setEditingVaccine(null);
                  setIsAddModalOpen(true);
                }}
                onEditVaccine={(vac) => {
                  setEditingVaccine(vac);
                  setIsAddModalOpen(true);
                }}
                onMoveVaccine={handleMoveVaccine}
                onSelectForQrCheck={(vac) => {
                  setSelectedVaccineForQr(vac.id);
                  setCurrentTab('qr-codes');
                }}
              />
            )}

            {currentTab === 'batch-mgmt' && (
              <BatchManagementView
                vaccines={vaccines}
                onAddBatch={() => {
                  setEditingVaccine(null);
                  setIsAddModalOpen(true);
                }}
                onSelectForQr={(vac) => {
                  setSelectedVaccineForQr(vac.id);
                  setCurrentTab('qr-codes');
                }}
              />
            )}

            {currentTab === 'qr-codes' && (
              <QRCheckView
                vaccines={vaccines}
                selectedVaccineId={selectedVaccineForQr}
                onNavigateHome={() => setCurrentTab('pharmacist-dashboard')}
              />
            )}

            {currentTab === 'transfers' && (
              <TransfersView
                vaccines={vaccines}
                fridges={fridges}
                transfers={transfers}
                onExecuteTransfer={handleExecuteTransfer}
              />
            )}

            {/* INSPECTOR BRANCH */}
            {currentTab === 'inspector-dashboard' && (
              <LiveDashboard
                fridges={fridges}
                temperatureTrend={INITIAL_TEMPERATURE_TREND}
              />
            )}

            {currentTab === 'monitoring' && (
              <LiveDashboard
                fridges={fridges}
                temperatureTrend={INITIAL_TEMPERATURE_TREND}
              />
            )}

            {currentTab === 'temperature' && (
              <TemperatureView
                fridges={fridges}
                trend={INITIAL_TEMPERATURE_TREND}
              />
            )}

            {currentTab === 'device-logs' && <DeviceSecurityView />}

            {currentTab === 'reports' && (
              <ReportsView
                reports={reports}
                onGenerateNewReport={handleGenerateReport}
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-30 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        aria-label="Mobile Bottom Navigation"
      >
        {getMobileBottomNav().map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-indigo-50' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <AddVaccineModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingVaccine(null);
        }}
        onSave={handleSaveVaccine}
        editVaccine={editingVaccine}
        fridges={fridges}
      />
    </div>
  );
}
