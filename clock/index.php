<?php
declare(strict_types=1);

const DEFAULT_PLACES = ['Asia/Kolkata', 'Europe/London'];

/**
 * Human friendly list of cities. IANA timezone ids are the source of truth,
 * so daylight saving is handled automatically by the browser.
 */
$CITIES = [
    // ---- India / South Asia -------------------------------------------------
    ['Mumbai', 'India', 'Asia/Kolkata', 'IN'],
    ['New Delhi', 'India', 'Asia/Kolkata', 'IN'],
    ['Bengaluru', 'India', 'Asia/Kolkata', 'IN'],
    ['Hyderabad', 'India', 'Asia/Kolkata', 'IN'],
    ['Chennai', 'India', 'Asia/Kolkata', 'IN'],
    ['Pune', 'India', 'Asia/Kolkata', 'IN'],
    ['Ahmedabad', 'India', 'Asia/Kolkata', 'IN'],
    ['Kolkata', 'India', 'Asia/Kolkata', 'IN'],
    ['Jaipur', 'India', 'Asia/Kolkata', 'IN'],
    ['Colombo', 'Sri Lanka', 'Asia/Colombo', 'LK'],
    ['Kathmandu', 'Nepal', 'Asia/Kathmandu', 'NP'],
    ['Dhaka', 'Bangladesh', 'Asia/Dhaka', 'BD'],
    ['Karachi', 'Pakistan', 'Asia/Karachi', 'PK'],
    ['Lahore', 'Pakistan', 'Asia/Karachi', 'PK'],
    ['Malé', 'Maldives', 'Asia/Maldives', 'MV'],

    // ---- Middle East / Central Asia -----------------------------------------
    ['Dubai', 'United Arab Emirates', 'Asia/Dubai', 'AE'],
    ['Abu Dhabi', 'United Arab Emirates', 'Asia/Dubai', 'AE'],
    ['Doha', 'Qatar', 'Asia/Qatar', 'QA'],
    ['Riyadh', 'Saudi Arabia', 'Asia/Riyadh', 'SA'],
    ['Kuwait City', 'Kuwait', 'Asia/Kuwait', 'KW'],
    ['Muscat', 'Oman', 'Asia/Muscat', 'OM'],
    ['Tehran', 'Iran', 'Asia/Tehran', 'IR'],
    ['Baku', 'Azerbaijan', 'Asia/Baku', 'AZ'],
    ['Tbilisi', 'Georgia', 'Asia/Tbilisi', 'GE'],
    ['Yerevan', 'Armenia', 'Asia/Yerevan', 'AM'],
    ['Tashkent', 'Uzbekistan', 'Asia/Tashkent', 'UZ'],
    ['Almaty', 'Kazakhstan', 'Asia/Almaty', 'KZ'],
    ['Ulaanbaatar', 'Mongolia', 'Asia/Ulaanbaatar', 'MN'],

    // ---- East & South East Asia ---------------------------------------------
    ['Bangkok', 'Thailand', 'Asia/Bangkok', 'TH'],
    ['Hanoi', 'Vietnam', 'Asia/Ho_Chi_Minh', 'VN'],
    ['Ho Chi Minh City', 'Vietnam', 'Asia/Ho_Chi_Minh', 'VN'],
    ['Jakarta', 'Indonesia', 'Asia/Jakarta', 'ID'],
    ['Kuala Lumpur', 'Malaysia', 'Asia/Kuala_Lumpur', 'MY'],
    ['Singapore', 'Singapore', 'Asia/Singapore', 'SG'],
    ['Manila', 'Philippines', 'Asia/Manila', 'PH'],
    ['Hong Kong', 'Hong Kong', 'Asia/Hong_Kong', 'HK'],
    ['Taipei', 'Taiwan', 'Asia/Taipei', 'TW'],
    ['Shanghai', 'China', 'Asia/Shanghai', 'CN'],
    ['Beijing', 'China', 'Asia/Shanghai', 'CN'],
    ['Urumqi', 'China', 'Asia/Urumqi', 'CN'],
    ['Seoul', 'South Korea', 'Asia/Seoul', 'KR'],
    ['Tokyo', 'Japan', 'Asia/Tokyo', 'JP'],
    ['Yangon', 'Myanmar', 'Asia/Yangon', 'MM'],
    ['Vientiane', 'Laos', 'Asia/Vientiane', 'LA'],
    ['Phnom Penh', 'Cambodia', 'Asia/Phnom_Penh', 'KH'],

    // ---- Europe -------------------------------------------------------------
    ['London', 'United Kingdom', 'Europe/London', 'GB'],
    ['Manchester', 'United Kingdom', 'Europe/London', 'GB'],
    ['Edinburgh', 'United Kingdom', 'Europe/London', 'GB'],
    ['Belfast', 'United Kingdom', 'Europe/London', 'GB'],
    ['Dublin', 'Ireland', 'Europe/Dublin', 'IE'],
    ['Lisbon', 'Portugal', 'Europe/Lisbon', 'PT'],
    ['Madrid', 'Spain', 'Europe/Madrid', 'ES'],
    ['Barcelona', 'Spain', 'Europe/Madrid', 'ES'],
    ['Paris', 'France', 'Europe/Paris', 'FR'],
    ['Brussels', 'Belgium', 'Europe/Brussels', 'BE'],
    ['Amsterdam', 'Netherlands', 'Europe/Amsterdam', 'NL'],
    ['Berlin', 'Germany', 'Europe/Berlin', 'DE'],
    ['Munich', 'Germany', 'Europe/Berlin', 'DE'],
    ['Frankfurt', 'Germany', 'Europe/Berlin', 'DE'],
    ['Zurich', 'Switzerland', 'Europe/Zurich', 'CH'],
    ['Vienna', 'Austria', 'Europe/Vienna', 'AT'],
    ['Prague', 'Czechia', 'Europe/Prague', 'CZ'],
    ['Rome', 'Italy', 'Europe/Rome', 'IT'],
    ['Milan', 'Italy', 'Europe/Rome', 'IT'],
    ['Copenhagen', 'Denmark', 'Europe/Copenhagen', 'DK'],
    ['Stockholm', 'Sweden', 'Europe/Stockholm', 'SE'],
    ['Oslo', 'Norway', 'Europe/Oslo', 'NO'],
    ['Helsinki', 'Finland', 'Europe/Helsinki', 'FI'],
    ['Warsaw', 'Poland', 'Europe/Warsaw', 'PL'],
    ['Budapest', 'Hungary', 'Europe/Budapest', 'HU'],
    ['Athens', 'Greece', 'Europe/Athens', 'GR'],
    ['Bucharest', 'Romania', 'Europe/Bucharest', 'RO'],
    ['Belgrade', 'Serbia', 'Europe/Belgrade', 'RS'],
    ['Kyiv', 'Ukraine', 'Europe/Kyiv', 'UA'],
    ['Moscow', 'Russia', 'Europe/Moscow', 'RU'],
    ['Reykjavík', 'Iceland', 'Atlantic/Reykjavik', 'IS'],
    ['Istanbul', 'Türkiye', 'Europe/Istanbul', 'TR'],
    ['Ankara', 'Türkiye', 'Europe/Istanbul', 'TR'],
    ['Beirut', 'Lebanon', 'Asia/Beirut', 'LB'],
    ['Amman', 'Jordan', 'Asia/Amman', 'JO'],
    ['Jerusalem', 'Israel', 'Asia/Jerusalem', 'IL'],
    ['Nicosia', 'Cyprus', 'Asia/Nicosia', 'CY'],

    // ---- Americas -----------------------------------------------------------
    ['New York', 'United States', 'America/New_York', 'US'],
    ['Washington DC', 'United States', 'America/New_York', 'US'],
    ['Boston', 'United States', 'America/New_York', 'US'],
    ['Atlanta', 'United States', 'America/New_York', 'US'],
    ['Miami', 'United States', 'America/New_York', 'US'],
    ['Toronto', 'Canada', 'America/Toronto', 'CA'],
    ['Montreal', 'Canada', 'America/Toronto', 'CA'],
    ['Chicago', 'United States', 'America/Chicago', 'US'],
    ['Dallas', 'United States', 'America/Chicago', 'US'],
    ['Houston', 'United States', 'America/Chicago', 'US'],
    ['Mexico City', 'Mexico', 'America/Mexico_City', 'MX'],
    ['Denver', 'United States', 'America/Denver', 'US'],
    ['Phoenix', 'United States', 'America/Phoenix', 'US'],
    ['Los Angeles', 'United States', 'America/Los_Angeles', 'US'],
    ['San Francisco', 'United States', 'America/Los_Angeles', 'US'],
    ['San Diego', 'United States', 'America/Los_Angeles', 'US'],
    ['Seattle', 'United States', 'America/Los_Angeles', 'US'],
    ['Vancouver', 'Canada', 'America/Vancouver', 'CA'],
    ['Calgary', 'Canada', 'America/Edmonton', 'CA'],
    ['Edmonton', 'Canada', 'America/Edmonton', 'CA'],
    ['Winnipeg', 'Canada', 'America/Winnipeg', 'CA'],
    ['Anchorage', 'United States', 'America/Anchorage', 'US'],
    ['Honolulu', 'United States', 'Pacific/Honolulu', 'US'],
    ['Havana', 'Cuba', 'America/Havana', 'CU'],
    ['Kingston', 'Jamaica', 'America/Jamaica', 'JM'],
    ['San Juan', 'Puerto Rico', 'America/Puerto_Rico', 'PR'],
    ['Panama City', 'Panama', 'America/Panama', 'PA'],
    ['San José', 'Costa Rica', 'America/Costa_Rica', 'CR'],
    ['Guatemala City', 'Guatemala', 'America/Guatemala', 'GT'],
    ['Bogotá', 'Colombia', 'America/Bogota', 'CO'],
    ['Lima', 'Peru', 'America/Lima', 'PE'],
    ['Caracas', 'Venezuela', 'America/Caracas', 'VE'],
    ['Santiago', 'Chile', 'America/Santiago', 'CL'],
    ['Buenos Aires', 'Argentina', 'America/Argentina/Buenos_Aires', 'AR'],
    ['Montevideo', 'Uruguay', 'America/Montevideo', 'UY'],
    ['La Paz', 'Bolivia', 'America/La_Paz', 'BO'],
    ['São Paulo', 'Brazil', 'America/Sao_Paulo', 'BR'],
    ['Rio de Janeiro', 'Brazil', 'America/Sao_Paulo', 'BR'],

    // ---- Africa -------------------------------------------------------------
    ['Casablanca', 'Morocco', 'Africa/Casablanca', 'MA'],
    ['Lagos', 'Nigeria', 'Africa/Lagos', 'NG'],
    ['Accra', 'Ghana', 'Africa/Accra', 'GH'],
    ['Dakar', 'Senegal', 'Africa/Dakar', 'SN'],
    ['Abidjan', "Côte d'Ivoire", 'Africa/Abidjan', 'CI'],
    ['Algiers', 'Algeria', 'Africa/Algiers', 'DZ'],
    ['Tunis', 'Tunisia', 'Africa/Tunis', 'TN'],
    ['Cairo', 'Egypt', 'Africa/Cairo', 'EG'],
    ['Nairobi', 'Kenya', 'Africa/Nairobi', 'KE'],
    ['Kampala', 'Uganda', 'Africa/Kampala', 'UG'],
    ['Addis Ababa', 'Ethiopia', 'Africa/Addis_Ababa', 'ET'],
    ['Dar es Salaam', 'Tanzania', 'Africa/Dar_es_Salaam', 'TZ'],
    ['Kinshasa', 'DR Congo', 'Africa/Kinshasa', 'CD'],
    ['Luanda', 'Angola', 'Africa/Luanda', 'AO'],
    ['Harare', 'Zimbabwe', 'Africa/Harare', 'ZW'],
    ['Johannesburg', 'South Africa', 'Africa/Johannesburg', 'ZA'],
    ['Cape Town', 'South Africa', 'Africa/Johannesburg', 'ZA'],

    // ---- Oceania ------------------------------------------------------------
    ['Perth', 'Australia', 'Australia/Perth', 'AU'],
    ['Adelaide', 'Australia', 'Australia/Adelaide', 'AU'],
    ['Brisbane', 'Australia', 'Australia/Brisbane', 'AU'],
    ['Sydney', 'Australia', 'Australia/Sydney', 'AU'],
    ['Melbourne', 'Australia', 'Australia/Melbourne', 'AU'],
    ['Hobart', 'Australia', 'Australia/Hobart', 'AU'],
    ['Darwin', 'Australia', 'Australia/Darwin', 'AU'],
    ['Auckland', 'New Zealand', 'Pacific/Auckland', 'NZ'],
    ['Wellington', 'New Zealand', 'Pacific/Auckland', 'NZ'],
    ['Suva', 'Fiji', 'Pacific/Fiji', 'FJ'],
    ['Port Moresby', 'Papua New Guinea', 'Pacific/Port_Moresby', 'PG'],
    ['Nouméa', 'New Caledonia', 'Pacific/Noumea', 'NC'],
];

