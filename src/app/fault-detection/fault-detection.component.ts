

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CircuitService } from '../services/circuit.service';

@Component({
  selector: 'app-fault-detection',
  templateUrl: './fault-detection.component.html',
  styleUrls: ['./fault-detection.component.css']
})
export class FaultDetectionComponent implements OnInit, OnDestroy {

  lines: { label: string; value: string }[] = [];


  private circuitLineMap: Record<string, any[]> = {
    'RBR_Board': [
      { label: 'KLI SP - PTA SSP UL', value: 'LG8'},
      { label: 'KLI SP - PTA SSP DN', value: 'LG7'},
      { label: 'PTA SSP - DBN-TSS UL', value: 'LG11'},
      { label: 'PTA SSP - DBN-TSS DL', value: 'LG12'},
      { label: 'DBN-TSS - NBA-SSP UL', value: 'LG24'},
      { label: 'DBN-TSS - NBA-SSP DL', value: 'LG25'},
      { label: 'NBA-SSP - CTW-SSP UL', value: 'LG38'},
      { label: 'NBA-SSP - CTW-SSP DL', value: 'LG39'},
      { label: 'CTW-SSP - KLSX-SP UL', value: 'LG45'},
      { label: 'CTW-SSP - KLSX-SP DL', value: 'LG46'},
      { label: 'ALAL-SP - SEQ-SSP UL', value: 'LG75'},
      { label: 'ALAL-SP - SEQ-SSP DL', value: 'LG74'},
      { label: 'HYA-TSS - SEQ-SSP UL', value: 'LG77'},
      { label: 'HYA-TSS - SEQ-SSP DL', value: 'LG76'},
      { label: 'HYA TSS - TPA SSP UP', value:'LG88'},
      { label: 'HYA TSS - TPA SSP DN', value:'LG91'},
      { label: 'TPA SSP - LHM SP UP', value:'LG100'},
      { label: 'TPA SSP - LHM SP DN', value:'LG99'},
      { label: 'LHM SP - BCU SSP UP', value:'LG108'},
      { label: 'LHM SP - BCU SSP DN ', value:'LG107'},
      { label: 'BCU SSP - BTI SSP UP', value: 'LG119'},
      { label: 'BCU SSP - BTI SSP DN', value: 'LG118'},
      { label: 'BTI SSP - BTI SP UP', value: 'LG129'},
      { label: 'BTI SSP - BTI SP DN', value: 'LG131'},
      { label: 'GANTRY 1', value: 'LG147' },
      { label: 'GANTRY 2', value: 'LG138' },
    ],
    'Circuit5': [
      { label: 'Circuit 5 DBN-TSS - NBA-SSP UL', value: 'LG24' },
      { label: 'DBN-TSS - NBA-SSP DL', value: 'LG25' }
    ],
    'HSR_Board': [
      { label: 'GILL SP - QRP SSP', value: 'LG2'},
      { label: 'QRP SSP - AHH SSP', value: 'LG3'},
      { label: 'AHH SSP - KUP TSS', value: 'LG4'},
      { label: 'KUP TSS - MET SSP', value: 'LG025'},
      { label: 'MET SSP - DUI SP', value: 'LG024'},
      { label: 'DUI SP - BSS SP', value: 'LG32'},
      { label: 'BSS SP - SAG SSP', value: 'LG33'},
      { label: 'SAG SSP - SFMU SSP', value: 'LG40'},
      { label: 'GRN SP - KUDN SSP', value: 'LG57'},
      { label: 'LHA SSP - GRN SP', value: 'LG53'},
      { label: 'KUDN SSP - PLI SSP', value: 'LG62'},
      { label: 'PLI SSP - UKN TSS', value: 'LG63'},
      { label: 'UKN TSS - BXC SSP', value: 'LG64'},
      { label: 'DNX SSP - RPHR SP', value: 'LG75'},
      { label: 'BXC SSP - DNX SSP', value: 'LG65'}
    ],

    'Branch_Line_Board': [
      { label: 'DHPR SSP -GHG TSS UP', value: 'LG10'},
      { label: 'GHG-TSS - DHPR SSP DN', value: 'LG11'},
      { label: 'CDG SSP - GHG TSS UP', value: 'LG5'},
      { label: 'GHG-TSS - CDG SSP DN', value: 'LG9'},
      { label: 'DKT SP  - DHPR SSP UP', value: 'LG013'},
      { label: 'DHPR SSP - DKT SP DN', value: 'LG12'},
      { label: 'CNDM SSP - CDG SSP ', value: 'LG4'},
      { label: 'KLK SSP - CNDM SSP', value: 'LG2'},
      { label: 'CDG SSP - SASN SSP', value: 'LG018'},
      { label: 'SASN SSP- KARR SP', value: 'LG18'},
      { label: ' KARR SP - NMDA SSP', value: 'LG19'},
      { label: 'NMDA SSP - KMNN SP', value: 'LG38'},
      { label: 'KMNN SP -  SMRL SP', value: 'LG39'},
      { label: 'FGSB SP - NGWN SSP', value: 'LG22'},
      { label: 'NGWN SSP - KRLI TSS', value: 'LG42'},
      { label: 'KRLI TSS - RPAR SP', value: 'LG46'},
      { label: 'RPAR SP - BARJ SSP', value: 'LG47'},
      { label: 'BARJ SSP - ANSB TSS', value: 'LG48'},
      { label: 'ANSB TSS - NLDM SSP', value: 'LG49'},
      { label: 'NLDM SSP - UHL SSP', value: 'LG51'},
      { label: 'UHL SSP - CHTL SP', value: 'LG054'},
      { label: 'CHTL SP - AADR SSP', value: 'LG055'},
      { label: 'AADR SSP - DLPC SSP', value: 'LG056'},
      { label: ' PNO TSS - KLK SSP', value: 'LG1'}
       
    ],


    'Main_Line_Board': [
      { label: 'BAE SP - SRE SSP UP', value: 'LG35'},
      { label: 'SRE SSP - BAE SP DN', value: 'LG37'},
      // { label: 'SRE SSP - SSW SSP UP ', value: 'LG39'},
      { label: 'SSW SSP  - SRE SSP DN', value: 'LG32'},
      { label: 'TPZ TSS - SSW SSP UP', value: 'LG41'},
      { label: 'SRE SSP - TPZ TSS DN', value: 'LG40'},
      { label: 'SSW-SSP - KNZ SSP UP', value: 'LG31'},
      { label: 'KNZ SSP - SSW-SSP DN', value: 'LG30'},
      { label: 'KNZ SSP - JUWD TSS UP', value: 'LG29'},
      { label: 'JUWD TSS - KNZ SSP DN', value: 'LG28'},
      { label: 'JUWD TSS - RAA SSP UP', value: 'LG24'},
      { label: 'RAA SSP- JUWD TSS DN', value: 'LG27'},
      { label: 'RAA SSP - KES SP UP', value: 'LG23'},
      { label: 'KES SP - RAA SSP DN', value: 'LG22'},
      { label: 'KES SP -  UMB SSP UP', value: 'LG21'},
      { label: 'UMB SSP - KES SP DN', value: 'LG020'},
      { label: 'MOY SP - UMB SSP UP ', value: 'LG054'},
      { label: 'UMB SSP - MOY SP DN', value: 'LG055'},
      { label: 'UMB SSP - UBC SP UP', value: 'LG20'},
      { label: 'UBC SP - UMB SSP DN', value: 'LG19'},
      { label: 'UBC SP - SMU SSP UP', value: 'LG16'},
      { label: 'SMU SSP - UBC SP DN', value: 'LG15'},
      { label: 'SMU SSP - RPJ TSS UP', value: 'LG14'},
      { label: 'RPJ TSS - SMU SSP DN', value: 'LG13'},
      { label: 'RPJ TSS - SBJ SSP UP', value: 'LG12'},
      { label: 'SBJ SSP - RPJ TSS DN', value: 'LG11'},
      { label: 'SBJ SSP - SDY SSP UP', value: 'LG10'},
      { label: 'SDY SSP - SBJ SSP DN', value: 'LG9'},
      { label: 'SDY SSP - GVG SP UP', value: 'LG8'},
      { label: 'GVG SP  - SDY SSP DN', value: 'LG1'},
      { label: 'GVG SP - CHA SSP UP', value: 'LG6'},
      { label: 'CHA SSP - GVG SP DN', value: 'LG5'},
      { label: 'CHA SSP -SNL TSS UP', value: 'LG4'},
      { label: 'SNL-TSS - CHA SSP DN', value: 'LG3'},
     
    ],
    'NEW_BOARD': [
      { label: 'KLI SP - PTA SSP UL', value: 'LG8'},
    ]
  };


