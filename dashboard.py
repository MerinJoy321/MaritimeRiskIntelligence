import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import pydeck as pdk
from datetime import datetime, timedelta
import os


# --- ANTIGRAVITY Design Tokens ---
AG_COLORS = {
    'void': '#030d1c',
    'abyss': '#061525',
    'deep': '#091e38',
    'biolume': '#00d4ff',
    'phosphor': '#00ff9d',
    'amber': '#ffaa00',
    'coral': '#ff4757',
    'text_primary': '#e8f4f8',
    'text_secondary': '#7fb3c8',
    'text_muted': '#4a7a8a',
    'current': 'rgba(0,212,255,0.12)',
    'ghost': 'rgba(255,255,255,0.04)'
}

# --- Page Configuration ---
st.set_page_config(
    page_title="NAVIGATOR | Maritime Intel",
    page_icon="🌐",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- CSS Injection ---
def inject_ag_styles():
    st.markdown(f"""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');
        
        /* Main Container */
        .stApp {{
            background-color: {AG_COLORS['void']};
            color: {AG_COLORS['text_primary']};
            font-family: 'Inter', sans-serif;
        }}
        
        /* Sidebar */
        [data-testid="stSidebar"] {{
            background-color: {AG_COLORS['void']};
            border-right: 1px solid {AG_COLORS['current']};
        }}
        
        /* Headers */
        h1, h2, h3 {{
            color: {AG_COLORS['text_primary']};
            font-weight: 800 !important;
            letter-spacing: -0.02em;
        }}
        
        /* Custom Card */
        .ag-card {{
            background: linear-gradient(135deg, {AG_COLORS['abyss']} 0%, {AG_COLORS['deep']} 100%);
            border: 1px solid {AG_COLORS['current']};
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            margin-bottom: 20px;
        }}
        
        /* Metric Styling */
        [data-testid="stMetricValue"] {{
            font-family: 'JetBrains Mono', monospace;
            font-weight: 800;
            color: {AG_COLORS['biolume']};
        }}
        
        /* Hide Default Elements */
        #MainMenu {{visibility: hidden;}}
        footer {{visibility: hidden;}}
        header {{visibility: hidden;}}
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {{
            width: 6px;
        }}
        ::-webkit-scrollbar-track {{
            background: {AG_COLORS['void']};
        }}
        ::-webkit-scrollbar-thumb {{
            background: {AG_COLORS['current']};
            border-radius: 10px;
        }}
        </style>
    """, unsafe_allow_html=True)

inject_ag_styles()

# --- Data Engine ---
@st.cache_data
def get_enhanced_data():
    np.random.seed(42)
    n_vessels = 5
    n_rows = 100
    start_time = datetime.now() - timedelta(days=2)
    
    vessels = [
        {'id': 'V001', 'name': 'MV Ocean Star', 'flag': '🇵🇦', 'type': 'Bulk Carrier', 'route': 'Dubai → Suez', 'risk': 72, 'status': 'En Route', 'reliability': 82, 'tier': 'HIGH'},
        {'id': 'V002', 'name': 'MT Nordic Pearl', 'flag': '🇳🇴', 'type': 'Oil Tanker', 'route': 'Rotterdam → NY', 'risk': 38, 'status': 'En Route', 'reliability': 91, 'tier': 'MODERATE'},
        {'id': 'V003', 'name': 'MV Fortune Bay', 'flag': '🇱🇷', 'type': 'Container', 'route': 'Shanghai → LA', 'risk': 21, 'status': 'Port', 'reliability': 67, 'tier': 'LOW'},
        {'id': 'V004', 'name': 'MV Aden Horizon', 'flag': '🇲🇭', 'type': 'Cargo', 'route': 'Djibouti → Mumbai', 'risk': 89, 'status': 'Delayed', 'reliability': 55, 'tier': 'CRITICAL'},
        {'id': 'V005', 'name': 'MV Cape Pioneer', 'flag': '🇵🇦', 'type': 'Bulk', 'route': 'Cape → Hamburg', 'risk': 44, 'status': 'En Route', 'reliability': 78, 'tier': 'MODERATE'},
    ]
    
    data_list = []
    for v in vessels:
        for i in range(20):
            data_list.append({
                'vessel_id': v['id'],
                'vessel_name': v['name'],
                'flag': v['flag'],
                'type': v['type'],
                'lat': 10 + np.random.randn() * 10,
                'lon': 40 + np.random.randn() * 10,
                'timestamp': start_time + timedelta(hours=i*2),
                'risk_score': max(0, min(100, v['risk'] + np.random.uniform(-5, 5))),
                'weather_risk': np.random.uniform(10, 60),
                'piracy_risk': np.random.uniform(5, 80),
                'reliability': v['reliability'],
                'status': v['status']
            })
            
    return pd.DataFrame(data_list), vessels

df, vessel_list = get_enhanced_data()

# --- Shared UI Components ---
def risk_badge(score):
    color = AG_COLORS['phosphor'] if score < 31 else AG_COLORS['amber'] if score < 56 else "#ff8c00" if score < 76 else AG_COLORS['coral']
    label = "LOW" if score < 31 else "MODERATE" if score < 56 else "HIGH" if score < 76 else "CRITICAL"
    return f'<span style="background: {color}18; border: 1px solid {color}40; color: {color}; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; font-family: \'JetBrains Mono\';">{label}</span>'

# --- Sidebar Navigation ---
with st.sidebar:
    st.markdown(f"""
        <div style="display: flex; alignItems: center; gap: 10px; margin-bottom: 20px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, {AG_COLORS['biolume']}22, {AG_COLORS['biolume']}44); 
                        border: 1px solid {AG_COLORS['biolume']}40; display: flex; align-items: center; justify-content: center; font-size: 18px;">🌐</div>
            <div>
                <div style="font-size: 14px; font-weight: 800; color: {AG_COLORS['text_primary']}; letter-spacing: -0.02em;">NAVIGATOR</div>
                <div style="font-size: 10px; color: {AG_COLORS['biolume']}; letter-spacing: 0.15em; font-family: 'JetBrains Mono';">MARINE INTEL</div>
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    st.markdown(f"""
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
            <div style="width: 7px; height: 7px; border-radius: 99px; background: {AG_COLORS['phosphor']}; box-shadow: 0 0 8px {AG_COLORS['phosphor']};"></div>
            <span style="font-size: 11px; color: {AG_COLORS['phosphor']}; font-family: 'JetBrains Mono'; letter-spacing: 0.1em;">LIVE TRACKING</span>
        </div>
    """, unsafe_allow_html=True)
    
    nav_item = st.radio(
        "Navigation",
        ["Global Risk Map", "Vessel Risk Profile", "Voyage Dashboard", "Route Simulator"],
        label_visibility="collapsed"
    )
    
    st.markdown("---")
    st.markdown(f"""
        <div style="padding: 10px 0;">
            <div style="font-size: 11px; color: {AG_COLORS['text_muted']}; font-family: 'JetBrains Mono'; margin-bottom: 4px;">VESSELS TRACKED</div>
            <div style="font-size: 24px; font-weight: 800; color: {AG_COLORS['biolume']}; font-family: 'JetBrains Mono';">1,247</div>
            <div style="font-size: 11px; color: {AG_COLORS['text_muted']};">across 23 trade lanes</div>
        </div>
    """, unsafe_allow_html=True)

# --- View 1: Global Risk Map ---
if nav_item == "Global Risk Map":
    st.title("Global Maritime Risk Map")
    st.markdown(f'<p style="color: {AG_COLORS["text_muted"]}; font-family: \'JetBrains Mono\'; font-size: 13px;">Real-time vessel positions and risk heatmap</p>', unsafe_allow_html=True)
    
    col1, col2, col3, col4 = st.columns(4)
    with col1: st.metric("Active Vessels", "1,247", delta=None)
    with col2: st.metric("High Risk Zones", "7", delta="2", delta_color="inverse")
    with col3: st.metric("Piracy Alerts", "3", delta=None)
    with col4: st.metric("Storm Systems", "5", delta=None)
    
    # Pydeck Map
    view_state = pdk.ViewState(latitude=15, longitude=45, zoom=2.5, pitch=45)
    
    layer = pdk.Layer(
        "ScatterplotLayer",
        df,
        get_position=["lon", "lat"],
        get_color="[255, 71, 87, 160]" if True else "[0, 212, 255, 160]",
        get_radius=50000,
        pickable=True,
    )
    
    st.pydeck_chart(pdk.Deck(
        layers=[layer],
        initial_view_state=view_state,
        map_style="mapbox://styles/mapbox/dark-v10",
        tooltip={"text": "{vessel_name}\nRisk: {risk_score:.0f}"}
    ))

# --- View 2: Vessel Risk Profile ---
elif nav_item == "Vessel Risk Profile":
    st.title("Vessel Risk Profile Dashboard")
    
    col_list, col_detail = st.columns([1, 2.5])
    
    with col_list:
        selected_vessel_name = st.selectbox("Select Vessel", [v['name'] for v in vessel_list])
        selected_vessel = next(v for v in vessel_list if v['name'] == selected_vessel_name)
        
        for v in vessel_list:
            is_active = v['name'] == selected_vessel_name
            border_color = AG_COLORS['biolume'] if is_active else AG_COLORS['current']
            st.markdown(f"""
                <div class="ag-card" style="padding: 16px; border-color: {border_color}60;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <div style="font-size: 13px; font-weight: 700;">{v['flag']} {v['name']}</div>
                            <div style="font-size: 11px; color: {AG_COLORS['text_muted']}">{v['type']}</div>
                        </div>
                        {risk_badge(v['risk'])}
                    </div>
                </div>
            """, unsafe_allow_html=True)
            
    with col_detail:
        # Vessel Header
        st.markdown(f"""
            <div class="ag-card">
                <div style="display: flex; align-items: center; gap: 24px;">
                    <div style="width: 72px; height: 72px; border-radius: 16px; background: {AG_COLORS['ghost']}; display: flex; align-items: center; justify-content: center; font-size: 36px; border: 1px solid {AG_COLORS['current']};">🚢</div>
                    <div style="flex: 1;">
                        <div style="font-size: 22px; font-weight: 800; color: {AG_COLORS['text_primary']}; margin-bottom: 4px;">{selected_vessel['flag']} {selected_vessel['name']}</div>
                        <div style="display: flex; gap: 16px;">
                            <span style="font-size: 12px; color: {AG_COLORS['text_muted']};">Type: <b style="color: {AG_COLORS['text_secondary']}">{selected_vessel['type']}</b></span>
                            <span style="font-size: 12px; color: {AG_COLORS['text_muted']};">Status: <b style="color: {AG_COLORS['text_secondary']}">{selected_vessel['status']}</b></span>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: 800; color: {AG_COLORS['biolume']}; font-family: 'JetBrains Mono';">{selected_vessel['reliability']}</div>
                        <div style="font-size: 10px; color: {AG_COLORS['text_muted']};">RELIABILITY</div>
                    </div>
                </div>
            </div>
        """, unsafe_allow_html=True)
        
        # Radar Chart using Plotly
        categories = ['Weather', 'Piracy', 'Congestion', 'Mechanical', 'Geopolitical']
        fig = go.Figure()
        fig.add_trace(go.Scatterpolar(
            r=[72, 89, 45, 28, 65],
            theta=categories,
            fill='toself',
            name='Risk Profile',
            line_color=AG_COLORS['coral'],
            fillcolor=f"{AG_COLORS['coral']}44"
        ))
        fig.update_layout(
            polar=dict(
                radialaxis=dict(visible=True, range=[0, 100], color=AG_COLORS['text_muted']),
                bgcolor='rgba(0,0,0,0)'
            ),
            paper_bgcolor='rgba(0,0,0,0)',
            font_color=AG_COLORS['text_muted'],
            height=300,
            margin=dict(l=40, r=40, t=10, b=10)
        )
        st.plotly_chart(fig, use_container_width=True)

# --- View 3: Voyage Dashboard ---
elif nav_item == "Voyage Dashboard":
    st.title("Voyage Risk Dashboard")
    st.markdown(f'<p style="color: {AG_COLORS["text_secondary"]}; font-weight: 700;">MV Ocean Star — Dubai → Suez Canal</p>', unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3)
    with col1: st.metric("Voyage Risk Score", "72", delta="12%", delta_color="inverse")
    with col2: st.metric("Weather Risk", "MODERATE", delta=None)
    with col3: st.metric("Piracy Risk", "HIGH", delta=None)
    
    # Risk Timeline Area Chart
    v_data = df[df['vessel_id'] == 'V001']
    fig_time = px.area(v_data, x='timestamp', y='risk_score', color_discrete_sequence=[AG_COLORS['coral']])
    fig_time.update_layout(
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        xaxis=dict(showgrid=True, gridcolor=AG_COLORS['current']),
        yaxis=dict(showgrid=True, gridcolor=AG_COLORS['current']),
        font_color=AG_COLORS['text_muted'],
        height=300
    )
    st.plotly_chart(fig_time, use_container_width=True)
    
    # Alerts
    st.markdown(f'<div style="font-size: 12px; color: {AG_COLORS["text_muted"]}; letter-spacing: 0.1em; margin-bottom: 16px; font-family: \'JetBrains Mono\';">ACTIVE ALERTS</div>', unsafe_allow_html=True)
    col_a1, col_a2, col_a3 = st.columns(3)
    alerts = [
        {"type": "CRITICAL", "icon": "🏴‍☠️", "title": "Piracy Alert", "color": AG_COLORS['coral']},
        {"type": "WARNING", "icon": "⛈️", "title": "Storm System", "color": AG_COLORS['amber']},
        {"type": "INFO", "icon": "⚓", "title": "Port Delay", "color": AG_COLORS['biolume']}
    ]
    for i, a in enumerate(alerts):
        with [col_a1, col_a2, col_a3][i]:
            st.markdown(f"""
                <div style="padding: 16px; background: {a['color']}08; border: 1px solid {a['color']}30; border-radius: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 18px;">{a['icon']}</span>
                        <span style="font-size: 11px; font-weight: 700; color: {a['color']}; font-family: 'JetBrains Mono';">{a['type']}</span>
                    </div>
                    <div style="font-size: 13px; font-weight: 700;">{a['title']}</div>
                </div>
            """, unsafe_allow_html=True)

# --- View 4: Route Simulator ---
else:
    st.title("Route Risk Simulator")
    st.info("AI-powered route optimization coming soon. Comparing Dubai → Suez routes...")
    
    routes = [
        {'name': 'Direct Path', 'risk': 72, 'dist': '3,450nm', 'days': 14},
        {'name': 'Deep Sea Alt', 'risk': 38, 'dist': '9,200nm', 'days': 28},
        {'name': 'Coastal Guarded', 'risk': 55, 'dist': '3,800nm', 'days': 16}
    ]
    
    cols = st.columns(3)
    for i, r in enumerate(routes):
        with cols[i]:
            is_rec = i == 1
            st.markdown(f"""
                <div class="ag-card" style="border-color: {AG_COLORS['biolume'] if is_rec else AG_COLORS['current']}">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 12px; font-weight: 700;">{r['name']}</span>
                        {risk_badge(r['risk'])}
                    </div>
                    <div style="font-size: 32px; font-weight: 900; color: {AG_COLORS['coral'] if r['risk'] > 70 else AG_COLORS['biolume']}; font-family: 'JetBrains Mono';">{r['risk']}</div>
                    <div style="font-size: 11px; color: {AG_COLORS['text_muted']};">📏 {r['dist']} | 📅 {r['days']} days</div>
                    {'<div style="margin-top: 8px; font-size: 11px; color: '+AG_COLORS['phosphor']+'; font-weight: 600;">✓ RECOMMENDED</div>' if is_rec else ''}
                </div>
            """, unsafe_allow_html=True)

# Footer
st.markdown("---")
st.caption("NAVIGATOR AI Maritime Intel Prototype v1.2 • ANTIGRAVITY Design System")
st.caption("• Hackathon Prototype v1.0")
