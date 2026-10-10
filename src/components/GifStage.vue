<script setup>
import loader from '@/assets/050gangster.gif';

defineProps({
  gif: { type: Object, default: null },
});
</script>

<template>
  <div class="stage">
    <Transition name="slide">
      <div v-if="gif" :key="gif.id" class="slide">
        <img v-if="gif.glow" class="slide__glow" :src="gif.glow" alt="">
        <img class="slide__gif" :src="gif.src" :alt="gif.title">
      </div>
      <div v-else class="slide">
        <img class="slide__gif slide__gif--loader" :src="loader" alt="Loading the money…">
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.stage {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #000;
}

.slide {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.slide__glow,
.slide__gif {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  user-select: none;
  -webkit-user-drag: none;
}

/* a blurred still of the gif fills the black bars around it */
.slide__glow {
  object-fit: cover;
  filter: blur(40px) saturate(1.5) brightness(0.45);
  transform: scale(1.2);
}

.slide__gif {
  object-fit: contain;
}

.slide__gif--loader {
  image-rendering: pixelated;
}

/* the new gif fades in on top, the old one only leaves once it's covered */
.slide-enter-active {
  transition: opacity 0.6s ease, transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: scale(1.06);
}

.slide-leave-active {
  z-index: 0;
  transition: opacity 0.3s ease 0.5s;
}

.slide-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .slide-enter-from {
    transform: none;
  }
}
</style>
