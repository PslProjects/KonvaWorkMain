
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CircuitService } from '../services/circuit.service';
import * as fabric from 'fabric';
// import { circuitLogicRegistry } from '../circuit-logics';
// import { mainCircuitLogic, Circuit5Logic, GILDUICOMCircuitLogic, MainBoardLogic } from '../circuit-logics'
import { LineRule, applyRulesToCanvas } from '../rule-engine';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { RED_SIGNAL_MAPS } from 'src/utils/RED_SIGNAL_MAPS';



// import { v4 as uuidv4 } from 'uuid';


// runLineRules function bhi add karo (circuit-logics se copy)
function runLineRules(
  canvas: fabric.Canvas,
  closedSignals: Set<string>,
  rules: LineRule[]
) {
  const sortedRules = [...rules].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  canvas.getObjects().forEach(obj => {
    const anyObj = obj as any;
    if ((anyObj.customType !== 'lineR' && anyObj.customType !== 'lineG') || !anyObj.customId) return;

    const lineId = anyObj.customId;
    let stroke = anyObj.originalStroke || 'green';

    for (const rule of sortedRules) {
      if (rule.lines.includes(lineId) && evalCondition(rule.when, closedSignals)) {
        stroke = rule.stroke;
      }
    }
    anyObj.set('stroke', stroke);
  });
  canvas.renderAll();
}

