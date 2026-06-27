import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-admin-result-search',
  templateUrl: './admin-result-search.component.html',
  styleUrls: ['./admin-result-search.component.css']
})
export class AdminResultSearchComponent {

  // ⭐ COMMON STATE
  loading = false;
  errorMessage = '';
  activeTab = 'search';

  overallPage = 0;
  overallSize = 5;
  totalPages = 0;

  searchPage = 0;
  searchSize = 5;
  searchTotalPages = 0;

  private pendingLoads = 0;

  // ⭐ SEARCH TAB STATE
  username = '';
  searchResults: any[] = [];
  searchTotalTests = 0;
  searchPassCount = 0;
  searchFailCount = 0;
  searchPassRate = 0;

  // ⭐ OVERALL TAB STATE
  overallResults: any[] = [];
  overallTotalTests = 0;
  overallPassCount = 0;
  overallFailCount = 0;
  overallPassRate = 0;
  startDate: string = '';
  endDate: string = '';

  constructor(private http: HttpClient, private router: Router) { }

  // ⭐ TAB SWITCHERS
  setSearchTab() {
    this.activeTab = 'search';
    this.resetSearchStats();
  }

  setOverallTab() {
    this.activeTab = 'overall';
    this.overallPage = 0;
    this.startDate = '';
    this.endDate = '';

    this.loadStats();   // ✅ counters
    this.loadOverall(); // ✅ table
  }

  // ─────────────────────────────────────────
  // ⭐ SEARCH TAB METHODS
  // ─────────────────────────────────────────

  doUserSearch() {
    if (!this.username.trim()) return;

    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>(
      `/api/result/user/${this.username}?page=${this.searchPage}&size=${this.searchSize}`
    ).subscribe({
      next: (res) => {
        this.searchResults = res.content;
        this.searchTotalPages = res.totalPages;
        this.searchTotalTests = res.totalElements;   // ⭐ total from backend, not just current page

        this.updateSearchStats();
        this.loading = false;

        if (res.content.length === 0) {
          this.showTemporaryMessage('User not found');
        }
      },
      error: (err) => {
        console.error('Search error:', err);
        this.loading = false;
        this.showTemporaryMessage('Error fetching results');
      }
    });
  }

  // ⭐ Full data sirf stats ke liye (counters)
  // loadAllForStats() {
  //   this.startLoad();  // ⭐ add
  //   this.http.get<any>(`/api/result/all?page=0&size=10000`).subscribe({
  //     next: (res) => {
  //       let data: any[] = res.content;
  //       data = this.applyDateFilter(data);
  //       this.overallTotalTests = data.length;
  //       this.overallPassCount = data.filter((r: any) => r.status === 'PASS').length;
  //       this.overallFailCount = data.filter((r: any) => r.status === 'FAIL').length;
  //       this.overallPassRate = this.overallTotalTests > 0
  //         ? Math.round((this.overallPassCount / this.overallTotalTests) * 100) : 0;
  //       this.endLoad();  // ⭐ add
  //     },
  //     error: () => { this.endLoad(); }  // ⭐ add
  //   });
  // }

// ⭐ Default table — backend pagination (no date filter)
  loadOverall() {
    this.startLoad();

    const start = this.startDate
      ? new Date(this.startDate + 'T00:00:00').getTime()
      : '';

    const end = this.endDate
      ? new Date(this.endDate + 'T23:59:59.999').getTime()
      : '';

    this.http.get<any>(
      `/api/result/all?page=${this.overallPage}&size=${this.overallSize}&startDate=${start}&endDate=${end}`
    ).subscribe({
      next: (res) => {
        this.overallResults = res.content;
        this.totalPages = res.totalPages;
        this.endLoad();
      },
      error: () => this.endLoad()
    });
  }

// ⭐ Date filter lagne pe — full fetch + client-side filter + paginate
  // loadFilteredOverall() {
  //   this.startLoad();  // ⭐ replace: this.loading = true
  //   this.http.get<any>(`/api/result/all?page=0&size=10000`).subscribe({
  //     next: (res) => {
  //       let data: any[] = res.content;
  //       data = this.applyDateFilter(data);
  //       this.totalPages = Math.ceil(data.length / this.overallSize) || 1;
  //       const start = this.overallPage * this.overallSize;
  //       this.overallResults = data.slice(start, start + this.overallSize);
  //       this.endLoad();  // ⭐ replace: this.loading = false
  //     },
  //     error: () => { this.endLoad(); }  // ⭐ replace: this.loading = false
  //   });
  // }


