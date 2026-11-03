import React, { useState } from 'react';
import { Download, ShieldCheck, Printer, Plus, Award } from 'lucide-react';

export const ReportsView = ({ reports, onGenerateNewReport }) => {
  const [selectedReport, setSelectedReport] = useState(reports[0] || null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onGenerateNewReport({
        title: 'Weekly Routine Thermal Quality Audit',
        facility: 'Metropolitan Cold Chain Center',
        inspectorName: 'Elena Rostova (Inspector #891)',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        complianceScore: 100.0,
        excursionsCount: 0,
        status: 'Passed',
        summary: 'All units inspected. Cryptographic device nonces intact. Zero thermal breaches during the observation period.',
      });
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Inspection & Audit Reports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Official WHO PQS compliance documentation and regulatory digital certification
          </p>
        </div>

        <button
          onClick={handleCreateReport}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5046e5] hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98] disabled:opacity-75"
        >
          <Plus className="w-4 h-4" />
          <span>{isGenerating ? 'Compiling Audit Data...' : 'Generate New Audit Report'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-4">
          {reports.map((report) => {
            const isSelected = selectedReport?.id === report.id;
            return (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-white/80 border-slate-200/80 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block mb-1">
                      {report.id} · {report.date}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{report.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 shrink-0">
                    {report.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <span>Score: <strong className="text-slate-900 font-mono">{report.complianceScore}%</strong></span>
                  <span className="truncate max-w-[170px]">{report.inspectorName}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-7">
          {selectedReport ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-indigo-600 font-bold block">
                      WHO PQS Certification
                    </span>
                    <h3 className="text-lg font-black text-slate-900">{selectedReport.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert('Sending report to local print service...')}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                    title="Print Certificate"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => alert('Downloading official signed PDF report...')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-[11px] text-slate-400 block font-semibold">Audit Date</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedReport.date}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-[11px] text-slate-400 block font-semibold">Compliance Rating</span>
                  <span className="text-sm font-extrabold text-emerald-600 font-mono">
                    {selectedReport.complianceScore}% (Compliant)
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-[11px] text-slate-400 block font-semibold">Excursions Breached</span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">
                    {selectedReport.excursionsCount} breaches
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-900 block">Inspecting Authority & Facility</span>
                <p className="text-slate-600">
                  Conducted by <strong className="text-slate-900">{selectedReport.inspectorName}</strong> at{' '}
                  <strong className="text-slate-900">{selectedReport.facility}</strong>.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-900 block">Audit Findings & Certification</span>
                <p className="p-4 bg-slate-50 rounded-2xl text-slate-700 leading-relaxed border border-slate-200/50">
                  {selectedReport.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  Digitally Signed & SHA-256 Timestamped
                </span>
                <span>Audit Ref: {selectedReport.id}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200/80">
              Select an inspection report to preview certificate
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