// evalCondition helper
function evalCondition(expr: string, closed: Set<string>): boolean {
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



//this method helps to get the id and name of that particular icon when we save it in file and load it from file
// It adds custom properties to the fabric object so that they can be saved and loaded correctly


declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

type NormalRule = {
  controlledSignal: string;
  preconditions: string[][];
  reverse?: {
    signal: string;
    conditions: string[][];
  };
};

type FaultRule = {
  controlledSignal: string;
  preconditions: string[][];
  reverse?: {
    signal: string;
    conditions: string[][];
  };
};

type CircuitRuleSet = {
  normalMode: NormalRule[];
  faultMode: {
    preconditions: Record<string, FaultRule>;
    resolutionMap: Record<string, string[]>;
  };
};

const CIRCUIT_RULES: Record<string, CircuitRuleSet> = {

  /* =====================================================
     🔵 FINAL CIRCUIT (YOUR EXISTING HARD-CODED LOGIC)
  ===================================================== */
  RBR_Board: {
    normalMode: [
      {
        controlledSignal: 'RS8',
        preconditions: [
          ['RS5', 'RS14'],
          ['RS5', 'RS16'],
          ['RS1', 'RS3'],
          ['RS14', 'RS6'],
          ['RS4', 'RS12', 'RS5', 'RS3'],
          ['RS4', 'RS12', 'RS14', 'RS1'],
          ['RS4', 'RS12', 'RS16', 'RS1'],
          ['RS4', 'RS12', 'RS6', 'RS3']
        ],
        // reverse: {
        //   signal: 'RS18',
        //   conditions: [['RS11']]
        // }
      },
      {
        controlledSignal: 'RS18',
        preconditions: [
          ['RS46', 'RS47'],
          ['RS37', 'RS38', 'RS45', 'RS47'],
          ['RS39', 'RS38', 'RS45', 'RS46'],
          ['RS39', 'RS37'],
          ['RS26', 'RS37', 'RS27'],
          ['RS27', 'RS25'],
          ['RS17', 'RS25'],
          ['RS15', 'RS27']
        ],
        // reverse: {
        //   signal: 'RS8',
        //   conditions: [['RS11']]
        // }
      }
    ],

    faultMode: {
      preconditions: {
        // LG8: {
        //   controlledSignal: 'RS8',
        //   preconditions: [
        //     ['RS6', 'RS4', 'RS12', 'RS11'],
        //     ['RS4', 'RS5', 'RS12', 'RS11'],
        //     ['RS4', 'RS5', 'RS12', 'RS18'],
        //     ['RS16', 'RS6', 'RS11']
        //   ],
        //   reverse: { signal: 'RS18', conditions: [['RS11']] }
        // },

        LG7: {
          controlledSignal: 'RS8',
          preconditions: [
            ['RS14', 'RS4', 'RS12', 'RS18'],
            ['RS16', 'RS4', 'RS12', 'RS11'],
            ['RS4', 'RS12', 'RS14', 'RS11'],
            ['RS16', 'RS6', 'RS11']
          ],
          reverse: { signal: 'RS18', conditions: [['RS11']] }
        },

        LG11: {
          controlledSignal: 'RS8',
          preconditions: [
            ['RS6', 'RS16', 'RS11'],
            ['RS5', 'RS6', 'RS11'],
            ['RS5', 'RS6', 'RS18'],
            ['RS4', 'RS12', 'RS6', 'RS11']
          ],
          reverse: { signal: 'RS18', conditions: [['RS11']] }
        },

        LG12: {
          controlledSignal: 'RS8',
          preconditions: [
            ['RS6', 'RS16', 'RS11'],
            ['RS14', 'RS16', 'RS11'],
            ['RS14', 'RS16', 'RS18'],
            ['RS4', 'RS12', 'RS16', 'RS11']
          ],
          reverse: { signal: 'RS18', conditions: [['RS11']] }
        },

        // ================= RS18 SIDE =================

        LG24: {
          controlledSignal: 'RS18',
          preconditions: [
            ['RS15', 'RS26', 'RS38', 'RS45', 'RS11'],
            ['RS25', 'RS15', 'RS11'],
            ['RS25', 'RS15', 'RS18'],
            ['RS15', 'RS17', 'RS11'],
            ['RS15', 'RS27', 'RS11'],

          ],
          reverse: { signal: 'RS8', conditions: [['RS11']] }
        },

        LG25: {
          controlledSignal: 'RS18',
          preconditions: [
            ['RS17', 'RS26', 'RS38', 'RS45', 'RS11'],
            ['RS17', 'RS27', 'RS11'],
            ['RS17', 'RS27', 'RS18'],
            ['RS17', 'RS25', 'RS11'],
            ['RS15', 'RS17', 'RS11']
          ],
          reverse: { signal: 'RS8', conditions: [['RS11']] }
        },

        LG38: {
          controlledSignal: 'RS18',
          preconditions: [
            ['RS17', 'RS15', 'RS11'],
            ['RS15','RS26', 'RS38', 'RS45','RS11'],
            ['RS25', 'RS26', 'RS37' ]
            // ['RS15', 'RS26', 'RS37']
          ],
          reverse: { signal: 'RS8', conditions: [['RS11']] }
        },

        LG39: {
          controlledSignal: 'RS18',
          preconditions: [
            ['RS17', 'RS15', 'RS11'],
            ['RS17','RS26', 'RS38', 'RS45','RS11'],
            ['RS27', 'RS26', 'RS39' ]

          ],
          reverse: { signal: 'RS8', conditions: [['RS11']] }
        },

        LG45: {
          controlledSignal: 'RS18',
          preconditions: [
            ['RS15', 'RS17', 'RS11'],
            ['RS15', 'RS26', 'RS38', 'RS45', 'RS11'],
            ['RS25', 'RS26', 'RS11'],
            ['RS38', 'RS45', 'RS37', 'RS11'],
            ['RS38', 'RS45', 'RS37', 'RS18']

          ],
          reverse: { signal: 'RS8', conditions: [['RS11']] }
        },

        LG46: {
          controlledSignal: 'RS18',
          preconditions: [
            ['RS15', 'RS17', 'RS11'],
            ['RS17', 'RS26', 'RS38', 'RS45', 'RS11'],
            ['RS27', 'RS26', 'RS11'],
            ['RS38', 'RS45', 'RS39', 'RS11'],
            ['RS38', 'RS45', 'RS39', 'RS18'],

          ],
          reverse: { signal: 'RS8', conditions: [['RS11']] }
        },

        LG75: {
          controlledSignal: 'RS69',
          preconditions: [
            ['RS66', 'RS63', 'RS58', 'RS57', 'RS68'],
            // ['RS66', 'RS63', 'RS58', 'RS68'],
            ['RS66', 'RS63', 'RS58', 'RS68'],
            ['RS63', 'RS62', 'RS58', 'RS68'],
            ['RS63', 'RS62', 'RS58', 'RS70'],
            ['RS64', 'RS66', 'RS68'],


          ],
          reverse: { signal: '', conditions: [['']] }
        },

        LG74: {
          controlledSignal: 'RS69',
          preconditions: [
            //  ['RS66', 'RS63', 'RS58', 'RS57', 'RS68'],
            ['RS61', 'RS63', 'RS58', 'RS70'],
            ['RS64', 'RS63', 'RS58', 'RS68'],
            ['RS63', 'RS58', 'RS61', 'RS68'],
            ['RS64', 'RS66', 'RS68']

          ],
          reverse: { signal: '', conditions: [['']] }
        },

        LG77: {
          controlledSignal: 'RS69',
          preconditions: [
            ['RS64', 'RS66', 'RS68'],
            ['RS66', 'RS63', 'RS58', 'RS57', 'RS68'],
            ['RS62', 'RS66', 'RS68'],
            ['RS62', 'RS66', 'RS70'],
            ['RS61', 'RS64', 'RS66', 'RS68'],

          ],
          reverse: { signal: '', conditions: [['']] }
        },
        LG76: {
          controlledSignal: 'RS69',
          preconditions: [
            ['RS64', 'RS66', 'RS68'],
            ['RS64', 'RS63', 'RS58', 'RS57', 'RS68'],
            ['RS61', 'RS64', 'RS68'],
            ['RS61', 'RS58', 'RS64', 'RS68']
          ],
          reverse: { signal: '', conditions: [['']] }
        },

        LG88: {
          controlledSignal: 'RS70',
          preconditions: [
            ['RS67', 'RS65','RS68'],
            ['RS67', 'RS82', 'RS84', 'RS086', 'RS087', 'RS68'],
            ['RS67', 'RS81', 'RS68'],
           
          ],
          reverse: { signal: '', conditions: [['']] }

        },
        LG91: {
          controlledSignal: 'RS70',
          preconditions: [
            ['RS67', 'RS65','RS68'],
            ['RS65', 'RS82', 'RS84', 'RS086', 'RS087', 'RS68'],
            ['RS65', 'RS80', 'RS68'],
          ],
          reverse: { signal: '', conditions: [['']] }
        },
        LG100: {
          controlledSignal: 'RS70',
          preconditions: [
            ['RS67', 'RS65','RS68'],
            ['RS67', 'RS82', 'RS84', 'RS086', 'RS087', 'RS68'],
            ['RS81', 'RS80','RS68'],
            ['RS81', 'RS82', 'RS086','RS84'],
          ],
        
          reverse: { signal: '', conditions: [['']] }
        },
        LG99: {
          controlledSignal: 'RS70',
          preconditions: [
            // ['RS65','RS82','RS84', 'RS83','RS85','RS100','RS68'],   
            // ['RS65','RS68'],
            // ['RS80','RS82','RS68'],
            // ['RS80','RS82','RS087','RS84','RS70'],
            // ['RS84','RS087', 'RS68'],
            ['RS67', 'RS65','RS68'],
            ['RS65', 'RS82', 'RS84', 'RS086', 'RS087', 'RS68'],
            ['RS81', 'RS80','RS68'],
            ['RS80', 'RS82', 'RS087','RS84'],
            // ['RS82', 'RS68'],
            // ['RS087','RS68']

          ],

          reverse: { signal: 'RS68', conditions: [['RS69']] }
        },
        LG108: {
          controlledSignal: 'RS70',
          preconditions: [
            // ['RS67','RS82','RS84', 'RS83','RS85','RS101','RS68'],
            // ['RS67','RS68'],
            // ['RS81','RS68'],
            // ['RS086','RS68'],
            // ['RS086','RS83','RS88','RS90','RS68'],
            // ['RS086','RS83','RS88','RS90','RS70'],
            // ['RS88','RS90', 'RS68'],

            // ['RS65','RS67',],
            // ['RS086', 'RS087', 'RS82', 'RS84', 'RS68'],
            // ['RS67', 'RS90', 'RS91', 'RS83', 'RS85'],
            // ['RS086','RS90','RS83','RS88','RS68'],
            ['RS65','RS67',],
            ['RS086', 'RS087','RS68'],
            ['RS82', 'RS84','RS68'],
            ['RS086','RS90','RS83','RS88','RS68'],



          ],
          reverse: { signal: 'RS68', conditions: [['RS69']] }

        },
        LG107: {
          controlledSignal: 'RS70',
          preconditions: [
            // ['RS65','RS82','RS84', 'RS83','RS85','RS100','RS68'],
            // ['RS65','RS68'],
            // ['RS80','RS68'],
            // ['RS087','RS68'],
            // ['RS087','RS83','RS88','RS91','RS68'],
            // ['RS087','RS83','RS88','RS91','RS70'],
            // ['RS88','RS91', 'RS68'],
            ['RS65','RS67',],
            ['RS086', 'RS087','RS68'],
            ['RS82', 'RS84','RS68'],
            ['RS087','RS91','RS83','RS88', 'RS68'],
          ],
          reverse: { signal: 'RS68', conditions: [['RS69']] }
        },
        LG119: {
          controlledSignal: 'RS70',
          preconditions: [
            // ['RS67','RS82','RS84', 'RS83','RS85','RS101','RS68'],
            // ['RS67','RS68'],
            // ['RS81','RS68'],
            // ['RS086','RS68'],
            // ['RS90', 'RS101'],
            ['RS65','RS67',],
            ['RS086', 'RS087', 'RS68'],
            ['RS82', 'RS84','RS68'],
            ['RS90', 'RS91', 'RS68'],
            ['RS83', 'RS88', 'RS68'],
            ['RS90','RS101','RS68']
           


          ],
          reverse: { signal: '', conditions: [['']] }
        },
        LG118: {
          controlledSignal: 'RS70',
          preconditions: [
            // ['RS65','RS82','RS84', 'RS83','RS85','RS101','RS68'],
            // ['RS65','RS68'],
            // ['RS80','RS68'],
            // ['RS087','RS68'],
            // ['RS91', 'RS100'],
            ['RS65','RS67',],
            ['RS086', 'RS087', 'RS68'],
            ['RS82', 'RS84','RS68'],
            ['RS90', 'RS91', 'RS68'],
            ['RS83', 'RS88', 'RS68'],
            ['RS91','RS100','RS68']
           
          ],
          reverse: { signal: '', conditions: [['']] }
        },

         LG129: {
          controlledSignal: 'RS70',
          preconditions: [
            ['RS67','RS65','RS68'],
            ['RS82','RS84'],
            ['RS086','RS087'],
            ['RS90','RS91'],
            ['RS88','RS83'],
            ['RS101','RS100','RS68'],
            ['RS98','RS99'],
            ['RS98','RS104','RS97']

          ],

          reverse: { signal: '', conditions: [['']] }
        },
        LG131: {
          controlledSignal: 'RS70',
          preconditions: [
            ['RS67','RS65','RS68'],
            ['RS82','RS84'],
            ['RS086','RS087'],
            ['RS90','RS91'],
            ['RS88','RS83'],
            ['RS101','RS100','RS68'],
            ['RS98','RS99',],
            // ['RS102','RS94'],
            ['RS99','RS105','RS97']
          ],
          reverse: { signal: '', conditions: [['']] }
        },

        LG147: {
          controlledSignal: 'RS70',
          preconditions: [
            ['RS67','RS65','RS68'],
            ['RS82','RS84'],
            ['RS086','RS087'],
            ['RS90','RS91'],
            ['RS88','RS83'],
            ['RS101','RS100','RS68'],
            ['RS102','RS94'],
            ['RS102']
          ],
          reverse: { signal: '', conditions: [['']] }
        },
        LG138: {
          controlledSignal: 'RS70',
          preconditions: [
           ['RS67','RS65','RS68'],
            ['RS82','RS84'],
            ['RS086','RS087'],
            ['RS90','RS91'],
            ['RS88','RS83'],
            ['RS101','RS100','RS68'],
            ['RS102','RS94'],
            ['RS94']
          ],
          reverse: { signal: '', conditions: [['']] }
        },

      },


      resolutionMap: {
        LG8: ['RS4', 'RS5', 'RS12'],
        LG7: ['RS4', 'RS12', 'RS14'],
        LG11: ['RS5', 'RS6'],
        LG12: ['RS14', 'RS16'],
        LG24: ['RS25', 'RS15'],
        LG25: ['RS17', 'RS27'],
        LG38: ['RS37', 'RS26', 'RS25'],
        LG39: ['RS26', 'RS27', 'RS39'],
        LG45: ['RS37', 'RS38', 'RS45'],
        LG46: ['RS38', 'RS45', 'RS39'],
        LG75: ['RS62', 'RS60','RS58','RS63'],
        LG74: ['RS63', 'RS58', 'RS59', 'RS61'],
        LG77: ['RS62', 'RS66'],
        LG76: ['RS61', 'RS64'],
        LG88: ['RS67', 'RS81'],
        LG91: ['RS65', 'RS80'],
        LG100: ['RS81', 'RS82', 'RS84', 'RS086'],
        LG99: ['RS80', 'RS82', 'RS84', 'RS087'],
        LG107: ['RS087', 'RS83', 'RS88', 'RS91'],
        LG108: ['RS086', 'RS83', 'RS88', 'RS90'],
        LG119: ['RS90', 'RS101'],
        LG118: ['RS91', 'RS100'],
        LG129: ['RS97', 'RS98','RS104'],
        LG131: ['RS97', 'RS99','RS105'],
        LG147: ['RS102'],
        LG138: ['RS94']

      }
    }
  },
  /* =====================================================
     🟡 GILDUICOM (LOGIC READY, REVERSE EMPTY)
  ===================================================== */
  HSR_Board: {
    normalMode: [
      {
        controlledSignal: 'RS8',
        preconditions: [['RS1'],
        ['RS2'],
        ['RS5'],
        ['RS7'],


        ],
        reverse: { signal: '', conditions: [[]] } // 👈 future
      },
      {
        controlledSignal: 'RS011',
        preconditions: [['RS18'],
        ['RS15'],
        ['RS9'],
        ],
        reverse: { signal: '', conditions: [] }
      },

      {
        controlledSignal: 'RS56',
        preconditions: [['RS53'],
        ['RS54'],
        ['RS152'],
        ],
        reverse: { signal: '', conditions: [] }
      },
      {
        controlledSignal: 'RS57',
        preconditions: [['RS55'],
        ['RS66', 'RS65'],
        ['RS060'],
        ['RS64'],
        ],
        reverse: { signal: '', conditions: [] }
      }
    ],

    faultMode: {
      preconditions: {
        LG2: {
          controlledSignal: 'RS8',
          preconditions: [['RS7', 'RS20'],
          ['RS5', 'RS20'],
          ['RS2', 'RS20']
          ],
          reverse: { signal: 'RS011', conditions: [['RS20']] }
        },

        LG3: {
          controlledSignal: 'RS8',
          preconditions: [['RS7', 'RS20'],
          ['RS5', 'RS20'],
          ['RS2', 'RS5', 'RS20']],
          reverse: { signal: 'RS011', conditions: [['RS20']] }
        },

        LG4: {
          controlledSignal: 'RS8',
          preconditions: [
            ['RS5', 'RS7', 'RS20'],
            ['RS7']
            

          ],
          reverse: { signal: 'RS011', conditions: [['RS20']] }
        },

        LG024: {
          controlledSignal: 'RS011',
          preconditions: [
            ['RS9', 'RS20'],
            ['RS15', 'RS20']

          ],
          reverse: { signal: 'RS8', conditions: [['RS20']] }
        },
        LG025: {
          controlledSignal: 'RS011',
          preconditions: [
            ['RS9', 'RS15', 'RS20'],
            ['RS9']

          ],
          reverse: { signal: 'RS8', conditions: [['RS20']] }
        },

        LG32: {
          controlledSignal: 'RS45',
          preconditions: [
            ['RS042'],
            ['RS40'],
            ['RS39'],
            ['RS037']

          ],
          reverse: { signal: '', conditions: [] }
        },

        LG33: {
          controlledSignal: 'RS45',
          preconditions: [
            ['RS042'],
            ['RS40'],
            ['RS39']
          ],
          reverse: { signal: '', conditions: [] }
        },

        LG40: {
          controlledSignal: 'RS45',
          preconditions: [['RS042'],
          ['RS40'],
          ],
          reverse: { signal: '', conditions: [] }
        },
        LG44: {
          controlledSignal: 'RS45',
          preconditions: [['RS042']],
          reverse: { signal: '', conditions: [] }
        },
        LG49: {
          controlledSignal: 'RS44',
          preconditions: [['RS46']],
          reverse: { signal: '', conditions: [] }
        },

        LG57: {
          controlledSignal: 'RS44',
          preconditions: [['RS46'],
          ['RS49'],
          ['RS50']],
          reverse: { signal: '', conditions: [] }
        },

        LG53: {
          controlledSignal: 'RS44',
          preconditions: [['RS46'],
          ['RS49']],
          reverse: { signal: '', conditions: [] }
        },

        LG62: {
          controlledSignal: 'RS56',
          preconditions: [['RS54'],
          ['RS53']],
          reverse: { signal: '', conditions: [] }
        },
        LG63: {
          controlledSignal: 'RS56',
          preconditions: [['RS54']],
          reverse: { signal: '', conditions: [] }
        },
        LG64: {
          controlledSignal: 'RS57',
          preconditions: [['RS55']],
          reverse: { signal: '', conditions: [] }
        },

        LG75: {
          controlledSignal: 'RS57',
          preconditions: [
            ['RS55'],
            ['RS060'],
            ['RS64']

          ],

          reverse: { signal: '', conditions: [] }
        },

        LG65: {
          controlledSignal: 'RS57',
          preconditions: [
            ['RS55'],
            ['RS060']
          ],
          reverse: { signal: '', conditions: [] }
        },
      },

      resolutionMap: {
        LG2: ['RS2'],
        LG3: ['RS5','RS2'],
        LG024: ['RS15'],
        LG32: ['RS037'],
        LG33: ['RS39','RS037'],
        LG40: ['RS40','RS39'],
        LG44: ['RS042', 'RS40'],
        LG57: ['RS50'],
        LG53: ['RS49','RS50'],
        LG62: ['RS53'],
        LG75: ['RS64'],
        LG65: ['RS060','RS64'],
        LG4: ['RS5', 'RS7'],
        LG025: ['RS9', 'RS15'],
        LG49: ['RS46', 'RS49'],
        LG63: ['RS54', 'RS53'],
        LG64: ['RS55', 'RS060'],
      }
    }
   },
    
  
     Branch_Line_Board: {
       normalMode: [
      {
        controlledSignal: 'RS19',
        preconditions: [['RS34'],
        ['RS28'],
        ],
        reverse: { signal: '', conditions: [[]] } // 👈 future
      },
      {
        controlledSignal: 'RS19',
        preconditions: [['RS29'],
        ['RS33'],
        ],
        reverse: { signal: '', conditions: [[]] } // 👈 future
      },
      {
        controlledSignal: 'RS58',
        preconditions: [['RS00046'],
        ['RS044'],
        ],
        reverse: { signal: '', conditions: [[]] } // 👈 future
      },
      {
        controlledSignal: 'RS58',
        preconditions: [['RS00049'],
        ['RS47'],
        ],
        reverse: { signal: '', conditions: [[]] } // 👈 future
      },
      
      {
        controlledSignal: 'RS8',
        preconditions: [['RS1'],
        ['RS2'],
        ['RS5'],
        ['RS7'],


        ],
        reverse: { signal: '', conditions: [[]] } // 👈 future
      },
      {
        controlledSignal: 'RS8',
        preconditions: [['RS1'],
        ['RS2'],
        ['RS5'],
        ['RS7'],

        ],
        reverse: { signal: '', conditions: [[]] } // 👈 future
      }
    ],

    faultMode: {
      preconditions: {
        LG1: {
          controlledSignal: 'RS18',
          preconditions: [
            ['RS25', 'RS24'],
            ['RS25', 'RS25', 'RS16', 'RS82'],
            ['RS15'],
            ['RS14'],
            ['RS12'],
            ['RS10'],
            ['RS09']
          ],
          reverse: { signal: 'RS19', conditions: [['RS82']] }
        },
        LG2: {
          controlledSignal: 'RS18',
          preconditions: [
            ['RS25', 'RS24'],
            ['RS25', 'RS25', 'RS16', 'RS82'],
            ['RS15'],
            ['RS14'],
            ['RS12']
          ],
          reverse: { signal: 'RS19', conditions: [['RS82']] }
        },
        LG4: {
          controlledSignal: 'RS18',
          preconditions: [
            ['RS25', 'RS24'],
            ['RS25', 'RS16', 'RS82'],
            ['RS15'],
            ['RS14']
          ],
          reverse: { signal: 'RS19', conditions: [['RS82']] }
        },
        LG9: {
          controlledSignal: 'RS18',
          preconditions: [['RS24', 'RS16'],
          ['RS24', 'RS25'],
          ],
          reverse: { signal: 'RS19', conditions: [['RS82']] }
        },
        LG056: {
          controlledSignal: 'RS71',
          preconditions: [
            ['RS66', 'RS70'],
            ['RS62', 'RS70'],
            ['RS078', 'RS70'],
            ['RS079', 'RS70'],
            ['RS80', 'RS70'],

          ],
          reverse: { signal: 'RS72', conditions: [['RS70']] }
        },
        LG055: {
          controlledSignal: 'RS71',
          preconditions: [
            ['RS66', 'RS70'],
            ['RS62', 'RS70'],
            ['RS078', 'RS70'],
            ['RS079', 'RS70'],
            // ['RS80','RS70'],

          ],
          reverse: { signal: 'RS72', conditions: [['RS70']] }
        },
        LG054: {
          controlledSignal: 'RS71',
          preconditions: [
            ['RS66', 'RS70'],
            ['RS62', 'RS70'],
            ['RS078', 'RS70']
          ],
          reverse: { signal: 'RS72', conditions: [['RS70']] }
        },
        LG51: {
          controlledSignal: 'RS71',
          preconditions: [
            ['RS66', 'RS70'],
            ['RS62', 'RS70'],
            
          ],
          reverse: { signal: 'RS72', conditions: [['RS70']] }
        },
        LG47: {
          controlledSignal: 'RS72',
          preconditions: [
            ['RS69', 'RS70'],
            ['RS63', 'RS70']
          ],
          reverse: { signal: 'RS72', conditions: [['RS70']] }
        },
        LG18: {
          controlledSignal: 'RS18',
          preconditions: [
            ['RS25', 'RS24'],
            ['RS25', 'RS16', 'RS82'],
            ['RS15'],
            ['RS013'],
            ['RS40']
          ],
          reverse: { signal: 'RS19', conditions: [['RS82']] }
        },

        LG23: {
          controlledSignal: 'RS58',
          preconditions: [['RS046'],
          ['RS55', 'RS52'],
          ['RS55', 'RS53'],
          ['RS55', 'RS51']],
          reverse: { signal: '', conditions: [['']] }
        },
        LG22: {
          controlledSignal: 'RS58',
          preconditions: [['RS044'],
          ['RS55', 'RS52'],
          ['RS55', 'RS53'],
          ['RS55', 'RS51']],
          reverse: { signal: '', conditions: [['']] }
        },
        LG40: {
          controlledSignal: 'RS58',
          preconditions: [['RS049'],
          ['RS50'],
          ['RS55', 'RS52'],
          ['RS55', 'RS53'],],
          reverse: { signal: '', conditions: [['RS']] }
        },
        LG38: {
          controlledSignal: 'RS58',
          preconditions: [
            ['RS50'],
            ['RS50'],
            ['RS55', 'RS52'],
            ['RS55', 'RS53'],
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },
        LG42: {
          controlledSignal: 'RS58',
          preconditions: [
            ['RS55','RS53'],
             ['RS55','RS53','RS43','RS51','RS50'],
            ['RS55','RS53','RS51'],
            ['RS55','RS51'],
            ['RS55','RS044'],
          
            
          ],
          reverse: { signal: 'RS70', conditions: [['RS']] }
        },
        LG018: {
          controlledSignal: 'RS18',
          preconditions: [
            ['RS25', 'RS24'],
            ['RS25', 'RS16', 'RS82'],
            ['RS15'],
            ['RS013']
          ],
          reverse: { signal: 'RS19', conditions: [['RS82']] }

        },

        LG39: {
          controlledSignal: 'RS58',
          preconditions: [
            ['RS55', 'RS53'],
            ['RS55', 'RS51', 'RS43', 'RS50', 'RS50', 'RS47'],
            ['RS53', 'RS43', 'RS50', 'RS50', 'RS47'],
            ['RS50', 'RS47'],
            ['RS50'],
            ['RS47']
          ],
          reverse: { signal: 'RS70', conditions: [['RS']] }
        },
        LG46: {
          controlledSignal: 'RS57',
          preconditions: [
            ['RS54'],

          ],
          reverse: { signal: 'RS70', conditions: [['RS']] }
        },
        LG48: {
          controlledSignal: 'RS72',
          preconditions: [
            ['RS69', 'RS70'],
          ],

          reverse: { signal: 'RS70', conditions: [['RS']] }
        },

        LG49: {
          controlledSignal: 'RS71',
          preconditions: [['RS66', 'RS70']],
          reverse: { signal: 'RS70', conditions: [['RS']] }
        },
        LG53: {
          controlledSignal: 'RS71',
          preconditions: [
            ['RS66', 'RS70'],
            ['RS62', 'RS70']
          ],
          reverse: {
            signal: 'RS70', conditions: [['RS']]

          }
        },
        LG5: {
          controlledSignal: 'RS18',
          preconditions: [
            ['RS25', 'RS24'],
            ['RS24', 'RS16', 'RS82'],
            ['RS25', 'RS24', 'RS16', 'RS82'],
            ['RS25', 'RS16'],
            ['RS25', 'RS15']
          ],
          reverse: { signal: 'RS70', conditions: [['RS']] }
        },

        LG11: {
          controlledSignal: 'RS19',
          preconditions: [['RS27', 'RS30', 'RS32', 'RS82'],
          ['RS26', 'RS27', 'RS82'],
          ['RS27', 'RS29', 'RS82'],
          ['RS27', 'RS29', 'RS19']],
          reverse: { signal: 'RS70', conditions: [['RS']] }
        },
        LG10: {
          controlledSignal: 'RS19',
          preconditions: [['RS26', 'RS30', 'RS32', 'RS82'],
          ['RS26', 'RS27', 'RS82'],
          ['RS26', 'RS28', 'RS82'],
          ['RS26', 'RS28', 'RS19']],
        reverse: { signal: 'RS70', conditions: [['RS']] }
        },
        LG013: {
          controlledSignal: 'RS19',
          preconditions: [
            ['RS26', 'RS30', 'RS32', 'RS82'],
            ['RS26', 'RS27', 'RS82'],
            ['RS28', 'RS30', 'RS32', 'RS82'],
            ['RS28', 'RS30', 'RS32', 'RS19']
          ],
          reverse: { signal: 'RS18', conditions: [['RS82']] }
        },
        LG12: {
          controlledSignal: 'RS19',
          preconditions: [['RS27', 'RS30', 'RS32', 'RS82'],
          ['RS27', 'RS26', 'RS82'],
          ['RS29', 'RS30', 'RS32', 'RS82'],
          ['RS29', 'RS30', 'RS32', 'RS19']],
          reverse: { signal: 'RS18', conditions: [['RS82']] }
        },
        LG19: {
          controlledSignal: 'RS58',
          preconditions: [
            ['RS55', 'RS53'],
            ['RS55', 'RS53', 'RS43', 'RS50'],
            ['RS53', 'RS50'],
            ['RS53', 'RS43'],
            ['RS43']
          ],
          reverse: { signal: 'RS18', conditions: [['RS82']] }
        },


      },
      resolutionMap: {
        LG1: ['RS09', 'RS2'],
        LG2: ['RS10', 'RS12'],
        LG4: ['RS12', 'RS14'],
        LG9: ['RS16', 'RS24'],
        LG056: ['RS80', 'RS81'],
        LG054: ['RS078', 'RS079'],
        LG51: ['RS62', 'RS078'],
        LG013: ['RS28', 'RS30', 'RS32'],
        LG12: ['RS29', 'RS30', 'RS32'],
        LG11: ['RS29', 'RS27'],
        LG10: ['RS26', 'RS28'],
        LG47: ['RS63'],
        LG18: ['RS40', 'RS0041'],
        LG22: ['RS044'],
        LG40: ['RS049'],
        LG38: ['RS50','RS47'],
        LG42: ['RS55', 'RS51', 'RS044'],
        LG018: ['RS013', 'RS40'],
        LG39: ['RS47'],
        LG46: ['RS54'],
        LG48: ['RS69', 'RS63'],
        LG49: ['RS66', 'RS62'],
        LG53: ['RS62','RS078'],
        LG055: ['RS079', 'RS80'],
        LG19: ['RS43', 'RS0041'],
        LG20: ['RS060', 'RS71'],
        LG15: ['RS35', 'RS34'],
        LG16: ['RS33', 'RS060', 'RS74'],
        LG5: ['RS15', 'RS25'],
      }
    }
  },


  Main_Line_Board: {
    normalMode: [
      // {
      //   controlledSignal: 'RS6',
      //   preconditions: [['RS011', 'RS13'],
      //   ['RS04', 'RS03'],
      //   ['RS4', 'RS3'],
      //   ['RS26'],
      //   ['RS27'],
      //   ['RS28'],
      //   ['RS17', 'RS18'],
      //   ['RS19', 'RS20'],
      //   ['RS41', 'RS16'],
      //   ],
      //   reverse: { signal: '', conditions: [[]] } // 👈 future
      // },
      // {
      //   controlledSignal: 'RS26',
      //   preconditions: [['RS011', 'RS13'],
      //   ['RS04', 'RS03'],
      //   ['RS4', 'RS3'],
      //   ['RS10'],
      //   ['RS6'],
      //   ['RS08'],
      //   ['RS17', 'RS18'],
      //   ['RS19', 'RS20'],
      //   ['RS41', 'RS16'],
      //   ],
      //   reverse: { signal: '', conditions: [[]] } // 👈 future
      // },
      // {
      //   controlledSignal: 'RS30',
      //   preconditions: [['RS00065'],
      //   ['RS35'],
      //   ['RS014']
      //   ],
      //   reverse: { signal: '', conditions: [[]] } // 👈 future
      // },
      // {
      //   controlledSignal: 'RS30',
      //   preconditions: [['RS65'],
      //   ['RS33'],
      //   ['RS060']
      //   ],
      //   reverse: { signal: '', conditions: [[]] } // 👈 future
      // },
      // {
      //   controlledSignal: 'RS30',
      //   preconditions: [['RS0064'],
      //   ['RS35'],
      //   ['RS014']
      //   ],
      //   reverse: { signal: '', conditions: [[]] } // 👈 future
      // },
      // {
      //   controlledSignal: 'RS30',
      //   preconditions: [['RS0061'],
      //   ['RS33'],
      //   ['RS060']
      //   ],
      //   reverse: { signal: '', conditions: [[]] } // 👈 future
      // },
       {
        controlledSignal: 'RS92',
        preconditions: [['RS048'],
        ['RS82']
        ],
        reverse: { signal: '', conditions: [[]] } // 👈 future
      },
      {
        controlledSignal: 'RS92',
        preconditions: [['RS049'],
        ['RS81']
        ],
        reverse: { signal: '', conditions: [[]] } // 👈 future
      },
      {
        controlledSignal: 'RS92',
        preconditions: [['RS044'],
        ['RS43','RS42'],
        ['RS82']
        ],
        reverse: { signal: '', conditions: [[]] } // 👈 future
      },
      
    ],

    faultMode: {
      preconditions: {
        LG1: {
          controlledSignal: 'RS26',
          preconditions: [
            ['RS23', 'RS21'],
            ['RS20', 'RS19'],
            ['RS18', 'RS17'],
            ['RS16', 'RS41'],
            ['RS041', 'RS16', 'RS0016']
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }

        },
        LG3: {
          controlledSignal: 'RS6',
          preconditions: [
            ['RS3', 'RS4'],
            ['RS3', 'RS4', 'RS12', 'RS15'],
            ['RS3', 'RS12', 'RS15'],
            ['RS3', 'RS13'],

          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },
       LG4: {
          controlledSignal: 'RS6',
          preconditions: [['RS4', 'RS3', 'RS12', 'RS15'],
          ['RS4', 'RS3'],
          ['RS4', 'RS12', 'RS15'],
          ['RS4', 'RS011'],

          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },


       LG5: {
          controlledSignal: 'RS6',
          preconditions: [['RS3', 'RS4', 'RS12', 'RS15'],
          ['RS3', 'RS12', 'RS15'],
          ['RS3', 'RS4'],
          ['RS13', 'RS12', 'RS15']
          ],
          reverse: { signal: 'RS19', conditions: [['RS82']] }
        },

        LG6: {
          controlledSignal: 'RS6',
          preconditions: [['RS4', 'RS3'],
          ['RS4', 'RS12', 'RS15'],
          ['RS011', 'RS12', 'RS15']
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },

        LG8: {
          controlledSignal: 'RS26',
          preconditions: [
          ['RS21', 'RS23'],
          ['RS19', 'RS20'],
          ['RS17', 'RS18'],
          ['RS41', 'RS16'],
          ['RS41','RS041','RS0016']
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },
        LG9: {
          controlledSignal: 'RS26',
          preconditions: [
          ['RS21', 'RS23'],
          ['RS19','RS20'],
          ['RS17','RS18'],
          ['RS17', 'RS16']

          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },

         LG10: {
          controlledSignal: 'RS26',
          preconditions: [
          ['RS21', 'RS23'],
          ['RS19','RS20'],
          ['RS17','RS18'],
          ['RS18', 'RS41']
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },
         LG11: {
          controlledSignal: 'RS26',
          preconditions: [
            ['RS21', 'RS23'],
            ['RS23', 'RS20'],

          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },
        LG12: {
          controlledSignal: 'RS26',
          preconditions: [
            ['RS21', 'RS23'],
            ['RS21', 'RS19'],

          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },

        LG13: {
          controlledSignal: 'RS30',
          preconditions: [
            ['RS24', 'RS25', 'RS039'],
            ['RS24','RS014', 'RS060', 'RS74','RS34','RS36', 'RS37'],
            ['RS24', 'RS36', 'RS35']

          ],
          reverse: { signal: 'RS', conditions: [['RS']] }

        },

        LG14: {
          controlledSignal: 'RS30',
          preconditions: [
            ['RS24', 'RS25', 'RS039'],
            ['RS25','RS014', 'RS060', 'RS74','RS34','RS36', 'RS37'],
            ['RS25', 'RS33', 'RS37']
             ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },

        LG15: {
          controlledSignal: 'RS30',
          preconditions: [
          ['RS24', 'RS25','RS039'],
          ['RS35', 'RS33'],
          ['RS24','RS34','RS36','RS74'],
          ['RS74', 'RS014','RS34','RS35']
        ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },

        LG16: {
          controlledSignal: 'RS30',
          preconditions: [   
          ['RS24', 'RS25','RS039'],
          ['RS35', 'RS33'],
          ['RS25','RS34','RS36','RS74'],
          ['RS33','RS34','RS060','RS74']
        ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },

         LG19: {
          controlledSignal: 'RS30',
          preconditions: [
          ['RS24', 'RS25', 'RS039'],
           ['RS35', 'RS33', 'RS039'],
            ['RS34', 'RS74', 'RS039'],
            ['RS014','RS060','RS039'],
            ['RS77', 'RS60', 'RS014']

          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },

        LG20: {
          controlledSignal: 'RS30',
          preconditions: [
           ['RS24', 'RS25', 'RS039'],
            ['RS35', 'RS33', 'RS039'],
            ['RS34', 'RS74', 'RS039'],
            ['RS014','RS060','RS039'],
            ['RS060', 'RS60', 'RS71']
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },

        LG020: {
          controlledSignal: 'RS30',
          preconditions: [
            ['RS24', 'RS25', 'RS039'],
            ['RS35', 'RS33', 'RS039'],
            ['RS34', 'RS74', 'RS039'],
            ['RS014','RS060','RS039'],
            ['RS0010', 'RS0009']
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },
        LG21: {
          controlledSignal: 'RS30',
          preconditions: [
           ['RS24', 'RS25', 'RS039'],
            ['RS35', 'RS33', 'RS039'],
            ['RS34', 'RS74', 'RS039'],
            ['RS014','RS060','RS039'],
            ['RS76','RS0009']
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },


        LG22: {
          controlledSignal: 'RS91',
          preconditions: [
             ['RS87','RS89','RS97'],
             ['RS87','RS066','RS0079','RS97'],
             ['RS068','RS67','RS97'],
             ['RS068','RS066','RS0079']
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },
         LG23: {
          controlledSignal: 'RS91',
          preconditions: [
            ['RS87','RS89','RS97'],
            ['RS89','RS066','RS0079','RS97'],
            ['RS068','RS67','RS97'],
            ['RS67','RS066','RS0079']

          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },
        LG24: {
          controlledSignal: 'RS91',
          preconditions: [
            ['RS87','RS89','RS97'],
            ['RS89','RS066','RS0079'],
            ['RS89','RS67']

          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },
        LG27: {
          controlledSignal: 'RS91',
          preconditions: [
            ['RS87','RS89','RS97'],
            ['RS87','RS066','RS0079'],
            ['RS87','RS068']

          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },
         LG28: {
          controlledSignal: 'RS92',
          preconditions: [
            ['RS88', 'RS90','RS97'],
            ['RS88', 'RS86',]
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },
        LG29: {
          controlledSignal: 'RS92',
          preconditions: [
            ['RS88', 'RS90','RS97'],
            ['RS90', 'RS85',]
          ],

          reverse: { signal: 'RS', conditions: [['RS']] }
        },
        LG30: {
          controlledSignal: 'RS92',
          preconditions: [
          ['RS88', 'RS90','RS97'],
          ['RS86','RS85'],
          ['RS83','RS84'],
          ['RS83','RS82']
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },
        LG31: {
          controlledSignal: 'RS92',
          preconditions: [
          ['RS88', 'RS90','RS97'],
          ['RS86','RS85'],
          ['RS83','RS84'],
          ['RS84','RS81']
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },
        LG32: {
          controlledSignal: 'RS92',
          preconditions: [
            ['RS90', 'RS88','RS97'],
            ['RS81', 'RS82','RS97'],
             ['RS86','RS85','RS97'],
            ['RS84','RS83','RS97'],
            ['RS80', 'RS82', 'RS58'],
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },

        LG35: {
          controlledSignal: 'RS92',
          preconditions: [
          ['RS90', 'RS88','RS97'],
           ['RS86','RS85','RS97'],
            ['RS84','RS83','RS97'],  
          ['RS81', 'RS82','RS97'],
          ['RS55','RS48']
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },

         LG37: {
          controlledSignal: 'RS92',
          preconditions: [
            ['RS90', 'RS88','RS97'],
            ['RS86','RS85','RS97'],
            ['RS84','RS83','RS97'],
            ['RS81', 'RS82','RS97'],
            ['RS54','RS48']
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },

         LG40: {
          controlledSignal: 'RS92',
          preconditions: [
             ['RS90', 'RS88','RS97'],
            ['RS86','RS85','RS97'],
            ['RS84','RS83','RS97'],
            ['RS81', 'RS82','RS97'],
            ['RS53','RS42']
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },

       LG41: {
          controlledSignal: 'RS92',
          preconditions: [
            ['RS90', 'RS88','RS97'],
             ['RS86','RS85','RS97'],
            ['RS84','RS83','RS97'],
            ['RS81', 'RS82','RS97'],
            ['RS45','RS43','RS81','RS80']
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }

        },

       LG054: {
          controlledSignal: 'RS30',
          preconditions: [
           ['RS24', 'RS25', 'RS039'],
            ['RS35', 'RS33', 'RS039'],
            ['RS34', 'RS74', 'RS039'],
            ['RS014','RS060','RS039'],
            ['RS70','RS62']
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },

       
        LG055: {
          controlledSignal: 'RS30',
          preconditions: [
            ['RS24', 'RS25', 'RS039'],
             ['RS35', 'RS33', 'RS039'],
            ['RS34', 'RS74', 'RS039'],
            ['RS014','RS060','RS039'],
            ['RS69','RS62']
          ],
          reverse: { signal: 'RS', conditions: [['RS']] }
        },

        
      },
      
      resolutionMap: {
        LG1: ['RS16','RS041','RS0016'],
        LG3: ['RS3', 'RS13'],
        LG4: ['RS4', 'RS011'],
        LG5: ['RS13', 'RS12', 'RS15'],
        LG6: ['RS011', 'RS12', 'RS15'],
        LG8: ['RS41','RS041','RS0016'],
        LG9: ['RS17','RS16'],
        LG10: ['RS18','RS41'],
        LG11: ['RS20', 'RS23'],
        LG12: ['RS21', 'RS19'],
        LG13: ['RS24', 'RS35', 'RS36'],
        LG14: ['RS25', 'RS33', 'RS37'],
        LG15: ['RS35', 'RS34','RS74','RS014'],
        LG16: ['RS33', 'RS060', 'RS74','RS34'],
        LG19: ['RS77', 'RS60', 'RS014'],
        LG20: ['RS060', 'RS71','RS60'],
        LG020: ['RS0010','RS0009'],
        LG21: ['RS0009', 'RS76'],
        LG22: ['RS068','RS066','RS0079'],
        LG23: ['RS67','RS066','RS0079'],
        LG24: ['RS89', 'RS67'],
        LG27: ['RS87', 'RS068'],
        LG28: ['RS88', 'RS86'],
        LG29: ['RS85', 'RS90'],
        LG30: ['RS82', 'RS83'],
        LG31: ['RS81', 'RS84'],
        LG32: ['RS80', 'RS82','RS58'],
        LG35: ['RS48', 'RS55'],
        LG37: ['RS54', 'RS48'],
        LG39: ['RS81'],
        LG40: ['RS53', 'RS42'],
        LG41: ['RS45', 'RS81','RS80','RS43'],
        LG45: ['RS49'],
        LG054: ['RS70','RS62'],
        LG055: ['RS69', 'RS62'],
        
        
       

      }
    }
  }


};



function addCustomPropsToObject(obj: fabric.Object) {
  // assign .type and any custom props if missing.
  // For group objects: propagate type, customId, etc. to group level.
  if (obj.type === 'group' || obj.type === 'redSignal' || obj.type === 'redSignalH') {
    if (!('type' in obj) || !(obj as any).type) {
      // If possible, infer from children or set via serialized data
      (obj as any).type = guessTypeFromContent(obj);
    }
    // For your icons, always set .type when constructing AND when deserializing
  }
}

function isRedSignal(obj: fabric.Object): boolean {
  const anyObj = obj as any;
  let type = anyObj.type;
  if (!type || type.toLowerCase() === 'group') {
    type = guessTypeFromContent(obj);
  }
  return type === 'redSignal';
}



function guessTypeFromContent(obj: fabric.Object): string {
  if (obj.type.toLowerCase() === 'group') {
    const children = (obj as any).getObjects?.() ?? [];
    if (children.length === 3 &&
      children.some((o: any) => o.fill === '#8B0000' || o.fill === 'green') &&
      children.some((o: any) => o.fill === 'white')) {
      return 'redSignal';
    }
    return 'group';
  }
  return obj.type || '';
}

interface UserAction {
  id: string;
  displayName: string;
  action: 'open' | 'close' | 'trip';
  timestamp: number;
}





function getRandomShortId(length = 3) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
})
export class CanvasComponent implements OnInit, OnDestroy {  // ✅ OnDestroy ADD
  @ViewChild('canvas', { static: true }) canvasElement!: ElementRef<HTMLCanvasElement>;
  canvas!: fabric.Canvas;
  deleteZone!: fabric.Rect;
  deleteText!: fabric.Text;

  //Stores loaded circuits and the currently selected one.

  sessionId: number = 0;      // Tracks the current fault session
  faultLine: string | undefined;      // Tracks which fault line is active ("LG8", "LG7", etc.)
  faultResolved: boolean = false;
  userActions: string[] = [];
  // 🔥 Phase-2 session control
  pendingSessionId: string | null = null;
  pendingAdminId: string | null = null;
  showFaultRequestPopup = false;

  idPopupVisible: boolean = false;
  circuits: any[] = [];
  selectedCircuitId: number | null = null;
  redSignalDisplayMap: { [key: string]: string } = {

  };
  connectionsMap: Record<string, string[]> = {
    'ID1': ['LB21', 'LB12'],
    'ID2': ['LB13', 'LB14']
  };
  sw1Ref!: fabric.Group;         // Reference to the SW1 group on canvas
  joinLineRef!: fabric.Line;

  // Popup controls UI flags and data for adding icons.

  showIconInputPopup = false;
  inputIconId: string = '';
  inputIconLabel: string = '';
  public iconToAddType: string | null = null;
  isCanvasLoading: boolean = false; // ✅ Yeh add karo
  detailedUserActions: UserAction[] = [];  // 🔥 YE NAYA ADD

  username: string = sessionStorage.getItem('username') || 'User';

  // Logic Add Mode properties (TOP of class ke saath add karo)
  // Logic Add Mode properties
  isLogicAddMode = false;
  logicRules: LineRule[] = [];
  currentRuleIndex = 0;
  showLogicEditor = false;
  logicEditorX = 20;
  logicEditorY = 120;
  isDraggingEditor = false;

  rsChips: string[] = [];    // RS values (with operators)
  lgChips: string[] = [];    // LG values
  currentRuleWhen = '';      // Combined RS string


  // ID counters for autogenerated IDs per icon type
  // Keeps track of auto - increment IDs for each type of icon added.

  private iconIdCounters: Record<string, number> = {
    ground: 0,
    lineR: 0,
    lineG: 0,
    lineB: 0,
    star: 0,
    switch: 0,
    trackjoin: 0,
    redSignal: 0,
    redSignalH: 0,
    diagonalCaution: 0,
    capacitor: 0,
    twocircle: 0,
    triangle: 0,
    zeroShape: 0 // New icon counter

  };

  private sseConnection: EventSource | null = null;  // ✅ NEW


  //For tooltips and tracks number of circuit slots allowed.
  private activeTooltip: fabric.Text | null = null;
  savedCanvasJSONs: string[] = []; // optional backup
  MAX_SLOTS = 3;

  //for text on canvas
  addTextPopupVisible: boolean = false;
  inputTextValue: string = '';
  circuitsRaw: any[] = []; // <-- add this line!


  constructor(private http: HttpClient, private circuitService: CircuitService, private router: Router, private route: ActivatedRoute) { }

  //popup position for canvas redsignal tap
  // popupVisible = false;
  popupX = 0;
  popupY = 0;
  popupVisible: boolean = false;
  popupIcon: fabric.Object | null = null;
  popupType: string = '';
  popupId: string = '';
  popupLabel: string = '';
  popupSignalId: string | null = null;
  private circuitSubscription!: Subscription;


  private pendingFaultActivation = false;

  //यह map रखेगा की कौन-से redSignal की ID से कौन-सी lines की IDs जुड़ी हैं।
  redSignalLineMap: Record<string, string[]> = {};

  redSignalLineOverrideMap: Record<string, string[]> = {};
  overrideActivatedSignals: Set<string> = new Set();
  overrideRecentlyOpened: Set<string> = new Set();

  switchLineMap: Record<string, { lines: string[], swRef?: fabric.Group, joinLineRef?: fabric.Line }> = {
    'SW1': { lines: ['LG8', 'LG11'] },
    'SW2': { lines: ['LG7', 'LG12'] },
    'SW3': { lines: ['LG38', 'LG45'] },
    'SW4': { lines: ['LG39', 'LG46'] },
    'SW5': { lines: ['LG24', 'LG38'] },
    'SW6': { lines: ['LG25', 'LG39'] },
  };

  // Currently closed signals track करने के लिए set
  private closedSignals: Set<string> = new Set();
  boardRules: LineRule[] = []; 
  activeCircuitRule: CircuitRuleSet | null = null;


  // हर line पर affect करने वाले signals का reverse map बनाना होगा
  private linesSignalsMap: Record<string, Set<string>> = {};

  redSignalStateMap: Record<string, 'open' | 'close'> = {}; // id => state

  // Tracks open/close state for close-type red signals (closeHorizontal/closeVertical)
  closeTypeSignalStateMap: Record<string, boolean> = {};

  private selectedCircuitName: string = '';
  selectedCircuitNames: string | null = null;

  isRedSignalPopupEnabled = true;  // NEW: Red signal popup control



  popupTitle: string = '';




  // Example: Customize as per circuit design
  private signalToLinesMap: Record<string, string[]> = {
    'CK4': ['YNE', 'LB1'],      // RS1 close होने पर LG1 line affect होगी
    'RS2': ['45V'],             // RS2 close होने पर भी LG1 affect होगी
    'RS1': ['LB1', 'LR1'],      // RS3 का अपना अलग effect
    // Add all your signals and linked lines here
  };


  // Backend test: Ensures server is responsive.
  // Load circuits: Populates the UI with existing circuits.
  // Fabric canvas: Prepares the main drawing area.
  // Delete zone: UI for drag - to - delete.
  // Delete text: Label for delete zone.
  // Add these objects to canvas and connects input handling logic:
  // setupDeleteOnDrop – handles drag - to - delete and angle labels.
  // setupBuildCompleteIconClick – handles popup display for “build complete” state.


  ngOnInit(): void {
    this.connectSSE();  // ✅ PROPER METHOD CALL
    this.circuitSubscription =
      this.circuitService.selectedCircuit$.subscribe(name => {
        console.log('📥 Canvas subscription fired');
        console.log('📛 Received circuit name from service:', name);

        if (!name) return;

        this.selectedCircuitNames = name;

        // 🔥 RELEASE PENDING FAULT
        if (this.pendingFaultActivation) {
          console.log('▶️ Pending fault released after circuit load');
          this.pendingFaultActivation = false;
          this.detectFaultMode();
        }
      });


    // this.isPanelCollapsed = true;

    this.isCanvasLoading = true; // Loader start




    // Setup BroadcastChannel to listen for fault detection trigger from other tabs/windows
    const channel = new BroadcastChannel('fault-detection-channel');
    channel.onmessage = (event) => {
      if (event.data === 'activate-fault-detection') {
        this.detectFaultMode();
      }
    };

    this.route.url.subscribe(urlSegments => {
      const isFaultDetectionTab = urlSegments.some(segment => segment.path === 'fault-detection');
      if (isFaultDetectionTab) {
        this.detectFaultMode();
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'faultDetection') {
        this.detectFaultMode();
      }
    });
    // इस कोड को ngOnInit के सबसे शुरुआत में भी डाल सकते हैं
    fabric.Object.prototype.toObject = (function (toObject) {
      return function (this: fabric.Object, propertiesToInclude?: string[]) {
        propertiesToInclude = (propertiesToInclude || []).concat([
          'permanentId', 'customId', 'customLabel', 'customType', 'originalStroke'
        ]);
        return toObject.call(this, propertiesToInclude);
      };
    })(fabric.Object.prototype.toObject);
    this.circuitService.testBackendConnection().subscribe({
      next: (res) => {
        console.log('✅ Backend connected:', res);
      },
      error: (err) => {
        console.error('❌ Backend connection failed:', err);
      }
    });
    this.circuitService.getDataFromBackend().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.circuitsRaw = data;
          this.circuits = this.circuitsRaw.map((c: any) => {
            let name = '';
            // this.isCanvasLoading = false; // ✅ Data load hone par false

            try {
              const canvasObj = JSON.parse(c.canvasData || c.canvasJson);
              name = canvasObj.name || '';
            } catch (e) {
              console.warn('JSON parse error', e);
            }
            return {
              ...c,
              name
            };
          });


          // ========================Automatic loading canvas for normal mode not for fault detection mode========================
          // const leftCircuit = this.circuits.find(c => c.name === 'Main_Line_Board'); // Replace with your desired circuit name or selection logic
          // if (leftCircuit && (leftCircuit.canvasData || leftCircuit.canvasJson)) {
          //   this.selectedCircuitId = leftCircuit.id;
          //   this.completeCircuitBuild();
          //   // Call your loader with canvas JSON
          //   this.loadCanvasFromJson(leftCircuit.canvasData || leftCircuit.canvasJson); // Pass actual JSON data
          // }
          //==================================================================================================
        } else {
          console.error('Data is not array:', data);
          this.circuitsRaw = [];
          this.circuits = [];
        }
      },
      error: (err) => {
        console.error('Error loading circuits:', err);
        this.isCanvasLoading = false; // ✅ Data load hone par false

      }
    });

    this.canvas = new fabric.Canvas(this.canvasElement.nativeElement, {
      width: 3000,
      height: 1900,
      backgroundColor: '#fff',
    });

    this.deleteZone = new fabric.Rect({
      width: 80,
      height: 40,
      left: 1240,
      top: 630,
      fill: 'rgba(255, 0, 0, 0.3)',
      stroke: 'red',
      strokeWidth: 3,
      selectable: true,
      evented: false
    });

    this.deleteText = new fabric.Text('DLT', {
      left: 1257,
      top: 640,
      fontSize: 24,
      fill: 'red',
      selectable: true,
      evented: true
    });

    this.canvas.add(this.deleteZone, this.deleteText);

    this.setupDeleteOnDrop();
    this.setupBuildCompleteIconClick(); // << ✅ नया CALL
    this.setupLineTapHandler();         // ← YE ADD KARO (line console only)


    this.canvas.on('mouse:down', (e) => {
      const obj = e.target;
      if (!obj) return;
      const id = (obj as any).permanentId;
      const name = (obj as any).customId;
      console.log('PermanentId:', id, 'CustomId:', name);
      // Tum apna custom game logic bhi yahin laga sakte ho...
    });

    this.redSignalLineMap = {
      // 'RS1,RS2': ['LG1', 'LG7'],
      'RS1,RS2': ['LG2', 'LG3', 'LG5'],
      'RS31': ['LG1', 'LG2', 'LG3', 'LG7'],
      'RS1': ['LG1'],
      'RS2': ['LG2'],
      'RS0': ['LG3'],
      'RS3': ['LG4']

    };

    this.redSignalLineOverrideMap = {
      'RS1,RS3': ['LG7', 'LG8', 'LG11', 'LG12'],
      // 'RS2': ['LG2', 'LG3', 'LG5'],
      'RS5,RS6': ['LG2']
    };

    // signalToLinesMap के आधार पर linesSignalsMap बनाते हैं (reverse map)
    this.rebuildMappingsFromCanvas();
    this.updateLineColors();


    // this.loadFromSlot();
  }

  private connectSSE() {
    const userId = sessionStorage.getItem('username');
    if (!userId) return;

    const url = this.circuitService.getUserSseUrl(userId);
    this.sseConnection = new EventSource(url);

    console.log('🔌 SSE Connected for user:', userId);

    // 📨 Admin → fault session request
    this.sseConnection.addEventListener('fault-request', (event: any) => {
      const data = JSON.parse(event.data);
      this.pendingSessionId = data.sessionId;
      this.pendingAdminId = data.adminId;
      this.showFaultRequestPopup = true;

      console.log('📨 Fault request received:', data);
    });

    // 🔥 SINGLE SOURCE OF TRUTH
    this.sseConnection.addEventListener('fault-activated', (event: any) => {
      const data = JSON.parse(event.data);
      this.selectedCircuitNames = data.circuitName;
      this.faultLine = data.line;
      this.circuitService.setSelectedCircuit(data.circuitName);


      // Agar circuits abhi load nahi hue, pending flag set karo
      if (!this.circuits || this.circuits.length === 0) {
        this.pendingFaultActivation = true;
        return;
      }

      this.detectFaultMode();
    });


    this.sseConnection.onerror = () => {
      console.error('❌ SSE error, reconnecting in 3s');
      setTimeout(() => this.connectSSE(), 3000);
    };
  }



  acceptFaultRequest() {
    if (!this.pendingSessionId) return;

    const userId = sessionStorage.getItem('username');
    if (!userId) return;

    this.circuitService.acceptFaultSession({
      sessionId: this.pendingSessionId,
      userId
    }).subscribe(() => {
      console.log('✅ Fault request accepted');
      this.showFaultRequestPopup = false;
    });
  }

  rejectFaultRequest() {
    if (!this.pendingSessionId) return;

    const userId = sessionStorage.getItem('username');
    if (!userId) return;

    this.circuitService.rejectFaultSession({
      sessionId: this.pendingSessionId,
      userId
    }).subscribe(() => {
      console.log('❌ Fault request rejected');
      this.showFaultRequestPopup = false;
      this.pendingSessionId = null;
    });
  }


  ngOnDestroy() {
    if (this.circuitSubscription) {
      this.circuitSubscription.unsubscribe();
    }
    this.disconnectSSE();  // ✅ CLEANUP
  }

  private disconnectSSE() {
    if (this.sseConnection) {
      this.sseConnection.close();
      this.sseConnection = null;
      console.log('🔌 SSE Disconnected');
    }
  }

  showAddTextDialog() {
    this.addTextPopupVisible = true;
    this.inputTextValue = '';
  }

  goToMainPage() {
    this.router.navigate(['']);
  }

  confirmAddText() {
    if (!this.inputTextValue.trim()) return;
    // Create a fabric.Text object, black color, no background.
    const textObj = new fabric.Text(this.inputTextValue, {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: 'black',
      backgroundColor: '', // Transparent
      selectable: true,
      evented: true
    });
    // Custom properties for save/load if needed
    (textObj as any).type = 'canvasText';
    this.canvas.add(textObj);
    this.canvas.renderAll();
    this.addTextPopupVisible = false;
  }
  startTime: number | null = null;
  endTime: number | null = null;
  // private getFaultControlledSignal(circuitName: string, faultLine: string): string | undefined {
  //   return CIRCUIT_RULES?.[circuitName]?.faultMode?.preconditions?.[faultLine]?.controlledSignal;
  // }
  private getFaultControlledSignal(circuitName: string, faultLine: string): string | undefined {
  return this.activeCircuitRule?.faultMode?.preconditions?.[faultLine]?.controlledSignal;
  }


  detectFault() {
    if (!this.faultLine) {
      console.error('❌ Fault line missing');
      return;
    }

    const circuitName = this.selectedCircuitNames; // ensure this has "HSR_Board" / "RBR_Board" etc.
    if (!circuitName) {
      console.error('❌ Circuit name missing');
      return;
    }

    const controlledRS = this.getFaultControlledSignal(circuitName, this.faultLine);

    if (!controlledRS) {
      console.warn('⚠️ No controlledSignal found for', { circuitName, faultLine: this.faultLine });
      return;
    }

    this.faultResolved = false;
    this.startTime = Date.now();
    this.startUITimer();

    console.log('🚨 Fault applied for line:', this.faultLine, 'controlledRS:', controlledRS);
    this.faultRedSignals = [controlledRS];
    this.closedSignals.add(controlledRS);
    this.closeRedSignalsByIds(this.faultRedSignals);

    this.updateLineColors();
    this.canvas.renderAll();
  }



  // =================== Fault Detection State (Feature) ===================
  isFaultDetectionMode: boolean = false;
  faultRedSignals: string[] = [];



  // =================== Fault Detection Feature ===================
  detectFaultMode() {
    console.log('🧪 detectFaultMode() CALLED');
    console.log('📛 selectedCircuitNames =', this.selectedCircuitNames);
    console.log('🔗 faultLine =', this.faultLine);
    console.log('📦 circuits loaded =', this.circuits?.length);

    if (!this.selectedCircuitNames || !this.faultLine) {
      console.warn('⚠️ Missing circuitName or faultLine');
      return;
    }

    if (!this.circuits || this.circuits.length === 0) {
      console.warn('⚠️ Circuits array empty');
      return;
    }
    this.showWelcomePage = false;
    this.isFaultDetectionMode = true;
    this.faultRedSignals = [];
    this.userActions = [];
    this.detailedUserActions = [];  // Reset

    const leftCircuit = this.circuits.find(c => c.name === this.selectedCircuitNames);
    if (!leftCircuit || (!leftCircuit.canvasData && !leftCircuit.canvasJson)) {
      console.warn("⚠️ Circuit not found or no canvas data");
      return;
    }

    this.selectedCircuitId = leftCircuit.id;
    this.selectedCircuitName = this.selectedCircuitNames;  // SET!

    // 🔥 STEP 1: Pre-setup (sync)
    this.completeCircuitBuild();

    // 🔥 STEP 2: ASYNC Load + THEN Fault
    this.loadCanvasFromJson(leftCircuit.canvasData || leftCircuit.canvasJson)
      .then(() => {
        console.log('✅ Canvas fully loaded, objects:', this.canvas.getObjects().length);

        // Post-load setup
        this.startFaultBlinkEffect();
        this.updateLineColors();
        this.canvas.renderAll();
        this.rebuildMappingsFromCanvas();
        this.setupAllSwitchLineToggles();
        this.attachSwitchHandlers();

        // Lock canvas
        this.canvas.getObjects().forEach(obj => {
          if (obj !== this.deleteZone && obj !== this.deleteText) {
            obj.selectable = false;
            obj.evented = true;
            obj.off('mouseover');
            obj.hoverCursor = 'default';
          }
        });

        // 🔥 FINALLY: detectFault AFTER canvas ready
        console.log('🚀 Starting detectFault()');
        this.detectFault();
      })
      .catch(err => {
        console.error('❌ Canvas load failed:', err);
      });
  }


  verificationMessage: string = '';
  timeTaken: number | null = null;

  verifyFaultResolution() {
    if (!this.faultLine || !this.pendingSessionId) {
      console.error('❌ Fault line missing');
      return;
    }

    this.stopUITimer();

    console.log("🧾 Sending verification request:", this.faultLine, this.userActions);

    // Convert RS IDs → readable labels
    const readableSequence = this.detailedUserActions.map(action =>
      `${action.displayName} ${action.action} ${action.timestamp}`
    );
    const userActionSequence = this.detailedUserActions.map(action => ({
      action: action.action,
      displayName: action.displayName,
      timestamp: action.timestamp
    }));
    console.log("🔍 Readable sequence:", readableSequence);

    // Capture END TIME
    const endTime = Date.now();
    const startTime = this.startTime || endTime;
    const timeTaken = endTime - startTime;
    const timeTakenMinutes = timeTaken / (1000 * 60);


    this.circuitService.sendAllUserActions(this.faultLine, this.userActions)
      .subscribe({
        next: (res: any) => {
          console.log("🧩 Backend response:", res);

          // Convert backend correct sequence → readable
          const readableCorrect = (res.correctSequence || []).map((id: string) =>
            this.redSignalDisplayMap[id] || id
          );

          // ------------------------------- FCB Flip Count Logic -------------------------------
          let fcbFlipCount = 0;
          if (readableSequence.length > 0) {
            const firstVal = this.extractBracketValue(readableSequence[0]);
            const total = readableSequence.filter(s => this.extractBracketValue(s) === firstVal).length;
            fcbFlipCount = Math.floor(total / 2);
          }

          // ------------------------------- Time Taken Logic (minutes) -------------------------------
          // const endTime = Date.now();
          // const startTime = this.startTime;
          // const timeTaken = endTime - startTime;
          // const timeTakenMinutes = timeTaken / (1000 * 60);

          // ------------------------------- Percentage Logic (optional same as before) -------------------------------
          let percentage = 0;

          if (fcbFlipCount <= 5) {
            percentage = 100;
          } else if (fcbFlipCount === 6 || fcbFlipCount === 7) {
            percentage = Number(((5 / fcbFlipCount) * 100).toFixed(1));
          } else {
            percentage = 0;
          }

          // ------------------------------- PASS FAIL - Combined FCB + Time -------------------------------
          // Rule:
          // 1) Agar FCB > 7 -> FAIL
          // 2) Ya timeTaken > 5 minutes -> FAIL
          // 3) Otherwise -> PASS
          const isFlipFail = fcbFlipCount > 7;
          const isTimeFail = timeTakenMinutes > 5;
          const isPass = !isFlipFail && !isTimeFail;

          let verificationMessage = '';

          if (isPass) {
            verificationMessage = 'Fault resolved successfully!';
          } else if (isFlipFail && isTimeFail) {
            verificationMessage = 'Fault resolution failed. Too many FCB trips and time exceeded 5 minutes.';
          } else if (isFlipFail) {
            verificationMessage = 'Fault resolution failed. FCB tripped too many times.';
          } else if (isTimeFail) {
            verificationMessage = 'Fault resolution failed. Time exceeded 5 minutes.';
          }


          // -------------------------------
          // 🔥 Payload Saved to DB
          // -------------------------------
          const payload = {
            userName: sessionStorage.getItem("username"),
            faultLine: this.faultLine,
            fcbFlipCount,
            resultPercentage: percentage,
            userSequence: JSON.stringify(userActionSequence),
            correctSequence: JSON.stringify(readableCorrect),
            sessionId: this.pendingSessionId,

            status: isPass ? 'PASS' : 'FAIL',
            startTime,
            endTime,
            timeTakenMs: timeTaken
          };

          console.log("📤 Saving final result:", payload);

          this.http.post('/api/result/save', payload).subscribe({
            next: () => console.log("✅ Result saved successfully"),
            error: err => console.error("❌ Failed to save result:", err)
          });
          const userId = sessionStorage.getItem("username");

          if (!this.pendingSessionId || !userId) {
            console.error("❌ pendingSessionId or userId missing");
            return;
          }

          this.circuitService.resolveFaultSession({
            sessionId: this.pendingSessionId, // ✅ SAME as ACCEPT
            userId
          }).subscribe({
            next: () => console.log("✅ Fault session marked RESOLVED"),
            error: err => console.error("❌ Failed to mark session resolved:", err)
          });

          // -------------------------------
          // 🔥 Navigate to Result Page
          // -------------------------------
          this.router.navigate(['/result'], {
            queryParams: {
              message: encodeURIComponent(verificationMessage),
              seq: JSON.stringify(readableSequence),
              correct: JSON.stringify(readableCorrect),
              line: this.faultLine,
              faultLine: this.faultLine,               // 🔥 YE ADD KARO 👈

              startTime,
              endTime,
              timeTaken,
              sessionId: this.sessionId,
              fcbFlipCount,
              percentage
            }
          });
        },

        error: err => {
          console.error('❌ Verification failed:', err);
          this.verificationMessage = '⚠️ Backend error: Unable to verify resolution.';
        }
      });
  }


  extractBracketValue(item: string): string {
    const bmMatch = item.match(/\bBM\s*\d+\b/i);
    if (bmMatch) return bmMatch[0].replace(/\s+/g, '').toUpperCase();

    const fcbMatch = item.match(/\bFCB\s*\d+\b/i);
    if (fcbMatch) return fcbMatch[0].replace(/\s+/g, '').toUpperCase();

    const match = item.match(/\[([^\]]+)\]/);
    return match ? match[1].trim() : '';
  }

  private getBmDisplayName(displayName: string, fallbackId: string): string {
    const bmMatch = displayName.match(/\bBM\s*\d+\b/i);
    if (bmMatch) return bmMatch[0].replace(/\s+/g, '').toUpperCase();

    const fcbMatch = displayName.match(/\bFCB\s*\d+\b/i);
    return fcbMatch ? fcbMatch[0].replace(/\s+/g, '').toUpperCase() : fallbackId;
  }

  countBracketMatches(value: string, arr: string[]): number {
    return arr.filter(x => this.extractBracketValue(x) === value).length;
  }
  elapsedSeconds = 0;
  formattedTime = '00:00';
  timerInterval: any;
  startUITimer() {
    if (this.startTime === null) return; // ⛔ safety guard

    this.timerInterval = setInterval(() => {
      if (this.startTime === null) return;

      const diff = Date.now() - this.startTime;

      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      this.formattedTime =
        `${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }

  stopUITimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  playBeepSequence(beeps = 15, duration = 5) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    let currentBeep = 0;

    const beepInterval = setInterval(() => {
      if (currentBeep >= beeps) {
        clearInterval(beepInterval);
        return;
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);

      currentBeep++;
    }, 300); // 300ms interval matches your blink

    // Stop after 5 seconds max
    setTimeout(() => clearInterval(beepInterval), duration * 1000);
  }

  // =================== Fault Blink Effect (Fault Detection) ===================
  startFaultBlinkEffect() {

    this.playBeepSequence(15, 3); // 15 beeps over 5s

    let blinkCount = 0;
    const blinkLimit = 10; // 3s at 300ms interval
    const canvasBgColors = ['#fff', '#FFD700']; // white/yellow for +

    const blinkInterval = setInterval(() => {
      this.canvas.backgroundColor = canvasBgColors[blinkCount % 2];
      this.canvas.renderAll();
      blinkCount++;
      if (blinkCount > blinkLimit) {
        clearInterval(blinkInterval);
        this.canvas.backgroundColor = '#fff'; // restore normal
        this.canvas.renderAll();
      }
    }, 300);
  }


  // =================== Visual Fault Effect ===================
  shortCircuitEffectAt(redSignalId: string) {
    const icon = this.canvas.getObjects().find(obj =>
      (obj as any).customId === redSignalId
    );
    if (!icon) return;

    // Flash effect (simple): show yellow "⚡" text near the icon for 1s
    const effect = new fabric.Text('⚡', {
      left: (icon.left || 0) + 20,
      top: (icon.top || 0) - 10,
      fontSize: 24,
      fill: 'yellow',
      selectable: false,
      evented: false,
    });
    this.canvas.add(effect);
    setTimeout(() => {
      this.canvas.remove(effect);
      this.canvas.renderAll();
    }, 1000);
  }

  // Helper to batch close given redSignals using existing popup logic
  closeRedSignalsByIds(ids: string[], isAuto: boolean = true) {
    ids.forEach(rsId => {
      const obj = this.canvas.getObjects().find(o => {
        const anyObj = o as any;
        return (
          anyObj.type === 'redSignal'
          || (anyObj.type === 'group' && guessTypeFromContent(o) === 'redSignal')
        ) && anyObj.customId === rsId;
      });

      if (obj) {
        // Temporarily override popupIcon for onRedSignalState
        const prevPopup = this.popupIcon;
        this.popupIcon = obj;

        // Auto-close flag prevents adding to userActions if needed
        this.onRedSignalState('close', isAuto);
        this.popupIcon = prevPopup; // restore
        console.log(`🔴 Auto-closed redSignal: ${rsId}`);
      }
    });
  }

  private showYellowAutoCloseWarning(title: string, html: string) {
    this.startFaultBlinkEffect();

    Swal.fire({
      icon: 'warning',
      title,
      html,
      background: '#fff3cd',
      color: '#000000',
      confirmButtonColor: '#ca8a04'
    });
  }

  
// COMPLETE METHODS - for logic add mode, line tap handling, and rule management--------------------------------

  toggleLogicAddMode() {
    this.isLogicAddMode = !this.isLogicAddMode;

    if (this.isLogicAddMode) {
      this.showLogicEditor = true;
      this.logicRules = [];
      this.rsChips = [];
      this.lgChips = [];
      this.currentRuleWhen = '';
      this.currentRuleIndex = 0;

      // ========== POPUP DISABLE ==========
      this.isRedSignalPopupEnabled = false;

      this.canvas.on('mouse:down', this.onLogicModeTap.bind(this));
      console.log('🛠️ Logic Mode ON - Tap Lines/RS!');
    } else {
      this.showLogicEditor = false;

      // ========== POPUP RE-ENABLE ==========
      setTimeout(() => {
        this.isRedSignalPopupEnabled = true;
      }, 100);

      this.canvas.off('mouse:down', this.onLogicModeTap);
    }
    this.canvas.renderAll();
  }


  onLogicModeTap(e: any) {
    if (!this.isLogicAddMode) return;

    const pointer = this.canvas.getPointer(e.e);

    for (const obj of this.canvas.getObjects()) {
      if (obj === this.deleteZone || obj === this.deleteText) continue;

      const anyObj = obj as any;
      const bounds = obj.getBoundingRect();

      if (pointer.x >= bounds.left && pointer.x <= bounds.left + bounds.width &&
        pointer.y >= bounds.top && pointer.y <= bounds.top + bounds.height) {

        const id = anyObj.customId;
        if (!id) continue;

        const type = anyObj.customType || anyObj.type;

        // LG CHIP
        if (type?.includes('line') || type === 'path' || type === 'lineR' || type === 'lineG') {
          if (!this.lgChips.includes(id)) {
            this.lgChips.push(id);
            this.showTapFeedback(id, `✅ LG: ${id}`, 'green');
          }
          break;
        }
        // RS CHIP
        else if (this.isRedSignal(anyObj)) {
          if (!this.rsChips.includes(id)) {
            this.rsChips.push(id);
            this.updateRSWhen();
            this.showTapFeedback(id, `✅ RS: ${id}`, 'red');
          }
          break;
        }
      }
    }
  }

  removeRSChip(index: number) {
    this.rsChips.splice(index, 1);
    this.updateRSWhen();
  }

  removeLGChip(index: number) {
    this.lgChips.splice(index, 1);
  }

  updateRSWhen() {
    this.currentRuleWhen = this.rsChips.length > 0
      ? `(${this.rsChips.join(' ')})`
      : '';
  }

  isRedSignal(obj: any): boolean {
    const type = obj.type || obj.customType;
    return type === 'redSignal' ||
      type === 'redSignalH' ||
      (type === 'group' && obj.getObjects?.().some((child: any) =>
        child.fill === '#8B0000' || child.fill === 'green'));
  }

  showTapFeedback(id: string, text: string, color: string = 'green') {
    const obj = this.canvas.getObjects().find((o: any) => o.customId === id) as any;
    if (!obj) return;

    const bounds = obj.getBoundingRect?.() || { left: 0, top: 0, width: 50, height: 50 };

    const feedback = new fabric.Text(
      text,
      {
        left: bounds.left + bounds.width + 10,
        top: bounds.top - 20,
        fontSize: 16,
        fill: color,
        backgroundColor: 'rgba(255,255,255,0.95)',
        fontWeight: 'bold',
        padding: 8,
        selectable: false,
        evented: false,
      }
    );

    this.canvas.add(feedback);
    this.canvas.renderAll();

    setTimeout(() => {
      this.canvas.remove(feedback);
      this.canvas.renderAll();
    }, 2000);
  }

  addNewRule() {
    if (!this.currentRuleWhen || this.lgChips.length === 0) {
      alert('RS & LG select karke rule banao!');
      return;
    }

    this.logicRules.push({
      when: this.currentRuleWhen,
      lines: [...this.lgChips],
      stroke: 'red',
      priority: 1
    });

    this.currentRuleIndex = this.logicRules.length - 1;

    // Upar wale RS / LG clear
    this.rsChips = [];
    this.lgChips = [];
    this.currentRuleWhen = '';
  }

  downloadLogicFile() {
    if (this.logicRules.length === 0) {
      alert('add Rules first!');
      return;
    }

    const tsArrayContent = this.logicRules
      .map(rule => {
        const whenEscaped = rule.when.replace(/'/g, "\\'");
        const linesArray = rule.lines.map(l => `'${l}'`).join(', ');
        const stroke = rule.stroke || 'red';
        const priority = rule.priority || 1;

        return `  {\n` +
          `    when: '${whenEscaped}',\n` +
          `    lines: [${linesArray}],\n` +
          `    stroke: '${stroke}',\n` +
          `    priority: ${priority}\n` +
          `  }`;
      })
      .join(',\n');

    const tsContent =
      `export const circuitRules = [\n` +
      `${tsArrayContent}\n` +
      `];\n`;

    const blob = new Blob([tsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'circuit-rules.ts';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Draggable methods
  startDragEditor(event: MouseEvent) {
    this.isDraggingEditor = true;
    event.stopPropagation();
  }

  dragEditor(event: MouseEvent) {
    if (this.isDraggingEditor) {
      this.logicEditorX += event.movementX * 0.5;
      this.logicEditorY += event.movementY * 0.5;
      event.stopPropagation();
    }
  }

  stopDragEditor() {
    this.isDraggingEditor = false;
  }
  // Operator ke liye ye 2 functions
  addOperatorToRS(op: string) {
    if (this.rsChips.length === 0) return;

    // Cursor simulation - last RS ke baad add
    const lastIndex = this.rsChips.length - 1;
    this.rsChips.splice(lastIndex + 1, 0, op);
    this.updateRSWhen();
  }

  // end of new methods


  onRedSignalState(state: 'open' | 'close', isAuto: boolean = false) {

    if (!this.popupIcon) {
      this.closePopup();
      return;
    }

    const redSignalId = (this.popupIcon as any).customId || '';
    const label = (this.popupIcon as any).customLabel || '';
    const isCloseType = (label === 'closeHorizontal' || label === 'closeVertical');

    // const circuitRule = CIRCUIT_RULES[this.selectedCircuitName];
      const circuitRule = this.activeCircuitRule;



    // =====================================================
    // 🔵 NORMAL MODE
    // =====================================================
    if (!this.isFaultDetectionMode && circuitRule?.normalMode) {

      if (state === 'close') this.closedSignals.add(redSignalId);
      else this.closedSignals.delete(redSignalId);

      for (const rule of circuitRule.normalMode) {

        const controlledSignal = rule.controlledSignal;
        const preconditions = rule.preconditions;

        /* ---------- BLOCK OPEN ---------- */
        if (redSignalId === controlledSignal && state === 'open') {

          const canOpen = preconditions.some(seq =>
            seq.every(rs => this.closedSignals.has(rs))
          );

          if (!canOpen) {
            Swal.fire({
              icon: 'warning',
              title: 'Action Blocked',
              html: `Cannot open <b>${this.redSignalDisplayMap[controlledSignal] || controlledSignal}</b>`,
            });
            this.closeRedSignalsByIds([controlledSignal]);
            this.updateLineColors();
            this.canvas.renderAll();
            this.closePopup();
            return;
          }
        }

        /* ---------- AUTO CLOSE ---------- */
        if (redSignalId !== controlledSignal) {

          const stillValid = preconditions.some(seq =>
            seq.every(rs => this.closedSignals.has(rs))
          );

          const isOpen = !this.closedSignals.has(controlledSignal);

          if (isOpen && !stillValid) {
            Swal.fire({
              icon: 'info',
              title: 'Auto Closed',
              html: `<b>${this.redSignalDisplayMap[controlledSignal] || controlledSignal}</b> auto-closed.`,
            });
            this.startFaultBlinkEffect();
            this.closeRedSignalsByIds([controlledSignal]);
            this.updateLineColors();
            this.canvas.renderAll();
          }
        }

        /* ---------- REVERSE (NORMAL ONLY) ---------- */
        if (rule.reverse) {

          const reverseActive = rule.reverse.conditions.some(seq =>
            seq.every(rs => !this.closedSignals.has(rs))
          );

          // auto close
          if (reverseActive && !this.closedSignals.has(rule.reverse.signal)) {
            this.closeRedSignalsByIds([rule.reverse.signal]);
          }

          // open block
          if (redSignalId === rule.reverse.signal && state === 'open' && reverseActive) {
            Swal.fire({
              icon: 'warning',
              title: 'Action Blocked',
              html: `<b>${rule.reverse.signal}</b> blocked due to reverse supply from two sources.`,
            });
            this.closeRedSignalsByIds([rule.reverse.signal]);
            this.updateLineColors();
            this.canvas.renderAll();
            this.closePopup();
            return;
          }
        }
      }
    }

    if (this.isFaultDetectionMode) {
      // 🔥 EXISTING code रखो (backward compatibility)
      this.userActions.push(redSignalId);  // ← YE EXISTING LINE KEEP
      console.log('🧾 Recorded actions:', this.userActions);

      // 🔥 YE NAYA BLOCK ADD करो (नीचे existing के बाद)
      const label = this.redSignalDisplayMap[redSignalId] || redSignalId;
      const displayName = this.getBmDisplayName(label, redSignalId);

      this.detailedUserActions.push({
        id: redSignalId,
        displayName,
        action: 'trip',
        timestamp: Date.now()
      });
    }

    // =====================================================
    // 🔴 FAULT MODE
    // =====================================================
    if (this.isFaultDetectionMode && circuitRule?.faultMode) {

      if (!this.faultLine) return;

      this.userActions.push(redSignalId);

      if (state === 'close') this.closedSignals.add(redSignalId);
      else this.closedSignals.delete(redSignalId);

      const faultRule =
        circuitRule.faultMode.preconditions[this.faultLine];

      if (faultRule) {

        const controlledSignal = faultRule.controlledSignal;
        const preconditions = faultRule.preconditions;

        /* ---------- BLOCK OPEN ---------- */
        if (redSignalId === controlledSignal && state === 'open') {

          const canOpen = preconditions.some(seq =>
            seq.every(rs => this.closedSignals.has(rs))
          );

          if (!canOpen) {
            Swal.fire({
              icon: 'warning',
              title: 'Action Blocked',
              html: `You cannot open FCB because fault is not resolved yet.`,
            });

            this.closedSignals.add(controlledSignal);
            this.closePopup();
            return;
          }
        }

        /* ---------- AUTO CLOSE ---------- */
        if (redSignalId !== controlledSignal) {
          console.log("Preconditions:", preconditions);
          const stillValid = preconditions.some(seq =>
            seq.every(rs => this.closedSignals.has(rs))
          );


          if (!stillValid && !this.closedSignals.has(controlledSignal)) {
            this.closeRedSignalsByIds([controlledSignal]);
          }
        }

        /* ---------- REVERSE FAULT LOGIC ---------- */
        if (faultRule.reverse && !this.faultResolved) {

          const reverseActive = faultRule.reverse.conditions.some(seq =>
            seq.every(rs => !this.closedSignals.has(rs))
          );

          // auto trip
          if (reverseActive && !this.closedSignals.has(faultRule.reverse.signal)) {
            this.closeRedSignalsByIds([faultRule.reverse.signal]);
          }

          // open block
          if (
            redSignalId === faultRule.reverse.signal &&
            state === 'open' &&
            reverseActive
          ) {
            Swal.fire({
              icon: 'warning',
              title: 'Action Blocked',
              html: `Reverse supply is blocked because fault is not resolved yet.`,
            });
            this.closeRedSignalsByIds([faultRule.reverse.signal]);
            this.closePopup();
            return;
          }
        }
      }

      /* ---------- RESOLUTION ---------- */
      const required =
        circuitRule.faultMode.resolutionMap[this.faultLine];

      if (required && required.every(rs => this.closedSignals.has(rs))) {
        this.faultResolved = true;
      }
    }
    // ====================== END FAULT DETECTION ======================

    // Check if redSignal is override signal
    const isOverrideRedSignal = Object.keys(this.redSignalLineOverrideMap).some(key =>
      key.split(',').map(s => s.trim()).includes(redSignalId)
    );

    const setSignalState = (angle: number, color: string) => {
      if (!this.popupIcon) return;
      this.popupIcon.set({ angle });
      this.popupIcon.setCoords();
      this.setRedSignalColor(this.popupIcon, color);
      this.canvas.renderAll();
      this.closePopup();
    };

    if (isOverrideRedSignal) {
      const isCloseType = (label === 'closeHorizontal' || label === 'closeVertical');

      if (isCloseType) {
        if (state === 'open') {
          this.closedSignals.delete(redSignalId);
          this.closeTypeSignalStateMap[redSignalId] = true; // open = true
          this.overrideActivatedSignals.delete(redSignalId); // Sync override signals
          setSignalState(90, '#8B0000'); // rotation/color for open
        } else {
          this.closedSignals.add(redSignalId);
          this.closeTypeSignalStateMap[redSignalId] = false; // close = false
          this.overrideActivatedSignals.add(redSignalId);  // Sync override signals
          setSignalState(0, 'green'); // rotation/color for close
        }
      } else {
        // Normal override logic
        if (state === 'close') {
          this.overrideActivatedSignals.add(redSignalId);
          this.closedSignals.add(redSignalId);
          setSignalState(90, 'green');
        } else if (state === 'open') {
          this.overrideActivatedSignals.delete(redSignalId);
          this.closedSignals.delete(redSignalId);
          this.overrideRecentlyOpened.add(redSignalId);
          setSignalState(0, '#8B0000');
          this.overrideRecentlyOpened.delete(redSignalId);
        }
      }

      this.updateLineColors();
      return;
    }

    if (isCloseType) {
      if (state === 'open') {
        this.closedSignals.delete(redSignalId); // open = not closed
        this.closeTypeSignalStateMap[redSignalId] = true;
        setSignalState(90, '#8B0000'); // open should be red
      } else {
        this.closedSignals.add(redSignalId);
        this.closeTypeSignalStateMap[redSignalId] = false;
        setSignalState(0, 'green'); // close should be green
      }
      this.updateLineColors();
      return;

    }


    // Normal signal logic
    if (state === 'open') {
      this.closedSignals.delete(redSignalId);
      setSignalState(0, '#8B0000');
      this.updateLineColors();
      return;
    }

    if (state === 'close') {
      this.closedSignals.add(redSignalId);
      setSignalState(90, 'green');
      this.updateLineColors();
    }
  }





  // Only active when build is “completed”.
  // On click: If you click on an icon, and it’s a redSignal, open popup for setting state.Otherwise, just deselect.

  setupLineTapHandler(): void {
    console.log('🔥 LineTapHandler ACTIVE');

    this.canvas.on('mouse:down', (e) => {
      console.log('🖱️ Mouse down');

      const pointer = this.canvas.getPointer(e.e);  // Coordinates lo

      // SAARI LINES CHECK KARO (redSignal jaisa)
      for (const obj of this.canvas.getObjects()) {
        if (obj === this.deleteZone || obj === this.deleteText) continue;

        // Line type check
        let type = (obj as any).type;
        const customType = (obj as any).customType;
        const customId = (obj as any).customId;

        if (customType?.includes('line') || type === 'path' || type === 'line') {
          const bounds = obj.getBoundingRect();

          // Click bounds mein hai?
          if (
            pointer.x >= bounds.left &&
            pointer.x <= bounds.left + bounds.width &&
            pointer.y >= bounds.top &&
            pointer.y <= bounds.top + bounds.height
          ) {
            console.log('🚂 LINE TAPPED PERFECT!');
            console.log('ID:', customId);
            console.log('Type:', customType || type);
            console.log('Bounds:', bounds);
            return;  // No popup
          }
        }
      }
      console.log('❌ No line tapped');
    });
  }





  private isPopupCurrentlyVisible = false;

  setupBuildCompleteIconClick(): void {
    this.canvas.on('mouse:down', (e) => {
      if (!this.isBuildCompleted || this.isPopupCurrentlyVisible) return;

      const pointer = this.canvas.getPointer(e.e);

      for (const obj of this.canvas.getObjects()) {
        if (obj === this.deleteZone || obj === this.deleteText) continue;
        let type = (obj as any).type;
        if (!type || type === 'group') {
          type = guessTypeFromContent(obj);
        }
        if (type !== 'redSignal') continue;

        const bounds = obj.getBoundingRect();

        if (
          pointer.x >= bounds.left &&
          pointer.x <= bounds.left + bounds.width &&
          pointer.y >= bounds.top &&
          pointer.y <= bounds.top + bounds.height
        ) {
          this.isPopupCurrentlyVisible = true;  // Guard flag set kar diya
          this.openPopupForIcon(obj);
          break;
        }
      }
    });
  }

  closePopup() {
    this.popupVisible = false;
    this.isPopupCurrentlyVisible = false;  // Popup close hone par flag reset karo
    this.canvas.discardActiveObject();
    this.popupLabel = '';
    this.popupSignalId = null;
    this.popupTitle = '';
    this.popupType = '';
    this.canvas.renderAll();
  }

  onlyShowOpenOption: boolean = false;


  // Shows a popup for the redSignal icon.
  // Sets state variables and deselects canvas objects for UI clarity.

  openPopupForIcon(icon: fabric.Object) {
    if (!this.isRedSignalPopupEnabled) return;

    let type = (icon as any).type || '';
    if (!type || type === 'group') {
      type = guessTypeFromContent(icon);
    }
    if (type !== 'redSignal') return;

    const id = (icon as any).customId || '';
    const label = (icon as any).customLabel || '';
    this.popupVisible = true;
    this.popupIcon = icon;
    this.popupType = type;
    this.popupId = id;
    this.popupLabel = label;
    this.popupVisible = true;
    this.isPopupCurrentlyVisible = true;
    this.popupTitle = this.redSignalDisplayMap[id] || `${type} [ID: ${id}]`;

    const isCloseType = (label === 'closeHorizontal' || label === 'closeVertical');

    if (isCloseType) {
      // Show Open button if currently closed (false), Close button if open (true)
      this.onlyShowOpenOption = !this.closeTypeSignalStateMap[id];
    } else {
      this.onlyShowOpenOption = this.closedSignals.has(id);
    }

    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }


  // ================= Popup Logic =================
  openIconInputPopup(iconType: string) {
    if (this.isBuildCompleted) {
      // Ignore or prevent popup from opening since building is completed
      return;
    }
    this.iconToAddType = iconType;
    this.inputIconId = '';
    this.inputIconLabel = '';
    this.showIconInputPopup = true;
  }

  confirmAddIcon() {
    if (!this.iconToAddType) return;
    // Auto-generate ID if left blank
    if (!this.inputIconId.trim()) {
      this.iconIdCounters[this.iconToAddType] = (this.iconIdCounters[this.iconToAddType] || 0) + 1;
      this.inputIconId = this.generateAutoId(this.iconToAddType, this.iconIdCounters[this.iconToAddType]);
    }
    this.addIconToCanvas(this.iconToAddType, this.inputIconId, this.inputIconLabel);
    this.showIconInputPopup = false;
  }


  cancelAddIcon() {
    this.showIconInputPopup = false;
    this.iconToAddType = null;
  }


  generateAutoId(type: string, count: number): string {
    const prefixMap: Record<string, string> = {
      ground: 'GS',
      lineR: 'LR',
      lineG: 'LG',
      lineB: 'LB',
      star: 'ST',
      switch: 'SW',
      trackjoin: 'TJ',
      redSignal: 'RS',
      redSignalH: 'RSH',
      diagonalCaution: 'DC',
      capacitor: 'CP',
      twocircle: 'TC',
      triangle: 'TRI',
      zeroShape: 'CY'  // Add prefix here for zeroShape

    };
    return (prefixMap[type] || 'ID') + count;
  }

  // RedSignal ka color change karne wala helper function:
  setRedSignalColor(icon: fabric.Object, color: string) {
    console.log('setRedSignalColor called with type:', (icon as any).type, ', fabric type:', icon.type);
    if ((icon as any).type && icon.type === 'group') {
      // चलो मान लेते हैं कि यह redSignal icon है (या type check आगे ठीक करो)
      const group = icon as fabric.Group;
      group.getObjects().forEach(child => {
        if (child.type === 'rect' && (child.fill === '#8B0000' || child.fill === 'green')) {


          console.log('Setting fill:', child.fill, 'to', color);
          child.set('fill', color);
        }
      });
      group.set('dirty', true);
      this.canvas.requestRenderAll();
    } else {
      console.warn('setRedSignalColor: icon not group or type missing');
    }
  }

  // private circuitColorLogicMap: Record<string, () => void> = {
  //   'Branch_Line_Board': () => Circuit5Logic(this.canvas, this.closedSignals),
  //   'RBR_Board': () => mainCircuitLogic(this.canvas, this.closedSignals), // Example
  //   'HSR_Board': () => GILDUICOMCircuitLogic(this.canvas, this.closedSignals), // Example
  //   'Main_Line_Board': () => MainBoardLogic(this.canvas, this.closedSignals), // Example

  // };
  //=======================Adding all features ==============================================

  getLineRightTerminal(lineId: string, offset = 0): { x: number, y: number } | null {
    const line = this.canvas.getObjects()
      .find(obj => (obj as any).customId === lineId && (obj.type === 'line' || obj.type === 'path')) as fabric.Line | undefined;
    if (!line) return null;
    const x2 = (line as any).x2;
    const y2 = (line as any).y2;
    return {
      x: (line.left || 0) + x2 + offset,
      y: (line.top || 0) + y2
    };
  }

  getLineLeftTerminal(lineId: string, offset = 0): { x: number, y: number } | null {
    const line = this.canvas.getObjects()
      .find(obj => (obj as any).customId === lineId && (obj.type === 'line' || obj.type === 'path')) as fabric.Line | undefined;
    if (!line) return null;
    const x1 = (line as any).x1;
    const y1 = (line as any).y1;
    return {
      x: (line.left || 0) + x1 + offset,
      y: (line.top || 0) + y1
    };
  }

  drawConnectingLineWithCircles(signalId: string, startPoint: { x: number, y: number }, endPoint: { x: number, y: number }) {
    ['connect_line_', 'connect_circle_start_', 'connect_circle_end_'].forEach(prefix => {
      const old = this.canvas.getObjects().find(obj => (obj as any).customId === prefix + signalId);
      if (old) this.canvas.remove(old);
    });

    const line = new fabric.Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
      stroke: 'black',
      strokeWidth: 6,
      selectable: false,
      evented: true,
      customId: 'connect_line_' + signalId
    });

    const circleStart = new fabric.Circle({
      radius: 5,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
      left: startPoint.x,
      top: startPoint.y,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: true,
      customId: 'connect_circle_start_' + signalId
    });

    const circleEnd = new fabric.Circle({
      radius: 5,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
      left: endPoint.x,
      top: endPoint.y,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: true,
      customId: 'connect_circle_end_' + signalId
    });

    this.canvas.add(line, circleStart, circleEnd);

    // Handler function for popup on line or circle click
    const onObjectClick = () => this.onLineClick(signalId);

    // Attach click events
    [line, circleStart, circleEnd].forEach(obj => {
      obj.off('mousedown');
      obj.on('mousedown', onObjectClick);
    });

    this.canvas.renderAll();
  }
  onSwitchClick(signalId: string) {
    this.idPopupVisible = true;
    this.canvas.hoverCursor = 'default';
    this.popupType = 'switchDown';
    this.popupSignalId = signalId;
    this.popupLabel = `Switch Down for ${signalId}?`;
  }

  onLineClick(signalId: string) {
    console.log('Line clicked:', signalId);
    this.idPopupVisible = true;
    this.popupType = 'switchUp';
    this.popupSignalId = signalId;
    this.popupLabel = `Switch Up for ${signalId}?`;
  }


  confirmIDPopup() {
    if (!this.popupSignalId) return;
    const signalId = this.popupSignalId;

    if (this.popupType === 'switchDown') {
      const switchObj = this.canvas.getObjects().find(o => (o as any).customId === signalId);
      if (!switchObj) return;

      const [startId, endId] = this.connectionsMap[signalId];
      const offset = signalId === 'ID2' ? 40 : 0;
      let startPoint = this.getLineRightTerminal(startId, offset);
      let endPoint = this.getLineLeftTerminal(endId, offset);

      if (!startPoint || !endPoint) return;

      if (signalId === 'ID1') {
        startPoint = this.movePointTowards(startPoint, endPoint, 20);
        endPoint = this.movePointTowards(endPoint, startPoint, 10);
      }

      switchObj.set('visible', false);
      this.drawConnectingLineWithCircles(signalId, startPoint, endPoint);
      this.attachLineHandlers();

    } else if (this.popupType === 'switchUp') {
      const lineObj = this.canvas.getObjects().find(o => (o as any).customId === 'connect_line_' + signalId);
      if (lineObj) this.canvas.remove(lineObj);
      ['connect_circle_start_', 'connect_circle_end_'].forEach(prefix => {
        const circle = this.canvas.getObjects().find(o => (o as any).customId === prefix + signalId);
        if (circle) this.canvas.remove(circle);
      });

      const switchObj = this.canvas.getObjects().find(o => (o as any).customId === signalId);
      if (switchObj) switchObj.set('visible', true);
    }

    this.canvas.renderAll();
    this.closeIdPopup();
  }

  // Moves point 'start' towards 'end' by 'distance' points
  movePointTowards(start: { x: number, y: number }, end: { x: number, y: number }, distance: number) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return start; // no movement if same points
    return {
      x: start.x + (dx / length) * distance,
      y: start.y + (dy / length) * distance
    };
  }

  attachSwitchHandlers() {
    Object.keys(this.connectionsMap).forEach(signalId => {
      const switchObj = this.canvas.getObjects().find(obj => (obj as any).customId === signalId);
      if (!switchObj) return;
      // Remove ALL previous handlers to avoid duplication/reentrance
      switchObj.off('mousedown');
      // Only attach the popup show handler, NOT line drawing/removal directly
      switchObj.on('mousedown', () => this.onSwitchClick(signalId));
    });
  }

  closeIdPopup() {
    this.idPopupVisible = false;
    this.popupType = "";
    this.popupSignalId = null;
    this.canvas.renderAll();
  }


  // Attach handlers on line and circles for click to pop up switchUp dialog

  attachLineHandlers() {
    this.canvas.getObjects()
      .filter(o => (o as any).customId?.startsWith('connect_line_'))
      .forEach(lineObj => {
        lineObj.off('mousedown');
        lineObj.on('mousedown', () => {
          const signalId = (lineObj as any).customId.replace('connect_line_', '');
          this.onLineClick(signalId);
        });
      });

    ['connect_circle_start_', 'connect_circle_end_'].forEach(prefix => {
      this.canvas.getObjects()
        .filter(o => (o as any).customId?.startsWith(prefix))
        .forEach(circleObj => {
          circleObj.off('mousedown');
          circleObj.on('mousedown', () => {
            const signalId = (circleObj as any).customId.replace(prefix, '');
            this.onLineClick(signalId);
          });
        });
    });
  }


  //================================ Created Lines In Advance====================================
  setupAllSwitchLineToggles() {
    Object.entries(this.switchLineMap).forEach(([swId, data]) => {
      // Find switch group on canvas
      const swGroup = this.canvas.getObjects().find(
        obj => (obj as any).customId === swId && obj.type === 'group'
      ) as fabric.Group;

      if (!swGroup) {
        console.warn(`Switch ${swId} not found`);
        return;
      }
      data.swRef = swGroup;

      // Create join line between the two lines connected to switch
      const lineObjs = data.lines.map(lineId =>
        this.canvas.getObjects().find(obj => (obj as any).customId === lineId && obj.type === 'line') as fabric.Line
      );

      if (lineObjs.length < 2 || !lineObjs[0] || !lineObjs[1]) {
        console.warn(`Lines ${data.lines.join(',')} not found for switch ${swId}`);
        return;
      }

      const joinLine = this.createJoinLineBetweenLines(lineObjs[0], lineObjs[1], swId);

      this.canvas.add(joinLine);
      data.joinLineRef = joinLine;

      // Add click handlers
      this.addGenericSwitchHandler(swId);
      this.addGenericLineHandler(swId);
    });

    this.canvas.renderAll();
  }
  createJoinLineBetweenLines(line1: fabric.Line, line2: fabric.Line, swId: string): fabric.Line {
    const extensionPx = 10;
    const bounds1 = line1.getBoundingRect();
    const bounds2 = line2.getBoundingRect();

    let ptA = [bounds1.left + bounds1.width, bounds1.top + bounds1.height / 2];
    let ptB = [bounds2.left, bounds2.top + bounds2.height / 2];

    const dx = ptB[0] - ptA[0];
    const dy = ptB[1] - ptA[1];
    const length = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / length;
    const uy = dy / length;

    ptA = [ptA[0] - ux * extensionPx, ptA[1] - uy * extensionPx];
    ptB = [ptB[0] + ux * extensionPx, ptB[1] + uy * extensionPx];

    const joinLine = new fabric.Line([ptA[0], ptA[1], ptB[0], ptB[1]], {
      stroke: 'black',
      strokeWidth: 6,
      selectable: false,
      evented: true,
      visible: false,
    });
    (joinLine as any).customId = swId + '_JOINED_LINE';
    return joinLine;
  }

  //=========================Clicking Popup for SW ===============================

  addGenericSwitchHandler(swId: string) {
    const swGroup = this.switchLineMap[swId].swRef;

    if (!swGroup) return;


    swGroup.on('mousedown', () => {
      this.popupVisible = true;
      this.popupType = 'switch';
      this.popupId = swId;
      this.popupLabel = `Join lines for ${swId}?`;
    });
  }

  //============================Click event for Line =======================================
  addGenericLineHandler(swId: string) {
    const joinLine = this.switchLineMap[swId].joinLineRef;
    if (!joinLine) return;
    joinLine.on('mousedown', () => {
      this.popupVisible = true;
      this.popupType = 'lineClose';
      this.popupIcon = joinLine;
      this.popupId = swId;
      this.popupLabel = `Break line for ${swId}?`;
    });
  }

  //========================================Confirm Popup for adding Line======================================
  onSwitchJoinPopupConfirm() {
    if (this.popupType === 'switch' && this.popupId) {
      const data = this.switchLineMap[this.popupId];
      if (!data) return;

      data.swRef!.visible = false;
      data.joinLineRef!.visible = true;
      this.canvas.renderAll();
      this.closePopup();
    }
  }

  //========================================Confirm Popup for adding SW======================================

  onLineCloseConfirm() {
    if (this.popupType === 'lineClose' && this.popupId) {
      const data = this.switchLineMap[this.popupId];
      if (!data) return;

      data.joinLineRef!.visible = false;
      data.swRef!.visible = true;
      this.canvas.renderAll();
      this.closePopup();
    }
  }


  // private updateLineColors(): void {
  //   const logicFn = this.circuitColorLogicMap[this.selectedCircuitName];
  //   if (logicFn) {
  //     logicFn();
  //   } //else {
  //   //   mainCircuitLogic(this.canvas, this.closedSignals); // Generic fallback
  //   // }
  // }
      private updateLineColors(): void {
        console.log('🔵 closedSignals:', Array.from(this.closedSignals));
        console.log('🔵 boardRules:', JSON.stringify(this.boardRules));
        const lineIds = this.canvas.getObjects()
          .filter(o => { const t = (o as any).customType; return t === 'lineG' || t === 'lineR'; })
          .map(o => (o as any).customId);
        console.log('🔵 line IDs on canvas:', lineIds);

        applyRulesToCanvas(this.canvas, this.closedSignals, this.boardRules);
      }


  // Creates the chosen symbol:
  // Handles a variety of circuit elements(ground, lineR, star, switch, etc.) using Fabric.js objects.
  // Assigns type, ID, label.
  // Adds mouseover / mouseout events for tooltips.
  // Calls custom serialization logic.
  // Adds to the canvas and renders.
  // ================= Add Icon With ID & Label (Unified) =================



  private idCounter = 1; // class variable

  addIconToCanvas(type: string, id: string, label: string) {
    let icon: fabric.Object | null = null;
    if (type === 'ground') {
      const line = new fabric.Line([0, 0, 0, 60], { stroke: 'black', strokeWidth: 2, originX: 'center', originY: 'top' });
      const triangle = new fabric.Triangle({ width: 40, height: 20, fill: 'black', left: 0, top: 65, originX: 'center', originY: 'top', angle: 180, selectable: false });
      icon = new fabric.Group([line, triangle], { left: 400, top: 200, hasControls: true, lockScalingFlip: true });
      (icon as any).type = 'ground';
    }
    else if (type === 'lineG' || type === 'lineR' || type === 'lineB') {
      const colorMap: Record<string, string> = { lineR: 'red', lineG: 'green', lineB: 'black' };
      icon = new fabric.Line([400, 100, 550, 100], { stroke: colorMap[type], strokeWidth: 2, selectable: true });
      (icon as any).customId = id;
      (icon as any).customType = type; // <-- Used for easy checks later
      (icon as any).originalStroke = colorMap[type]; // <-- Always store original color
    }

    else if (type === 'star') {
      const diag1 = new fabric.Line([-20, -20, 20, 20], { stroke: 'black', strokeWidth: 6, originX: 'center', originY: 'center' });
      const diag2 = new fabric.Line([20, -20, -20, 20], { stroke: 'black', strokeWidth: 6, originX: 'center', originY: 'center' });
      icon = new fabric.Group([diag1, diag2], { left: 500, top: 200, hasControls: true, lockScalingFlip: true });
      (icon as any).type = 'star';
    } else if (type === 'switch') {
      const leftPath = new fabric.Path('M 0 0 L 16 0 Q 20 -10, 25 -25', {
        stroke: 'black',
        strokeWidth: 6,
        fill: '',
        originX: 'center',
        originY: 'center'
      });
      const rightPath = new fabric.Path('M 0 0 L -16 0 Q -20 10, -25 25', {
        stroke: 'black',
        strokeWidth: 6,
        fill: '',
        originX: 'center',
        originY: 'center'
      });
      leftPath.set({ left: -15 });
      rightPath.set({ left: 15 });
      const whiteMask = new fabric.Ellipse({
        rx: 10,
        ry: 10,
        fill: 'white',
        originX: 'center',
        originY: 'center',
        left: 0,
        top: 0,
        selectable: false,
        evented: false
      });
      icon = new fabric.Group([whiteMask, leftPath, rightPath], {
        left: 600,
        top: 200,
        hasControls: true,
        hasBorders: false,
        selectable: true
      });
      (icon as any).type = 'switch';
    }
    else if (type === 'trackjoin') {
      const line = new fabric.Line([80, 100, 100, 100], { stroke: 'green', strokeWidth: 2, selectable: false });
      const rect1 = new fabric.Rect({ left: 72, top: 90, width: 9, height: 20, fill: 'black', selectable: false });
      const rect2 = new fabric.Rect({ left: 97, top: 90, width: 9, height: 20, fill: 'black', selectable: false });
      const joinLine = new fabric.Line([80, 100, 100, 100], { stroke: 'black', strokeWidth: 9, selectable: false });
      icon = new fabric.Group([line, rect1, rect2, joinLine], { left: 100, top: 100, selectable: true });
      (icon as any).type = 'trackjoin';
    }
    else if (type === 'redSignal') {
      const isVertical = (label === 'vertical' || label === 'closeVertical');
      const isClose = (label === 'closeHorizontal' || label === 'closeVertical');

      // Close types default green, normal types default red
      const fillColor = isClose ? 'green' : '#8B0000';

      let leftRect, rightRect, centerStrip;
      if (!isVertical) {
        leftRect = new fabric.Rect({ width: 10, height: 20, fill: fillColor, left: 86, top: 60, originX: 'center', originY: 'center' });
        rightRect = new fabric.Rect({ width: 10, height: 20, fill: fillColor, left: 101, top: 60, originX: 'center', originY: 'center' });
        centerStrip = new fabric.Rect({ width: 5, height: 22, fill: 'white', left: 93.5, top: 60, originX: 'center', originY: 'center' });
      } else {
        leftRect = new fabric.Rect({ width: 20, height: 10, fill: fillColor, left: 95, top: 86, originX: 'center', originY: 'center' });
        rightRect = new fabric.Rect({ width: 20, height: 10, fill: fillColor, left: 95, top: 101, originX: 'center', originY: 'center' });
        centerStrip = new fabric.Rect({ width: 22, height: 5, fill: 'white', left: 95, top: 93.5, originX: 'center', originY: 'center' });
      }
      icon = new fabric.Group([leftRect, rightRect, centerStrip], {
        left: 600,
        top: 200,
        hasControls: true,
        hasBorders: false,
        selectable: true,
        originX: 'center',
        originY: 'center',
        objectCaching: false,
        angle: 0,
      });

      (icon as any).type = 'redSignal';
      (icon as any).customId = id;
      (icon as any).customOrientation = isVertical ? 'vertical' : 'normal';
      (icon as any).customLabel = label;
      (icon as any).isCloseType = isClose;
    }


    else if (type === 'zeroShape') {
      const points = [
        { x: 50, y: 20 },
        { x: 62, y: 30 },
        { x: 62, y: 50 },
        { x: 50, y: 62 },
        { x: 38, y: 50 },
        { x: 38, y: 30 },
        { x: 50, y: 20 } // close shape
      ];
      icon = new fabric.Polygon(points, {
        left: 460,
        top: 200,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 6,
        selectable: true,
        hasControls: true,
        hasBorders: false,
        originX: 'center',
        originY: 'top'
      });
      (icon as any).type = 'zeroShape';
      // Id aur label yahi assign honge
      (icon as any).customId = id;
      (icon as any).customLabel = label;
    }

    else if (type === 'openSwitch') {
      // Left terminal (circle)
      const leftCircle = new fabric.Circle({
        radius: 10,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 2,
        left: 300,
        top: 200,
        originX: 'center',
        originY: 'center'
      });

      // Right terminal (circle)
      const rightCircle = new fabric.Circle({
        radius: 10,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 2,
        left: 370,
        top: 200,
        originX: 'center',
        originY: 'center'
      });

      // Straight base line (track)
      // const baseLine = new fabric.Line([310, 200, 360, 200], {
      //   stroke: 'black',
      //   strokeWidth: 5,
      //   selectable: false,
      //   evented: false
      // });

      // Switch lever (angled bar)
      const lever = new fabric.Rect({
        left: 310,
        top: 200,
        width: 65,
        height: 5,
        fill: 'black',
        stroke: 'black',
        strokeWidth: 1,
        angle: -25,
        rx: 2,
        ry: 2,
        originX: 'left',
        originY: 'center'
      });

      // Group all parts
      icon = new fabric.Group([leftCircle, rightCircle, lever], {
        left: 340,
        top: 200,
        hasControls: true,
        selectable: true,
        hasBorders: false
      });

      (icon as any).type = 'openSwitch';
      (icon as any).customId = id;
      (icon as any).customLabel = label;
    }


    else if (type === 'redSignalH') {
      const pole = new fabric.Rect({ width: 80, height: 10, fill: 'black', left: 95, top: 60, originX: 'center', originY: 'center' });
      const leftRect = new fabric.Rect({ width: 60, height: 20, fill: '#8B0000', left: 95, top: 47, originX: 'center', originY: 'center' });
      const rightRect = new fabric.Rect({ width: 60, height: 20, fill: '#8B0000', left: 95, top: 73, originX: 'center', originY: 'center' });
      const glow = new fabric.Rect({ width: 60, height: 5, fill: '#fcf9f9ff', left: 95, top: 60, originX: 'center', originY: 'center' });
      icon = new fabric.Group([leftRect, rightRect, pole, glow], { left: 600, top: 200, hasControls: true, hasBorders: false, selectable: true });
      (icon as any).type = 'redSignalH';
    }

    else if (type === 'diagonalCaution') {
      const base = new fabric.Polygon([
        { x: -11, y: -11 },
        { x: 11, y: -11 },
        { x: 11, y: 11 },
        { x: -11, y: 11 }
      ], { fill: '#934bc7ff', originX: 'center', originY: 'center' });
      const stripe = new fabric.Rect({ width: 4, height: 30, fill: '#ffccff', angle: 45, originX: 'center', originY: 'center' });
      icon = new fabric.Group([base, stripe], { left: 600, top: 200, hasControls: true, hasBorders: false, selectable: true });
      (icon as any).type = 'diagonalCaution';
    }
    else if (type === 'capacitor') {
      const bottomPole = new fabric.Rect({ width: 6, height: 20, fill: 'black', top: 30, originX: 'center', originY: 'center' });
      const bottomBar = new fabric.Rect({ width: 40, height: 6, fill: 'black', top: 40, originX: 'center', originY: 'center' });
      const middleWhiteBox = new fabric.Rect({ width: 40, height: 10, fill: 'white', top: 48, originX: 'center', originY: 'center', selectable: false, evented: false });
      const flippedTopBar = new fabric.Rect({ width: 40, height: 6, fill: 'black', top: 56, originX: 'center', originY: 'center' });
      const flippedTopPole = new fabric.Rect({ width: 6, height: 20, fill: 'black', top: 68, originX: 'center', originY: 'center' });
      icon = new fabric.Group([bottomPole, bottomBar, middleWhiteBox, flippedTopBar, flippedTopPole], {
        left: 600,
        top: 200,
        hasControls: true,
        hasBorders: false,
        selectable: true
      });
      (icon as any).type = 'capacitor';
    }
    else if (type === 'twocircle') {
      const whiteBase = new fabric.Circle({ radius: 22, left: 400, top: 200, fill: 'white', selectable: false, evented: false, originX: 'center', originY: 'center' });
      const bigCircle = new fabric.Circle({ radius: 20, left: 400, top: 200, fill: 'white', stroke: 'green', strokeWidth: 2, originX: 'center', originY: 'center' });
      const smallCircle = new fabric.Circle({ radius: 20, left: 400, top: 180, fill: '', stroke: 'red', strokeWidth: 2, originX: 'center', originY: 'center' });
      icon = new fabric.Group([whiteBase, bigCircle, smallCircle], { left: 360, top: 160, hasControls: true, hasBorders: true, selectable: true });
      (icon as any).type = 'twocircle';
    }
    else if (type === 'triangle') {
      const triangle = new fabric.Triangle({
        width: 60,
        height: 45,
        left: 400,
        top: 180,
        fill: 'white',
        stroke: '#e6e3e3ff',
        strokeWidth: 4,
        angle: 0,
        originX: 'center',
        originY: 'top'
      });
      triangle.set({ hasControls: true, hasBorders: true, selectable: true });
      icon = triangle;
      (icon as any).type = 'triangle';
    }
    else {
      alert('Unknown icon type');
      return;
    }
    // You can extend this block for all your other symbols... (see your original symbol creators)

    if (!icon) {
      alert('Unknown icon type');
      return;
    }


    // 3-digit custom permanentId generate करो
    // addIconToCanvas method में
    const shortPermanentId = getRandomShortId(3);
    (icon as any).permanentId = shortPermanentId;

    // --- UUID हर icon को ----------
    (icon as any).permanentId = shortPermanentId;
    (icon as any).customId = id;          // Configurable by user / auto-generated
    (icon as any).customLabel = label;

    (icon as any).customId = id;
    (icon as any).customLabel = label;
    icon.set({ selectable: true, evented: true });
    icon.on('mouseover', () => this.showIconTooltip(icon!));
    icon.on('mouseout', () => this.hideIconTooltip(icon!));
    addCustomPropsToObject(icon);

    this.canvas.add(icon);
    this.canvas.renderAll();
  }

  showAddZeroShapeDialog() {
    this.iconToAddType = 'zeroShape';
    this.inputIconId = ''; // auto-generate id in popup if blank
    this.inputIconLabel = '';
    this.showIconInputPopup = true; // Yeh popup kholta hai jahan user customize kar sakta hai ya blank chor ke auto id milegi
  }

  showAddOpenSwitchDialog() {
    this.iconToAddType = 'openSwitch';
    this.inputIconId = ''; // Auto-generate if blank
    this.inputIconLabel = '';
    this.showIconInputPopup = true;
  }

  private rebuildMappingsFromCanvas() {
    this.signalToLinesMap = { ...this.redSignalLineMap };
    this.linesSignalsMap = {};

    // Initialize with all line keys having empty sets
    this.canvas.getObjects().forEach(obj => {
      const anyObj = obj as any;
      if ((anyObj.customType === 'lineR' || anyObj.customType === 'lineG' || anyObj.customType === 'lineB') && anyObj.customId) {
        if (!this.linesSignalsMap[anyObj.customId]) {
          this.linesSignalsMap[anyObj.customId] = new Set();
        }
      }
    });

    // Build reverse map from signalToLinesMap
    Object.entries(this.signalToLinesMap).forEach(([signalKey, lineIds]) => {
      // Split multi-signal keys
      const signalList = signalKey.split(',');
      lineIds.forEach(lineId => {
        if (!this.linesSignalsMap[lineId]) {
          this.linesSignalsMap[lineId] = new Set();
        }
        signalList.forEach(signal => {
          this.linesSignalsMap[lineId].add(signal.trim());
        });
      });
    });

  }

  //Shows a blue label(like “ID: label”) near the icon on hover.

  showIconTooltip(icon: fabric.Object) {
    this.removeIconTooltip();
    const id = (icon as any).customId || '';
    const label = (icon as any).customLabel || '';
    if (!id && !label) return;
    const tooltipText = label ? `${id}: ${label}` : id;
    this.activeTooltip = new fabric.Text(tooltipText, {
      left: (icon.left || 0) + (icon.width || 0) / 2 + 10,
      top: (icon.top || 0) - 20,
      fontSize: 14,
      fill: 'blue',
      selectable: false,
      evented: false,
    });
    this.canvas.add(this.activeTooltip);
    this.canvas.renderAll();
  }

  hideIconTooltip(icon: fabric.Object) { this.removeIconTooltip(); }
  removeIconTooltip() {
    if (this.activeTooltip) {
      this.canvas.remove(this.activeTooltip);
      this.activeTooltip = null;
      this.canvas.renderAll();
    }
  }

  // ============== Handlers for Icon Add from Button ==============

  //Each symbol has a helper to open the add - icon popup with the correct type.


  showAddGroundIconDialog() { this.openIconInputPopup('ground'); }
  showAddLineRDialog() { this.openIconInputPopup('lineR'); }
  showAddLineGDialog() { this.openIconInputPopup('lineG'); }
  showAddLineBDialog() { this.openIconInputPopup('lineB'); }
  showAddStarDialog() { this.openIconInputPopup('star'); }
  showAddSwitchDialog() { this.openIconInputPopup('switch'); }
  showAddTrackJoinDialog() { this.openIconInputPopup('trackjoin'); }
  showAddRedSignalDialog() {
    const choice = prompt("Choose redsignal type: normal (n), vertical (v), close horizontal (ch), close vertical (cv)?")?.toLowerCase();
    let label = 'normal';
    if (choice === 'v') label = 'vertical';
    else if (choice === 'ch') label = 'closeHorizontal';
    else if (choice === 'cv') label = 'closeVertical';

    // Counter logic
    const count = this.iconIdCounters['redSignal'] || 0;
    const id = this.generateAutoId('redSignal', count);

    this.iconToAddType = 'redSignal';
    this.inputIconId = id;      // Fill the auto-id for convenience
    this.inputIconLabel = label;
    this.showIconInputPopup = true; // Only popup, NO addIconToCanvas here!

    // Counter increment should happen at add (final confirmation) time
  }
  showAddRedSignalHDialog() { this.openIconInputPopup('redSignalH'); }
  showAddDiagonalCautionDialog() { this.openIconInputPopup('diagonalCaution'); }
  showAddCapacitorDialog() { this.openIconInputPopup('capacitor'); }
  showAddTwoCircleDialog() { this.openIconInputPopup('twocircle'); }
  showAddTriangleDialog() { this.openIconInputPopup('triangle'); }
  // Add similar functions for other symbols



  //Switches between “edit” (objects movable) and “build completed” (locked, popups only).
  isBuildCompleted: boolean = false;
  showWelcomePage: boolean = true;

  completeCircuitBuild() {
    this.isBuildCompleted = true;
    // Remove delete box & text
    if (this.deleteZone) this.canvas.remove(this.deleteZone);
    if (this.deleteText) this.canvas.remove(this.deleteText);
    this.canvas.getObjects().forEach(obj => {
      if (obj !== this.deleteZone && obj !== this.deleteText) {
        obj.selectable = false;
        obj.evented = false;
      }
    });


    Object.values(this.switchLineMap).forEach(({ swRef, joinLineRef }) => {
      if (swRef) {
        swRef.evented = true;
        swRef.selectable = false;
        swRef.off('mouseover');
        swRef.hoverCursor = 'default';



      }
      if (joinLineRef) {
        joinLineRef.evented = true;
        joinLineRef.selectable = false;
        joinLineRef.hoverCursor = 'default';
        joinLineRef.off('mouseover');

      }
    });

    // Setup for ID1 and ID2 switches
    ['ID1', 'ID2'].forEach(signalId => {
      const switchObj = this.canvas.getObjects().find(o => (o as any).customId === signalId);
      if (switchObj) {
        switchObj.selectable = false;

        switchObj.evented = true;
        switchObj.off('mouseover');
        switchObj.hoverCursor = 'default';
      }
    });

    // Setup for dynamically generated lines with customId prefix "connect_line_"

    this.canvas.getObjects()
      .filter(o => (o as any).customId?.startsWith('connect_line_'))
      .forEach(lineObj => {
        lineObj.evented = true;
        lineObj.selectable = false;
        lineObj.off('mouseover');
        lineObj.hoverCursor = 'default';
      });


    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }


  editCircuit() {
    this.isBuildCompleted = false;
    // 🔓 Unlock all objects except the delete zone and text
    this.canvas.getObjects().forEach(obj => {
      if (obj !== this.deleteZone && obj !== this.deleteText) {
        obj.selectable = true;
        obj.evented = true;
      }
    });

    // Wapas add karo agar absent hain
    if (!this.canvas.getObjects().includes(this.deleteZone)) {
      this.canvas.add(this.deleteZone);
    }
    if (!this.canvas.getObjects().includes(this.deleteText)) {
      this.canvas.add(this.deleteText);
    }
    this.canvas.renderAll();
  }



  // On dragging icons:
  // Shows current angle as a rotating label while dragging / rotating.
  // Highlights delete zone when icon is over it.
  // On mouse up: removes the icon if dropped in the zone.
  // Resets rotation / angle display after drop.

  setupDeleteOnDrop(): void {
    let rotationText: fabric.Text | null = null;

    this.canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (!obj) return;

      const left = obj.left || 0;
      const top = obj.top || 0;
      const angle = Math.round(obj.angle || 0);

      // 🔄 Show angle text during drag
      if (!rotationText) {
        rotationText = new fabric.Text(`${angle}°`, {
          left: left + obj.width! / 2,
          top: top - 20,
          fontSize: 18,
          fill: 'green',
          selectable: false,
          evented: false,
        });
        this.canvas.add(rotationText);
      } else {
        rotationText.set({
          text: `${angle}°`,
          left: left + obj.width! / 2,
          top: top - 20,
        });
      }

      // 🟥 Check if inside delete zone during move
      if (
        left + obj.width! / 2 > this.deleteZone.left! &&
        left + obj.width! / 2 < this.deleteZone.left! + this.deleteZone.width! &&
        top + obj.height! / 2 > this.deleteZone.top! &&
        top + obj.height! / 2 < this.deleteZone.top! + this.deleteZone.height!
      ) {
        this.deleteZone.set('fill', '#ff0000'); // red
      } else {
        this.deleteZone.set('fill', '#ddd'); // default
      }

      this.canvas.renderAll();
    });

    // 🔄 Also show rotation angle during rotation
    this.canvas.on('object:rotating', (e) => {
      const obj = e.target;
      if (!obj) return;

      const angle = Math.round(obj.angle || 0);
      const left = obj.left || 0;
      const top = obj.top || 0;

      if (!rotationText) {
        rotationText = new fabric.Text(`${angle}°`, {
          left: left + obj.width! / 2,
          top: top - 20,
          fontSize: 18,
          fill: 'green',
          selectable: false,
          evented: false,
        });
        this.canvas.add(rotationText);
      } else {
        rotationText.set({
          text: `${angle}°`,
          left: left + obj.width! / 2,
          top: top - 20,
        });
      }

      this.canvas.renderAll();
    });

    this.canvas.on('mouse:up', (e) => {
      const obj = e.target;
      if (!obj) return;

      const left = obj.left || 0;
      const top = obj.top || 0;

      // ✅ Final delete if dropped in zone
      if (
        left + obj.width! / 2 > this.deleteZone.left! &&
        left + obj.width! / 2 < this.deleteZone.left! + this.deleteZone.width! &&
        top + obj.height! / 2 > this.deleteZone.top! &&
        top + obj.height! / 2 < this.deleteZone.top! + this.deleteZone.height!
      ) {
        this.canvas.remove(obj);
        this.removeIconTooltip();  // Tooltip ko bhi remove karo jab icon delete ho
      }

      // 🔄 Reset delete zone fill
      this.deleteZone.set('fill', '#ddd');

      // ❌ Remove angle display
      if (rotationText) {
        this.canvas.remove(rotationText);
        rotationText = null;
      }

      this.canvas.renderAll();
    });
  }

  // Helper to check overlap
  // Helper for collision between icon and delete zone.


  isOverDeleteZone(obj: fabric.Object): boolean {
    if (!this.deleteZone) return false;

    const objBounds = obj.getBoundingRect();
    const zoneBounds = this.deleteZone.getBoundingRect();

    // Simple rectangle intersection formula
    const overlap = !(
      objBounds.left > zoneBounds.left + zoneBounds.width ||
      objBounds.left + objBounds.width < zoneBounds.left ||
      objBounds.top > zoneBounds.top + zoneBounds.height ||
      objBounds.top + objBounds.height < zoneBounds.top
    );
    return overlap;
  }

 onCircuitSelect() {
  if (this.selectedCircuitId == null) return;

  const selected = this.circuits.find(c => c.id === Number(this.selectedCircuitId));

  if (selected) {

    // 👇 DEBUG
    console.log("====================================");
    console.log("Selected Circuit :", selected.name);
    console.log("Selected Circuit ID :", selected.id);

    const jsonStr = selected.canvasJson || selected.canvasData;

    console.log("JSON Length :", jsonStr?.length);

    const data = JSON.parse(jsonStr);

    console.log("Saved closedSignalsArray :", data.closedSignalsArray);

    console.log(
      "Red Signals in JSON :",
      data.objects
        .filter((o: any) => o.customType === "redSignal")
        .map((o: any) => o.customId)
    );

    console.log("====================================");

    this.showWelcomePage = false;
    this.loadCanvasFromJson(jsonStr);

    // this.loadRulesFromDb();
  }
}


  async loadCanvasFromJson(json: string): Promise<void> {
    this.isCanvasLoading = true;

    try {
      if (!json) return;

      // 1) Clean slate
      this.clearCanvas();

      // If clearCanvas preserves deleteZone/deleteText in your implementation,
      // remove them now to avoid duplicates/flicker.
      if (this.deleteZone) this.canvas.remove(this.deleteZone);
      if (this.deleteText) this.canvas.remove(this.deleteText);

      // 2) Parse + restore state
      const data = typeof json === 'string' ? JSON.parse(json) : (json as any);

      this.selectedCircuitName = data.name || '';
      this.redSignalDisplayMap = RED_SIGNAL_MAPS[this.selectedCircuitName] ?? {};

      const objectsArray = data.objects || [];

      this.redSignalLineMap = data.redSignalLineMap || {};
      this.redSignalLineOverrideMap = data.redSignalLineOverrideMap || {};
      this.closedSignals = new Set<string>(data.closedSignalsArray || []);
      console.log("Saved closedSignalsArray:", data.closedSignalsArray);
      
      await this.fetchRulesForCurrentCircuit();
      await this.fetchFaultRulesForCurrentCircuit();

      if (this.selectedCircuitName === 'HSR_Board') {
        this.closedSignals.add('RS18');  // HSR board
        this.closedSignals.add('RS20');  // HSR board


        this.closedSignals.delete('RS9');
        this.closedSignals.delete('RS10');
        this.closedSignals.delete('RS15');
      }
      if (this.selectedCircuitName === 'RBR_Board') {
        this.closedSignals.add('RS68');
        this.closedSignals.add('RS11');

        this.closedSignals.delete('RS8');

      }



      if (this.selectedCircuitName === 'Branch_Line_Board') {
        this.closedSignals.add('RS0041'); //branch line board
        this.closedSignals.add('RS00046'); //branch line board
        this.closedSignals.add('RS00049');//branch line board
        // this.closedSignals.add('RS68'); //branch line board
        // this.closedSignals.add('RS67');//branch line board
      }
      if (this.selectedCircuitName === 'Main_Line_Board') {
        this.closedSignals.add('RS00065');
        this.closedSignals.add('RS65');
        this.closedSignals.add('RS0064');
        this.closedSignals.add('RS0061');
        this.closedSignals.add('RS048');
        this.closedSignals.add('RS049');
        this.closedSignals.add('RS044');
      }
      if (this.selectedCircuitName === 'NEW_BOARD') {
        this.closedSignals.add('RS1');
        this.closedSignals.add('RS3');
        this.closedSignals.add('RS46');
        this.closedSignals.add('RS47');
        this.closedSignals.add('RS11');
        this.closedSignals.add('RS68');

      }

      // 3) Enliven objects (Promise-safe for both callback + promise fabric variants)
      const enlivenedObjects: fabric.Object[] = await new Promise((resolve, reject) => {
        try {
          const maybePromise = (fabric.util as any).enlivenObjects(
            objectsArray,
            (objs: fabric.Object[]) => resolve(objs)
          );

          // If your fabric build returns a Promise, support that too
          if (maybePromise && typeof maybePromise.then === 'function') {
            maybePromise.then(resolve).catch(reject);
          }
        } catch (e) {
          reject(e);
        }
      });

      // 4) Add to canvas (no inner canvas.getObjects() scans)
      for (const obj of enlivenedObjects) {
        if (!obj) continue;

        const anyObj = obj as any;

        // Ensure custom props are present (mostly no-op, but safe)
        anyObj.customId = anyObj.customId;
        anyObj.customLabel = anyObj.customLabel;
        anyObj.customType = anyObj.customType;

        // Restore your custom 'type' field (keep as any; Fabric's obj.type is not meant to be reassigned)
        anyObj.type = anyObj.type;

        obj.off('mouseover');
        obj.off('mouseout');
        obj.on('mouseover', this.showIconTooltip.bind(this, obj));
        obj.on('mouseout', this.hideIconTooltip.bind(this, obj));

        this.canvas.add(obj);
      }

      // 5) One render pass, then mappings/colors (important)
      this.canvas.requestRenderAll();
      await new Promise<void>(r => requestAnimationFrame(() => r()));

      this.rebuildMappingsFromCanvas();
      this.updateLineColors();
      this.setupAllSwitchLineToggles();
      this.attachSwitchHandlers();

      // If you want build-locked mode after load (your current flow does this)
      this.completeCircuitBuild();

      this.canvas.requestRenderAll();
      await new Promise<void>(r => requestAnimationFrame(() => r()));

    } finally {
      this.isCanvasLoading = false;
      console.log('✅ loadCanvasFromJson COMPLETE - objects:', this.canvas.getObjects().length);
    }
  }



  //Saves canvas data from a slot as a JSON file via download.
  exportSlotToFile(slot: number): void {
    const dataStr = localStorage.getItem(`circuit_slot_${slot}`);
    if (!dataStr) {
      alert(`❌ No data found in Slot ${slot + 1}`);
      return;
    }
    const data = JSON.parse(dataStr);
    const fileName = data.name ? `${data.name}.json` : `circuit_slot_${slot + 1}.json`;
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }


  //Loads circuit data from a file, validates, and saves it to a slot.
  importFileToSlot(event: Event, slot: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      alert('❌ No file selected');
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const jsonString = reader.result as string;

        // Validate JSON
        const parsed = JSON.parse(jsonString);

        // Optional: Validate it's an array of fabric objects
        if (!parsed.objects || !Array.isArray(parsed.objects)) {
          throw new Error("Invalid format: missing objects array");
        }


        // Save to slot
        localStorage.setItem(`circuit_slot_${slot}`, jsonString);
        alert(`✅ File imported and saved to Slot ${slot + 1}`);
      } catch (e) {
        alert('❌ Invalid circuit file');
      }
    };

    reader.readAsText(file);
  }

  //To save 3 circuits on UI

  // savedCanvasJSONs: string[] = []; // optional in-memory backup
  // MAX_SLOTS = 3;

  // ✅ SAVE to a slot (0, 1, 2)


  circuitNamePopupVisible = false;
  inputCircuitName = '';
  saveSlotPending = -1;



  // Saves the current canvas(except delete objects) as a JSON in a slot and also to the backend.
  // Save the current canvas (except delete objects) as a JSON in a slot and also to the backend.
  saveToSlot(slot: number): void {
    if (this.circuitNamePopupVisible) return; // prevent multiple popups

    const existingData = localStorage.getItem(`circuit_slot_${slot}`);
    if (existingData) {
      alert(`❗Slot ${slot + 1} already has a saved circuit.\nPlease delete it first before saving a new one.`);
      return; // Popup nahi dikhana agar slot full hai
    }

    this.saveSlotPending = slot;
    this.inputCircuitName = '';
    this.circuitNamePopupVisible = true;  // Popup tabhi dikhao jab slot free ho
  }


  confirmSaveCircuit() {
  const slot = this.saveSlotPending;
  const name = this.inputCircuitName.trim();

  if (!name) { alert('Circuit name cannot be empty.'); return; }

  const existingData = localStorage.getItem(`circuit_slot_${slot}`);
  if (existingData) {
    alert(`❗Slot ${slot + 1} already has a saved circuit.\nPlease delete it first.`);
    this.circuitNamePopupVisible = false;
    this.saveSlotPending = -1;
    return;
  }

  const objectsToSave = this.canvas.getObjects().filter(obj =>
    obj !== this.deleteZone && obj !== this.deleteText
  );
  const jsonObjects = objectsToSave.map(obj => obj.toObject());

  const saveData = {
    name,
    objects: jsonObjects,
    redSignalLineMap: this.redSignalLineMap,
    redSignalLineOverrideMap: this.redSignalLineOverrideMap,
    closedSignalsArray: Array.from(this.closedSignals),
  };

  localStorage.setItem(`circuit_slot_${slot}`, JSON.stringify(saveData));

  this.circuitService.saveCircuit(saveData).subscribe({
    next: (response) => {
      console.log('✅ circuit saved in canvas_data. Ab rules DB me daal raha hoon...');
      this.persistRulesForName(name);   // <-- YAHIN rules naam ke saath DB me jaate hain
      alert(`Circuit saved as "${name}"`);
      this.circuitNamePopupVisible = false;
      this.saveSlotPending = -1;
    },
    error: (error) => {
      alert('❌ Error saving circuit to backend, but data saved locally.');
      console.error('Error saving circuit:', error);
    }
  });
}

private persistRulesForName(name: string) {
  console.log('💾 persistRulesForName CALLED. name =', name, '| boardRules count =', this.boardRules.length);
  if (!name) { console.warn('⚠️ name khaali, skip'); return; }

  // purane rules hatane ki koshish — agar method/endpoint na ho to bhi create CHALEGA
  const svc: any = this.circuitService;
  if (typeof svc.deleteRulesByName === 'function') {
    svc.deleteRulesByName(name).subscribe({
      next: () => this.createAllRules(name),
      error: () => this.createAllRules(name)   // delete fail ho to bhi create karo
    });
  } else {
    console.warn('⚠️ deleteRulesByName service me nahi — seedha create kar raha hoon');
    this.createAllRules(name);
  }
}

private createAllRules(name: string) {
  if (!this.boardRules.length) {
    console.warn('⚠️ boardRules KHAALI hai — kuch save nahi hoga. Pehle rule add karo, phir save.');
    return;
  }
  this.boardRules.forEach(r => {
    const payload = {
      circuitName: name,                 // <-- NAAM yahin jaata hai
      whenCondition: r.when,
      linesCsv: r.lines.join(','),
      stroke: r.stroke || 'red',
      priority: r.priority || 1
    };
    console.log('➕ creating rule payload:', payload);
    this.circuitService.createRule(payload).subscribe({
      next: (saved: any) => { r.id = saved?.id; console.log('✅ rule saved, id =', saved?.id); },
      error: (e) => console.error('❌ rule save FAIL:', e)
    });
  });
}

  // Load JSON from a slot, reconstruct objects using Fabric's enlivenObjects and restore signal states.
  loadFromSlot(slot: number, afterLoadCallback?: () => void): void {
    const data = localStorage.getItem(`circuit_slot_${slot}`);
    if (!data) {
      alert(`❌ No circuit saved in Slot ${slot + 1}`);
      return;
    }

    this.clearCanvas();

    const parsed = JSON.parse(data);

    this.redSignalLineMap = parsed.redSignalLineMap || {};
    this.redSignalLineOverrideMap = parsed.redSignalLineOverrideMap || {};   // <-- Yeh bhi restore karo

    this.closedSignals = new Set(parsed.closedSignalsArray || []);
    this.boardRules = parsed.rules || [];

    fabric.util.enlivenObjects(parsed.objects).then((enlivenedObjects) => {
      enlivenedObjects.forEach(obj => {
        if (obj instanceof fabric.Object) {
          const anyObj = obj as any;
          anyObj.customId = anyObj.customId || '';
          anyObj.customLabel = anyObj.customLabel || '';
          anyObj.customType = anyObj.customType || obj.type || '';

          const fabricObj = obj as fabric.Object & { on: (event: string, handler: (e?: any) => void) => void };
          fabricObj.on('mouseover', () => this.showIconTooltip(obj));
          fabricObj.on('mouseout', () => this.hideIconTooltip(obj));

          this.canvas.add(obj);
        }
      });

      // Rebuild signal and line mappings dynamically
      this.rebuildMappingsFromCanvas();

      // Update colors of lines using closedSignals set
      this.updateLineColors();

      this.canvas.renderAll();
      if (afterLoadCallback) afterLoadCallback();

    }).catch(err => {
      console.error('Error loading canvas:', err);
      alert('❌ Failed to load circuit');
    });

  }


  updateLineColorsForRedSignal(redSignalId: string, makeRed: boolean) {
    const lineIds = this.redSignalLineMap[redSignalId] || [];
    this.canvas.getObjects().forEach(obj => {
      if ((obj as any).customId && lineIds.includes((obj as any).customId)) {
        const type = (obj as any).customType;
        // Only process green and red lines, ignore black lines
        if (type === 'lineG' || type === 'lineR') {
          if (makeRed) {
            obj.set('stroke', 'red');
          } else {
            // Restore to original color
            obj.set('stroke', (obj as any).originalStroke || 'green');
          }
        }
        // Black lineB ignored
      }
    });
    this.canvas.renderAll();
  }



  // Removes data for a slot from local storage and clears the canvas.

  deleteSlot(slotNumber: number): void {
    localStorage.removeItem(`circuit_slot_${slotNumber}`); // 🔁 key name fix
    this.clearCanvas(); // 👈 Clear canvas when deleted
    alert(`🗑️ Circuit ${slotNumber + 1} deleted.`);
  }


  // Shows or removes an angle label for rotated icons.


  updateRotationLabel(obj: fabric.Object) {
    this.removeAngleLabels();

    const angle = obj.angle || 0;

    const angleLabel = new fabric.Text(`${Math.round(angle)}°`, {
      left: obj.left! + (obj.width || 0) / 2 + 10,
      top: obj.top! - 10,
      fontSize: 14,
      fill: 'blue',
      selectable: false,
      evented: false,
    }) as fabric.Text & { name: string };

    angleLabel.name = 'angleLabel';
    this.canvas.add(angleLabel);
    this.canvas.renderAll();
  }

  removeAngleLabels() {
    const labels = this.canvas.getObjects('text').filter(obj => (obj as any).name === 'angleLabel');
    labels.forEach(label => this.canvas.remove(label));
  }


  // Zoom in/out of the canvas.
  zoomIn() {
    this.canvas.setZoom(this.canvas.getZoom() * 1.1);
  }

  zoomOut() {
    this.canvas.setZoom(this.canvas.getZoom() / 1.1);
  }


  // ClearCanvas: Removes everything except deleteZone and deleteText.
  clearCanvas(): void {
    const objectsToPreserve = [this.deleteZone, this.deleteText];
    this.canvas.getObjects().forEach((obj: fabric.Object) => {
      if (!objectsToPreserve.some(o => o === obj)) {
        this.canvas.remove(obj);
      }
    });
    this.canvas.renderAll();
  }
   // ===== Rule Builder (DB-driven) =====
showRuleBuilder = false;
showRulesManager = false;
ruleLines = '';
ruleWhen = '';
rulePriority = 1;
editingRuleIndex: number | null = null;

// circuit select hote hi DB se uske rules le aao
loadRulesFromDb() {
  if (!this.selectedCircuitName) { this.boardRules = []; this.updateLineColors(); return; }
  this.circuitService.getRulesByName(this.selectedCircuitName).subscribe({
    next: (rows) => {
      this.boardRules = (rows || []).map((r: any) => ({
        id: r.id,
        when: r.whenCondition,
        lines: (r.linesCsv || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        stroke: r.stroke || 'red',
        priority: r.priority || 1
      }));
      this.updateLineColors();   // live apply
    },
    error: (e) => { console.error('Rules load fail', e); this.boardRules = []; }
  });
}
// loadCanvasFromJson ke andar use hoga — await karke rules le aata hai
// NAYA (name-based)
private fetchRulesForCurrentCircuit(): Promise<void> {
  return new Promise((resolve) => {
    if (!this.selectedCircuitName) { this.boardRules = []; resolve(); return; }
    this.circuitService.getRulesByName(this.selectedCircuitName).subscribe({
      next: (rows) => {
        this.boardRules = (rows || []).map((r: any) => ({
          id: r.id,
          when: r.whenCondition,
          lines: (r.linesCsv || '').split(',').map((s: string) => s.trim()).filter(Boolean),
          stroke: r.stroke || 'red',
          priority: r.priority || 1
        }));
        console.log('✅ DB rules loaded:', this.boardRules.length, 'for', this.selectedCircuitName);
        resolve();
      },
      error: (e) => { console.error('❌ rules fetch fail', e); this.boardRules = []; resolve(); }
    });
  });
}

// ===== Change 2: DB rows ko CircuitRuleSet shape me convert karta hai =====
private buildCircuitRuleSet(rows: any[]): CircuitRuleSet {
  const set: CircuitRuleSet = {
    normalMode: [],
    faultMode: { preconditions: {}, resolutionMap: {} }
  };

  const safeParse = (s: any, fallback: any) => {
    if (s === null || s === undefined || s === '') return fallback;
    try { return JSON.parse(s); } catch { return fallback; }
  };

  // ---- NORMAL MODE ----
  rows.filter(r => r.mode === 'normal')
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
      .forEach(r => {
        const rule: NormalRule = {
          controlledSignal: r.controlledSignal,
          preconditions: safeParse(r.preconditions, [])
        };
        const rev = safeParse(r.reverseJson, null);
        if (rev && rev.signal) rule.reverse = rev;
        set.normalMode.push(rule);
      });

  // ---- FAULT MODE ----
  rows.filter(r => r.mode === 'fault').forEach(r => {
    const lg = r.ruleName;
    if (!lg) return;

    const pre = safeParse(r.preconditions, []);
    if (r.controlledSignal && pre.length) {
      const fr: FaultRule = { controlledSignal: r.controlledSignal, preconditions: pre };
      const rev = safeParse(r.reverseJson, null);
      if (rev && rev.signal) fr.reverse = rev;
      set.faultMode.preconditions[lg] = fr;
    }

    const res = safeParse(r.resolution, null);
    if (res && res.length) set.faultMode.resolutionMap[lg] = res;
  });

  return set;
}

// ===== Change 3: DB se fault rules le aata hai =====
private fetchFaultRulesForCurrentCircuit(): Promise<void> {
  return new Promise((resolve) => {
    if (!this.selectedCircuitName) { this.activeCircuitRule = null; resolve(); return; }
    this.circuitService.getFaultRulesByName(this.selectedCircuitName).subscribe({
      next: (rows) => {
        this.activeCircuitRule = this.buildCircuitRuleSet(rows || []);
        console.log('✅ Fault rules loaded for', this.selectedCircuitName,
          '| normal:', this.activeCircuitRule.normalMode.length,
          '| faultLines:', Object.keys(this.activeCircuitRule.faultMode.preconditions).length);
        resolve();
      },
      error: (e) => { console.error('❌ fault rules fetch fail', e); this.activeCircuitRule = null; resolve(); }
    });
  });
}


openRuleBuilder() {
  this.editingRuleIndex = null;
  this.ruleLines = ''; this.ruleWhen = ''; this.rulePriority = 1;
  this.showRulesManager = false;
  this.showRuleBuilder = true;
}

openRulesManager() { this.showRulesManager = true; }

editRule(i: number) {
  const r = this.boardRules[i];
  this.editingRuleIndex = i;
  this.ruleLines = r.lines.join(', ');
  this.ruleWhen = r.when;
  this.rulePriority = r.priority;
  this.showRulesManager = false;
  this.showRuleBuilder = true;
}

private getCanvasIds(prefix: string): string[] {
  return this.canvas.getObjects()
    .map(o => (o as any).customId)
    .filter(id => typeof id === 'string' && id.startsWith(prefix));
}

addRule() {
  const lines = this.ruleLines.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  const when = this.ruleWhen.trim().toUpperCase();
  if (!lines.length || !when) { alert('Need Lines and Conditions'); return; }

  const availRS = new Set(this.getCanvasIds('RS'));
  const availLG = new Set(this.getCanvasIds('LG'));
  const usedRS = when.match(/RS\w+/g) || [];
  const badRS = usedRS.filter(rs => !availRS.has(rs));
  const badLG = lines.filter(lg => !availLG.has(lg));
  if (badRS.length) { alert('This RS is not related to this board: ' + badRS.join(', ')); return; }
  if (badLG.length) { alert('This LG is not related to this board: ' + badLG.join(', ')); return; }

  if (this.editingRuleIndex !== null) {
    this.boardRules[this.editingRuleIndex] = { when, lines, stroke: 'red', priority: this.rulePriority || 1 };
    this.editingRuleIndex = null;
  } else {
    this.boardRules.push({ when, lines, stroke: 'red', priority: this.rulePriority || 1 });
  }
  this.showRuleBuilder = false;
  this.updateLineColors();
}

ddeleteRule(i: number) {
  if (!confirm('Do you want to delete this rule?')) return;
  this.boardRules.splice(i, 1);
  this.updateLineColors();
}

}