  loadStats() {
    this.startLoad();

    const start = this.startDate
      ? new Date(this.startDate + 'T00:00:00').getTime()
      : null;

    const end = this.endDate
      ? new Date(this.endDate + 'T23:59:59.999').getTime()
      : null;

    this.http.get<any>(
      `/api/result/stats?startDate=${start || ''}&endDate=${end || ''}`
    ).subscribe({
      next: (res) => {
        this.overallTotalTests = res.total;
        this.overallPassCount = res.pass;
        this.overallFailCount = res.fail;

        this.overallPassRate = res.total > 0
          ? Math.round((res.pass / res.total) * 100)
          : 0;

        this.endLoad();
      },
      error: () => this.endLoad()
    });
  }


  private updateSearchStats() {
    // ⭐ Use totalElements from backend for total count
    this.searchPassCount = this.searchResults.filter((r: any) => r.status === 'PASS').length;
    this.searchFailCount = this.searchResults.filter((r: any) => r.status === 'FAIL').length;
    this.searchPassRate = this.searchTotalTests > 0
      ? Math.round((this.searchPassCount / this.searchTotalTests) * 100)
      : 0;
  }

  private resetSearchStats() {
    this.searchTotalTests = 0;
    this.searchPassCount = 0;
    this.searchFailCount = 0;
    this.searchPassRate = 0;
  }

  // ─────────────────────────────────────────
  // ⭐ OVERALL TAB — STATS CARDS (full data)
  // ─────────────────────────────────────────

  // loadOverallStats() {
  //   // ⭐ Fetch ALL records once to compute correct stats
  //   this.http.get<any>(`/api/result/all?page=0&size=10000`).subscribe({
  //     next: (res) => {
  //       let data: any[] = res.content;

  //       // ⭐ Apply date filter on full dataset
  //       data = this.applyDateFilter(data);

  //       this.overallTotalTests = data.length;
  //       this.overallPassCount = data.filter((r: any) => r.status === 'PASS').length;
  //       this.overallFailCount = data.filter((r: any) => r.status === 'FAIL').length;
  //       this.overallPassRate = this.overallTotalTests > 0
  //         ? Math.round((this.overallPassCount / this.overallTotalTests) * 100)
  //         : 0;
  //     },
  //     error: () => {
  //       this.showTemporaryMessage('Error loading stats');
  //     }
  //   });
  // }

  // ─────────────────────────────────────────
  // ⭐ OVERALL TAB — TABLE (paginated)
  // ─────────────────────────────────────────

  // loadOverallPerformance() {
  //   this.loading = true;

  //   // ⭐ Build URL — pass date params to backend if your API supports it,
  //   //    otherwise fetch full data and slice manually (see below)
  //   const url = this.buildOverallUrl();

  //   this.http.get<any>(url).subscribe({
  //     next: (res) => {
  //       let data: any[] = res.content;

  //       // ⭐ If backend does NOT support date filtering via query params,
  //       //    filter client-side from the paginated result.
  //       //    NOTE: for accurate pagination with date filter, use the
  //       //    "fetch all → filter → paginate client-side" approach below.
  //       data = this.applyDateFilter(data);

