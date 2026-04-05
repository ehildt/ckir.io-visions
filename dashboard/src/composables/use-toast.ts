import { toast, type ToastOptions, type ToastPosition } from 'vue3-toastify';

import ToastCloseButton from '../components/toast/Toast.CloseButton.vue';
import type { ToastType } from './use-toast.type';

export type { ToastOptions, ToastPosition, ToastType };

export interface ToastOptionsWithTheme extends ToastOptions {
  theme?: 'auto' | 'light' | 'dark' | 'colored';
  position?: ToastPosition;
}

export function useToast() {
  const show = (
    message: string,
    type: ToastType = 'default',
    options?: ToastOptionsWithTheme,
  ) => {
    const defaultOptions: ToastOptionsWithTheme = {
      position: 'bottom-right',
      autoClose: 3000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      theme: 'dark',
      closeButton: ToastCloseButton as any,
    };

    switch (type) {
      case 'info':
        return toast.info(message, { ...defaultOptions, ...options });
      case 'success':
        return toast.success(message, { ...defaultOptions, ...options });
      case 'warning':
        return toast.warn(message, { ...defaultOptions, ...options });
      case 'error':
        return toast.error(message, { ...defaultOptions, ...options });
      default:
        return toast(message, { ...defaultOptions, ...options });
    }
  };

  return {
    show,
    info: (message: string, options?: ToastOptionsWithTheme) =>
      show(message, 'info', options),
    success: (message: string, options?: ToastOptionsWithTheme) =>
      show(message, 'success', options),
    warning: (message: string, options?: ToastOptionsWithTheme) =>
      show(message, 'warning', options),
    error: (message: string, options?: ToastOptionsWithTheme) =>
      show(message, 'error', options),
    default: (message: string, options?: ToastOptionsWithTheme) =>
      show(message, 'default', options),
  };
}
