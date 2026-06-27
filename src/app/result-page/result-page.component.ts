import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CircuitService } from '../services/circuit.service';

@Component({
  selector: 'app-result-page',
  templateUrl: './result-page.component.html',
  styleUrls: ['./result-page.component.css']
})
export class ResultPageComponent implements OnInit {
  message!: string;
  resultClass: string = '';
  line: string = '';
  sequence: string = '';
  faultLine: string = '';
  videoSrc: string = '';
  posterSrc: string = '';



  enteredPin: string = '';
  pinVerified: boolean = false;
  pinError: boolean = false;

  // 🆕 Percentage variables
  faultCounter: number = 3;
  showPercentageView: boolean = true;
  percentage: number = 100;
  percentageMessage: string = '';

  // 🆕 Readable sequence from CanvasComponent
  readableSequence: string[] = [];

  // 🆕 Missing properties
  sequenceLoaded: boolean = false;

  // 🆕 Time & pass/fail flags
  timeTakenMs: number = 0;
  timeTakenMinutes: number = 0;
  isPass: boolean = true;
  isFlipFail: boolean = false;
  isTimeFail: boolean = false;
  failReason: string = '';
  selectedCircuitNames: string | null = null;



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private circuitService: CircuitService
  ) { }

  ngOnInit() {
    this.updatePercentageView(); // 🆕 Initialize percentage
    // 🔹 service se circuit name listen karo
    this.circuitService.selectedCircuit$.subscribe(name => {
      if (name) {
        this.selectedCircuitNames = name;
        console.log('ResultPage got circuit name:', name);
      }
    });

    this.route.queryParams.subscribe(params => {
      this.message = decodeURIComponent(params['message'] || '');
      this.line = params['line'] || '';
      this.faultLine = params['faultLine'] || 'No fault line';

      console.log('⚙️ Fault Line from params:', this.faultLine);

      // if (this.faultLine && this.faultLine !== 'No fault line') {
      //   this.videoSrc = `assets/demo-videos/${this.faultLine}.mp4`;
      //   this.posterSrc = `assets/demo-videos/${this.faultLine}-poster.jpg`;
      // }

      if (this.faultLine && this.faultLine !== 'No fault line' && this.selectedCircuitNames) {
        // 2) Ab circuit wise folder ka path banao
        this.videoSrc = `assets/demo-videos/${this.selectedCircuitNames}/${this.faultLine}.mp4`;
        this.posterSrc = `assets/demo-videos/${this.selectedCircuitNames}/${this.faultLine}-poster.jpg`;
      }


      // 🆕 Time & FCB data from params
      const fcbParam = params['fcbFlipCount'];
      const timeParam = params['timeTaken'];

      // Canvas se percentage aa raha ho to use kar lo, warna apna logic
      const percentageParam = params['percentage'];

      if (fcbParam != null) {
        const fcb = Number(fcbParam);
        if (!isNaN(fcb)) {
          this.faultCounter = fcb; // UI pe "FCB Tripped: X times"
        }
      }

      if (timeParam != null) {
        const t = Number(timeParam);
        if (!isNaN(t)) {
          this.timeTakenMs = t;
          this.timeTakenMinutes = this.timeTakenMs / (1000 * 60);
        }
      }

      // Sequence parse logic (as-is)
      const seqParam = params['seq'];
      if (seqParam) {
        try {
          this.readableSequence = JSON.parse(decodeURIComponent(seqParam));
          console.log("👁‍🗨 Readable user sequence:", this.readableSequence);

          // Agar sequence se bhi counter chahiye to yaha se nikaal sakte ho,
          // but abhi primary counter fcbFlipCount se aa raha hai.
        } catch (error) {
          console.error('❌ Sequence parse error:', error);
          this.readableSequence = [];
        }
      }

      // 🆕 PASS/FAIL combined logic yahi pe
      this.applyPassFailLogic(percentageParam);

      if (this.message.includes('✅')) {
        this.resultClass = 'success';
      } else if (this.message.includes('❌')) {
        this.resultClass = 'error';
      } else if (this.message.includes('⚠️')) {
        this.resultClass = 'warning';
      }
    });


    // Load saved sequence
    const savedSeq = this.circuitService.getSequence();
    if (savedSeq && savedSeq.trim() !== '') {
      this.sequence = savedSeq;
    }

    // SSE listener
    const eventSource = new EventSource("/api/fault-detection/stream");
    eventSource.addEventListener("fault-sequence", (event: any) => {
      console.log("SSE RECEIVED:", event.data);
      this.sequence = event.data;
      this.circuitService.setSequence(event.data);
    });
  }

  private applyPassFailLogic(percentageParam?: any) {
    const fcb = this.faultCounter;

    // Percentage input: agar queryParams se aaya hai to use karo,
    // warna existing counter-based logic se calculate karo.
    if (percentageParam != null) {
      const p = Number(percentageParam);
      if (!isNaN(p)) {
        this.percentage = p;
      }
    } else {
      // OLD percentage logic, faultCounter based
      // if (fcb <= 5) {
      //   this.percentage = 100;
      // } else if (fcb === 6 || fcb === 7) {
      //   this.percentage = parseFloat(((5 / fcb) * 100).toFixed(1));
      // } else {
      //   this.percentage = 0; // FAIL
      // }
      if (fcb <= 5) {
          this.percentage = 100;
        } else if (fcb === 6) {
          this.percentage = 80;
        } else if (fcb === 7) {
          this.percentage = 60;
        } else {
          this.percentage = 0; // FAIL
        }
    }

    // Combined fail rules:
    // 1) FCB > 5 -> flip fail
    // 2) timeTakenMinutes > 5 -> time fail
    this.isFlipFail = this.faultCounter > 7;
    this.isTimeFail = this.timeTakenMinutes > 5;

    this.isPass = !(this.isFlipFail || this.isTimeFail);

    if (this.isPass) {
      // PASS – normal percentage UI
      this.showPercentageView = true;
      this.failReason = '';

      // Friendly message for pass
      if (this.percentage >= 90) {
        this.percentageMessage = `Well done! You found the fault in the correct way with ${this.percentage}% accuracy. Keep it up!`;
      } else if (this.percentage >= 80) {
        this.percentageMessage = `Great job! fault detected for the correct way with ${this.percentage}% accuracy. Almost perfect!`;
      }
      // else if (this.percentage >= 70) {
      //   this.percentageMessage = `Good work! You detected fault properly at ${this.percentage}%. Could be better though.`;
      // } else {
      //   this.percentageMessage = `Nice try! fault found at ${this.percentage}%. Practice more!`;
      // }
    } else {
      // FAIL – circle hide karo, clear percentageMessage, fail reason set karo
      this.showPercentageView = false;

      if (this.isFlipFail && this.isTimeFail) {
        this.failReason = 'Fault resolution failed because FCB tripped too many times and total time exceeded 5 minutes.';
      } else if (this.isFlipFail) {
        this.failReason = 'Fault resolution failed because FCB tripped more than 7 times.';
      } else if (this.isTimeFail) {
        this.failReason = 'Fault resolution failed because you took more than 5 minutes.';
      }

      this.percentageMessage = this.failReason;
    }

    console.log('PASS/FAIL:', {
      faultCounter: this.faultCounter,
      timeTakenMinutes: this.timeTakenMinutes,
      isPass: this.isPass,
      isFlipFail: this.isFlipFail,
      isTimeFail: this.isTimeFail,
      percentage: this.percentage
    });
  }


  // 🆕 Helper: Bracket ke andar ka value nikalne ke liye (e.g. "FCB 640")
  private extractBracketValue(item: string): string {
    const match = item.match(/\[([^\]]+)\]/);
    return match ? match[1].trim() : '';
  }

  // 🆕 Helper: Puri array me same bracket value kitni baar hai count karne ke liye
  private countBracketValueOccurrences(value: string, arr: string[]): number {
    return arr.filter(item => {
      const itemValue = this.extractBracketValue(item);
      return itemValue === value;
    }).length;
  }

  testCounter(count: number) {
    this.faultCounter = count;
    console.log('Counter set to:', count);
    this.updatePercentageView();
  }

  private updatePercentageView() {
    const fcb = this.faultCounter + 4;

    // if (fcb <= 5) {
    //   this.percentage = 100;
    //   this.percentageMessage = `Perfect! Fault resolved in ${fcb} attempt(s) with 100% accuracy. Excellent work!`;
    // } else if (fcb === 6 || fcb === 7) {
    //   this.percentage = parseFloat(((5 / fcb) * 100).toFixed(1));
    //   this.percentageMessage = `Fault resolved in ${fcb} attempts with ${this.percentage}% accuracy. Try fewer steps next time!`;
    // } else {
    //   this.percentage = 0;
    //   this.percentageMessage = `Fault resolution failed. FCB tripped ${fcb} times which is more than allowed.`;
    // }
    if (fcb <= 5) {
        this.percentage = 100;
        this.percentageMessage = `Perfect! Fault resolved in ${fcb} attempt(s) with 100% accuracy. Excellent work!`;
      } else if (fcb === 6) {
        this.percentage = 80;
        this.percentageMessage = `Fault resolved in ${fcb} attempts with 80% accuracy. Try fewer steps next time!`;
      } else if (fcb === 7) {
        this.percentage = 60;
        this.percentageMessage = `Fault resolved in ${fcb} attempts with 60% accuracy. Try fewer steps next time!`;
      } else {
        this.percentage = 0;
        this.percentageMessage = `Fault resolution failed. FCB tripped ${fcb} times which is more than allowed.`;
      }
  }

  verifyPin() {
    if (this.enteredPin === '12345') {
      this.pinVerified = true;
      this.pinError = false;
      // if (this.line) {
      //   this.fetchFaultSequence(this.line);
      // }
    } else {
      this.pinError = true;
      this.enteredPin = '';
    }
  }

  // fetchFaultSequence(line: string) {
  //   this.circuitService.getFaultSequence(line).subscribe({
  //     next: (data) => {
  //       this.message = data;
  //       this.sequence = data;
  //       this.circuitService.setSequence(data);
  //       this.sequenceLoaded = true;
  //     },
  //     error: (err) => {
  //       this.sequenceLoaded = false;
  //     }
  //   });
  // }

  goBack() {
    this.pinVerified = false;
    this.enteredPin = '';
    this.router.navigate(['/login']);
  }
}
