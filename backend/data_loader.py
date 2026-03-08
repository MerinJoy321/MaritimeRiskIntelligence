import pandas as pd
import os

# Priority order for data sources:
#   1. Full AIS dataset (local only, not in git)
#   2. Committed sample from real AIS data (~200 rows, ships real coords)
#   3. Hardcoded demo rows (last resort)
_CSV_CANDIDATES = [
    "data/AIS_2023_01_01.csv",
    "data/AIS_2023_01_Zone10.csv",
    "data/AIS_sample.csv",      # committed lightweight sample
]

_COLUMNS = ["MMSI", "LAT", "LON", "SOG"]


def load_vessel_data() -> pd.DataFrame:
    """
    Load AIS vessel data.

    Resolution order:
      1. Full CSV (if available locally — not committed to git due to size)
      2. AIS_sample.csv — a 200-row sample of real data committed to the repo
      3. Inline fallback — so the app never crashes even in a bare environment
    """
    for path in _CSV_CANDIDATES:
        if os.path.exists(path):
            label = "full dataset" if "sample" not in path else "sample data"
            print(f"ℹ️  Loading vessel data from {path} ({label})")
            df = pd.read_csv(path, nrows=5000)
            available = [c for c in _COLUMNS if c in df.columns]
            df = df[available].dropna()
            return df

    # Absolute fallback — no files present at all
    print("⚠️  No AIS data files found. Using minimal inline demo vessels.")
    return pd.DataFrame([
        {"MMSI": 311807000, "LAT": 15.60, "LON": -65.87, "SOG": 1.5},
        {"MMSI": 367423000, "LAT": 18.01, "LON": -66.77, "SOG": 0.0},
        {"MMSI": 338234829, "LAT": 12.50, "LON":  58.30, "SOG": 14.0},
        {"MMSI": 566719000, "LAT":  1.30, "LON": 103.80, "SOG": 12.0},
        {"MMSI": 477211900, "LAT": 22.30, "LON": 114.20, "SOG": 16.5},
    ])