  selectedLine: string | null = null;
  adminId!: string;

  selectedUsers: string[] = [];
  availableUsers: string[] = [];
  searchText: string = '';
  showActivationError: boolean = false;

  //  NEW: Circuits dropdown properties (NO LOADING)
  circuits: any[] = [];
  circuitsRaw: any[] = [];
  selectedCircuit: string | null = null;



  videoSrc: string = '';
  posterSrc: string = '';
  showVideo: boolean = false;  //  Toggle flag



  activeSessions: any[] = [];

  isRequesting = false;
  isActivating = false;

  private pollRef: any;

  //send fault button disable after session expiry

  isSessionExpired = false;
  sessionUsed = false;


  constructor(
    private router: Router,
    private circuitService: CircuitService
  ) {}

  // -----------------------------
  // INIT
  // -----------------------------
  ngOnInit(): void {
    const role = sessionStorage.getItem('role');
    if (role !== 'ADMIN') {
      this.router.navigate(['/']);
      return;
    }

    this.adminId = sessionStorage.getItem('username') || '';

    // 🔥 NEW: Load circuits first
    this.loadCircuits();

    this.loadUsers();
    this.loadAdminSessions();

    // refresh sessions periodically
    this.pollRef = setInterval(() => {
      this.loadAdminSessions();
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.pollRef) {
      clearInterval(this.pollRef);
    }
  }

  // 🔥 NEW: Load circuits from backend (NO LOADING STATE)
  loadCircuits(): void {
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
        }
      },
      error: err => {
        console.error('Failed to load circuits', err);
      }
    });
  }

  // NEW: Circuit select handler
  onCircuitSelect(): void {
    if (!this.selectedCircuit) return;

    console.log('✅ Circuit selected:', this.selectedCircuit);

    // lines update karo
    this.lines = this.circuitLineMap[this.selectedCircuit] || [];

    // optional reset
    this.selectedLine = null;
  }


  // -----------------------------
  // LOAD USERS
  // -----------------------------
  loadUsers(): void {
    this.circuitService.getAllUsers().subscribe({
      next: users => this.availableUsers = users,
      error: err => console.error('Failed to load users', err)
    });
  }

  // -----------------------------
  // LOAD ADMIN SESSIONS
  // -----------------------------
  loadAdminSessions(): void {
    if (!this.adminId) return;

    this.circuitService.getAdminSessions(this.adminId).subscribe({
      next: sessions => this.activeSessions = sessions,
      error: err => console.error('Failed to load admin sessions', err)
    });
  }
