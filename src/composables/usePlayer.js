import { ref, shallowRef, watch, onMounted, onBeforeUnmount } from 'vue';
import { createGifFeed, preload } from '@/lib/giphy';

const INTERVAL = 4000; // how long each gif stays on screen
const HISTORY_SIZE = 50;

async function loadNext(feed) {
  // skip gifs that fail to load instead of showing a broken one
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const item = await feed.take();
    try {
      await preload(item.src);
      return item;
    } catch {
      // try the next one
    }
  }
  return null;
}

function quietly(promise) {
  promise.catch(() => {});
  return promise;
}

export function usePlayer() {
  const current = shallowRef(null);
  const paused = ref(false);

  let feed = null;
  let upcoming = null;
  let history = [];
  let position = -1;
  let timer = null;
  let busy = false;
  let generation = 0;

  function schedule() {
    clearTimeout(timer);
    if (!paused.value && !document.hidden && feed) timer = setTimeout(next, INTERVAL);
  }

  function show(item) {
    current.value = item;
    schedule();
  }

  function push(item) {
    history = [...history.slice(0, position + 1), item].slice(-HISTORY_SIZE);
    position = history.length - 1;
    show(item);
  }

  async function next() {
    if (position < history.length - 1) {
      position += 1;
      show(history[position]);
      return;
    }
    if (busy || !upcoming) return;

    busy = true;
    const started = generation;
    try {
      const item = await upcoming;
      if (started !== generation) return;
      upcoming = quietly(loadNext(feed));
      if (item) push(item);
      else schedule();
    } catch {
      // network hiccup: try again on the next tick
      if (started === generation) upcoming = quietly(loadNext(feed));
      schedule();
    } finally {
      busy = false;
    }
  }

  function previous() {
    if (position <= 0) return;
    position -= 1;
    show(history[position]);
  }

  /** Switch to a new search. Rejects (and keeps the current gifs) when Giphy has nothing. */
  async function search(query) {
    generation += 1;
    const started = generation;
    const nextFeed = createGifFeed(query);
    const item = await loadNext(nextFeed);
    if (started !== generation) return;

    feed = nextFeed;
    upcoming = quietly(loadNext(feed));
    if (item) push(item);
  }

  const onVisibility = () => schedule();
  watch(paused, schedule);
  onMounted(() => document.addEventListener('visibilitychange', onVisibility));
  onBeforeUnmount(() => {
    clearTimeout(timer);
    document.removeEventListener('visibilitychange', onVisibility);
  });

  return { current, paused, next, previous, search };
}
