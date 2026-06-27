// circuit-logics.ts

import * as fabric from 'fabric';


type LineRule = {
    when: string;
    lines: string[];
    stroke: 'red' | 'green';
    priority?: number;
};



function runLineRules(
    canvas: fabric.Canvas,
    closedSignals: Set<string>,
    rules: LineRule[]
) {
    const sortedRules = [...rules].sort(
        (a, b) => (a.priority ?? 0) - (b.priority ?? 0)
    );

    canvas.getObjects().forEach(obj => {
        const anyObj = obj as any;

        if (
            (anyObj.customType !== 'lineR' && anyObj.customType !== 'lineG') ||
            !anyObj.customId
        ) return;

        const lineId = anyObj.customId;
        let stroke = anyObj.originalStroke || 'green';

        for (const rule of sortedRules) {
            if (
                rule.lines.includes(lineId) &&
                evalCondition(rule.when, closedSignals)
            ) {
                stroke = rule.stroke;
            }
        }

        anyObj.set('stroke', stroke);
    });

    canvas.renderAll();
}


function evalCondition(expr: string, closed: Set<string>): boolean {
    // Convert RS names to closed.has('RSx')
    const jsExpr = expr
        .replace(/\bRS\d+\b/g, rs => `closed.has('${rs}')`)
        .replace(/&/g, '&&')
        .replace(/\|/g, '||')
        .replace(/!/g, '!');

    try {
        return Function('closed', `return (${jsExpr});`)(closed);
    } catch (e) {
        console.error('Rule parse error:', expr, e);
        return false;
    }
}


