import pandas as pd

def load_vessel_data():
    # Adjusted filename to match the file found in the data/ directory
    # Original: "data/AIS_2023_01_Zone10.csv"
    try:
        df = pd.read_csv(
            "data/AIS_2023_01_01.csv",
            nrows=5000   # prevents loading huge file
        )
    except FileNotFoundError:
        # Fallback to the original name if specifically required
        df = pd.read_csv(
            "data/AIS_2023_01_Zone10.csv",
            nrows=5000
        )

    df = df[[
        "MMSI",
        "LAT",
        "LON",
        "SOG"
    ]]

    df = df.dropna()

    return df