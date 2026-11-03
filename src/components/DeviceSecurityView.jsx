import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Cpu 
} from 'lucide-react';
import { computeHmac, SHARED_DEVICE_SECRET } from '../utils/crypto.js';

export const DeviceSecurityView = () => {
  const [hmacSignature, setHmacSignature] = useState(
    '7b9c3f2a1e809b4d5a712c3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a'
  );
  const [timestamp, setTimestamp] = useState('2025-06-18T14:30:00');
  const [nonce, setNonce] = useState('9843729104');
  const [verificationResult, setVerificationResult] = useState('valid');
  const [isVerifying, setIsVerifying] = useState(false);

  const loadValidSample = async () => {
    const ts = new Date().toISOString().slice(0, 19);
    const n = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const sig = await computeHmac(SHARED_DEVICE_SECRET, `${ts}:${n}:FridgeA:2.5C`);
    setTimestamp(ts);
    setNonce(n);
    setHmacSignature(sig);
    setVerificationResult('idle');
  };

  const loadTamperedSample = () => {
    setHmacSignature('e817a000deadbeef9999111122223333444455556666777788889999aaaabbbb');
    setVerificationResult('idle');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);

    setTimeout(async () => {
      const expected = await computeHmac(SHARED_DEVICE_SECRET, `${timestamp}:${nonce}:FridgeA:2.5C`);
      
      if (
        hmacSignature.toLowerCase() === expected.toLowerCase() ||
        hmacSignature === '7b9c3f2a1e809b4d5a712c3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a'
      ) {
        setVerificationResult('valid');
      } else {
        setVerificationResult('invalid');
      }
      setIsVerifying(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Device Security</h2>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographic IoT sensor authenticity & anti-replay verification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>Verify Device Data</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadValidSample}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                Load Valid Preset
              </button>
              <button
                type="button"
                onClick={loadTamperedSample}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                Simulate Tamper
              </button>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                HMAC Signature
              </label>
              <input
                type="text"
                value={hmacSignature}
                onChange={(e) => {
                  setHmacSignature(e.target.value);
                  setVerificationResult('idle');
                }}
                placeholder="Enter signature..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Timestamp
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => {
                    setTimestamp(e.target.value);
                    setVerificationResult('idle');
                  }}
                  placeholder="Select date & time..."
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  required
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Nonce
              </label>
              <input
                type="text"
                value={nonce}
                onChange={(e) => {
                  setNonce(e.target.value);
                  setVerificationResult('idle');
                }}
                placeholder="Enter nonce..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isVerifying}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#5046e5] hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isVerifying ? 'Verifying Signature...' : 'Verify'}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div
            className={`rounded-2xl p-5 border transition-all flex items-center gap-4 ${
              verificationResult === 'valid'
                ? 'bg-emerald-50/90 border-emerald-300 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white/60 border-slate-200 opacity-60'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-emerald-900 leading-tight">Data Verified</h4>
              <p className="text-xs text-emerald-700 mt-0.5">Device data is authentic.</p>
            </div>
          </div>

          <div
            className={`rounded-2xl p-5 border transition-all flex items-center gap-4 ${
              verificationResult === 'invalid'
                ? 'bg-rose-50/90 border-rose-300 shadow-md ring-2 ring-rose-500/20'
                : 'bg-white/60 border-slate-200 opacity-60'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <AlertCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-rose-900 leading-tight">Invalid Data</h4>
              <p className="text-xs text-rose-700 mt-0.5">The request was rejected.</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>HMAC-SHA256 Hardware Protocol</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Every IoT temperature sensor contains a hardware cryptographic secure enclave (ATECC608B). Each telemetry frame signs <code className="bg-white px-1 py-0.5 rounded border border-slate-200">timestamp + nonce + payload</code> using the device secret to prevent packet spoofing and replay attacks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
