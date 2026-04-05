<script setup lang="ts">
import {
  Contrast,
  ScanEye,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from 'lucide-vue-next';

import {
  BlurSigmaInput,
  BrightnessInput,
  ClaheHeightInput,
  ClaheMaxSlopeInput,
  ClaheWidthInput,
  NormalizeLowerInput,
  NormalizeUpperInput,
  SharpenM1Input,
  SharpenM2Input,
  SharpenSigmaInput,
} from '../../components/inputs';
import {
  PreprocessingParamTile,
  PreprocessingSection,
} from '../../components/preprocessing';
import { ActionTagButton } from '../../components/ui';
import PanelHeader from '../../components/ui/PanelHeader.vue';
import { usePreprocessingStore } from '../../stores/preprocessing';

const store = usePreprocessingStore();

const iconMap = {
  Zap,
  ScanEye,
  Sparkles,
  Contrast,
};

const parameters = [
  // Row 1
  [
    {
      field: BlurSigmaInput,
      key: 'blurSigma',
      icon: 'Zap',
      label: 'Blur Sigma',
      desc: 'Gaussian blur amount',
    },
    {
      field: SharpenSigmaInput,
      key: 'sharpenSigma',
      icon: 'ScanEye',
      label: 'Sharpen Sigma',
      desc: 'Edge radius',
    },
    {
      field: SharpenM1Input,
      key: 'sharpenM1',
      icon: 'ScanEye',
      label: 'Sharpen M1',
      desc: 'Flat factor',
    },
  ],
  // Row 2
  [
    {
      field: SharpenM2Input,
      key: 'sharpenM2',
      icon: 'ScanEye',
      label: 'Sharpen M2',
      desc: 'Edge factor',
    },
    {
      field: ClaheWidthInput,
      key: 'claheWidth',
      icon: 'Sparkles',
      label: 'CLAHE Width',
      desc: 'Grid width tiles',
    },
    {
      field: ClaheHeightInput,
      key: 'claheHeight',
      icon: 'Sparkles',
      label: 'CLAHE Height',
      desc: 'Grid height tiles',
    },
  ],
  // Row 3
  [
    {
      field: ClaheMaxSlopeInput,
      key: 'claheMaxSlope',
      icon: 'Sparkles',
      label: 'Max Slope',
      desc: 'Contrast limit',
    },
    {
      field: BrightnessInput,
      key: 'brightnessLevel',
      icon: 'Sparkles',
      label: 'Brightness',
      desc: 'Brightness mult',
    },
    {
      field: NormalizeLowerInput,
      key: 'normalizeLower',
      icon: 'Contrast',
      label: 'Norm. Lower',
      desc: 'Lower percentile',
    },
  ],
  // Row 4
  [
    {
      field: NormalizeUpperInput,
      key: 'normalizeUpper',
      icon: 'Contrast',
      label: 'Norm. Upper',
      desc: 'Upper percentile',
    },
  ],
] as const;
</script>

<template>
  <div class="bg-elevated border border-divider panel-glow h-fit">
    <PanelHeader title="Options" />

    <div class="p-4 space-y-4">
      <PreprocessingSection
        :icon="SlidersHorizontal"
        title="Advanced Parameters"
      >
        <template #action>
          <ActionTagButton
            label="RST"
            variant="preprocessing"
            title="Reset all"
            :disabled="!store.hasAnyParameterModified"
            @click="store.resetParametersToDefaults()"
          />
        </template>
        <div
          v-for="(row, rowIndex) in parameters"
          :key="rowIndex"
          class="grid grid-cols-3 gap-2"
        >
          <PreprocessingParamTile
            v-for="param in row"
            :key="param.key"
            :icon="iconMap[param.icon]"
            :label="param.label"
            :description="param.desc"
            :disabled="!store.enabled"
            :highlighted="store.isParameterHighlighted(param.key)"
            :modified="
              store.isParameterModified(
                param.key as keyof typeof store.parameters,
              )
            "
            @mouseenter="
              store.setHoveredParameter(
                param.key as keyof typeof store.parameters,
              )
            "
            @mouseleave="store.setHoveredParameter(null)"
            @reset="
              store.resetParameter(param.key as keyof typeof store.parameters)
            "
          >
            <component
              :is="param.field"
              :model-value="
                store.parameters[param.key as keyof typeof store.parameters]
              "
              :disabled="!store.enabled"
              @update:model-value="
                store.setParameter(
                  param.key as keyof typeof store.parameters,
                  $event,
                )
              "
            />
          </PreprocessingParamTile>

          <!-- Fill empty slots in last row -->
          <template v-if="row.length < 3">
            <div
              v-for="n in 3 - row.length"
              :key="`empty-${n}`"
              class="p-3 border border-divider bg-primary h-25 opacity-0"
            />
          </template>
        </div>
      </PreprocessingSection>
    </div>
  </div>
</template>