/** Legacy / renamed zone ids that browsers and operating systems still report. */
const LEGACY_ZONES = [
    'Asia/Calcutta' => 'Asia/Kolkata',
    'Asia/Saigon' => 'Asia/Ho_Chi_Minh',
    'Asia/Rangoon' => 'Asia/Yangon',
    'Asia/Ulan_Bator' => 'Asia/Ulaanbaatar',
    'Asia/Katmandu' => 'Asia/Kathmandu',
    'Asia/Dacca' => 'Asia/Dhaka',
    'Asia/Chongqing' => 'Asia/Shanghai',
    'Asia/Harbin' => 'Asia/Shanghai',
    'Asia/Kashgar' => 'Asia/Urumqi',
    'Europe/Kiev' => 'Europe/Kyiv',
    'Europe/Nicosia' => 'Asia/Nicosia',
    'Europe/Uzhgorod' => 'Europe/Kyiv',
    'Europe/Zaporozhye' => 'Europe/Kyiv',
    'Atlantic/Faeroe' => 'Atlantic/Faroe',
    'America/Buenos_Aires' => 'America/Argentina/Buenos_Aires',
    'America/Godthab' => 'America/Nuuk',
    'America/Indianapolis' => 'America/Indiana/Indianapolis',
    'America/Louisville' => 'America/Kentucky/Louisville',
    'America/Montreal' => 'America/Toronto',
    'Australia/Canberra' => 'Australia/Sydney',
    'Australia/ACT' => 'Australia/Sydney',
    'Australia/NSW' => 'Australia/Sydney',
    'Australia/Queensland' => 'Australia/Brisbane',
    'Australia/South' => 'Australia/Adelaide',
    'Australia/Victoria' => 'Australia/Melbourne',
    'Australia/West' => 'Australia/Perth',
    'Australia/North' => 'Australia/Darwin',
    'Australia/Tasmania' => 'Australia/Hobart',
    'Pacific/Ponape' => 'Pacific/Pohnpei',
    'Pacific/Truk' => 'Pacific/Chuuk',
    'Pacific/Samoa' => 'Pacific/Pago_Pago',
    'Pacific/Enderbury' => 'Pacific/Kanton',
    'Pacific/Johnston' => 'Pacific/Honolulu',
    'US/Eastern' => 'America/New_York',
    'US/Central' => 'America/Chicago',
    'US/Mountain' => 'America/Denver',
    'US/Pacific' => 'America/Los_Angeles',
    'US/Alaska' => 'America/Anchorage',
    'US/Hawaii' => 'Pacific/Honolulu',
    'US/Arizona' => 'America/Phoenix',
    'Canada/Eastern' => 'America/Toronto',
    'Canada/Pacific' => 'America/Vancouver',
    'Canada/Central' => 'America/Winnipeg',
    'Canada/Mountain' => 'America/Edmonton',
    'Brazil/East' => 'America/Sao_Paulo',
    'Mexico/BajaNorte' => 'America/Tijuana',
    'Europe/Belfast' => 'Europe/London',
    'GB' => 'Europe/London',
    'GB-Eire' => 'Europe/London',

    // POSIX-style abbreviations, which older systems and Java stacks still
    // report as their zone id. These targets have been stable in the database
    // for years, so unlike the 2017-2022 city renames they can be written down
    // without worrying about which tzdata release this PHP ships.
    //
    // The two families behave differently and must not be mixed. The "X6XDT"
    // names carry a daylight rule and so may stand in for a real city;
    // the bare "CET"/"EET"/"MET"/"WET" names are the standard-time zone and
    // never shift, so pinning them to Paris or Berlin would show summer time
    // to a device that asked for CET. They resolve to fixed Etc/ offsets
    // instead, which is exactly what the database says they are.
    'CST6CDT' => 'America/Chicago',
    'EST5EDT' => 'America/New_York',
    'MST7MDT' => 'America/Denver',
    'PST8PDT' => 'America/Los_Angeles',
    'CET' => 'Etc/GMT-1',
    'MET' => 'Etc/GMT-1',
    'EET' => 'Etc/GMT-2',
    'WET' => 'Etc/GMT',
];

