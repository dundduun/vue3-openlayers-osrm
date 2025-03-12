import { createApp } from 'vue';

import OpenLayersMap from 'vue3-openlayers';
import 'vue3-openlayers/dist/vue3-openlayers.css';
import './assets/global.css';

import App from './App.vue';

createApp(App).use(OpenLayersMap).mount('#app');
