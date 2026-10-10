<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import GifStage from '@/components/GifStage.vue';
import MoneyRain from '@/components/MoneyRain.vue';
import CreditsRain from '@/components/CreditsRain.vue';
import ControlBar from '@/components/ControlBar.vue';
import HelpPanel from '@/components/HelpPanel.vue';
import GithubCorner from '@/components/GithubCorner.vue';
import { usePlayer } from '@/composables/usePlayer';
import { useStoredRef } from '@/composables/useStoredRef';
import { DEFAULT_QUERY, NoResultsError } from '@/lib/giphy';
import { kaching, plink } from '@/lib/sound';

const HOLD_DELAY = 250;
const IDLE_DELAY = 3000;
const JACKPOT_DURATION = 6000;
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canFullscreen = document.fullscreenEnabled;

const player = usePlayer();
const rain = ref(null);

// the search is hackable through the url: moneyrain.nl/?q=cats
const query = new URLSearchParams(window.location.search).get('q')?.trim() || DEFAULT_QUERY;
const muted = useStoredRef('moneyrain:muted', true);
const raining = useStoredRef('moneyrain:raining', !reducedMotion);
const drizzle = computed(() => (raining.value ? 5 : 0));

const helpOpen = ref(false);
const idle = ref(false);
const jackpotOn = ref(false);
const toast = ref('');

/* ---------- little helpers ---------- */

let toastTimer = null;
function showToast(message) {
  toast.value = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value = '';
  }, 3500);
}

let idleTimer = null;
function wake() {
  idle.value = false;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    idle.value = true;
  }, IDLE_DELAY);
}

function ching() {
  if (!muted.value) kaching();
}

/* ---------- loading gifs ---------- */

async function start(value) {
  try {
    await player.search(value);
    if (value !== DEFAULT_QUERY) document.title = `Money Rain 💸 ${value}`;
  } catch (error) {
    if (error instanceof NoResultsError && value !== DEFAULT_QUERY) {
      showToast(`No money found for “${value}” 😢`);
      start(DEFAULT_QUERY);
    } else {
      showToast('Giphy is broke right now, retrying… 💸');
      setTimeout(() => start(value), 5000);
    }
  }
}

/* ---------- making it rain ---------- */

function next() {
  player.next();
}

function throwCash(x = window.innerWidth / 2, y = window.innerHeight * 0.6) {
  rain.value.burst(x, y, reducedMotion ? 8 : 24);
  ching();
}

function jackpot() {
  if (jackpotOn.value) return;
  jackpotOn.value = true;
  rain.value.jackpot(JACKPOT_DURATION);
  if (!muted.value) [0, 200, 400].forEach((delay) => setTimeout(kaching, delay));
  setTimeout(() => {
    jackpotOn.value = false;
  }, JACKPOT_DURATION);
}

/* ---------- pointer: tap = next gif, hold = make it rain ---------- */

let hold = null;

function isUi(target) {
  return target.closest('[data-ui], a, button, input');
}

function onPointerDown(event) {
  if (event.button !== 0 || isUi(event.target)) return;
  event.currentTarget.setPointerCapture(event.pointerId);
  throwCash(event.clientX, event.clientY);

  hold = { id: event.pointerId, x: event.clientX, y: event.clientY, throwing: false, plinks: null };
  hold.timer = setTimeout(() => {
    hold.throwing = true;
    rain.value.startThrow(hold.x, hold.y);
    if (!muted.value) hold.plinks = setInterval(plink, 90);
  }, HOLD_DELAY);
}

function onPointerMove(event) {
  wake();
  if (!hold || event.pointerId !== hold.id) return;
  hold.x = event.clientX;
  hold.y = event.clientY;
  rain.value.moveThrow(hold.x, hold.y);
}

function onPointerUp(event) {
  if (!hold || event.pointerId !== hold.id) return;
  clearTimeout(hold.timer);
  clearInterval(hold.plinks);
  if (hold.throwing) rain.value.stopThrow();
  else if (event.type === 'pointerup') next();
  hold = null;
}

/* ---------- keyboard ---------- */

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    // not allowed, oh well
  }
}

async function share() {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title: document.title, url });
    } catch {
      // share sheet dismissed
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    showToast('Link copied, spread the wealth 💸');
  } catch {
    showToast(url);
  }
}

let konami = 0;