  //       this.overallResults = data;
  //       this.totalPages = res.totalPages;
  //       this.loading = false;
  //     },
  //     error: () => {
  //       this.loading = false;
  //       this.showTemporaryMessage('Error loading table');
  //     }
  //   });
  // }

  private startLoad() {
    this.pendingLoads++;
    this.loading = true;
  }

  private endLoad() {
    this.pendingLoads = Math.max(0, this.pendingLoads - 1);
    if (this.pendingLoads === 0) this.loading = false;
  }

  /**
   * ⭐ Best approach when backend has NO date-filter support:
   *    Fetch ALL, filter, then paginate on client side.
   *    Call this instead of loadOverallPerformance() if your backend
   *    /api/result/all does NOT accept startDate/endDate params.
   */
  // loadOverallPerformanceClientSide() {
  //   this.loading = true;

  //   this.http.get<any>(`/api/result/all?page=0&size=10000`).subscribe({
  //     next: (res) => {
  //       let data: any[] = res.content;

  //       // ⭐ Filter by date
  //       data = this.applyDateFilter(data);

  //       // ⭐ Client-side pagination
  //       this.totalPages = Math.ceil(data.length / this.overallSize);
  //       const start = this.overallPage * this.overallSize;
  //       this.overallResults = data.slice(start, start + this.overallSize);

  //       this.loading = false;
  //     },
  //     error: () => {
  //       this.loading = false;
  //       this.showTemporaryMessage('Error loading table');
  //     }
  //   });
  // }

  // ─────────────────────────────────────────
  // ⭐ DATE FILTER HELPERS
  // ─────────────────────────────────────────

  /** Returns a filtered copy of data based on startDate / endDate */
  // private applyDateFilter(data: any[]): any[] {
  //   let filtered = [...data];
  //   if (this.startDate) {
  //     const start = new Date(this.startDate + 'T00:00:00').getTime();
  //     filtered = filtered.filter((r: any) => r.startTime >= start);
  //   }
  //   if (this.endDate) {
  //     const end = new Date(this.endDate + 'T23:59:59.999').getTime();
  //     filtered = filtered.filter((r: any) => r.startTime <= end);
  //   }
  //   return filtered;
  // }

  /** Called on (change) of date inputs in HTML */
  onDateFilterChange() {
    if (this.activeTab === 'overall') {
      this.overallPage = 0;
      this.loadStats();   // ✅ counters
      this.loadOverall(); // ✅ table
    }
  }

  clearFilters() {
    this.startDate = '';
    this.endDate = '';
    this.overallPage = 0;

    this.loadStats();
    this.loadOverall();
  }

  private buildOverallUrl(): string {
    // ⭐ Extend this if your backend supports date query params:
    // e.g. /api/result/all?page=0&size=5&startDate=2024-01-01&endDate=2024-12-31
    return `/api/result/all?page=${this.overallPage}&size=${this.overallSize}`;
  }

  getDateFilterText(): string {
    if (!this.startDate && !this.endDate) return `All Time`;
    const range = this.startDate && this.endDate
      ? `${this.startDate} to ${this.endDate}`
      : this.startDate
        ? `From ${this.startDate}`
        : `Until ${this.endDate}`;
    return range;
  }

  // ─────────────────────────────────────────
  // ⭐ PAGINATION
  // ─────────────────────────────────────────

  nextPage() {
    if (this.overallPage < this.totalPages - 1) {
      this.overallPage++;
      this.loadOverall(); // ✅ always backend
    }
  }

  prevPage() {
    if (this.overallPage > 0) {
      this.overallPage--;
      this.loadOverall();
    }
  }

  nextSearchPage() {
    if (this.searchPage < this.searchTotalPages - 1) {
      this.searchPage++;
      this.doUserSearch();
    }
  }

  prevSearchPage() {
    if (this.searchPage > 0) {
      this.searchPage--;
      this.doUserSearch();
    }
  }

  // ─────────────────────────────────────────
  // ⭐ COMMON UTILS
  // ─────────────────────────────────────────

