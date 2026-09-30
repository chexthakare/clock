/* ============================================================
   Time Bridge - solar position helpers
   ------------------------------------------------------------
   Pure calculations, no DOM and no WebGL, so they can be tested
   on their own. Accuracy is well under a degree, which is far
   more than a sky background needs.
   ============================================================ */

export const RAD = Math.PI / 180;
export const DAY_MS = 86400000;
export const SUN_H0 = -0.833; // altitude counted as sunrise / sunset

export function mod360(value) {
  return ((value % 360) + 360) % 360;
}

/** Sun altitude, azimuth and hour angle for a moment at a place. */
export function solarState(date, lat, lon) {
  const days = date.getTime() / DAY_MS - 10957.5; // days since J2000.0
  const meanLong = mod360(280.46 + 0.9856474 * days);
  const anomaly = (357.528 + 0.9856003 * days) * RAD;
  const eclipticLong = (meanLong + 1.915 * Math.sin(anomaly) + 0.02 * Math.sin(2 * anomaly)) * RAD;
  const obliquity = (23.439 - 4e-7 * days) * RAD;

  const declination = Math.asin(Math.sin(obliquity) * Math.sin(eclipticLong));
  const rightAsc = Math.atan2(Math.cos(obliquity) * Math.sin(eclipticLong), Math.cos(eclipticLong));
  const sidereal = mod360(280.46061837 + 360.98564736629 * days) * RAD + lon * RAD;

  const hourAngle = sidereal - rightAsc;
  const latR = lat * RAD;
  const altitude = Math.asin(
    Math.sin(latR) * Math.sin(declination)
      + Math.cos(latR) * Math.cos(declination) * Math.cos(hourAngle)
  );
  const azimuth = mod360(
    (Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle) * Math.sin(latR) - Math.tan(declination) * Math.cos(latR)
    ) + Math.PI) * (180 / Math.PI)
  );

  return {
    altitude: altitude / RAD,
    azimuth,
    hourAngle: hourAngle / RAD,
    declination: declination / RAD,
  };
}

const zoneFormatters = new Map();

export function zoneParts(tz, date) {
  let fmt = zoneFormatters.get(tz);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    zoneFormatters.set(tz, fmt);
  }
  const out = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== 'literal') out[part.type] = part.value;
  }
  return {
    year: +out.year, month: +out.month, day: +out.day,
    hour: +out.hour % 24, minute: +out.minute, second: +out.second,
  };
}

/** UTC stamp of 00:00 on a calendar date in a zone, DST included. */
export function localMidnightUtc(tz, year, month, day) {
  const want = Date.UTC(year, month - 1, day, 0, 0, 0);
  let stamp = want;
  for (let i = 0; i < 4; i += 1) {
    const p = zoneParts(tz, new Date(stamp));
    const seen = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    if (seen === want) break;
    stamp += want - seen;
  }
  return stamp;
}

/**
 * Sunrise, sunset, solar noon and the highest sun of the local day.
 * Scans the day for real crossings of the sunrise altitude, so
 * daylight saving and the equation of time are handled for free.
 * Inside the polar circles sunrise or sunset can be null.
 */
export function daylight(tz, lat, lon, now) {
  const p = zoneParts(tz, now);
  const dayStart = localMidnightUtc(tz, p.year, p.month, p.day);
  const dayEnd = dayStart + 26 * 3600000; // generous, covers a DST shift
  const step = 4 * 60000;

  let sunrise = null;
  let sunset = null;
  let noon = dayStart;
  let maxAltitude = -91;
  let previous = null;

  for (let t = dayStart - 6 * 3600000; t <= dayEnd; t += step) {
    const altitude = solarState(new Date(t), lat, lon).altitude;
    if (altitude > maxAltitude) { maxAltitude = altitude; noon = t; }

    if (t < dayStart) { previous = null; continue; }
    if (previous !== null) {
      if (previous.altitude < SUN_H0 && altitude >= SUN_H0 && sunrise === null) sunrise = t;
      if (previous.altitude >= SUN_H0 && altitude < SUN_H0 && sunset === null) sunset = t;
    }
    previous = { t, altitude };
  }

  return { sunrise, sunset, noon, maxAltitude };
}

/** Half width of the sun's arc, in degrees of hour angle. */
export function halfArcHourAngle(lat, declination) {
  const latR = lat * RAD;
  const cosH = (Math.sin(SUN_H0 * RAD) - Math.sin(latR) * Math.sin(declination))
    / (Math.cos(latR) * Math.cos(declination));
  if (cosH <= -1) return 180;
  if (cosH >= 1) return 0;
  return (Math.acos(cosH) / RAD) * 0.96;
}
