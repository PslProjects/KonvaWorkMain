import * as fabric from 'fabric';

export function guessTypeFromContent(obj: fabric.Object): string {
  if (obj.type?.toLowerCase() === 'group') {
    const children = (obj as any).getObjects?.() ?? [];
    if (
      children.length === 3 &&
      children.some((o: any) => o.fill === '#8B0000' || o.fill === 'green') &&
      children.some((o: any) => o.fill === 'white')
    ) {
      return 'redSignal';
    }
    return 'group';
  }
  return obj.type || '';
}