/**
 * Zone ids we serve that are newer than the tzdata bundled with this PHP build,
 * mapped to the equivalent id the build can actually compute.
 *
 * The served id deliberately stays the modern one, because that is what current
 * browsers and Intl recognise. Only the arithmetic goes through the older name.
 * Europe/Kyiv and Asia/Maldives both arrived in tzdata 2022b, so a build older
 * than that cannot open them and every offset lookup fails open, which left both
 * places showing a blank UTC offset. Reading the offsets from the pre-2022 name
 * keeps them exact, daylight saving included.
 */
const COMPUTABLE_ZONES = [
    'Europe/Kyiv' => 'Europe/Kiev',
    'Asia/Maldives' => 'Indian/Maldives',
];

/** Follow COMPUTABLE_ZONES until we reach an id this build can open. */
function computableZone(string $tz): string
{
    $seen = [];
    while (isset(COMPUTABLE_ZONES[$tz]) && !isset($seen[$tz])) {
        $seen[$tz] = true;
        $tz = COMPUTABLE_ZONES[$tz];
    }
    return $tz;
}

/** Country code -> flag emoji (regional indicator symbols). */
function flagEmoji(string $cc): string
{
    if (strlen($cc) !== 2) {
        return '🌍';
    }
    $out = '';
    foreach (str_split(strtoupper($cc)) as $char) {
        $out .= mb_chr(0x1F1E6 + (ord($char) - 65), 'UTF-8');
    }
    return $out;
}

