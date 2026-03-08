import pandas as pd
import os

csv_path = "data/AIS_2023_01_01.csv"
out_path = "data/AIS_sample.csv"

if not os.path.exists(csv_path):
    print("ERROR: CSV not found at", csv_path)
    exit(1)

df = pd.read_csv(csv_path, nrows=2000)
df = df[["MMSI", "LAT", "LON", "SOG"]].dropna()

# Take a geographically diverse sample: sort by LAT to spread coverage
df = df.sort_values("LAT").reset_index(drop=True)
# Pick every Nth row to get ~200 spread-out records
step = max(1, len(df) // 200)
sample = df.iloc[::step].head(200).reset_index(drop=True)

sample.to_csv(out_path, index=False)
size_kb = os.path.getsize(out_path) / 1024
print(f"Saved {len(sample)} rows to {out_path} ({size_kb:.1f} KB)")
print(sample.head(5).to_string())
