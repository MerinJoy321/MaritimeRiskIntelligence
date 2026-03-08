// @ts-nocheck
// ═══════════════════════════════════════════════════════════════
// MARITIME VOYAGE RISK INTELLIGENCE PLATFORM
// AI-Driven Marine Insurance Dashboard
// Design System: ANTIGRAVITY — Deep Ocean Bioluminescent Theme
// Stack: React + Framer Motion + Recharts + Claude AI API
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback, Suspense, lazy } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar,
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { vessels } from "./data/vessels";
import { getAllVessels, getVesselById, getHighRiskVessels, getActiveVessels } from "./services/vesselService";
import { calculateVoyageRisk, getVoyageRiskBreakdown } from "./logic/riskEngine";
import { generateRiskExplanation, generateVoyageSummary } from "./services/aiExplanation";
import AIBehaviorMonitor from "./components/AIBehaviorMonitor";
import MaritimeRiskMap from "./components/MaritimeRiskMap";
const VesselMap = lazy(() => import('./components/VesselMap'));
// ─────────────────────────────────────────────────────────────
// ANTIGRAVITY DESIGN TOKENS
// ─────────────────────────────────────────────────────────────
const AG = {
    colors: {
        void: '#030d1c',
        abyss: '#061525',
        deep: '#091e38',
        current: 'rgba(0,212,255,0.12)',
        biolume: '#00d4ff',
        phosphor: '#00ff9d',
        amber: '#ffaa00',
        coral: '#ff4757',
        ghost: 'rgba(255,255,255,0.04)',
        mist: 'rgba(0,212,255,0.05)',
        text: { primary: '#e8f4f8', secondary: '#7fb3c8', muted: '#4a7a8a' }
    },
    easing: { tide: [0.25, 0.46, 0.45, 0.94], swell: [0.23, 1, 0.32, 1] }
};

// ─────────────────────────────────────────────────────────────
// MOCK DATA ENGINE (Normalized after helper functions)
// ─────────────────────────────────────────────────────────────
let MOCK_VESSELS = []; // Defined below helpers

const RISK_TIMELINE = [
    { time: '06:00', risk: 28, weather: 15, piracy: 8, congestion: 5 },
    { time: '09:00', risk: 35, weather: 20, piracy: 10, congestion: 5 },
    { time: '12:00', risk: 48, weather: 30, piracy: 12, congestion: 6 },
    { time: '15:00', risk: 65, weather: 38, piracy: 18, congestion: 9 },
    { time: '18:00', risk: 72, weather: 42, piracy: 22, congestion: 8 },
    { time: '21:00', risk: 68, weather: 35, piracy: 25, congestion: 8 },
    { time: '00:00', risk: 74, weather: 38, piracy: 28, congestion: 8 },
    { time: '03:00', risk: 71, weather: 32, piracy: 30, congestion: 9 },
];

const ROUTES = [
    {
        name: 'Dubai → Suez', risk: 72, distance: '3,450 nm', days: 14, piracy: 'HIGH', weather: 'MODERATE', segments: [
            { name: 'Persian Gulf', risk: 35 }, { name: 'Arabian Sea', risk: 48 }, { name: 'Gulf of Aden', risk: 89 }, { name: 'Red Sea', risk: 65 }
        ]
    },
    {
        name: 'Dubai → Cape Horn', risk: 38, distance: '9,200 nm', days: 28, piracy: 'LOW', weather: 'HIGH', segments: [
            { name: 'Arabian Sea', risk: 42 }, { name: 'Indian Ocean', risk: 35 }, { name: 'Cape Agulhas', risk: 68 }, { name: 'Atlantic', risk: 28 }
        ]
    },
    {
        name: 'Dubai → Suez (Alt)', risk: 55, distance: '3,800 nm', days: 16, piracy: 'MODERATE', weather: 'LOW', segments: [
            { name: 'Oman Offshore', risk: 28 }, { name: 'Yemen EEZ', risk: 62 }, { name: 'Bab-el-Mandeb', risk: 75 }, { name: 'Red Sea', risk: 55 }
        ]
    },
];

const INCIDENT_HISTORY = [
    { month: 'Oct', piracy: 12, weather: 8, mechanical: 3 },
    { month: 'Nov', piracy: 15, weather: 12, mechanical: 2 },
    { month: 'Dec', piracy: 8, weather: 18, mechanical: 5 },
    { month: 'Jan', piracy: 22, weather: 9, mechanical: 3 },
    { month: 'Feb', piracy: 18, weather: 14, mechanical: 1 },
    { month: 'Mar', piracy: 11, weather: 7, mechanical: 4 },
];

const RADAR_DATA = [
    { subject: 'Weather', value: 72 }, { subject: 'Piracy', value: 89 },
    { subject: 'Congestion', value: 45 }, { subject: 'Mechanical', value: 28 },
    { subject: 'Geopolitical', value: 65 }, { subject: 'Crew', value: 32 },
];

// ─────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────

const getRiskColor = (score) => {
    if (score >= 76) return AG.colors.coral;
    if (score >= 56) return '#ff8c00';
    if (score >= 31) return AG.colors.amber;
    return AG.colors.phosphor;
};

const getRiskLabel = (score) => {
    if (score >= 76) return 'CRITICAL';
    if (score >= 56) return 'HIGH';
    if (score >= 31) return 'MODERATE';
    return 'LOW';
};

// Data Normalization
MOCK_VESSELS = vessels.map(v => ({
    ...v,
    risk: v.riskScore || 0,
    tier: getRiskLabel(v.riskScore || 0),
    ais: v.ais !== undefined ? v.ais : true,
    reliability: v.reliability || 85
}));