/**
 * How a zone behaves across the year, not just its offset right now.
 *
 * Alias fallback needs this because two zones sharing today's offset can still
 * diverge later: America/Santa_Isabel and America/Creston are both UTC-07:00
 * on a summer afternoon, yet Creston never shifts while Santa Isabel falls
 * back to UTC-08:00 in winter, so matching on the current offset alone pins
 * the alias to a place that is an hour out for half of every year.
 *
 * The four samples cover both DST windows, both shoulder seasons, and the
 * southern-hemisphere case where a zone that shifts in January is at rest in
 * July. Zones agreeing on all four agree on every transition between them.
 *
 * @return string Empty when the zone id is unknown to this PHP build.
 */
function zoneSignature(string $tz): string
{
    static $cache = [];
    if (isset($cache[$tz])) {
        return $cache[$tz];
    }

    try {
        $zone = new DateTimeZone(computableZone($tz));
    } catch (Throwable $e) {
        return $cache[$tz] = '';
    }

    $year = (int) date('Y');
    $parts = [];
    foreach (['01-15', '04-01', '07-15', '10-01'] as $monthDay) {
        $parts[] = (new DateTimeImmutable($year . '-' . $monthDay . ' 12:00', $zone))->format('P');
    }
    return $cache[$tz] = implode(' ', $parts);
}

