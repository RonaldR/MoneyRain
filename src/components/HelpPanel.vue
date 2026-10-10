<script setup>
const emit = defineEmits(['close']);

const shortcuts = [
  [['Click', 'Space', '→'], 'Next gif + throw some cash'],
  [['←'], 'Previous gif'],
  [['Hold'], 'MAKE IT RAIN'],
  [['P'], 'Pause'],
  [['M'], 'Sound on / off'],
  [['R'], 'Rain on / off'],
  [['F'], 'Fullscreen'],
];
</script>

<template>
  <div class="help" data-ui @click.self="emit('close')">
    <div class="help__card" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <h2 id="help-title">How to make it rain 💸</h2>
      <dl>
        <template v-for="[keys, action] in shortcuts" :key="action">
          <dt><kbd v-for="key in keys" :key="key">{{ key }}</kbd></dt>
          <dd>{{ action }}</dd>
        </template>
      </dl>
      <p class="help__tip">Tip: rain anything you like through the url, like <a href="?q=cats">moneyrain.nl/?q=cats</a></p>
      <p class="help__secret">psst… ↑ ↑ ↓ ↓ ← → ← → B A</p>
      <button type="button" class="help__close" @click="emit('close')">Got it</button>
    </div>
  </div>
</template>

<style scoped>
.help {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgb(0 0 0 / 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.help__card {
  width: min(420px, 100%);
  padding: 24px;
  border: 1px solid rgb(255 215 0 / 0.3);
  border-radius: 20px;
  background: #111;
  box-shadow: 0 20px 60px rgb(0 0 0 / 0.8), 0 0 40px rgb(255 215 0 / 0.15);
}

h2 {
  margin: 0 0 16px;
  font-family: var(--font-loud);
  font-size: 28px;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--gold);
}

dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px 16px;
  margin: 0;
  align-items: center;
}

dt {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

dd {
  margin: 0;
  color: rgb(255 255 255 / 0.85);
}

kbd {
  min-width: 1.6em;
  padding: 2px 7px;
  border: 1px solid rgb(255 255 255 / 0.25);
  border-bottom-width: 3px;
  border-radius: 6px;
  font: inherit;
  font-size: 13px;
  text-align: center;
}

.help__tip {
  margin: 20px 0 0;
  font-size: 13px;
  color: rgb(255 255 255 / 0.6);

  a {
    color: var(--gold);
  }
}

.help__secret {
  margin: 6px 0 0;
  font-size: 12px;
  letter-spacing: 0.1em;
  color: rgb(255 255 255 / 0.25);
}

.help__close {
  width: 100%;
  margin-top: 20px;
  padding: 12px;
  border: 0;
  border-radius: 12px;
  background: var(--gold-gradient);
  color: #2a1a00;
  font: inherit;
  font-weight: 800;
  cursor: inherit;

  &:hover {
    filter: brightness(1.1);
  }
}
</style>