// get filteredUsers(): string[] {
//   if (!this.searchText) {
//     return this.availableUsers;
//   }

//   return this.availableUsers.filter(user =>
//     user.toLowerCase().includes(this.searchText.toLowerCase())
//   );
// }
toggleSelectAll(event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;

  if (checked) {
    this.selectedUsers = [...this.filteredUsers];
  } else {
    this.selectedUsers = [];
  }
}

areAllSelected(): boolean {
  return (
    this.filteredUsers.length > 0 &&
    this.filteredUsers.every(user =>
      this.selectedUsers.includes(user)
    )
  );
}
trackBySessionId(index: number, session: any) {
  return session.sessionId;
}

areAllSelectedUsersAccepted(): boolean {
  if (!this.selectedUsers.length) {
    return false;
  }

  return this.selectedUsers.every(user =>
    this.activeSessions.some(
      s => s.userId === user && s.state === 'ACCEPTED'
    )
  );
}
  
hasActiveSessionForUser(userId: string): boolean {
  return this.activeSessions.some(
    s => s.userId === userId && s.state === 'ACTIVE'
  );
}

hasAnyActiveSession(): boolean {
  return this.activeSessions.some(s => s.state === 'ACTIVE');
}

showErrorFor3Seconds(): void {
  this.showActivationError = true;

  setTimeout(() => {
    this.showActivationError = false;
  }, 3000);
}

