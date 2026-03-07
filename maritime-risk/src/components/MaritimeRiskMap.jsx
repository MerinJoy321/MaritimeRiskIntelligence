import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";
import { vessels, riskZones, selectedRoute } from "../data/maritimeMapData";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const getColor = (level) => {
  switch (level.toLowerCase()) {
    case "high":
      return "#ff4757"; // Coral red
    case "medium":
      return "#ffaa00"; // Amber/Orange
    case "low":
      return "#00ff9d"; // Phosphor green
    default:
      return "#e8f4f8";
  }
};

const MaritimeRiskMap = () => {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #061525 0%, #091e38 100%)",
        border: "1px solid rgba(0, 212, 255, 0.12)",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        color: "#e8f4f8",
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: 700 }}>
        Geospatial Risk Visualization
      </h3>
      
      <div style={{ height: "400px", width: "100%", position: "relative" }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 800,
            center: [50, 20], // Centered on Middle East/Indian Ocean
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#162a45"
                  stroke="#091e38"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#1c3a5e", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Render Selected Route */}
          <Line
            coordinates={selectedRoute.map((p) => [p.lon, p.lat])}
            stroke="#00d4ff"
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Render Risk Zones */}
          {riskZones.map(({ id, name, lat, lon, level }) => (
            <Marker key={id} coordinates={[lon, lat]}>
              <circle r={12} fill={getColor(level)} opacity={0.3} />
              <circle r={4} fill={getColor(level)} />
              <text
                textAnchor="middle"
                y={-18}
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "10px",
                  fill: "#e8f4f8",
                  fontWeight: 600,
                }}
              >
                {name}
              </text>
            </Marker>
          ))}

          {/* Render Vessels */}
          {vessels.map(({ id, name, lat, lon, risk }) => (
            <Marker key={id} coordinates={[lon, lat]}>
              <g transform="translate(-6, -6)">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  fill={getColor(risk)}
                  transform="scale(0.5)"
                />
              </g>
              <text
                textAnchor="middle"
                y={15}
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "9px",
                  fill: "#7fb3c8",
                }}
              >
                {name}
              </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          fontSize: "11px",
          fontFamily: "JetBrains Mono, monospace",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff4757" }} />
          <span>High Risk</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffaa00" }} />
          <span>Med Risk</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#00ff9d" }} />
          <span>Low Risk</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "20px", height: "2px", background: "#00d4ff" }} />
          <span>Active Route</span>
        </div>
      </div>
    </div>
  );
};

export default MaritimeRiskMap;
