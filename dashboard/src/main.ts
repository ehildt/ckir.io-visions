import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './old/App.vue';

const app = createApp(App);
app.use(VueQueryPlugin);
app.use(createPinia());
app.mount('#app');
