import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CircuitService } from '../services/circuit.service';
import * as fabric from 'fabric';
import { circuitLogicRegistry } from '../circuit-logics';
import { mainCircuitLogic, Circuit5Logic, GILDUICOMCircuitLogic, MainBoardLogic } from '../circuit-logics'
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { RED_SIGNAL_MAPS } from 'src/utils/RED_SIGNAL_MAPS';



// import { v4 as uuidv4 } from 'uuid';

// ===== LOGIC BUILDER TYPES - TOP mein add karo =====
interface LineRule {
  when: string;
  lines: string[];
  stroke: 'red' | 'green';
  priority?: number;
}

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
        LG8: {
          controlledSignal: 'RS8',
          preconditions: [
            ['RS6', 'RS4', 'RS12', 'RS11'],
            ['RS4', 'RS5', 'RS12', 'RS11'],
            ['RS4', 'RS5', 'RS12', 'RS18'],
            ['RS16', 'RS6', 'RS11']
          ],
          reverse: { signal: 'RS18', conditions: [['RS11']] }
        },

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
            ['RS5', 'RS6', 'RS11'],
            ['RS5', 'RS6', 'RS18'],
            ['RS4', 'RS12', 'RS6', 'RS11']
          ],
          reverse: { signal: 'RS18', conditions: [['RS11']] }
        },

        LG12: {
          controlledSignal: 'RS8',
          preconditions: [
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
            ['RS25', 'RS15', 'RS11'],
            ['RS25', 'RS15', 'RS18'],
            ['RS15', 'RS26', 'RS38', 'RS45', 'RS11'],
            ['RS15', 'RS27', 'RS11'],
            ['RS15', 'RS17', 'RS11']
          ],
          reverse: { signal: 'RS8', conditions: [['RS11']] }
        },

        LG25: {
          controlledSignal: 'RS18',
          preconditions: [
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
            ['RS25', 'RS26', 'RS37', 'RS11'],
            ['RS25', 'RS26', 'RS37', 'RS18'],
            ['RS15', 'RS26', 'RS37', 'RS11']
          ],
          reverse: { signal: 'RS8', conditions: [['RS11']] }
        },

        LG39: {
          controlledSignal: 'RS18',
          preconditions: [
            ['RS26', 'RS27', 'RS39', 'RS11'],
            ['RS26', 'RS27', 'RS39', 'RS18'],
            ['RS26', 'RS17', 'RS39', 'RS11'],
            ['RS17', 'RS15', 'RS11']
          ],
          reverse: { signal: 'RS8', conditions: [['RS11']] }
        },

        LG45: {
          controlledSignal: 'RS18',
          preconditions: [
            ['RS15', 'RS17', 'RS11'],
            ['RS38', 'RS45', 'RS37', 'RS11'],
            ['RS38', 'RS45', 'RS37', 'RS18']
          ],
          reverse: { signal: 'RS8', conditions: [['RS11']] }
        },

        LG46: {
          controlledSignal: 'RS18',
          preconditions: [
            ['RS38', 'RS45', 'RS39', 'RS11'],
            ['RS38', 'RS45', 'RS39', 'RS18'],
            ['RS15', 'RS17', 'RS11']
          ],
          reverse: { signal: 'RS8', conditions: [['RS11']] }
        }
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
        LG46: ['RS38', 'RS45', 'RS39']
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
          preconditions: [['RS2']],
          reverse: { signal: 'RS011', conditions: [['RS20']] }
        },

        LG3: {
          controlledSignal: 'RS8',
          preconditions: [['RS5']],
          reverse: { signal: 'RS011', conditions: [['RS20']] }
        },

        LG24: {
          controlledSignal: 'RS11',
          preconditions: [['RS15']],
          reverse: { signal: 'RS8', conditions: [['RS20']] }
        },

        LG32: {
          controlledSignal: 'RS45',
          preconditions: [['RS037']],
          reverse: { signal: '', conditions: [] }
        },

        LG33: {
          controlledSignal: 'RS45',
          preconditions: [['RS39']],
          reverse: { signal: '', conditions: [] }
        },

        LG40: {
          controlledSignal: 'RS45',
          preconditions: [['RS40']],
          reverse: { signal: '', conditions: [] }
        },

        LG57: {
          controlledSignal: 'RS44',
          preconditions: [['RS50']],
          reverse: { signal: '', conditions: [] }
        },

        LG53: {
          controlledSignal: 'RS44',
          preconditions: [['RS49']],
          reverse: { signal: '', conditions: [] }
        },

        LG62: {
          controlledSignal: 'RS56',
          preconditions: [['RS53']],
          reverse: { signal: '', conditions: [] }
        },

        LG75: {
          controlledSignal: 'RS57',
          preconditions: [['RS64']],
          reverse: { signal: '', conditions: [] }
        },

        LG65: {
          controlledSignal: 'RS57',
          preconditions: [['RS060']],
          reverse: { signal: '', conditions: [] }
        },
      },


      resolutionMap: {
        LG1: ['RS2'],
        LG2: ['RS2'],
        LG3: ['RS5'],
        LG24: ['RS15'],
        LG32: ['RS037'],
        LG33: ['RS39'],
        LG40: ['RS40'],
        LG57: ['RS50'],
        LG53: ['RS49'],
        LG62: ['RS53'],
        LG75: ['RS64'],
        LG65: ['RS060']

      }
    }
  },

  /* =====================================================
     🟢 CIRCUIT5 (LOGIC READY, REVERSE EMPTY)
  ===================================================== */



};



