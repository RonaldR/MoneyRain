import { ref, watch } from 'vue';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** A ref that remembers its value in localStorage. */
export function useStoredRef(key, fallback) {
  const value = ref(read(key, fallback));

  watch(value, (current) => {
    try {
      localStorage.setItem(key, JSON.stringify(current));
    } catch {
      // private mode or storage full, not worth crying over
    }
  });

  return value;
}
