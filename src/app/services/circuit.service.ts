import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CircuitService {

  private lastSequence: string = '';

  // -------------------------------
  // 🔹 Local sequence storage
  // -------------------------------
  setSequence(seq: string) {
    this.lastSequence = seq;
    localStorage.setItem('fault-seq', seq);
  }

  getSequence(): string {
    return localStorage.getItem('fault-seq') || '';
  }

  // -------------------------------
  // 🔹 Base URLs (proxy based)
  // -------------------------------
  private baseUrl = '/api';
  private faultUrl = '/api/fault-detection';
  private faultSessionUrl = '/api/fault-session';
  private verifyUrl = '/fault';
  private ruleApi = '/api/rules';

  // Base URLs matching your backend + proxy config
  // private baseUrl = '/api';                  // -> http://localhost:8888/api/...
  // private faultUrl = '/api/fault-detection'; // -> http://localhost:8888/api/fault-detection/...
  // private verifyUrl = '/fault';              // -> http://localhost:8888/fault/...

  // private baseUrl = environment.apiUrl;
  // private faultUrl = environment.faultApi;
  // private verifyUrl = environment.verifyApi;

  // OR server deployment
  // private baseUrl = 'http://198.7.114.147:8888/api';
  // private faultUrl = 'http://198.7.114.147:8888/api/fault-detection';
  // private verifyUrl = 'http://198.7.114.147:8888/fault';
  // private faultSessionUrl = 'http://198.7.114.147:8888/api/fault-session';


  //domain use krte time ise use kro


  // private baseUrl = 'https://scada.pratikshat.com/api';
  // private faultUrl = 'https://scada.pratikshat.com/api/fault-detection';
  // private verifyUrl = 'https://scada.pratikshat.com/fault';
  // private faultSessionUrl = 'https://scada.pratikshat.com/api/fault-session';



  constructor(private http: HttpClient) { }
  
  //  code to get the circuits drom fault detection dropdown and send it to detectFaultMode method of canvas component
  private selectedCircuitSubject = new BehaviorSubject<string | null>(null);
  public selectedCircuit$ = this.selectedCircuitSubject.asObservable();

  setSelectedCircuit(circuitName: string) {
    console.log('🔄 Service: Circuit changed to', circuitName);
    this.selectedCircuitSubject.next(circuitName);
  }

  getSelectedCircuitNames(): string | null {
    return this.selectedCircuitSubject.value;
  }
  // 🔥 END OF NEW CODE

  // ====================================================
  // 🔥 PHASE-2 : ADMIN APIs
  // ====================================================

  // Admin → request fault session
  requestFaultSession(body: {
    adminId: string;
    userIds: string[];
  }): Observable<any[]> {
    return this.http.post<any[]>(
      `${this.faultSessionUrl}/request`,
      body
    );
  }

  // Admin → activate fault session
  activateFaultSession(body: {
    sessionId: string;
    adminId: string;
    line: string;
    circuitName: string;

  }): Observable<any> {
    return this.http.post(
      `${this.faultSessionUrl}/activate`,
      body
    );
  }

// ------------------------------------------------
// User → resolve fault session
// ------------------------------------------------
resolveFaultSession(payload: {
  sessionId: string;   // ✅ MUST be string
  userId: string;
}) {
  return this.http.post(
    `${this.faultSessionUrl}/resolve`,
    payload
  );
}


  // ====================================================
  // 👤 PHASE-2 : USER APIs
  // ====================================================

  // User → accept fault request
  acceptFaultSession(body: {
    sessionId: string;
    userId: string;
  }): Observable<any> {
    return this.http.post(
      `${this.faultSessionUrl}/accept`,
      body
    );
  }

  // User → SSE connection URL (used with EventSource)
  getUserSseUrl(userId: string): string {
    return `${this.faultSessionUrl}/stream/${userId}`;
  }

  // ====================================================
  // ⚙️ EXISTING CIRCUIT APIs (UNCHANGED)
  // ====================================================

  saveCircuit(saveData: {
    objects: any[],
    redSignalLineMap: Record<string, string[]>,
    closedSignalsArray: string[]
  }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/save`,
      saveData,
      { responseType: 'text' as 'json' }
    );
  }

  testBackendConnection(): Observable<string> {
    return this.http.get(
      `${this.baseUrl}/test`,
      { responseType: 'text' }
    );
  }

  getDataFromBackend(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get`);
  }
  
  // ====================================================
  // 🟦 LINE RULE APIs (DB-driven rules)
  // ====================================================
  getRulesByName(name: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.ruleApi}/by-name/${encodeURIComponent(name)}`);
}
  createRule(rule: any): Observable<any> {
    return this.http.post<any>(this.ruleApi, rule);
  }
  updateRule(id: number, rule: any): Observable<any> {
    return this.http.put<any>(`${this.ruleApi}/${id}`, rule);
  }
  deleteRuleApi(id: number): Observable<any> {
    return this.http.delete(`${this.ruleApi}/${id}`);
  }
  deleteRulesByName(name: string): Observable<any> {
  return this.http.delete(`${this.ruleApi}/by-name/${encodeURIComponent(name)}`);
}

  // ====================================================
  // ⚡ Verification APIs (UNCHANGED)
  // ====================================================

  sendAllUserActions(line: string, userActions: string[]): Observable<any> {
    return this.http.post<any>(
      `${this.verifyUrl}/verify/${line}`,
      userActions
    );
  }
  // -----------------------------
// Admin → fetch real users
// -----------------------------b
getAllUsers() {
  return this.http.get<string[]>('/api/admin/users');
}
  // STEP-2: Admin fetches sessions (polling / refresh)
  getAdminSessions(adminId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.faultSessionUrl}/admin/${adminId}`
    );
  }
rejectFaultSession(payload: {
  sessionId: string;
  userId: string;
}) {
  return this.http.post(
    `${this.faultSessionUrl}/reject`,
    payload
  );
}
  
  // getFaultSequence(line: string): Observable<string> {
  //   return this.http.get(
  //     `${this.faultUrl}/fault-sequence?line=${line}`,
  //     { responseType: 'text' }
  //   );
  // }

// apne existing base ke hisaab se path adjust karo
getFaultRulesByName(name: string) {
  return this.http.get<any[]>(`${this.baseUrl}/fault-rule/by-circuit`, { params: { name } });
}
createFaultRule(payload: any) {
  return this.http.post(`${this.baseUrl}/fault-rule`, payload);
}
updateFaultRule(id: number, payload: any) {
  return this.http.put(`${this.baseUrl}/fault-rule/${id}`, payload);
}
deleteFaultRulesByName(name: string) {
  return this.http.delete(`${this.baseUrl}/fault-rule/by-circuit`, { params: { name } });
}


}
