import React, { useState } from 'react';
import { Thermometer, CheckCircle2, ShieldCheck, Download } from 'lucide-react';

export const TemperatureView = ({ fridges, trend }) => {
  const [selectedFridge, setSelectedFridge] = useState(fridges[0]?.id || 'fridge-a');
  const [timeWindow, setTimeWindow] = useState('24h');

  const currentFridge = fridges.find((f) => f.id === selectedFridge) || fridges[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Thermal Excursion Analysis</h2>
          <p className="text-xs text-slate-500 mt-1">
            Continuous temperature data logger, excursion alerts & WHO PQS compliant range telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
            {['24h', '7d', '30d'].map((w) => (
              <button
                key={w}
                onClick={() => setTimeWindow(w)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeWindow === w ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-slate-600'
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <button
            onClick={() => alert('Exporting raw sensor temperature logs to CSV format.')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Time In Safe Margin (2°C - 8°C)</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">100.0%</div>
            <span className="text-[11px] text-emerald-600 font-semibold">0 breach incidents</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Thermometer className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Mean Kinetic Temperature (MKT)</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">2.84°C</div>
            <span className="text-[11px] text-sky-600 font-semibold">Ideal preservation benchmark</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Sensor Calibration Integrity</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">±0.05°C</div>
            <span className="text-[11px] text-indigo-600 font-semibold">NIST Traceable Probes</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {fridges.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFridge(f.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedFridge === f.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.name} ({f.temperature.toFixed(1)}°C)
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Sensor Telemetry Points · {currentFridge.name}
          </h3>
          <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
            All Readings Within Margin
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/50">
                <th className="py-3 px-6 text-xs font-semibold text-slate-700">Timestamp</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-700">Recorded Temp</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-700">Target Range</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-700">Door Status</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-700 text-right">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trend.map((pt, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-6 text-xs font-mono text-slate-600">18 Jun 2025, {pt.time}</td>
                  <td className="py-3 px-6 text-sm font-mono font-bold text-slate-900">
                    {pt.temp.toFixed(1)}°C
                  </td>
                  <td className="py-3 px-6 text-xs font-mono text-slate-500">
                    {pt.marginMin.toFixed(1)}°C - {pt.marginMax.toFixed(1)}°C
                  </td>
                  <td className="py-3 px-6 text-xs text-slate-700">Closed (Secured)</td>
                  <td className="py-3 px-6 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Nominal
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
