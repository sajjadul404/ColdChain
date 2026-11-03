import React, { useState, useEffect } from 'react';
import { X, Save, Boxes } from 'lucide-react';

export const AddVaccineModal = ({
  isOpen,
  onClose,
  onSave,
  editVaccine,
  fridges,
}) => {
  const [name, setName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState(500);
  const [expiryDate, setExpiryDate] = useState('30 Jun 2025');
  const [fridge, setFridge] = useState('Fridge A');
  const [minTemp, setMinTemp] = useState(2.0);
  const [maxTemp, setMaxTemp] = useState(8.0);

  useEffect(() => {
    if (editVaccine) {
      setName(editVaccine.name);
      setBatchNumber(editVaccine.batchNumber);
      setQuantity(editVaccine.quantity);
      setExpiryDate(editVaccine.expiryDate);
      setFridge(editVaccine.fridge);
      setMinTemp(editVaccine.minTemp);
      setMaxTemp(editVaccine.maxTemp);
    } else {
      setName('Mpox & Smallpox Vaccine');
      setBatchNumber(`MPX-2025-${Math.floor(100 + Math.random() * 900)}`);
      setQuantity(750);
      setExpiryDate('15 Oct 2025');
      setFridge('Fridge A');
      setMinTemp(2.0);
      setMaxTemp(8.0);
    }
  }, [editVaccine, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(
      {
        name,
        batchNumber,
        quantity: Number(quantity),
        expiryDate,
        fridge,
        status: 'Safe',
        minTemp: Number(minTemp),
        maxTemp: Number(maxTemp),
      },
      editVaccine ? editVaccine.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {editVaccine ? 'Edit Vaccine Batch' : 'Add New Vaccine Batch'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Vaccine Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Batch Number
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Quantity (Doses)
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Target Fridge
              </label>
              <select
                value={fridge}
                onChange={(e) => setFridge(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {fridges.map((f) => (
                  <option key={f.id} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#5046e5] hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{editVaccine ? 'Save Changes' : 'Register Batch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