/**
 * Zones this PHP build's bundled tzdata cannot place. Coordinates are
 * approximate city centres, which is plenty for the sky's sun position.
 */
const ZONE_COORDS = [
    'Asia/Maldives' => [4.1755, 73.5093], // Malé
    'Europe/Kyiv'   => [50.4501, 30.5234], // Kyiv
];

/**
 * Approximate coordinates for a zone, so the sky background can follow the real
 * sun. PHP reports -90 / -180 for zones it cannot place (UTC, Etc/*), which we
 * treat as "unknown".
 */
function zoneCoords(string $tz): ?array
{
    if (isset(ZONE_COORDS[$tz])) {
        return ['lat' => ZONE_COORDS[$tz][0], 'lon' => ZONE_COORDS[$tz][1]];
    }
    if (!function_exists('timezone_location_get')) {
        return null;
    }
    try {
        $loc = @timezone_location_get(new DateTimeZone($tz));
    } catch (Throwable $e) {
        return null;
    }
    if (!is_array($loc) || !isset($loc['latitude'], $loc['longitude'])) {
        return null;
    }
    $lat = (float) $loc['latitude'];
    $lon = (float) $loc['longitude'];
    if ($lat <= -90.0 || $lon <= -180.0) {
        return null;
    }
    return ['lat' => $lat, 'lon' => $lon];
}

/**
 * Every zone id this build can place. listIdentifiers() hides the Etc/*
 * fixed offsets behind its default filter, but browsers and operating systems
 * do report them, so they belong in the list.
 */
function listKnownZones(): array
{
    $ids = DateTimeZone::listIdentifiers();
    foreach (DateTimeZone::listIdentifiers(DateTimeZone::ALL_WITH_BC) as $tz) {
        if (strpos($tz, 'Etc/') === 0) {
            $ids[] = $tz;
        }
    }
    $ids = array_values(array_unique($ids));
    sort($ids, SORT_STRING);
    return $ids;
}

/**
 * Old zone id -> the id we actually serve, so "Asia/Calcutta" becomes
 * "Asia/Kolkata".
 *
 * IntlTimeZone can carry a different tzdata release than DateTimeZone and the
 * two do not always agree: PHP 7.4's ICU still calls America/Argentina/Cordoba
 * "America/Cordoba", a name the current database dropped. Rewriting a zone to
 * an id we do not serve would strand the place, so a candidate is only
 * accepted when $served says we offer it, and anything unresolvable keeps its
 * own id rather than becoming a mapping that quietly breaks on reload.
 *
 * @param array $served Zones we offer, keyed by zone id. Only the keys are read.
 */
function canonicalZone(string $tz, array $served): string
{
    $candidate = LEGACY_ZONES[$tz] ?? null;

    // ICU can hand back a name that is itself one of our legacy aliases,
    // so the lookup is followed through before the result is trusted.
    if ($candidate === null && class_exists('IntlTimeZone')) {
        $icu = IntlTimeZone::getCanonicalID($tz);
        if (is_string($icu) && $icu !== '') {
            $candidate = LEGACY_ZONES[$icu] ?? $icu;
        }
    }

    if ($candidate !== null && $candidate !== $tz && isset($served[$candidate])) {
        return $candidate;
    }

    // The 2017 and 2022 database renames moved city names under a new parent,
    // so ICU can answer with a bare "America/Cordoba" where we serve
    // "America/Argentina/Cordoba". Matching on the city segment recovers the
    // zone we have, and only runs when the direct lookup failed.
    foreach ([$candidate, $tz] as $lead) {
        if (!is_string($lead) || $lead === '') {
            continue;
        }
        $city = substr(strrchr('/' . $lead, '/'), 1);
        if ($city !== '') {
            foreach (array_keys($served) as $known) {
                if (substr(strrchr('/' . $known, '/'), 1) === $city) {
                    return $known;
                }
            }
        }
    }

    // Last resort for ids this PHP cannot name at all, such as a zone the
    // browser learned from a newer tzdata release. A served zone that keeps
    // the same offsets all year is always better than dropping the place.
    // zoneSignature() does the comparing rather than today's offset, so an
    // alias never inherits a different daylight-saving rule, and a zone from
    // the same region is preferred purely to keep the label plausible.
    $signature = zoneSignature($tz);
    if ($signature === '') {
        return $tz;
    }
    $region = strstr($tz, '/', true);
    $prefix = $region === false ? '' : $region . '/';
    $anywhere = null;
    foreach (array_keys($served) as $known) {
        if (zoneSignature($known) !== $signature) {
            continue;
        }
        if ($prefix !== '' && strncmp($known, $prefix, strlen($prefix)) === 0) {
            return $known;
        }
        $anywhere = $anywhere ?? $known;
    }
    return $anywhere ?? $tz;
}

