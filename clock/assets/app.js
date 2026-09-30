(() => {
  'use strict';

  const boot = JSON.parse(document.getElementById('boot-data').textContent);
  const PLACES = boot.places;
  const ALIASES = boot.aliases || {};
  const BY_TZ = new Map(PLACES.map((p) => [p.tz, p]));
  const STORAGE_PLACES = 'timebridge.places.v1';
  const STORAGE_HOURS = 'timebridge.hours.v2';
  const STORAGE_STEP = 'timebridge.step.v1';
  const MAX_PLACES = 6;

  const $ = (id) => document.getElementById(id);
  const el = {
    localBadgeText: $('localBadgeText'),
    useMyTimezone: $('useMyTimezone'),
    placeSearch: $('placeSearch'),
    searchResults: $('searchResults'),
    placeChips: $('placeChips'),
    clockGrid: $('clockGrid'),
    clockUpdated: $('clockUpdated'),
    convFromTz: $('convFromTz'),
    convToTz: $('convToTz'),
    convTime: $('convTime'),
    convDate: $('convDate'),
    convSwap: $('convSwap'),
    convResult: $('convResult'),
    overlapGrid: $('overlapGrid'),
    overlapSummary: $('overlapSummary'),
    overlapHint: $('overlapHint'),
    overlapLabelA: $('overlapLabelA'),
    overlapLabelB: $('overlapLabelB'),
    workAStart: $('workAStart'),
    workAEnd: $('workAEnd'),
    workBStart: $('workBStart'),
    workBEnd: $('workBEnd'),
    toastHost: $('toastHost'),
    themeToggle: $('themeToggle'),
    installApp: $('installApp'),
    offlineNote: $('offlineNote'),
  };

  const formatters = new Map();

  /**
   * A zone id this browser will accept, or null.
   *
   * The server's zone list is built from PHP's tzdata, which is often older
   * than the browser's. A device can therefore report an id the server has
   * never heard of, and Intl.DateTimeFormat throws a RangeError on those.
   * Every zone is checked once so the rest of the app can treat an unknown id
   * as "renders as UTC" instead of dying on the first clock tick.
   */
  function usableTz(tz) {
    try {
      new Intl.DateTimeFormat('en-GB', { timeZone: tz });
      return tz;
    } catch (err) {
      return null;
    }
  }

  function fmt(tz, options) {
    const key = tz + '|' + JSON.stringify(options);
    let f = formatters.get(key);
    if (!f) {
      const safe = usableTz(tz) || 'UTC';
      f = new Intl.DateTimeFormat('en-GB', { timeZone: safe, ...options });
      formatters.set(key, f);
    }
    return f;
  }

  function zonedParts(tz, date) {
    const out = {};
    for (const part of fmt(tz, {
      hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(date)) {
      if (part.type !== 'literal') out[part.type] = part.value;
    }
    return {
      year: +out.year, month: +out.month, day: +out.day,
      hour: +out.hour % 24, minute: +out.minute, second: +out.second,
    };
  }

  function zonedTimeToUtc(tz, year, month, day, hour, minute) {
    const target = Date.UTC(year, month - 1, day, hour, minute, 0);
    let stamp = target;
    for (let i = 0; i < 4; i += 1) {
      const p = zonedParts(tz, new Date(stamp));
      const observed = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
      const delta = target - observed;
      if (delta === 0) break;
      stamp += delta;
    }
    return new Date(stamp);
  }

  function offsetMinutes(tz, at) {
    const p = zonedParts(tz, at);
    return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - at.getTime()) / 60000);
  }

  function offsetText(minutes) {
    const abs = Math.abs(minutes);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return 'GMT' + (minutes < 0 ? '−' : '+') + h + (m ? ':' + String(m).padStart(2, '0') : '');
  }

  function time12(tz, at) {
    const parts = fmt(tz, { hour: 'numeric', minute: '2-digit', hour12: true }).formatToParts(at);
    const get = (t) => (parts.find((p) => p.type === t) || {}).value || '';
    return { hm: get('hour') + ':' + get('minute'), ap: get('dayPeriod').toUpperCase() };
  }

  function dateLabel(tz, at) {
    return fmt(tz, { weekday: 'short', day: 'numeric', month: 'short' }).format(at);
  }

  function longDate(tz, at) {
    return fmt(tz, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(at);
  }

  function slotLabel(minutes) {
    // 1440 is midnight at the end of the day and must read as 12 PM, not 12 AM.
    const wrapped = minutes === 1440 ? 1440 : ((minutes % 1440) + 1440) % 1440;
    const h = Math.floor(wrapped / 60);
    const rest = wrapped % 60;
    const twelve = h % 12 === 0 ? 12 : h % 12;
    return twelve + (rest ? ':' + String(rest).padStart(2, '0') : '') + ' ' + (h < 12 ? 'AM' : 'PM');
  }

  function daySerial(p) {
    return Date.UTC(p.year, p.month - 1, p.day) / 86400000;
  }

  function place(tz) {
    if (BY_TZ.has(tz)) return BY_TZ.get(tz);
    const city = tz.split('/').pop().replace(/_/g, ' ');
    return { tz, city, country: '', flag: '🌍', offset: '' };
  }

  function canonicalTz(tz) {
    let current = String(tz);
    for (let i = 0; i < 3 && ALIASES[current]; i += 1) current = ALIASES[current];
    return current;
  }

  // The device's own zone. Older or newer than the server's tzdata, so the
  // result is checked before use: an id this browser cannot format would
  // otherwise show a clock frozen on UTC.
  const detectedTz = canonicalTz(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const localTz = usableTz(detectedTz) ? detectedTz : 'UTC';
  el.localBadgeText.textContent = `You appear to be in ${place(localTz).city}`;

  let places = loadPlaces();
  let hours = loadHours();
  let step = loadStep();

  function loadPlaces() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_PLACES));
      if (Array.isArray(raw)) {
        // Kept even when the server has no entry for them, so a device whose
        // zone arrived in a newer tzdata release does not lose it on reload.
        // What matters is that this browser can format the id.
        const clean = raw.map(canonicalTz).filter(usableTz).slice(0, MAX_PLACES);
        if (clean.length) return [...new Set(clean)];
      }
    } catch (err) { /* fall through to defaults */ }
    return boot.defaults.slice();
  }

  function clampSlot(value, fallback) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n > 1440 || n % 30 !== 0) return fallback;
    return n;
  }

  function loadHours() {
    const fallback = { aStart: 540, aEnd: 1080, bStart: 540, bEnd: 1080 };
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_HOURS));
      if (raw && typeof raw === 'object') {
        return {
          aStart: clampSlot(raw.aStart, fallback.aStart),
          aEnd: clampSlot(raw.aEnd, fallback.aEnd),
          bStart: clampSlot(raw.bStart, fallback.bStart),
          bEnd: clampSlot(raw.bEnd, fallback.bEnd),
        };
      }
    } catch (err) { /* use fallback */ }
    return fallback;
  }

  function loadStep() {
    try {
      return Number(localStorage.getItem(STORAGE_STEP)) === 60 ? 60 : 30;
    } catch (err) {
      return 30;
    }
  }

  function saveAll() {
    try {
      localStorage.setItem(STORAGE_PLACES, JSON.stringify(places));
      localStorage.setItem(STORAGE_HOURS, JSON.stringify(hours));
      localStorage.setItem(STORAGE_STEP, String(step));
    } catch (err) { /* storage disabled, app still works */ }
  }

  function toast(message, icon) {
    const node = document.createElement('div');
    node.className = 'toast align-items-center border-0 show mb-2';
    node.setAttribute('role', 'status');
    // City names reach this from both the server list and, for an unserved
    // zone, the raw zone id, so the text is escaped before it becomes markup.
    node.innerHTML = `<div class="d-flex">
        <div class="toast-body"><i class="bi ${escapeHtml(icon || 'bi-info-circle')} me-2"></i>${escapeHtml(message)}</div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`;
    el.toastHost.appendChild(node);
    setTimeout(() => node.remove(), 4000);
  }

  function addPlace(tz) {
    tz = canonicalTz(tz);
    if (places.includes(tz)) {
      toast(`${place(tz).city} is already on your list`, 'bi-check-circle');
      return;
    }
    if (places.length >= MAX_PLACES) {
      toast(`You can track up to ${MAX_PLACES} places. Remove one first.`, 'bi-exclamation-triangle');
      return;
    }
    if (!usableTz(tz)) {
      toast(`This browser cannot read ${tz}, so its time would be wrong.`, 'bi-exclamation-triangle');
      return;
    }
    places.push(tz);
    afterPlacesChanged();
    toast(`Added ${place(tz).city}`, 'bi-plus-circle');
  }

  function removePlace(tz) {
    if (places.length <= 1) {
      toast('Keep at least one place on the list', 'bi-info-circle');
      return;
    }
    places = places.filter((t) => t !== tz);
    afterPlacesChanged();
  }

  function afterPlacesChanged() {
    saveAll();
    renderChips();
    renderClocks();
    syncSelects();
    renderConverter();
    renderOverlap();
    publishContext();
  }

  function renderChips() {
    el.placeChips.innerHTML = places.map((tz) => {
      const p = place(tz);
      const offset = offsetText(offsetMinutes(tz, new Date()));
      const base = tz === places[0] ? ' <span class="chip__off">• base</span>' : '';
      return `<span class="chip">
          <span>${p.flag}</span>
          <span>${escapeHtml(p.city)}${base}</span>
          <span class="chip__off">${offset}</span>
          <button type="button" class="chip__remove" data-remove="${escapeHtml(tz)}" aria-label="Remove ${escapeHtml(p.city)}"><i class="bi bi-x"></i></button>
        </span>`;
    }).join('') + (places.length < MAX_PLACES
      ? `<span class="chip chip--empty"><i class="bi bi-plus-circle"></i> ${MAX_PLACES - places.length} more to add</span>`
      : '');

    el.placeChips.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => removePlace(btn.dataset.remove));
    });
  }

  function renderClocks() {
    el.clockGrid.innerHTML = places.map((tz) => {
      const p = place(tz);
      const isBase = tz === places[0];
      const isLocal = tz === localTz;
      return `<div class="col-12 col-sm-6 col-lg-4">
          <div class="clock-card" data-clock="${escapeHtml(tz)}">
            <div class="clock-card__actions">
              ${isBase ? '' : `<button type="button" class="btn btn-sm btn-light border" data-make-base="${escapeHtml(tz)}" title="Use as my main time"><i class="bi bi-star"></i></button>`}
              <button type="button" class="btn btn-sm btn-light border" data-remove="${escapeHtml(tz)}" title="Remove"><i class="bi bi-trash"></i></button>
            </div>
            <div class="clock-card__head">
              <span class="clock-card__flag">${p.flag}</span>
              <span>
                <span class="clock-card__city">${escapeHtml(p.city)}</span>
                <span class="clock-card__country d-block">${escapeHtml(p.country || tz)}</span>
              </span>
            </div>
            <div class="clock-card__time"><span data-hm>--:--</span><span class="sec" data-ap></span></div>
            <div class="clock-card__date" data-date>&nbsp;</div>
            <div class="clock-card__meta" data-meta></div>
          </div>
        </div>`;
    }).join('');

    el.clockGrid.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => removePlace(btn.dataset.remove));
    });
    el.clockGrid.querySelectorAll('[data-make-base]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tz = btn.dataset.makeBase;
        places = [tz, ...places.filter((t) => t !== tz)];
        afterPlacesChanged();
      });
    });

    tickClocks();
  }

  function tickClocks() {
    const now = new Date();
    el.clockUpdated.textContent = `Updated ${fmt('UTC', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(now)} your device time`;

    el.clockGrid.querySelectorAll('[data-clock]').forEach((card) => {
      const tz = card.dataset.clock;
      const t = time12(tz, now);
      const p = zonedParts(tz, now);
      card.querySelector('[data-hm]').textContent = t.hm;
      card.querySelector('[data-ap]').textContent = t.ap;
      card.querySelector('[data-date]').textContent = dateLabel(tz, now);

      const day = p.hour >= 6 && p.hour < 18;
      card.classList.toggle('is-day', day);
      card.classList.toggle('is-night', !day);

      const tags = [`<span class="tag tag--${day ? 'day' : 'night'}">${day ? 'Daytime' : 'Night-time'}</span>`];
      tags.push(`<span class="tag">${offsetText(offsetMinutes(tz, now))}</span>`);
      if (tz === localTz) tags.push('<span class="tag tag--base">You</span>');
      if (tz === places[0] && places.length > 1) tags.push('<span class="tag tag--base">Base</span>');
      if (tz !== places[0] && places.length > 1) tags.push(`<span class="tag">${diffLabel(places[0], tz, now)}</span>`);
      card.querySelector('[data-meta]').innerHTML = tags.join('');
    });
  }

  function diffLabel(baseTz, tz, at) {
    const mins = offsetMinutes(tz, at) - offsetMinutes(baseTz, at);
    if (mins === 0) return 'Same time';
    const abs = Math.abs(mins);
    const text = abs % 60 === 0 ? `${abs / 60}h` : `${Math.floor(abs / 60)}h ${abs % 60}m`;
    return mins < 0 ? `${text} behind` : `${text} ahead`;
  }

  function fillZoneSelect(select, selected) {
    select.innerHTML = places.map((tz) => {
      const p = place(tz);
      const offset = offsetText(offsetMinutes(tz, new Date()));
      return `<option value="${escapeHtml(tz)}"${tz === selected ? ' selected' : ''}>${p.flag} ${escapeHtml(p.city)} (${offset})</option>`;
    }).join('');
  }

  function syncSelects() {
    const from = el.convFromTz.value;
    const to = el.convToTz.value;
    fillZoneSelect(el.convFromTz, from);
    fillZoneSelect(el.convToTz, to);
    el.overlapLabelA.textContent = place(places[0]).city;
    el.overlapLabelB.textContent = places[1] ? place(places[1]).city : 'Their hours';
  }

  function parseTimeInput(raw) {
    const text = String(raw).trim().toLowerCase().replace(/\./g, ':').replace(/\s+/g, ' ');
    if (!text) return null;
    if (text.startsWith('noon') || text.startsWith('midday')) return { hour: 12, minute: 0 };
    if (text.startsWith('midnight')) return { hour: 0, minute: 0 };

    const m = text.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm|a|p)?$/);
    if (!m) return null;

    let hour = parseInt(m[1], 10);
    const minute = m[2] === undefined ? 0 : parseInt(m[2], 10);
    const meridiem = m[3] ? m[3][0] : null;

    if (minute > 59) return null;
    if (meridiem) {
      if (hour < 1 || hour > 12) return null;
      if (meridiem === 'p' && hour !== 12) hour += 12;
      if (meridiem === 'a' && hour === 12) hour = 0;
    } else if (hour > 23) {
      return null;
    }
    return { hour, minute };
  }

  function todayInTz(tz) {
    const p = zonedParts(tz, new Date());
    return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
  }

  function shiftIsoDate(iso, days) {
    const [y, m, d] = iso.split('-').map(Number);
    const shifted = new Date(Date.UTC(y, m - 1, d + days));
    return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-${String(shifted.getUTCDate()).padStart(2, '0')}`;
  }

  function renderConverter() {
    const fromTz = el.convFromTz.value;
    const toTz = el.convToTz.value;
    if (!fromTz || !toTz) return;

    const parsed = parseTimeInput(el.convTime.value);
    if (!parsed) {
      el.convTime.classList.toggle('is-bad', el.convTime.value.trim() !== '');
      el.convResult.innerHTML = `<div class="text-secondary">
          <i class="bi bi-lightbulb me-2"></i>Type a time like <code>9am</code>, <code>7:30 pm</code> or <code>14:00</code> and I will do the maths.
        </div>`;
      return;
    }
    el.convTime.classList.remove('is-bad');

    const dateIso = el.convDate.value || todayInTz(fromTz);
    const [y, m, d] = dateIso.split('-').map(Number);
    const instant = zonedTimeToUtc(fromTz, y, m, d, parsed.hour, parsed.minute);

    const fromTime = time12(fromTz, instant);
    const toTime = time12(toTz, instant);
    const dayShift = daySerial(zonedParts(toTz, instant)) - daySerial(zonedParts(fromTz, instant));
    const shiftText = dayShift === 0 ? 'Same day' : dayShift > 0 ? `+${dayShift} day${dayShift > 1 ? 's' : ''} for them` : `${Math.abs(dayShift)} day${dayShift < -1 ? 's' : ''} earlier for them`;

    const fromPlace = place(fromTz);
    const toPlace = place(toTz);
    const message = `${fromTime.hm} ${fromTime.ap} in ${fromPlace.city} is ${toTime.hm} ${toTime.ap} in ${toPlace.city} (${dateLabel(toTz, instant)}).`;

    el.convResult.innerHTML = `
      <div class="conv-result__row">
        <div class="conv-block">
          <div class="conv-block__label">${fromPlace.flag} ${escapeHtml(fromPlace.city)} says</div>
          <div class="conv-block__time">${fromTime.hm} <span style="font-size:.6em">${fromTime.ap}</span></div>
          <div class="conv-block__date">${escapeHtml(longDate(fromTz, instant))}</div>
        </div>
        <div class="conv-arrow"><i class="bi bi-arrow-right"></i></div>
        <div class="conv-block">
          <div class="conv-block__label">${toPlace.flag} ${escapeHtml(toPlace.city)} should meet at</div>
          <div class="conv-block__time">${toTime.hm} <span style="font-size:.6em">${toTime.ap}</span></div>
          <div class="conv-block__date">${escapeHtml(dateLabel(toTz, instant))} &middot; ${shiftText}</div>
        </div>
        <div class="d-flex flex-column gap-2 ms-auto">
          <span class="conv-badge"><i class="bi bi-arrow-left-right"></i> ${diffLabel(fromTz, toTz, instant)}</span>
          <span class="conv-badge"><i class="bi bi-clock-history"></i> ${offsetText(offsetMinutes(toTz, instant))}</span>
        </div>
      </div>
      <div class="conv-msg d-flex flex-wrap align-items-center gap-2">
        <span><i class="bi bi-chat-dots me-1"></i>Copy &amp; send:</span>
        <code id="convMessage">${escapeHtml(message)}</code>
        <button type="button" class="btn btn-sm btn-primary" id="copyMessage"><i class="bi bi-clipboard me-1"></i>Copy</button>
      </div>`;

    $('copyMessage').addEventListener('click', copyMessage);
  }

  function copyMessage() {
    const text = $('convMessage').textContent;
    const done = () => toast('Message copied', 'bi-clipboard-check');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); done(); } catch (err) { toast('Copy failed, select the text manually', 'bi-exclamation-triangle'); }
    area.remove();
  }

  function fillSlotSelect(select, value) {
    const options = [];
    for (let m = 0; m < 1440; m += 30) {
      options.push(`<option value="${m}"${m === value ? ' selected' : ''}>${slotLabel(m)}</option>`);
    }
    select.innerHTML = options.join('');
  }

  function renderOverlap() {
    const aTz = places[0];
    const bTz = places[1] || places[0];

    fillSlotSelect(el.workAStart, hours.aStart);
    fillSlotSelect(el.workAEnd, hours.aEnd);
    fillSlotSelect(el.workBStart, hours.bStart);
    fillSlotSelect(el.workBEnd, hours.bEnd);

    document.querySelectorAll('[data-step]').forEach((btn) => {
      btn.classList.toggle('active', Number(btn.dataset.step) === step);
    });
    el.overlapHint.textContent = step === 30
      ? 'Each box is half an hour in your time, showing the same slot for them.'
      : 'Each box is one hour in your time, showing the same hour for them.';
    el.overlapGrid.classList.toggle('overlap-grid--dense', step === 30);

    const now = new Date();
    const aNow = zonedParts(aTz, now);
    const base = zonedTimeToUtc(aTz, aNow.year, aNow.month, aNow.day, 0, 0);
    const nowMinutes = aNow.hour * 60 + aNow.minute;
    const currentSlot = Math.floor(nowMinutes / step) * step;

    const freeFor = (startMin, from, to) => (to > from
      ? startMin >= from && startMin + step <= to
      : startMin >= from || startMin + step <= to);
    const aFree = (m) => freeFor(m, hours.aStart, hours.aEnd);
    const bFree = (m) => freeFor(m, hours.bStart, hours.bEnd);

    const cells = [];
    const goodRuns = [];
    let run = null;

    for (let m = 0; m < 1440; m += step) {
      const instant = new Date(base.getTime() + m * 60000);
      const bParts = zonedParts(bTz, instant);
      const bMinutes = bParts.hour * 60 + bParts.minute;
      const aWork = aFree(m);
      const bWork = bFree(bMinutes);
      const quality = aWork && bWork ? 'good' : (aWork || bWork) ? 'ok' : 'bad';

      if (quality === 'good') {
        if (!run) run = { start: m, end: m + step };
        else run.end = m + step;
      } else if (run) {
        goodRuns.push(run);
        run = null;
      }

      cells.push(`<div class="overlap-cell overlap-cell--${quality}${m === currentSlot ? ' overlap-cell--now' : ''}"
          title="${slotLabel(m)} – ${slotLabel(m + step)} in ${escapeHtml(place(aTz).city)} = ${slotLabel(bMinutes)} – ${slotLabel(bMinutes + step)} in ${escapeHtml(place(bTz).city)}">
          <div class="overlap-cell__a">${slotLabel(m)}</div>
          <div class="overlap-cell__b">${slotLabel(bMinutes)}</div>
        </div>`);
    }
    if (run) goodRuns.push(run);

    el.overlapGrid.innerHTML = cells.join('');
    el.overlapSummary.innerHTML = goodRuns.length
      ? goodRuns.map((r) => {
        const startAt = new Date(base.getTime() + r.start * 60000);
        const endAt = new Date(base.getTime() + r.end * 60000);
        const bStart = zonedParts(bTz, startAt);
        const bEnd = zonedParts(bTz, endAt);
        return `<span class="conv-badge"><i class="bi bi-check2-circle"></i>
            ${slotLabel(r.start)} – ${slotLabel(r.end)} ${escapeHtml(place(aTz).city)} time
            <span class="text-secondary">(${slotLabel(bStart.hour * 60 + bStart.minute)} – ${slotLabel(bEnd.hour * 60 + bEnd.minute)} for ${escapeHtml(place(bTz).city)})</span>
          </span>`;
      }).join('')
      : `<span class="conv-badge"><i class="bi bi-emoji-frown"></i>No shared working hours with these settings. Widen the hours above.</span>`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /** Coordinates for a zone, used by the animated sky. Null when unknown. */
  function coordOf(tz) {
    const p = BY_TZ.get(tz);
    if (p && typeof p.lat === 'number' && typeof p.lon === 'number') {
      return { lat: p.lat, lon: p.lon };
    }
    return null;
  }

  /** Tell the sky which place to follow. */
  function publishContext() {
    const detail = {
      places: places.slice(),
      localTz,
      coords: Object.fromEntries(places.map((tz) => [tz, coordOf(tz)])),
    };
    window.timeBridgeContext = detail;
    window.dispatchEvent(new CustomEvent('timebridge:places', { detail }));
  }

  function search(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const starts = [];
    const includes = [];
    for (const p of PLACES) {
      // Cities that share a timezone with an earlier entry collapse onto one
      // clock, so the ones that lose the race are searched as aliases. Without
      // this, typing "Kolkata" or "Manchester" finds nothing at all.
      const names = [p.city, ...(p.aliases || [])].map((n) => n.toLowerCase());
      // Scanning continues past the prefix cap on purpose: a common prefix
      // like "s" must not stop the scan and hide every match further down the
      // list. Only the returned set is trimmed.
      if (starts.length < 18) {
        const hit = names.find((n) => n.startsWith(q));
        if (hit) {
          starts.push(p);
          continue;
        }
      }
      const country = p.country.toLowerCase();
      const tz = p.tz.toLowerCase();
      if (names.some((n) => n.includes(q)) || country.includes(q) || tz.includes(q)) includes.push(p);
    }
    return [...starts, ...includes].slice(0, 25);
  }

  function renderResults() {
    const q = el.placeSearch.value.trim();
    if (!q) {
      hideResults();
      return;
    }
    const results = search(q);
    el.searchResults.hidden = false;
    el.placeSearch.setAttribute('aria-expanded', 'true');
    el.searchResults.innerHTML = results.length
      ? results.map((p, i) => `<button type="button" class="search-results__item${i === 0 ? ' is-active' : ''}" role="option" id="searchResult${i}" data-tz="${escapeHtml(p.tz)}" aria-selected="${i === 0 ? 'true' : 'false'}">
            <span class="flag">${p.flag}</span>
            <span><span class="name">${escapeHtml(p.city)}</span><span class="where d-block">${escapeHtml(p.country)}</span></span>
            <span class="off">${offsetText(offsetMinutes(p.tz, new Date()))}</span>
          </button>`).join('')
      : `<div class="search-results__empty">No place matches &ldquo;${escapeHtml(q)}&rdquo;. Try a nearby big city.</div>`;
    setActiveResult(0);
  }

  /** Move the keyboard selection, keeping aria state and the input in step. */
  function setActiveResult(index) {
    const items = [...el.searchResults.querySelectorAll('[data-tz]')];
    if (!items.length) {
      el.placeSearch.removeAttribute('aria-activedescendant');
      return;
    }
    const safe = ((index % items.length) + items.length) % items.length;
    items.forEach((item, i) => {
      const active = i === safe;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    items[safe].scrollIntoView({ block: 'nearest' });
    el.placeSearch.setAttribute('aria-activedescendant', items[safe].id);
  }

  function hideResults() {
    el.searchResults.hidden = true;
    el.placeSearch.setAttribute('aria-expanded', 'false');
    el.placeSearch.removeAttribute('aria-activedescendant');
  }

  function chooseResult(tz) {
    addPlace(tz);
    el.placeSearch.value = '';
    hideResults();
    el.placeSearch.focus();
  }

  el.placeSearch.addEventListener('input', renderResults);
  el.placeSearch.addEventListener('focus', renderResults);
  el.placeSearch.addEventListener('keydown', (event) => {
    const items = [...el.searchResults.querySelectorAll('[data-tz]')];

    if (event.key === 'Escape') {
      if (!el.searchResults.hidden) {
        event.preventDefault();
        hideResults();
      }
      return;
    }

    if (!items.length) return;
    const index = items.findIndex((i) => i.classList.contains('is-active'));

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveResult(event.key === 'ArrowDown' ? index + 1 : index - 1);
    } else if (event.key === 'Enter' && index >= 0) {
      event.preventDefault();
      chooseResult(items[index].dataset.tz);
    }
  });
  el.searchResults.addEventListener('click', (event) => {
    const item = event.target.closest('[data-tz]');
    if (item) chooseResult(item.dataset.tz);
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.search-wrap')) hideResults();
  });

  el.useMyTimezone.addEventListener('click', () => {
    if (places.includes(localTz)) {
      toast(`${place(localTz).city} is already on your list`, 'bi-check-circle');
      return;
    }
    if (places.length >= MAX_PLACES) {
      toast(`You can track up to ${MAX_PLACES} places. Remove one first.`, 'bi-exclamation-triangle');
      return;
    }
    places = [localTz, ...places];
    afterPlacesChanged();
    toast(`Added ${place(localTz).city} as your main time`, 'bi-person-check');
  });

  el.convTime.addEventListener('input', renderConverter);
  el.convDate.addEventListener('change', renderConverter);
  el.convFromTz.addEventListener('change', () => { el.convDate.value = todayInTz(el.convFromTz.value); renderConverter(); });
  el.convToTz.addEventListener('change', renderConverter);
  el.convSwap.addEventListener('click', () => {
    const from = el.convFromTz.value;
    el.convFromTz.value = el.convToTz.value;
    el.convToTz.value = from;
    el.convDate.value = todayInTz(el.convFromTz.value);
    renderConverter();
  });

  document.querySelectorAll('[data-dayshift]').forEach((btn) => {
    btn.addEventListener('click', () => {
      el.convDate.value = shiftIsoDate(todayInTz(el.convFromTz.value), Number(btn.dataset.dayshift));
      renderConverter();
    });
  });

  document.querySelectorAll('[data-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      step = Number(btn.dataset.step) === 60 ? 60 : 30;
      saveAll();
      renderOverlap();
    });
  });

  [['workAStart', 'aStart'], ['workAEnd', 'aEnd'], ['workBStart', 'bStart'], ['workBEnd', 'bEnd']].forEach(([id, key]) => {
    $(id).addEventListener('change', (event) => {
      hours[key] = clampSlot(event.target.value, hours[key]);
      saveAll();
      renderOverlap();
    });
  });

  el.convTime.value = '9am';
  el.convDate.value = todayInTz(places[1] || places[0]);

  fillZoneSelect(el.convFromTz, places[1] || places[0]);
  fillZoneSelect(el.convToTz, places[0]);
  renderChips();
  renderClocks();
  renderConverter();
  renderOverlap();
  publishContext();
  setInterval(tickClocks, 1000);

  const THEME_KEY = 'timebridge.theme';
  el.themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch (err) { /* not persisted */ }
  });

  let installPrompt = null;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    el.installApp.classList.remove('d-none');
  });
  el.installApp.addEventListener('click', async () => {
    if (!installPrompt) return;
    el.installApp.classList.add('d-none');
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') toast('Installed. Open it from your home screen.', 'bi-check-circle');
    installPrompt = null;
  });
  window.addEventListener('appinstalled', () => {
    el.installApp.classList.add('d-none');
    el.offlineNote.textContent = 'Installed. It opens like a normal app and works without internet.';
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js?v=' + (boot.version || 'dev')).catch(() => {
        el.offlineNote.textContent = 'Offline mode needs to be opened through http://localhost or an https address.';
      });
    });
  } else {
    el.offlineNote.textContent = 'This browser cannot run offline mode.';
  }
})();