export function mainCircuitLogic(canvas: fabric.Canvas, closedSignals: Set<string>) {
    console.log('[LOGIC] mainCircuitLogic called', { closedCount: closedSignals.size });


    const rs18_19_20_closed = ['RS18', 'RS19', 'RS20'].some(rs => closedSignals.has(rs));
    const rs18_19_20_lines = ['LG25', 'LG39', 'LG46', 'LG24', 'LG38', 'LG45'];
    const rs8_9_10_closed = ['RS8', 'RS9', 'RS10'].some(rs => closedSignals.has(rs));
    const rs11_closed = closedSignals.has('RS11');
    const rs1_closed = closedSignals.has('RS1');
    const rs3_closed = closedSignals.has('RS3');
    const rs4_closed = closedSignals.has('RS4');
    const rs39_closed = closedSignals.has('RS39');
    const rs12_closed = closedSignals.has('RS12');
    const rs2_closed = closedSignals.has('RS2');
    const rs15_closed = closedSignals.has('RS15');
    const rs46_closed = closedSignals.has('RS46');
    const rs47_closed = closedSignals.has('RS47');
    const rs11_main = ['LG7', 'LG8', 'LG11', 'LG12'];
    const rs26_closed = closedSignals.has('RS26');
    const rs38_closed = closedSignals.has('RS38');
    const rs37_closed = closedSignals.has('RS37');
    const rs45_closed = closedSignals.has('RS45');
    const rs11_lines = ['LG7', 'LG8', 'LG11', 'LG12', 'LG24', 'LG25', 'LG38', 'LG39', 'LG45', 'LG46'];

    // ================= LEFT MAIN GROUP =================
    const rs57_closed = closedSignals.has('RS57');
    const rs58_closed = closedSignals.has('RS58');
    const rs59_closed = closedSignals.has('RS59');
    const rs60_closed = closedSignals.has('RS60');
    const rs61_closed = closedSignals.has('RS61');
    const rs62_closed = closedSignals.has('RS62');
    const rs63_closed = closedSignals.has('RS63');
    const rs64_closed = closedSignals.has('RS64');
    const rs65_closed = closedSignals.has('RS65');
    const rs66_closed = closedSignals.has('RS66');
    const rs67_closed = closedSignals.has('RS67');
    const rs68_closed = closedSignals.has('RS68');

    // ================= GROUPED CONDITIONS =================
    const rs58_59_60_closed = rs58_closed && rs59_closed && rs60_closed;
    const rs69_71_72_closed = ['RS69', 'RS71', 'RS72'].some(rs => closedSignals.has(rs));
    const rs70_74_73_closed = ['RS70', 'RS74', 'RS73'].some(rs => closedSignals.has(rs));

    // ================= RIGHT SIDE INDIVIDUAL =================
    const rs80_closed = closedSignals.has('RS80');
    const rs81_closed = closedSignals.has('RS81');
    const rs82_closed = closedSignals.has('RS82');
    const rs83_closed = closedSignals.has('RS83');
    const rs84_closed = closedSignals.has('RS84');
    const rs86_closed = closedSignals.has('RS86');
    const rs87_closed = closedSignals.has('RS87');

    const rs61 = rs61_closed;
    const rs62 = rs62_closed;
    const rs64 = rs64_closed;
    const rs65 = rs65_closed;
    const rs66 = rs66_closed;

    const rs70_74_73_lines = [
        'LG88', 'LG91', 'LG100',
        'LG99', 'LG119', 'LG118'
    ];

     canvas.getObjects().forEach(obj => {
        const anyObj = obj as any;
        if ((anyObj.customType === 'lineR' || anyObj.customType === 'lineG') && anyObj.customId) {
            let shouldBeRed = false;
            const lineId = anyObj.customId;

            // <=================== ======= RS8/RS9/RS10 LOGIC ======================================>
            if (rs11_closed && rs8_9_10_closed && ['LG7', 'LG8', 'LG11', 'LG12'].includes(lineId)) {
                shouldBeRed = true;
                if (rs1_closed && rs3_closed) {
                    if (['LG7', 'LG12', 'LG11', 'LG8'].includes(lineId)) shouldBeRed = true;
                }
                if (rs3_closed && rs4_closed && rs12_closed && rs1_closed) {
                    if (['LG7', 'LG12', 'LG11', 'LG8'].includes(lineId)) shouldBeRed = true;
                }
                if (!rs1_closed || !rs3_closed) {
                    if (['LG7', 'LG12', 'LG11', 'LG8'].includes(lineId)) shouldBeRed = false;

                    if (!rs3_closed && rs4_closed && rs12_closed) {
                        if (['LG7', 'LG12',].includes(lineId)) shouldBeRed = false;
                        if (['LG8', 'LG11',].includes(lineId)) shouldBeRed = true;
                    }
                    if (!rs1_closed && rs4_closed && rs12_closed) {
                        if (['LG8', 'LG11',].includes(lineId)) shouldBeRed = false;
                        if (['LG7', 'LG12',].includes(lineId)) shouldBeRed = true;
                    }
                    if (!rs1_closed && !rs3_closed && rs4_closed && rs12_closed) {
                        if (['LG8', 'LG11',].includes(lineId)) shouldBeRed = false;
                        if (['LG7', 'LG12',].includes(lineId)) shouldBeRed = false;
                    }
                    if (closedSignals.has('RS5')) {
                        if (['LG11'].includes(lineId)) shouldBeRed = true;
                    }
                    if (closedSignals.has('RS14')) {
                        if (['LG12'].includes(lineId)) shouldBeRed = true;
                    }
                }
            }

            //=============================RS6/RS16 Logic=============================
            if (closedSignals.has('RS16')) {
                if (rs3_closed && rs4_closed && rs12_closed) {
                    if (['LG7', 'LG12'].includes(lineId)) shouldBeRed = true;
                }
                if (!rs3_closed && rs4_closed && rs12_closed) {
                    if (['LG7', 'LG12'].includes(lineId)) shouldBeRed = false;

                    if (closedSignals.has('RS14')) {
                        if (['LG12'].includes(lineId)) shouldBeRed = true;
                    }
                }
            }

            if (closedSignals.has('RS6')) {
                if (closedSignals.has('RS6') && closedSignals.has('RS16') && rs1_closed && rs3_closed) {
                    if (['LG8', 'LG11', 'LG7', 'LG12'].includes(lineId)) shouldBeRed = true;
                }
                if (rs4_closed && rs12_closed && rs1_closed) {
                    if (['LG8', 'LG11'].includes(lineId)) shouldBeRed = true;
                }
                if (rs4_closed && rs12_closed && !rs1_closed) {
                    if (['LG8', 'LG11'].includes(lineId)) shouldBeRed = false;
                    if (closedSignals.has('RS5')) {
                        if (['LG11'].includes(lineId)) shouldBeRed = true;
                    }
                }
            }

            //<------------------------------RS11 LOGIC Left Side------------------------------>
            if (!rs11_closed) {
                if (rs1_closed && rs3_closed && rs8_9_10_closed && (!rs18_19_20_closed || !rs47_closed || !rs46_closed)) {
                    if (['LG7', 'LG8', 'LG11', 'LG12'].includes(lineId)) shouldBeRed = false;
                }
                if (rs1_closed && rs3_closed && rs8_9_10_closed && (rs18_19_20_closed && rs47_closed && rs46_closed)) {
                    if (['LG7', 'LG8', 'LG11', 'LG12'].includes(lineId)) shouldBeRed = true;
                }
                if (rs1_closed && rs4_closed && rs12_closed && closedSignals.has('RS5')) {
                    if (['LG8'].includes(lineId)) shouldBeRed = true;
                }
                if (rs3_closed && rs4_closed && rs12_closed && closedSignals.has('RS14')) {
                    if (['LG7'].includes(lineId)) shouldBeRed = true;
                }
                if (closedSignals.has('RS16')) {
                    if (rs3_closed && rs4_closed && rs12_closed) {
                        if (['LG7', 'LG12'].includes(lineId)) shouldBeRed = true;
                    }
                    if (!rs3_closed && rs4_closed && rs12_closed) {
                        if (['LG7', 'LG12'].includes(lineId)) shouldBeRed = false;

                        if (closedSignals.has('RS14')) {
                            if (['LG12'].includes(lineId)) shouldBeRed = true;
                        }
                    }
                }

                if (closedSignals.has('RS6')) {
                    if (closedSignals.has('RS6') && closedSignals.has('RS16') && rs1_closed && rs3_closed) {
                        if (['LG8', 'LG11', 'LG7', 'LG12'].includes(lineId)) shouldBeRed = true;
                    }
                    if (rs4_closed && rs12_closed && rs1_closed) {
                        if (['LG8', 'LG11'].includes(lineId)) shouldBeRed = true;
                    }
                    if (rs4_closed && rs12_closed && !rs1_closed) {
                        if (['LG8', 'LG11'].includes(lineId)) shouldBeRed = false;
                        if (closedSignals.has('RS5')) {
                            if (['LG11'].includes(lineId)) shouldBeRed = true;
                        }
                    }
                }
            }

            //=============================Right Side Lines RS18/19/20 Logic=============================
            if (rs11_closed && rs18_19_20_closed && rs18_19_20_lines.includes(lineId)) {
                shouldBeRed = true;
                if (!rs47_closed || !rs46_closed) {
                    if (rs18_19_20_lines.includes(lineId)) {
                        shouldBeRed = false;
                    }
                    if (!rs46_closed && rs26_closed && rs38_closed && rs45_closed) {
                        if (['LG24', 'LG38', 'LG45'].includes(lineId)) shouldBeRed = false;
                        if (['LG25', 'LG39', 'LG46'].includes(lineId)) shouldBeRed = false;
                    }
                    if (!rs47_closed && rs26_closed && rs38_closed && rs45_closed) {
                        if (['LG24', 'LG38', 'LG45'].includes(lineId)) shouldBeRed = false;
                        if (['LG25', 'LG39', 'LG46'].includes(lineId)) shouldBeRed = false;
                    }
                    if (!rs47_closed && !rs46_closed && rs26_closed && rs38_closed && rs45_closed) {
                        if (['LG24', 'LG38', 'LG45'].includes(lineId)) shouldBeRed = false;
                        if (['LG25', 'LG39', 'LG46'].includes(lineId)) shouldBeRed = false;
                    }
                    if ((!rs47_closed || !rs46_closed) && closedSignals.has('RS27') && closedSignals.has('RS25')) {
                        if (['LG25', 'LG24'].includes(lineId)) shouldBeRed = true;
                    }
                    if ((!rs47_closed || !rs46_closed) && closedSignals.has('RS27') && rs26_closed && closedSignals.has('RS37')) {
                        if (['LG25', 'LG24', 'LG38'].includes(lineId)) shouldBeRed = true;
                    }
                    if ((!rs47_closed || !rs46_closed) && closedSignals.has('RS25') && rs26_closed && closedSignals.has('RS39')) {
                        if (['LG25', 'LG24', 'LG39'].includes(lineId)) shouldBeRed = true;
                    }
                    if ((!rs47_closed || !rs46_closed) && rs39_closed && rs37_closed) {
                        if (['LG24', 'LG38'].includes(lineId)) shouldBeRed = true;
                        if (['LG25', 'LG39',].includes(lineId)) shouldBeRed = true;
                    }
                    if (rs26_closed && rs37_closed && closedSignals.has('RS25')) {
                        if (['LG38'].includes(lineId)) shouldBeRed = true;
                    }
                    if (rs26_closed && rs39_closed && closedSignals.has('RS27')) {
                        if (['LG39'].includes(lineId)) shouldBeRed = true;
                    }
                    if (rs47_closed && rs46_closed) {
                        if (rs18_19_20_lines.includes(lineId)) {
                            shouldBeRed = true;
                        }
                    }
                    if (rs47_closed && !rs46_closed && rs38_closed && rs45_closed && rs37_closed) {
                        if (rs18_19_20_lines.includes(lineId)) {
                            shouldBeRed = true;
                            if (['LG45'].includes(lineId)) shouldBeRed = false;
                        }
                    }
                    if (rs47_closed && !rs46_closed && rs38_closed && rs45_closed && closedSignals.has('RS26') && closedSignals.has('RS25')) {
                        if (rs18_19_20_lines.includes(lineId)) {
                            shouldBeRed = true;
                            if (['LG45', 'LG38'].includes(lineId)) shouldBeRed = false;
                        }
                    }
                }
            }

            //=============================RS15/RS17 Logic=============================
            if (rs15_closed) {
                if (rs38_closed && rs26_closed && rs45_closed && rs46_closed) {
                    if (['LG24', 'LG38', 'LG45'].includes(lineId)) shouldBeRed = true;
                }
                if (!rs46_closed && rs26_closed && rs38_closed && rs45_closed) {
                    if (['LG24', 'LG38', 'LG45'].includes(lineId)) shouldBeRed = false;
                    if (!rs46_closed && rs26_closed && rs38_closed && rs45_closed && rs37_closed) {
                        if (['LG24', 'LG38'].includes(lineId)) shouldBeRed = true;
                    }
                }
                if (!rs46_closed && rs26_closed && rs38_closed && rs45_closed && rs15_closed && closedSignals.has('RS25')) {
                    if (['LG24'].includes(lineId)) shouldBeRed = true;
                }
            }

            if (closedSignals.has('RS17')) {
                if (rs26_closed && rs38_closed && rs45_closed) {
                    if (['LG25', 'LG39', 'LG46'].includes(lineId)) shouldBeRed = true;
                }
                if (!rs47_closed && rs26_closed && rs38_closed && rs45_closed) {
                    if (['LG25', 'LG39', 'LG46'].includes(lineId)) shouldBeRed = false;
                }
                if (!rs47_closed && rs26_closed && rs38_closed && rs45_closed && rs39_closed) {
                    if (['LG25', 'LG39'].includes(lineId)) shouldBeRed = true;
                }
                if (!rs47_closed && rs26_closed && rs38_closed && rs45_closed && closedSignals.has('RS27')) {
                    if (['LG25'].includes(lineId)) shouldBeRed = true;
                }
            }

            //=============================RS11 Logic Right Side=============================

            if (!rs11_closed && rs18_19_20_closed && rs46_closed && rs47_closed && (!rs8_9_10_closed || (!rs1_closed || !rs3_closed))) {
                if (['LG24', 'LG25', 'LG38', 'LG39', 'LG45', 'LG46'].includes(lineId)) shouldBeRed = false;
                if (rs26_closed && rs39_closed && closedSignals.has('RS27')) {
                    if (['LG39'].includes(lineId)) shouldBeRed = true;
                }
                if (rs26_closed && rs38_closed && rs45_closed && rs15_closed) {
                    if (['LG24', 'LG38', 'LG45'].includes(lineId)) shouldBeRed = true;
                }
                if (rs26_closed && rs38_closed && rs45_closed && closedSignals.has('RS17')) {
                    if (['LG25', 'LG39', 'LG46'].includes(lineId)) shouldBeRed = true;
                }
                if (rs26_closed && rs38_closed && rs45_closed && closedSignals.has('RS25')) {
                    if (['LG38', 'LG45'].includes(lineId)) shouldBeRed = true;
                }
                if (rs26_closed && rs38_closed && rs45_closed && closedSignals.has('RS27')) {
                    if (['LG39', 'LG46'].includes(lineId)) shouldBeRed = true;
                }
            }
            if (rs26_closed && rs37_closed && closedSignals.has('RS25')) {
                if (['LG38'].includes(lineId)) shouldBeRed = true;
            }
            if (rs26_closed && rs39_closed && closedSignals.has('RS27')) {
                if (['LG39'].includes(lineId)) shouldBeRed = true;
            }
            if (rs38_closed && rs45_closed && rs47_closed && closedSignals.has('RS27') && closedSignals.has('RS26')) {
                if (['LG46', 'LG39'].includes(lineId)) shouldBeRed = true;
            }
            if (rs38_closed && rs45_closed && rs46_closed && closedSignals.has('RS25') && closedSignals.has('RS26')) {
                if (['LG45', 'LG38'].includes(lineId)) shouldBeRed = true;
            }
            if (closedSignals.has('RS25') && rs26_closed && closedSignals.has('RS27') && rs38_closed && rs37_closed && rs39_closed) {
                if (['LG38', 'LG39'].includes(lineId)) shouldBeRed = true;
            }
            if (!rs11_closed && rs18_19_20_closed && rs46_closed && rs47_closed && rs8_9_10_closed && rs1_closed && rs3_closed) {
                if (['LG24', 'LG25', 'LG38', 'LG39', 'LG45', 'LG46'].includes(lineId)) shouldBeRed = true;
            }
           

 //===================== NEW SEPARATOR PRIORITY LOGIC =====================
    if (
        rs18_19_20_closed && rs26_closed && rs38_closed && rs45_closed){ 
        // ---------------- RS46 OPEN ----------------
        if (!rs46_closed && rs47_closed) {
            // Left separator path should remain GREEN
            if (['LG24', 'LG38', 'LG45'].includes(lineId)) {
                shouldBeRed = false;
            }
        // Right side must become RED
        if (['LG25', 'LG39', 'LG46'].includes(lineId)) {
            shouldBeRed = true;
        }
        if (closedSignals.has('RS25')) {
        if (['LG24'].includes(lineId)) {
            shouldBeRed = true;
        }
    }
    }
    // ---------------- RS47 OPEN ----------------
    if (!rs47_closed && rs46_closed) {
        // Right separator path should remain GREEN
        if (['LG25', 'LG39', 'LG46'].includes(lineId)) {
            shouldBeRed = false;
        }
        // Left side must become RED
        if (['LG24', 'LG38', 'LG45'].includes(lineId)) {
            shouldBeRed = true;
        }
        if (closedSignals.has('RS27')) {
        if (['LG25'].includes(lineId)) {
            shouldBeRed = true;
        }
    }
    }
}
    

            //================================================================Compulsury logic ==============================================================
            if (rs8_9_10_closed && !rs11_closed && rs18_19_20_closed) {
                if (closedSignals.has('RS14') && closedSignals.has('RS5') && closedSignals.has('RS25') && closedSignals.has('RS27')) {
                    if (['LG24', 'LG25', 'LG11', 'LG12'].includes(lineId)) shouldBeRed = true;
                }
                if (closedSignals.has('RS14') && closedSignals.has('RS5') && rs39_closed && rs37_closed) {
                    if (['LG24', 'LG25', 'LG38', 'LG39', 'LG11', 'LG12'].includes(lineId)) shouldBeRed = true;
                }
                if (closedSignals.has('RS14') && closedSignals.has('RS5') && rs46_closed && rs47_closed) {
                    if (['LG24', 'LG25', 'LG38', 'LG39', 'LG11', 'LG12', 'LG45', 'LG46'].includes(lineId)) shouldBeRed = true;
                }
                if (rs3_closed && rs1_closed && rs37_closed && rs39_closed) {
                    if (['LG24', 'LG25', 'LG38', 'LG39', 'LG7', 'LG8', 'LG11', 'LG12'].includes(lineId)) shouldBeRed = true;
                }
                if (rs3_closed && rs1_closed && closedSignals.has('RS27') && closedSignals.has('RS25')) {
                    if (['LG24', 'LG25', 'LG7', 'LG8', 'LG11', 'LG12'].includes(lineId)) shouldBeRed = true;
                }
                if (rs3_closed && rs1_closed && rs46_closed && rs39_closed && rs38_closed && rs45_closed) {
                    if (['LG24', 'LG25', 'LG38', 'LG39', 'LG7', 'LG8', 'LG11', 'LG12', 'LG45'].includes(lineId)) shouldBeRed = true;
                }
                if (closedSignals.has('RS5') && closedSignals.has('RS14') && rs46_closed && rs39_closed && rs38_closed && rs45_closed) {
                    if (['LG24', 'LG25', 'LG38', 'LG39', 'LG11', 'LG12', 'LG45'].includes(lineId)) shouldBeRed = true;
                }
                if (closedSignals.has('RS5') && closedSignals.has('RS14') && rs47_closed && rs37_closed && rs38_closed && rs45_closed) {
                    if (['LG24', 'LG25', 'LG38', 'LG39', 'LG11', 'LG12', 'LG46'].includes(lineId)) shouldBeRed = true;
                }
                if (closedSignals.has('RS27') && rs46_closed && rs38_closed && rs45_closed && rs26_closed && closedSignals.has('RS26') && rs1_closed && rs3_closed) {
                    if (['LG24', 'LG25', 'LG38', 'LG7', 'LG8', 'LG11', 'LG12', 'LG45'].includes(lineId)) shouldBeRed = true;
                }
                if (closedSignals.has('RS27') && rs46_closed && rs38_closed && rs45_closed && rs26_closed && closedSignals.has('RS26') && closedSignals.has('RS5') && closedSignals.has('RS14')) {
                    if (['LG24', 'LG25', 'LG38', 'LG11', 'LG12', 'LG45'].includes(lineId)) shouldBeRed = true;
                }
                if (rs3_closed && rs1_closed && rs26_closed && closedSignals.has('RS25') && rs47_closed && rs38_closed && rs45_closed) {
                    if (['LG24', 'LG25', 'LG39', 'LG7', 'LG8', 'LG11', 'LG12', 'LG46'].includes(lineId)) shouldBeRed = true;
                }
                if (closedSignals.has('RS5') && closedSignals.has('RS14') && rs26_closed && closedSignals.has('RS25') && rs47_closed && rs38_closed && rs45_closed) {
                    if (['LG24', 'LG25', 'LG39', 'LG11', 'LG12', 'LG46'].includes(lineId)) shouldBeRed = true;
                }
                if (rs3_closed && rs1_closed && rs37_closed && rs47_closed && rs38_closed && rs45_closed) {
                    if (['LG24', 'LG25', 'LG39', 'LG38', 'LG7', 'LG8', 'LG11', 'LG12', 'LG46'].includes(lineId)) shouldBeRed = true;
                }
                if ((!rs46_closed || !rs47_closed) && rs1_closed && rs3_closed && !rs45_closed && rs38_closed && rs37_closed && rs26_closed && closedSignals.has('RS27')) {
                    if (['LG24', 'LG25', 'LG38', 'LG7', 'LG8', 'LG11', 'LG12'].includes(lineId)) shouldBeRed = true;
                }
                if ((!rs46_closed || !rs47_closed) && closedSignals.has('RS5') && closedSignals.has('RS14') && rs3_closed && !rs45_closed && rs38_closed && rs37_closed && rs26_closed && closedSignals.has('RS27')) {
                    if (['LG24', 'LG25', 'LG38', 'LG11', 'LG12'].includes(lineId)) shouldBeRed = true;
                }
                if ((!rs46_closed || !rs47_closed) && rs1_closed && rs3_closed && !rs45_closed && rs38_closed && rs26_closed && rs26_closed && closedSignals.has('RS25')) {
                    if (['LG24', 'LG25', 'LG39', 'LG7', 'LG8', 'LG11', 'LG12'].includes(lineId)) shouldBeRed = true;
                }
                if ((!rs46_closed || !rs47_closed) && closedSignals.has('RS5') && closedSignals.has('RS14') && !rs45_closed && rs38_closed && rs39_closed && rs26_closed && closedSignals.has('RS25')) {
                    if (['LG24', 'LG25', 'LG39', 'LG11', 'LG12'].includes(lineId)) shouldBeRed = true;
                }
            }

            if (rs15_closed && closedSignals.has('RS27') && rs46_closed && rs47_closed) {
                if (rs18_19_20_lines.includes(lineId)) {
                    shouldBeRed = true;
                }
                if (['LG25'].includes(lineId)) shouldBeRed = false;
            }

            if (closedSignals.has('RS25') && closedSignals.has('RS17') && rs46_closed && rs47_closed) {
                if (rs18_19_20_lines.includes(lineId)) {
                    shouldBeRed = true;
                }
                if (['LG24'].includes(lineId)) shouldBeRed = false;
            }

            if (rs15_closed && rs39_closed && rs26_closed && rs46_closed && rs47_closed) {
                if (rs18_19_20_lines.includes(lineId)) {
                    shouldBeRed = true;
                }
                if (['LG25', 'LG39'].includes(lineId)) shouldBeRed = false;
            }

            if (rs1_closed && rs4_closed && rs12_closed && closedSignals.has('RS5')) {
                if (['LG8'].includes(lineId)) shouldBeRed = true;
            }

            if (rs3_closed && rs4_closed && rs12_closed && closedSignals.has('RS14')) {
                if (['LG7'].includes(lineId)) shouldBeRed = true;
            }

            if (closedSignals.has('RS13')) {
                if (['LG13','LG16'].includes(lineId)) shouldBeRed = true;
            }

            if (closedSignals.has('RS14') && closedSignals.has('RS16')) {
                if (['LG12'].includes(lineId)) shouldBeRed = true;
            }

            if (closedSignals.has('RS6') && closedSignals.has('RS5')) {
                if (['LG11'].includes(lineId)) shouldBeRed = true;
            }

            if (rs46_closed && rs38_closed && rs45_closed && rs37_closed) {
                if (['LG45'].includes(lineId)) shouldBeRed = true;
            }

            if (rs47_closed && rs38_closed && rs45_closed && rs39_closed) {
                if (['LG46'].includes(lineId)) shouldBeRed = true;
            }

            if (closedSignals.has('RS25') && rs15_closed) {
                if (['LG24'].includes(lineId)) shouldBeRed = true;
            }

            if (closedSignals.has('RS27') && closedSignals.has('RS17')) {
                if (['LG25'].includes(lineId)) shouldBeRed = true;
            }
             if (closedSignals.has('RS28')) {
                if (['LG35','LG36'].includes(lineId)) shouldBeRed = true;
            }

            if (rs15_closed && closedSignals.has('RS17') && rs46_closed && rs47_closed) {
                if (rs18_19_20_lines.includes(lineId)) {
                    shouldBeRed = true;
                }
            }

            if (rs47_closed && rs46_closed && closedSignals.has('RS27') && closedSignals.has('RS25')) {
                if (['LG45', 'LG38'].includes(lineId)) shouldBeRed = true;
                if (['LG46', 'LG39',].includes(lineId)) shouldBeRed = true;
            }

            if (rs15_closed && rs39_closed && rs37_closed && closedSignals.has('RS17')) {
                if (['LG25', 'LG24'].includes(lineId)) shouldBeRed = true;
                if (['LG38', 'LG39',].includes(lineId)) shouldBeRed = true;
            }

            if (closedSignals.has('RS25') && closedSignals.has('RS27') && rs37_closed && rs39_closed) {
                if (['LG39', 'LG38'].includes(lineId)) shouldBeRed = true;
            }

            if (rs37_closed && rs39_closed && rs46_closed && rs47_closed) {
                if (['LG45', 'LG46'].includes(lineId)) shouldBeRed = true;
            }

            if (!rs47_closed && rs38_closed && rs39_closed && rs45_closed && rs46_closed && ((rs18_19_20_closed && rs11_closed) || rs15_closed && closedSignals.has('RS17'))) {
                if (rs18_19_20_lines.includes(lineId)) {
                    shouldBeRed = true;
                }
                if (['LG46'].includes(lineId)) shouldBeRed = false;
            }

            if (rs47_closed && rs38_closed && rs37_closed && rs45_closed && !rs46_closed && ((rs18_19_20_closed && rs11_closed) || rs15_closed && closedSignals.has('RS17'))) {
                if (rs18_19_20_lines.includes(lineId)) {
                    shouldBeRed = true;
                }
                if (['LG45'].includes(lineId)) shouldBeRed = false;
            }

            if (rs1_closed && rs3_closed && closedSignals.has('RS5') && closedSignals.has('RS14')) {
                if (['LG7', 'LG8'].includes(lineId)) shouldBeRed = true;
            }

            if (rs46_closed && rs47_closed && rs37_closed && rs26_closed && closedSignals.has('RS27')) {
                if (['LG45', 'LG46', 'LG39'].includes(lineId)) shouldBeRed = true;
            }

            if (rs46_closed && rs47_closed && rs39_closed && rs26_closed && closedSignals.has('RS25')) {
                if (['LG45', 'LG46', 'LG38'].includes(lineId)) shouldBeRed = true;
            }




        // Down Circuit Logic Starts From Here
            // ================================================================
            // left side
            if (closedSignals.has('RS64') && closedSignals.has('RS66') &&
                ['LG72', 'LG75', 'LG73', 'LG74', 'LG76', 'LG77'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS61') && closedSignals.has('RS62') &&
                ['LG72', 'LG75', 'LG73', 'LG74'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS59') && closedSignals.has('RS60') &&
                ['LG72', 'LG73'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS62') && closedSignals.has('RS63') && closedSignals.has('RS58') && closedSignals.has('RS57') &&
                ['LG72', 'LG75'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS61') && closedSignals.has('RS63') && closedSignals.has('RS58') && closedSignals.has('RS57') &&
                ['LG73', 'LG74'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS60') && closedSignals.has('RS57') &&
                ['LG72'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS64') && closedSignals.has('RS63') && closedSignals.has('RS58') && closedSignals.has('RS57') &&
                ['LG73', 'LG74', 'LG76'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS64') && closedSignals.has('RS63') && closedSignals.has('RS58') && closedSignals.has('RS59') &&
                ['LG74', 'LG76'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS64') && closedSignals.has('RS63') && closedSignals.has('RS58') && closedSignals.has('RS61') &&
                ['LG76'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS66') && closedSignals.has('RS63') && closedSignals.has('RS58') && closedSignals.has('RS57') &&
                ['LG72', 'LG75', 'LG77'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS66') && closedSignals.has('RS63') && closedSignals.has('RS58') && closedSignals.has('RS60') &&
                ['LG75', 'LG77'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS66') && closedSignals.has('RS63') && closedSignals.has('RS58') && closedSignals.has('RS62') &&
                ['LG77'].includes(lineId)) {
                shouldBeRed = true;
            }
            if ((closedSignals.has('RS69') || closedSignals.has('RS71') || closedSignals.has('RS72')) &&
                ['LG72', 'LG73', 'LG74', 'LG75', 'LG76', 'LG77'].includes(lineId)) {
                shouldBeRed = true;
            }
            if ((closedSignals.has('RS66') && closedSignals.has('RS61') && closedSignals.has('RS58')) &&
                closedSignals.has('RS63') &&
                ['LG72', 'LG73', 'LG74', 'LG75', 'LG77'].includes(lineId)) {
                shouldBeRed = true;
            }
            if ((closedSignals.has('RS64') && closedSignals.has('RS61')) &&
                ['LG76'].includes(lineId)) {
                shouldBeRed = true;
            }
            if ((closedSignals.has('RS66') && closedSignals.has('RS62')) &&
                ['LG77'].includes(lineId)) {
                shouldBeRed = true;
            }
             if (closedSignals.has('RS62') && closedSignals.has('RS63') && closedSignals.has('RS58') && closedSignals.has('RS60') &&
                ['LG75'].includes(lineId)) {
                shouldBeRed = true;
            }
             if (closedSignals.has('RS61') && closedSignals.has('RS63') && closedSignals.has('RS58') && closedSignals.has('RS59') &&
                ['LG74'].includes(lineId)) {
                shouldBeRed = true;
            }
            
            // right side
            
            if (closedSignals.has('RS65') && closedSignals.has('RS80') && 
                ['LG91'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS67') && closedSignals.has('RS81') &&
                ['LG88'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS81') && closedSignals.has('RS82') && closedSignals.has('RS84') && closedSignals.has('RS086') &&
                ['LG100'].includes(lineId)) {
                shouldBeRed = true;
            }
             if (closedSignals.has('RS80') && closedSignals.has('RS82') && closedSignals.has('RS84') && closedSignals.has('RS087') &&
                ['LG99'].includes(lineId)) {
                shouldBeRed = true;
            }


            if (closedSignals.has('RS65') && closedSignals.has('RS67') &&
                ['LG88', 'LG100', 'LG108', 'LG119', 'LG127', 'LG129', 'LG91', 'LG99', 'LG107', 'LG118', 'LG142', 'LG131', 'LG0129', 'LG0131'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS67') && closedSignals.has('RS82') && closedSignals.has('RS84')
                && closedSignals.has('RS83') && closedSignals.has('RS88') && closedSignals.has('RS90') &&
                ['LG88', 'LG100', 'LG108'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS67') && closedSignals.has('RS83') && closedSignals.has('RS88') &&
                closedSignals.has('RS82') && closedSignals.has('RS84') && closedSignals.has('RS101') &&
                ['LG88', 'LG100', 'LG108', 'LG119'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS67') && closedSignals.has('RS82') && closedSignals.has('RS84')
                && closedSignals.has('RS83') && closedSignals.has('RS086') &&
                ['LG88', 'LG100'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS67') && closedSignals.has('RS82') &&
                closedSignals.has('RS84') && closedSignals.has('RS086') &&
                ['LG88', 'LG100'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS67') && closedSignals.has('RS82') && closedSignals.has('RS84')
                && closedSignals.has('RS83') && closedSignals.has('RS81') &&
                ['LG88'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS65') && closedSignals.has('RS82') && closedSignals.has('RS84') &&
                closedSignals.has('RS83') && closedSignals.has('RS88') &&  closedSignals.has('RS91') &&
                ['LG91', 'LG99', 'LG107'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS65') && closedSignals.has('RS82') && closedSignals.has('RS84') && closedSignals.has('RS83')
                && closedSignals.has('RS88') && closedSignals.has('RS100') &&
                ['LG91', 'LG99', 'LG107', 'LG118'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS65') && closedSignals.has('RS82') && closedSignals.has('RS84') && closedSignals.has('RS83')
                && closedSignals.has('RS087') &&
                ['LG91', 'LG99'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS65') && closedSignals.has('RS82') &&
                closedSignals.has('RS84') && closedSignals.has('RS087') &&
                ['LG91', 'LG99'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS65') && closedSignals.has('RS82') && closedSignals.has('RS84') && closedSignals.has('RS83')
                && closedSignals.has('RS80') &&
                ['LG91'].includes(lineId)) {
                shouldBeRed = true;
            }
            if ((closedSignals.has('RS70') || closedSignals.has('RS73') || closedSignals.has('RS074')) &&
                ['LG88', 'LG91', 'LG100', 'LG99', 'LG108', 'LG107', 'LG119', 'LG118', 'LG127', 'LG129', 'LG131',
                    'LG0129', 'LG0131', 'LG142', 'LG147'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS81') && closedSignals.has('RS80') &&
                ['LG100', 'LG108', 'LG119', 'LG127', 'LG129', 'LG99', 'LG107', 'LG118', 'LG142', 'LG131' ].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS81') && closedSignals.has('RS82') && closedSignals.has('RS83') &&
                closedSignals.has('RS84') && closedSignals.has('RS88') &&
                ['LG100', 'LG108', 'LG119', 'LG127', 'LG129'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS80') && closedSignals.has('RS82') && closedSignals.has('RS83') &&
                closedSignals.has('RS84') && closedSignals.has('RS88') &&
                ['LG99', 'LG107', 'LG118', 'LG142', 'LG131'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS086') && closedSignals.has('RS087') &&
                ['LG108', 'LG119', 'LG127', 'LG129', 'LG107', 'LG118', 'LG142', 'LG131'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS086') && closedSignals.has('RS83') && closedSignals.has('RS88') && closedSignals.has('RS90')  &&
                ['LG108'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS087') && closedSignals.has('RS83') && closedSignals.has('RS91') && closedSignals.has('RS88') &&  
                ['LG107'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS85') &&
                ['LG109'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS90') && closedSignals.has('RS91') &&
                ['LG119', 'LG127', 'LG129', 'LG118', 'LG142', 'LG131' ].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS91') && closedSignals.has('RS100') &&
                ['LG118'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS90') && closedSignals.has('RS101') &&
                ['LG119'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS99') && closedSignals.has('RS97') &&
                ['LG131'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS98') && closedSignals.has('RS97') &&
                ['LG129'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS98') && closedSignals.has('RS99') &&
                ['LG129','LG131'].includes(lineId)) {
                shouldBeRed = true;
            }

            if (closedSignals.has('RS95') &&
                ['LG127'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS96') &&
                ['LG142'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS94') &&
                ['LG138'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS101') && closedSignals.has('RS100') &&
                ['LG127', 'LG142', 'LG129', 'LG131','LG138', 'LG147'].includes(lineId)) {
                shouldBeRed = true;
            }
            if (closedSignals.has('RS102') &&
                ['LG147'].includes(lineId)) {
                shouldBeRed = true;
            }
            // if (closedSignals.has('RS104') && closedSignals.has('RS105') &&
            //     ['LG0129', 'LG0131'].includes(lineId)) {
            //     shouldBeRed = true;
            // }

            
            // BC660 (RS68) LOGIC — SABSE LAST MEIN
            
            // STEP 1: RS69/71/72 GREEN + BC660 RED → Left side charged
            if ((closedSignals.has('RS69') || closedSignals.has('RS71') || closedSignals.has('RS72')) &&
                !closedSignals.has('RS68') &&
                ['LG72', 'LG73', 'LG74', 'LG75', 'LG76', 'LG77'].includes(lineId)) {
                shouldBeRed = false;
            }

            // STEP 2: RS70/074/73 GREEN + BC660 RED → Right side charged
            if ((closedSignals.has('RS70') || closedSignals.has('RS074') || closedSignals.has('RS73')) &&
                !closedSignals.has('RS68') &&
                ['LG88', 'LG91', 'LG100', 'LG99', 'LG108', 'LG107',
                    'LG119', 'LG118', 'LG127', 'LG129', 'LG131',
                    'LG142', 'LG147'].includes(lineId)) {
                shouldBeRed = false;
            }

            // STEP 3: Left+Right dono GREEN + BC660 RED → SAARI lines dead
            if ((closedSignals.has('RS69') || closedSignals.has('RS71') || closedSignals.has('RS72')) &&
                (closedSignals.has('RS70') || closedSignals.has('RS73') || closedSignals.has('RS074')) &&
                !closedSignals.has('RS68') &&
                ['LG72', 'LG73', 'LG74', 'LG75', 'LG76', 'LG77',
                    'LG88', 'LG91', 'LG100', 'LG99', 'LG108', 'LG107',
                    'LG119', 'LG118', 'LG127', 'LG129', 'LG131',
                     'LG142', 'LG147'].includes(lineId)) {
                shouldBeRed = true;
            }

            // STEP 4: RS64+RS66(BM1115+BM1116) GREEN + BC660 RED → Left side dead
            // RS69/71/72 ke baad bhi override karega
            if (closedSignals.has('RS64') && closedSignals.has('RS66') &&
                !closedSignals.has('RS68') &&
                ['LG72', 'LG73', 'LG74', 'LG75', 'LG76', 'LG77'].includes(lineId)) {
                shouldBeRed = true;
            }

            // STEP 5: RS65+RS67(BM1118+BM1117) GREEN + BC660 RED → Right side dead
            // RS70/73/74 ke baad bhi override karega
            if (closedSignals.has('RS65') && closedSignals.has('RS67') &&
                !closedSignals.has('RS68') &&
                ['LG88', 'LG91', 'LG100', 'LG99', 'LG108', 'LG107',
                    'LG119', 'LG118', 'LG127', 'LG129', 'LG131',
                     'LG142', 'LG147'].includes(lineId)) {
                shouldBeRed = true;
            }

            
            // RS64+RS66+RS65+RS67 sab GREEN + BC660 RED → SAARI lines dead
            if (closedSignals.has('RS64') && closedSignals.has('RS66') &&
                closedSignals.has('RS65') && closedSignals.has('RS67') &&
                !closedSignals.has('RS68') &&
                ['LG72', 'LG73', 'LG74', 'LG75', 'LG76', 'LG77',
                    'LG88', 'LG91', 'LG100', 'LG99', 'LG108', 'LG107',
                    'LG119', 'LG118', 'LG127', 'LG129', 'LG131',
                     'LG142', 'LG147'].includes(lineId)) {
                shouldBeRed = true;
            }

                        
            
            // LEFT SIDE — RS69/71/72 GREEN + BC660 RED
            // STEP 7: BM1113(RS62) + BM1114(RS61) GREEN → LG72,73,74,75 dead
            if ((closedSignals.has('RS69') || closedSignals.has('RS71') || closedSignals.has('RS72')) &&
                !closedSignals.has('RS68') &&
                closedSignals.has('RS62') && closedSignals.has('RS61') &&
                ['LG72', 'LG73', 'LG74', 'LG75'].includes(lineId)) {
                shouldBeRed = true;
            }

            // STEP 8: BM1108(RS60) + BM1110(RS59) GREEN → LG72, LG73 dead
            if ((closedSignals.has('RS69') || closedSignals.has('RS71') || closedSignals.has('RS72')) &&
                !closedSignals.has('RS68') &&
                closedSignals.has('RS60') && closedSignals.has('RS59') &&
                ['LG72', 'LG73'].includes(lineId)) {
                shouldBeRed = true;
            }

            // RIGHT SIDE — RS70/73/074 GREEN + BC660 RED
                    // STEP 9: BM1119(RS81) + BM1121(RS80) GREEN → right lines dead
            if ((closedSignals.has('RS70') || closedSignals.has('RS73') || closedSignals.has('RS074')) &&
                !closedSignals.has('RS68') &&
                closedSignals.has('RS81') && closedSignals.has('RS80') &&
                ['LG100', 'LG108', 'LG119', 'LG127', 'LG129',
                'LG131',  'LG99', 'LG107',
                'LG118', 'LG147'].includes(lineId)) {
                shouldBeRed = true;
            }

            // STEP 10: BM1123(RS086) + BM1125(RS087) GREEN → right lines dead
            if ((closedSignals.has('RS70') || closedSignals.has('RS73') || closedSignals.has('RS074')) &&
                !closedSignals.has('RS68') &&
                closedSignals.has('RS086') && closedSignals.has('RS087') &&
                [ 'LG108', 'LG119', 'LG127', 'LG129',
                'LG131', 'LG107',
                'LG118', 'LG147'].includes(lineId)) {
                shouldBeRed = true;
            }

            // STEP 11: BM1127(RS83) + BM1128(RS84) GREEN → right lines dead
            if ((closedSignals.has('RS70') || closedSignals.has('RS73') || closedSignals.has('RS074')) &&
                !closedSignals.has('RS68') &&
                closedSignals.has('RS90') && closedSignals.has('RS91') &&
                [ 'LG119', 'LG127', 'LG129',
                'LG131', 'LG142',
                'LG118', 'LG147'].includes(lineId)) {
                shouldBeRed = true;
            }
             if (closedSignals.has('RS80') && closedSignals.has('RS82') &&
                closedSignals.has('RS086') && closedSignals.has('RS84') &&
                closedSignals.has('RS83') &&
                
                   ['LG99', 'LG108', 'LG107',
                    'LG119', 'LG118', 'LG127', 'LG129', 'LG131',
                     'LG142', 'LG147'].includes(lineId)) {
                shouldBeRed = true;
            }
            if ( closedSignals.has('RS086') &&
                 closedSignals.has('RS83') &&
                closedSignals.has('RS88') && closedSignals.has('RS101') &&
                   ['LG108','LG119'].includes(lineId)) {   
                    shouldBeRed = true;
            }
            if ( closedSignals.has('RS087') &&
                 closedSignals.has('RS83') &&
                closedSignals.has('RS88') && closedSignals.has('RS100') &&
                   ['LG107','LG118'].includes(lineId)) {   
                    shouldBeRed = true;
            }

            if (closedSignals.has('RS67') && closedSignals.has('RS82') &&
                closedSignals.has('RS83') && closedSignals.has('RS84') &&
                closedSignals.has('RS88') && closedSignals.has('RS91') &&
                
                   ['LG88', 'LG108','LG119', 'LG118', 'LG127', 'LG129', 'LG131',
                     'LG142', 'LG147'].includes(lineId))
                    {
                shouldBeRed = true;
            }

            if (closedSignals.has('RS65') && closedSignals.has('RS82') &&
                closedSignals.has('RS83') && closedSignals.has('RS84') &&
                closedSignals.has('RS88') && closedSignals.has('RS90') &&
                 
                   ['LG91','LG119','LG118', 'LG127', 'LG129', 'LG131',
                     'LG142', 'LG147'].includes(lineId))
                    {
                shouldBeRed = true;
            }
       
            anyObj.set('stroke', shouldBeRed ? 'red' : (anyObj.originalStroke || 'green'));
        }
    });

    canvas.renderAll();
}

const Circuit5_RULES: LineRule[] =
    [

      //left side logic started-------------------------------
        {
            when: '((RS1 | RS4 | RS6 | RS8 ) & (RS2 | RS3 | RS5 | RS7) &  RS9 )',
            lines: ['LG1'],
            stroke: 'red',
            priority: 1
        },
      

        {
            when: '(((RS22 & RS82) | (RS18 & RS82)| (RS20 & RS82)) | (RS18 | RS22 | RS20) & RS19) & !(((RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS0041 & ((!RS00046 & !RS044) | (!RS00049 & !RS47))) | ((RS18 | RS20 | RS22 | (RS24 & RS25)) & !(RS58 | RS114 | RS115 | (RS55 & RS53)) & !RS0041 & !RS40))',
            lines: ['LG5', 'LG4', 'LG2', 'LG1', 'LG9', 'LG8', 'LG3','LG018','LG019','LG021','LG022'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS0041 & !RS40 & RS013',
            lines: ['LG5', 'LG4', 'LG2', 'LG1', 'LG9', 'LG8', 'LG3'],
            stroke: 'red',
            priority: 1
        },

        {
            when: '(((RS22 & RS82) | (RS18 & RS82)| (RS20 & RS82)) | (RS18 | RS22 | RS20) & RS19 & (RS58 | RS115 | RS114)) & !(((RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS0041 & ((!RS00046 & !RS044) | (!RS00049 & !RS47))) | ((RS18 | RS20 | RS22 | (RS24 & RS25)) & !(RS58 | RS114 | RS115 | (RS55 & RS53)) & !RS0041 & !RS40))',
            lines: ['LG5', 'LG4', 'LG2', 'LG1', 'LG9', 'LG8', 'LG3','LG018','LG019','LG021','LG022'],
            stroke: 'red',
            priority: 1
        },

       
        {
            when: '(((RS22 & RS82) | (RS18 & RS82)| (RS20 & RS82)) | (RS18 | RS22 | RS20) & RS19 & (RS58 | RS115 | RS114)) & !(((RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS0041 & ((!RS00046 & !RS044) | (!RS00049 & !RS47))) | ((RS18 | RS20 | RS22 | (RS24 & RS25)) & !(RS58 | RS114 | RS115 | (RS55 & RS53)) & !RS0041))',
            lines: ['LG18'],
            stroke: 'red',
            priority: 1
        },

        // LG18 nahi, RS40 check hai
        {
            when: '(((RS22 & RS82) | (RS18 & RS82)| (RS20 & RS82) | (RS24 & RS25) | (RS16 & RS25)) | (RS18 | RS22 | RS20) & RS19) & !(((RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS0041 & ((!RS00046 & !RS044) | (!RS00049 & !RS47))) | ((RS18 | RS20 | RS22 | (RS24 & RS25)) & !(RS58 | RS114 | RS115 | (RS55 & RS53)) & !RS0041 & !RS40))',
            lines: ['LG5', 'LG4', 'LG2', 'LG1', 'LG3','LG018','LG019','LG021','LG022'],
            stroke: 'red',
            priority: 1
        },

            // LG18 ke liye RS40 ka koi effect nahi
            {
                when: '(((RS22 & RS82) | (RS18 & RS82)| (RS20 & RS82) | (RS24 & RS25) | (RS16 & RS25)) | (RS18 | RS22 | RS20) & RS19) & !(((RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS0041 & ((!RS00046 & !RS044) | (!RS00049 & !RS47))) | ((RS18 | RS20 | RS22 | (RS24 & RS25)) & !(RS58 | RS114 | RS115 | (RS55 & RS53)) & !RS0041))',
                lines: ['LG18'],
                stroke: 'red',
                priority: 1
            },
        {
            when: '(RS17)',
            lines: ['LG8'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '((RS24 & RS25)& RS0041) ',
            lines: ['LG9'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS24 & RS25) & RS40',    
            lines: ['LG9'],
            stroke: 'red',
            priority: 1
},
        {
            when: '( RS16 & RS24) ',
            lines: ['LG9'],
            stroke: 'red',
            priority: 1
        },
        
        {
            when: '((RS14) & RS0041)',
            lines: ['LG4', 'LG2', 'LG1'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS14) & RS40',           
            lines: ['LG4', 'LG2', 'LG1'],
            stroke: 'red',
            priority: 1
        },

        // {
        //     when: '((RS15 & RS16 & RS17) & RS0041)',
        //     lines: ['LG4', 'LG2','LG3', 'LG1'],
        //     stroke: 'red',
        //     priority: 1
        // },

         {
            when: '(RS15 & RS25)',
            lines: ['LG5'],
            stroke: 'red',
            priority: 1
         },

        {
            when: '(RS12)',
            lines: ['LG2', 'LG1'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS10)',
            lines: ['LG1'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS09)',
            lines: ['LG1'],
            stroke: 'red',
            priority: 1
        },

        //right side logic started-------------------------------
        
        {
            when: '((RS23 | RS21 | RS19) & RS34 & RS33 & RS82)',
            lines: ['LG10', 'LG013', 'LG11', 'LG12'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '((RS26 & RS30 & RS32 ) & (RS34 & RS82))',
            lines: ['LG10', 'LG013'],
            stroke: 'red',
            priority: 1

        },
        {
            when: '((RS27 & RS30 & RS32 ) & (RS33 & RS82))',
            lines: ['LG11', 'LG12'],
            stroke: 'red',
            priority: 1

        },
        {
            when: '((RS26 & RS27) & RS34 & RS33)',
            lines: ['LG12','LG11','LG10','LG013'],
            stroke: 'red',
            priority: 1
        },
         {
            when: '((RS27 & RS29))',
            lines: ['LG11'],
            stroke: 'red',
            priority: 1
        },
         {
            when: '((RS26 & RS28))',
            lines: ['LG10'],
            stroke: 'red',
            priority: 1
        },
         {
            when: '((RS29 & RS28) & RS33 & RS34)',
            lines: ['LG12','LG013'],
            stroke: 'red',
            priority: 1
        },
         {
            when: '((RS30 & RS28 & RS32) & RS33 & RS34)',
            lines: ['LG013'],
            stroke: 'red',
            priority: 1
        },
         {
            when: '((RS29 & RS30 & RS32) & RS33 & RS34)',
            lines: ['LG12'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '((RS31 & RS35))',
            lines: ['LG14'],
            stroke: 'red',
            priority: 1
        },
        
        {
            when: '((RS19 |RS20 |RS23) & RS29 & RS28 & (!RS33 |!RS34))',
            lines: ['LG11','LG10'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '((RS26 & RS27) & RS29 & RS28 & (!RS33 |!RS34))',
            lines: ['LG11','LG10'],
            stroke: 'red',
            priority: 1
        },
        
        {
            when: '(RS29 & RS28 & RS30 & RS32 & !RS33 & RS34 )',
            lines: ['LG013'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS29 & RS28 & RS30 & RS32 & RS33 & !RS34 )',
            lines: ['LG12'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS36 & RS35)',
            lines: ['LG58'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS39)',
            lines: ['LG17'],
            stroke: 'red',
            priority: 1
        },

        //down line  left side tss left side logic started-------------------------------
        {
            when: '((RS75 & RS70) | (RS73 & RS70) | (RS71 & RS70) | RS66 | (RS71 & RS72) | (RS73 & RS72) | (RS75 & RS72) | (RS71 & RS74) | (RS73 & RS74) | (RS75 & RS74) | (RS71 & RS76) | (RS73 & RS76) | (RS75 & RS76))',
            lines: ['LG49', 'LG50', 'LG53', 'LG51', 'LG054', 'LG055', 'LG056', 'LG057'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS62)',
            lines: ['LG50', 'LG51', 'LG53', 'LG054', 'LG055', 'LG056', 'LG057'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS078)',
            lines: ['LG054', 'LG055', 'LG056', 'LG057'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS079)',
            lines: ['LG055', 'LG056', 'LG057'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS80)',
            lines: ['LG056', 'LG057'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS81)',
            lines: ['LG057'],
            stroke: 'red',
            priority: 1
        },

        // down line left side tss right side logic started-------------------------------
        {
            when: '((RS70 & RS72 & RS67) | (RS70 & RS74 & RS67) | (RS70 & RS76 & RS67) | (RS71 & RS74 & RS67) | (RS73 & RS74 & RS67) | (RS71 & RS72 & RS67) | (RS75 & RS74 & RS67) | (RS71 & RS76 ) | (RS73 & RS76) | (RS75 & RS76) |(RS69 & RS67))',
            lines: ['LG48', 'LG47'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '((RS72 | RS74 | RS76 | RS69) & !RS67 & RS63)',
            lines: ['LG48'],
            stroke: 'red',
            priority: 1
        },
        

        {
            when: '(RS63 & RS67)',
            lines: ['LG47'],
            stroke: 'red',
            priority: 1
        },

        //down line right side tss left side logic started-------------------------------

        {
            when: '((RS60 | RS59 | RS57 | RS54) & RS67 & RS68)',
            lines: ['LG46'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS64)',
            lines: ['LG52'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS65)',
            lines: ['LG52'],
            stroke: 'red',
            priority: 1
        },


        // Baaki sari lines — RS044 substitute RS00046, RS47 substitute RS00049
        {
            when: '(RS55 & RS52 & RS0041 & (RS00046 | RS044) & (RS00049 | RS47))',
            lines: ['LG42', 'LG21', 'LG20', 'LG19', 'LG26', 'LG37', 'LG38'],
            stroke: 'red',
            priority: 1
        },

        // LG22 — sirf RS00046 actual closed hone par red (RS044 substitute nahi)
        {
            when: '(RS55 & RS52 & RS0041 & RS00046 & (RS00049 | RS47))',
            lines: ['LG22'],
            stroke: 'red',
            priority: 1
        },

        // LG39 — sirf RS00049 actual closed hone par red (RS47 substitute nahi)
        {
            when: '(RS55 & RS52 & RS0041 & (RS00046 | RS044) & RS00049)',
            lines: ['LG39'],
            stroke: 'red',
            priority: 1
        },
       
       
        // Baaki sari lines (LG22 aur LG39 chhod ke) — RS044/RS47 substitute kar sakte hain
        {
            when: '((RS114 | RS115 | RS58) | (RS55 & RS53)) & (RS00046 | RS044) & (RS00049 | RS47) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)))',
            lines: ['LG42', 'LG44', 'LG45', 'LG43', 'LG25', 'LG21', 'LG20', 'LG19', 'LG26', 'LG37', 'LG38'],
            stroke: 'red',
            priority: 1
        },

        // LG22 — sirf RS00046 actual closed hone par red (RS044 substitute nahi)
        {
            when: '((RS114 | RS115 | RS58) | (RS55 & RS53)) & RS00046 & (RS00049 | RS47) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)))',
            lines: ['LG22'],
            stroke: 'red',
            priority: 1
        },

        // LG39 — sirf RS00049 actual closed hone par red (RS47 substitute nahi)
        {
            when: '((RS114 | RS115 | RS58) | (RS55 & RS53)) & (RS00046 | RS044) & RS00049 & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)))',
            lines: ['LG39'],
            stroke: 'red',
            priority: 1
        },
                
        {
            when: '(RS43)',
            lines: ['LG20', 'LG19'],
            stroke: 'red',
            priority: 1
        }, 
        {
            when: '(RS40 & RS0041)',
            lines: ['LG18'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '((RS51 & RS55) &  RS00046 )',
            lines: ['LG42', 'LG21', 'LG22', ],
            stroke: 'red',
            priority: 1
        },
        {
            when: '((RS51 & RS55) & !RS00046 & RS044  )',
            lines: ['LG42', 'LG21' ],
            stroke: 'red',
            priority: 1
        },
        
        {
            when: '(RS50 & RS00049)',
            lines: ['LG37', 'LG38', 'LG39',],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS50 & !RS00049 & RS47)',
            lines: ['LG37', 'LG38'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS044 & RS00046)',
            lines: ['LG22'],
            stroke: 'red',
            priority: 1
        },
        // {
        //     when: '(RS0046)',
        //     lines: ['LG23', 'LG24'],
        //     stroke: 'red',
        //     priority: 1
        // },
        {
            when: '(RS045)',
            lines: ['LG23'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS47 & RS00049)',
            lines: ['LG39'],
            stroke: 'red',
            priority: 1
        },
        // {
        //     when: '(RS0049)',
        //     lines: ['LG40', 'LG41'],
        //     stroke: 'red',
        //     priority: 1
        // },
        {
            when: '(RS48)',
            lines: ['LG40'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS013 & RS0041 )',
            lines: ['LG018','LG019','LG021','LG022','LG18'],
            stroke: 'red',
            priority: 1
        },
       
        // {
        //     when: '(RS58 & RS013 & !RS0041 & RS00046 & RS00049) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS013)',
        //     lines: ['LG018','LG18','LG019','LG021','LG022','LG42','LG45','LG43','LG25','LG44','LG22','LG21','LG20','LG19','LG26','LG37','LG38','LG39'],
        //     stroke: 'red',
        //     priority: 1
        // },
        // {
        //     when: '(RS115 & RS013 & !RS0041 & RS00046 & RS00049) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS013)',
        //     lines: ['LG018','LG18','LG019','LG021','LG022','LG42','LG45','LG43','LG25','LG44','LG22','LG21','LG20','LG19','LG26','LG37','LG38','LG39'],
        //     stroke: 'red',
        //     priority: 1
        // },
        // {
        //     when: '(RS114 & RS013 & !RS0041 & RS00046 & RS00049) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS013)',
        //     lines: ['LG018','LG18','LG019','LG021','LG022','LG42','LG45','LG43','LG25','LG44','LG22','LG21','LG20','LG19','LG26','LG37','LG38','LG39'],
        //     stroke: 'red',
        //     priority: 1
        // },
        // {
        //     when: '(RS55 & RS53 & RS013 & !RS0041 & RS00046 & RS00049) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS013)',
        //     lines: ['LG018','LG18','LG019','LG021','LG022','LG42','LG45','LG43','LG25','LG44','LG22','LG21','LG20','LG19','LG26','LG37','LG38','LG39'],
        //     stroke: 'red',
        //     priority: 1
        // },

        // ========== RS58 ==========
        {
            when: '(RS58 & RS013 & !RS0041 & (RS00046 | RS044) & (RS00049 | RS47)) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS013)',
            lines: ['LG018','LG18','LG019','LG021','LG022','LG42','LG45','LG43','LG25','LG44','LG21','LG20','LG19','LG26','LG37','LG38'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS58 & RS013 & !RS0041 & RS00046 & (RS00049 | RS47)) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS013)',
            lines: ['LG22'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS58 & RS013 & !RS0041 & (RS00046 | RS044) & RS00049) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS013)',
            lines: ['LG39'],
            stroke: 'red',
            priority: 1
        },

        // ========== RS115 ==========
        {
            when: '(RS115 & RS013 & !RS0041 & (RS00046 | RS044) & (RS00049 | RS47)) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS013)',
            lines: ['LG018','LG18','LG019','LG021','LG022','LG42','LG45','LG43','LG25','LG44','LG21','LG20','LG19','LG26','LG37','LG38'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS115 & RS013 & !RS0041 & RS00046 & (RS00049 | RS47)) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS013)',
            lines: ['LG22'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS115 & RS013 & !RS0041 & (RS00046 | RS044) & RS00049) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS013)',
            lines: ['LG39'],
            stroke: 'red',
            priority: 1
        },

        // ========== RS114 ==========
        {
            when: '(RS114 & RS013 & !RS0041 & (RS00046 | RS044) & (RS00049 | RS47)) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS013)',
            lines: ['LG018','LG18','LG019','LG021','LG022','LG42','LG45','LG43','LG25','LG44','LG21','LG20','LG19','LG26','LG37','LG38'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS114 & RS013 & !RS0041 & RS00046 & (RS00049 | RS47)) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS013)',
            lines: ['LG22'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS114 & RS013 & !RS0041 & (RS00046 | RS044) & RS00049) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS013)',
            lines: ['LG39'],
            stroke: 'red',
            priority: 1
        },

        // ========== RS55 & RS53 ==========
        {
            when: '(RS55 & RS53 & RS013 & !RS0041 & (RS00046 | RS044) & (RS00049 | RS47)) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS013)',
            lines: ['LG018','LG18','LG019','LG021','LG022','LG42','LG45','LG43','LG25','LG44','LG21','LG20','LG19','LG26','LG37','LG38'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS55 & RS53 & RS013 & !RS0041 & RS00046 & (RS00049 | RS47)) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS013)',
            lines: ['LG22'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS55 & RS53 & RS013 & !RS0041 & (RS00046 | RS044) & RS00049) & !((RS58 | RS115 | RS114 | (RS55 & RS53)) & !RS0041 & !RS40 & !(RS18 | RS20 | RS22 | (RS24 & RS25)) & !RS013)',
            lines: ['LG39'],
            stroke: 'red',
            priority: 1
        },
       {
            when: '(RS15 & RS16 & RS0041 & RS00046 & RS00049 )',
            lines: ['LG018','LG019','LG021','LG022','LG18','LG4','LG2','LG1','LG8'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS013 & RS40)',
            lines: ['LG018','LG019','LG021','LG022'],
            stroke: 'red',
            priority: 1
        },
        

    ]
export function Circuit5Logic(canvas: fabric.Canvas, closedSignals: Set<string>) {

    runLineRules(canvas, closedSignals, Circuit5_RULES);
}


const GIL_DUI_COM_RULES: LineRule[] = [
    //up line started--------------------------------
    //left side logic started-------------------------------
    {
        when: '(RS0 & RS1)',
        lines: ['LG1'],
        stroke: 'red',
        priority: 1
    },
    {
        when: '((RS2 & RS1) | (RS1 & RS5))',
        lines: ['LG2'],
        stroke: 'red',
        priority: 1
    },
    {
        when: '((RS2 & RS5) | (RS1 & RS5) | (RS2 & RS8 & RS20) | (RS2 & RS7))',
        lines: ['LG3'],
        stroke: 'red',
        priority: 1
    },
    {
        when: '((RS2 & RS8 & RS20) | (RS5 & RS8 & RS20) | (RS2 & RS7) | (RS5 & RS7))',
        lines: ['LG4'],
        stroke: 'red',
        priority: 1
    },
    
    {
        when: '((RS7 | RS014) & RS1)',
        lines: ['LG2', 'LG3', 'LG4'],
        stroke: 'red',
        priority: 1
    },
    {
        when: '((RS8 & RS20 | RS8 & RS11) & RS1)',
        lines: ['LG2', 'LG3', 'LG4'],
        stroke: 'red',
        priority: 1
    },
    {
        when: '(RS4)',
        lines: ['LG11'],
        stroke: 'red',
        priority: 1
    },
    //right side logic started-------------------------------

  
        {
            when: '(RS9 | RS10 | RS011) & RS18 & RS20',
            lines: ['LG024', 'LG025'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS15 & RS18 & RS20)',
            lines: ['LG024'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '((RS011 | RS9 | RS10) & RS15 & !RS18 & RS20)',
            lines: ['LG025'],
            stroke: 'red',
            priority: 1
        },

    //middle line started--------------------------------
    //left side logic started-------------------------------
    {
        when: '(RS22 & RS38)',
        lines: ['LG31', 'LG36'],
        stroke: 'red',
        priority: 1
    },
    {
        when: '(RS037)',
        lines: ['LG32'],
        stroke: 'red',
        priority: 1
    },
    {
        when: '(RS39)',
        lines: ['LG32', 'LG33'],
        stroke: 'red',
        priority: 1
    },
    
    {
        when: '(RS40)',
        lines: ['LG40', 'LG33', 'LG32'],
        stroke: 'red',
        priority: 1
    },
    {
        when: '((RS042 | RS45 | RS047))',
        lines: ['LG44','LG40', 'LG33', 'LG32'],
        stroke: 'red',
        priority: 1
    },


    //middle line right side logic started--------------------------------
    
    {
        when: '((RS44 | RS46 | RS048))',
        lines: ['LG49', 'LG53', 'LG57'],
        stroke: 'red',
        priority: 1
    },
    {
        when: '(RS49)',
        lines: ['LG53', 'LG57'],
        stroke: 'red',
        priority: 1
    },
    {
        when: '(RS50)',
        lines: ['LG57'],
        stroke: 'red',
        priority: 1
    },
    // down line logic started--------------------------------
    //left side logic started-------------------------------
    {
        when: '((RS54 | RS56 | RS058) & RS152)',
        lines: ['LG62', 'LG63'],
        stroke: 'red',
        priority: 1
    },
    {
        when: '((RS152 & RS54) | (RS152 & RS53))',
        lines: ['LG62'],
        stroke: 'red',
        priority: 1
    },
    {
        when: '((RS56 & RS53) | (RS54 & RS53))',
        lines: ['LG63'],
        stroke: 'red',
        priority: 1
    },
    // down line logic started--------------------------------
    //right side logic started-------------------------------
    {
        when: '((RS55 | RS57 | RS059) & RS65 & RS66)',
        lines: ['LG64', 'LG65', 'LG75'],
        stroke: 'red',
        priority: 1
    },
    

    {
        when: '((RS55 & RS060) | (RS57 & RS060) | (RS55 & RS64 | (RS57 & RS64) | (RS059 & RS64)))',
        lines: ['LG64'],
        stroke: 'red',
        priority: 1
    },
    {
        when: '((RS59))',
        lines: ['LG69'],
        stroke: 'red',
        priority: 1
    },
    {
        when: '((RS55 & RS64) | (RS57 & RS64) | (RS059 & RS64 | (RS060 & RS64) | (RS060 & RS66 & RS65)))',
        lines: ['LG65'],
        stroke: 'red',
        priority: 1
    },
    {
        when: '((RS64 & RS66 & RS65) | (RS060 & RS65 & RS66))',
        lines: ['LG75'],
        stroke: 'red',
        priority: 1
    },
    {
        when: '(RS55 | RS57 | RS059) & !RS65 & RS62',
        lines: ['LG64', 'LG65', 'LG75'],
        stroke: 'red',
        priority: 1
    },
    {
        when: 'RS060 & !RS65 & RS62',
        lines: ['LG65', 'LG75'],
        stroke: 'red',
        priority: 1
    },
    {
        when: 'RS64 & !RS65 & RS62',
        lines: ['LG75'],
        stroke: 'red',
        priority: 1
    },
    ];


export function GILDUICOMCircuitLogic(
    canvas: fabric.Canvas,
    closedSignals: Set<string>
) {
    runLineRules(canvas, closedSignals, GIL_DUI_COM_RULES);
}




const MainBoard: LineRule[] =
    [

//up line left side tss logic started-------------------------------

        {
            when: '((RS4 & RS3) | (RS10 | RS08 | RS6)) & RS04 & RS03',
            lines: ['LG4', 'LG3', 'LG6', 'LG5', 'LG18'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '((RS4 & RS3) | (RS10 | RS08 | RS6)) & RS04 & RS03 & RS13 & RS011',
            lines: ['LG3', 'LG4'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS4 & RS15 & RS12) & RS04 & RS03',
            lines: ['LG4', 'LG6'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS3 & RS12 & RS15) & RS04 & RS03',
            lines: ['LG3', 'LG5'],
            stroke: 'red',
            priority: 1
        },
        
        {
            when: '(RS13 & RS12 & RS15) & RS04 & RS03',
            lines: ['LG5'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS011 & RS12 & RS15) & RS04 & RS03',
            lines: ['LG6'],
            stroke: 'red',
            priority: 1
        },

        

        {
            when: '(RS13 & RS011) & RS04 & RS03',
            lines: ['LG5','LG6'],
            stroke: 'red',
            priority: 1
        },
        // {
        //     when: '((RS011 & RS13) | (RS15 & RS011 & RS12)) & RS04 & RS03',
        //     lines: ['LG6'],
        //     stroke: 'red',
        //     priority: 1
        // },

        {
            when: '(RS13 & RS011 & RS12 & RS15) & !RS04 & RS03',
            lines: ['LG6'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS13 & RS011 & RS12 & RS15) & RS04 & !RS03',
            lines: ['LG5'],
            stroke: 'red',
            priority: 1
        },


        {
            when: '(RS001)',
            lines: ['LG01'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS14)',
            lines: ['LG18'],
            stroke: 'red',
            priority: 1
        },

        {
            when: '(RS3 & RS13) & RS04 & RS03',
            lines: ['LG3'],
            stroke: 'red',
            priority: 1
        },
         {
            when: '(RS4 & RS011) & RS04 & RS03',
            lines: ['LG4'],
            stroke: 'red',
            priority: 1
        },
        

        
        

        //up line right side tss left side logic started-------------------------------

        {
            when: '((RS28 | RS27 | RS26) & ((RS039 | RS30) | (RS039 | RS31) | (RS039 | RS32))) & RS04 & RS03',
            lines: ['LG12', 'LG11', 'LG10', 'LG9', 'LG1', 'LG8'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '((RS28 | RS27 | RS26) & ((RS039 | RS30) | (RS039 | RS31) | (RS039 | RS32))) & (RS04 | RS03) & RS16 & RS41',
            lines: ['LG12', 'LG11', 'LG10', 'LG9'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '( RS21 & RS23) & RS04 & RS03' ,
            lines: ['LG11', 'LG9', 'LG1','LG8','LG10','LG12'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '( RS21 & RS23) & RS16 & RS41 & (!RS04 | !RS03)' ,
            lines: ['LG11', 'LG9','LG10','LG12'],
            stroke: 'red',
            priority: 1
        },
        
         {
            when: '(RS23 & RS20 & RS17 & RS16) & RS04 & RS03',
            lines: ['LG11', 'LG9'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS23 & RS20 & RS17 & RS0016) & RS04 & RS03',
            lines: ['LG11', 'LG9','LG1'],
            stroke: 'red',
            priority: 1
        },

        {
            when: '((RS21 & RS19 & RS18 ) & RS04 & RS03',
            lines: ['LG12', 'LG10', 'LG8'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS20 & RS19) & RS04 & RS03',
            lines: ['LG9', 'LG10', 'LG8', 'LG1'],
            stroke: 'red',
            priority: 1
        },

        {
            when: '(RS21 & RS20) & RS04 & RS03',
            lines: ['LG12', 'LG9', 'LG10', 'LG1', 'LG8'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS23 & RS19) & RS04 & RS03',
            lines: ['LG11', 'LG10', 'LG9', 'LG8', 'LG1'],
            stroke: 'red',
            priority: 1
        },

        {
            when: '(RS18 & RS17) & RS04 & RS03',
            lines: ['LG10', 'LG9', 'LG8', 'LG1'],
            stroke: 'red',
            priority: 1
        },

        {
            when: '(RS16 & RS0016 & RS041) & RS04 & RS03',
            lines: ['LG1'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS16 & RS41 & RS0016 & RS041) & RS04 & !RS03',
            lines: ['LG1'],
            stroke: 'red',
            priority: 1
        },

        {
            when: '(RS41 & RS041 & RS0016) & RS04 & RS03',
            lines: ['LG8'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS16 & RS41 & RS0016 & RS041) & !RS04 & RS03',
            lines: ['LG8'],
            stroke: 'red',
            priority: 1
        },


        {
            when: '(RS17 & RS16) & RS04 & RS03',
            lines: ['LG9'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS18 & RS41) & RS04 & RS03',
            lines: ['LG10'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS23 & RS20) & RS04 & RS03',
            lines: ['LG11'],
            stroke: 'red',
            priority: 1
        },
         {
            when: '(RS21 & RS19) & RS04 & RS03',
            lines: ['LG12'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS16 & RS41) & RS04 & RS03',
            lines: ['LG1','LG8'],
            stroke: 'red',
            priority: 1
        },
        // RS26/27/28 mein se koi ek + RS17 + RS18 close, aur RS04 ya RS03 open → LG11, LG12 red
        {
            when: '((RS26 | RS27 | RS28) & RS17 & RS18 & (!RS04 | !RS03))',
            lines: ['LG11', 'LG12'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS21 & RS23 & RS17 & RS18 & RS19 & RS20) & (!RS04 | !RS03)',
            lines: ['LG12', 'LG11'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS21 & RS17 & RS18 & RS19 & RS20) & (!RS04 | !RS03)',
            lines: ['LG12'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS23 & RS17 & RS18 & RS19 & RS20) & (!RS04 | !RS03)',
            lines: ['LG11'],
            stroke: 'red',
            priority: 1
        },




        //up line right side tss right side logic started-------------------------------

        {
            when: '((RS32 | RS31 | RS30) & ((RS039 | RS26) | (RS039 | RS27) | (RS039 | RS28))) & RS00065 & RS65 & RS0064 & RS0061', 
            
            lines: ['LG14', 'LG13', 'LG15', 'LG16', 'LG016', 'LG019', 'LG018', 'LG017', 'LG25', 'LG26', 'LG19', 'LG20', 'LG21', 'LG020','LG021', 'LG58', 'LG51', 'LG53', 'LG52', 'LG54', 'LG055', 'LG054'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '((RS32 | RS31 | RS30) & ((RS039 | RS26) | (RS039 | RS27) | (RS039 | RS28))) & (RS00065 | RS65 | RS0064 | RS0061) & RS35 & RS33',
            lines: ['LG13', 'LG14'],
            stroke: 'red',
            priority: 1
        },

        // New condition 2 — RS014 & RS060 band → sirf LG13, LG14, LG15, LG16, LG25, LG26 red
        {
            when: '((RS32 | RS31 | RS30) & ((RS039 | RS26) | (RS039 | RS27) | (RS039 | RS28))) & (RS00065 | RS65 | RS0064 | RS0061) & RS014 & RS060',
            lines: ['LG13', 'LG14', 'LG15', 'LG16', 'LG25', 'LG26'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS24 & RS25) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG14', 'LG13', 'LG15', 'LG16', 'LG016', 'LG019', 'LG018', 'LG017', 'LG25', 'LG26', 'LG19', 'LG20', 'LG21', 'LG020','LG021', 'LG58', 'LG51', 'LG53', 'LG52', 'LG54', 'LG055', 'LG054'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS24 & RS25) & RS35 & RS33 & !RS00065 | !RS65 | !RS0064 | !RS0061',
            lines: ['LG14', 'LG13'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS25 & RS34 & RS36) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG14', 'LG16', 'LG016', 'LG019', 'LG018', 'LG017'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS24 & RS34 & RS36) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG13', 'LG15'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS35 & RS33) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG15', 'LG16', 'LG25', 'LG26', 'LG19', 'LG20','LG021', 'LG21', 'LG020', 'LG58', 'LG51', 'LG53', 'LG52', 'LG54', 'LG055', 'LG054'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '((RS33 & RS74 & RS34) & ( RS060 ) | ( RS35 & RS33)) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG16', 'LG26'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '((RS35 & RS34 & RS74 ) & (RS014) | ( RS35 & RS33)) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG15', 'LG25'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS36 & RS37) & RS00065 & RS65 & RS0064 & RS0061 ',
            lines: ['LG017', 'LG018'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS25 & RS33 & RS37) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG14'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS24 & RS35 & RS36) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG13'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS39) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG018'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS38) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG017'],
            stroke: 'red',
            priority: 1
        },

        //down line logic started left side-------------------------------
        {
            when: '(RS014 & RS060) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG19', 'LG20', 'LG21','LG021', 'LG020', 'LG58', 'LG51', 'LG53', 'LG52', 'LG54', 'LG055', 'LG054'],
            stroke: 'red',
            priority: 1
        },
        
        // {
        //     when: '(RS014 &  RS73 & RS72 & RS71 & RS70 & RS69 & RS77 & RS76 & RS0010 & RS396 & RS395 )  & RS00065 & RS65 & RS0064 & RS0061',
        //     lines: ['LG19'],
        //     stroke: 'red',
        //     priority: 1
        // },

        {
            when: '(RS060 & RS78) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG20', 'LG020','LG021', 'LG21', 'LG055', 'LG054', 'LG52', 'LG54'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS060 & RS75) & RS00065 & RS65 & RS0064 & RS0061 ',
            lines: ['LG054', 'LG055', 'LG52', 'LG54', 'LG20', 'LG57'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS76 & RS0009) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG21'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS0010 & RS0009) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG020'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS76 & RS0010) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG21', 'LG020'],
            stroke: 'red',
            priority: 1
        },
        // {
        //     when: '(RS064 & RS061)',
        //     lines: ['LG55', 'LG56'],
        //     stroke: 'red',
        //     priority: 1
        // },
        // {
        //     when: '(RS061 & (RS63 | RS064))',
        //     lines: ['LG56'],
        //     stroke: 'red',
        //     priority: 1
        // },
        {
            when: '(RS72)',
            lines: ['LG54'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS75 & RS77 & RS78) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG21', 'LG020'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS60 & RS060 & RS71) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG51', 'LG20','LG52'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS014 & RS60 & RS77) & RS00065 & RS65 & RS0064 & RS0061',
            lines: ['LG19'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS78)', 
            lines: ['LG58'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS73)',
            lines: ['LG57'],
            stroke: 'red',
            priority: 1
        },



        //downline right side, left side tss logic started -------------------------------

        {
            when: '((RS91 | RS93 | RS95) & ((RS97 | RS92) | (RS97 | RS94) | (RS97 | RS96))) & RS00065 & RS65',
            lines: ['LG27', 'LG22', 'LG23', 'LG24'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '((RS91 | RS93 | RS95) & ((RS97 | RS92) | (RS97 | RS94) | (RS97 | RS96))) & (RS00065 | RS65) & RS068 & RS67 ',
            lines: ['LG27', 'LG24'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS89 & RS87) & RS00065 & RS65',
            lines: ['LG27', 'LG24', 'LG23', 'LG22'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS89 & RS87) & RS068 & RS67 & (!RS00065 | !RS65)',
            lines: [ 'LG27', 'LG24'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS87 & RS068) & RS00065 & RS65',
            lines: ['LG27'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS89 & RS67) & RS00065 & RS65',
            lines: ['LG24'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS67 & RS066 & RS0079)& RS00065 & RS65',
            lines: ['LG23'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS068 & RS066 & RS0079)& RS00065 & RS65',
            lines: ['LG22'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS69 & RS70)',
            lines: ['LG055','LG054'],
            stroke: 'red',
            priority: 1
        },

        {
            when: '(RS69 & RS62)',
            lines: ['LG055'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS70 & RS62)',
            lines: ['LG054'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS068 & RS67)& RS00065 & RS65',
            lines: ['LG22','LG23'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS87 & RS066 & RS0079 ) & RS00065 & RS65',
            lines: ['LG22','LG27'],
            stroke: 'red',
            priority: 1
        },
         {
            when: '(RS89 & RS066 & RS0079 ) & RS00065 & RS65',
            lines: ['LG23','LG24'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS67 & RS068 & RS066 & RS0079)& !RS00065 & RS65',
            lines: ['LG23'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS67 & RS068 & RS066 & RS0079)& RS00065 & !RS65',
            lines: ['LG22'],
            stroke: 'red',
            priority: 1
        },



        //downline right side, right side tss logic started -------------------------------

        {
            when: '((RS92 | RS94 | RS96) & ((RS97 | RS91) | (RS97 | RS93) | (RS97 | RS95))) & RS048 & RS049 & (RS044 | (RS42 & RS43) & RS82 & RS81 ) ',
            lines: ['LG45','LG28', 'LG29', 'LG30', 'LG31', 'LG32', 'LG39', 'LG50', 'LG49', 'LG37', 'LG34', 'LG35','LG48', 'LG46', 'LG47', 'LG40', 'LG41','LG44','LG0101','LG33'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '((RS92 | RS94 | RS96) & !RS044 & RS42 & RS43 & RS048 & RS049)',
            lines: ['LG45','LG28', 'LG29', 'LG30', 'LG31', 'LG32', 'LG39', 'LG50', 'LG49', 'LG37', 'LG34', 'LG35','LG48', 'LG46', 'LG47', 'LG40', 'LG41','LG44','LG0101','LG33'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(((RS92 | RS94 | RS96) & ((RS97 | RS91) | (RS97 | RS93) | (RS97 | RS95))) | (RS88 & RS90)) & ((!RS048 | !RS049) | (!RS044 | (RS42 & RS43))) & RS82 & RS81',
            lines: ['LG28', 'LG29', 'LG30', 'LG31'],
            stroke: 'red',
            priority: 1
        },

        {
            when: '(RS88 & RS90) & RS048 & RS049 & (RS044 | (RS42 & RS43) & (!RS81 & !RS82))',
            lines: ['LG45','LG28', 'LG29', 'LG30', 'LG31', 'LG32', 'LG39', 'LG50', 'LG49', 'LG37', 'LG34', 'LG35', 'LG48', 'LG46', 'LG47', 'LG40', 'LG41','LG44','LG0101','LG33'],
            stroke: 'red',
            priority: 1
        },
        
        {
            when: '((RS85 & RS86) | (RS83 & RS84))',
            lines: ['LG45', 'LG30', 'LG31', 'LG32', 'LG39', 'LG50', 'LG49', 'LG37','LG34', 'LG35','LG48', 'LG46', 'LG47', 'LG40', 'LG41', 'LG44','LG0101','LG33'],
            stroke: 'red',
            priority: 1
        },

        {
            when: '((RS81 & RS82)) & RS048 & RS049 & (RS044 | (RS42 & RS43))',
            lines: ['LG45', 'LG32', 'LG39', 'LG50', 'LG49', 'LG37','LG34', 'LG35', 'LG48', 'LG46', 'LG47', 'LG40', 'LG41','LG44','LG0101','LG33'],
            stroke: 'red',
            priority: 1
        },

        {
            when: '(RS81 & RS45 & RS80 & RS43) & RS048 & RS049 & (RS044 | (RS42 & RS43))',
            lines: ['LG41', 'LG39'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS53 & RS42)',
            lines: ['LG40'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS59)',
            lines: ['LG50'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS058)',
            lines: ['LG0101'],
            stroke: 'red',
            priority: 1
        },

        {
            when: '(RS56)',
            lines: ['LG49'],
            stroke: 'red',
            priority: 1
        },
        
        {
            when: '(RS49)',
            lines: ['LG45'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS52)',
            lines: ['LG48'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS50)',
            lines: ['LG46', 'LG45'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS51)',
            lines: ['LG47'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS82 & RS45 & RS53) & RS048 & RS049 & (RS044 | (RS42 & RS43))',
            lines: ['LG32', 'LG50', 'LG34', 'LG33', 'LG35',  'LG37', 'LG49', 'LG48', 'LG46', 'LG47', 'LB135', 'LG45'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS58 & RS53 & RS45) ',
            lines: ['LG49', 'LG50', 'LG35', 'LG37', ],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS55 & RS54)',
            lines: ['LG35', 'LG37',],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS55 & RS48)',
            lines: ['LG35'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS54 & RS48)',
            lines: ['LG37'],
            stroke: 'red',
            priority: 1
        },
        // {
        //     when: '(RS0048 & RS0049)',
        //     lines: ['LG38', 'LG36'],
        //     stroke: 'red',
        //     priority: 1
        // },
        {
            when: '(RS58 & RS81) & RS048 & RS049 & (RS044 | (RS42 & RS43)) ',
            lines: ['LG35', 'LG37', 'LG48', 'LG46', 'LG47', 'LG45', 'LG49', 'LG50', 'LG39', 'LG40','LG41'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS58 & RS45)',
            lines: ['LG35', 'LG37', 'LG40','LG48', 'LG46', 'LG47', 'LG49', 'LG50', 'LG45'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS82 & RS80 & RS58) & RS048 & RS049 & (RS044 | (RS42 & RS43))',
            lines: ['LG32','LG33','LG34'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS88 & RS86)',
            lines: ['LG28'],
            stroke: 'red',
            priority: 1
        },
        
        {
            when: '(RS85 & RS90)',
            lines: ['LG29'],
            stroke: 'red',
            priority: 1
        },
        
        {
            when: '(RS83 & RS82)',
            lines: ['LG30'],
            stroke: 'red',
            priority: 1
        },
        {
            when: '(RS84 & RS81)',
            lines: ['LG31'],
            stroke: 'red',
            priority: 1
        },
        


    ]
export function MainBoardLogic(canvas: fabric.Canvas, closedSignals: Set<string>) {

    runLineRules(canvas, closedSignals, MainBoard);
}




export const circuitLogicRegistry: Record<string, (canvas: fabric.Canvas, closedSignals: Set<string>) => void> = {
    "mainCircuit": mainCircuitLogic,
    "circuit5": Circuit5Logic,
    "GILDUICOM": GILDUICOMCircuitLogic,
    "MainBoard": MainBoardLogic
};

