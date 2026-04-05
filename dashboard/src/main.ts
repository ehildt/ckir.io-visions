import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import vue3Toastify from 'vue3-toastify';

import ToastCloseButton from './components/toast/Toast.CloseButton.vue';
import App from './App.vue';

const app = createApp(App);
app.use(vue3Toastify, {
  position: 'top-right',
  autoClose: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  closeButton: ToastCloseButton,
});
app.use(VueQueryPlugin);
app.use(createPinia());
app.mount('#app');