function onKeydown(event) {
  wake();
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.target.closest?.('input')) return;
  // let space and enter press focused buttons and links as usual
  if ((event.key === ' ' || event.key === 'Enter') && event.target.closest?.('button, a')) return;

  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (key === KONAMI[konami]) konami += 1;
  else konami = key === KONAMI[0] ? 1 : 0;
  if (konami === KONAMI.length) {
    konami = 0;
    jackpot();
    return;
  }

  switch (key) {
    case ' ':
    case 'ArrowRight':
      event.preventDefault();
      throwCash(window.innerWidth * (0.2 + Math.random() * 0.6));
      next();
      break;
    case 'ArrowLeft':
      player.previous();
      break;
    case 'p':
      player.paused.value = !player.paused.value;
      showToast(player.paused.value ? 'Paused ⏸' : 'Making it rain again ▶');
      break;
    case 'm':
      muted.value = !muted.value;
      break;
    case 'r':
      raining.value = !raining.value;
      break;
    case 'f':
      if (canFullscreen) toggleFullscreen();
      break;
    case '?':
      helpOpen.value = !helpOpen.value;
      break;
    case 'Escape':
      helpOpen.value = false;
      break;
    default:
  }
}

function toggleMute() {
  muted.value = !muted.value;
  ching();
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  wake();
  start(query);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  clearTimeout(idleTimer);
  clearTimeout(toastTimer);
});
</script>

<template>
  <main
    class="app"
    :class="{ 'app--idle': idle && !helpOpen, 'app--jackpot': jackpotOn }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @contextmenu.prevent
  >
    <GifStage :gif="player.current.value" />
    <MoneyRain ref="rain" :drizzle="drizzle" />

    <Transition name="pop">
      <div v-if="jackpotOn" class="jackpot" aria-live="polite">JACKPOT</div>
    </Transition>

    <CreditsRain :gif="player.current.value" />
    <ControlBar
      :paused="player.paused.value"
      :muted="muted"
      :can-fullscreen="canFullscreen"
      @toggle-pause="player.paused.value = !player.paused.value"
      @toggle-mute="toggleMute"
      @fullscreen="toggleFullscreen"
      @share="share"
      @help="helpOpen = true"
    />
    <GithubCorner />

    <Transition name="fade">
      <HelpPanel v-if="helpOpen" @close="helpOpen = false" />
    </Transition>

    <Transition name="toast">
      <div v-if="toast" class="toast" role="status">{{ toast }}</div>
    </Transition>
  </main>
</template>

<style scoped>
.app {
  position: fixed;
  inset: 0;
  overflow: hidden;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;

  &:active {
    cursor: var(--cursor-throw);
  }
}

/* controls get out of the way while you just watch */
.app--idle :deep(.hud-fade):not(:focus-within) {
  opacity: 0;
  pointer-events: none;
}

:deep(.hud-fade) {
  transition: opacity 0.4s ease;
}

.app--jackpot :deep(.stage) {
  animation: shake 0.4s ease-in-out infinite;
}

.jackpot {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  font-family: var(--font-loud);
  font-size: clamp(64px, 18vw, 220px);
  line-height: 1;
  background: var(--gold-gradient);
  background-size: 100% 200%;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 6px 0 #5a3c00) drop-shadow(0 0 40px rgb(255 200 0 / 0.6));
  animation: throb 0.5s ease-in-out infinite alternate, shimmer 1.2s linear infinite;
}

.toast {
  position: fixed;
  top: max(16px, env(safe-area-inset-top));
  left: 50%;
  max-width: calc(100vw - 180px);
  padding: 10px 18px;
  border: 1px solid rgb(255 215 0 / 0.35);
  border-radius: 999px;
  background: rgb(0 0 0 / 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  translate: -50% 0;
  pointer-events: none;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active {
  transition: transform 0.5s cubic-bezier(0.2, 1.6, 0.4, 1), opacity 0.2s ease;
}

.pop-leave-active {
  transition: opacity 0.6s ease;
}

.pop-enter-from {
  opacity: 0;
  transform: scale(0.2) rotate(-10deg);
}

.pop-leave-to {
  opacity: 0;
}

@keyframes throb {
  to { transform: scale(1.08) rotate(-2deg); }
}

@keyframes shimmer {
  to { background-position: 0 200%; }
}

@keyframes shake {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-4px, 2px); }
  50% { transform: translate(3px, -3px); }
  75% { transform: translate(-2px, -2px); }
}

@media (prefers-reduced-motion: reduce) {
  .app--jackpot :deep(.stage),
  .jackpot {
    animation: none;
  }
}
</style>