// Floating Card Component (Antigravity: ag-float-card)
const FloatCard = ({ children, className = '', style = {}, onClick, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: AG.easing.swell }}
        whileHover={{ y: -4, boxShadow: `0 24px 60px rgba(0,212,255,0.18), 0 4px 20px rgba(0,0,0,0.6)` }}
        onClick={onClick}
        style={{
            background: `linear-gradient(135deg, ${AG.colors.abyss} 0%, ${AG.colors.deep} 100%)`,
            border: `1px solid ${AG.colors.current}`,
            borderRadius: 16,
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,212,255,0.08)`,
            backdropFilter: 'blur(20px)',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            ...style
        }}
        className={className}
    >
        {children}
    </motion.div>
);

// Animated Score Ring (Antigravity: ag-score-ring)
const ScoreRing = ({ score, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = radius * 2 * Math.PI;
    const [animatedScore, setAnimatedScore] = useState(0);
    const color = getRiskColor(score);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score), 300);
        return () => clearTimeout(timer);
    }, [score]);

    const offset = circumference - (animatedScore / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
                <circle cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color} strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.23, 1, 0.32, 1), stroke 0.6s ease', filter: `drop-shadow(0 0 8px ${color})` }}
                />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <motion.span
                    key={score}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ fontSize: size * 0.22, fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}
                >
                    {score}
                </motion.span>
                <span style={{ fontSize: size * 0.09, color: AG.colors.text.muted, letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>
                    {getRiskLabel(score)}
                </span>
            </div>
        </div>
    );
};

// Risk Badge
const RiskBadge = ({ score, tier }) => {
    const label = tier || getRiskLabel(score);
    const color = getRiskColor(score || (label === 'CRITICAL' ? 85 : label === 'HIGH' ? 65 : label === 'MODERATE' ? 45 : 20));
    return (
        <span style={{
            background: `${color}18`, border: `1px solid ${color}40`, color,
            padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.12em', fontFamily: 'JetBrains Mono, monospace',
            boxShadow: `0 0 12px ${color}20`
        }}>
            {label}
        </span>
    );
};

// Stat Card
const StatCard = ({ label, value, sub, delta, icon, color, delay }) => (
    <FloatCard delay={delay} style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: AG.colors.text.muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>{label}</span>
            <span style={{ fontSize: 20 }}>{icon}</span>
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: color || AG.colors.text.primary, lineHeight: 1, marginBottom: 4, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: AG.colors.text.secondary, marginBottom: 8 }}>{sub}</div>}
        {delta && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: delta > 0 ? AG.colors.coral : AG.colors.phosphor, fontSize: 11, fontWeight: 700 }}>
                    {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}%
                </span>
                <span style={{ color: AG.colors.text.muted, fontSize: 11 }}>vs last voyage</span>
            </div>
        )}
    </FloatCard>
);

// Section Header
const SectionHeader = ({ title, subtitle, badge }) => (
    <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: AG.colors.text.primary, letterSpacing: '-0.02em' }}>{title}</h2>
            {badge && <RiskBadge tier={badge} score={badge === 'CRITICAL' ? 85 : badge === 'HIGH' ? 65 : badge === 'MODERATE' ? 45 : 20} />}
        </div>
        {subtitle && <p style={{ margin: 0, fontSize: 13, color: AG.colors.text.muted, fontFamily: 'JetBrains Mono, monospace' }}>{subtitle}</p>}
    </div>
);

// Custom Tooltip for Charts
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: AG.colors.deep, border: `1px solid ${AG.colors.current}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
            <div style={{ color: AG.colors.biolume, marginBottom: 6, fontWeight: 700 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, marginBottom: 2 }}>{p.name}: <b>{p.value}</b></div>
            ))}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// SIDEBAR NAVIGATION
// ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { id: 'map', label: 'Global Risk Map', icon: '🌊' },
    { id: 'vessel', label: 'Vessel Risk Profile', icon: '⚓' },
    { id: 'voyage', label: 'Voyage Dashboard', icon: '🧭' },
    { id: 'route', label: 'Route Simulator', icon: '📡' },
    { id: 'behaviour', label: 'Behaviour Monitor', icon: '🔍' },
    { id: 'report', label: 'AI Risk Report', icon: '📋' },
];

