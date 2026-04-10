import { init } from '@paralleldrive/cuid2';
import { ref } from 'vue';

const createId = init({
  random: Math.random,
  length: 10,
  fingerprint: 'ckir.io-visions',
});

export function useRequestId() {
  const requestId = ref(createId());

  function refresh() {
    requestId.value = createId();
  }

  return { requestId, refresh };
}