viewResultBySession(sessionId: string): void {
  this.router.navigate(
    ['/admin-result-details/session', sessionId]
  );
}

activateFaultForAll(): void {

  if (!this.selectedLine || !this.selectedUsers.length) {
    this.showErrorFor3Seconds();
    return;
  }

  const invalidUsers = this.selectedUsers.filter(user =>
    this.hasActiveSessionForUser(user)
  );

  if (invalidUsers.length) {
    this.showActivationError = true;
    setTimeout(() => this.showActivationError = false, 3000);
    return;
  }

  if (!this.areAllSelectedUsersAccepted()) {
    this.showErrorFor3Seconds();
    return;
  }

  const sessionsToActivate = this.activeSessions.filter(
    s =>
      this.selectedUsers.includes(s.userId) &&
      s.state === 'ACCEPTED'
  );

  sessionsToActivate.forEach(s => this.activateFault(s.sessionId));
}
  
  
  // -----------------------------
  // demo video update
  // -----------------------------
  
  onLineSelect() {
    if (this.selectedLine && this.selectedCircuit) {
      // Circuit folder + faultLine file
      this.videoSrc = `assets/demo-videos/${this.selectedCircuit}/${this.selectedLine}.mp4`;
      this.posterSrc = `assets/demo-videos/${this.selectedCircuit}/${this.selectedLine}-poster.jpg`;
    } else {
      this.videoSrc = '';
      this.posterSrc = '';
    }
  }


  toggleVideo() {
    this.showVideo = !this.showVideo;
  }

  hideVideo() {
    this.showVideo = false;
  }



  // -----------------------------
  // REQUEST FAULT SESSION
  // -----------------------------
  requestFaultSession(): void {
    if (!this.selectedUsers.length) return;

    this.isRequesting = true;

    this.circuitService.requestFaultSession({
      adminId: this.adminId,
      userIds: this.selectedUsers
    }).subscribe({
      next: () => {
        this.isRequesting = false;
        this.loadAdminSessions();
      },
      error: () => this.isRequesting = false
    });
  }

  // -----------------------------
  // ACTIVATE FAULT
  // -----------------------------
  // activateFault(sessionId: string): void {
  //   if (!this.selectedLine) return;

  //   this.isActivating = true;

  //   this.circuitService.activateFaultSession({
  //     sessionId,
  //     adminId: this.adminId,
  //     line: this.selectedLine
  //   }).subscribe({
  //     next: () => {
  //       this.isActivating = false;
  //       this.loadAdminSessions();
  //     },
  //     error: () => this.isActivating = false
  //   });
  // }

  activateFault(sessionId: string): void {
    if (!this.selectedLine || !this.selectedCircuit) return;

    this.circuitService.activateFaultSession({
      sessionId,
      adminId: this.adminId,
      line: this.selectedLine,
      circuitName: this.selectedCircuit   // 🔥 MUST
    }).subscribe(() => {
      this.loadAdminSessions();
    });
    
  }


  // -----------------------------
  // USER SELECTION
  // -----------------------------
  onUserToggle(event: any): void {
    const userId = event.target.value;

    if (event.target.checked) {
      this.selectedUsers.push(userId);
    } else {
      this.selectedUsers = this.selectedUsers.filter(u => u !== userId);
    }
  }


  dropdownOpen = false;
  // searchText = '';

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectUser(user: string): void {
    if (!this.selectedUsers.includes(user)) {
      this.selectedUsers.push(user);
    }
  }

  removeUser(user: string): void {
    this.selectedUsers = this.selectedUsers.filter(u => u !== user);
  }

  get filteredUsers(): string[] {

    const filtered = this.availableUsers.filter(user =>
      user.toLowerCase().includes(this.searchText.toLowerCase())
    );

    // agar search empty hai to 5 users dikhao
    if (!this.searchText) {
      return filtered.slice(0, 12);
    }

    // agar search ho raha hai to full result dikhao
    return filtered;
  }


  // -----------------------------
  // NAVIGATION
  // -----------------------------
  goToMainPage(): void {
    this.router.navigate(['']);
  }
}