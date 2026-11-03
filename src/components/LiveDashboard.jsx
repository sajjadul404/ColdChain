import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  DoorClosed, 
  Zap, 
  Fan, 
  CheckCircle2, 
  Flame, 
  Info, 
  RefreshCw 
} from 'lucide-react';

export const LiveDashboard = ({ fridges, temperatureTrend }) => {
  const [selectedFridgeId, setSelectedFridgeId] = useState('fridge-a');
  const [isLiveStream, setIsLiveStream] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('18 Jun 2025, 14:30');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const activeFridge = fridges.find((f) => f.id === selectedFridgeId) || fridges[0];

  useEffect(() => {
    if (!isLiveStream) return;
    const interval = setInterval(() => {
      const now = new Date();
      setLastUpdated(
        now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      );
    }, 15000);
    return () => clearInterval(interval);
  }, [isLiveStream]);

  const heatBudgetUsed = 35;
  const remainingMargin = 100 - heatBudgetUsed;

  const svgWidth = 620;
  const svgHeight = 170;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const minTemp = 0;
  const maxTemp = 10;

  const getY = (val) => {
    const clamped = Math.max(minTemp, Math.min(maxTemp, val));
    return padding.top + graphHeight - ((clamped - minTemp) / (maxTemp - minTemp)) * graphHeight;
  };

  const getX = (index, total) => {
    return padding.left + (index / (total - 1)) * graphWidth;
  };

  const points = temperatureTrend.map((pt, i) => ({
    x: getX(i, temperatureTrend.length),
    y: getY(pt.temp),
    ...pt,
  }));

  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${getY(0)} L ${points[0].x} ${getY(0)} Z`;

  const marginUpperY = getY(8);
  const marginLowerY = getY(2);

  return (
    <div className="space-y-6">
      {/* Top Banner / Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Live Dashboard</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-500">Real-time Monitoring</span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-400">Unit: {activeFridge.name} (WHO PQS Certified)</span>
          </div>
        </div>

        {/* Right Status Pill & Fridge Selector */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
            {fridges.map((fridge) => (
              <button
                key={fridge.id}
                onClick={() => setSelectedFridgeId(fridge.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedFridgeId === fridge.id
                    ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {fridge.name}
              </button>
            ))}
          </div>

          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>System Online</span>
            </div>
            <div className="h-4 w-[1px] bg-emerald-200"></div>
            <span className="text-[11px] text-emerald-800 font-medium">
              Last Updated: {lastUpdated}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Quick Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Temperature */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 hover:border-sky-300 transition-all">
          <div className="w-13 h-13 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
            <Thermometer className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Temperature</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {activeFridge.temperature.toFixed(1)}°C
              </span>
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Door */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 hover:border-emerald-300 transition-all">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <DoorClosed className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Door</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900">
                {activeFridge.doorStatus}
              </span>
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Power */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 hover:border-amber-300 transition-all">
          <div className="w-13 h-13 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Zap className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Power</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900">
                {activeFridge.powerStatus}
              </span>
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Compressor */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 hover:border-purple-300 transition-all">
          <div className="w-13 h-13 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Fan className="w-7 h-7 animate-spin [animation-duration:4s]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Compressor</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900">
                {activeFridge.compressorStatus}
              </span>
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Heat Budget & Temperature Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Heat Budget Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-base mb-6">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>Heat Budget</span>
            </div>

            <div className="flex items-center justify-around gap-4 py-2">
              {/* Donut Chart */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#f97316"
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={(2 * Math.PI * 40) * (1 - heatBudgetUsed / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">
                    {heatBudgetUsed}%
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Used</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500 block">Remaining Safety Margin</span>
                <span className="text-3xl font-extrabold text-slate-900 font-mono block">
                  {remainingMargin}%
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">Nominal threshold &gt; 40%</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center gap-2.5 text-xs text-indigo-900 font-medium">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>System is within safe limits.</span>
          </div>
        </div>

        {/* Temperature Trend Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Temperature Trend</h3>
              <p className="text-xs text-slate-400">24-hour continuous sensor recording</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-indigo-600 inline-block"></span>
                <span className="text-slate-600">Temperature</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-sky-300 border-t border-sky-400 inline-block"></span>
                <span className="text-slate-600">Margin (2°C - 8°C)</span>
              </div>
            </div>
          </div>

          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="marginBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              <rect
                x={padding.left}
                y={marginUpperY}
                width={graphWidth}
                height={marginLowerY - marginUpperY}
                fill="url(#marginBand)"
                stroke="#bae6fd"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {[10, 5, 0].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[10px] fill-slate-400 font-mono"
                    >
                      {val}°C
                    </text>
                  </g>
                );
              })}

              <path d={areaD} fill="url(#tempGradient)" />

              <path
                d={pathD}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {points.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  className="fill-white stroke-[#4f46e5] stroke-2 hover:r-5 cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {['12AM', '6AM', '12PM', '6PM', '12AM'].map((label, idx) => {
                const x = padding.left + (idx / 4) * graphWidth;
                return (
                  <text
                    key={idx}
                    x={x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {label}
                  </text>
                );
              })}
            </svg>

            {hoveredPoint && (
              <div
                className="absolute bg-slate-900 text-white text-[11px] font-mono px-2.5 py-1 rounded-md shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${((hoveredPoint.temp ? points.find(p => p.time === hoveredPoint.time)?.x || 100 : 100) / svgWidth) * 100}%`,
                  top: '40%',
                }}
              >
                {hoveredPoint.time}: {hoveredPoint.temp.toFixed(1)}°C (Safe)
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              PQS E003/001 Cold Chain Verification Active
            </span>
            <button
              onClick={() => setIsLiveStream(!isLiveStream)}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <RefreshCw className={`w-3 h-3 ${isLiveStream ? 'animate-spin [animation-duration:6s]' : ''}`} />
              <span>{isLiveStream ? 'Auto-Syncing' : 'Paused'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