const Sidebar = ({ active, setActive }) => (
    <div style={{
        width: 240, minHeight: '100vh', background: AG.colors.void,
        borderRight: `1px solid ${AG.colors.current}`,
        display: 'flex', flexDirection: 'column', padding: '0 0 24px',
        position: 'sticky', top: 0, flexShrink: 0
    }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: `1px solid ${AG.colors.current}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${AG.colors.biolume}22, ${AG.colors.biolume}44)`,
                    border: `1px solid ${AG.colors.biolume}40`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, boxShadow: `0 0 20px ${AG.colors.biolume}20`
                }}>🌐</div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: AG.colors.text.primary, letterSpacing: '-0.02em' }}>NAVIGATOR</div>
                    <div style={{ fontSize: 10, color: AG.colors.biolume, letterSpacing: '0.15em', fontFamily: 'JetBrains Mono, monospace' }}>MARINE INTEL</div>
                </div>
            </div>
        </div>

        {/* Live indicator */}
        <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: 99, background: AG.colors.phosphor, boxShadow: `0 0 8px ${AG.colors.phosphor}` }} />
            <span style={{ fontSize: 11, color: AG.colors.phosphor, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>LIVE TRACKING</span>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '8px 12px' }}>
            {NAV_ITEMS.map((item, i) => {
                const isActive = active === item.id;
                return (
                    <motion.button key={item.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, ease: AG.easing.swell }}
                        onClick={() => setActive(item.id)}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                            padding: '11px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            marginBottom: 2, textAlign: 'left',
                            background: isActive ? `linear-gradient(90deg, ${AG.colors.biolume}15, ${AG.colors.biolume}05)` : 'transparent',
                            boxShadow: isActive ? `inset 3px 0 0 ${AG.colors.biolume}, 0 0 20px ${AG.colors.biolume}08` : 'none',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <span style={{ fontSize: 16 }}>{item.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? AG.colors.biolume : AG.colors.text.secondary, transition: 'color 0.3s' }}>
                            {item.label}
                        </span>
                    </motion.button>
                );
            })}
        </nav>

        {/* Bottom status */}
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${AG.colors.current}` }}>
            <div style={{ fontSize: 11, color: AG.colors.text.muted, fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>VESSELS TRACKED</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: AG.colors.biolume }}>1,247</div>
            <div style={{ fontSize: 11, color: AG.colors.text.muted }}>across 23 trade lanes</div>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────
// VIEW 1: GLOBAL RISK MAP
// ─────────────────────────────────────────────────────────────
const GlobalMapView = () => {
    const [selected, setSelected] = useState(null);

    // Simplified SVG world map representation with vessel markers
    const mapRegions = [
        { name: 'Gulf of Aden', x: 58, y: 42, risk: 89, vessels: 12 },
        { name: 'Strait of Malacca', x: 78, y: 52, risk: 65, vessels: 28 },
        { name: 'West Africa', x: 38, y: 52, risk: 72, vessels: 8 },
        { name: 'Caribbean', x: 22, y: 44, risk: 35, vessels: 15 },
        { name: 'North Atlantic', x: 32, y: 32, risk: 48, vessels: 42 },
        { name: 'South China Sea', x: 82, y: 46, risk: 55, vessels: 35 },
        { name: 'Red Sea', x: 56, y: 38, risk: 78, vessels: 19 },
    ];

    return (
        <div>
            <SectionHeader title="Global Maritime Risk Map" subtitle="Real-time vessel positions and risk heatmap" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                <StatCard label="Active Vessels" value="1,247" icon="🚢" delay={0} />
                <StatCard label="High Risk Zones" value="7" color={AG.colors.coral} icon="⚠️" delay={0.1} />
                <StatCard label="Active Piracy Alerts" value="3" color={AG.colors.amber} icon="🏴‍☠️" delay={0.2} />
                <StatCard label="Storm Systems" value="5" color={AG.colors.biolume} icon="🌀" delay={0.3} />
            </div>



            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
                {/* Map */}
                {/* Map */}
                <Suspense fallback={
                    <div style={{ minHeight: 420, height: '100%', background: AG.colors.abyss, border: `1px solid ${AG.colors.current}`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: AG.colors.biolume }}>
                        Loading Live Map...
                    </div>
                }>
                    <VesselMap />
                </Suspense>

                {/* Risk Zones Panel */}
                <FloatCard delay={0.5} style={{ padding: 20 }}>
                    <div style={{ fontSize: 12, color: AG.colors.text.muted, letterSpacing: '0.1em', marginBottom: 16, fontFamily: 'JetBrains Mono, monospace' }}>HIGH RISK ZONES</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {mapRegions.sort((a, b) => b.risk - a.risk).map((zone, i) => {
                            const color = getRiskColor(zone.risk);
                            return (
                                <motion.div key={zone.name}
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + i * 0.07 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: AG.colors.ghost, borderRadius: 10, border: `1px solid ${AG.colors.current}` }}
                                >
                                    <div style={{ width: 3, height: 36, borderRadius: 99, background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: AG.colors.text.primary, marginBottom: 2 }}>{zone.name}</div>
                                        <div style={{ fontSize: 11, color: AG.colors.text.muted }}>{zone.vessels} vessels in zone</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace' }}>{zone.risk}</div>
                                        <div style={{ fontSize: 9, color, letterSpacing: '0.1em' }}>{getRiskLabel(zone.risk)}</div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </FloatCard>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// VIEW 2: VESSEL RISK PROFILE
// ─────────────────────────────────────────────────────────────
const VesselProfileView = () => {
    const [selected, setSelected] = useState(MOCK_VESSELS[0]);

    return (
        <div>
            <SectionHeader title="Vessel Risk Profile Dashboard" subtitle="Pre-voyage reliability & underwriting assessment" />

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
                {/* Vessel List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {MOCK_VESSELS.map((v, i) => (
                        <FloatCard key={v.id} delay={i * 0.08} onClick={() => setSelected(v)}
                            style={{
                                padding: '16px', border: selected.id === v.id ? `1px solid ${AG.colors.biolume}60` : undefined,
                                boxShadow: selected.id === v.id ? `0 0 20px ${AG.colors.biolume}15, 0 8px 32px rgba(0,0,0,0.4)` : undefined
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: AG.colors.text.primary }}>{v.flag} {v.name}</div>
                                    <div style={{ fontSize: 11, color: AG.colors.text.muted }}>{v.type}</div>
                                </div>
                                <RiskBadge tier={v.tier} score={v.risk} />
                            </div>
                            <div style={{ fontSize: 11, color: AG.colors.text.secondary }}>{v.route}</div>
                        </FloatCard>
                    ))}
                </div>

                {/* Profile Detail */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Header */}
                    <FloatCard delay={0.3} style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 36, background: AG.colors.ghost, border: `1px solid ${AG.colors.current}`
                            }}>🚢</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 22, fontWeight: 800, color: AG.colors.text.primary, marginBottom: 4 }}>{selected.flag} {selected.name}</div>
                                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 12, color: AG.colors.text.muted }}>Type: <b style={{ color: AG.colors.text.secondary }}>{selected.type}</b></span>
                                    <span style={{ fontSize: 12, color: AG.colors.text.muted }}>AIS: <b style={{ color: selected.ais ? AG.colors.phosphor : AG.colors.coral }}>{selected.ais ? 'Active' : 'DARK'}</b></span>
                                    <span style={{ fontSize: 12, color: AG.colors.text.muted }}>Status: <b style={{ color: AG.colors.text.secondary }}>{selected.status}</b></span>
                                </div>
                            </div>
                            <ScoreRing score={selected.reliability} size={100} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 11, color: AG.colors.text.muted, marginTop: -8 }}>RELIABILITY</div>
                            </div>
                        </div>
                    </FloatCard>

                    {/* KPI Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                        {[
                            { label: 'Voyage Risk', value: selected.risk, color: getRiskColor(selected.risk), unit: '/100' },
                            { label: 'Reliability', value: selected.reliability, color: AG.colors.biolume, unit: '/100' },
                            { label: 'Insurance Tier', value: selected.tier, color: getRiskColor(selected.risk) },
                            { label: 'AIS Status', value: selected.ais ? 'ACTIVE' : 'DARK', color: selected.ais ? AG.colors.phosphor : AG.colors.coral },
                        ].map((kpi, i) => (
                            <FloatCard key={kpi.label} delay={0.4 + i * 0.07} style={{ padding: '18px 20px' }}>
                                <div style={{ fontSize: 10, color: AG.colors.text.muted, letterSpacing: '0.12em', marginBottom: 8, fontFamily: 'JetBrains Mono, monospace' }}>{kpi.label}</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: kpi.color, fontFamily: 'JetBrains Mono, monospace' }}>
                                    {kpi.value}{kpi.unit || ''}
                                </div>
                            </FloatCard>
                        ))}
                    </div>

                    {/* Radar Chart */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <FloatCard delay={0.6} style={{ padding: '20px' }}>
                            <div style={{ fontSize: 12, color: AG.colors.text.muted, letterSpacing: '0.1em', marginBottom: 16, fontFamily: 'JetBrains Mono, monospace' }}>RISK PROFILE RADAR</div>
                            <ResponsiveContainer width="100%" height={220}>
                                <RadarChart data={RADAR_DATA}>
                                    <PolarGrid stroke={AG.colors.current} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: AG.colors.text.muted, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} />
                                    <Radar name="Risk" dataKey="value" stroke={AG.colors.coral} fill={AG.colors.coral} fillOpacity={0.15} strokeWidth={2} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </FloatCard>

                        <FloatCard delay={0.7} style={{ padding: '20px' }}>
                            <div style={{ fontSize: 12, color: AG.colors.text.muted, letterSpacing: '0.1em', marginBottom: 12, fontFamily: 'JetBrains Mono, monospace' }}>UNDERWRITING SUMMARY</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { label: 'Base Premium', value: '$2,400', note: 'Standard rate' },
                                    {
                                        label: 'Risk Loading', value: selected.tier === 'CRITICAL' ? '+40%' : selected.tier === 'HIGH' ? '+28%' : selected.tier === 'MODERATE' ? '+15%' : '+0%',
                                        color: getRiskColor(selected.risk)
                                    },
                                    { label: 'War Risk Add-on', value: selected.risk >= 70 ? 'REQUIRED' : 'Optional', color: selected.risk >= 70 ? AG.colors.coral : AG.colors.text.muted },
                                    { label: 'Recommended Action', value: selected.tier === 'CRITICAL' ? 'Specialist Review' : 'Standard Issue', color: AG.colors.biolume },
                                ].map(item => (
                                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: AG.colors.ghost, borderRadius: 8 }}>
                                        <span style={{ fontSize: 12, color: AG.colors.text.muted }}>{item.label}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: item.color || AG.colors.text.primary, fontFamily: 'JetBrains Mono, monospace' }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </FloatCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// VIEW 3: VOYAGE DASHBOARD
// ─────────────────────────────────────────────────────────────
const VoyageDashboardView = () => {
    const vessel = MOCK_VESSELS[0]; // MV Ocean Star

    return (
        <div>
            <SectionHeader title="Voyage Risk Dashboard" subtitle="MV Ocean Star — Dubai → Suez Canal" badge="HIGH" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                <StatCard label="Voyage Risk Score" value={vessel.risk} color={getRiskColor(vessel.risk)} icon="⚡" delta={12} delay={0} />
                <StatCard label="Weather Risk" value="MODERATE" color={AG.colors.amber} icon="🌩️" delay={0.1} />
                <StatCard label="Piracy Risk" value="HIGH" color={AG.colors.coral} icon="🏴‍☠️" delay={0.2} />
            </div>

            <div style={{ marginBottom: 20 }}>
                <AIBehaviorMonitor />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Risk Timeline */}
                <FloatCard delay={0.3} style={{ padding: '24px' }}>
                    <div style={{ fontSize: 12, color: AG.colors.text.muted, letterSpacing: '0.1em', marginBottom: 16, fontFamily: 'JetBrains Mono, monospace' }}>24-HOUR RISK TIMELINE</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={RISK_TIMELINE}>
                            <defs>
                                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={AG.colors.coral} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={AG.colors.coral} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={AG.colors.current} />
                            <XAxis dataKey="time" tick={{ fill: AG.colors.text.muted, fontSize: 10 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: AG.colors.text.muted, fontSize: 10 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="risk" name="Total Risk" stroke={AG.colors.coral} strokeWidth={2} fill="url(#riskGrad)" />
                            <Line type="monotone" dataKey="piracy" name="Piracy" stroke={AG.colors.amber} strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                            <Line type="monotone" dataKey="weather" name="Weather" stroke={AG.colors.biolume} strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                        </AreaChart>
                    </ResponsiveContainer>
                </FloatCard>

                {/* Current Risk Breakdown */}
                <FloatCard delay={0.4} style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                    <div style={{ fontSize: 12, color: AG.colors.text.muted, letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>CURRENT RISK SCORE</div>
                    <ScoreRing score={vessel.risk} size={140} strokeWidth={10} />
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                            { label: 'Weather', value: 45, color: AG.colors.biolume, weight: '40%' },
                            { label: 'Piracy', value: 72, color: AG.colors.coral, weight: '30%' },
                            { label: 'Congestion', value: 30, color: AG.colors.amber, weight: '20%' },
                            { label: 'Behaviour', value: 10, color: AG.colors.phosphor, weight: '10%' },
                        ].map(item => (
                            <div key={item.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                    <span style={{ fontSize: 11, color: AG.colors.text.muted }}>{item.label} <span style={{ color: AG.colors.text.muted, fontSize: 10 }}>({item.weight})</span></span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: item.color, fontFamily: 'JetBrains Mono, monospace' }}>{item.value}</span>
                                </div>
                                <div style={{ height: 3, background: AG.colors.ghost, borderRadius: 99, overflow: 'hidden' }}>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }}
                                        transition={{ duration: 1, delay: 0.6, ease: AG.easing.swell }}
                                        style={{ height: '100%', background: item.color, boxShadow: `0 0 8px ${item.color}`, borderRadius: 99 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </FloatCard>
            </div>

            {/* Alerts */}
            <FloatCard delay={0.5} style={{ padding: '24px' }}>
                <div style={{ fontSize: 12, color: AG.colors.text.muted, letterSpacing: '0.1em', marginBottom: 16, fontFamily: 'JetBrains Mono, monospace' }}>ACTIVE ALERTS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {[
                        { type: 'CRITICAL', icon: '🏴‍☠️', title: 'Piracy Alert', desc: '3 incidents reported in Gulf of Aden (last 24h)', time: '18 min ago', color: AG.colors.coral },
                        { type: 'WARNING', icon: '⛈️', title: 'Storm System', desc: 'Wind speeds 45kn forecast on current heading', time: '1h ago', color: AG.colors.amber },
                        { type: 'INFO', icon: '⚓', title: 'Port Delay', desc: 'Suez Canal queue: 47 vessels, est. 12h delay', time: '3h ago', color: AG.colors.biolume },
                    ].map((alert, i) => (
                        <motion.div key={alert.type} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.1 }}
                            style={{ padding: '16px', background: `${alert.color}08`, border: `1px solid ${alert.color}30`, borderRadius: 12 }}
                        >
                            {alert.type === 'CRITICAL' && (
                                <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ position: 'absolute', inset: 0, borderRadius: 12, boxShadow: `0 0 20px ${alert.color}20`, pointerEvents: 'none' }} />
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <span style={{ fontSize: 18 }}>{alert.icon}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: alert.color, letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>{alert.type}</span>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: AG.colors.text.primary, marginBottom: 4 }}>{alert.title}</div>
                            <div style={{ fontSize: 11, color: AG.colors.text.muted, marginBottom: 8 }}>{alert.desc}</div>
                            <div style={{ fontSize: 10, color: AG.colors.text.muted, fontFamily: 'JetBrains Mono, monospace' }}>{alert.time}</div>
                        </motion.div>
                    ))}
                </div>
            </FloatCard>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// VIEW 4: ROUTE RISK SIMULATOR
// ─────────────────────────────────────────────────────────────
const RouteSimulatorView = () => {
    const [selected, setSelected] = useState(0);
    const route = ROUTES[selected];

    return (
        <div>
            <SectionHeader title="Route Risk Simulator" subtitle="Compare risk profiles across alternative shipping routes" />

            {/* Route Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                {ROUTES.map((r, i) => (
                    <FloatCard key={r.name} delay={i * 0.1} onClick={() => setSelected(i)}
                        style={{
                            padding: '20px', border: selected === i ? `1px solid ${AG.colors.biolume}60` : undefined,
                            boxShadow: selected === i ? `0 0 24px ${AG.colors.biolume}15, 0 8px 32px rgba(0,0,0,0.4)` : undefined
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: AG.colors.text.primary }}>{r.name}</span>
                            <RiskBadge score={r.risk} />
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: getRiskColor(r.risk), fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>{r.risk}</div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: AG.colors.text.muted }}>
                            <span>📏 {r.distance}</span>
                            <span>📅 {r.days}d</span>
                        </div>
                        {i === 1 && <div style={{ marginTop: 8, fontSize: 11, color: AG.colors.phosphor, fontWeight: 600 }}>✓ RECOMMENDED ROUTE</div>}
                    </FloatCard>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Segment breakdown */}
                <FloatCard delay={0.4} style={{ padding: '24px' }}>
                    <div style={{ fontSize: 12, color: AG.colors.text.muted, letterSpacing: '0.1em', marginBottom: 16, fontFamily: 'JetBrains Mono, monospace' }}>ROUTE SEGMENTS — {route.name}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {route.segments.map((seg, i) => {
                            const color = getRiskColor(seg.risk);
                            return (
                                <motion.div key={seg.name} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <span style={{ fontSize: 12, color: AG.colors.text.secondary }}>{seg.name}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace' }}>{seg.risk}</span>
                                    </div>
                                    <div style={{ height: 8, background: AG.colors.ghost, borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${seg.risk}%` }}
                                            transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: AG.easing.swell }}
                                            style={{ height: '100%', background: `linear-gradient(90deg, ${color}88, ${color})`, boxShadow: `0 0 8px ${color}60`, borderRadius: 99 }}
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </FloatCard>

                {/* Route comparison bar chart */}
                <FloatCard delay={0.5} style={{ padding: '24px' }}>
                    <div style={{ fontSize: 12, color: AG.colors.text.muted, letterSpacing: '0.1em', marginBottom: 16, fontFamily: 'JetBrains Mono, monospace' }}>RISK COMPARISON</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={ROUTES.map(r => ({ name: r.name.split('→')[1].trim(), risk: r.risk, piracy: r.piracy === 'HIGH' ? 80 : r.piracy === 'MODERATE' ? 50 : 20 }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke={AG.colors.current} />
                            <XAxis dataKey="name" tick={{ fill: AG.colors.text.muted, fontSize: 10 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: AG.colors.text.muted, fontSize: 10 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="risk" name="Total Risk" radius={[6, 6, 0, 0]}>
                                {ROUTES.map((r, i) => <Cell key={i} fill={i === selected ? AG.colors.biolume : `${AG.colors.biolume}40`} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </FloatCard>
            </div>

            {/* Route details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
                {[
                    { label: 'Piracy Risk', value: route.piracy, color: route.piracy === 'HIGH' ? AG.colors.coral : route.piracy === 'MODERATE' ? AG.colors.amber : AG.colors.phosphor },
                    { label: 'Weather Risk', value: route.weather, color: route.weather === 'HIGH' ? AG.colors.coral : route.weather === 'MODERATE' ? AG.colors.amber : AG.colors.phosphor },
                    { label: 'Premium Impact', value: route.risk >= 70 ? '+35% loading' : route.risk >= 50 ? '+18% loading' : 'Standard', color: AG.colors.biolume },
                ].map((item, i) => (
                    <FloatCard key={item.label} delay={0.6 + i * 0.1} style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: 10, color: AG.colors.text.muted, letterSpacing: '0.12em', marginBottom: 8, fontFamily: 'JetBrains Mono, monospace' }}>{item.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</div>
                    </FloatCard>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// VIEW 5: BEHAVIOUR MONITOR
// ─────────────────────────────────────────────────────────────
const BehaviourMonitorView = () => {
    const anomalyData = [
        { time: '06:00', expected: 12, actual: 12, deviation: 0 },
        { time: '08:00', expected: 12, actual: 13, deviation: 1 },
        { time: '10:00', expected: 12, actual: 18, deviation: 6 },
        { time: '12:00', expected: 12, actual: 8, deviation: 4 },
        { time: '14:00', expected: 11, actual: 5, deviation: 6 },
        { time: '16:00', expected: 11, actual: 14, deviation: 3 },
        { time: '18:00', expected: 11, actual: 11, deviation: 0 },
        { time: '20:00', expected: 10, actual: 3, deviation: 7 },
    ];

    const anomalies = [
        { type: 'Speed Anomaly', severity: 'HIGH', desc: 'Vessel reduced speed from 12kn to 3kn at 20:00 UTC. Possible mechanical issue or suspicious stop.', score: 0.82 },
        { type: 'Route Deviation', severity: 'HIGH', desc: 'Vessel deviated 28nm from planned route near Yemeni waters at 14:00 UTC.', score: 0.76 },
        { type: 'AIS Gap', severity: 'MODERATE', desc: 'AIS signal lost for 47 minutes at 10:00 UTC in moderate coverage zone.', score: 0.61 },
    ];

    return (
        <div>
            <SectionHeader title="Vessel Behaviour Monitor" subtitle="AI-powered anomaly detection — MV Ocean Star" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                <FloatCard delay={0} style={{ padding: '20px' }}>
                    <div style={{ fontSize: 10, color: AG.colors.text.muted, letterSpacing: '0.12em', marginBottom: 8, fontFamily: 'JetBrains Mono, monospace' }}>ANOMALY SCORE (AI)</div>
                    <div style={{ fontSize: 40, fontWeight: 900, color: AG.colors.coral, fontFamily: 'JetBrains Mono, monospace' }}>0.82</div>
                    <div style={{ fontSize: 12, color: AG.colors.coral }}>HIGH ANOMALY DETECTED</div>
                </FloatCard>
                <StatCard label="Speed Deviations" value="3" color={AG.colors.amber} icon="💨" delay={0.1} />
                <StatCard label="AIS Dark Periods" value="2" color={AG.colors.coral} icon="📡" delay={0.2} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <FloatCard delay={0.3} style={{ padding: '24px' }}>
                    <div style={{ fontSize: 12, color: AG.colors.text.muted, letterSpacing: '0.1em', marginBottom: 16, fontFamily: 'JetBrains Mono, monospace' }}>SPEED PROFILE — EXPECTED VS ACTUAL</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={anomalyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={AG.colors.current} />
                            <XAxis dataKey="time" tick={{ fill: AG.colors.text.muted, fontSize: 10 }} />
                            <YAxis tick={{ fill: AG.colors.text.muted, fontSize: 10 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Line type="monotone" dataKey="expected" name="Expected Speed (kn)" stroke={AG.colors.phosphor} strokeWidth={2} strokeDasharray="6 3" dot={false} />
                            <Line type="monotone" dataKey="actual" name="Actual Speed (kn)" stroke={AG.colors.coral} strokeWidth={2} dot={{ fill: AG.colors.coral, r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </FloatCard>

                <FloatCard delay={0.4} style={{ padding: '24px' }}>
                    <div style={{ fontSize: 12, color: AG.colors.text.muted, letterSpacing: '0.1em', marginBottom: 16, fontFamily: 'JetBrains Mono, monospace' }}>DEVIATION MAGNITUDE</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={anomalyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={AG.colors.current} />
                            <XAxis dataKey="time" tick={{ fill: AG.colors.text.muted, fontSize: 10 }} />
                            <YAxis tick={{ fill: AG.colors.text.muted, fontSize: 10 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="deviation" name="Deviation (kn)" radius={[4, 4, 0, 0]}>
                                {anomalyData.map((d, i) => <Cell key={i} fill={d.deviation > 5 ? AG.colors.coral : d.deviation > 2 ? AG.colors.amber : AG.colors.phosphor} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </FloatCard>
            </div>

            {/* Anomaly Cards */}
            <FloatCard delay={0.5} style={{ padding: '24px' }}>
                <div style={{ fontSize: 12, color: AG.colors.text.muted, letterSpacing: '0.1em', marginBottom: 16, fontFamily: 'JetBrains Mono, monospace' }}>DETECTED ANOMALIES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {anomalies.map((a, i) => {
                        const color = a.severity === 'HIGH' ? AG.colors.coral : AG.colors.amber;
                        return (
                            <motion.div key={a.type} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
                                style={{ display: 'flex', gap: 16, padding: '16px', background: `${color}08`, border: `1px solid ${color}25`, borderRadius: 12 }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 60 }}>
                                    <div style={{ fontSize: 20, fontWeight: 900, color, fontFamily: 'JetBrains Mono, monospace' }}>{a.score}</div>
                                    <div style={{ fontSize: 9, color, letterSpacing: '0.1em' }}>SCORE</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: AG.colors.text.primary }}>{a.type}</span>
                                        <RiskBadge tier={a.severity} score={a.severity === 'HIGH' ? 75 : 45} />
                                    </div>
                                    <div style={{ fontSize: 12, color: AG.colors.text.muted }}>{a.desc}</div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </FloatCard>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// VIEW 6: AI RISK REPORT (Claude API)
// ─────────────────────────────────────────────────────────────
const AIReportView = () => {
    const [report, setReport] = useState('');
    const [loading, setLoading] = useState(false);
    const [vessel, setVessel] = useState(MOCK_VESSELS[0]);

    const SYSTEM_PROMPT = `You are NAVIGATOR, an expert AI risk intelligence system for marine insurance. 
Generate a professional voyage risk assessment report. 
Structure your response with clear sections:
1. EXECUTIVE SUMMARY
2. VESSEL RISK PROFILE
3. VOYAGE RISK BREAKDOWN
4. KEY RISK DRIVERS
5. ANOMALY ALERTS
6. RECOMMENDED ACTIONS
7. PREMIUM LOADING RECOMMENDATION

Use maritime industry terminology. Be specific with numbers, coordinates, and percentages.
Keep the report concise but comprehensive (about 400 words).`;

    const generateReport = async () => {
        setLoading(true);
        setReport('');
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    system: SYSTEM_PROMPT,
                    messages: [{
                        role: 'user',
                        content: `Generate a voyage risk assessment for:
Vessel: ${vessel.name} (${vessel.flag})
Type: ${vessel.type}
Route: ${vessel.route}
Current Risk Score: ${vessel.risk}/100
Reliability Score: ${vessel.reliability}/100
Insurance Tier: ${vessel.tier}
AIS Status: ${vessel.ais ? 'Active' : 'DARK - Signal Lost'}
Current Status: ${vessel.status}
Weather Risk: MODERATE (Storm systems forecast)
Piracy Risk: HIGH (3 recent incidents Gulf of Aden)
Port Congestion: MODERATE (12h delay Suez)`
                    }]
                })
            });
            const data = await response.json();
            const text = data.content?.map(c => c.text || '').join('') || 'Unable to generate report.';

            // Typewriter effect (Antigravity: ag-typewriter-report)
            let i = 0;
            const interval = setInterval(() => {
                setReport(text.slice(0, i));
                i += 3;
                if (i > text.length) clearInterval(interval);
            }, 10);
        } catch (err) {
            setReport('⚠️ API connection required. Connect Claude API to generate live reports.\n\n[DEMO MODE]\n\n═══════════════════════════════\nVOYAGE RISK ASSESSMENT REPORT\nNAVIGATOR Intelligence System\n═══════════════════════════════\n\n1. EXECUTIVE SUMMARY\n\nVessel MV Ocean Star presents a HIGH-risk profile (72/100) for its Dubai–Suez transit. Passage through the Gulf of Aden piracy corridor combined with active storm systems creates compounding risk factors requiring specialist underwriter review and mandatory war risk endorsement.\n\n2. VESSEL RISK PROFILE\n\nReliability Score: 82/100 (GOOD)\nFleet Age Factor: 8 years — within acceptable range\nMaintenance Record: 2 minor incidents (last 24 months)\nFlag State Compliance: Panama — standard monitoring\nInsurance Tier: HIGH — elevated premium loading required\n\n3. VOYAGE RISK BREAKDOWN\n\nWeather Risk:    42pts (Weight: 40%) — Storm forecast 45kn winds\nPiracy Risk:     22pts (Weight: 30%) — 3 incidents, 24h radius\nCongestion Risk: 8pts  (Weight: 20%) — 47 vessels queued, Suez\nBehaviour Risk:  0pts  (Weight: 10%) — No anomalies detected\n\nTOTAL VOYAGE RISK SCORE: 72/100 — HIGH\n\n4. KEY RISK DRIVERS\n\n• Passage through Bab-el-Mandeb strait (active threat zone)\n• Sea state 5-6 forecast between 14:00-22:00 UTC\n• Suez Canal congestion: estimated 12h additional delay\n• Yemen EEZ proximity — elevated threat level\n\n5. ANOMALY ALERTS\n\n⚠️  AIS signal stable — continuous monitoring in place\n⚠️  Speed profile nominal — no deviations detected\n✓   Route compliance: vessel on filed track\n\n6. RECOMMENDED ACTIONS\n\n→ Issue voyage policy with war risk endorsement\n→ Require armed security team through Gulf of Aden\n→ Notify P&I Club of high-risk passage\n→ 6-hourly position reporting requirement\n→ Alternative routing via Cape of Good Hope: Risk 38/100\n\n7. PREMIUM LOADING\n\nBase Premium:        $2,400\nRisk Loading (HIGH): +28% = $672\nWar Risk Rider:      $1,800\nTotal Recommended:   $4,872\n\nValidity: 72 hours from report generation\nIssued by: NAVIGATOR AI Intelligence System');
        }
        setLoading(false);
    };

    return (
        <div>
            <SectionHeader title="AI Risk Report Generator" subtitle="Claude-powered underwriting intelligence — live generation" />

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
                {/* Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <FloatCard delay={0} style={{ padding: '20px' }}>
                        <div style={{ fontSize: 11, color: AG.colors.text.muted, letterSpacing: '0.1em', marginBottom: 12, fontFamily: 'JetBrains Mono, monospace' }}>SELECT VESSEL</div>
                        {MOCK_VESSELS.map((v, i) => (
                            <motion.button key={v.id} onClick={() => setVessel(v)}
                                style={{
                                    width: '100%', padding: '10px 14px', background: vessel.id === v.id ? `${AG.colors.biolume}15` : 'transparent',
                                    border: `1px solid ${vessel.id === v.id ? AG.colors.biolume + '40' : 'transparent'}`,
                                    borderRadius: 8, cursor: 'pointer', textAlign: 'left', marginBottom: 4, display: 'flex', justifyContent: 'space-between'
                                }}
                            >
                                <span style={{ fontSize: 12, color: vessel.id === v.id ? AG.colors.biolume : AG.colors.text.secondary }}>{v.name}</span>
                                <RiskBadge tier={v.tier} score={v.risk} />
                            </motion.button>
                        ))}
                    </FloatCard>

                    <FloatCard delay={0.2} style={{ padding: '20px' }}>
                        <div style={{ fontSize: 11, color: AG.colors.text.muted, letterSpacing: '0.1em', marginBottom: 12, fontFamily: 'JetBrains Mono, monospace' }}>SELECTED VESSEL</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: AG.colors.text.primary, marginBottom: 4 }}>{vessel.name}</div>
                        <div style={{ fontSize: 12, color: AG.colors.text.muted, marginBottom: 12 }}>{vessel.route}</div>
                        <ScoreRing score={vessel.risk} size={80} strokeWidth={6} />
                    </FloatCard>

                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={generateReport} disabled={loading}
                        style={{
                            padding: '16px', borderRadius: 12, border: 'none', cursor: loading ? 'wait' : 'pointer',
                            background: loading ? AG.colors.deep : `linear-gradient(135deg, ${AG.colors.biolume}cc, ${AG.colors.biolume}88)`,
                            color: loading ? AG.colors.text.muted : AG.colors.void, fontSize: 14, fontWeight: 700,
                            boxShadow: loading ? 'none' : `0 0 30px ${AG.colors.biolume}40`, letterSpacing: '0.05em'
                        }}
                    >
                        {loading ? (
                            <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                                ⚡ GENERATING...
                            </motion.span>
                        ) : '📋 GENERATE REPORT'}
                    </motion.button>
                </div>

                {/* Report Output */}
                <FloatCard delay={0.3} style={{ padding: '28px', minHeight: 500 }}>
                    {!report && !loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, opacity: 0.4 }}>
                            <div style={{ fontSize: 48 }}>📋</div>
                            <div style={{ fontSize: 14, color: AG.colors.text.muted, textAlign: 'center' }}>Select a vessel and click Generate Report<br />to produce an AI-powered underwriting assessment</div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${AG.colors.current}` }}>
                                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ width: 8, height: 8, borderRadius: 99, background: AG.colors.biolume, boxShadow: `0 0 10px ${AG.colors.biolume}` }} />
                                <span style={{ fontSize: 12, color: AG.colors.biolume, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
                                    {loading ? 'NAVIGATOR AI GENERATING...' : 'NAVIGATOR AI REPORT'}
                                </span>
                            </div>
                            <pre style={{
                                fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.8,
                                color: AG.colors.text.secondary, whiteSpace: 'pre-wrap', margin: 0
                            }}>
                                {report}
                                {loading && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ color: AG.colors.biolume }}>█</motion.span>}
                            </pre>
                        </div>
                    )}
                </FloatCard>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function MaritimePlatform() {
    const [activeView, setActiveView] = useState('map');

    const views = {
        map: <GlobalMapView />,
        vessel: <VesselProfileView />,
        voyage: <VoyageDashboardView />,
        route: <RouteSimulatorView />,
        behaviour: <BehaviourMonitorView />,
        report: <AIReportView />,
    };

    return (
        <div style={{
            display: 'flex', minHeight: '100vh',
            width: '100%',
            background: AG.colors.void,
            fontFamily: '"DM Sans", "Segoe UI", sans-serif',
            color: AG.colors.text.primary,
        }}>
            {/* Google Fonts */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.2); border-radius:99px; }
        button { font-family: inherit; }
      `}</style>

            <Sidebar active={activeView} setActive={setActiveView} />

            {/* Main content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '32px 36px' }}>
                {/* Top bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div>
                        <motion.div key={activeView} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                            style={{ fontSize: 13, color: AG.colors.text.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
                            marineInsight
                        </motion.div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ fontSize: 12, color: AG.colors.text.muted, fontFamily: 'JetBrains Mono, monospace' }}>
                            {new Date().toUTCString().slice(0, 25)} UTC
                        </div>
                        <div style={{ padding: '8px 16px', background: `${AG.colors.phosphor}15`, border: `1px solid ${AG.colors.phosphor}30`, borderRadius: 99, fontSize: 12, color: AG.colors.phosphor, fontFamily: 'JetBrains Mono, monospace', display: 'flex', gap: 6, alignItems: 'center' }}>
                            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                                style={{ width: 6, height: 6, borderRadius: 99, background: AG.colors.phosphor }} />
                            LIVE DATA FEED
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <AnimatePresence mode="wait">
                    <motion.div key={activeView}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.4, ease: AG.easing.swell }}
                    >
                        {views[activeView]}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
