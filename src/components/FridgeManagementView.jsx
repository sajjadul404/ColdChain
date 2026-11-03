import React, { useState } from 'react';
import { Thermometer, Plus, CheckCircle2, Wrench } from 'lucide-react';

export const FridgeManagementView = ({
  fridges,
  onAddFridge,
  onUpdateFridgeTemp,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(2500);
  const [location, setLocation] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [targetTemp, setTargetTemp] = useState('2°C - 8°C');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name) return;
    onAddFridge({
      name,
      temperature: 3.0,
      targetTemp,
      doorStatus: 'Closed',
      powerStatus: 'On',
      compressorStatus: 'Running',
      capacity: Number(capacity),
      usedDoses: 0,
      modelNumber: modelNumber || 'WHO PQS Certified Ultra-Safe Cold Chest',
      location: location || 'Storage Wing Alpha',
      lastMaintenance: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    });
    setName('');
    setLocation('');
    setModelNumber('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Fridge Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Refrigeration equipment configuration, hardware calibration & solar direct-drive monitoring
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5046e5] hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Refrigerator</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {fridges.map((fridge) => {
          const usagePercent = Math.round((fridge.usedDoses / fridge.capacity) * 100);
          return (
            <div
              key={fridge.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-indigo-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Thermometer className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{fridge.name}</h3>
                      <span className="text-[11px] text-slate-400 block">{fridge.targetTemp}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Online
                  </span>
                </div>

                <div className="py-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Live Temperature</span>
                    <span className="font-mono text-base font-extrabold text-slate-900">
                      {fridge.temperature.toFixed(1)}°C
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Door / Power Status</span>
                    <span className="font-medium text-slate-800">
                      {fridge.doorStatus} · {fridge.powerStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Hardware Model</span>
                    <span className="font-mono text-[11px] text-slate-600 truncate max-w-[150px]">
                      {fridge.modelNumber || 'PQS E003'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Location</span>
                    <span className="text-[11px] text-slate-600 truncate max-w-[150px]">
                      {fridge.location || 'Central Ward'}
                    </span>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                      <span>Dose Capacity Used</span>
                      <span className="font-mono">{usagePercent}% ({fridge.usedDoses}/{fridge.capacity})</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, usagePercent)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-[11px]">
                  <Wrench className="w-3 h-3 text-slate-400" />
                  Maint: {fridge.lastMaintenance || 'Recent'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateFridgeTemp(fridge.id, Number((fridge.temperature - 0.2).toFixed(1)))}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono text-[11px]"
                    title="Lower temp by 0.2°C"
                  >
                    -0.2°
                  </button>
                  <button
                    onClick={() => onUpdateFridgeTemp(fridge.id, Number((fridge.temperature + 0.2).toFixed(1)))}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono text-[11px]"
                    title="Raise temp by 0.2°C"
                  >
                    +0.2°
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Register Cold Chain Unit
            </h3>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fridge Unit Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Fridge D (Outreach Cooler)"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Total Capacity (Doses)</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Hardware Model & Spec</label>
                <input
                  type="text"
                  value={modelNumber}
                  onChange={(e) => setModelNumber(e.target.value)}
                  placeholder="e.g. B Medical Systems TCW40SDD"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Physical Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Sub-District Mobile Clinic"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5046e5] hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20"
                >
                  Commission Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