/**
 * Human friendly area label for a zone id that has no country of its own.
 *
 * IANA nests some areas two deep, so the segment before the city can itself
 * contain a slash ("America/Argentina/Buenos_Aires"). Showing that whole
 * prefix as the country reads as "America/Argentina", so the leaf of the
 * parent is taken instead and the continent kept as a fallback for zones
 * that are only one level deep, such as "Asia/Kolkata" -> "Asia".
 */
function areaLabel(string $tz): string
{
    $slash = strrpos($tz, '/');
    $parent = $slash === false ? '' : substr($tz, 0, $slash);
    if ($parent === '') {
        return 'Other';
    }
    $leaf = strrchr('/' . $parent, '/');
    $leaf = $leaf === false ? $parent : substr($leaf, 1);
    return $leaf === '' ? 'Other' : $leaf;
}

$placeList = [];
$seen = [];

// Cities that share a timezone collapse onto one clock, because two entries
// on the same zone would show the same time twice. The cities that lose the
// race are kept as search aliases instead of being dropped, so someone who
// types "Kolkata" or "Manchester" still finds the zone they meant.
$cityAliases = [];
foreach ($CITIES as [$city, $country, $tz, $cc]) {
    if (isset($seen[$tz])) {
        $cityAliases[$tz][] = $city;
        continue;
    }
    $seen[$tz] = true;
    $placeList[] = [
        'tz'    => $tz,
        'city'  => $city,
        'country' => $country,
        'flag'  => flagEmoji($cc),
        'aliases' => [],
    ];
}

// Attached after the loop, because the cities sharing a zone are only known
// once every later entry has been read.
foreach ($placeList as &$place) {
    $place['aliases'] = $cityAliases[$place['tz']] ?? [];
}
unset($place);

$knownZones = listKnownZones();

// Every other IANA id, so power users can find zones the city list misses.
$extra = [];
foreach ($knownZones as $tz) {
    if (isset($seen[$tz]) || isset(LEGACY_ZONES[$tz])) {
        continue;
    }
    $slash = strrpos($tz, '/');
    $area = $slash === false ? '' : substr($tz, 0, $slash);
    $extra[] = [
        'tz'      => $tz,
        'city'    => str_replace('_', ' ', substr($tz, $slash === false ? 0 : $slash + 1)),
        'country' => $area === 'Etc' ? 'Fixed offset' : areaLabel($tz),
        'flag'    => '🌍',
        'aliases' => [],
    ];
}

$places = array_merge($placeList, $extra);
usort($places, static fn(array $a, array $b): int => strcmp($a['city'], $b['city']));

// Latitude / longitude for every zone, used by the animated sky.
foreach ($places as &$p) {
    $coords = zoneCoords($p['tz']);
    $p['lat'] = $coords['lat'] ?? null;
    $p['lon'] = $coords['lon'] ?? null;
}
unset($p);

// Old ids that browsers still hand out, mapped onto ids we serve.
//
// Two rules keep every entry resolvable. An id we already serve is left
// alone, so a stale ICU release cannot roll a current zone back to a name
// the database has since dropped. And a mapping onto an id we do not serve
// is discarded, because the client would silently drop the place the next
// time the app reloaded from localStorage.
$served = [];
foreach ($places as $place) {
    $served[$place['tz']] = $place;
}
$aliases = [];
foreach (DateTimeZone::listIdentifiers(DateTimeZone::ALL_WITH_BC) as $tz) {
    if (isset($served[$tz])) {
        continue;
    }
    $canonical = canonicalZone($tz, $served);
    if ($canonical !== $tz && isset($served[$canonical])) {
        $aliases[$tz] = $canonical;
    }
}
foreach (LEGACY_ZONES as $from => $to) {
    if (!isset($served[$from]) && isset($served[$to])) {
        $aliases[$from] = $to;
    }
}

