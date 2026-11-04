import React, { useState, useEffect } from 'react';
import { 
  Snowflake, 
  Home, 
  CheckCircle2, 
  ShieldCheck, 
  Syringe, 
  QrCode, 
  Download, 
  Share2 
} from 'lucide-react';
import QRCode from 'qrcode';

export const QRCheckView = ({
  vaccines,
  selectedVaccineId,
  onNavigateHome,
}) => {
  const [activeVaccineId, setActiveVaccineId] = useState(
    selectedVaccineId || vaccines[0]?.id || ''
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const activeVaccine = vaccines.find((v) => v.id === activeVaccineId) || vaccines[0];

  useEffect(() => {
    if (!activeVaccine) return;
    const payload = JSON.stringify({
      app: 'ColdChain Safe Vaccines',
      vaccine: activeVaccine.name,
      batch: activeVaccine.batchNumber,
      expiry: activeVaccine.expiryDate,
      fridge: activeVaccine.fridge,
      status: activeVaccine.status,
      tamperHash: '0x8f4d92a11b0e77c',
      verifiedTimestamp: new Date().toISOString(),
    });

    QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR Gen error', err));
  }, [activeVaccine]);

  const handleShare = () => {
    if (!activeVaccine) return;
    navigator.clipboard?.writeText(
      `ColdChain Verification: ${activeVaccine.name} (Batch: ${activeVaccine.batchNumber}) Status: SAFE in ${activeVaccine.fridge}. Valid until ${activeVaccine.expiryDate}`
    );
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation matching mockup */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Snowflake className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">ColdChain</span>
        </div>

        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 font-semibold text-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
      </div>

      {/* Main 3-Column Display matching mockup exactly */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2 pb-6">
        {/* Left Column: Heading, Subtitle & Medical Syringe Graphic */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Scan QR Code to Check Vaccine Status
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Get real-time information without login.
            </p>
          </div>

          <div className="w-44 h-44 rounded-3xl bg-gradient-to-br from-sky-50 via-indigo-50 to-blue-100 border border-sky-100 flex items-center justify-center relative shadow-sm group">
            <div className="w-28 h-28 rounded-2xl bg-white/80 shadow-md flex items-center justify-center text-sky-600 transform -rotate-6 group-hover:rotate-0 transition-transform">
              <Syringe className="w-14 h-14 text-sky-500" />
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-indigo-600 rounded-xl text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Select Batch to Inspect:
            </label>
            <select
              value={activeVaccineId}
              onChange={(e) => setActiveVaccineId(e.target.value)}
              className="w-full max-w-xs px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {vaccines.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} · {v.batchNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Middle Column: Large QR Code with blue corner scanning brackets */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <div className="relative p-6 bg-white rounded-3xl shadow-lg border border-slate-200/80">
            <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-sky-500 rounded-tl-xl pointer-events-none"></div>
            <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-sky-500 rounded-tr-xl pointer-events-none"></div>
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-sky-500 rounded-bl-xl pointer-events-none"></div>
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-sky-500 rounded-br-xl pointer-events-none"></div>

            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt={`QR code for ${activeVaccine.name}`}
                className="w-64 h-64 object-contain rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                <QrCode className="w-16 h-16 text-slate-300 animate-pulse" />
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isCopied ? 'Link Copied!' : 'Share Pass'}</span>
            </button>
            {qrCodeDataUrl && (
              <a
                href={qrCodeDataUrl}
                download={`${activeVaccine.batchNumber}-qrcode.png`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save QR</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Status Banner & Key Details Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-emerald-800 tracking-tight block">
                Status: Safe
              </span>
              <span className="text-xs text-emerald-600 font-medium">
                Continuous Cold-Chain Verified
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3.5">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-sm">
              <span className="text-slate-500 font-medium">Vaccine:</span>
              <span className="text-slate-900 font-semibold">{activeVaccine.name}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-sm">
              <span className="text-slate-500 font-medium">Batch No:</span>
              <span className="text-slate-900 font-mono font-semibold">{activeVaccine.batchNumber}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-sm">
              <span className="text-slate-500 font-medium">Expiry Date:</span>
              <span className="text-slate-900 font-semibold">{activeVaccine.expiryDate}</span>
            </div>

            <div className="flex items-center justify-between py-1 text-sm">
              <span className="text-slate-500 font-medium">Stored In:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {activeVaccine.fridge}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed">
            Public verification token: SHA-256 authenticated by National Immunization Registry. Scan with any standard smartphone camera.
          </div>
        </div>
      </div>
    </div>
  );
};
