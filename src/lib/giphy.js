const API_KEY = '3L2CLwQyQ99XlAv8pqwYTnaRgFJJFVdz';
const ENDPOINT = 'https://api.giphy.com/v1/gifs/search';
// Giphy returns at most 50 results per request and won't page past offset 4999
const PAGE_SIZE = 50;
const MAX_OFFSET = 4999;
const LOAD_TIMEOUT = 10000;

export const DEFAULT_QUERY = 'money-rain';

export class NoResultsError extends Error {}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function toItem(gif) {
  const { original, fixed_width_still: still } = gif.images;
  return {
    id: gif.id,
    // every modern browser plays animated webp, and it's a fraction of the gif size
    src: original.webp || original.url,
    // tiny still frame, blurred up behind the gif to fill the black bars
    glow: still?.url,
    title: gif.title || 'Untitled GIF',
    link: gif.url,
  };
}

/**
 * Endless, shuffled stream of gifs for a search query. Pages through the
 * results in the background and starts over once everything has been shown.
 */
export function createGifFeed(query) {
  let offset = 0;
  let total = Infinity;
  let pending = null;
  let lastId = null;
  const queue = [];
  const seen = new Set();

  async function fetchPage() {
    if (offset >= Math.min(total, MAX_OFFSET)) {
      offset = 0;
      seen.clear();
    }

    const params = new URLSearchParams({
      api_key: API_KEY,
      q: query,
      limit: PAGE_SIZE,
      offset,
      rating: 'r',
      lang: 'en',
    });
    const response = await fetch(`${ENDPOINT}?${params}`);
    if (!response.ok) throw new Error(`Giphy responded with ${response.status}`);
    const { data, pagination } = await response.json();

    if (!data.length && offset === 0) throw new NoResultsError(query);
    total = data.length ? pagination.total_count : offset;
    offset += data.length;

    const fresh = data.map(toItem).filter((item) => item.src && !seen.has(item.id));
    fresh.forEach((item) => seen.add(item.id));
    queue.push(...shuffle(fresh));
  }

  function refill() {
    pending ??= fetchPage().finally(() => {
      pending = null;
    });
    return pending;
  }

  async function take() {
    for (let attempt = 0; queue.length === 0 && attempt < 3; attempt += 1) {
      await refill();
    }
    if (queue.length === 0) throw new NoResultsError(query);

    // don't show the same gif twice in a row when the feed starts over
    if (queue.length > 1 && queue[0].id === lastId) queue.push(queue.shift());
    const item = queue.shift();
    lastId = item.id;

    if (queue.length < 5) refill().catch(() => {});
    return item;
  }

  return { query, take };
}

export function preload(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = setTimeout(() => reject(new Error(`Timed out loading ${src}`)), LOAD_TIMEOUT);
    image.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    image.onerror = () => {
      clearTimeout(timer);
      reject(new Error(`Failed to load ${src}`));
    };
    image.src = src;
  });
}
