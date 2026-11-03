import React, { useState } from 'react';
import { ArrowLeftRight, CheckCircle2 } from 'lucide-react';

export const TransfersView = ({
  vaccines,
  fridges,
  transfers,
  onExecuteTransfer,
}) => {
  const [selectedVaccineId, setSelectedVaccineId] = useState(vaccines[0]?.id || '');
  const [fromFridge, setFromFridge] = useState('Fridge A');
  const [toFridge, setToFridge] = useState('Fridge B');
  const [transferQty, setTransferQty] = useState(200);
  const [feedback, setFeedback] = useState(null);

  const activeVaccine = vaccines.find((v) => v.id === selectedVaccineId) || vaccines[0];

  const handleVaccineChange = (vId) => {
    setSelectedVaccineId(vId);
    const vac = vaccines.find((v) => v.id === vId);
    if (vac) {
      setFromFridge(vac.fridge);
      const nextFridge = fridges.find((f) => f.name !== vac.fridge)?.name || 'Fridge B';
      setToFridge(nextFridge);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedVaccineId) return;
    if (fromFridge === toFridge) {
      setFeedback('Source fridge and destination fridge must be different.');
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    if (transferQty > (activeVaccine?.quantity || 0)) {
      setFeedback(`Cannot transfer more than available stock (${activeVaccine?.quantity} doses).`);
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    onExecuteTransfer(selectedVaccineId, fromFridge, toFridge, transferQty);
    setFeedback(`Cold-chain transfer initiated: ${transferQty} doses moved to ${toFridge}`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Vaccine Transfers</h2>
        <p className="text-xs text-slate-500 mt-1">
          Authorized inter-facility cold box and intra-refrigeration movements
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-sm">
          <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
          <span>Dispatch Vaccine Stock to Refrigerator / Clinic</span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Vaccine & Batch
            </label>
            <select
              value={selectedVaccineId}
              onChange={(e) => handleVaccineChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {vaccines.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.quantity} doses)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Source Fridge
            </label>
            <select
              value={fromFridge}
              onChange={(e) => setFromFridge(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
              Destination Fridge
            </label>
            <select
              value={toFridge}
              onChange={(e) => setToFridge(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
              Quantity to Move
            </label>
            <input
              type="number"
              min="1"
              max={activeVaccine?.quantity || 1000}
              value={transferQty}
              onChange={(e) => setTransferQty(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#5046e5] hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98]"
            >
              Authorize Move
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Transfer Custody Records</h3>
          <span className="text-xs text-slate-400 font-mono">Chained Cold-Box Manifest</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/50">
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-700">Timestamp</th>
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-700">Vaccine</th>
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-700">Batch Number</th>
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-700">Movement</th>
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-700">Quantity</th>
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-700">Officer</th>
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-700 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.map((tr) => (
                <tr key={tr.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 text-xs font-mono text-slate-500">{tr.timestamp}</td>
                  <td className="py-3.5 px-6 text-sm font-semibold text-slate-900">{tr.vaccineName}</td>
                  <td className="py-3.5 px-6 text-xs font-mono text-slate-600">{tr.batchNumber}</td>
                  <td className="py-3.5 px-6 text-xs text-slate-700">
                    <span className="font-semibold text-indigo-700">{tr.fromFridge}</span>
                    <span className="mx-1.5 text-slate-400">&rarr;</span>
                    <span className="font-semibold text-emerald-700">{tr.toFridge}</span>
                  </td>
                  <td className="py-3.5 px-6 text-xs font-mono font-bold text-slate-900">
                    {tr.quantity.toLocaleString()} doses
                  </td>
                  <td className="py-3.5 px-6 text-xs font-mono text-slate-600">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 capitalize">
                      {tr.authorizedBy}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {tr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
