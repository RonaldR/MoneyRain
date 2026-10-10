import { createApp } from 'vue';
import App from './App.vue';
import { initAnalytics } from './lib/analytics';
import './style.css';

createApp(App).mount('#app');
initAnalytics();
