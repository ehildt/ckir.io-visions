function parseType(value: unknown): 'boolean' | 'number' | 'string' {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') {
    if (value === 'true' || value === 'false') return 'boolean';
    if (/^-?\d+(\.\d+)?$/.test(value)) return 'number';
  }
  return 'string';
}

function getTypeColor(type: 'boolean' | 'number' | 'string'): string {
  switch (type) {
    case 'boolean':
      return 'harmony-1';
    case 'number':
      return 'harmony-2';
    case 'string':
      return 'harmony-4';
  }
}

export function getValueTypeColor(value: unknown): string | null {
  return `text-${getTypeColor(parseType(value))}`;
}

export function getValueTypeGradient(value: unknown): string | null {
  const color = getTypeColor(parseType(value));
  return `from-${color}/20 via-${color}/5 to-transparent`;
}

export function getDetailFieldColors(field: string): {
  border: string;
  text: string;
  gradient: string;
} {
  switch (field) {
    case 'requestId':
    case 'stream':
    case 'original':
    case 'enabled':
    case 'brightnessLevel':
      return {
        border: 'border-tab-rest/30',
        text: 'text-tab-rest',
        gradient: 'from-tab-rest/20 via-tab-rest/5 to-transparent',
      };
    case 'roomId':
    case 'model':
    case 'grayscale':
    case 'blurSigma':
    case 'claheWidth':
      return {
        border: 'border-tab-mcp/30',
        text: 'text-tab-mcp',
        gradient: 'from-tab-mcp/20 via-tab-mcp/5 to-transparent',
      };
    case 'event':
    case 'sessionId':
    case 'denoised':
    case 'sharpenSigma':
    case 'claheHeight':
      return {
        border: 'border-tab-debug/30',
        text: 'text-tab-debug',
        gradient: 'from-tab-debug/20 via-tab-debug/5 to-transparent',
      };
    case 'numCtx':
    case 'preprocessing':
    case 'sharpened':
    case 'sharpenM1':
    case 'claheMaxSlope':
      return {
        border: 'border-tab-preprocessing/30',
        text: 'text-tab-preprocessing',
        gradient:
          'from-tab-preprocessing/20 via-tab-preprocessing/5 to-transparent',
      };
    case 'endpoint':
    case 'clahe':
    case 'sharpenM2':
    case 'normalizeLower':
    case 'normalizeUpper':
      return {
        border: 'border-accent-primary/30',
        text: 'text-accent-primary',
        gradient: 'from-accent-primary/20 via-accent-primary/5 to-transparent',
      };
    default:
      return {
        border: 'border-fg-muted/30',
        text: 'text-fg-muted',
        gradient: 'from-fg-muted/20 via-fg-muted/5 to-transparent',
      };
  }
}