  showTemporaryMessage(msg: string) {
    this.errorMessage = msg;
    setTimeout(() => (this.errorMessage = ''), 2000);
  }

  openDetails(id: number) {
    this.router.navigate(['/admin-result-details', id]);
  }


  downloadFullPagePDF() {

    const start = this.startDate
      ? new Date(this.startDate + 'T00:00:00').getTime()
      : '';

    const end = this.endDate
      ? new Date(this.endDate + 'T23:59:59.999').getTime()
      : '';

    window.open(
      `/api/result/download-pdf?startDate=${start}&endDate=${end}`

    );
  }


  // downloadFullPagePDF() {
  //
  //   const start = this.startDate
  //     ? new Date(this.startDate + 'T00:00:00').getTime()
  //     : '';
  //
  //   const end = this.endDate
  //     ? new Date(this.endDate + 'T23:59:59.999').getTime()
  //     : '';
  //
  //   this.loading = true;
  //
  //   this.http.get<any>(
  //     `/api/result/all?page=0&size=100000&startDate=${start}&endDate=${end}`
  //   ).subscribe({
  //
  //     next: async (res) => {
  //
  //       const results = res.content || [];
  //
  //       let html = `
  //     <div style="
  //       padding:25px;
  //       font-family:Arial,sans-serif;
  //       color:#222;
  //     ">
  //
  //       <div style="
  //         text-align:center;
  //         margin-bottom:25px;
  //       ">
  //
  //         <h1 style="
  //           margin:0;
  //           font-size:26px;
  //           color:#0f172a;
  //         ">
  //           SCADA Results Report
  //         </h1>
  //
  //         <p style="
  //           margin-top:8px;
  //           font-size:14px;
  //           color:#555;
  //         ">
  //           Date Filter:
  //           ${this.getDateFilterText()}
  //         </p>
  //
  //       </div>
  //
  //       <table
  //         width="100%"
  //         cellspacing="0"
  //         cellpadding="8"
  //         style="
  //           border-collapse:collapse;
  //           font-size:11px;
  //         "
  //       >
  //
  //         <thead>
  //
  //           <tr style="
  //             background:#1e293b;
  //             color:white;
  //           ">
  //
  //             <th style="border:1px solid #ccc;">Status</th>
  //
  //             <th style="border:1px solid #ccc;">User</th>
  //
  //             <th style="border:1px solid #ccc;">Branch Board</th>
  //
  //             <th style="border:1px solid #ccc;">Fault Line</th>
  //
  //             <th style="border:1px solid #ccc;">Success Rate</th>
  //
  //             <th style="border:1px solid #ccc;">Time Taken</th>
  //
  //             <th style="border:1px solid #ccc;">FCB Count</th>
  //
  //             <th style="border:1px solid #ccc;">Admin</th>
  //
  //             <th style="border:1px solid #ccc;">Date</th>
  //
  //           </tr>
  //
  //         </thead>
  //
  //         <tbody>
  //     `;
  //
  //       results.forEach((r: any, index: number) => {
  //
  //         const date = new Date(r.startTime)
  //           .toLocaleString();
  //
  //         const timeTaken =
  //           r.timeTakenMs
  //             ? (r.timeTakenMs / 1000).toFixed(1) + ' sec'
  //             : '-';
  //
  //         // ⭐ Branch Board Extract
  //         let branchBoard = '-';
  //
  //         try {
  //
  //           if (r.userSequence) {
  //
  //             const seq = JSON.parse(r.userSequence);
  //
  //             if (seq.length > 0) {
  //
  //               const first = seq[0];
  //
  //               branchBoard =
  //                 first.split('[')[0].trim();
  //             }
  //           }
  //
  //         } catch (e) {
  //           branchBoard = '-';
  //         }
  //
  //         html += `
  //
  //         <tr style="
  //           background:${index % 2 === 0 ? '#f8fafc' : '#ffffff'};
  //         ">
  //
  //           <td style="
  //             border:1px solid #ccc;
  //             text-align:center;
  //             font-weight:bold;
  //             color:${r.status === 'PASS' ? 'green' : 'red'};
  //           ">
  //             ${r.status || '-'}
  //           </td>
  //
  //           <td style="
  //             border:1px solid #ccc;
  //             text-align:center;
  //           ">
  //             ${r.userName || '-'}
  //           </td>
  //
  //           <td style="
  //             border:1px solid #ccc;
  //             text-align:center;
  //           ">
  //             ${branchBoard}
  //           </td>
  //
  //           <td style="
  //             border:1px solid #ccc;
  //             text-align:center;
  //           ">
  //             ${r.faultLine || '-'}
  //           </td>
  //
  //           <td style="
  //             border:1px solid #ccc;
  //             text-align:center;
  //             font-weight:bold;
  //           ">
  //             ${r.resultPercentage || 0}%
  //           </td>
  //
  //           <td style="
  //             border:1px solid #ccc;
  //             text-align:center;
  //           ">
  //             ${timeTaken}
  //           </td>
  //
  //           <td style="
  //             border:1px solid #ccc;
  //             text-align:center;
  //           ">
  //             ${r.fcbFlipCount || 0}
  //           </td>
  //
  //           <td style="
  //             border:1px solid #ccc;
  //             text-align:center;
  //           ">
  //             ${r.adminName || '-'}
  //           </td>
  //
  //           <td style="
  //             border:1px solid #ccc;
  //             text-align:center;
  //           ">
  //             ${date}
  //           </td>
  //
  //         </tr>
  //       `;
  //       });
  //
  //       html += `
  //
  //         </tbody>
  //
  //       </table>
  //
  //       <div style="
  //         margin-top:25px;
  //         text-align:right;
  //         font-size:11px;
  //         color:#666;
  //       ">
  //         Generated on:
  //         ${new Date().toLocaleString()}
  //       </div>
  //
  //     </div>
  //     `;
  //
  //       const container = document.createElement('div');
  //
  //       container.innerHTML = html;
  //
  //       await html2pdf()
  //         .from(container)
  //         .set({
  //
  //           margin: 5,
  //
  //           filename:
  //             `Results_${this.getDateFilterText().replace(/\s+/g, '_')}.pdf`,
  //
  //           image: {
  //             type: 'jpeg',
  //             quality: 0.7
  //           },
  //
  //           html2canvas: {
  //             scale: 1,
  //             useCORS: true
  //           },
  //
  //           jsPDF: {
  //             unit: 'mm',
  //             format: 'a4',
  //             orientation: 'landscape'
  //           }
  //
  //         })
  //         .save();
  //
  //       this.loading = false;
  //     },
  //
  //     error: () => {
  //
  //       this.loading = false;
  //
  //       this.showTemporaryMessage(
  //         'PDF download failed'
  //       );
  //     }
  //   });
  // }
  // downloadFullPagePDF() {
  //   const element = document.querySelector('.search-page') as HTMLElement;
  //   if (!element) return;
  //
  //   element.classList.add('pdf-mode');
  //
  //   setTimeout(() => {
  //     html2pdf()
  //       .from(element)
  //       .set({
  //         margin: [6, 6, 6, 6],
  //         filename: `Results_${new Date().toISOString().slice(0, 10)}.pdf`,
  //         image: { type: 'jpeg', quality: 0.98 },
  //         html2canvas: {
  //           scale: 2,
  //           scrollY: 0,
  //           windowHeight: element.scrollHeight
  //         },
  //         jsPDF: {
  //           unit: 'mm',
  //           format: 'a4',
  //           orientation: 'portrait'
  //         }
  //       })
  //       .save()
  //       .finally(() => {
  //         element.classList.remove('pdf-mode');
  //       });
  //   }, 200);
  // }
}
