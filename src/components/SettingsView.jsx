import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Thermometer, Save, CheckCircle2 } from 'lucide-react';

export const SettingsView = () => {
  const [minTemp, setMinTemp] = useState('2.0');
  const [maxTemp, setMaxTemp] = useState('8.0');
  const [doorAlarmSec, setDoorAlarmSec] = useState('45');
  const [alertEmail, setAlertEmail] = useState('coldchain-emergency@hospital.org');
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [autoVerifyHmac, setAutoVerifyHmac] = useState(true);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Cold Chain Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure sensor limits, automated alerts, and cryptographic parameters
        </p>
      </div>

      {savedFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System configuration parameters saved and synced across IoT gateways.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
            <Thermometer className="w-4 h-4 text-indigo-600" />
            <span>Temperature Thresholds (WHO PQS Standard)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Lower Limit Alert (°C)
              </label>
              <input
                type="text"
                value={minTemp}
                onChange={(e) => setMinTemp(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Freezing damage threshold (&lt;2°C)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Upper Limit Alert (°C)
              </label>
              <input
                type="text"
                value={maxTemp}
                onChange={(e) => setMaxTemp(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Thermal degradation threshold (&gt;8°C)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Sensor Cryptography & Gateway Policy</span>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Enforce HMAC-SHA256 on All Inbound Telemetry
                </span>
                <span className="text-[11px] text-slate-400">
                  Reject sensor packets lacking verifiable hardware signature
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoVerifyHmac}
                onChange={(e) => setAutoVerifyHmac(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  SMS Emergency Broadcast for Temperature Excursion
                </span>
                <span className="text-[11px] text-slate-400">
                  Instantly dispatch alert SMS to on-call duty pharmacist
                </span>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
            <Bell className="w-4 h-4 text-indigo-600" />
            <span>Emergency Contact Routing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Emergency Alert Email
              </label>
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Door Open Audio Alarm Delay (Seconds)
              </label>
              <input
                type="number"
                value={doorAlarmSec}
                onChange={(e) => setDoorAlarmSec(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#5046e5] hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
