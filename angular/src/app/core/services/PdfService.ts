import { Injectable } from '@angular/core';

declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');

@Injectable({ providedIn: 'root' })
export class PdfService {
  constructor() { }

  public exportAsPdfFile(pageType: string, dataObject: any, fileName: string): void {
    let doc = new jsPDF();

    if (pageType === 'landscape') {
      doc = new jsPDF('l', 'mm', 'a4');
    }

    const headers = Object.keys(dataObject[0]);
    const rows: any = [];

    dataObject.forEach(r => { rows.push(Object.values(r)); });

    doc.autoTable({ startY: 5, startX: 10, head: [headers], body: rows });

    doc.save(fileName + '.pdf');
  }
}