/** Changes whenever any local file changes, so the offline cache refreshes itself. */
function assetVersion(): string
{
    // tools/build.php defines this before including this file so that a static
    // build keys the offline cache on file contents rather than on checkout
    // timestamps. Unset during normal development, where mtimes are the
    // cheapest signal that something changed.
    if (defined('TIME_BRIDGE_VERSION')) {
        return substr((string) TIME_BRIDGE_VERSION, 0, 10);
    }

    $files = [
        __DIR__ . '/index.php',
        __DIR__ . '/sw.js',
        __DIR__ . '/manifest.webmanifest',
        __DIR__ . '/assets/style.css',
        __DIR__ . '/assets/sky.css',
        __DIR__ . '/assets/app.js',
        __DIR__ . '/assets/solar.js',
        __DIR__ . '/assets/sky.js',
        __DIR__ . '/assets/vendor/three.module.min.js',
    ];

    $newest = 0;
    foreach ($files as $file) {
        $time = @filemtime($file);
        if ($time !== false && $time > $newest) {
            $newest = $time;
        }
    }
    return substr(md5((string) $newest), 0, 10);
}

$boot = [
    'places'   => $places,
    'aliases'  => $aliases,
    'defaults' => DEFAULT_PLACES,
    'version'  => assetVersion(),
];

$json = json_encode(
    $boot,
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
);
?>
<!doctype html>
<html lang="en" data-bs-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Time Bridge &middot; work out times across countries</title>
<meta name="description" content="See what time it is for your client, convert '9am' between time zones and find meeting hours that work for everyone.">
<meta name="theme-color" content="#eef2f8" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0b1220" media="(prefers-color-scheme: dark)">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Time Bridge">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="assets/icons/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<link href="assets/style.css" rel="stylesheet">
<link href="assets/sky.css" rel="stylesheet">
<script>
  (function () {
    try {
      var saved = localStorage.getItem('timebridge.theme');
      var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-bs-theme', theme);
    } catch (e) { /* keep the light default */ }
  })();
</script>
</head>
<body>

<div class="sky" id="sky" aria-hidden="true">
  <canvas class="sky__canvas" id="skyCanvas"></canvas>
  <div class="sky__vignette"></div>
  <div class="sky__grain"></div>
  <noscript><div class="sky__fallback"></div></noscript>
</div>


