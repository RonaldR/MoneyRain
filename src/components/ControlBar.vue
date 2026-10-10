<script setup>
defineProps({
  paused: Boolean,
  muted: Boolean,
  canFullscreen: Boolean,
});
const emit = defineEmits(['toggle-pause', 'toggle-mute', 'fullscreen', 'share', 'help']);
</script>

<template>
  <div class="controls hud-fade" data-ui>
    <button type="button" :title="paused ? 'Play (P)' : 'Pause (P)'" @click="emit('toggle-pause')">
      <svg v-if="paused" class="icon icon--filled" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z" /></svg>
      <svg v-else class="icon icon--filled" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
      <span class="sr-only">{{ paused ? 'Play' : 'Pause' }}</span>
    </button>

    <button type="button" :title="muted ? 'Sound on (M)' : 'Sound off (M)'" @click="emit('toggle-mute')">
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9h4l5-4v14l-5-4H4z" />
        <path v-if="muted" d="m17 9 5 6m0-6-5 6" />
        <path v-else d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
      </svg>
      <span class="sr-only">{{ muted ? 'Sound on' : 'Sound off' }}</span>
    </button>

    <button v-if="canFullscreen" type="button" title="Fullscreen (F)" @click="emit('fullscreen')">
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" /></svg>
      <span class="sr-only">Fullscreen</span>
    </button>

    <button type="button" title="Share" @click="emit('share')">
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6M16 7l-4-4-4 4M12 3v12" /></svg>
      <span class="sr-only">Share</span>
    </button>

    <button type="button" title="Help (?)" @click="emit('help')">
      <span class="icon-text" aria-hidden="true">?</span>
      <span class="sr-only">Help</span>
    </button>
  </div>
</template>

<style scoped>
.controls {
  position: fixed;
  right: max(12px, env(safe-area-inset-right));
  bottom: max(12px, env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border: 1px solid rgb(255 255 255 / 0.12);
  border-radius: 999px;
  background: rgb(0 0 0 / 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: #fff;
  cursor: inherit;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover,
  &:focus-visible {
    background: rgb(255 255 255 / 0.12);
    color: var(--gold);
  }

  &:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: -2px;
  }
}

.icon {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.icon--filled {
  fill: currentColor;
  stroke: none;
}

.icon-text {
  font-size: 17px;
  font-weight: 800;
}
</style>
