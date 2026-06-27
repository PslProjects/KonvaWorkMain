import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

declare var html2pdf: any;

@Component({
  selector: 'app-admin-result-details',
  templateUrl: './admin-result-details.component.html',
  styleUrls: ['./admin-result-details.component.css']
})
export class AdminResultDetailsComponent implements OnInit {

  result: any = null;
  readableUserSequence: string[] = [];
  faultLineLabel = '';

  faultLines = [
    { label: 'RBR_Board KLI SP - PTA SSP UL', value: 'LG8' },
    { label: 'RBR_Board KLI SP - PTA SSP DN', value: 'LG7' },
    { label: 'RBR_Board PTA SSP - DBN-TSS UL', value: 'LG11' },
    { label: 'RBR_Board PTA SSP - DBN-TSS DL', value: 'LG12' },
    { label: 'RBR_Board DBN-TSS - NBA-SSP UL', value: 'LG24' },
    { label: 'RBR_Board DBN-TSS - NBA-SSP DL', value: 'LG25' },
    { label: 'RBR_Board NBA-SSP - CTW-SSP UL', value: 'LG38' },
    { label: 'RBR_Board NBA-SSP - CTW-SSP DL', value: 'LG39' },
    { label: 'RBR_Board CTW-SSP - KLSX-SP UL', value: 'LG45' },
    { label: 'RBR_Board CTW-SSP - KLSX-SP DL', value: 'LG46' },
    { label: 'RBR_Board ALAL-SP - SEQ-SSP UL', value: 'LG75' },
    { label: 'RBR_Board ALAL-SP - SEQ-SSP DL', value: 'LG74' },
    { label: 'RBR_Board HYA-TSS - SEQ-SSP UL', value: 'LG77' },
    { label: 'RBR_Board HYA-TSS - SEQ-SSP DL', value: 'LG76' },
    { label: 'RBR_Board HYA TSS - TPA SSP UP', value:'LG88' },
    { label: 'RBR_Board HYA TSS - TPA SSP DN', value:'LG91' },
    { label: 'RBR_Board TPA SSP - LHM SP UP', value: 'LG100'},
    { label: 'RBR_Board TPA SSP - LHM SP DN', value:'LG99'},
    { label: 'RBR_Board LHM SP - BCU SSP UP', value:'LG108'},
    { label: 'RBR_Board LHM SP - BCU SSP DN ', value:'LG107'},
    { label: 'RBR_Board BCU SSP - BTI SSP UP', value: 'LG119'},
    { label: 'RBR_Board BCU SSP - BTI SSP DN', value: 'LG118'},
    { label: 'RBR_Board BTI SSP - BTI SP UP', value: 'LG129'},
    { label: 'RBR_Board BTI SSP - BTI SP DN', value: 'LG131'},
    { label: 'RBR_Board GANTRY 1', value: 'LG147'},
    { label: 'RBR_Board GANTRY 2', value: 'LG138'},
    { label: 'HSR_Board GILL SP - QRP SSP', value: 'LG2' },
    { label: 'HSR_Board QRP SSP - AHH SSP', value: 'LG3' },
    { label: 'HSR_Board AHH SSP - KUP TSS', value: 'LG4' },
    { label: 'HSR_Board KUP TSS - MET SSP', value: 'LG025'},
    { label: 'HSR_Board MET SSP - DUI SP', value: 'LG024' },
    { label: 'HSR_Board DUI SP - BSS SP', value: 'LG32' },
    { label: 'HSR_Board BSS SP - SAG SSP', value: 'LG33' },
    { label: 'HSR_Board SAG SSP - SFMU SSP', value: 'LG40' },
    { label: 'HSR_Board GRN SP - KUDN SSP', value: 'LG57' },
    { label: 'HSR_Board LHA SSP - GRN SP', value: 'LG53' },
    { label: 'HSR_Board KUDN SSP - PLI SSP', value: 'LG62' },
    { label: 'HSR_Board PLI SSP - UKN TSS', value: 'LG63' },
    { label: 'HSR_Board UKN TSS - BXC SSP', value: 'LG64' },
    { label: 'HSR_Board DNX SSP - RPHR SP', value: 'LG75' },
    { label: 'HSR_Board BXC SSP - DNX SSP', value: 'LG65' },
    { label: 'Branch_Line_Board PNO TSS - KLK SSP', value: 'LG1'},
    { label: 'Branch_Line_Board KLK SSP - CNDM SSP', value: 'LG2'},
    { label: 'Branch_Line_Board CNDM SSP - CDG SSP ', value: 'LG4'},
    { label: 'Branch_Line_Board UHL SSP - CHTL SP', value: 'LG054'},
    { label: 'Branch_Line_Board DKT SP  - DHPR SSP UP', value: 'LG013'},
    { label: 'Branch_Line_Board DHPR SSP - DKT SP DN', value: 'LG12'},
    { label: 'Branch_Line_Board DHPR SSP -GHG TSS UP', value: 'LG10'},
    { label: 'Branch_Line_Board GHG TSS - DHPR SSP DN', value: 'LG11' },
    { label: 'Branch_Line_Board CDG SSP - GHG TSS UP', value: 'LG5'},
    { label: 'Branch_Line_Board GHG TSS - CDG SSP DN', value: 'LG9'},
    { label: 'Branch_Line_Board CDG SSP - SASN SSP', value: 'LG018'},
    { label: 'Branch_Line_Board SASN SSP- KARR SP', value: 'LG18'},
    { label: 'Branch_Line_Board KARR SP - NMDA SSP', value: 'LG19'},
    { label: 'Branch_Line_Board NMDA SSP - KMNN SP', value: 'LG38'},
    { label: 'Branch_Line_Board KMNN SP -  SMRL SP', value: 'LG39'},
    { label: 'Branch_Line_Board FGSB SP - NGWN SSP', value: 'LG22'},
    { label: 'Branch_Line_Board NGWN SSP - KRLI TSS', value: 'LG42'},
    { label: 'Branch_Line_Board KRLI TSS - RPAR SP', value: 'LG46'},
    { label: 'Branch_Line_Board RPAR SP - BARJ SSP', value: 'LG47'},
    { label: 'Branch_Line_Board BARJ SSP - ANSB TSS', value: 'LG48'},
    { label: 'Branch_Line_Board ANSB TSS - NLDM SSP', value: 'LG49'},
    { label: 'Branch_Line_Board NLDM SSP - UHL SSP', value: 'LG51'},
    { label: 'Branch_Line_Board CHTL SP - AADR SSP', value: 'LG055'},
    { label: 'Branch_Line_Board AADR SSP - DLPC SSP', value: 'LG056'},
    { label: 'Main_Line_Board BAE SP - SRE SSP UP', value: 'LG35'},
    { label: 'Main_Line_Board SRE SSP - BAE SP DN', value: 'LG37'},
    { label: 'Main_Line_Board SRE SSP - SSW SSP UP ', value: 'LG39'},
    { label: 'Main_Line_Board SSW SSP  - SRE SSP DN', value: 'LG32'},
    { label: 'Main_Line_Board TPZ TSS - SSW SSP UP', value: 'LG41'},
    { label: 'Main_Line_Board SRE SSP - TPZ TSS DN', value: 'LG40'},
    { label: 'Main_Line_Board SSW SSP - KNZ SSP UP', value: 'LG31'},
    { label: 'Main_Line_Board KNZ SSP - SSW-SSP DN', value: 'LG30'},
    { label: 'Main_Line_Board KNZ SSP - JUWD TSS UP', value: 'LG29'},
     { label: 'Main_Line_Board JUWD TSS - KNZ SSP DN', value: 'LG28'},
     { label: 'Main_Line_Board JUWD TSS - RAA SSP UP', value: 'LG24'},
     { label: 'Main_Line_Board RAA SSP- JUWD TSS DN', value: 'LG27'},
     { label: 'Main_Line_Board RAA SSP - KES SP UP', value: 'LG23'},
     { label: 'Main_Line_Board KES SP - RAA SSP DN', value: 'LG22'},
     { label: 'Main_Line_Board KES SP -  UMB SSP UP', value: 'LG21'},
     { label: 'Main_Line_Board UMB SSP - KES SP DN', value: 'LG020'},
     { label: 'Main_Line_Board MOY SP - UMB SSP UP ', value: 'LG054'},
     { label: 'Main_Line_Board UMB SSP - MOY SP DN', value: 'LG055'},
     { label: 'Main_Line_Board UMB SSP - UBC SP UP', value: 'LG20'},
     { label: 'Main_Line_Board UBC SP - UMB SSP DN', value: 'LG19'},
     { label: 'Main_Line_Board UBC SP - SMU SSP UP', value: 'LG16'},
     { label: 'Main_Line_Board SMU SSP - UBC SP DN', value: 'LG15'},
     { label: 'Main_Line_Board SMU SSP - RPJ TSS UP', value: 'LG14'},
     { label: 'Main_Line_Board RPJ TSS - SMU SSP DN', value: 'LG13'},
     { label: 'Main_Line_Board RPJ TSS - SBJ SSP UP', value: 'LG12'},
     { label: 'Main_Line_Board SBJ SSP - RPJ TSS DN', value: 'LG11'},
     { label: 'Main_Line_Board SBJ SSP - SDY SSP UP', value: 'LG10'},
     { label: 'Main_Line_Board SDY SSP - SBJ SSP DN', value: 'LG9'},
     { label: 'Main_Line_Board SDY SSP - GVG SP UP', value: 'LG8'},
     { label: 'Main_Line_Board GVG SP  - SDY SSP DN', value: 'LG1'},
     { label: 'Main_Line_Board GVG SP - CHA SSP UP', value: 'LG6'},
     { label: 'Main_Line_Board CHA SSP - GVG SP DN', value: 'LG5'},
     { label: 'Main_Line_Board CHA SSP -SNL TSS UP', value: 'LG4'},
     { label: 'Main_Line_Board SNL-TSS - CHA SSP DN', value: 'LG3'},
     
  ];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

