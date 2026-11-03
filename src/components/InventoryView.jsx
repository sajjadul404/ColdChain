import React, { useState } from 'react';
import { Plus, ArrowLeftRight, Pencil, CheckCircle2 } from 'lucide-react';

export const InventoryView = ({
  vaccines,
  fridges,
  searchQuery,
  onAddVaccine,
  onEditVaccine,
  onMoveVaccine,
  onSelectForQrCheck,
}) => {
  const [selectedVaccineId, setSelectedVaccineId] = useState(vaccines[0]?.id || '');
  const [fromFridge, setFromFridge] = useState('Fridge A');
  const [toFridge, setToFridge] = useState('Fridge B');
  const [moveFeedback, setMoveFeedback] = useState(null);

  const handleVaccineSelectChange = (vacId) => {
    setSelectedVaccineId(vacId);
    const vac = vaccines.find((v) => v.id === vacId);
    if (vac) {
      setFromFridge(vac.fridge);
      const altFridge = fridges.find((f) => f.name !== vac.fridge)?.name || 'Fridge B';
      setToFridge(altFridge);
    }
  };

  const handleMoveSubmit = (e) => {
    e.preventDefault();
    if (!selectedVaccineId) return;
    if (fromFridge === toFridge) {
      setMoveFeedback('Source and destination fridges must be different.');
      setTimeout(() => setMoveFeedback(null), 3000);
      return;
    }

    onMoveVaccine(selectedVaccineId, fromFridge, toFridge);
    const vac = vaccines.find((v) => v.id === selectedVaccineId);
    setMoveFeedback(`Successfully transferred ${vac?.name || 'vaccine'} to ${toFridge}`);
    setTimeout(() => setMoveFeedback(null), 4000);
  };

  const filteredVaccines = vaccines.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.batchNumber.toLowerCase().includes(q) ||
      v.fridge.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Inventory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Cold-chain monitored vaccine batches & allocation
          </p>
        </div>

        <button
          onClick={onAddVaccine}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5046e5] hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Vaccine</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/50">
                <th className="py-4 px-6 text-xs font-semibold text-slate-700">Vaccine Name</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-700">Batch Number</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-700">Quantity</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-700">Expiry Date</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-700">Fridge</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVaccines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                    No vaccine batches found matching your search.
                  </td>
                </tr>
              ) : (
                filteredVaccines.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 px-6 text-sm font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{v.name}</span>
                        <button
                          onClick={() => onSelectForQrCheck(v)}
                          title="View QR Code & Safety Pass"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-indigo-600 hover:underline"
                        >
                          [QR]
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                      {v.batchNumber}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-800 font-mono tabular-nums">
                      {v.quantity.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {v.expiryDate}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-800 font-medium">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        {v.fridge}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditVaccine(v)}
                          className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                          title="Edit Vaccine"
                          aria-label={`Edit ${v.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleVaccineSelectChange(v.id)}
                          className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                          title="Transfer to another fridge"
                          aria-label={`Move ${v.name}`}
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-sm">
          <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
          <span>Move Vaccines Between Fridges</span>
        </div>

        {moveFeedback && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{moveFeedback}</span>
          </div>
        )}

        <form onSubmit={handleMoveSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Select Vaccine
            </label>
            <select
              value={selectedVaccineId}
              onChange={(e) => handleVaccineSelectChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              {vaccines.map((vac) => (
                <option key={vac.id} value={vac.id}>
                  {vac.name} ({vac.batchNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              From Fridge
            </label>
            <select
              value={fromFridge}
              onChange={(e) => setFromFridge(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              {fridges.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name} ({f.temperature.toFixed(1)}°C)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              To Fridge
            </label>
            <select
              value={toFridge}
              onChange={(e) => setToFridge(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              {fridges.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name} ({f.temperature.toFixed(1)}°C)
                </option>
              ))}
            </select>
          </div>

          <div className="md:pt-6">
            <button
              type="submit"
              className="w-full py-2.5 px-6 bg-[#5046e5] hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
            >
              Move
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