function addCustomPropsToObject(obj: fabric.Object) {
  if (obj.type === 'group' || obj.type === 'redSignal' || obj.type === 'redSignalH') {
    if (!('type' in obj) || !(obj as any).type) {
      (obj as any).type = guessTypeFromContent(obj);
    }
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
  timestamp: string;
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
  templateUrl: './tpc.component.html',
  styleUrls: ['./tpc.component.css'],
})
export class TpcComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasElement!: ElementRef<HTMLCanvasElement>;
  canvas!: fabric.Canvas;
  deleteZone!: fabric.Rect;
  deleteText!: fabric.Text;

  sessionId: number = 0;
  faultLine: string | undefined;
  faultResolved: boolean = false;
  userActions: string[] = [];
  pendingSessionId: string | null = null;
  pendingAdminId: string | null = null;
  showFaultRequestPopup = false;

  idPopupVisible: boolean = false;
  circuits: any[] = [];

  private circuitFeederMap: Record<string, { id: number, name: string }[]> = {
    'RBR_Board': [
      { id: 1, name: 'DBN-TSS - PTA-SSP' },
      { id: 2, name: 'DBN-TSS - NBA-SSP' },
      { id: 3, name: 'HYA-TSS - SEQ-SSP' },
      { id: 4, name: 'HYA-TSS - TPA-SSP' }
    ],
    'HSR_Board': [
      { id: 5, name: 'KUP-TSS - AHH-SSP' },
      { id: 6, name: 'KUP-TSS - MET-SSP' },
      { id: 7, name: 'CJL-TSS - SFMU-SSP' },
      { id: 8, name: 'CJL-TSS - LHA-SSP' },
      { id: 9, name: 'UKN-TSS - PLI-SSP' },
      { id: 10, name: 'UKN-TSS - BXC-SSP' }
    ],
    'Main_Line_Board': [
      { id: 11, name: 'RPJ-TSS - SBJ-SSP' },
      { id: 12, name: 'RPJ-TSS - SMU-SSP' },
      { id: 13, name: 'SNL-TSS - CHA-SSP' },
      { id: 14, name: 'JUDW-TSS - RAA-SSP' },
      { id: 15, name: 'JUDW-TSS - SSW-SSP' }
    ],
    'Branch_Line_Board': [
      { id: 16, name: 'GHG-TSS - CDG-SSP' },
      { id: 17, name: 'GHG-TSS - DHPR-SSP' },
      { id: 18, name: 'PNO-TSS - KLK-SSP' },
      { id: 19, name: 'ANSB-TSS - NLDM-SSP' },
      { id: 20, name: 'ANSB-TSS - BARJ-SSP' },
      { id: 21, name: 'KRLI-TSS - RPAR-SSP' },
      { id: 22, name: 'KRLI-TSS - NMDA-SSP' }
    ]
  };

  feeders: { id: number, name: string }[] = [];
  selectedFeederId: number | null = null;

  // ✅ NAYA: feeder id se uske BM RS ids ka mapping
  private feederBMMap: Record<number, string[]> = {
    1: ['RS16', 'RS6',],
    2: ['RS15', 'RS17'],
    3: ['RS64', 'RS66'],
    4: ['RS67', 'RS65'],
    5: ['RS7', 'RS5'],
    6: ['RS9', 'RS15'],
    7: ['RS042', 'RS40'],
    8: ['RS46', 'RS49'],
    9: ['RS54', 'RS53'],
    10: ['RS55'],
    11: ['RS21', 'RS23'],
    12: ['RS24', 'RS25'],
    13: ['RS1', 'RS2', 'RS4', 'RS3', 'RS001'],
    14: ['RS87', 'RS89'],
    15: ['RS90', 'RS88'],
    16: ['RS24', 'RS25'],
    17: ['RS26', 'RS27'],
    18: ['RS2'],
    19: ['RS66', 'RS62'],
    20: ['RS69', 'RS63'],
    21: ['RS54'],
    22: ['RS55']

  };

  selectedCircuitId: number | null = null;
  redSignalDisplayMap: { [key: string]: string } = {

  };
  connectionsMap: Record<string, string[]> = {
    'ID1': ['LB21', 'LB12'],
    'ID2': ['LB13', 'LB14']
  };
  sw1Ref!: fabric.Group;
  joinLineRef!: fabric.Line;

  showIconInputPopup = false;
  inputIconId: string = '';
  inputIconLabel: string = '';
  public iconToAddType: string | null = null;
  isCanvasLoading: boolean = false;
  detailedUserActions: UserAction[] = [];

  username: string = sessionStorage.getItem('username') || 'User';

  isLogicAddMode = false;
  logicRules: LineRule[] = [];
  currentRuleIndex = 0;
  showLogicEditor = false;
  logicEditorX = 20;
  logicEditorY = 120;
  isDraggingEditor = false;

  rsChips: string[] = [];
  lgChips: string[] = [];
  currentRuleWhen = '';

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
    zeroShape: 0
  };

  private sseConnection: EventSource | null = null;

  private activeTooltip: fabric.Text | null = null;
  savedCanvasJSONs: string[] = [];
  MAX_SLOTS = 3;

  addTextPopupVisible: boolean = false;
  inputTextValue: string = '';
  circuitsRaw: any[] = [];


  constructor(private http: HttpClient, private circuitService: CircuitService, private router: Router, private route: ActivatedRoute) { }

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

  private closedSignals: Set<string> = new Set();

  private linesSignalsMap: Record<string, Set<string>> = {};

  redSignalStateMap: Record<string, 'open' | 'close'> = {};

  closeTypeSignalStateMap: Record<string, boolean> = {};

  private selectedCircuitName: string = '';
  selectedCircuitNames: string | null = null;

  isRedSignalPopupEnabled = true;

  popupTitle: string = '';

  private signalToLinesMap: Record<string, string[]> = {
    'CK4': ['YNE', 'LB1'],
    'RS2': ['45V'],
    'RS1': ['LB1', 'LR1'],
  };


  ngOnInit(): void {
    this.connectSSE();
    this.circuitSubscription =
      this.circuitService.selectedCircuit$.subscribe(name => {
        console.log('📥 Canvas subscription fired');
        console.log('📛 Received circuit name from service:', name);

        if (!name) return;

        this.selectedCircuitNames = name;

        if (this.pendingFaultActivation) {
          console.log('▶️ Pending fault released after circuit load');
          this.pendingFaultActivation = false;
          this.detectFaultMode();
        }
      });

    this.isCanvasLoading = true;

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
        } else {
          console.error('Data is not array:', data);
          this.circuitsRaw = [];
          this.circuits = [];
        }
      },
      error: (err) => {
        console.error('Error loading circuits:', err);
        this.isCanvasLoading = false;
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
    this.setupBuildCompleteIconClick();
    this.setupLineTapHandler();

    this.canvas.on('mouse:down', (e) => {
      const obj = e.target;
      if (!obj) return;
      const id = (obj as any).permanentId;
      const name = (obj as any).customId;
      console.log('PermanentId:', id, 'CustomId:', name);
    });

    this.redSignalLineMap = {
      'RS1,RS2': ['LG2', 'LG3', 'LG5'],
      'RS31': ['LG1', 'LG2', 'LG3', 'LG7'],
      'RS1': ['LG1'],
      'RS2': ['LG2'],
      'RS0': ['LG3'],
      'RS3': ['LG4']
    };

    this.redSignalLineOverrideMap = {
      'RS1,RS3': ['LG7', 'LG8', 'LG11', 'LG12'],
      'RS5,RS6': ['LG2']
    };

    this.rebuildMappingsFromCanvas();
    this.updateLineColors();
  }

  private connectSSE() {
    const userId = sessionStorage.getItem('username');
    if (!userId) return;

    const url = this.circuitService.getUserSseUrl(userId);
    this.sseConnection = new EventSource(url);

    console.log('🔌 SSE Connected for user:', userId);

    this.sseConnection.addEventListener('fault-request', (event: any) => {
      const data = JSON.parse(event.data);
      this.pendingSessionId = data.sessionId;
      this.pendingAdminId = data.adminId;
      this.showFaultRequestPopup = true;
      console.log('📨 Fault request received:', data);
    });

    this.sseConnection.addEventListener('fault-activated', (event: any) => {
      const data = JSON.parse(event.data);
      this.selectedCircuitNames = data.circuitName;
      this.faultLine = data.line;
      this.circuitService.setSelectedCircuit(data.circuitName);

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
    this.disconnectSSE();
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
    const textObj = new fabric.Text(this.inputTextValue, {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: 'black',
      backgroundColor: '',
      selectable: true,
      evented: true
    });
    (textObj as any).type = 'canvasText';
    this.canvas.add(textObj);
    this.canvas.renderAll();
    this.addTextPopupVisible = false;
  }

  startTime: number | null = null;
  endTime: number | null = null;

  private getFaultControlledSignal(circuitName: string, faultLine: string): string | undefined {
    return CIRCUIT_RULES?.[circuitName]?.faultMode?.preconditions?.[faultLine]?.controlledSignal;
  }


  detectFault() {
    if (!this.faultLine) {
      console.error('❌ Fault line missing');
      return;
    }

    const circuitName = this.selectedCircuitNames;
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


  isFaultDetectionMode: boolean = false;
  faultRedSignals: string[] = [];


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
    this.detailedUserActions = [];

    const leftCircuit = this.circuits.find(c => c.name === this.selectedCircuitNames);
    if (!leftCircuit || (!leftCircuit.canvasData && !leftCircuit.canvasJson)) {
      console.warn("⚠️ Circuit not found or no canvas data");
      return;
    }

    this.selectedCircuitId = leftCircuit.id;
    this.selectedCircuitName = this.selectedCircuitNames;

    this.completeCircuitBuild();

    this.loadCanvasFromJson(leftCircuit.canvasData || leftCircuit.canvasJson)
      .then(() => {
        console.log('✅ Canvas fully loaded, objects:', this.canvas.getObjects().length);

        this.startFaultBlinkEffect();
        this.updateLineColors();
        this.canvas.renderAll();
        this.rebuildMappingsFromCanvas();
        this.setupAllSwitchLineToggles();
        this.attachSwitchHandlers();

        this.canvas.getObjects().forEach(obj => {
          if (obj !== this.deleteZone && obj !== this.deleteText) {
            obj.selectable = false;
            obj.evented = true;
            obj.off('mouseover');
            obj.hoverCursor = 'default';
          }
        });

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

    const readableSequence = this.detailedUserActions.map(action =>
      `${action.displayName} ${action.action} ${action.timestamp}`
    );
    console.log("🔍 Readable sequence:", readableSequence);

    const endTime = Date.now();
    const startTime = this.startTime || endTime;
    const timeTaken = endTime - startTime;
    const timeTakenMinutes = timeTaken / (1000 * 60);

    this.circuitService.sendAllUserActions(this.faultLine, this.userActions)
      .subscribe({
        next: (res: any) => {
          console.log("🧩 Backend response:", res);

          const readableCorrect = (res.correctSequence || []).map((id: string) =>
            this.redSignalDisplayMap[id] || id
          );

          let fcbFlipCount = 0;
          if (readableSequence.length > 0) {
            const firstVal = this.extractBracketValue(readableSequence[0]);
            const total = readableSequence.filter(s => this.extractBracketValue(s) === firstVal).length;
            fcbFlipCount = Math.floor(total / 2);
          }

          let percentage = 0;

          if (fcbFlipCount <= 5) {
            percentage = 100;
          } else if (fcbFlipCount === 6 || fcbFlipCount === 7) {
            percentage = Number(((5 / fcbFlipCount) * 100).toFixed(1));
          } else {
            percentage = 0;
          }

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

          const payload = {
            userName: sessionStorage.getItem("username"),
            faultLine: this.faultLine,
            fcbFlipCount,
            resultPercentage: percentage,
            userSequence: JSON.stringify(readableSequence),
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
            sessionId: this.pendingSessionId,
            userId
          }).subscribe({
            next: () => console.log("✅ Fault session marked RESOLVED"),
            error: err => console.error("❌ Failed to mark session resolved:", err)
          });

          this.router.navigate(['/result'], {
            queryParams: {
              message: encodeURIComponent(verificationMessage),
              seq: JSON.stringify(readableSequence),
              correct: JSON.stringify(readableCorrect),
              line: this.faultLine,
              faultLine: this.faultLine,
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
    const match = item.match(/\[([^\]]+)\]/);
    return match ? match[1] : '';
  }

  countBracketMatches(value: string, arr: string[]): number {
    return arr.filter(x => this.extractBracketValue(x) === value).length;
  }

  elapsedSeconds = 0;
  formattedTime = '00:00';
  timerInterval: any;

  startUITimer() {
    if (this.startTime === null) return;

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
    }, 300);

    setTimeout(() => clearInterval(beepInterval), duration * 1000);
  }

  startFaultBlinkEffect() {
    this.playBeepSequence(15, 3);

    let blinkCount = 0;
    const blinkLimit = 10;
    const canvasBgColors = ['#fff', '#FFD700'];

    const blinkInterval = setInterval(() => {
      this.canvas.backgroundColor = canvasBgColors[blinkCount % 2];
      this.canvas.renderAll();
      blinkCount++;
      if (blinkCount > blinkLimit) {
        clearInterval(blinkInterval);
        this.canvas.backgroundColor = '#fff';
        this.canvas.renderAll();
      }
    }, 300);
  }

  shortCircuitEffectAt(redSignalId: string) {
    const icon = this.canvas.getObjects().find(obj =>
      (obj as any).customId === redSignalId
    );
    if (!icon) return;

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
        const prevPopup = this.popupIcon;
        this.popupIcon = obj;
        this.onRedSignalState('close', isAuto);
        this.popupIcon = prevPopup;
        console.log(`🔴 Auto-closed redSignal: ${rsId}`);
      }
    });
  }

  toggleLogicAddMode() {
    this.isLogicAddMode = !this.isLogicAddMode;

    if (this.isLogicAddMode) {
      this.showLogicEditor = true;
      this.logicRules = [];
      this.rsChips = [];
      this.lgChips = [];
      this.currentRuleWhen = '';
      this.currentRuleIndex = 0;
      this.isRedSignalPopupEnabled = false;
      this.canvas.on('mouse:down', this.onLogicModeTap.bind(this));
      console.log('🛠️ Logic Mode ON - Tap Lines/RS!');
    } else {
      this.showLogicEditor = false;
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

        if (type?.includes('line') || type === 'path' || type === 'lineR' || type === 'lineG') {
          if (!this.lgChips.includes(id)) {
            this.lgChips.push(id);
            this.showTapFeedback(id, `✅ LG: ${id}`, 'green');
          }
          break;
        }
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

  addOperatorToRS(op: string) {
    if (this.rsChips.length === 0) return;
    const lastIndex = this.rsChips.length - 1;
    this.rsChips.splice(lastIndex + 1, 0, op);
    this.updateRSWhen();
  }
  private getBoardSignals(boardName: string): string[] {

    const feeders =
      this.circuitFeederMap[boardName] || [];

    let signals: string[] = [];

    feeders.forEach(feeder => {

      const feederSignals =
        this.feederBMMap[feeder.id] || [];

      signals.push(...feederSignals);
    });

    return signals;
  }


  onRedSignalState(state: 'open' | 'close', isAuto: boolean = false) {

    if (!this.popupIcon) {
      this.closePopup();
      return;
    }



    const redSignalId = (this.popupIcon as any).customId || '';

    if (!isAuto && this.selectedFeederId) {

      // selected feeder signals
      const allowedSignals =
        this.feederBMMap[this.selectedFeederId] || [];

      // current board ke sab feeder signals
      const boardSignals =
        this.getBoardSignals(this.selectedCircuitName);

      // same board ka BM hai?
      const isBoardSignal =
        boardSignals.includes(redSignalId);

      // selected feeder ka nahi hai?
      const isAnotherFeederBM =
        isBoardSignal &&
        !allowedSignals.includes(redSignalId);

      if (isAnotherFeederBM) {

        Swal.fire({
          icon: 'warning',
          title: 'Operation Not Allowed',
          text: 'This BM belongs to another feeder of this board'
        });

        this.closePopup();
        return;
      }
    }

    // ✅ SIRF YE NAYA BLOCK ADD KARO — baaki sab same rahega
    if (state === 'close' && !isAuto) {
      const feederRSIds = this.selectedFeederId
        ? (this.feederBMMap[this.selectedFeederId] || [])
        : [];

      if (feederRSIds.includes(redSignalId)) {
        const displayName = this.redSignalDisplayMap[redSignalId] || redSignalId;
        const savedIcon = this.popupIcon; // ✅ reference save karo
        Swal.fire({
          title: 'Have you ensured?',

          html: `
    <div style="
      text-align:left;
      font-size:25px;
      line-height:1.5;
      color:#000000;
      font-weight:600;
    ">
      <div style="
        background:#ffcccc;
        padding:15px;
        border-radius:10px;
        border:2px solid #dc2626;
      ">
        <b>A.</b> No Electric train movement through Emergency cross over?<br><br>

        <b>B.</b> Feed extended from nearby TSS.
      </div>
    </div>
  `,

          icon: 'warning',

          background: '#ff4d4d',   // red background
          color: '#000000',        // black font

          showCancelButton: true,

          confirmButtonText: 'Yes',
          cancelButtonText: 'No',

          confirmButtonColor: '#22c55e', // green
          cancelButtonColor: '#6b7280',  // grey

          customClass: {
            popup: 'alert-popup'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            this.popupIcon = savedIcon; // ✅ restore karo
            this.onRedSignalState('close', true); // ✅ isAuto=true se confirmation skip hogi
          } else {
            this.closePopup();
          }
        });
        return; // ✅ Yahan se bahar niklo
      }
    }

    const label = (this.popupIcon as any).customLabel || '';
    const isCloseType = (label === 'closeHorizontal' || label === 'closeVertical');

    const circuitRule = CIRCUIT_RULES[this.selectedCircuitName];

    // =====================================================
    // 🔵 NORMAL MODE
    // =====================================================
    if (!this.isFaultDetectionMode && circuitRule?.normalMode) {

      if (state === 'close') this.closedSignals.add(redSignalId);
      else this.closedSignals.delete(redSignalId);

      for (const rule of circuitRule.normalMode) {

        const controlledSignal = rule.controlledSignal;
        const preconditions = rule.preconditions;

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

        if (rule.reverse) {
          const reverseActive = rule.reverse.conditions.some(seq =>
            seq.every(rs => !this.closedSignals.has(rs))
          );

          if (reverseActive && !this.closedSignals.has(rule.reverse.signal)) {
            this.closeRedSignalsByIds([rule.reverse.signal]);
          }

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
      this.userActions.push(redSignalId);
      console.log('🧾 Recorded actions:', this.userActions);

      const displayName = this.redSignalDisplayMap[redSignalId] || redSignalId;
      const time = new Date().toLocaleTimeString('en-US', {
        hour12: true, hour: 'numeric', minute: '2-digit'
      });

      this.detailedUserActions.push({
        id: redSignalId,
        displayName,
        action: isAuto ? 'trip' : state,
        timestamp: time
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

      const faultRule = circuitRule.faultMode.preconditions[this.faultLine];

      if (faultRule) {
        const controlledSignal = faultRule.controlledSignal;
        const preconditions = faultRule.preconditions;

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

        if (redSignalId !== controlledSignal) {
          const stillValid = preconditions.some(seq =>
            seq.every(rs => this.closedSignals.has(rs))
          );

          if (!stillValid && !this.closedSignals.has(controlledSignal)) {
            this.closeRedSignalsByIds([controlledSignal]);
          }
        }

        if (faultRule.reverse && !this.faultResolved) {
          const reverseActive = faultRule.reverse.conditions.some(seq =>
            seq.every(rs => !this.closedSignals.has(rs))
          );

          if (reverseActive && !this.closedSignals.has(faultRule.reverse.signal)) {
            this.closeRedSignalsByIds([faultRule.reverse.signal]);
          }

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

      const required = circuitRule.faultMode.resolutionMap[this.faultLine];

      if (required && required.every(rs => this.closedSignals.has(rs))) {
        this.faultResolved = true;
      }
    }

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
          this.closeTypeSignalStateMap[redSignalId] = true;
          this.overrideActivatedSignals.delete(redSignalId);
          setSignalState(90, '#8B0000');
        } else {
          this.closedSignals.add(redSignalId);
          this.closeTypeSignalStateMap[redSignalId] = false;
          this.overrideActivatedSignals.add(redSignalId);
          setSignalState(0, 'green');
        }
      } else {
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
        this.closedSignals.delete(redSignalId);
        this.closeTypeSignalStateMap[redSignalId] = true;
        setSignalState(90, '#8B0000');
      } else {
        this.closedSignals.add(redSignalId);
        this.closeTypeSignalStateMap[redSignalId] = false;
        setSignalState(0, 'green');
      }
      this.updateLineColors();
      return;
    }

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


  setupLineTapHandler(): void {
    console.log('🔥 LineTapHandler ACTIVE');

    this.canvas.on('mouse:down', (e) => {
      console.log('🖱️ Mouse down');

      const pointer = this.canvas.getPointer(e.e);

      for (const obj of this.canvas.getObjects()) {
        if (obj === this.deleteZone || obj === this.deleteText) continue;

        let type = (obj as any).type;
        const customType = (obj as any).customType;
        const customId = (obj as any).customId;

        if (customType?.includes('line') || type === 'path' || type === 'line') {
          const bounds = obj.getBoundingRect();

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
            return;
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
          this.isPopupCurrentlyVisible = true;
          this.openPopupForIcon(obj);
          break;
        }
      }
    });
  }

  closePopup() {
    this.popupVisible = false;
    this.isPopupCurrentlyVisible = false;
    this.canvas.discardActiveObject();
    this.popupLabel = '';
    this.popupSignalId = null;
    this.popupTitle = '';
    this.popupType = '';
    this.canvas.renderAll();
  }

  onlyShowOpenOption: boolean = false;

  openPopupForIcon(icon: fabric.Object) {
    if (!this.isRedSignalPopupEnabled) return;

    let type = (icon as any).type || '';
    if (!type || type === 'group') {
      type = guessTypeFromContent(icon);
    }
    if (type !== 'redSignal') return;

    const id = (icon as any).customId || '';
    const label = (icon as any).customLabel || '';

    // Seedha popup dikhao — confirmation yahan nahi hogi
    this.showRedSignalPopup(icon, id, label, type);
  }

  // ✅ NAYA METHOD: actual popup dikhane ka kaam karta hai
  private showRedSignalPopup(icon: fabric.Object, id: string, label: string, type: string) {
    this.popupVisible = true;
    this.popupIcon = icon;
    this.popupType = type;
    this.popupId = id;
    this.popupLabel = label;
    this.isPopupCurrentlyVisible = true;
    this.popupTitle = this.redSignalDisplayMap[id] || `${type} [ID: ${id}]`;

    const isCloseType = (label === 'closeHorizontal' || label === 'closeVertical');

    if (isCloseType) {
      this.onlyShowOpenOption = !this.closeTypeSignalStateMap[id];
    } else {
      this.onlyShowOpenOption = this.closedSignals.has(id);
    }

    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }


  openIconInputPopup(iconType: string) {
    if (this.isBuildCompleted) {
      return;
    }
    this.iconToAddType = iconType;
    this.inputIconId = '';
    this.inputIconLabel = '';
    this.showIconInputPopup = true;
  }

  confirmAddIcon() {
    if (!this.iconToAddType) return;
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
      zeroShape: 'CY'
    };
    return (prefixMap[type] || 'ID') + count;
  }

  setRedSignalColor(icon: fabric.Object, color: string) {
    console.log('setRedSignalColor called with type:', (icon as any).type, ', fabric type:', icon.type);
    if ((icon as any).type && icon.type === 'group') {
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

  private circuitColorLogicMap: Record<string, () => void> = {
    'Branch_Line_Board': () => Circuit5Logic(this.canvas, this.closedSignals),
    'RBR_Board': () => mainCircuitLogic(this.canvas, this.closedSignals),
    'HSR_Board': () => GILDUICOMCircuitLogic(this.canvas, this.closedSignals),
    'Main_Line_Board': () => MainBoardLogic(this.canvas, this.closedSignals),
  };

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

    const onObjectClick = () => this.onLineClick(signalId);

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

  movePointTowards(start: { x: number, y: number }, end: { x: number, y: number }, distance: number) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return start;
    return {
      x: start.x + (dx / length) * distance,
      y: start.y + (dy / length) * distance
    };
  }

  attachSwitchHandlers() {
    Object.keys(this.connectionsMap).forEach(signalId => {
      const switchObj = this.canvas.getObjects().find(obj => (obj as any).customId === signalId);
      if (!switchObj) return;
      switchObj.off('mousedown');
      switchObj.on('mousedown', () => this.onSwitchClick(signalId));
    });
  }

  closeIdPopup() {
    this.idPopupVisible = false;
    this.popupType = "";
    this.popupSignalId = null;
    this.canvas.renderAll();
  }

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

  setupAllSwitchLineToggles() {
    Object.entries(this.switchLineMap).forEach(([swId, data]) => {
      const swGroup = this.canvas.getObjects().find(
        obj => (obj as any).customId === swId && obj.type === 'group'
      ) as fabric.Group;

      if (!swGroup) {
        console.warn(`Switch ${swId} not found`);
        return;
      }
      data.swRef = swGroup;

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

  private updateLineColors(): void {
    const logicFn = this.circuitColorLogicMap[this.selectedCircuitName];
    if (logicFn) {
      logicFn();
    }
  }

  private idCounter = 1;

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
      (icon as any).customType = type;
      (icon as any).originalStroke = colorMap[type];
    }
    else if (type === 'star') {
      const diag1 = new fabric.Line([-20, -20, 20, 20], { stroke: 'black', strokeWidth: 6, originX: 'center', originY: 'center' });
      const diag2 = new fabric.Line([20, -20, -20, 20], { stroke: 'black', strokeWidth: 6, originX: 'center', originY: 'center' });
      icon = new fabric.Group([diag1, diag2], { left: 500, top: 200, hasControls: true, lockScalingFlip: true });
      (icon as any).type = 'star';
    }
    else if (type === 'switch') {
      const leftPath = new fabric.Path('M 0 0 L 16 0 Q 20 -10, 25 -25', { stroke: 'black', strokeWidth: 6, fill: '', originX: 'center', originY: 'center' });
      const rightPath = new fabric.Path('M 0 0 L -16 0 Q -20 10, -25 25', { stroke: 'black', strokeWidth: 6, fill: '', originX: 'center', originY: 'center' });
      leftPath.set({ left: -15 });
      rightPath.set({ left: 15 });
      const whiteMask = new fabric.Ellipse({ rx: 10, ry: 10, fill: 'white', originX: 'center', originY: 'center', left: 0, top: 0, selectable: false, evented: false });
      icon = new fabric.Group([whiteMask, leftPath, rightPath], { left: 600, top: 200, hasControls: true, hasBorders: false, selectable: true });
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
        left: 600, top: 200, hasControls: true, hasBorders: false, selectable: true,
        originX: 'center', originY: 'center', objectCaching: false, angle: 0,
      });
      (icon as any).type = 'redSignal';
      (icon as any).customId = id;
      (icon as any).customOrientation = isVertical ? 'vertical' : 'normal';
      (icon as any).customLabel = label;
      (icon as any).isCloseType = isClose;
    }
    else if (type === 'zeroShape') {
      const points = [
        { x: 50, y: 20 }, { x: 62, y: 30 }, { x: 62, y: 50 },
        { x: 50, y: 62 }, { x: 38, y: 50 }, { x: 38, y: 30 }, { x: 50, y: 20 }
      ];
      icon = new fabric.Polygon(points, {
        left: 460, top: 200, fill: 'white', stroke: 'black', strokeWidth: 6,
        selectable: true, hasControls: true, hasBorders: false, originX: 'center', originY: 'top'
      });
      (icon as any).type = 'zeroShape';
      (icon as any).customId = id;
      (icon as any).customLabel = label;
    }
    else if (type === 'openSwitch') {
      const leftCircle = new fabric.Circle({ radius: 10, fill: 'white', stroke: 'black', strokeWidth: 2, left: 300, top: 200, originX: 'center', originY: 'center' });
      const rightCircle = new fabric.Circle({ radius: 10, fill: 'white', stroke: 'black', strokeWidth: 2, left: 370, top: 200, originX: 'center', originY: 'center' });
      const lever = new fabric.Rect({ left: 310, top: 200, width: 65, height: 5, fill: 'black', stroke: 'black', strokeWidth: 1, angle: -25, rx: 2, ry: 2, originX: 'left', originY: 'center' });
      icon = new fabric.Group([leftCircle, rightCircle, lever], { left: 340, top: 200, hasControls: true, selectable: true, hasBorders: false });
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
      const base = new fabric.Polygon([{ x: -11, y: -11 }, { x: 11, y: -11 }, { x: 11, y: 11 }, { x: -11, y: 11 }], { fill: '#934bc7ff', originX: 'center', originY: 'center' });
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
      icon = new fabric.Group([bottomPole, bottomBar, middleWhiteBox, flippedTopBar, flippedTopPole], { left: 600, top: 200, hasControls: true, hasBorders: false, selectable: true });
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
      const triangle = new fabric.Triangle({ width: 60, height: 45, left: 400, top: 180, fill: 'white', stroke: '#e6e3e3ff', strokeWidth: 4, angle: 0, originX: 'center', originY: 'top' });
      triangle.set({ hasControls: true, hasBorders: true, selectable: true });
      icon = triangle;
      (icon as any).type = 'triangle';
    }
    else {
      alert('Unknown icon type');
      return;
    }

    if (!icon) {
      alert('Unknown icon type');
      return;
    }

    const shortPermanentId = getRandomShortId(3);
    (icon as any).permanentId = shortPermanentId;
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
    this.inputIconId = '';
    this.inputIconLabel = '';
    this.showIconInputPopup = true;
  }

  showAddOpenSwitchDialog() {
    this.iconToAddType = 'openSwitch';
    this.inputIconId = '';
    this.inputIconLabel = '';
    this.showIconInputPopup = true;
  }

  private rebuildMappingsFromCanvas() {
    this.signalToLinesMap = { ...this.redSignalLineMap };
    this.linesSignalsMap = {};

    this.canvas.getObjects().forEach(obj => {
      const anyObj = obj as any;
      if ((anyObj.customType === 'lineR' || anyObj.customType === 'lineG' || anyObj.customType === 'lineB') && anyObj.customId) {
        if (!this.linesSignalsMap[anyObj.customId]) {
          this.linesSignalsMap[anyObj.customId] = new Set();
        }
      }
    });

    Object.entries(this.signalToLinesMap).forEach(([signalKey, lineIds]) => {
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

    const count = this.iconIdCounters['redSignal'] || 0;
    const id = this.generateAutoId('redSignal', count);

    this.iconToAddType = 'redSignal';
    this.inputIconId = id;
    this.inputIconLabel = label;
    this.showIconInputPopup = true;
  }

  showAddRedSignalHDialog() { this.openIconInputPopup('redSignalH'); }
  showAddDiagonalCautionDialog() { this.openIconInputPopup('diagonalCaution'); }
  showAddCapacitorDialog() { this.openIconInputPopup('capacitor'); }
  showAddTwoCircleDialog() { this.openIconInputPopup('twocircle'); }
  showAddTriangleDialog() { this.openIconInputPopup('triangle'); }

  isBuildCompleted: boolean = false;
  showWelcomePage: boolean = true;

  completeCircuitBuild() {
    this.isBuildCompleted = true;
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

    ['ID1', 'ID2'].forEach(signalId => {
      const switchObj = this.canvas.getObjects().find(o => (o as any).customId === signalId);
      if (switchObj) {
        switchObj.selectable = false;
        switchObj.evented = true;
        switchObj.off('mouseover');
        switchObj.hoverCursor = 'default';
      }
    });

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
    this.canvas.getObjects().forEach(obj => {
      if (obj !== this.deleteZone && obj !== this.deleteText) {
        obj.selectable = true;
        obj.evented = true;
      }
    });

    if (!this.canvas.getObjects().includes(this.deleteZone)) {
      this.canvas.add(this.deleteZone);
    }
    if (!this.canvas.getObjects().includes(this.deleteText)) {
      this.canvas.add(this.deleteText);
    }
    this.canvas.renderAll();
  }

  setupDeleteOnDrop(): void {
    let rotationText: fabric.Text | null = null;

    this.canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (!obj) return;

      const left = obj.left || 0;
      const top = obj.top || 0;
      const angle = Math.round(obj.angle || 0);

      if (!rotationText) {
        rotationText = new fabric.Text(`${angle}°`, {
          left: left + obj.width! / 2, top: top - 20, fontSize: 18, fill: 'green', selectable: false, evented: false,
        });
        this.canvas.add(rotationText);
      } else {
        rotationText.set({ text: `${angle}°`, left: left + obj.width! / 2, top: top - 20 });
      }

      if (
        left + obj.width! / 2 > this.deleteZone.left! &&
        left + obj.width! / 2 < this.deleteZone.left! + this.deleteZone.width! &&
        top + obj.height! / 2 > this.deleteZone.top! &&
        top + obj.height! / 2 < this.deleteZone.top! + this.deleteZone.height!
      ) {
        this.deleteZone.set('fill', '#ff0000');
      } else {
        this.deleteZone.set('fill', '#ddd');
      }

      this.canvas.renderAll();
    });

    this.canvas.on('object:rotating', (e) => {
      const obj = e.target;
      if (!obj) return;

      const angle = Math.round(obj.angle || 0);
      const left = obj.left || 0;
      const top = obj.top || 0;

      if (!rotationText) {
        rotationText = new fabric.Text(`${angle}°`, {
          left: left + obj.width! / 2, top: top - 20, fontSize: 18, fill: 'green', selectable: false, evented: false,
        });
        this.canvas.add(rotationText);
      } else {
        rotationText.set({ text: `${angle}°`, left: left + obj.width! / 2, top: top - 20 });
      }

      this.canvas.renderAll();
    });

    this.canvas.on('mouse:up', (e) => {
      const obj = e.target;
      if (!obj) return;

      const left = obj.left || 0;
      const top = obj.top || 0;

      if (
        left + obj.width! / 2 > this.deleteZone.left! &&
        left + obj.width! / 2 < this.deleteZone.left! + this.deleteZone.width! &&
        top + obj.height! / 2 > this.deleteZone.top! &&
        top + obj.height! / 2 < this.deleteZone.top! + this.deleteZone.height!
      ) {
        this.canvas.remove(obj);
        this.removeIconTooltip();
      }

      this.deleteZone.set('fill', '#ddd');

      if (rotationText) {
        this.canvas.remove(rotationText);
        rotationText = null;
      }

      this.canvas.renderAll();
    });
  }

  isOverDeleteZone(obj: fabric.Object): boolean {
    if (!this.deleteZone) return false;

    const objBounds = obj.getBoundingRect();
    const zoneBounds = this.deleteZone.getBoundingRect();

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

    this.selectedFeederId = null;
    this.feeders = [];

    const selected = this.circuits.find(c => c.id === Number(this.selectedCircuitId));
    if (selected) {
      this.showWelcomePage = false;
      this.loadCanvasFromJson(selected.canvasJson || selected.canvasData);
      this.feeders = this.circuitFeederMap[selected.name] || [];
    }
  }

  async loadCanvasFromJson(json: string): Promise<void> {
    this.isCanvasLoading = true;

    try {
      if (!json) return;

      this.clearCanvas();

      if (this.deleteZone) this.canvas.remove(this.deleteZone);
      if (this.deleteText) this.canvas.remove(this.deleteText);

      const data = typeof json === 'string' ? JSON.parse(json) : (json as any);

      this.selectedCircuitName = data.name || '';
      this.redSignalDisplayMap = RED_SIGNAL_MAPS[this.selectedCircuitName] ?? {};

      const objectsArray = data.objects || [];

      this.redSignalLineMap = data.redSignalLineMap || {};
      this.redSignalLineOverrideMap = data.redSignalLineOverrideMap || {};
      this.closedSignals = new Set<string>(data.closedSignalsArray || []);
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

      const enlivenedObjects: fabric.Object[] = await new Promise((resolve, reject) => {
        try {
          const maybePromise = (fabric.util as any).enlivenObjects(
            objectsArray,
            (objs: fabric.Object[]) => resolve(objs)
          );

          if (maybePromise && typeof maybePromise.then === 'function') {
            maybePromise.then(resolve).catch(reject);
          }
        } catch (e) {
          reject(e);
        }
      });

      for (const obj of enlivenedObjects) {
        if (!obj) continue;

        const anyObj = obj as any;
        anyObj.customId = anyObj.customId;
        anyObj.customLabel = anyObj.customLabel;
        anyObj.customType = anyObj.customType;
        anyObj.type = anyObj.type;

        obj.off('mouseover');
        obj.off('mouseout');
        obj.on('mouseover', this.showIconTooltip.bind(this, obj));
        obj.on('mouseout', this.hideIconTooltip.bind(this, obj));

        this.canvas.add(obj);
      }

      this.canvas.requestRenderAll();
      await new Promise<void>(r => requestAnimationFrame(() => r()));

      this.rebuildMappingsFromCanvas();
      this.updateLineColors();
      this.setupAllSwitchLineToggles();
      this.attachSwitchHandlers();

      this.completeCircuitBuild();

      this.canvas.requestRenderAll();
      await new Promise<void>(r => requestAnimationFrame(() => r()));

    } finally {
      this.isCanvasLoading = false;
      console.log('✅ loadCanvasFromJson COMPLETE - objects:', this.canvas.getObjects().length);
    }
  }

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
        const parsed = JSON.parse(jsonString);

        if (!parsed.objects || !Array.isArray(parsed.objects)) {
          throw new Error("Invalid format: missing objects array");
        }

        localStorage.setItem(`circuit_slot_${slot}`, jsonString);
        alert(`✅ File imported and saved to Slot ${slot + 1}`);
      } catch (e) {
        alert('❌ Invalid circuit file');
      }
    };

    reader.readAsText(file);
  }

  circuitNamePopupVisible = false;
  inputCircuitName = '';
  saveSlotPending = -1;

  saveToSlot(slot: number): void {
    if (this.circuitNamePopupVisible) return;

    const existingData = localStorage.getItem(`circuit_slot_${slot}`);
    if (existingData) {
      alert(`❗Slot ${slot + 1} already has a saved circuit.\nPlease delete it first before saving a new one.`);
      return;
    }

    this.saveSlotPending = slot;
    this.inputCircuitName = '';
    this.circuitNamePopupVisible = true;
  }

  confirmSaveCircuit() {
    const slot = this.saveSlotPending;
    const name = this.inputCircuitName.trim();

    if (!name) {
      alert('Circuit name cannot be empty.');
      return;
    }

    const existingData = localStorage.getItem(`circuit_slot_${slot}`);
    if (existingData) {
      alert(`❗Slot ${slot + 1} already has a saved circuit.\nPlease delete it first before saving a new one.`);
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

  loadFromSlot(slot: number, afterLoadCallback?: () => void): void {
    const data = localStorage.getItem(`circuit_slot_${slot}`);
    if (!data) {
      alert(`❌ No circuit saved in Slot ${slot + 1}`);
      return;
    }

    this.clearCanvas();

    const parsed = JSON.parse(data);

    this.redSignalLineMap = parsed.redSignalLineMap || {};
    this.redSignalLineOverrideMap = parsed.redSignalLineOverrideMap || {};
    this.closedSignals = new Set(parsed.closedSignalsArray || []);

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

      this.rebuildMappingsFromCanvas();
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
        if (type === 'lineG' || type === 'lineR') {
          if (makeRed) {
            obj.set('stroke', 'red');
          } else {
            obj.set('stroke', (obj as any).originalStroke || 'green');
          }
        }
      }
    });
    this.canvas.renderAll();
  }

  deleteSlot(slotNumber: number): void {
    localStorage.removeItem(`circuit_slot_${slotNumber}`);
    this.clearCanvas();
    alert(`🗑️ Circuit ${slotNumber + 1} deleted.`);
  }

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

  zoomIn() {
    this.canvas.setZoom(this.canvas.getZoom() * 1.1);
  }

  zoomOut() {
    this.canvas.setZoom(this.canvas.getZoom() / 1.1);
  }

  clearCanvas(): void {
    const objectsToPreserve = [this.deleteZone, this.deleteText];
    this.canvas.getObjects().forEach((obj: fabric.Object) => {
      if (!objectsToPreserve.some(o => o === obj)) {
        this.canvas.remove(obj);
      }
    });
    this.canvas.renderAll();
  }
}