<template>
  <div class="credits">
    <a class="credits__oldrain" href="old_index.html">2.0 -> old rain</a>
    <a class="credits__giphy" href="https://giphy.com/search/money-rain" target="_blank">
      <img src="../assets/Poweredby_100px_Badge.gif" class="credits__giphy-image" alt="powered by giphy" />
    </a>
  </div>

</template>

<style scoped lang="scss">

.credits {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.credits__oldrain {
  font-size: 16px;
  color: white;
  cursor: pointer;
  display: inline-block;
  transition: all 3s linear;
  font-weight: bold;

  &:hover {
    transform: rotate3d(1, 1, 1, 360deg);
  }
}

.credits__giphy {
  font-size: 18px;
  color: white;
  cursor: pointer;
  display: inline-block;
  text-decoration: none;
}

.credits__giphy-image {
  width: 40px;
}

</style>
