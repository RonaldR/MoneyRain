<template>
  <div class="credits">
    <a class="credits__oldrain" href="old_index.html">2.0 -> old rain</a>
    <a class="credits__giphy" href="https://giphy.com/search/money-rain" target="_blank">
      <img src="../assets/PoweredBy_200_Horizontal_Light-Backgrounds_With_Logo.gif"
           class="credits__giphy-image" alt="powered by giphy" />
    </a>
  </div>

</template>

<style scoped lang="scss">

.credits {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.credits__oldrain {
  font-size: 16px;
  color: white;
  cursor: pointer;
  display: inline-block;
  transition: all 1s linear;
  font-weight: bold;
  margin: 0 0 8px 8px;
  display: block;

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
  width: 150px;
  display: block;
}

</style>
