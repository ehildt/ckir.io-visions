import type { ActiveTab } from '../../stores/app';

export function getTabColorClass(tab: ActiveTab): string {
  switch (tab) {
    case 'rest':
      return 'text-tab-rest';
    case 'mcp':
      return 'text-tab-mcp';
    case 'preprocessing':
      return 'text-tab-preprocessing';
    case 'debug':
      return 'text-tab-debug';
    default:
      return 'text-tab-debug';
  }
}

export function getTabBorderClass(tab: ActiveTab): string {
  switch (tab) {
    case 'rest':
      return 'border-tab-rest';
    case 'mcp':
      return 'border-tab-mcp';
    case 'preprocessing':
      return 'border-tab-preprocessing';
    case 'debug':
      return 'border-tab-debug';
    default:
      return 'border-tab-debug';
  }
}
