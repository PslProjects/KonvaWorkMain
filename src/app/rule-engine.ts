import * as fabric from 'fabric';
export interface LineRule {
  id?: number; 
  when: string;      // "(RS0 & RS1)"
  lines: string[];   // ["LG1", "LG2"]
  stroke: string;    // "red"
  priority: number;
}
// ek boolean condition ko safely evaluate karta hai
function evalCondition(when: string, closed: Set<string>): boolean {
  // safety: sirf signal-name, space, & | ! ( ) allowed
  if (!/^[\w\s&|!()]+$/.test(when)) {
    console.warn('Galat condition skip ki:', when);
    return false;
  }
  // har token (RS1, RS012...) ko closed.has('..') me badlo
  const js = when
    .replace(/[A-Za-z]\w*/g, (tok) => `c.has('${tok}')`)
    .replace(/&/g, '&&')
    .replace(/\|/g, '||');
  try {
    // eslint-disable-next-line no-new-func
    return Function('c', `return (${js});`)(closed) === true;
  } catch (e) {
    console.warn('Condition eval fail:', when, e);
    return false;
  }
}
// DB se aaye rules ko canvas par laga deta hai (har board ke liye same engine)
export function applyRulesToCanvas(
  canvas: fabric.Canvas,
  closed: Set<string>,
  rules: LineRule[]
): void {
  // 1) pehle saari colored lines ko unke original color par reset
  canvas.getObjects().forEach(o => {
    const t = (o as any).customType;
    if (t === 'lineG' || t === 'lineR') {
      o.set('stroke', (o as any).originalStroke || (t === 'lineR' ? 'red' : 'green'));
    }
    // lineB (black) ko chhod dete hain
  });
  // 2) priority order me har matching rule apply karo
  [...rules]
    .sort((a, b) => (a.priority || 0) - (b.priority || 0))
    .forEach(rule => {
      if (!evalCondition(rule.when, closed)) return;
      rule.lines.forEach(lineId => {
        // sirf abhi loaded board ke objects me se dhoondhega -> namespace safe
        const line = canvas.getObjects().find(o => (o as any).customId === lineId);
        if (line) line.set('stroke', rule.stroke || 'red');
      });
    });
  canvas.renderAll();
} 