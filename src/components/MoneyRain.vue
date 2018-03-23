<template>
  <div class="moneyrain" :style="{ backgroundImage: image }">
    <CreditsRain />

    <link rel="preload" :href="this.imageSrc" as="image">
  </div>
</template>

<script>
import axios from 'axios';
import CreditsRain from '@/components/CreditsRain.vue';
import 'url-search-params-polyfill'; // for IE...

export default {
  name: 'MoneyRain',
  components: {
    CreditsRain,
  },
  data() {
    return {
      image: '',
      imageSrc: ''
    }
  },
  created() {
    const urlParams = new URLSearchParams(window.location.search);
    let query = urlParams.get('q');
    if (!query) {
      query = 'money-rain';
    }
    // on created get money rain images from giphy
    axios.get(`https://api.giphy.com/v1/gifs/search?api_key=3L2CLwQyQ99XlAv8pqwYTnaRgFJJFVdz&q=${query}&limit=500&offset=0&rating=R&lang=en`)
      .then((response) => {
        const imageData = response.data.data;

        // change the money raining image every 4 sec
        setInterval(() => {
          this.doImageStuff(imageData);
        }, 4000);

        this.doImageStuff(imageData);
      })
      .catch((error) => {
        console.log(error);
        this.image = ''; // reset on error
      });
  },
  methods: {
    doImageStuff(imageData) {
      // set the image
      if (this.imageSrc) {
        this.image = 'url(' + this.imageSrc + ')';
      }

      // pick random number for random image
      const randomNumber = Math.floor(Math.random() * imageData.length) + 1;

      // check if chrome browser, chrome supports webp
      // imageSrc will hold the url to the images which will be preloaded
      const isChrome = /Google Inc/.test(navigator.vendor);
      if (isChrome && imageData[randomNumber].images.original.webp) {
        this.imageSrc = imageData[randomNumber].images.original.webp;
      } else {
        this.imageSrc = imageData[randomNumber].images.original.url;
      }
    }
  }
};
</script>

<style scoped lang="scss">

.moneyrain {
  background: url('../assets/050gangster.gif') no-repeat center;
  background-size: contain;
  transition: background 0.2s ease-in-out;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

</style>
