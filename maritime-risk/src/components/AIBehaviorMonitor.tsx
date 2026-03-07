// @ts-nocheck
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeVesselBehaviour } from "../services/anomalyDetection";
import { telemetryData } from "../data/vesselTelemetry";

// ANTIGRAVITY DESIGN TOKENS
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
        text: { primary: '#e8f4f8', secondary: '#7fb3c8', muted: '#4a7a8a' }
    },
    easing: { swell: [0.23, 1, 0.32, 1] }
};

const AIBehaviorMonitor = () => {
    const [vesselData, setVesselData] = useState(telemetryData.oceanStar);
    const [analysis, setAnalysis] = useState({ anomaly: false, reasons: [], confidence: 0.98 });
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setVesselData(prev => {
                // Simulate telemetry jitter and occasional anomalies
                const isSpike = Math.random() > 0.85; // 15% chance of speed spike
                const isDeviation = Math.random() > 0.9; // 10% chance of route deviation
                
                const newLatestSpeed = isSpike 
                    ? Math.round(prev.latestSpeed + 15 + Math.random() * 5)
                    : Math.round(12 + Math.random() * 4);

                const newPosition = {
                    lat: isDeviation ? prev.currentPosition.lat + 1.2 : 23.2 + (Math.random() - 0.5) * 0.1,
                    lon: prev.currentPosition.lon + (Math.random() - 0.5) * 0.1
                };

                const updated = {
                    ...prev,
                    latestSpeed: newLatestSpeed,
                    currentPosition: newPosition,
                    piracyZoneNearby: isSpike || Math.random() > 0.8
                };

                // Run XAI Analysis
                const result = analyzeVesselBehaviour(updated);
                setAnalysis(result);
                setLastUpdated(new Date());

                return updated;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const statusColor = analysis.anomaly ? AG.colors.coral : AG.colors.phosphor;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: AG.easing.swell }}
            style={{
                background: `linear-gradient(135deg, ${AG.colors.abyss} 0%, ${AG.colors.deep} 100%)`,
                border: `1px solid ${analysis.anomaly ? statusColor + '80' : AG.colors.current}`,
                borderRadius: 16,
                padding: '24px',
                boxShadow: analysis.anomaly 
                    ? `0 0 40px ${statusColor}20, 0 8px 32px rgba(0,0,0,0.4)`
                    : `0 8px 32px rgba(0,0,0,0.4)`,
                backdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: AG.colors.text.primary, letterSpacing: '-0.01em' }}>
                        Explainable AI Vessel Behaviour Monitor
                    </h3>
                    <div style={{ fontSize: 10, color: AG.colors.text.muted, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>
                        VESSEL: {vesselData.vesselId.toUpperCase()} • {lastUpdated.toLocaleTimeString()}
                    </div>
                </div>
                <div style={{
                    padding: '4px 12px',
                    borderRadius: 99,
                    background: statusColor + '15',
                    border: `1px solid ${statusColor}40`,
                    fontSize: 10,
                    fontWeight: 700,
                    color: statusColor,
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.1em'
                }}>
                    {analysis.anomaly ? '⚠ ANOMALY DETECTED' : '✓ BEHAVIOUR NORMAL'}
                </div>
            </div>

            {/* XAI Result Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={analysis.anomaly ? 'anomaly' : 'normal'}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    style={{
                        padding: '18px',
                        background: analysis.anomaly ? `${AG.colors.coral}08` : AG.colors.ghost,
                        borderRadius: 12,
                        border: `1px solid ${analysis.anomaly ? AG.colors.coral + '25' : AG.colors.current}`,
                    }}
                >
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <div style={{ fontSize: 24, marginTop: 2 }}>
                            {analysis.anomaly ? '⚠️' : '🛡️'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ 
                                fontSize: 15, 
                                fontWeight: 700, 
                                color: analysis.anomaly ? AG.colors.coral : AG.colors.text.primary,
                                marginBottom: 6
                            }}>
                                {analysis.anomaly ? 'Suspicious Behaviour Flagged' : 'Vessel Operating Within Normal Parameters'}
                            </div>
                            
                            {analysis.anomaly ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ fontSize: 11, color: AG.colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI EXPLANATION (XAI):</div>
                                    {analysis.reasons.map((reason, i) => (
                                        <div key={i} style={{ fontSize: 13, color: AG.colors.text.secondary, display: 'flex', gap: 8 }}>
                                            <span style={{ color: AG.colors.coral }}>•</span> {reason}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ fontSize: 13, color: AG.colors.text.secondary }}>
                                    No anomalies detected. Continuous pattern matching active.
                                </div>
                            )}
                        </div>
                        <div style={{ textAlign: 'right', minWidth: 80 }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: statusColor, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                                {Math.round(analysis.confidence * 100)}%
                            </div>
                            <div style={{ fontSize: 9, color: AG.colors.text.muted, marginTop: 4 }}>CONFIDENCE</div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Live Telemetry Feed */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
                <div style={{ background: AG.colors.ghost, padding: '10px 14px', borderRadius: 8 }}>
                    <div style={{ fontSize: 9, color: AG.colors.text.muted, marginBottom: 4 }}>SPEED</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: vesselData.latestSpeed > 20 ? AG.colors.amber : AG.colors.biolume, fontFamily: 'JetBrains Mono, monospace' }}>
                        {vesselData.latestSpeed} <span style={{ fontSize: 10, fontWeight: 400 }}>kn</span>
                    </div>
                </div>
                <div style={{ background: AG.colors.ghost, padding: '10px 14px', borderRadius: 8 }}>
                    <div style={{ fontSize: 9, color: AG.colors.text.muted, marginBottom: 4 }}>LATITUDE</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: AG.colors.text.primary, fontFamily: 'JetBrains Mono, monospace' }}>
                        {vesselData.currentPosition.lat.toFixed(4)}°
                    </div>
                </div>
                <div style={{ background: AG.colors.ghost, padding: '10px 14px', borderRadius: 8 }}>
                    <div style={{ fontSize: 9, color: AG.colors.text.muted, marginBottom: 4 }}>LONGITUDE</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: AG.colors.text.primary, fontFamily: 'JetBrains Mono, monospace' }}>
                        {vesselData.currentPosition.lon.toFixed(4)}°
                    </div>
                </div>
            </div>

            {/* Scanning Line */}
            <motion.div
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute',
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, ${AG.colors.biolume}40, transparent)`,
                    boxShadow: `0 0 10px ${AG.colors.biolume}20`,
                    pointerEvents: 'none',
                    zIndex: 5
                }}
            />
        </motion.div>
    );
};

export default AIBehaviorMonitor;
