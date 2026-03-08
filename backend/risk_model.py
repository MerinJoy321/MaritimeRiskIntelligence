import random


def weather_risk():
    wind = random.randint(5, 35)

    if wind > 25:
        return 0.9
    elif wind > 15:
        return 0.5
    else:
        return 0.2


def piracy_risk(lat, lon):
    piracy_zone = (12.0, 60.0)

    dist = abs(lat - piracy_zone[0]) + abs(lon - piracy_zone[1])

    if dist < 10:
        return 0.8
    elif dist < 20:
        return 0.5
    else:
        return 0.2


def congestion_risk(index):
    return index


def anomaly_risk(speed):
    if speed > 30:
        return 0.8
    elif speed < 2:
        return 0.6
    else:
        return 0.2


def calculate_risk(lat, lon, speed, congestion):

    w = weather_risk()
    p = piracy_risk(lat, lon)
    c = congestion_risk(congestion)
    a = anomaly_risk(speed)

    risk = (
        0.35 * w +
        0.30 * p +
        0.20 * c +
        0.15 * a
    )

    return round(risk * 100, 2)