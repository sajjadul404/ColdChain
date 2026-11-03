import React, { useState, useEffect, useRef } from 'react';
import { 
  Thermometer, 
  DoorClosed, 
  DoorOpen,
  Zap, 
  Fan, 
  CheckCircle2, 
  Flame, 
  Info, 
  RefreshCw,
  Activity,
  Radio,
  Wifi,
  Play,
  Pause,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const LiveDashboard = ({ fridges, temperatureTrend: initialTrend }) => {
  const [selectedFridgeId, setSelectedFridgeId] = useState('fridge-a');
  const [isLiveStream, setIsLiveStream] = useState(true);
  const [streamSpeed, setStreamSpeed] = useState(2000); // 2 seconds per tick

  // Live dynamic telemetry state
  const [liveTemp, setLiveTemp] = useState(2.52);
  const [liveDoor, setLiveDoor] = useState('Closed');
  const [livePower, setLivePower] = useState('On');
  const [liveCompressor, setLiveCompressor] = useState('Running');
  const [compressorWattage, setCompressorWattage] = useState(126);
  const [humidity, setHumidity] = useState(48.5);
  const [heatBudgetUsed, setHeatBudgetUsed] = useState(35);
  const [packetCount, setPacketCount] = useState(1482);
  const [lastUpdated, setLastUpdated] = useState('');
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Door simulation timer
  const [doorOpenCountdown, setDoorOpenCountdown] = useState(0);

  // Live rolling trend history (keep last 16 points for smooth live line scrolling)
  const [rollingTrend, setRollingTrend] = useState(() => {
    return [
      { time: '12:00', temp: 2.55 },
      { time: '12:05', temp: 2.48 },
      { time: '12:10', temp: 2.50 },
      { time: '12:15', temp: 2.54 },
      { time: '12:20', temp: 2.49 },
      { time: '12:25', temp: 2.52 },
      { time: '12:30', temp: 2.51 },
      { time: '12:35', temp: 2.53 },
      { time: '12:40', temp: 2.47 },
      { time: '12:45', temp: 2.50 },
      { time: '12:50', temp: 2.52 },
      { time: '12:55', temp: 2.55 },
      { time: '13:00', temp: 2.51 },
      { time: '13:05', temp: 2.49 },
      { time: '13:10', temp: 2.53 },
      { time: '13:15', temp: 2.52 },
    ];
  });

  // Recent live packet stream feed (simulated incoming MQTT/LoRa packets)
  const [recentPackets, setRecentPackets] = useState(() => [
    { id: 1, time: 'Just now', sensor: 'SN-0481A', temp: 2.52, door: 'Closed', hmac: '0x8f4d92', status: 'VALID' },
    { id: 2, time: '2s ago', sensor: 'SN-0481A', temp: 2.50, door: 'Closed', hmac: '0x3e1a07', status: 'VALID' },
    { id: 3, time: '4s ago', sensor: 'SN-0481A', temp: 2.53, door: 'Closed', hmac: '0x9b2c4e', status: 'VALID' },
    { id: 4, time: '6s ago', sensor: 'SN-0481A', temp: 2.49, door: 'Closed', hmac: '0x1c88d2', status: 'VALID' },
  ]);

  const [hoveredPoint, setHoveredPoint] = useState(null);

  const activeFridge = fridges.find((f) => f.id === selectedFridgeId) || fridges[0];

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(
        now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
  }, []);

  // Main Live Telemetry Stream simulation ticker
  useEffect(() => {
    if (!isLiveStream) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setSecondsAgo(0);
      setLastUpdated(
        now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        timeStr
      );

      // Temperature calculation with realistic micro-variations
      setLiveTemp((prev) => {
        let nextTemp;
        if (doorOpenCountdown > 0) {
          // If door is opened, temp gently rises towards 3.5°C
          nextTemp = Math.min(4.2, prev + 0.12 + Math.random() * 0.08);
        } else {
          // Normal baseline target around 2.50°C
          const target = 2.50;
          const drift = (Math.random() - 0.49) * 0.06;
          const pullToTarget = (target - prev) * 0.15;
          nextTemp = Number((prev + drift + pullToTarget).toFixed(2));
          // keep safely bounded
          if (nextTemp < 2.25) nextTemp = 2.30;
          if (nextTemp > 2.85) nextTemp = 2.80;
        }

        // Add to rolling trend graph
        setRollingTrend((oldTrend) => {
          const newPoint = {
            time: timeStr.slice(0, 5),
            temp: Number(nextTemp.toFixed(2)),
          };
          const updated = [...oldTrend.slice(1), newPoint];
          return updated;
        });

        // Add new packet to recent packets feed
        setRecentPackets((oldPackets) => {
          const randomHex = Math.random().toString(16).substring(2, 8);
          const newPacket = {
            id: Date.now(),
            time: 'Just now',
            sensor: `SN-${activeFridge.name.replace(/\s+/g, '')}-01`,
            temp: Number(nextTemp.toFixed(2)),
            door: doorOpenCountdown > 0 ? 'Open' : 'Closed',
            hmac: `0x${randomHex}`,
            status: 'VALID',
          };
          return [newPacket, ...oldPackets.slice(0, 4)];
        });

        return nextTemp;
      });

      // Modulate compressor wattage slightly
      setCompressorWattage((prev) => {
        const delta = Math.floor((Math.random() - 0.5) * 6);
        return Math.max(118, Math.min(136, prev + delta));
      });

      // Humidity slight fluctuation
      setHumidity((prev) => {
        const delta = (Math.random() - 0.5) * 0.2;
        return Number((prev + delta).toFixed(1));
      });

      // Heat budget slight micro-variation
      setHeatBudgetUsed((prev) => {
        if (doorOpenCountdown > 0) {
          return Math.min(42, prev + 1);
        }
        return 35;
      });

      setPacketCount((c) => c + 1);

      // Decrement door countdown if active
      if (doorOpenCountdown > 0) {
        setDoorOpenCountdown((c) => {
          if (c <= 1) {
            setLiveDoor('Closed');
            return 0;
          }
          return c - 1;
        });
      }
    }, streamSpeed);

    return () => clearInterval(interval);
  }, [isLiveStream, streamSpeed, doorOpenCountdown, activeFridge.name]);

  // Door open simulation handler
  const triggerDoorSimulation = () => {
    setLiveDoor('Open');
    setDoorOpenCountdown(8); // 8 ticks of open door
  };

  // Reset to default baseline
  const resetBaseline = () => {
    setLiveTemp(2.50);
    setLiveDoor('Closed');
    setLivePower('On');
    setLiveCompressor('Running');
    setCompressorWattage(126);
    setDoorOpenCountdown(0);
    setHeatBudgetUsed(35);
  };

  const remainingMargin = 100 - heatBudgetUsed;

  // SVG dimensions for Temperature Trend Chart
  const svgWidth = 620;
  const svgHeight = 170;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Temperature scale: 0°C to 10°C (WHO standard)
  const minTemp = 0;
  const maxTemp = 10;

  const getY = (val) => {
    const clamped = Math.max(minTemp, Math.min(maxTemp, val));
    return padding.top + graphHeight - ((clamped - minTemp) / (maxTemp - minTemp)) * graphHeight;
  };

  const getX = (index, total) => {
    return padding.left + (index / (total - 1)) * graphWidth;
  };

  const points = rollingTrend.map((pt, i) => ({
    x: getX(i, rollingTrend.length),
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

  // Latest point for pulsating radar dot
  const latestPoint = points[points.length - 1];

  return (
    <div className="space-y-6">
      {/* Top Banner / Dashboard Header matching original design with live indicators */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Live Dashboard</h2>
            {/* Live Streaming Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE DATA STREAMING</span>
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="text-xs font-medium text-slate-500">
              Sensor Node: {activeFridge.name} (LoRaWAN & WiFi Mesh)
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-indigo-600 font-mono font-medium">
              Packets Ingested: {packetCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right Status Pill & Fridge Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Fridge Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
            {fridges.map((fridge) => (
              <button
                key={fridge.id}
                onClick={() => {
                  setSelectedFridgeId(fridge.id);
                  setLiveTemp(fridge.temperature);
                }}
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

          {/* System Online Badge with live updated seconds */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>System Online</span>
            </div>
            <div className="h-4 w-[1px] bg-emerald-200"></div>
            <span className="text-[11px] text-emerald-800 font-mono font-medium">
              Last Updated: {lastUpdated || 'Syncing...'}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Quick Metric Cards with live active indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Temperature (Dynamically oscillating with live glow) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 hover:border-sky-300 transition-all relative overflow-hidden group">
          <div className="w-13 h-13 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0 group-hover:scale-105 transition-transform">
            <Thermometer className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Temperature
              </span>
              <span className="text-[10px] text-emerald-600 font-mono font-semibold flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {liveTemp.toFixed(2)}°C
              </span>
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
              Target: 2.0°C - 8.0°C (WHO)
            </span>
          </div>
        </div>

        {/* Card 2: Door */}
        <div className={`bg-white rounded-2xl p-5 border shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 transition-all relative ${
          liveDoor === 'Open' ? 'border-amber-300 ring-2 ring-amber-300/30' : 'border-slate-200/80 hover:border-emerald-300'
        }`}>
          <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 ${
            liveDoor === 'Open' ? 'bg-amber-100 text-amber-700 animate-bounce' : 'bg-emerald-50 text-emerald-600'
          }`}>
            {liveDoor === 'Open' ? <DoorOpen className="w-7 h-7" /> : <DoorClosed className="w-7 h-7" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Door</span>
              {doorOpenCountdown > 0 && (
                <span className="text-[10px] text-amber-600 font-mono font-bold animate-pulse">
                  {doorOpenCountdown}s timer
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-2xl font-extrabold ${liveDoor === 'Open' ? 'text-amber-700' : 'text-slate-900'}`}>
                {liveDoor}
              </span>
              <div className={`w-5 h-5 rounded-full text-white flex items-center justify-center shrink-0 shadow-xs ${
                liveDoor === 'Open' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}>
                {liveDoor === 'Open' ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
              Magnetic Reed Sensor #01
            </span>
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
                {livePower}
              </span>
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
              Solar + 24V UPS Backup
            </span>
          </div>
        </div>

        {/* Card 4: Compressor */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 hover:border-purple-300 transition-all">
          <div className="w-13 h-13 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Fan className={`w-7 h-7 ${isLiveStream ? 'animate-spin [animation-duration:3s]' : ''}`} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Compressor</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900">
                {liveCompressor}
              </span>
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-[10px] text-indigo-600 block font-mono mt-0.5 font-medium">
              Load: {compressorWattage}W · Duty 62%
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Heat Budget & Real-time Temperature Trend Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Heat Budget Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Heat Budget</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                RH: {humidity}%
              </span>
            </div>

            <div className="flex items-center justify-around gap-4 py-2">
              {/* Donut Chart with smooth CSS transition */}
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
                    className="transition-all duration-700 ease-out"
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
            <span>System is within safe limits (WHO PQS standard).</span>
          </div>
        </div>

        {/* Temperature Trend Card with LIVE moving curve */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Temperature Trend</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <p className="text-xs text-slate-400">Live 16-point moving window · Realtime sensor RTD</p>
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
                <linearGradient id="tempGradientLive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="marginBandLive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Safe margin band between 2°C and 8°C */}
              <rect
                x={padding.left}
                y={marginUpperY}
                width={graphWidth}
                height={marginLowerY - marginUpperY}
                fill="url(#marginBandLive)"
                stroke="#bae6fd"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Y-axis grid lines */}
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

              {/* Live Area Fill */}
              <path d={areaD} fill="url(#tempGradientLive)" className="transition-all duration-500 ease-linear" />

              {/* Main Line with smooth curve */}
              <path
                d={pathD}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500 ease-linear"
              />

              {/* Points */}
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

              {/* Pulsing radar indicator at the latest reading point */}
              {latestPoint && (
                <g>
                  <circle
                    cx={latestPoint.x}
                    cy={latestPoint.y}
                    r="8"
                    className="fill-indigo-400 opacity-40 animate-ping"
                  />
                  <circle
                    cx={latestPoint.x}
                    cy={latestPoint.y}
                    r="4.5"
                    className="fill-indigo-600 stroke-white stroke-2"
                  />
                </g>
              )}

              {/* X-axis labels */}
              {['12AM', '6AM', '12PM', '6PM', 'LIVE NOW'].map((label, idx) => {
                const x = padding.left + (idx / 4) * graphWidth;
                return (
                  <text
                    key={idx}
                    x={x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    className={`text-[10px] font-mono ${idx === 4 ? 'fill-indigo-600 font-bold' : 'fill-slate-400'}`}
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
                {hoveredPoint.time}: {hoveredPoint.temp.toFixed(2)}°C (Safe)
              </div>
            )}
          </div>

          {/* Quick interactive test controls toolbar */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-3">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live telemetry stream active ({streamSpeed === 1000 ? '1s tick' : '2s tick'})
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLiveStream(!isLiveStream)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                title={isLiveStream ? 'Pause live stream' : 'Resume live stream'}
              >
                {isLiveStream ? <Pause className="w-3 h-3 text-slate-600" /> : <Play className="w-3 h-3 text-emerald-600" />}
                <span>{isLiveStream ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                onClick={triggerDoorSimulation}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium text-xs border border-amber-200 transition-colors"
                title="Test door opening warm-up behavior"
              >
                <DoorOpen className="w-3 h-3 text-amber-600" />
                <span>Simulate Door Open</span>
              </button>

              <button
                onClick={resetBaseline}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                title="Reset to 2.50°C baseline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Inbound Sensor Packet Ticker (Clearly demonstrates live data streaming) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Real-time Hardware Telemetry Ingest Feed (MQTT / TLS 1.3)
            </h4>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1 font-semibold">
            <Wifi className="w-3 h-3" />
            Connected · 0 dropped frames
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {recentPackets.map((pkt, idx) => (
            <div
              key={pkt.id}
              className={`p-3 rounded-xl border transition-all text-xs ${
                idx === 0
                  ? 'bg-indigo-50/60 border-indigo-200 ring-1 ring-indigo-400/20'
                  : 'bg-slate-50/70 border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-slate-400">{pkt.time}</span>
                <span className="font-mono text-[10px] text-indigo-600 font-bold bg-white px-1.5 py-0.5 rounded shadow-2xs">
                  {pkt.hmac}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {pkt.temp.toFixed(2)}°C
                </span>
                <span className="text-[11px] text-slate-600">
                  Door: <strong className={pkt.door === 'Open' ? 'text-amber-600 font-bold' : 'text-slate-700'}>{pkt.door}</strong>
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/50">
                <span>{pkt.sensor}</span>
                <span className="text-emerald-600 font-semibold">✔ {pkt.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