<div class="page-wrap">

  <header class="hero mb-4">
    <div class="d-flex flex-wrap align-items-center gap-3 justify-content-between">
      <div>
        <h1 class="hero__title mb-1"><i class="bi bi-globe2 me-2"></i>Time Bridge</h1>
        <p class="hero__sub mb-0">Stop doing timezone maths in your head. Add a place, type a time, done.</p>
      </div>
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <span class="badge-pill" id="localBadge"><i class="bi bi-geo-alt-fill"></i> <span id="localBadgeText">&nbsp;</span></span>
        <button type="button" class="btn btn-primary btn-sm px-3" id="useMyTimezone">
          <i class="bi bi-person-check me-1"></i>Add my timezone
        </button>
        <button type="button" class="btn btn-outline-secondary btn-sm px-3 d-none" id="installApp">
          <i class="bi bi-download me-1"></i>Install
        </button>
        <button type="button" class="btn btn-outline-secondary btn-sm theme-toggle" id="themeToggle"
                aria-label="Switch between light and dark" title="Switch between light and dark">
          <i class="bi bi-moon-stars-fill theme-toggle__dark"></i>
          <i class="bi bi-brightness-high-fill theme-toggle__light"></i>
        </button>
      </div>
    </div>

    <div class="sky-hud" id="skyHud">
      <div class="sky-hud__readout">
        <span class="sky-hud__icon" id="skyIcon"><i class="bi bi-sun"></i></span>
        <span class="sky-hud__text">
          <span class="sky-hud__place" id="skyPlace">&nbsp;</span>
          <span class="sky-hud__phase" id="skyPhase">&nbsp;</span>
        </span>
        <span class="sky-hud__times">
          <span class="sky-hud__time"><i class="bi bi-sunrise"></i><span id="skySunrise">--:--</span></span>
          <span class="sky-hud__time"><i class="bi bi-sunset"></i><span id="skySunset">--:--</span></span>
        </span>
      </div>
      <button type="button" class="sky-hud__btn" id="rainToggle" aria-pressed="false"
              title="Turn the rain on and off">
        <i class="bi bi-cloud-rain"></i><span class="sky-hud__btnlabel">Rain</span>
      </button>
    </div>
  </header>

  <!-- 1. Add places -->
  <section class="card-panel mb-4">
    <h2 class="panel__title"><span class="step">1</span>Pick the places you work with</h2>
    <p class="panel__hint">Search for a city, then tap it. You can track up to six at a time.</p>

    <div class="search-wrap mb-3">
      <i class="bi bi-search search-wrap__icon"></i>
      <input type="text" id="placeSearch" class="form-control form-control-lg search-wrap__input"
             placeholder="Search a city or country…  (try London, Mumbai, Dubai)" autocomplete="off" role="combobox"
             aria-expanded="false" aria-controls="searchResults" aria-autocomplete="list">
      <div class="search-results shadow-lg" id="searchResults" role="listbox" hidden></div>
    </div>

    <div class="d-flex flex-wrap gap-2" id="placeChips"></div>
  </section>

  <!-- 2. Live clocks -->
  <section class="card-panel mb-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-1">
      <h2 class="panel__title mb-0"><span class="step">2</span>Live clocks</h2>
      <span class="small text-secondary" id="clockUpdated"></span>
    </div>
    <p class="panel__hint">Ticking every second, with the day and the local time difference.</p>
    <div class="row g-3" id="clockGrid"></div>
  </section>

  <!-- 3. Converter -->
  <section class="card-panel mb-4" id="converter">
    <h2 class="panel__title"><span class="step">3</span>&ldquo;I can do 9am&rdquo; &mdash; what is that for them?</h2>
    <p class="panel__hint">Type it the way you talk: <code>9am</code>, <code>2:30 pm</code>, <code>14:00</code>, <code>noon</code>.</p>

    <div class="row g-3 align-items-end">
      <div class="col-12 col-lg-3">
        <label class="form-label" for="convFromTz">Their time is in</label>
        <select id="convFromTz" class="form-select"></select>
      </div>
      <div class="col-12 col-lg-3">
        <label class="form-label" for="convTime">They say</label>
        <input type="text" id="convTime" class="form-control form-control-lg time-input" placeholder="9am"
               inputmode="text" autocomplete="off" spellcheck="false">
        <div class="form-text" id="convTimeHelp">Try: 9am &middot; 2:30pm &middot; 14:00</div>
      </div>
      <div class="col-12 col-lg-2">
        <label class="form-label" for="convDate">On the</label>
        <input type="date" id="convDate" class="form-control">
        <div class="btn-group btn-group-sm w-100 mt-1" role="group" aria-label="Quick dates">
          <button type="button" class="btn btn-outline-secondary" data-dayshift="0">Today</button>
          <button type="button" class="btn btn-outline-secondary" data-dayshift="1">+1d</button>
        </div>
      </div>
      <div class="col-12 col-lg-3">
        <label class="form-label" for="convToTz">Your time is in</label>
        <select id="convToTz" class="form-select"></select>
      </div>
      <div class="col-12 col-lg-1">
        <button type="button" class="btn btn-outline-secondary w-100" id="convSwap" title="Swap the two places">
          <i class="bi bi-arrow-left-right"></i><span class="d-lg-none ms-1">Swap</span>
        </button>
      </div>
    </div>

    <div class="conv-result mt-4" id="convResult" aria-live="polite"></div>
  </section>

  <!-- 4. Overlap finder -->
  <section class="card-panel mb-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-1">
      <h2 class="panel__title mb-0"><span class="step">4</span>When are we both free?</h2>
      <div class="d-flex flex-wrap align-items-center gap-3">
        <div class="btn-group btn-group-sm" role="group" aria-label="Length of each slot">
          <button type="button" class="btn btn-outline-secondary" data-step="60">1 hour</button>
          <button type="button" class="btn btn-outline-secondary" data-step="30">30 min</button>
        </div>
        <div class="d-flex align-items-center gap-1">
          <span class="small fw-semibold" id="overlapLabelA">Your hours</span>
          <select id="workAStart" class="form-select form-select-sm w-auto" aria-label="First place, hours start"></select>
          <span class="text-secondary small">to</span>
          <select id="workAEnd" class="form-select form-select-sm w-auto" aria-label="First place, hours end"></select>
        </div>
        <div class="d-flex align-items-center gap-1">
          <span class="small fw-semibold" id="overlapLabelB">Their hours</span>
          <select id="workBStart" class="form-select form-select-sm w-auto" aria-label="Second place, hours start"></select>
          <span class="text-secondary small">to</span>
          <select id="workBEnd" class="form-select form-select-sm w-auto" aria-label="Second place, hours end"></select>
        </div>
      </div>
    </div>
    <p class="panel__hint" id="overlapHint">Each box is one hour in your time, showing the same hour for them.</p>
    <div class="overlap-summary mb-3" id="overlapSummary"></div>
    <div class="overlap-grid" id="overlapGrid"></div>
    <div class="legend mt-3">
      <span class="legend__item"><span class="swatch swatch--good"></span>Good for both</span>
      <span class="legend__item"><span class="swatch swatch--ok"></span>One is at work, one is not</span>
      <span class="legend__item"><span class="swatch swatch--bad"></span>Sleeping hours</span>
    </div>
  </section>

  <footer class="text-center text-secondary small py-4">
    <p class="mb-1">Times come from your device clock using IANA time zones, so daylight saving is handled for you.</p>
    <p class="mb-0" id="offlineNote">Works offline once loaded &mdash; install it and it opens like a normal app.</p>
  </footer>
</div>

<div class="toast-container position-fixed bottom-0 end-0 p-3" id="toastHost"></div>

<script id="boot-data" type="application/json"><?= $json ?></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="assets/app.js"></script>
<script type="module" src="assets/sky.js"></script>
</body>
</html>
