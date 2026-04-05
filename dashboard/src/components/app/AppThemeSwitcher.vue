<script setup lang="ts">
import type { ThemeColors, ThemeName } from '../../stores/theme';

defineProps<{
  currentTheme: ThemeName;
  themeColors: Record<ThemeName, ThemeColors>;
  darkThemes: ThemeName[];
  darkThemes2: ThemeName[];
}>();

const emit = defineEmits<{
  (e: 'change', theme: ThemeName): void;
}>();
</script>

<template>
  <div
    class="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-0.5 pr-0 w-40 pointer-events-none font-mono"
  >
    <template v-for="name in darkThemes" :key="name">
      <button
        class="group relative h-10 w-full flex items-center justify-end pointer-events-auto"
        @click="emit('change', name)"
      >
        <div
          class="w-28 h-full flex items-center justify-end pr-2 transition-all duration-300"
          :style="{
            background:
              currentTheme === name
                ? `linear-gradient(to left, ${themeColors[name].primary}88, ${themeColors[name].primary}20 30%, transparent)`
                : `linear-gradient(to left, ${themeColors[name].primary}15, transparent 60%)`,
          }"
        >
          <span
            class="text-[10px] font-bold uppercase tracking-wider transition-all duration-300"
            :class="
              currentTheme === name
                ? 'text-fg-primary'
                : 'text-fg-muted/20 group-hover:text-fg-muted/80 group-hover:bg-none'
            "
            :style="
              currentTheme !== name
                ? {
                    textShadow: `0 0 8px ${themeColors[name].primary}40`,
                  }
                : {}
            "
          >
            {{ themeColors[name].name }}
          </span>
        </div>
      </button>
    </template>
    <template v-for="name in darkThemes2" :key="name">
      <button
        class="group relative h-10 w-full flex items-center justify-end pointer-events-auto"
        @click="emit('change', name)"
      >
        <div
          class="w-28 h-full flex items-center justify-end pr-2 transition-all duration-300"
          :style="{
            background:
              currentTheme === name
                ? `linear-gradient(to left, ${themeColors[name].primary}88, ${themeColors[name].primary}20 30%, transparent)`
                : `linear-gradient(to left, ${themeColors[name].primary}15, transparent 60%)`,
          }"
        >
          <span
            class="text-[10px] font-bold uppercase tracking-wider transition-all duration-300"
            :class="
              currentTheme === name
                ? 'text-fg-primary'
                : 'text-fg-muted/20 group-hover:text-fg-muted/80 group-hover:bg-none'
            "
            :style="
              currentTheme !== name
                ? {
                    textShadow: `0 0 8px ${themeColors[name].primary}40`,
                  }
                : {}
            "
          >
            {{ themeColors[name].name }}
          </span>
        </div>
      </button>
    </template>
  </div>
</template>
