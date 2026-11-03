import React, { useState } from 'react';
import { CheckCircle2, Search, Plus } from 'lucide-react';

export const BatchManagementView = ({
  vaccines,
  onAddBatch,
  onSelectForQr,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBatches = vaccines.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.manufacturer && v.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Batch Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Pharmaceutical batch intake, lot traceability, cold-chain bounds & expiration control
          </p>
        </div>

        <button
          onClick={onAddBatch}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5046e5] hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Intake New Batch</span>
        </button>
      </div>

      <div className="max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search lot number, manufacturer, or vaccine name..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map((batch) => (
          <div
            key={batch.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-indigo-300 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600 px-2.5 py-0.5 bg-indigo-50 rounded-lg inline-block mb-1.5">
                    {batch.batchNumber}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{batch.name}</h3>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1 border border-emerald-200 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Optimal
                </span>
              </div>

              <div className="py-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Manufacturer</span>
                  <span className="font-medium text-slate-800">{batch.manufacturer || 'Certified WHO Lab'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Dose Volume / Format</span>
                  <span className="font-mono text-slate-700">{batch.vialSize || 'Standard 10-dose vial'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Current Stock</span>
                  <span className="font-mono font-bold text-slate-900">{batch.quantity.toLocaleString()} doses</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Expiry Date</span>
                  <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {batch.expiryDate}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Storage Unit</span>
                  <span className="font-semibold text-slate-800">{batch.fridge} ({batch.minTemp}°C to {batch.maxTemp}°C)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                Mfg: {batch.manufactureDate || 'Recent Batch'}
              </span>
              <button
                onClick={() => onSelectForQr(batch)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Inspect QR Pass &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
