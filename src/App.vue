<template>
  <div id="app">
    <MoneyRain />
  </div>
</template>

<script>
import MoneyRain from '@/components/MoneyRain.vue';

export default {
  name: 'app',
  components: {
    MoneyRain,
  },
};
</script>

<style lang="scss">
html, body {
  margin: 0;
  padding: 0;
  background: black;
  height: 100%;
}
/* Start http://www.cursors-4u.com */
body {cursor: url(http://cur.cursors-4u.net/others/oth-2/oth192.cur), progress !important;}
/* End http://www.cursors-4u.com */
</style>
