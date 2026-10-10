<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Rain } from '@/lib/rain';

const props = defineProps({
  drizzle: { type: Number, default: 5 },
});

const canvas = ref(null);
let rain = null;

onMounted(() => {
  rain = new Rain(canvas.value);
  rain.drizzle = props.drizzle;
});
onBeforeUnmount(() => rain?.destroy());
watch(() => props.drizzle, (value) => {
  if (rain) rain.drizzle = value;
});

defineExpose({
  burst: (...args) => rain?.burst(...args),
  startThrow: (...args) => rain?.startThrow(...args),
  moveThrow: (...args) => rain?.moveThrow(...args),
  stopThrow: () => rain?.stopThrow(),
  jackpot: (duration) => rain?.jackpot(duration),
});
</script>

<template>
  <canvas ref="canvas" class="money-rain" aria-hidden="true" />
</template>

<style scoped>
.money-rain {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
