/**
 * Google Maps URL & Embed Utilities
 * Converts Google Maps shortlinks, share URLs, iframe embed codes, and addresses
 * into safe, working iframe embed URLs (preventing "refused to connect" errors).
 */

export const DEFAULT_TEMPLE_LOCATION = {
  shortUrl: 'https://maps.app.goo.gl/Uh59h8TafZxFuwhn9',
  embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3817.752005058017!2d81.8079729!3d16.888158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a37bd006577cc1b%3A0x72511491942ab40!2z4LC24LGN4LCw4LGAIOCwteCwvuCwuOCwteCwvyDgsJXgsKjgsY3gsK_gsJXgsL4g4LCq4LCw4LCu4LGH4LC24LGN4LC14LCw4LC_IOCwhuCwsuCwr-Cwgg!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  coordinates: { lat: 16.888158, lng: 81.812479 },
  placeName: 'శ్రీ వాసవి కన్యకా పరమేశ్వరి ఆలయం (Sree Vasavi Kanyaka Parameswari Temple)'
};

/**
 * Extracts the src attribute if an entire <iframe> HTML snippet was pasted.
 */
export const extractIframeSrc = (input) => {
  if (!input || typeof input !== 'string') return '';
  const match = input.match(/<iframe[^>]*\s+src=["']([^"']+)["']/i);
  return match ? match[1].trim() : input.trim();
};

/**
 * Converts any Google Maps URL, shortlink, iframe code, coordinates or address
 * into a valid, embeddable Google Maps iframe URL.
 * 
 * @param {string} input - User input URL, iframe snippet, or search query
 * @param {string} fallbackAddress - Fallback address if input is empty or unresolved
 * @returns {string} Safe embed URL for <iframe src="...">
 */
export const cleanAndConvertMapsUrl = (input, fallbackAddress = '') => {
  if (!input && !fallbackAddress) {
    return DEFAULT_TEMPLE_LOCATION.embedUrl;
  }

  const raw = extractIframeSrc(input || '');

  // 1. Check for the requested shortlink: https://maps.app.goo.gl/Uh59h8TafZxFuwhn9
  if (raw.includes('Uh59h8TafZxFuwhn9')) {
    return DEFAULT_TEMPLE_LOCATION.embedUrl;
  }

  // 2. If it's already an embed URL (e.g. google.com/maps/embed or contains output=embed)
  if (raw.includes('/maps/embed') || (raw.includes('maps.google.') && raw.includes('output=embed'))) {
    return raw;
  }

  // 3. Extract coordinates from standard Google Maps URLs (e.g. /@16.888158,81.812479,17z)
  const atCoordsMatch = raw.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atCoordsMatch) {
    const lat = atCoordsMatch[1];
    const lng = atCoordsMatch[2];
    return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=17&output=embed`;
  }

  // 4. Coordinates in query parameter (e.g. ?q=16.888158,81.812479 or ll=16.888158,81.812479)
  const queryCoordsMatch = raw.match(/[?&](?:q|ll|center)=(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/i);
  if (queryCoordsMatch) {
    const lat = queryCoordsMatch[1];
    const lng = queryCoordsMatch[2];
    return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=17&output=embed`;
  }

  // 5. Query string in maps URL (e.g. maps.google.com/?q=Penugonda)
  const qParamMatch = raw.match(/[?&]q=([^&]+)/i);
  if (qParamMatch) {
    const query = qParamMatch[1];
    return `https://maps.google.com/maps?q=${query}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  // 6. Direct coordinates string (e.g. "16.888158, 81.812479" or "16.888158,81.812479")
  const directCoords = raw.match(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/);
  if (directCoords) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(raw)}&hl=en&z=17&output=embed`;
  }

  // 7. General Google Maps place URL (e.g. /maps/place/Some+Place+Name/...)
  const placeMatch = raw.match(/\/maps\/place\/([^/@?]+)/i);
  if (placeMatch) {
    const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  // 8. If user typed plain address or landmark text
  if (raw && !raw.startsWith('http://') && !raw.startsWith('https://')) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(raw)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  // 9. If it's another unknown shortlink or generic URL that cannot be framed
  if (raw.includes('maps.app.goo.gl') || raw.includes('goo.gl/maps') || raw.includes('google.com/maps')) {
    // If we have a fallback address, use it to render a working map embed
    if (fallbackAddress) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    }
    return DEFAULT_TEMPLE_LOCATION.embedUrl;
  }

  // 10. Fallback to address
  if (fallbackAddress) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  return DEFAULT_TEMPLE_LOCATION.embedUrl;
};

/**
 * Returns a working URL for opening directly in Google Maps application or new tab.
 * 
 * @param {string} rawUrl - Stored googleMapsUrl or share URL
 * @param {string} fallbackAddress - Fallback address
 * @returns {string} Clickable Google Maps URL
 */
export const getMapsShareUrl = (rawUrl = '', fallbackAddress = '') => {
  if (rawUrl && rawUrl.includes('Uh59h8TafZxFuwhn9')) {
    return DEFAULT_TEMPLE_LOCATION.shortUrl;
  }
  if (rawUrl && (rawUrl.includes('maps.app.goo.gl') || rawUrl.includes('goo.gl/maps'))) {
    return rawUrl;
  }
  if (rawUrl && rawUrl.startsWith('http') && !rawUrl.includes('/maps/embed')) {
    return rawUrl;
  }
  if (fallbackAddress) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddress)}`;
  }
  return DEFAULT_TEMPLE_LOCATION.shortUrl;
};

/**
 * Generates an embed URL directly from an address string.
 */
export const generateEmbedFromAddress = (address) => {
  if (!address || !address.trim()) return DEFAULT_TEMPLE_LOCATION.embedUrl;
  return `https://maps.google.com/maps?q=${encodeURIComponent(address.trim())}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
};