  // 🔹 Case 1: Opened via sessionId (Fault Detection → View Result)
  const sessionId = this.route.snapshot.paramMap.get('sessionId');
  if (sessionId) {
    this.http.get(`/api/result/session/${sessionId}`).subscribe({
      next: (res: any) => this.handleResult(res),
      error: err => console.error('Result load error (session)', err)
    });
    return;
  }

  // 🔹 Case 2: Opened via resultId (Admin Result Search)
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.http.get(`/api/result/${id}`).subscribe({
      next: (res: any) => this.handleResult(res),
      error: err => console.error('Result load error (id)', err)
    });
    return;
  }

  console.error('❌ No id or sessionId provided');
}
private handleResult(res: any): void {
  this.result = res;

  const match = this.faultLines.find(
    f => f.value === res.faultLine
  );
  this.faultLineLabel = match ? match.label : res.faultLine;

  try {
    this.readableUserSequence = res.userSequence
      ? JSON.parse(res.userSequence)
      : [];
  } catch {
    this.readableUserSequence = [];
  }
}

  getProgressWidth(): number {
    if (!this.readableUserSequence || this.readableUserSequence.length === 0) {
      return 0;
    }
    const progress = (this.readableUserSequence.length / 20) * 100;
    return Math.min(progress, 100); // ✅ Max 100%
  }

downloadPDF() {
  const element = document.getElementById('pdf-content');
  const seqList = element?.querySelector('.seq-list') as HTMLElement;
  if (!element || !seqList) return;

  /* ===============================
     FORCE PDF MODE (HARD OVERRIDE)
  =============================== */

  element.classList.add('pdf-mode');

  // ✅ HARD OVERRIDE scroll container
  const oldMaxHeight = seqList.style.maxHeight;
  const oldOverflow = seqList.style.overflow;

  seqList.style.maxHeight = 'none';
  seqList.style.overflow = 'visible';

  /* ✅ Give browser time to reflow */
  setTimeout(() => {

    html2pdf()
      .from(element)
      .set({
        margin: [6, 6, 6, 6],   // ✅ smaller margins
        filename: `Result_${this.result?.userName}_${this.result?.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          scrollY: 0,
          windowHeight: element.scrollHeight // ✅ KEY LINE
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all'] }
      })
          .save()
          .finally(() => {

            /* ===============================
              RESTORE NORMAL SCREEN MODE
            =============================== */
            seqList.style.maxHeight = oldMaxHeight;
            seqList.style.overflow = oldOverflow;

            element.classList.remove('pdf-mode');
          });

  }, 300);
}

}
