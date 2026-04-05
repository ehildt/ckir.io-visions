export interface ParameterConfig {
  key: string;
  iconKey: string;
  label: string;
  description: string;
}

export const PARAMETER_CONFIG: ParameterConfig[][] = [
  // Row 1
  [
    {
      key: 'blurSigma',
      iconKey: 'Zap',
      label: 'Blur Sigma',
      description: 'Gaussian blur amount',
    },
    {
      key: 'sharpenSigma',
      iconKey: 'ScanEye',
      label: 'Sharpen Sigma',
      description: 'Edge radius',
    },
    {
      key: 'sharpenM1',
      iconKey: 'ScanEye',
      label: 'Sharpen M1',
      description: 'Flat factor',
    },
  ],
  // Row 2
  [
    {
      key: 'sharpenM2',
      iconKey: 'ScanEye',
      label: 'Sharpen M2',
      description: 'Edge factor',
    },
    {
      key: 'claheWidth',
      iconKey: 'Sparkles',
      label: 'CLAHE Width',
      description: 'Grid width tiles',
    },
    {
      key: 'claheHeight',
      iconKey: 'Sparkles',
      label: 'CLAHE Height',
      description: 'Grid height tiles',
    },
  ],
  // Row 3
  [
    {
      key: 'claheMaxSlope',
      iconKey: 'Sparkles',
      label: 'Max Slope',
      description: 'Contrast limit',
    },
    {
      key: 'brightnessLevel',
      iconKey: 'Sparkles',
      label: 'Brightness',
      description: 'Brightness mult',
    },
    {
      key: 'normalizeLower',
      iconKey: 'Contrast',
      label: 'Norm. Lower',
      description: 'Lower percentile',
    },
  ],
  // Row 4
  [
    {
      key: 'normalizeUpper',
      iconKey: 'Contrast',
      label: 'Norm. Upper',
      description: 'Upper percentile',
    },
  ],
];
