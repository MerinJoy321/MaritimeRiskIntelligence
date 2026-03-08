import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { useEffect, useState } from "react"
import * as L from 'leaflet';

// Use standard URLs for icons to avoid Vite resolution issues
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

if (L.Marker.prototype.options) {
    L.Marker.prototype.options.icon = DefaultIcon;
}

function riskLevel(score) {
  if (score > 60) return { label: "HIGH RISK", color: "red" };
  if (score > 30) return { label: "MEDIUM RISK", color: "orange" };
  return { label: "LOW RISK", color: "green" };
}

export default function VesselMap() {
  const [vessels, setVessels] = useState([])

  useEffect(() => {
    fetch("http://localhost:8000/vessels")
      .then(res => res.json())
      .then(data => {
          console.log("Fetched vessels:", data);
          setVessels(data);
      })
      .catch(err => console.error("Error fetching vessels:", err));
  }, [])

  return (
    <div style={{ padding: "20px" }}>
      <MapContainer center={[30, -90]} zoom={4} style={{ height: "600px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {vessels.map((vessel, index) => {
          const risk = riskLevel(vessel.risk_score);
          return (
            <Marker
              key={index}
              position={[vessel.lat, vessel.lon]}
            >
              <Popup>
                <div style={{ minWidth: "150px" }}>
                  <h3 style={{ margin: "0 0 10px 0", borderBottom: "1px solid #ccc" }}>Vessel Information</h3>
                  <b>MMSI:</b> {vessel.mmsi} <br/>
                  <b>Speed:</b> {vessel.speed} kn <br/>
                  <b>Risk Score:</b> {vessel.risk_score}% <br/>
                  <b style={{ color: risk.color }}>Level: {risk.label}</b>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  )
}
