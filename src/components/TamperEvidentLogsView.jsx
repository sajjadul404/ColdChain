import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileCode2 
} from 'lucide-react';

export const TamperEvidentLogsView = ({
  logs,
  searchQuery,
  onTamperSimulate,
  onRestoreLogs,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [integrityMessage, setIntegrityMessage] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    setIntegrityMessage(null);

    setTimeout(() => {
      const hasTampered = logs.some((l) => l.hashStatus === 'Tampered');
      setIsVerifying(false);
      if (hasTampered) {
        setIntegrityMessage('ALERT: Hash chain mismatch detected! Unauthorized modification identified in ledger.');
      } else {
        setIntegrityMessage('Integrity Confirmed: All block hashes and chained digital signatures are 100% valid.');
      }
      setTimeout(() => setIntegrityMessage(null), 6000);
    }, 700);
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.performedBy.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.dateTime.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Tamper-Evident Logs</h2>
          <p className="text-xs text-slate-500 mt-1">
            Immutable SHA-256 chained audit trail for FDA 21 CFR Part 11 compliance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {logs.some((l) => l.hashStatus === 'Tampered') && onRestoreLogs && (
            <button
              onClick={onRestoreLogs}
              className="text-xs px-3 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
            >
              Restore Original Ledger
            </button>
          )}

          <button
            onClick={handleVerifyIntegrity}
            disabled={isVerifying}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5046e5] hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98] disabled:opacity-75"
          >
            <ShieldCheck className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Auditing Ledger...' : 'Verify Integrity'}</span>
          </button>
        </div>
      </div>

      {integrityMessage && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between shadow-xs transition-all ${
            integrityMessage.includes('ALERT')
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {integrityMessage.includes('ALERT') ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{integrityMessage}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/50">
                <th className="py-4 px-6 text-xs font-semibold text-slate-700">Date & Time</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-700">Action</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-700">Performed By</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-700">Details</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-700 text-right">Hash Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                    No log records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isValid = log.hashStatus === 'Valid';
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6 text-sm text-slate-600 font-mono text-xs">
                        {log.dateTime}
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-slate-900">
                        {log.action}
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-700 font-mono text-xs">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800">
                          {log.performedBy}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                          <span>{log.details}</span>
                          <span className="opacity-0 group-hover:opacity-100 text-[11px] text-indigo-600 font-medium transition-opacity">
                            View Hash &rarr;
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            isValid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                          }`}
                        >
                          {isValid ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          <span>{isValid ? 'Valid' : 'Tampered'}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Cryptographic Block Proof</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                  Timestamp & Action
                </span>
                <span className="text-slate-800 font-medium">
                  {selectedLog.dateTime} · {selectedLog.action} by {selectedLog.performedBy}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                  Event Description
                </span>
                <span className="text-slate-800 font-mono bg-slate-50 p-2 rounded block">
                  {selectedLog.details}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                  Previous Block SHA-256
                </span>
                <span className="text-slate-600 font-mono break-all bg-slate-50 p-2 rounded block text-[11px]">
                  {selectedLog.prevHash}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                  Current Block SHA-256
                </span>
                <span className="text-indigo-700 font-mono break-all bg-indigo-50/50 p-2 rounded block text-[11px] font-semibold border border-indigo-100">
                  {selectedLog.currentHash}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-100">
              {onTamperSimulate && selectedLog.hashStatus === 'Valid' && (
                <button
                  onClick={() => {
                    onTamperSimulate(selectedLog.id);
                    setSelectedLog(null);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                >
                  Test: Corrupt this Block
                </button>
              )}
              <button
                onClick={() => setSelectedLog(null)}
                className="ml-auto px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
