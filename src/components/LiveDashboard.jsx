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
  Wifi, 
  Play, 
  Pause, 
  AlertTriangle, 
  RotateCcw,
  Activity
} from 'lucide-react';

export const LiveDashboard = ({ fridges, temperatureTrend: initialTrend }) => {
  const [selectedFridgeId, setSelectedFridgeId] = useState('fridge-a');
  const [isLiveStream, setIsLiveStream] = useState(true);
  const [streamSpeed, setStreamSpeed] = useState(1500); // 1.5 seconds per telemetry packet

  // Thermostat rule state:
  // - 7°C reached: Compressor turns ON (Running) and actively cools down towards 3°C.
  // - 3°C reached: Compressor turns OFF (Off) as fridge is cold enough.
  // - 60s delay: After compressor turns OFF, it must wait at least 60 seconds before restarting.
  const [liveTemp, setLiveTemp] = useState(6.7); // Starts near 7.0°C so user immediately sees 7°C trigger
  const [liveDoor, setLiveDoor] = useState('Closed');
  const [livePower, setLivePower] = useState('On');
  const [liveCompressor, setLiveCompressor] = useState('Off');
  const liveCompressorRef = useRef('Off');
  liveCompressorRef.current = liveCompressor;

  // 60-second lockout delay countdown after compressor turns OFF
  const [compressorCooldown, setCompressorCooldown] = useState(0);
  const compressorCooldownRef = useRef(0);
  compressorCooldownRef.current = compressorCooldown;

  const [compressorWattage, setCompressorWattage] = useState(0);
  const [humidity, setHumidity] = useState(48.5);
  const [heatBudgetUsed, setHeatBudgetUsed] = useState(35);
  const [lastUpdated, setLastUpdated] = useState('');

  // Door simulation countdown
  const [doorOpenCountdown, setDoorOpenCountdown] = useState(0);
  const doorOpenCountdownRef = useRef(0);
  doorOpenCountdownRef.current = doorOpenCountdown;

  // Initial rolling trend showing clear cooling and warming waves between 3°C and 7°C
  const [rollingTrend, setRollingTrend] = useState([
    { time: '12:00', temp: 3.4 },
    { time: '12:05', temp: 4.2 },
    { time: '12:10', temp: 5.1 },
    { time: '12:15', temp: 6.0 },
    { time: '12:20', temp: 6.8 },
    { time: '12:25', temp: 7.0 },
    { time: '12:30', temp: 6.3 },
    { time: '12:35', temp: 5.5 },
    { time: '12:40', temp: 4.6 },
    { time: '12:45', temp: 3.8 },
    { time: '12:50', temp: 3.2 },
    { time: '12:55', temp: 3.0 },
    { time: '13:00', temp: 3.8 },
    { time: '13:05', temp: 4.8 },
    { time: '13:10', temp: 5.8 },
    { time: '13:15', temp: 6.7 },
  ]);

  // Recent live incoming MQTT packets
  const [recentPackets, setRecentPackets] = useState([
    { id: 1, time: 'Just now', sensor: 'SN-FridgeA-01', temp: 6.7, door: 'Closed', hmac: '0x8f4d92', status: 'VALID' },
    { id: 2, time: '2s ago', sensor: 'SN-FridgeA-01', temp: 6.5, door: 'Closed', hmac: '0x3e1a07', status: 'VALID' },
    { id: 3, time: '4s ago', sensor: 'SN-FridgeA-01', temp: 6.2, door: 'Closed', hmac: '0x9b2c4e', status: 'VALID' },
    { id: 4, time: '6s ago', sensor: 'SN-FridgeA-01', temp: 5.8, door: 'Closed', hmac: '0x1c88d2', status: 'VALID' },
  ]);

  const [hoveredPoint, setHoveredPoint] = useState(null);

  const activeFridge = fridges.find((f) => f.id === selectedFridgeId) || fridges[0];

  // Live timestamp clock
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

  // 1-second interval timer for 60-second anti-short-cycle lockout countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCompressorCooldown((prev) => {
        const next = prev > 0 ? prev - 1 : 0;
        compressorCooldownRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Main Live Telemetry Stream adhering strictly to 7°C ON, 3°C OFF, and 60s delay
  useEffect(() => {
    if (!isLiveStream) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setLastUpdated(
        now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        timeStr
      );

      // Temperature calculation according to thermostat cycle
      setLiveTemp((prevTemp) => {
        let nextTemp = prevTemp;

        if (liveCompressorRef.current === 'Running') {
          // ACTIVE COOLING: drops from 7°C down to 3°C
          const coolingRate = 0.24 + (Math.random() * 0.08);
          nextTemp = Number((prevTemp - coolingRate).toFixed(1));

          // 3°C threshold reached: Compressor turns OFF
          if (nextTemp <= 3.0) {
            nextTemp = 3.0;
            setLiveCompressor('Off');
            liveCompressorRef.current = 'Off';
            setCompressorWattage(0);
            setCompressorCooldown(60); // 60s lockout delay starts!
            compressorCooldownRef.current = 60;
          } else {
            setCompressorWattage(138);
          }
        } else {
          // COMPRESSOR OFF: Ambient warming towards 7°C
          const isDoorOpen = doorOpenCountdownRef.current > 0;
          const warmRate = isDoorOpen ? 0.45 : 0.12 + (Math.random() * 0.05);
          nextTemp = Number((prevTemp + warmRate).toFixed(1));

          // 7°C threshold reached:
          if (nextTemp >= 7.0) {
            // Check if 60-second delay has expired
            if (compressorCooldownRef.current <= 0) {
              // Lockout finished: Compressor turns ON and starts cooling!
              nextTemp = 7.0;
              setLiveCompressor('Running');
              liveCompressorRef.current = 'Running';
              setCompressorWattage(142);
            } else {
              // Still within 60s delay: Compressor MUST NOT turn on!
              nextTemp = Math.min(7.4, nextTemp);
            }
          }
        }

        // Push new point into rolling trend graph
        setRollingTrend((oldTrend) => {
          const newPoint = {
            time: timeStr.slice(0, 5),
            temp: nextTemp,
          };
          return [...oldTrend.slice(1), newPoint];
        });

        // Update packet ticker
        setRecentPackets((oldPackets) => {
          const randomHex = Math.random().toString(16).substring(2, 8);
          const newPacket = {
            id: Date.now(),
            time: 'Just now',
            sensor: `SN-${activeFridge.name.replace(/\s+/g, '')}-01`,
            temp: nextTemp,
            door: doorOpenCountdownRef.current > 0 ? 'Open' : 'Closed',
            hmac: `0x${randomHex}`,
            status: 'VALID',
          };
          return [newPacket, ...oldPackets.slice(0, 3)];
        });

        return nextTemp;
      });

      setHumidity((prev) => {
        const delta = (Math.random() - 0.5) * 0.3;
        return Number((prev + delta).toFixed(1));
      });

      if (doorOpenCountdownRef.current > 0) {
        setDoorOpenCountdown((c) => {
          const next = c <= 1 ? 0 : c - 1;
          doorOpenCountdownRef.current = next;
          if (next === 0) setLiveDoor('Closed');
          return next;
        });
      }
    }, streamSpeed);

    return () => clearInterval(interval);
  }, [isLiveStream, streamSpeed, activeFridge.name]);

  const triggerDoorSimulation = () => {
    setLiveDoor('Open');
    setDoorOpenCountdown(7);
    doorOpenCountdownRef.current = 7;
  };

  const resetBaseline = () => {
    setLiveTemp(6.8);
    setLiveDoor('Closed');
    setLivePower('On');
    setLiveCompressor('Off');
    liveCompressorRef.current = 'Off';
    setCompressorWattage(0);
    setCompressorCooldown(0);
    compressorCooldownRef.current = 0;
    setDoorOpenCountdown(0);
    doorOpenCountdownRef.current = 0;
    setHeatBudgetUsed(35);
  };

  const remainingMargin = 100 - heatBudgetUsed;

  // SVG Chart Geometry
  const svgWidth = 620;
  const svgHeight = 180;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Temperature scale: 0°C to 8°C with 1°C steps (1 ghor kore)
  const minTemp = 0;
  const maxTemp = 8;
  const gridSteps = [8, 7, 6, 5, 4, 3, 2, 1, 0]; // 1°C increments!

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

  // Safe margin band: 2°C to 8°C WHO safe envelope
  const marginLowerY = getY(2); // 2°C threshold line
  const marginUpperY = getY(8); // 8°C upper visible bound

  const latestPoint = points[points.length - 1];

  return (
    <div className="space-y-6">
      {/* Top Banner / Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Live Dashboard</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-semibold text-slate-500">Real-time Monitoring</span>
          </div>
        </div>

        {/* Right Fridge Selector */}
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
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Temperature */}
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
                {liveTemp.toFixed(1)}°C
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
          <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 ${
            liveCompressor === 'Running' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-400'
          }`}>
            <Fan className={`w-7 h-7 ${isLiveStream && liveCompressor === 'Running' ? 'animate-spin [animation-duration:2.5s]' : ''}`} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Compressor</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-2xl font-extrabold ${liveCompressor === 'Running' ? 'text-slate-900' : 'text-slate-600'}`}>
                {liveCompressor}
              </span>
              <div className={`w-5 h-5 rounded-full text-white flex items-center justify-center shrink-0 shadow-xs ${
                liveCompressor === 'Running' ? 'bg-emerald-500' : 'bg-slate-400'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-[10px] text-indigo-600 block font-mono mt-0.5 font-medium">
              {liveCompressor === 'Running'
                ? `Load: ${compressorWattage}W · Active Cooling (→3°C)`
                : compressorCooldown > 0
                  ? `60s Lockout: ${compressorCooldown}s left`
                  : `Standby · On at 7.0°C`}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Heat Budget & Temperature Trend Graph with 1°C Grid Steps */}
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

        {/* Temperature Trend Card - 1°C Grid Increments with visible up-and-down waves! */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Temperature Trend</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md font-mono border border-indigo-100">
                  1°C Step Grid (3°C - 7°C)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ON at 7°C · OFF at 3°C · 60s Lockout Delay
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-indigo-600 inline-block"></span>
                <span className="text-slate-600">Temperature</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-400 border-t border-emerald-500 inline-block"></span>
                <span className="text-slate-600">Safe Limit (2°C - 8°C)</span>
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
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="marginBandLive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* WHO Safe Temperature Region (from 2°C to 8°C) */}
              <rect
                x={padding.left}
                y={marginUpperY}
                width={graphWidth}
                height={marginLowerY - marginUpperY}
                fill="url(#marginBandLive)"
              />

              {/* WHO 2°C Minimum and 8°C Maximum Threshold Lines */}
              <line
                x1={padding.left}
                y1={marginLowerY}
                x2={svgWidth - padding.right}
                y2={marginLowerY}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <line
                x1={padding.left}
                y1={marginUpperY}
                x2={svgWidth - padding.right}
                y2={marginUpperY}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />

              {/* 1°C Grid Lines (1 ghor kore): 8°C, 7°C, 6°C, 5°C, 4°C, 3°C, 2°C, 1°C, 0°C */}
              {gridSteps.map((val) => {
                const y = getY(val);
                const isBoundary = val === 2 || val === 8;
                const isTrigger = val === 7 || val === 3;
                return (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke={isBoundary ? '#a7f3d0' : isTrigger ? '#cbd5e1' : '#f1f5f9'}
                      strokeWidth={isBoundary ? '1.5' : '1'}
                      strokeDasharray={isBoundary ? '3 3' : '2 2'}
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      textAnchor="end"
                      className={`text-[10px] font-mono font-semibold ${
                        isBoundary
                          ? 'fill-emerald-600 font-bold'
                          : isTrigger
                            ? 'fill-indigo-600 font-bold'
                            : 'fill-slate-400'
                      }`}
                    >
                      {val}°C
                    </text>
                  </g>
                );
              })}

              {/* Live Area Fill */}
              <path d={areaD} fill="url(#tempGradientLive)" className="transition-all duration-300 ease-out" />

              {/* Main Line with prominent curve */}
              <path
                d={pathD}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300 ease-out"
              />

              {/* Wave Points along the curve */}
              {points.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  className="fill-white stroke-[#4f46e5] stroke-2 hover:r-6 cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* Pulsing beacon on the current active reading point */}
              {latestPoint && (
                <g>
                  <circle
                    cx={latestPoint.x}
                    cy={latestPoint.y}
                    r="10"
                    className="fill-indigo-400 opacity-40 animate-ping"
                  />
                  <circle
                    cx={latestPoint.x}
                    cy={latestPoint.y}
                    r="5"
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
                  top: '35%',
                }}
              >
                {hoveredPoint.time}: {hoveredPoint.temp.toFixed(1)}°C (Safe)
              </div>
            )}
          </div>

          {/* Quick interactive test controls toolbar */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-3">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live wave telemetry active (1°C resolution)
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
                title="Reset to 2.8°C baseline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Inbound Sensor Packet Ticker */}
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
                  {pkt.temp.toFixed(1)}°C
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
