<script setup>
import giphyBadge from '@/assets/PoweredBy_200_Horizontal_Light-Backgrounds_With_Logo.gif';

defineProps({
  gif: { type: Object, default: null },
});
</script>

<template>
  <div class="credits" data-ui>
    <a v-if="gif" class="credits__title hud-fade" :href="gif.link" target="_blank" rel="noopener">
      {{ gif.title }} ↗
    </a>
    <a class="credits__giphy" href="https://giphy.com/search/money-rain" target="_blank" rel="noopener">
      <img :src="giphyBadge" class="credits__giphy-image" alt="Powered by GIPHY" width="150" height="20">
    </a>
  </div>
</template>

<style scoped>
.credits {
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 0 0 env(safe-area-inset-bottom) env(safe-area-inset-left);
  max-width: calc(100vw - 32px);
}

.credits__title {
  margin-left: 12px;
  max-width: 40ch;
  overflow: hidden;
  font-size: 13px;
  color: rgb(255 255 255 / 0.8);
  text-decoration: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-shadow: 0 1px 4px #000;

  &:hover {
    color: var(--gold);
  }
}

.credits__giphy {
  display: block;
}

/* the control bar sits right above the badge on small screens */
@media (max-width: 560px) {
  .credits__title {
    display: none;
  }
}

.credits__giphy-image {
  display: block;
  width: 150px;
  height: auto;
}
</style>
