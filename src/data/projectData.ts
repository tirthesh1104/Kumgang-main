// ============================================================
// SOURCE OF TRUTH — Live Project Monitoring System
// Auto-generated from: 260908 KKI PROJECT FOLLOW UP.xlsx
// Generated at: 2026-09-08T11:10:59.532Z
// No values have been invented, fabricated or silently corrected.
// ============================================================

export interface ProjectMaster {
  projectId: string;
  country: string;
  customer: string;
  project: string;
  block: string;
  contractDate: string | null;
  contractStatus: string;
  contractQtyM2: number | null;
  contractWeightTons: number | null;
  initialContractQtyM2?: number | null;
  initialContractWeightTons?: number | null;
  actualDesignQtyM2: number | null;
  actualDesignWeightTons: number | null;
  designProgressPercent: number | null;
  pricePerM2USD: number | null;
  totalAmountUSD: number | null;
  advanceUSD: number | null;
  balanceUSD: number | null;
  shellPlanConfirmation: string | null;
  mdCompletion: string | null;
  productionStart: string | null;
  productionComplete: string | null;
  deliveryRequest: string | null;
  loadingDate: string | null;
  etd: string | null;
  eta: string | null;
  fwd: string | null;
  paymentTerm: string;
  paymentStatus: string;
  incoterm: string;
  remark: string;
  sourceSheet: string;
  sets?: number | null;

  // Section 1: PROJECT INFORMATION fields
  vendorCompany?: string | null;
  materialDescription?: string | null;
  poNumber?: string | null;
  poDate?: string | null;
  billToAddress?: string | null;
  billToPinCode?: string | null;
  shipToAddress?: string | null;
  shipToPinCode?: string | null;
  clientContactName?: string | null;
  clientContactPhone?: string | null;
  clientContactEmail?: string | null;
  poQty?: number | null;
  rate?: number | null;
  scopeOfTechnicalSupport?: string | null;
  currentSiteStatus?: string | null;
  siteLocationRegion?: string | null;

  // Section 3: COMMERCIAL & FINANCIAL VALUES fields
  poRate?: number | null;
  actualTotalAmount?: number | null;
  actualTotalReceivable?: number | null;
  actualBalanceAmount?: number | null;
  paymentStatusAmount?: number | null;
  paymentStatusPercent?: number | null;
  lastPiRaisedDate?: string | null;
  dueDays?: number | null;
  poPaymentTerm?: string | null;
  bgAmount?: number | null;
  bgPercent?: number | null;
  lcAmount?: number | null;
  lcPercent?: number | null;
  bgOpenDate?: string | null;
  bgExpiryDate?: string | null;
  lcOpenDate?: string | null;
  lcExpiryDate?: string | null;

  // Section 4: SCHEDULE & MILESTONE DATES fields
  paymentReceivedShellPlanDate?: string | null;
  etaLocation?: string | null;
  deliveryTimeline?: string | null;
  actualTotalWeeks?: number | string | null;
  factoryVisitType?: string | null; // e.g. 'NA' | 'Mock Up'
  factoryVisitPersons?: number | null;
  factoryVisitPlannedDate?: string | null;
  factoryVisitCompletedDate?: string | null;

  // Section 5: DESIGN ELEMENTS fields
  typicalFloorArea?: number | null;
  typicalFloorAreaUom?: string | null; // 'Sqm' | 'PCS' | 'Nos'
  basementFloorArea?: number | null;
  basementFloorAreaUom?: string | null;
  changeFloorArea?: number | null;
  changeFloorAreaUom?: string | null;
  plumbingGrooveArea?: number | null;
  plumbingGrooveAreaUom?: string | null;
  elevationGrooveArea?: number | null;
  elevationGrooveAreaUom?: string | null;
  totalPayableArea?: number | null;
  totalPayableAreaUom?: string | null;
  areaApprovedDate?: string | null;
}

export interface DesignSchedule {
  designId: string;
  projectId: string;
  element: string;
  plannedDate: string | null;
  actualDate: string | null;
  status: string;
}

export interface ProductionRecord {
  productionId: string;
  projectId: string | null;
  part: string;
  orderQtyM2: number | null;
  orderQtyKg: number | null;
  finishedQtyM2: number | null;
  finishedQtyKg: number | null;
  balanceQty: number | null;
  completionPercent: number | null;
  productionStartDate: string | null;
  productionCompleteDate: string | null;
}

export interface ShipmentRecord {
  shipmentId: string;
  projectId: string;
  block: string;
  loadingDate: string | null;
  etd: string | null;
  eta: string | null;
  fwd: string | null;
  incoterm: string;
  deliveryTimeline: string;
  status: string;

  // Additional Shipment Tracking Fields
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  unitPrice?: number | null;
  invoiceAmount?: number | null;
  containerTotal?: number | null;
  containerSize?: string | null;
  bcsQty?: number | null;
  acsQty?: number | null;
  kgbhQty?: number | null;
  ksbhQty?: number | null;
  aluformQty?: number | null;
  dispatchQtyM2?: number | null;
}

export function addWeeksToDate(dateStr: string | null | undefined, weeks = 13): string | null {
  if (!dateStr || dateStr.trim() === '' || dateStr.toLowerCase() === 'done' || dateStr.toLowerCase() === 'n/a') return null;
  try {
    let d: Date;
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        d = new Date(dateStr);
      } else if (parts[2].length === 4) {
        d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        d = new Date(dateStr);
      }
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + weeks * 7);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (e) {
    return null;
  }
}


export interface PaymentRecord {
  paymentId: string;
  projectId: string | null;
  customer: string;
  project: string;
  tower: string;
  description: string;
  quantitySqm: number | null;
  rateUSD: number | null;
  amountUSD: number | null;
  advancePaidUSD: number | null;
  balanceUSD: number | null;
  advancePercent: number | null;
  paymentTerm: string;
  paymentStatus: string;
  remark: string;
  sourceSheet?: string;
}

// ============================================================
// PROJECT MASTER DATA
// ============================================================
export const projectMasterData: ProjectMaster[] = [
  {
    "projectId": "IND-001",
    "country": "India",
    "customer": "TOTAL ENVIROMENT",
    "project": "DBTW",
    "block": "T1_Basement",
    "contractDate": "12-12-2024",
    "contractStatus": "Signed",
    "contractQtyM2": 4240,
    "contractWeightTons": 99,
    "actualDesignQtyM2": 974.16,
    "actualDesignWeightTons": 21.86,
    "designProgressPercent": null,
    "pricePerM2USD": 119.36,
    "totalAmountUSD": 116275.98,
    "advanceUSD": 506118.63,
    "balanceUSD": 0,
    "shellPlanConfirmation": "Done",
    "mdCompletion": "Done",
    "productionStart": "Done",
    "productionComplete": "27-07-2025",
    "deliveryRequest": "ETD 30-Jul",
    "loadingDate": "29-07-2025",
    "etd": "29-07-2025",
    "eta": "29-07-2025",
    "fwd": "03-08-2025",
    "paymentTerm": "Advance 20% Done, 80% before dispatch",
    "paymentStatus": "Received 100% payment",
    "incoterm": "CIF ICD Bangalore",
    "remark": "issued PI 100%",
    "sourceSheet": "Detail list (2)",
    "initialContractQtyM2": 3500,
    "initialContractWeightTons": 75.6
  },
  {
    "projectId": "IND-002",
    "country": "India",
    "customer": "TOTAL ENVIROMENT",
    "project": "DBTW",
    "block": "T1_Typical",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": null,
    "contractWeightTons": null,
    "actualDesignQtyM2": 3266.11,
    "actualDesignWeightTons": 77.41,
    "designProgressPercent": null,
    "pricePerM2USD": 119.36,
    "totalAmountUSD": 389842.65,
    "advanceUSD":null,
    "balanceUSD": null,
    "shellPlanConfirmation": "Done",
    "mdCompletion": "Done",
    "productionStart": "Done",
    "productionComplete": "14-10-2025",
    "deliveryRequest": "ASAP",
    "loadingDate": "22-10-2025",
    "etd": "22-10-2025",
    "eta": "22-10-2025",
    "fwd": "28-10-2025",
    "paymentTerm": "",
    "paymentStatus": "",
    "incoterm": "CIF ICD Bangalore",
    "remark": "issued PI 100%",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-003",
    "country": "India",
    "customer": "TOTAL ENVIROMENT",
    "project": "DBTW",
    "block": "T2_Basement",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": 8335.11,
    "contractWeightTons": 195,
    "actualDesignQtyM2": 1489.56,
    "actualDesignWeightTons": 32.34,
    "designProgressPercent": null,
    "pricePerM2USD": 119.36,
    "totalAmountUSD": 177793.28,
    "advanceUSD": 916270.97,
    "balanceUSD": 78608.12,
    "shellPlanConfirmation": "Done",
    "mdCompletion": "Done",
    "productionStart": "Done",
    "productionComplete": "18-11-2025",
    "deliveryRequest": "The First shipment shall leave from Hochiminh port, Vietnam within12 to 13 weeks from the date of shell plan drawings confirmation byClient",
    "loadingDate": "26-10-2025",
    "etd": "Waiting cfm",
    "eta": null,
    "fwd": null,
    "paymentTerm": "Before Advance 20% Done, 80% before dispatch After 75% advance, deduct shipment by shipment include T8",
    "paymentStatus": "Received 92%",
    "incoterm": "CIF ICD Bangalore",
    "remark": "",
    "sourceSheet": "Detail list (2)",
    "initialContractQtyM2": 4500,
    "initialContractWeightTons": 97.2
  },
  {
    "projectId": "IND-004",
    "country": "India",
    "customer": "TOTAL ENVIROMENT",
    "project": "DBTW",
    "block": "T2_Typical",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": null,
    "contractWeightTons": null,
    "actualDesignQtyM2": 6845.56,
    "actualDesignWeightTons": 162.66,
    "designProgressPercent": null,
    "pricePerM2USD": 119.36,
    "totalAmountUSD": 817085.8,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": "27-07-2025",
    "mdCompletion": "19-03-2026",
    "productionStart": "Done",
    "productionComplete": "17-06-2026",
    "deliveryRequest": null,
    "loadingDate": null,
    "etd": null,
    "eta": null,
    "fwd": null,
    "paymentTerm": "",
    "paymentStatus": "",
    "incoterm": "CIF ICD Bangalore",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-005",
    "country": "India",
    "customer": "TOTAL ENVIROMENT",
    "project": "DBTW",
    "block": "T3_Basement",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": 8335.11,
    "contractWeightTons": 195,
    "actualDesignQtyM2": 1489.56,
    "actualDesignWeightTons": 32.34,
    "designProgressPercent": null,
    "pricePerM2USD": 119.36,
    "totalAmountUSD": 177793.28,
    "advanceUSD": 916270.97,
    "balanceUSD": 78608.12,
    "shellPlanConfirmation": "Done",
    "mdCompletion": "Done",
    "productionStart": "Done",
    "productionComplete": "24-11-2025",
    "deliveryRequest": null,
    "loadingDate": "26-10-2025",
    "etd": "Waiting cfm",
    "eta": null,
    "fwd": null,
    "paymentTerm": "Before Advance 20% Done, 80% before dispatch After 75% advance, deduct shipment by shipment include T8",
    "paymentStatus": "Received 92%",
    "incoterm": "CIF ICD Bangalore",
    "remark": "",
    "sourceSheet": "Detail list (2)",
    "initialContractQtyM2": 4500,
    "initialContractWeightTons": 97.2
  },
  {
    "projectId": "IND-006",
    "country": "India",
    "customer": "TOTAL ENVIROMENT",
    "project": "DBTW",
    "block": "T3_Typical",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": null,
    "contractWeightTons": null,
    "actualDesignQtyM2": 6845.56,
    "actualDesignWeightTons": 162.66,
    "designProgressPercent": null,
    "pricePerM2USD": 119.36,
    "totalAmountUSD": 817085.8,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": "27-07-2025",
    "mdCompletion": "19-03-2026",
    "productionStart": "14-06-2026",
    "productionComplete": "30-06-2026",
    "deliveryRequest": null,
    "loadingDate": null,
    "etd": null,
    "eta": null,
    "fwd": null,
    "paymentTerm": "",
    "paymentStatus": "",
    "incoterm": "CIF ICD Bangalore",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-007",
    "country": "India",
    "customer": "TOTAL ENVIROMENT",
    "project": "DBTW",
    "block": "T4",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": 7839.2,
    "contractWeightTons": 169.33,
    "actualDesignQtyM2": 7839.2,
    "actualDesignWeightTons": 169.33,
    "designProgressPercent": null,
    "pricePerM2USD": 119.36,
    "totalAmountUSD": 935686.91,
    "advanceUSD": 0,
    "balanceUSD": 935686.91,
    "shellPlanConfirmation": "N/A",
    "mdCompletion": "N/A",
    "productionStart": null,
    "productionComplete": "No information",
    "deliveryRequest": null,
    "loadingDate": "Waiting cfm",
    "etd": "Waiting cfm",
    "eta": null,
    "fwd": null,
    "paymentTerm": "Before Advance 20% Done, 80% before dispatch After 75% advance, deduct shipment by shipment include T8",
    "paymentStatus": "",
    "incoterm": "CIF ICD Bangalore",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-008",
    "country": "India",
    "customer": "TOTAL ENVIROMENT",
    "project": "POARR-T8",
    "block": "T8 p1",
    "contractDate": "19-12-2024",
    "contractStatus": "Signed",
    "contractQtyM2": 12636.51,
    "contractWeightTons": 299,
    "actualDesignQtyM2": 3731.93,
    "actualDesignWeightTons": 88.82,
    "designProgressPercent": null,
    "pricePerM2USD": 119.36,
    "totalAmountUSD": 445443.05,
    "advanceUSD": 139415.64,
    "balanceUSD": 306027.41,
    "shellPlanConfirmation": "05-09-2025",
    "mdCompletion": "Done",
    "productionStart": "30-12-2026",
    "productionComplete": "25-02-2026",
    "deliveryRequest": "ASAP",
    "loadingDate": null,
    "etd": null,
    "eta": "25-02-2026",
    "fwd": "01-03-2026",
    "paymentTerm": "Before Advance 35% Done, 65% before dispatch After Use advance of DBTW for 100% before dispatch",
    "paymentStatus": "Received 31%",
    "incoterm": "CIF ICD Bangalore",
    "remark": "issued PI 100%",
    "sourceSheet": "Detail list (2)",
    "initialContractQtyM2": 11300,
    "initialContractWeightTons": 244.08
  },
  {
    "projectId": "IND-009",
    "country": "India",
    "customer": "TOTAL ENVIROMENT",
    "project": "POARR-T8",
    "block": "T8 p2",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": null,
    "contractWeightTons": null,
    "actualDesignQtyM2": 2456.42,
    "actualDesignWeightTons": 58.01,
    "designProgressPercent": null,
    "pricePerM2USD": 119.36,
    "totalAmountUSD": 293198.05,
    "advanceUSD": 91765.7,
    "balanceUSD": 201432.35,
    "shellPlanConfirmation": "05-09-2025",
    "mdCompletion": "Done",
    "productionStart": "30-12-2026",
    "productionComplete": "25-02-2026",
    "deliveryRequest": "ASAP",
    "loadingDate": null,
    "etd": null,
    "eta": "25-02-2026",
    "fwd": "01-03-2026",
    "paymentTerm": "Advance 35% Done, 65% before dispatch",
    "paymentStatus": "Received 31%",
    "incoterm": "CIF ICD Bangalore",
    "remark": "issued PI 100%",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-010",
    "country": "India",
    "customer": "TOTAL ENVIROMENT",
    "project": "POARR-T8",
    "block": "T8 p3",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": null,
    "contractWeightTons": null,
    "actualDesignQtyM2": 2476.18,
    "actualDesignWeightTons": 58.74,
    "designProgressPercent": null,
    "pricePerM2USD": 119.36,
    "totalAmountUSD": 295556.37,
    "advanceUSD": 92503.81,
    "balanceUSD": 203052.56,
    "shellPlanConfirmation": "05-09-2025",
    "mdCompletion": "Done",
    "productionStart": "30-12-2026",
    "productionComplete": "25-02-2026",
    "deliveryRequest": "ASAP",
    "loadingDate": null,
    "etd": null,
    "eta": "25-02-2026",
    "fwd": "01-03-2026",
    "paymentTerm": "Advance 35% Done, 65% before dispatch",
    "paymentStatus": "Received 31%",
    "incoterm": "CIF ICD Bangalore",
    "remark": "issued PI 100%",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-011",
    "country": "India",
    "customer": "TOTAL ENVIROMENT",
    "project": "POARR-T8",
    "block": "T8 p4",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": null,
    "contractWeightTons": null,
    "actualDesignQtyM2": 2500.97,
    "actualDesignWeightTons": 59.1,
    "designProgressPercent": null,
    "pricePerM2USD": 119.36,
    "totalAmountUSD": 298515.42,
    "advanceUSD": 93429.94,
    "balanceUSD": 205085.48,
    "shellPlanConfirmation": "05-09-2025",
    "mdCompletion": "Done",
    "productionStart": "12-01-2026",
    "productionComplete": "21-03-2026",
    "deliveryRequest": "ASAP",
    "loadingDate": null,
    "etd": null,
    "eta": "28-03-2026",
    "fwd": "03-04-2026",
    "paymentTerm": "Advance 35% Done, 65% before dispatch",
    "paymentStatus": "Received 31%",
    "incoterm": "CIF ICD Bangalore",
    "remark": "issued PI 100%",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-012",
    "country": "India",
    "customer": "TOTAL ENVIROMENT",
    "project": "POARR-T8",
    "block": "T8 p5",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": null,
    "contractWeightTons": null,
    "actualDesignQtyM2": 1367.63,
    "actualDesignWeightTons": 32.32,
    "designProgressPercent": null,
    "pricePerM2USD": 119.36,
    "totalAmountUSD": 163240.79,
    "advanceUSD": 51091.42,
    "balanceUSD": 112149.37,
    "shellPlanConfirmation": "05-09-2025",
    "mdCompletion": "Done",
    "productionStart": "12-01-2026",
    "productionComplete": "27-03-2026",
    "deliveryRequest": "ASAP",
    "loadingDate": null,
    "etd": null,
    "eta": "28-03-2026",
    "fwd": "03-04-2026",
    "paymentTerm": "Advance 35% Done, 65% before dispatch",
    "paymentStatus": "Received 31%",
    "incoterm": "CIF ICD Bangalore",
    "remark": "issued PI 100%",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-013",
    "country": "India",
    "customer": "TOTAL ENVIROMENT",
    "project": "POARR-T8",
    "block": "T8 p6",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": null,
    "contractWeightTons": null,
    "actualDesignQtyM2": 103.39,
    "actualDesignWeightTons": 2.27,
    "designProgressPercent": null,
    "pricePerM2USD": 119.36,
    "totalAmountUSD": 12340.27,
    "advanceUSD": 3862.28,
    "balanceUSD": 8477.99,
    "shellPlanConfirmation": "05-09-2025",
    "mdCompletion": "Done",
    "productionStart": "12-01-2026",
    "productionComplete": "21-03-2026",
    "deliveryRequest": "ASAP",
    "loadingDate": null,
    "etd": null,
    "eta": "28-03-2026",
    "fwd": "03-04-2026",
    "paymentTerm": "Advance 35% Done, 65% before dispatch",
    "paymentStatus": "Received 31%",
    "incoterm": "CIF ICD Bangalore",
    "remark": "issued PI 100%",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-014",
    "country": "India",
    "customer": "KANWARJI  CONSTRUCTION",
    "project": "DG MAP PHASE (II)",
    "block": "",
    "contractDate": "12-05-2025",
    "contractStatus": "Signed",
    "contractQtyM2": 2101,
    "contractWeightTons": 45.38,
    "actualDesignQtyM2": 2109.07,
    "actualDesignWeightTons": 48.79,
    "designProgressPercent": 100,
    "pricePerM2USD": 124,
    "totalAmountUSD": 261524.56,
    "advanceUSD": 261524.56,
    "balanceUSD": 0,
    "shellPlanConfirmation": "04-12-2025",
    "mdCompletion": "Done",
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": null,
    "loadingDate": "9-Apr\r\n18-Apr",
    "etd": "9-Apr\r\n18-Apr",
    "eta": "9-Apr\r\n18-Apr",
    "fwd": "14-Apr\r\n22-Apr",
    "paymentTerm": "TT(contract 20%, finish design 20% before production 30% , before ship 30%)",
    "paymentStatus": "Received 100%",
    "incoterm": "DDP MUMBAI without GST tax",
    "remark": "issued PI 70%",
    "sourceSheet": "Detail list (2)",
    "initialContractQtyM2": 2254,
    "initialContractWeightTons": 48.69
  },
  {
    "projectId": "IND-015",
    "country": "India",
    "customer": "TRIFECTA",
    "project": "TRIFECTA_VERANZA",
    "block": "",
    "contractDate": "08-10-2025",
    "contractStatus": "Signed",
    "contractQtyM2": 4000,
    "contractWeightTons": 87,
    "actualDesignQtyM2": 4080.11,
    "actualDesignWeightTons": 94.21,
    "designProgressPercent": 102,
    "pricePerM2USD": 119,
    "totalAmountUSD": 485533.09,
    "advanceUSD": 485533.09,
    "balanceUSD": 0,
    "shellPlanConfirmation": "06-01-2026",
    "mdCompletion": "Done",
    "productionStart": "10-02-2026",
    "productionComplete": "16-03-2026",
    "deliveryRequest": "46096",
    "loadingDate": "08-04-2026",
    "etd": "08-04-2026",
    "eta": "08-04-2026",
    "fwd": "13-04-2026",
    "paymentTerm": "TT(5% From PO sign date, 25% Within 7 days from the date of shell plan, 70% Balance by LC before dispatch)",
    "paymentStatus": "Received 100%",
    "incoterm": "CIF ICD Bangalore",
    "remark": "issued PI 30%,70%",
    "sourceSheet": "Detail list (2)",
    "initialContractQtyM2": 4000,
    "initialContractWeightTons": 87
  },
  {
    "projectId": "IND-016",
    "country": "India",
    "customer": "BREN",
    "project": "AVAANA",
    "block": "Wing B",
    "contractDate": "11-11-2025",
    "contractStatus": "Signed",
    "contractQtyM2": 3972,
    "contractWeightTons": 85.8,
    "actualDesignQtyM2": 3457.06,
    "actualDesignWeightTons": 93.76,
    "designProgressPercent": 87,
    "pricePerM2USD": 119.5,
    "totalAmountUSD": 413118.43,
    "advanceUSD": 722234.1,
    "balanceUSD": 120633.82,
    "shellPlanConfirmation": "13-02-2026",
    "mdCompletion": "16-04-2026",
    "productionStart": "13-07-2026",
    "productionComplete": "05-08-2026",
    "deliveryRequest": "in 11-12 weeks from the shell plan approval date",
    "loadingDate": "08-05-2026",
    "etd": "15-08-2026",
    "eta": "18-09-2026",
    "fwd": "20-09-2026",
    "paymentTerm": "TT(after PO 10%, before production 20%, After Production 20%, 20%,20% before ship 10%)",
    "paymentStatus": "0.8568769629143174",
    "incoterm": "CIF ICD Bangalore 4 visitors",
    "remark": "issued PI 10%",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-017",
    "country": "India",
    "customer": "BREN",
    "project": "AVAANA",
    "block": "Wing C",
    "contractDate": "11-11-2025",
    "contractStatus": "Signed",
    "contractQtyM2": 4662,
    "contractWeightTons": 100.7,
    "actualDesignQtyM2": 3596.23,
    "actualDesignWeightTons": 79,
    "designProgressPercent": 77,
    "pricePerM2USD": 119.5,
    "totalAmountUSD": 429749.49,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": "27-04-2026",
    "mdCompletion": "08-07-2026",
    "productionStart": "22-08-2026",
    "productionComplete": "14-09-2026",
    "deliveryRequest": "in 11-12 weeks from the shell plan approval date",
    "loadingDate": "20-07-2026",
    "etd": "15-08-2026",
    "eta": "18-09-2026",
    "fwd": "20-09-2026",
    "paymentTerm": "TT(after PO 10%, before production 20%, After Production 20%, 20%,20% before ship 10%)",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "issued PI 10%",
    "sourceSheet": "Detail list (2)",
    "initialContractQtyM2": 4662,
    "initialContractWeightTons": 100.7
  },
  {
    "projectId": "IND-018",
    "country": "India",
    "customer": "BREN",
    "project": "AVAANA",
    "block": "Wing A (included 16.719m2 addition)",
    "contractDate": "07-07-2026",
    "contractStatus": "Signed",
    "contractQtyM2": 3453.9,
    "contractWeightTons": 74.6,
    "actualDesignQtyM2": 3445.09,
    "actualDesignWeightTons": 76,
    "designProgressPercent": 100,
    "pricePerM2USD": 137.5,
    "totalAmountUSD": 473700.43,
    "advanceUSD": 142473.21,
    "balanceUSD": 331227.21,
    "shellPlanConfirmation": "15-07-2026",
    "mdCompletion": "17-07-2026",
    "productionStart": "10-08-2026",
    "productionComplete": "30-08-2026",
    "deliveryRequest": "in 11-12 weeks from the shell plan approval date",
    "loadingDate": "07-10-2026",
    "etd": "15-08-2026",
    "eta": "Waiting cfm",
    "fwd": null,
    "paymentTerm": "TT(after PO 10%, before production 20%, After Production 20%, 20%,20% before ship 10%)",
    "paymentStatus": "0.30076648126292055",
    "incoterm": "CIF ICD Bangalore 4 visitors",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-019",
    "country": "India",
    "customer": "BREN",
    "project": "ANANTA",
    "block": "TWR A",
    "contractDate": "11-11-2025",
    "contractStatus": "Signed",
    "contractQtyM2": 4506,
    "contractWeightTons": 97.33,
    "actualDesignQtyM2": 1554.53,
    "actualDesignWeightTons": 36,
    "designProgressPercent": 91,
    "pricePerM2USD": 119.5,
    "totalAmountUSD": 492396.28,
    "advanceUSD": 161540.1,
    "balanceUSD": 330856.18,
    "shellPlanConfirmation": "27-04-2026",
    "mdCompletion": "04-08-2026",
    "productionStart": "01-09-2026",
    "productionComplete": "17-09-2026",
    "deliveryRequest": "in 11-12 weeks from the shell plan approval date",
    "loadingDate": "20-07-2026",
    "etd": "31-08-2026",
    "eta": "3rd Week of Sep",
    "fwd": "22-09-2026",
    "paymentTerm": "TT(after PO 10%, before production 20%, After Production 20%, 20%,20% before ship 10%)",
    "paymentStatus": "0.3280692911077397",
    "incoterm": "CIF ICD Bangalore 4 visitors",
    "remark": "issued PI 10%",
    "sourceSheet": "Detail list (2)",
    "initialContractQtyM2": 4506,
    "initialContractWeightTons": 97.33
  },
  {
    "projectId": "IND-020",
    "country": "India",
    "customer": "BREN",
    "project": "ANANTA",
    "block": "TWR B",
    "contractDate": "11-11-2025",
    "contractStatus": "Signed",
    "contractQtyM2": null,
    "contractWeightTons": null,
    "actualDesignQtyM2": 2565.94,
    "actualDesignWeightTons": 69,
    "designProgressPercent": null,
    "pricePerM2USD": null,
    "totalAmountUSD": null,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": "27-04-2026",
    "mdCompletion": "04-08-2026",
    "productionStart": "08-09-2026",
    "productionComplete": "26-09-2026",
    "deliveryRequest": "in 11-12 weeks from the shell plan approval date",
    "loadingDate": "20-07-2026",
    "etd": "31-08-2026",
    "eta": "4th Week of Sep",
    "fwd": "30-09-2026",
    "paymentTerm": "TT(after PO 10%, before production 20%, After Production 20%, 20%,20% before ship 10%)",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-021",
    "country": "India",
    "customer": "BREN",
    "project": "IMPERIA GRANDE",
    "block": "Wing 2",
    "contractDate": "11-11-2025",
    "contractStatus": "Signed",
    "contractQtyM2": 4110,
    "contractWeightTons": 88.78,
    "actualDesignQtyM2": 2814.64,
    "actualDesignWeightTons": 65,
    "designProgressPercent": 104,
    "pricePerM2USD": 119.5,
    "totalAmountUSD": 510301.69,
    "advanceUSD": 510301.69,
    "balanceUSD": 0,
    "shellPlanConfirmation": "27-04-2026",
    "mdCompletion": "10-07-2026",
    "productionStart": "29-07-2026",
    "productionComplete": "19-08-2026",
    "deliveryRequest": "in 11-12 weeks from the shell plan approval date",
    "loadingDate": "20-07-2026",
    "etd": "15-08-2026",
    "eta": "11-09-2026",
    "fwd": "13-09-2026",
    "paymentTerm": "TT(after PO 10%, before production 20%, After Production 20%, 20%,20% before ship 10%)",
    "paymentStatus": "1",
    "incoterm": "CIF ICD Bangalore 4 visitors",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-022",
    "country": "India",
    "customer": "BREN",
    "project": "IMPERIA GRANDE",
    "block": "Wing 3",
    "contractDate": "11-11-2025",
    "contractStatus": "Signed",
    "contractQtyM2": null,
    "contractWeightTons": null,
    "actualDesignQtyM2": 1455.67,
    "actualDesignWeightTons": 34,
    "designProgressPercent": null,
    "pricePerM2USD": null,
    "totalAmountUSD": null,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": "27-04-2026",
    "mdCompletion": "30-06-2026",
    "productionStart": "23-07-2026",
    "productionComplete": "10-08-2026",
    "deliveryRequest": "in 11-12 weeks from the shell plan approval date",
    "loadingDate": "20-07-2026",
    "etd": "15-08-2026",
    "eta": "11-09-2026",
    "fwd": "13-09-2026",
    "paymentTerm": "TT(after PO 10%, before production 20%, After Production 20%, 20%,20% before ship 10%)",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-023",
    "country": "India",
    "customer": "KALYANI TECH PARK",
    "project": "LIVING TREE",
    "block": "BLD4",
    "contractDate": "18-02-2026",
    "contractStatus": "Signed",
    "contractQtyM2": 3093,
    "contractWeightTons": 66.81,
    "actualDesignQtyM2": 3144.72,
    "actualDesignWeightTons": 69.6,
    "designProgressPercent": 102,
    "pricePerM2USD": 133,
    "totalAmountUSD": 418247.49,
    "advanceUSD": 418247.49,
    "balanceUSD": 0,
    "shellPlanConfirmation": "30-01-2026",
    "mdCompletion": "12-06-2026",
    "productionStart": "29-06-2026",
    "productionComplete": "27-07-2026",
    "deliveryRequest": "Material should reach at ICD bangalore on 105th Day from the date of shell plan approval.",
    "loadingDate": "15-05-2026",
    "etd": "10-08-2026",
    "eta": "28-07-2026",
    "fwd": "31-07-2026",
    "paymentTerm": "20% within 7 days from ABG 20% after shell plan confirmation 30% before production, Balance 30% before dispatch",
    "paymentStatus": "1",
    "incoterm": "CIF ICD Bangalore 2 visitors",
    "remark": "",
    "sourceSheet": "Detail list (2)",
    "initialContractQtyM2": 2775,
    "initialContractWeightTons": 59.94
  },
  {
    "projectId": "IND-024",
    "country": "India",
    "customer": "CAPACITE INFRAPROJECTS",
    "project": "BDD CHAWL PROJECT",
    "block": "BLD 6 TOWER A",
    "contractDate": "13-05-2026",
    "contractStatus": "Signed",
    "contractQtyM2": 3682,
    "contractWeightTons": 79.9,
    "actualDesignQtyM2": 3682,
    "actualDesignWeightTons": 79.9,
    "designProgressPercent": 100,
    "pricePerM2USD": 131,
    "totalAmountUSD": 482342,
    "advanceUSD": 0,
    "balanceUSD": 482342,
    "shellPlanConfirmation": "27-08-2026",
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": "in 10-12 weeks from the shell plan approval date",
    "loadingDate": "19-11-2026",
    "etd": "2nd shipment-\r\n1st week of Nov",
    "eta": "09-10-2026",
    "fwd": "12-10-2026",
    "paymentTerm": "100%  through LC with 120 days usance from BL date (60 days interest under CIL scope and 60 days interest under KKV scope).",
    "paymentStatus": "",
    "incoterm": "CIF Nhava Sheva",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-025",
    "country": "India",
    "customer": "HQ_DLF",
    "project": "DAHLIAS",
    "block": "TWR 3",
    "contractDate": "04-06-2026",
    "contractStatus": "Signed",
    "contractQtyM2": 1066.3,
    "contractWeightTons": 23.14,
    "actualDesignQtyM2": 1066.97,
    "actualDesignWeightTons": 23.14,
    "designProgressPercent": 100,
    "pricePerM2USD": 111,
    "totalAmountUSD": 118433.23,
    "advanceUSD": 0,
    "balanceUSD": 118433.23,
    "shellPlanConfirmation": "Confirmed",
    "mdCompletion": "22-06-2026",
    "productionStart": "02-07-2026",
    "productionComplete": "15-07-2026",
    "deliveryRequest": "in 12 weeks from the shell plan approval date",
    "loadingDate": null,
    "etd": null,
    "eta": "29-07-2026",
    "fwd": "02-08-2026",
    "paymentTerm": "100% TT  upon shipment and issuance of all related shipping documents",
    "paymentStatus": "0",
    "incoterm": "FOB 2 visitors",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-026",
    "country": "India",
    "customer": "HQ_DLF",
    "project": "DAHLIAS",
    "block": "TWR 7",
    "contractDate": "04-06-2026",
    "contractStatus": "Signed",
    "contractQtyM2": 1060,
    "contractWeightTons": 23,
    "actualDesignQtyM2": 1068.79,
    "actualDesignWeightTons": 23,
    "designProgressPercent": 101,
    "pricePerM2USD": 111,
    "totalAmountUSD": 118635.47,
    "advanceUSD": 0,
    "balanceUSD": 118635.47,
    "shellPlanConfirmation": "Confirmed",
    "mdCompletion": "01-07-2026",
    "productionStart": "05-07-2026",
    "productionComplete": "18-07-2026",
    "deliveryRequest": "in 12 weeks from the shell plan approval date",
    "loadingDate": null,
    "etd": null,
    "eta": "29-07-2026",
    "fwd": "02-08-2026",
    "paymentTerm": "100% TT  upon shipment and issuance of all related shipping documents",
    "paymentStatus": "0",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-027",
    "country": "India",
    "customer": "HQ_DLF",
    "project": "DAHLIAS",
    "block": "TWR 8",
    "contractDate": "04-06-2026",
    "contractStatus": "Signed",
    "contractQtyM2": 1066.3,
    "contractWeightTons": 23.14,
    "actualDesignQtyM2": 1066.3,
    "actualDesignWeightTons": 23.14,
    "designProgressPercent": 100,
    "pricePerM2USD": 111,
    "totalAmountUSD": 118359.3,
    "advanceUSD": 0,
    "balanceUSD": 118359.3,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": "in 12 weeks from the shell plan approval date",
    "loadingDate": null,
    "etd": null,
    "eta": null,
    "fwd": null,
    "paymentTerm": "100% TT  upon shipment and issuance of all related shipping documents",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-028",
    "country": "India",
    "customer": "HQ_DLF",
    "project": "DAHLIAS",
    "block": "TWR 4",
    "contractDate": "04-06-2026",
    "contractStatus": "Signed",
    "contractQtyM2": 1066.3,
    "contractWeightTons": 23.14,
    "actualDesignQtyM2": 1066.3,
    "actualDesignWeightTons": 23.14,
    "designProgressPercent": 100,
    "pricePerM2USD": 111,
    "totalAmountUSD": 118359.3,
    "advanceUSD": 0,
    "balanceUSD": 118359.3,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": "in 12 weeks from the shell plan approval date",
    "loadingDate": null,
    "etd": null,
    "eta": null,
    "fwd": null,
    "paymentTerm": "100% TT  upon shipment and issuance of all related shipping documents",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-029",
    "country": "India",
    "customer": "HQ_DLF",
    "project": "DAHLIAS",
    "block": "TWR 5",
    "contractDate": "04-06-2026",
    "contractStatus": "Signed",
    "contractQtyM2": 698.2,
    "contractWeightTons": 15.15,
    "actualDesignQtyM2": 698.2,
    "actualDesignWeightTons": 15.15,
    "designProgressPercent": 100,
    "pricePerM2USD": 111,
    "totalAmountUSD": 77500.2,
    "advanceUSD": 0,
    "balanceUSD": 77500.2,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": "in 12 weeks from the shell plan approval date",
    "loadingDate": null,
    "etd": null,
    "eta": null,
    "fwd": null,
    "paymentTerm": "100% TT  upon shipment and issuance of all related shipping documents",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-030",
    "country": "India",
    "customer": "HQ_DLF",
    "project": "DAHLIAS",
    "block": "TWR 6",
    "contractDate": "04-06-2026",
    "contractStatus": "Signed",
    "contractQtyM2": 1066.3,
    "contractWeightTons": 23.14,
    "actualDesignQtyM2": 1066.3,
    "actualDesignWeightTons": 23.14,
    "designProgressPercent": 100,
    "pricePerM2USD": 111,
    "totalAmountUSD": 118359.3,
    "advanceUSD": 0,
    "balanceUSD": 118359.3,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": "in 12 weeks from the shell plan approval date",
    "loadingDate": null,
    "etd": null,
    "eta": null,
    "fwd": null,
    "paymentTerm": "100% TT  upon shipment and issuance of all related shipping documents",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-031",
    "country": "India",
    "customer": "HQ_DLF",
    "project": "DAHLIAS",
    "block": "TWR 2",
    "contractDate": "04-06-2026",
    "contractStatus": "Signed",
    "contractQtyM2": 1066.3,
    "contractWeightTons": 23.14,
    "actualDesignQtyM2": 1066.3,
    "actualDesignWeightTons": 23.14,
    "designProgressPercent": 100,
    "pricePerM2USD": 111,
    "totalAmountUSD": 118359.3,
    "advanceUSD": 0,
    "balanceUSD": 118359.3,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": "in 12 weeks from the shell plan approval date",
    "loadingDate": null,
    "etd": null,
    "eta": null,
    "fwd": null,
    "paymentTerm": "100% TT  upon shipment and issuance of all related shipping documents",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-032",
    "country": "India",
    "customer": "HQ_DLF",
    "project": "DAHLIAS",
    "block": "TWR 1",
    "contractDate": "04-06-2026",
    "contractStatus": "Signed",
    "contractQtyM2": 1066.3,
    "contractWeightTons": 23.14,
    "actualDesignQtyM2": 1066.3,
    "actualDesignWeightTons": 23.14,
    "designProgressPercent": 100,
    "pricePerM2USD": 111,
    "totalAmountUSD": 118359.3,
    "advanceUSD": 0,
    "balanceUSD": 118359.3,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": "in 12 weeks from the shell plan approval date",
    "loadingDate": null,
    "etd": null,
    "eta": null,
    "fwd": null,
    "paymentTerm": "100% TT  upon shipment and issuance of all related shipping documents",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-033",
    "country": "India",
    "customer": "VENUS STAR",
    "project": "VENUS CAPITAL HEIGHTS",
    "block": "TOWER 1~9",
    "contractDate": "04-07-2026",
    "contractStatus": "Signed",
    "contractQtyM2": 35631,
    "contractWeightTons": 773.19,
    "actualDesignQtyM2": 35631,
    "actualDesignWeightTons": 773.19,
    "designProgressPercent": 100,
    "pricePerM2USD": 139.33,
    "totalAmountUSD": 5024229.73,
    "advanceUSD": 502422.97,
    "balanceUSD": 4521806.76,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": "Material shall be delivered within 100  days from the Shell Plan approval date.",
    "loadingDate": null,
    "etd": null,
    "eta": null,
    "fwd": null,
    "paymentTerm": "10%  within 10 days of acceptance of  the Offer, 20 % on Shell Plan Approval within 10 days  (T/T).BG against 30% advance paid.  Balance 70% by usance LC payable 90 days after bill of lading,",
    "paymentStatus": "0.09999999940289353",
    "incoterm": "CIF ICD Delhi 7-8 visitors",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-034",
    "country": "India",
    "customer": "BREN",
    "project": "POLARIS",
    "block": "BLOCK 1, 3 ,4",
    "contractDate": "07-07-2026",
    "contractStatus": "Signed",
    "contractQtyM2": 11214,
    "contractWeightTons": 242.22,
    "actualDesignQtyM2": 11214,
    "actualDesignWeightTons": 242.22,
    "designProgressPercent": 100,
    "pricePerM2USD": 137.5,
    "totalAmountUSD": 1541925,
    "advanceUSD": 0,
    "balanceUSD": 1541925,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": "in 11-12 weeks from the shell plan approval date",
    "loadingDate": null,
    "etd": null,
    "eta": null,
    "fwd": null,
    "paymentTerm": "TT(after PO 10%, before production 20%, After 2 weeks of start production 20%,After 3 weeks of start production 20%, After 4 weeks of start production 20%,before ship 10%)",
    "paymentStatus": "0",
    "incoterm": "CIF ICD Bangalore 4 visitors",
    "remark": "issued PI 10%",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "IND-035",
    "country": "India",
    "customer": "BREN",
    "project": "IMPERIA GRANDE",
    "block": "Wing 1",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": null,
    "contractWeightTons": null,
    "actualDesignQtyM2": 1799.29,
    "actualDesignWeightTons": 39.04,
    "designProgressPercent": null,
    "pricePerM2USD": 119.5,
    "totalAmountUSD": 215014.68,
    "advanceUSD": null,
    "balanceUSD": 215014.68,
    "shellPlanConfirmation": "27-04-2026",
    "mdCompletion": "07-08-2026",
    "productionStart": "Awating new PO",
    "productionComplete": null,
    "deliveryRequest": "in 11-12 weeks from the shell plan approval date",
    "loadingDate": "NA",
    "etd": "31-08-2026",
    "eta": "1st Week of Oct",
    "fwd": "02-10-2026",
    "paymentTerm": "TT(after PO 10%, before production 20%, After Production 20%, 20%,20% before ship 10%)",
    "paymentStatus": "0",
    "incoterm": "",
    "remark": "issued PI 10%",
    "sourceSheet": "Detail list (2)",
    "initialContractQtyM2": 4110,
    "initialContractWeightTons": 88.78
  },
  {
    "projectId": "IND-036",
    "country": "India",
    "customer": "PHARANDE SPACES",
    "project": "L-AXIS",
    "block": "",
    "contractDate": null,
    "contractStatus": "Not Signed",
    "contractQtyM2": null,
    "contractWeightTons": null,
    "actualDesignQtyM2": 4076,
    "actualDesignWeightTons": 90,
    "designProgressPercent": null,
    "pricePerM2USD": 119,
    "totalAmountUSD": 485044,
    "advanceUSD": 242522,
    "balanceUSD": 242522,
    "shellPlanConfirmation": "08-01-2026",
    "mdCompletion": "04-03-2026",
    "productionStart": null,
    "productionComplete": "27-04-2026",
    "deliveryRequest": "46096",
    "loadingDate": null,
    "etd": null,
    "eta": null,
    "fwd": null,
    "paymentTerm": "Before: TT(after PO 30%, before production 40% before shipping 30%) After: TT(after PO 30%, before production 20% before shipping 50%)",
    "paymentStatus": "Received 50%",
    "incoterm": "DAP Pune (Nhava Sheva check) Cancelled",
    "remark": "",
    "sourceSheet": "Detail list (2)"
  },
  {
    "projectId": "MYS-001",
    "country": "Malaysia",
    "customer": "KC CONTRACT",
    "project": "KS7 TYPE B (16 UNITS)",
    "block": "",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": 916189,
    "contractWeightTons": 22.44,
    "actualDesignQtyM2": null,
    "actualDesignWeightTons": null,
    "designProgressPercent": null,
    "pricePerM2USD": null,
    "totalAmountUSD": null,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": "25-04-2025",
    "loadingDate": "19-04-2025",
    "etd": "20-04-2025",
    "eta": "23-04-2025",
    "fwd": null,
    "paymentTerm": "T/T",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "KKM",
    "sets": 1
  },
  {
    "projectId": "MYS-002",
    "country": "Malaysia",
    "customer": "KC CONTRACT",
    "project": "SP34 SHOP LOT",
    "block": "",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": 1631.9,
    "contractWeightTons": 40.24,
    "actualDesignQtyM2": null,
    "actualDesignWeightTons": null,
    "designProgressPercent": null,
    "pricePerM2USD": null,
    "totalAmountUSD": null,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": "29-04-2025",
    "loadingDate": "28-04-2025",
    "etd": "02-05-2025",
    "eta": "05-05-2025",
    "fwd": null,
    "paymentTerm": "T/T",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "KKM",
    "sets": 1
  },
  {
    "projectId": "MYS-003",
    "country": "Malaysia",
    "customer": "PAMIR",
    "project": "T093 SENIBONG COVE (PART 2)",
    "block": "",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": 248.57,
    "contractWeightTons": 7.1,
    "actualDesignQtyM2": null,
    "actualDesignWeightTons": null,
    "designProgressPercent": null,
    "pricePerM2USD": null,
    "totalAmountUSD": null,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": "02-05-2025",
    "loadingDate": "07-05-2025",
    "etd": "12-05-2025",
    "eta": "15-05-2025",
    "fwd": null,
    "paymentTerm": "T/T",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "KKM",
    "sets": 1
  },
  {
    "projectId": "MYS-004",
    "country": "Malaysia",
    "customer": "ALPHAZEN",
    "project": "EMERALD 9",
    "block": "",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": 611.43,
    "contractWeightTons": 18.06,
    "actualDesignQtyM2": null,
    "actualDesignWeightTons": null,
    "designProgressPercent": null,
    "pricePerM2USD": null,
    "totalAmountUSD": null,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": "02-05-2025",
    "loadingDate": "15-05-2025",
    "etd": "28-05-2025",
    "eta": "31-05-2025",
    "fwd": null,
    "paymentTerm": "T/T",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "KKM",
    "sets": 1
  },
  {
    "projectId": "MYS-005",
    "country": "Malaysia",
    "customer": "SLG",
    "project": "111 MENERUNG",
    "block": "",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": null,
    "contractWeightTons": null,
    "actualDesignQtyM2": null,
    "actualDesignWeightTons": null,
    "designProgressPercent": null,
    "pricePerM2USD": null,
    "totalAmountUSD": null,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": "02-05-2025",
    "loadingDate": "17-05-2025",
    "etd": "28-05-2025",
    "eta": "31-05-2025",
    "fwd": null,
    "paymentTerm": "T/T",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "KKM",
    "sets": 1
  },
  {
    "projectId": "MDV-001",
    "country": "Maldives",
    "customer": "TEONG JIN",
    "project": "MALDIVES",
    "block": "A&C",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": 1953,
    "contractWeightTons": 44.92,
    "actualDesignQtyM2": null,
    "actualDesignWeightTons": null,
    "designProgressPercent": null,
    "pricePerM2USD": null,
    "totalAmountUSD": null,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": "30-06-2025",
    "loadingDate": "24-jun 2 jul 18-jul",
    "etd": "26-jun 6-jul 22-jul",
    "eta": "29-jun 9-jul 25-jul",
    "fwd": null,
    "paymentTerm": "T/T",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "KKM",
    "sets": 2
  },
  {
    "projectId": "MYS-006",
    "country": "Malaysia",
    "customer": "KC CONTRACT",
    "project": "JK3 KULAI",
    "block": "",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": 1150,
    "contractWeightTons": 26.45,
    "actualDesignQtyM2": null,
    "actualDesignWeightTons": null,
    "designProgressPercent": null,
    "pricePerM2USD": null,
    "totalAmountUSD": null,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": "10-07-2025",
    "loadingDate": "7-jul 16-jul",
    "etd": "9-jul 17-jul",
    "eta": "12-jul 20-jul",
    "fwd": null,
    "paymentTerm": "T/T",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "KKM",
    "sets": 1
  },
  {
    "projectId": "MYS-007",
    "country": "Malaysia",
    "customer": "CREST BUILDER",
    "project": "CONNAUGHT ONE A",
    "block": "STD",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": 3504,
    "contractWeightTons": 80.59,
    "actualDesignQtyM2": null,
    "actualDesignWeightTons": null,
    "designProgressPercent": null,
    "pricePerM2USD": null,
    "totalAmountUSD": null,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": null,
    "loadingDate": null,
    "etd": null,
    "eta": null,
    "fwd": null,
    "paymentTerm": "T/T",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "KKM"
  },
  {
    "projectId": "MYS-008",
    "country": "Malaysia",
    "customer": "CREST BUILDER",
    "project": "CONNAUGHT ONE A",
    "block": "NON-STD",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": 4533,
    "contractWeightTons": 104.26,
    "actualDesignQtyM2": null,
    "actualDesignWeightTons": null,
    "designProgressPercent": null,
    "pricePerM2USD": null,
    "totalAmountUSD": null,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": null,
    "loadingDate": null,
    "etd": null,
    "eta": null,
    "fwd": null,
    "paymentTerm": "T/T",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "KKM"
  },
  {
    "projectId": "MYS-009",
    "country": "Malaysia",
    "customer": "KC CONTRACT - J6",
    "project": "J6@JENJAROM",
    "block": "",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": 1200,
    "contractWeightTons": 27.6,
    "actualDesignQtyM2": null,
    "actualDesignWeightTons": null,
    "designProgressPercent": null,
    "pricePerM2USD": null,
    "totalAmountUSD": null,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": null,
    "loadingDate": null,
    "etd": null,
    "eta": null,
    "fwd": null,
    "paymentTerm": "T/T",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "KKM"
  },
  {
    "projectId": "MYS-010",
    "country": "Malaysia",
    "customer": "BINASTRA (Customer Visit)",
    "project": "KINGSWOODZ B.1",
    "block": "B1",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": 1500,
    "contractWeightTons": 34.5,
    "actualDesignQtyM2": null,
    "actualDesignWeightTons": null,
    "designProgressPercent": null,
    "pricePerM2USD": null,
    "totalAmountUSD": null,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": null,
    "loadingDate": null,
    "etd": null,
    "eta": null,
    "fwd": null,
    "paymentTerm": "T/T",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "KKM"
  },
  {
    "projectId": "MYS-011",
    "country": "Malaysia",
    "customer": "BINASTRA (Customer Visit)",
    "project": "KINGSWOODZ B.2",
    "block": "B2",
    "contractDate": null,
    "contractStatus": "Signed",
    "contractQtyM2": 1500,
    "contractWeightTons": 34.5,
    "actualDesignQtyM2": null,
    "actualDesignWeightTons": null,
    "designProgressPercent": null,
    "pricePerM2USD": null,
    "totalAmountUSD": null,
    "advanceUSD": null,
    "balanceUSD": null,
    "shellPlanConfirmation": null,
    "mdCompletion": null,
    "productionStart": null,
    "productionComplete": null,
    "deliveryRequest": null,
    "loadingDate": null,
    "etd": null,
    "eta": null,
    "fwd": null,
    "paymentTerm": "T/T",
    "paymentStatus": "",
    "incoterm": "",
    "remark": "",
    "sourceSheet": "KKM"
  }
];

// ============================================================
// DESIGN SCHEDULE DATA
// ============================================================
export const designScheduleData: DesignSchedule[] = [
  {
    "designId": "DS-0001",
    "projectId": "IND-001",
    "element": "Wall",
    "plannedDate": "11-07-2025",
    "actualDate": "11-07-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0002",
    "projectId": "IND-001",
    "element": "Beam",
    "plannedDate": "11-07-2025",
    "actualDate": "11-07-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0003",
    "projectId": "IND-001",
    "element": "Slab",
    "plannedDate": "30-05-2025",
    "actualDate": "30-05-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0004",
    "projectId": "IND-001",
    "element": "Stair",
    "plannedDate": "x",
    "actualDate": "x",
    "status": "In Progress"
  },
  {
    "designId": "DS-0005",
    "projectId": "IND-001",
    "element": "ACC",
    "plannedDate": "x",
    "actualDate": "x",
    "status": "In Progress"
  },
  {
    "designId": "DS-0006",
    "projectId": "IND-001",
    "element": "Floor Change",
    "plannedDate": "x",
    "actualDate": "x",
    "status": "In Progress"
  },
  {
    "designId": "DS-0007",
    "projectId": "IND-002",
    "element": "Wall",
    "plannedDate": "14-07-2025",
    "actualDate": "14-07-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0008",
    "projectId": "IND-002",
    "element": "Beam",
    "plannedDate": "05-08-2025",
    "actualDate": "05-08-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0009",
    "projectId": "IND-002",
    "element": "Slab",
    "plannedDate": "30-05-2025",
    "actualDate": "30-05-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0010",
    "projectId": "IND-002",
    "element": "Stair",
    "plannedDate": "27-06-2025",
    "actualDate": "27-06-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0011",
    "projectId": "IND-002",
    "element": "ACC",
    "plannedDate": "x",
    "actualDate": "x",
    "status": "In Progress"
  },
  {
    "designId": "DS-0012",
    "projectId": "IND-002",
    "element": "Floor Change",
    "plannedDate": "x",
    "actualDate": "x",
    "status": "In Progress"
  },
  {
    "designId": "DS-0013",
    "projectId": "IND-003",
    "element": "Wall",
    "plannedDate": "11-07-2025",
    "actualDate": "04-11-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0014",
    "projectId": "IND-003",
    "element": "Beam",
    "plannedDate": "x",
    "actualDate": "x",
    "status": "In Progress"
  },
  {
    "designId": "DS-0015",
    "projectId": "IND-003",
    "element": "Slab",
    "plannedDate": "x",
    "actualDate": "x",
    "status": "In Progress"
  },
  {
    "designId": "DS-0016",
    "projectId": "IND-003",
    "element": "Stair",
    "plannedDate": "x",
    "actualDate": "x",
    "status": "In Progress"
  },
  {
    "designId": "DS-0017",
    "projectId": "IND-003",
    "element": "ACC",
    "plannedDate": "x",
    "actualDate": "x",
    "status": "In Progress"
  },
  {
    "designId": "DS-0018",
    "projectId": "IND-003",
    "element": "Floor Change",
    "plannedDate": "x",
    "actualDate": "x",
    "status": "In Progress"
  },
  {
    "designId": "DS-0019",
    "projectId": "IND-004",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "06-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0020",
    "projectId": "IND-004",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "06-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0021",
    "projectId": "IND-004",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "24-12-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0022",
    "projectId": "IND-004",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "12-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0023",
    "projectId": "IND-004",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "09-03-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0024",
    "projectId": "IND-004",
    "element": "Floor Change",
    "plannedDate": null,
    "actualDate": "15-03-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0025",
    "projectId": "IND-005",
    "element": "Wall",
    "plannedDate": "04-11-2025",
    "actualDate": "04-11-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0026",
    "projectId": "IND-005",
    "element": "Beam",
    "plannedDate": "x",
    "actualDate": "x",
    "status": "In Progress"
  },
  {
    "designId": "DS-0027",
    "projectId": "IND-005",
    "element": "Slab",
    "plannedDate": "x",
    "actualDate": "x",
    "status": "In Progress"
  },
  {
    "designId": "DS-0028",
    "projectId": "IND-005",
    "element": "Stair",
    "plannedDate": "x",
    "actualDate": "x",
    "status": "In Progress"
  },
  {
    "designId": "DS-0029",
    "projectId": "IND-005",
    "element": "ACC",
    "plannedDate": "x",
    "actualDate": "x",
    "status": "In Progress"
  },
  {
    "designId": "DS-0030",
    "projectId": "IND-005",
    "element": "Floor Change",
    "plannedDate": "x",
    "actualDate": "x",
    "status": "In Progress"
  },
  {
    "designId": "DS-0031",
    "projectId": "IND-006",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "06-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0032",
    "projectId": "IND-006",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "06-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0033",
    "projectId": "IND-006",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "24-12-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0034",
    "projectId": "IND-006",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "12-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0035",
    "projectId": "IND-006",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "09-03-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0036",
    "projectId": "IND-006",
    "element": "Floor Change",
    "plannedDate": null,
    "actualDate": "15-03-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0037",
    "projectId": "IND-008",
    "element": "Wall",
    "plannedDate": "02-12-2025",
    "actualDate": "09-12-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0038",
    "projectId": "IND-008",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "06-12-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0039",
    "projectId": "IND-008",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "04-12-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0040",
    "projectId": "IND-008",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "10-12-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0041",
    "projectId": "IND-008",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "14-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0042",
    "projectId": "IND-008",
    "element": "Floor Change",
    "plannedDate": null,
    "actualDate": "12-12-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0043",
    "projectId": "IND-009",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "P2 16-Dec",
    "status": "Completed"
  },
  {
    "designId": "DS-0044",
    "projectId": "IND-009",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "P2 16-Dec",
    "status": "Completed"
  },
  {
    "designId": "DS-0045",
    "projectId": "IND-009",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "16-12-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0046",
    "projectId": "IND-009",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "16-12-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0047",
    "projectId": "IND-009",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "14-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0048",
    "projectId": "IND-009",
    "element": "Floor Change",
    "plannedDate": null,
    "actualDate": "19-12-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0049",
    "projectId": "IND-010",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "P3 19-Dec",
    "status": "Completed"
  },
  {
    "designId": "DS-0050",
    "projectId": "IND-010",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "P3 19-Dec",
    "status": "Completed"
  },
  {
    "designId": "DS-0051",
    "projectId": "IND-010",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "19-12-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0052",
    "projectId": "IND-010",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "31-12-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0053",
    "projectId": "IND-010",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "14-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0054",
    "projectId": "IND-010",
    "element": "Floor Change",
    "plannedDate": null,
    "actualDate": "02-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0055",
    "projectId": "IND-011",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "23-12-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0056",
    "projectId": "IND-011",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "23-12-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0057",
    "projectId": "IND-011",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "23-12-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-0058",
    "projectId": "IND-011",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "02-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0059",
    "projectId": "IND-011",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "14-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0060",
    "projectId": "IND-011",
    "element": "Floor Change",
    "plannedDate": null,
    "actualDate": "06-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0061",
    "projectId": "IND-012",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "x",
    "status": "Not Started"
  },
  {
    "designId": "DS-0062",
    "projectId": "IND-012",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "P5 8 Jan",
    "status": "Completed"
  },
  {
    "designId": "DS-0063",
    "projectId": "IND-012",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "x",
    "status": "Not Started"
  },
  {
    "designId": "DS-0064",
    "projectId": "IND-012",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "x",
    "status": "Not Started"
  },
  {
    "designId": "DS-0065",
    "projectId": "IND-012",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "23-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0066",
    "projectId": "IND-012",
    "element": "Floor Change",
    "plannedDate": null,
    "actualDate": "22-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0067",
    "projectId": "IND-013",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "31-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0068",
    "projectId": "IND-013",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "31-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0069",
    "projectId": "IND-013",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "31-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0070",
    "projectId": "IND-013",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "31-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0071",
    "projectId": "IND-013",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "31-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0072",
    "projectId": "IND-013",
    "element": "Floor Change",
    "plannedDate": null,
    "actualDate": "x",
    "status": "Not Started"
  },
  {
    "designId": "DS-0073",
    "projectId": "IND-014",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "06-03-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0074",
    "projectId": "IND-014",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "06-03-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0075",
    "projectId": "IND-014",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "06-03-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0076",
    "projectId": "IND-014",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "06-03-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0077",
    "projectId": "IND-014",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "18-03-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0078",
    "projectId": "IND-015",
    "element": "Wall",
    "plannedDate": "14-01-2026",
    "actualDate": "31-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0079",
    "projectId": "IND-015",
    "element": "Beam",
    "plannedDate": "20-01-2026",
    "actualDate": "31-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0080",
    "projectId": "IND-015",
    "element": "Slab",
    "plannedDate": "20-01-2026",
    "actualDate": "31-01-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0081",
    "projectId": "IND-015",
    "element": "Stair",
    "plannedDate": "20-01-2026",
    "actualDate": "10-02-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0082",
    "projectId": "IND-015",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "02-03-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0083",
    "projectId": "IND-015",
    "element": "Floor Change",
    "plannedDate": null,
    "actualDate": "11-02-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0084",
    "projectId": "IND-016",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "16-04-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0085",
    "projectId": "IND-016",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "16-04-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0086",
    "projectId": "IND-016",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "16-04-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0087",
    "projectId": "IND-016",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "06-04-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0088",
    "projectId": "IND-016",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "05-05-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0089",
    "projectId": "IND-016",
    "element": "Floor Change",
    "plannedDate": null,
    "actualDate": "x",
    "status": "Not Started"
  },
  {
    "designId": "DS-0090",
    "projectId": "IND-017",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "30-06-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0091",
    "projectId": "IND-017",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "03-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0092",
    "projectId": "IND-017",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "04-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0093",
    "projectId": "IND-017",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "08-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0094",
    "projectId": "IND-017",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "25-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0095",
    "projectId": "IND-018",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "17-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0096",
    "projectId": "IND-018",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "17-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0097",
    "projectId": "IND-018",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "17-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0098",
    "projectId": "IND-018",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "17-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0099",
    "projectId": "IND-018",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "17-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0100",
    "projectId": "IND-019",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "28-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0101",
    "projectId": "IND-019",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "28-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0102",
    "projectId": "IND-019",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "30-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0103",
    "projectId": "IND-019",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "04-08-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0104",
    "projectId": "IND-019",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "18-08-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0105",
    "projectId": "IND-020",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "03-08-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0106",
    "projectId": "IND-020",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "03-08-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0107",
    "projectId": "IND-020",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "03-08-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0108",
    "projectId": "IND-020",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "04-08-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0109",
    "projectId": "IND-020",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "25-08-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0110",
    "projectId": "IND-021",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "04-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0111",
    "projectId": "IND-021",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "09-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0112",
    "projectId": "IND-021",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "09-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0113",
    "projectId": "IND-021",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "10-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0114",
    "projectId": "IND-021",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "27-08-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0115",
    "projectId": "IND-022",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "24-06-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0116",
    "projectId": "IND-022",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "24-06-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0117",
    "projectId": "IND-022",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "26-06-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0118",
    "projectId": "IND-022",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "30-06-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0119",
    "projectId": "IND-022",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "17-08-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0120",
    "projectId": "IND-023",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "22-05-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0121",
    "projectId": "IND-023",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "22-05-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0122",
    "projectId": "IND-023",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "27-05-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0123",
    "projectId": "IND-023",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "28-05-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0124",
    "projectId": "IND-023",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "20-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0125",
    "projectId": "IND-023",
    "element": "Floor Change",
    "plannedDate": null,
    "actualDate": "12-06-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0126",
    "projectId": "IND-025",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "22-06-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0127",
    "projectId": "IND-025",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "22-06-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0128",
    "projectId": "IND-025",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "22-06-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0129",
    "projectId": "IND-026",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "01-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0130",
    "projectId": "IND-026",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "01-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0131",
    "projectId": "IND-026",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "01-07-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0132",
    "projectId": "IND-035",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "07-08-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0133",
    "projectId": "IND-035",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "07-08-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0134",
    "projectId": "IND-035",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "07-08-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0135",
    "projectId": "IND-035",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "07-08-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0136",
    "projectId": "IND-035",
    "element": "ACC",
    "plannedDate": null,
    "actualDate": "Waiting",
    "status": "Completed"
  },
  {
    "designId": "DS-0137",
    "projectId": "IND-036",
    "element": "Wall",
    "plannedDate": null,
    "actualDate": "13-02-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0138",
    "projectId": "IND-036",
    "element": "Beam",
    "plannedDate": null,
    "actualDate": "26-02-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0139",
    "projectId": "IND-036",
    "element": "Slab",
    "plannedDate": null,
    "actualDate": "26-02-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-0140",
    "projectId": "IND-036",
    "element": "Stair",
    "plannedDate": null,
    "actualDate": "04-03-2026",
    "status": "Completed"
  },
  {
    "designId": "DS-1001",
    "projectId": "MYS-001",
    "element": "Wall",
    "plannedDate": "14-03-2025",
    "actualDate": "14-03-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-1002",
    "projectId": "MYS-001",
    "element": "Beam",
    "plannedDate": "14-03-2025",
    "actualDate": "14-03-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-1003",
    "projectId": "MYS-001",
    "element": "Stair",
    "plannedDate": "28-03-2025",
    "actualDate": "28-03-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-1004",
    "projectId": "MYS-002",
    "element": "Beam",
    "plannedDate": "24-03-2025",
    "actualDate": null,
    "status": "In Progress"
  },
  {
    "designId": "DS-1005",
    "projectId": "MYS-003",
    "element": "Beam",
    "plannedDate": "25-04-2025",
    "actualDate": "25-04-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-1006",
    "projectId": "MYS-004",
    "element": "Stair",
    "plannedDate": "14-04-2025",
    "actualDate": "14-04-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-1007",
    "projectId": "MYS-005",
    "element": "Beam",
    "plannedDate": "25-04-2025",
    "actualDate": "25-04-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-1008",
    "projectId": "MYS-005",
    "element": "Slab",
    "plannedDate": "23-04-2025",
    "actualDate": "23-04-2025",
    "status": "Completed"
  },
  {
    "designId": "DS-1009",
    "projectId": "MYS-005",
    "element": "Stair",
    "plannedDate": "15-04-2025",
    "actualDate": "15-04-2025",
    "status": "Completed"
  }
];

// ============================================================
// PRODUCTION RECORDS
// ============================================================
export const productionData: ProductionRecord[] = [
  {
    "productionId": "PR-2001",
    "projectId": "IND-008",
    "part": "P1",
    "orderQtyM2": 3731.93,
    "orderQtyKg": 88820.77,
    "finishedQtyM2": 3731.93,
    "finishedQtyKg": 88820.77,
    "balanceQty": 0,
    "completionPercent": 100,
    "productionStartDate": null,
    "productionCompleteDate": null
  },
  {
    "productionId": "PR-2002",
    "projectId": "IND-009",
    "part": "P2",
    "orderQtyM2": 2456.42,
    "orderQtyKg": 58014.88,
    "finishedQtyM2": 2456.42,
    "finishedQtyKg": 58014.88,
    "balanceQty": 0,
    "completionPercent": 100,
    "productionStartDate": null,
    "productionCompleteDate": null
  },
  {
    "productionId": "PR-2003",
    "projectId": "IND-010",
    "part": "P3",
    "orderQtyM2": 2476.18,
    "orderQtyKg": 58742.13,
    "finishedQtyM2": 2476.18,
    "finishedQtyKg": 58742.13,
    "balanceQty": 0,
    "completionPercent": 100,
    "productionStartDate": null,
    "productionCompleteDate": null
  },
  {
    "productionId": "PR-2004",
    "projectId": "IND-011",
    "part": "P4",
    "orderQtyM2": 2500.97,
    "orderQtyKg": 59100.9,
    "finishedQtyM2": 2459.11,
    "finishedQtyKg": 58225.9,
    "balanceQty": 875,
    "completionPercent": 98.33,
    "productionStartDate": null,
    "productionCompleteDate": null
  },
  {
    "productionId": "PR-2005",
    "projectId": "IND-012",
    "part": "P5",
    "orderQtyM2": 1367.63,
    "orderQtyKg": 32319.86,
    "finishedQtyM2": 619.54,
    "finishedQtyKg": 16162.53,
    "balanceQty": 16157.33,
    "completionPercent": 45.3,
    "productionStartDate": null,
    "productionCompleteDate": null
  },
  {
    "productionId": "PR-2006",
    "projectId": "IND-013",
    "part": "P6",
    "orderQtyM2": 103.39,
    "orderQtyKg": 2271.55,
    "finishedQtyM2": 103.39,
    "finishedQtyKg": 2271.55,
    "balanceQty": 0,
    "completionPercent": 100,
    "productionStartDate": null,
    "productionCompleteDate": null
  },
  {
    "productionId": "PR-1001",
    "projectId": "MYS-001",
    "part": "Wall",
    "orderQtyM2": null,
    "orderQtyKg": null,
    "finishedQtyM2": null,
    "finishedQtyKg": null,
    "balanceQty": null,
    "completionPercent": null,
    "productionStartDate": null,
    "productionCompleteDate": "18-04-2025"
  },
  {
    "productionId": "PR-1002",
    "projectId": "MYS-001",
    "part": "Beam",
    "orderQtyM2": null,
    "orderQtyKg": null,
    "finishedQtyM2": null,
    "finishedQtyKg": null,
    "balanceQty": null,
    "completionPercent": null,
    "productionStartDate": null,
    "productionCompleteDate": "18-04-2025"
  },
  {
    "productionId": "PR-1003",
    "projectId": "MYS-001",
    "part": "Stair",
    "orderQtyM2": null,
    "orderQtyKg": null,
    "finishedQtyM2": null,
    "finishedQtyKg": null,
    "balanceQty": null,
    "completionPercent": null,
    "productionStartDate": null,
    "productionCompleteDate": "18-04-2025"
  },
  {
    "productionId": "PR-1004",
    "projectId": "MYS-002",
    "part": "Beam",
    "orderQtyM2": null,
    "orderQtyKg": null,
    "finishedQtyM2": null,
    "finishedQtyKg": null,
    "balanceQty": null,
    "completionPercent": null,
    "productionStartDate": null,
    "productionCompleteDate": "24-03-2025"
  },
  {
    "productionId": "PR-1005",
    "projectId": "MYS-003",
    "part": "Beam",
    "orderQtyM2": null,
    "orderQtyKg": null,
    "finishedQtyM2": null,
    "finishedQtyKg": null,
    "balanceQty": null,
    "completionPercent": null,
    "productionStartDate": null,
    "productionCompleteDate": "02-05-2025"
  },
  {
    "productionId": "PR-1006",
    "projectId": "MYS-004",
    "part": "Beam",
    "orderQtyM2": null,
    "orderQtyKg": null,
    "finishedQtyM2": null,
    "finishedQtyKg": null,
    "balanceQty": null,
    "completionPercent": null,
    "productionStartDate": null,
    "productionCompleteDate": "07-05-2025"
  },
  {
    "productionId": "PR-1007",
    "projectId": "MYS-005",
    "part": "Beam",
    "orderQtyM2": null,
    "orderQtyKg": null,
    "finishedQtyM2": null,
    "finishedQtyKg": null,
    "balanceQty": null,
    "completionPercent": null,
    "productionStartDate": null,
    "productionCompleteDate": "11-05-2025"
  }
];

// ============================================================
// SHIPMENT RECORDS
// ============================================================
export const shipmentData: ShipmentRecord[] = [
  {
    "shipmentId": "SH-0001",
    "projectId": "IND-001",
    "block": "T1_Basement",
    "loadingDate": "29-07-2025",
    "etd": "29-07-2025",
    "eta": "29-07-2025",
    "fwd": "03-08-2025",
    "incoterm": "CIF ICD Bangalore",
    "deliveryTimeline": "ETD 30-Jul",
    "status": "Delivered"
  },
  {
    "shipmentId": "SH-0002",
    "projectId": "IND-002",
    "block": "T1_Typical",
    "loadingDate": "22-10-2025",
    "etd": "22-10-2025",
    "eta": "22-10-2025",
    "fwd": "28-10-2025",
    "incoterm": "CIF ICD Bangalore",
    "deliveryTimeline": "ASAP",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0003",
    "projectId": "IND-003",
    "block": "T2_Basement",
    "loadingDate": "26-10-2025",
    "etd": "Waiting cfm",
    "eta": null,
    "fwd": null,
    "incoterm": "CIF ICD Bangalore",
    "deliveryTimeline": "The First shipment shall leave from Hochiminh port, Vietnam within12 to 13 weeks from the date of shell plan drawings confirmation byClient",
    "status": "Planned"
  },
  {
    "shipmentId": "SH-0004",
    "projectId": "IND-005",
    "block": "T3_Basement",
    "loadingDate": "26-10-2025",
    "etd": "Waiting cfm",
    "eta": null,
    "fwd": null,
    "incoterm": "CIF ICD Bangalore",
    "deliveryTimeline": "",
    "status": "Planned"
  },
  {
    "shipmentId": "SH-0005",
    "projectId": "IND-007",
    "block": "T4",
    "loadingDate": "Waiting cfm",
    "etd": "Waiting cfm",
    "eta": null,
    "fwd": null,
    "incoterm": "CIF ICD Bangalore",
    "deliveryTimeline": "",
    "status": "Planned"
  },
  {
    "shipmentId": "SH-0006",
    "projectId": "IND-008",
    "block": "T8 p1",
    "loadingDate": null,
    "etd": null,
    "eta": "25-02-2026",
    "fwd": "01-03-2026",
    "incoterm": "CIF ICD Bangalore",
    "deliveryTimeline": "ASAP",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0007",
    "projectId": "IND-009",
    "block": "T8 p2",
    "loadingDate": null,
    "etd": null,
    "eta": "25-02-2026",
    "fwd": "01-03-2026",
    "incoterm": "CIF ICD Bangalore",
    "deliveryTimeline": "ASAP",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0008",
    "projectId": "IND-010",
    "block": "T8 p3",
    "loadingDate": null,
    "etd": null,
    "eta": "25-02-2026",
    "fwd": "01-03-2026",
    "incoterm": "CIF ICD Bangalore",
    "deliveryTimeline": "ASAP",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0009",
    "projectId": "IND-011",
    "block": "T8 p4",
    "loadingDate": null,
    "etd": null,
    "eta": "28-03-2026",
    "fwd": "03-04-2026",
    "incoterm": "CIF ICD Bangalore",
    "deliveryTimeline": "ASAP",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0010",
    "projectId": "IND-012",
    "block": "T8 p5",
    "loadingDate": null,
    "etd": null,
    "eta": "28-03-2026",
    "fwd": "03-04-2026",
    "incoterm": "CIF ICD Bangalore",
    "deliveryTimeline": "ASAP",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0011",
    "projectId": "IND-013",
    "block": "T8 p6",
    "loadingDate": null,
    "etd": null,
    "eta": "28-03-2026",
    "fwd": "03-04-2026",
    "incoterm": "CIF ICD Bangalore",
    "deliveryTimeline": "ASAP",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0012",
    "projectId": "IND-014",
    "block": "",
    "loadingDate": "9-Apr\r\n18-Apr",
    "etd": "9-Apr\r\n18-Apr",
    "eta": "9-Apr\r\n18-Apr",
    "fwd": "14-Apr\r\n22-Apr",
    "incoterm": "DDP MUMBAI without GST tax",
    "deliveryTimeline": "",
    "status": "Delivered"
  },
  {
    "shipmentId": "SH-0013",
    "projectId": "IND-015",
    "block": "",
    "loadingDate": "08-04-2026",
    "etd": "08-04-2026",
    "eta": "08-04-2026",
    "fwd": "13-04-2026",
    "incoterm": "CIF ICD Bangalore",
    "deliveryTimeline": "46096",
    "status": "Delivered"
  },
  {
    "shipmentId": "SH-0014",
    "projectId": "IND-016",
    "block": "Wing B",
    "loadingDate": "08-05-2026",
    "etd": "15-08-2026",
    "eta": "18-09-2026",
    "fwd": "20-09-2026",
    "incoterm": "CIF ICD Bangalore 4 visitors",
    "deliveryTimeline": "in 11-12 weeks from the shell plan approval date",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0015",
    "projectId": "IND-017",
    "block": "Wing C",
    "loadingDate": "20-07-2026",
    "etd": "15-08-2026",
    "eta": "18-09-2026",
    "fwd": "20-09-2026",
    "incoterm": "",
    "deliveryTimeline": "in 11-12 weeks from the shell plan approval date",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0016",
    "projectId": "IND-018",
    "block": "Wing A (included 16.719m2 addition)",
    "loadingDate": "07-10-2026",
    "etd": "15-08-2026",
    "eta": "Waiting cfm",
    "fwd": null,
    "incoterm": "CIF ICD Bangalore 4 visitors",
    "deliveryTimeline": "in 11-12 weeks from the shell plan approval date",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0017",
    "projectId": "IND-019",
    "block": "TWR A",
    "loadingDate": "20-07-2026",
    "etd": "31-08-2026",
    "eta": "3rd Week of Sep",
    "fwd": "22-09-2026",
    "incoterm": "CIF ICD Bangalore 4 visitors",
    "deliveryTimeline": "in 11-12 weeks from the shell plan approval date",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0018",
    "projectId": "IND-020",
    "block": "TWR B",
    "loadingDate": "20-07-2026",
    "etd": "31-08-2026",
    "eta": "4th Week of Sep",
    "fwd": "30-09-2026",
    "incoterm": "",
    "deliveryTimeline": "in 11-12 weeks from the shell plan approval date",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0019",
    "projectId": "IND-021",
    "block": "Wing 2",
    "loadingDate": "20-07-2026",
    "etd": "15-08-2026",
    "eta": "11-09-2026",
    "fwd": "13-09-2026",
    "incoterm": "CIF ICD Bangalore 4 visitors",
    "deliveryTimeline": "in 11-12 weeks from the shell plan approval date",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0020",
    "projectId": "IND-022",
    "block": "Wing 3",
    "loadingDate": "20-07-2026",
    "etd": "15-08-2026",
    "eta": "11-09-2026",
    "fwd": "13-09-2026",
    "incoterm": "",
    "deliveryTimeline": "in 11-12 weeks from the shell plan approval date",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0021",
    "projectId": "IND-023",
    "block": "BLD4",
    "loadingDate": "15-05-2026",
    "etd": "10-08-2026",
    "eta": "28-07-2026",
    "fwd": "31-07-2026",
    "incoterm": "CIF ICD Bangalore 2 visitors",
    "deliveryTimeline": "Material should reach at ICD bangalore on 105th Day from the date of shell plan approval.",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0022",
    "projectId": "IND-024",
    "block": "BLD 6 TOWER A",
    "loadingDate": "19-11-2026",
    "etd": "2nd shipment-\r\n1st week of Nov",
    "eta": "09-10-2026",
    "fwd": "12-10-2026",
    "incoterm": "CIF Nhava Sheva",
    "deliveryTimeline": "in 10-12 weeks from the shell plan approval date",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0023",
    "projectId": "IND-025",
    "block": "TWR 3",
    "loadingDate": null,
    "etd": null,
    "eta": "29-07-2026",
    "fwd": "02-08-2026",
    "incoterm": "FOB 2 visitors",
    "deliveryTimeline": "in 12 weeks from the shell plan approval date",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0024",
    "projectId": "IND-026",
    "block": "TWR 7",
    "loadingDate": null,
    "etd": null,
    "eta": "29-07-2026",
    "fwd": "02-08-2026",
    "incoterm": "",
    "deliveryTimeline": "in 12 weeks from the shell plan approval date",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-0025",
    "projectId": "IND-035",
    "block": "Wing 1",
    "loadingDate": "NA",
    "etd": "31-08-2026",
    "eta": "1st Week of Oct",
    "fwd": "02-10-2026",
    "incoterm": "",
    "deliveryTimeline": "in 11-12 weeks from the shell plan approval date",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-1001",
    "projectId": "MYS-001",
    "block": "",
    "loadingDate": "19-04-2025",
    "etd": "20-04-2025",
    "eta": "23-04-2025",
    "fwd": null,
    "incoterm": "",
    "deliveryTimeline": "",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-1002",
    "projectId": "MYS-002",
    "block": "",
    "loadingDate": "28-04-2025",
    "etd": "02-05-2025",
    "eta": "05-05-2025",
    "fwd": null,
    "incoterm": "",
    "deliveryTimeline": "",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-1003",
    "projectId": "MYS-003",
    "block": "",
    "loadingDate": "07-05-2025",
    "etd": "12-05-2025",
    "eta": "15-05-2025",
    "fwd": null,
    "incoterm": "",
    "deliveryTimeline": "",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-1004",
    "projectId": "MYS-004",
    "block": "",
    "loadingDate": "15-05-2025",
    "etd": "28-05-2025",
    "eta": "31-05-2025",
    "fwd": null,
    "incoterm": "",
    "deliveryTimeline": "",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-1005",
    "projectId": "MYS-005",
    "block": "",
    "loadingDate": "17-05-2025",
    "etd": "28-05-2025",
    "eta": "31-05-2025",
    "fwd": null,
    "incoterm": "",
    "deliveryTimeline": "",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-1006",
    "projectId": "MDV-001",
    "block": "A&C",
    "loadingDate": "24-jun 2 jul 18-jul",
    "etd": "26-jun 6-jul 22-jul",
    "eta": "29-jun 9-jul 25-jul",
    "fwd": null,
    "incoterm": "",
    "deliveryTimeline": "",
    "status": "In Transit"
  },
  {
    "shipmentId": "SH-1007",
    "projectId": "MYS-006",
    "block": "",
    "loadingDate": "7-jul 16-jul",
    "etd": "9-jul 17-jul",
    "eta": "12-jul 20-jul",
    "fwd": null,
    "incoterm": "",
    "deliveryTimeline": "",
    "status": "In Transit"
  }
];

// ============================================================
// PAYMENT RECORDS
// ============================================================
export const paymentData: PaymentRecord[] = [
  {
    "paymentId": "PAY-0001",
    "projectId": "IND-001",
    "customer": "TOTAL ENVIROMENT",
    "project": "DBTW",
    "tower": "T1_Basement",
    "description": "",
    "quantitySqm": 974.16,
    "rateUSD": 119.36,
    "amountUSD": 116275.98,
    "advancePaidUSD": 506118.63,
    "balanceUSD": 0,
    "advancePercent": 435.27,
    "paymentTerm": "Advance 20% Done, 80% before dispatch",
    "paymentStatus": "Received 100% payment",
    "remark": ""
  },
  {
    "paymentId": "PAY-0002",
    "projectId": "IND-002",
    "customer": "TOTAL ENVIROMENT",
    "project": "DBTW",
    "tower": "T1_Typical",
    "description": "",
    "quantitySqm": 3266.11,
    "rateUSD": 119.36,
    "amountUSD": 389842.65,
    "advancePaidUSD": null,
    "balanceUSD": null,
    "advancePercent": null,
    "paymentTerm": "",
    "paymentStatus": "",
    "remark": ""
  },
  {
    "paymentId": "PAY-0003",
    "projectId": "IND-003",
    "customer": "TOTAL ENVIROMENT",
    "project": "DBTW",
    "tower": "T2_Basement",
    "description": "",
    "quantitySqm": 1489.56,
    "rateUSD": 119.36,
    "amountUSD": 177793.28,
    "advancePaidUSD": 916270.97,
    "balanceUSD": 78608.12,
    "advancePercent": 515.36,
    "paymentTerm": "Before Advance 20% Done, 80% before dispatch After 75% advance, deduct shipment by shipment include T8",
    "paymentStatus": "Received 92%",
    "remark": ""
  },
  {
    "paymentId": "PAY-0004",
    "projectId": "IND-004",
    "customer": "TOTAL ENVIROMENT",
    "project": "DBTW",
    "tower": "T2_Typical",
    "description": "",
    "quantitySqm": 6845.56,
    "rateUSD": 119.36,
    "amountUSD": 817085.8,
    "advancePaidUSD": null,
    "balanceUSD": null,
    "advancePercent": null,
    "paymentTerm": "",
    "paymentStatus": "",
    "remark": ""
  },
  {
    "paymentId": "PAY-0005",
    "projectId": "IND-005",
    "customer": "TOTAL ENVIROMENT",
    "project": "DBTW",
    "tower": "T3_Basement",
    "description": "",
    "quantitySqm": 1489.56,
    "rateUSD": 119.36,
    "amountUSD": 177793.28,
    "advancePaidUSD": 916270.97,
    "balanceUSD": 78608.12,
    "advancePercent": 515.36,
    "paymentTerm": "Before Advance 20% Done, 80% before dispatch After 75% advance, deduct shipment by shipment include T8",
    "paymentStatus": "Received 92%",
    "remark": ""
  },
  {
    "paymentId": "PAY-0006",
    "projectId": "IND-006",
    "customer": "TOTAL ENVIROMENT",
    "project": "DBTW",
    "tower": "T3_Typical",
    "description": "",
    "quantitySqm": 6845.56,
    "rateUSD": 119.36,
    "amountUSD": 817085.8,
    "advancePaidUSD": null,
    "balanceUSD": null,
    "advancePercent": null,
    "paymentTerm": "",
    "paymentStatus": "",
    "remark": ""
  },
  {
    "paymentId": "PAY-0007",
    "projectId": "IND-007",
    "customer": "TOTAL ENVIROMENT",
    "project": "DBTW",
    "tower": "T4",
    "description": "",
    "quantitySqm": 7839.2,
    "rateUSD": 119.36,
    "amountUSD": 935686.91,
    "advancePaidUSD": 0,
    "balanceUSD": 935686.91,
    "advancePercent": null,
    "paymentTerm": "Before Advance 20% Done, 80% before dispatch After 75% advance, deduct shipment by shipment include T8",
    "paymentStatus": "",
    "remark": ""
  },
  {
    "paymentId": "PAY-0008",
    "projectId": "IND-008",
    "customer": "TOTAL ENVIROMENT",
    "project": "POARR-T8",
    "tower": "T8 p1",
    "description": "",
    "quantitySqm": 3731.93,
    "rateUSD": 119.36,
    "amountUSD": 445443.05,
    "advancePaidUSD": 139415.64,
    "balanceUSD": 306027.41,
    "advancePercent": 31.3,
    "paymentTerm": "Before Advance 35% Done, 65% before dispatch After Use advance of DBTW for 100% before dispatch",
    "paymentStatus": "Received 31%",
    "remark": ""
  },
  {
    "paymentId": "PAY-0009",
    "projectId": "IND-009",
    "customer": "TOTAL ENVIROMENT",
    "project": "POARR-T8",
    "tower": "T8 p2",
    "description": "",
    "quantitySqm": 2456.42,
    "rateUSD": 119.36,
    "amountUSD": 293198.05,
    "advancePaidUSD": 91765.7,
    "balanceUSD": 201432.35,
    "advancePercent": 31.3,
    "paymentTerm": "Advance 35% Done, 65% before dispatch",
    "paymentStatus": "Received 31%",
    "remark": ""
  },
  {
    "paymentId": "PAY-0010",
    "projectId": "IND-010",
    "customer": "TOTAL ENVIROMENT",
    "project": "POARR-T8",
    "tower": "T8 p3",
    "description": "",
    "quantitySqm": 2476.18,
    "rateUSD": 119.36,
    "amountUSD": 295556.37,
    "advancePaidUSD": 92503.81,
    "balanceUSD": 203052.56,
    "advancePercent": 31.3,
    "paymentTerm": "Advance 35% Done, 65% before dispatch",
    "paymentStatus": "Received 31%",
    "remark": ""
  },
  {
    "paymentId": "PAY-0011",
    "projectId": "IND-011",
    "customer": "TOTAL ENVIROMENT",
    "project": "POARR-T8",
    "tower": "T8 p4",
    "description": "",
    "quantitySqm": 2500.97,
    "rateUSD": 119.36,
    "amountUSD": 298515.42,
    "advancePaidUSD": 93429.94,
    "balanceUSD": 205085.48,
    "advancePercent": 31.3,
    "paymentTerm": "Advance 35% Done, 65% before dispatch",
    "paymentStatus": "Received 31%",
    "remark": ""
  },
  {
    "paymentId": "PAY-0012",
    "projectId": "IND-012",
    "customer": "TOTAL ENVIROMENT",
    "project": "POARR-T8",
    "tower": "T8 p5",
    "description": "",
    "quantitySqm": 1367.63,
    "rateUSD": 119.36,
    "amountUSD": 163240.79,
    "advancePaidUSD": 51091.42,
    "balanceUSD": 112149.37,
    "advancePercent": 31.3,
    "paymentTerm": "Advance 35% Done, 65% before dispatch",
    "paymentStatus": "Received 31%",
    "remark": ""
  },
  {
    "paymentId": "PAY-0013",
    "projectId": "IND-013",
    "customer": "TOTAL ENVIROMENT",
    "project": "POARR-T8",
    "tower": "T8 p6",
    "description": "",
    "quantitySqm": 103.39,
    "rateUSD": 119.36,
    "amountUSD": 12340.27,
    "advancePaidUSD": 3862.28,
    "balanceUSD": 8477.99,
    "advancePercent": 31.3,
    "paymentTerm": "Advance 35% Done, 65% before dispatch",
    "paymentStatus": "Received 31%",
    "remark": ""
  },
  {
    "paymentId": "PAY-0014",
    "projectId": "IND-014",
    "customer": "KANWARJI  CONSTRUCTION",
    "project": "DG MAP PHASE (II)",
    "tower": "",
    "description": "",
    "quantitySqm": 2109.07,
    "rateUSD": 124,
    "amountUSD": 261524.56,
    "advancePaidUSD": 261524.56,
    "balanceUSD": 0,
    "advancePercent": 100,
    "paymentTerm": "TT(contract 20%, finish design 20% before production 30% , before ship 30%)",
    "paymentStatus": "Received 100%",
    "remark": ""
  },
  {
    "paymentId": "PAY-0015",
    "projectId": "IND-015",
    "customer": "TRIFECTA",
    "project": "TRIFECTA_VERANZA",
    "tower": "",
    "description": "",
    "quantitySqm": 4080.11,
    "rateUSD": 119,
    "amountUSD": 485533.09,
    "advancePaidUSD": 485533.09,
    "balanceUSD": 0,
    "advancePercent": 100,
    "paymentTerm": "TT(5% From PO sign date, 25% Within 7 days from the date of shell plan, 70% Balance by LC before dispatch)",
    "paymentStatus": "Received 100%",
    "remark": ""
  },
  {
    "paymentId": "PAY-0016",
    "projectId": "IND-016",
    "customer": "BREN",
    "project": "AVAANA",
    "tower": "Wing B",
    "description": "",
    "quantitySqm": 3457.06,
    "rateUSD": 119.5,
    "amountUSD": 413118.43,
    "advancePaidUSD": 722234.1,
    "balanceUSD": 120633.82,
    "advancePercent": 174.82,
    "paymentTerm": "TT(after PO 10%, before production 20%, After Production 20%, 20%,20% before ship 10%)",
    "paymentStatus": "0.8568769629143174",
    "remark": ""
  },
  {
    "paymentId": "PAY-0017",
    "projectId": "IND-017",
    "customer": "BREN",
    "project": "AVAANA",
    "tower": "Wing C",
    "description": "",
    "quantitySqm": 3596.23,
    "rateUSD": 119.5,
    "amountUSD": 429749.49,
    "advancePaidUSD": null,
    "balanceUSD": null,
    "advancePercent": null,
    "paymentTerm": "TT(after PO 10%, before production 20%, After Production 20%, 20%,20% before ship 10%)",
    "paymentStatus": "",
    "remark": ""
  },
  {
    "paymentId": "PAY-0018",
    "projectId": "IND-018",
    "customer": "BREN",
    "project": "AVAANA",
    "tower": "Wing A (included 16.719m2 addition)",
    "description": "",
    "quantitySqm": 3445.09,
    "rateUSD": 137.5,
    "amountUSD": 473700.43,
    "advancePaidUSD": 142473.21,
    "balanceUSD": 331227.21,
    "advancePercent": 30.08,
    "paymentTerm": "TT(after PO 10%, before production 20%, After Production 20%, 20%,20% before ship 10%)",
    "paymentStatus": "0.30076648126292055",
    "remark": ""
  },
  {
    "paymentId": "PAY-0019",
    "projectId": "IND-019",
    "customer": "BREN",
    "project": "ANANTA",
    "tower": "TWR A",
    "description": "",
    "quantitySqm": 1554.53,
    "rateUSD": 119.5,
    "amountUSD": 492396.28,
    "advancePaidUSD": 161540.1,
    "balanceUSD": 330856.18,
    "advancePercent": 32.81,
    "paymentTerm": "TT(after PO 10%, before production 20%, After Production 20%, 20%,20% before ship 10%)",
    "paymentStatus": "0.3280692911077397",
    "remark": ""
  },
  {
    "paymentId": "PAY-0020",
    "projectId": "IND-020",
    "customer": "BREN",
    "project": "ANANTA",
    "tower": "TWR B",
    "description": "",
    "quantitySqm": 2565.94,
    "rateUSD": null,
    "amountUSD": null,
    "advancePaidUSD": null,
    "balanceUSD": null,
    "advancePercent": null,
    "paymentTerm": "TT(after PO 10%, before production 20%, After Production 20%, 20%,20% before ship 10%)",
    "paymentStatus": "",
    "remark": ""
  },
  {
    "paymentId": "PAY-0021",
    "projectId": "IND-021",
    "customer": "BREN",
    "project": "IMPERIA GRANDE",
    "tower": "Wing 2",
    "description": "",
    "quantitySqm": 2814.64,
    "rateUSD": 119.5,
    "amountUSD": 510301.69,
    "advancePaidUSD": 510301.69,
    "balanceUSD": 0,
    "advancePercent": 100,
    "paymentTerm": "TT(after PO 10%, before production 20%, After Production 20%, 20%,20% before ship 10%)",
    "paymentStatus": "1",
    "remark": ""
  },
  {
    "paymentId": "PAY-0022",
    "projectId": "IND-022",
    "customer": "BREN",
    "project": "IMPERIA GRANDE",
    "tower": "Wing 3",
    "description": "",
    "quantitySqm": 1455.67,
    "rateUSD": null,
    "amountUSD": null,
    "advancePaidUSD": null,
    "balanceUSD": null,
    "advancePercent": null,
    "paymentTerm": "TT(after PO 10%, before production 20%, After Production 20%, 20%,20% before ship 10%)",
    "paymentStatus": "",
    "remark": ""
  },
  {
    "paymentId": "PAY-0023",
    "projectId": "IND-023",
    "customer": "KALYANI TECH PARK",
    "project": "LIVING TREE",
    "tower": "BLD4",
    "description": "",
    "quantitySqm": 3144.72,
    "rateUSD": 133,
    "amountUSD": 418247.49,
    "advancePaidUSD": 418247.49,
    "balanceUSD": 0,
    "advancePercent": 100,
    "paymentTerm": "20% within 7 days from ABG 20% after shell plan confirmation 30% before production, Balance 30% before dispatch",
    "paymentStatus": "1",
    "remark": ""
  },
  {
    "paymentId": "PAY-0024",
    "projectId": "IND-024",
    "customer": "CAPACITE INFRAPROJECTS",
    "project": "BDD CHAWL PROJECT",
    "tower": "BLD 6 TOWER A",
    "description": "",
    "quantitySqm": 3682,
    "rateUSD": 131,
    "amountUSD": 482342,
    "advancePaidUSD": 0,
    "balanceUSD": 482342,
    "advancePercent": null,
    "paymentTerm": "100%  through LC with 120 days usance from BL date (60 days interest under CIL scope and 60 days interest under KKV scope).",
    "paymentStatus": "",
    "remark": ""
  },
  {
    "paymentId": "PAY-0025",
    "projectId": "IND-025",
    "customer": "HQ_DLF",
    "project": "DAHLIAS",
    "tower": "TWR 3",
    "description": "",
    "quantitySqm": 1066.97,
    "rateUSD": 111,
    "amountUSD": 118433.23,
    "advancePaidUSD": 0,
    "balanceUSD": 118433.23,
    "advancePercent": null,
    "paymentTerm": "100% TT  upon shipment and issuance of all related shipping documents",
    "paymentStatus": "0",
    "remark": ""
  },
  {
    "paymentId": "PAY-0026",
    "projectId": "IND-026",
    "customer": "HQ_DLF",
    "project": "DAHLIAS",
    "tower": "TWR 7",
    "description": "",
    "quantitySqm": 1068.79,
    "rateUSD": 111,
    "amountUSD": 118635.47,
    "advancePaidUSD": 0,
    "balanceUSD": 118635.47,
    "advancePercent": null,
    "paymentTerm": "100% TT  upon shipment and issuance of all related shipping documents",
    "paymentStatus": "0",
    "remark": ""
  },
  {
    "paymentId": "PAY-0027",
    "projectId": "IND-027",
    "customer": "HQ_DLF",
    "project": "DAHLIAS",
    "tower": "TWR 8",
    "description": "",
    "quantitySqm": 1066.3,
    "rateUSD": 111,
    "amountUSD": 118359.3,
    "advancePaidUSD": 0,
    "balanceUSD": 118359.3,
    "advancePercent": null,
    "paymentTerm": "100% TT  upon shipment and issuance of all related shipping documents",
    "paymentStatus": "",
    "remark": ""
  },
  {
    "paymentId": "PAY-0028",
    "projectId": "IND-028",
    "customer": "HQ_DLF",
    "project": "DAHLIAS",
    "tower": "TWR 4",
    "description": "",
    "quantitySqm": 1066.3,
    "rateUSD": 111,
    "amountUSD": 118359.3,
    "advancePaidUSD": 0,
    "balanceUSD": 118359.3,
    "advancePercent": null,
    "paymentTerm": "100% TT  upon shipment and issuance of all related shipping documents",
    "paymentStatus": "",
    "remark": ""
  },
  {
    "paymentId": "PAY-0029",
    "projectId": "IND-029",
    "customer": "HQ_DLF",
    "project": "DAHLIAS",
    "tower": "TWR 5",
    "description": "",
    "quantitySqm": 698.2,
    "rateUSD": 111,
    "amountUSD": 77500.2,
    "advancePaidUSD": 0,
    "balanceUSD": 77500.2,
    "advancePercent": null,
    "paymentTerm": "100% TT  upon shipment and issuance of all related shipping documents",
    "paymentStatus": "",
    "remark": ""
  },
  {
    "paymentId": "PAY-0030",
    "projectId": "IND-030",
    "customer": "HQ_DLF",
    "project": "DAHLIAS",
    "tower": "TWR 6",
    "description": "",
    "quantitySqm": 1066.3,
    "rateUSD": 111,
    "amountUSD": 118359.3,
    "advancePaidUSD": 0,
    "balanceUSD": 118359.3,
    "advancePercent": null,
    "paymentTerm": "100% TT  upon shipment and issuance of all related shipping documents",
    "paymentStatus": "",
    "remark": ""
  },
  {
    "paymentId": "PAY-0031",
    "projectId": "IND-031",
    "customer": "HQ_DLF",
    "project": "DAHLIAS",
    "tower": "TWR 2",
    "description": "",
    "quantitySqm": 1066.3,
    "rateUSD": 111,
    "amountUSD": 118359.3,
    "advancePaidUSD": 0,
    "balanceUSD": 118359.3,
    "advancePercent": null,
    "paymentTerm": "100% TT  upon shipment and issuance of all related shipping documents",
    "paymentStatus": "",
    "remark": ""
  },
  {
    "paymentId": "PAY-0032",
    "projectId": "IND-032",
    "customer": "HQ_DLF",
    "project": "DAHLIAS",
    "tower": "TWR 1",
    "description": "",
    "quantitySqm": 1066.3,
    "rateUSD": 111,
    "amountUSD": 118359.3,
    "advancePaidUSD": 0,
    "balanceUSD": 118359.3,
    "advancePercent": null,
    "paymentTerm": "100% TT  upon shipment and issuance of all related shipping documents",
    "paymentStatus": "",
    "remark": ""
  },
  {
    "paymentId": "PAY-0033",
    "projectId": "IND-033",
    "customer": "VENUS STAR",
    "project": "VENUS CAPITAL HEIGHTS",
    "tower": "TOWER 1~9",
    "description": "",
    "quantitySqm": 35631,
    "rateUSD": 139.33,
    "amountUSD": 5024229.73,
    "advancePaidUSD": 502422.97,
    "balanceUSD": 4521806.76,
    "advancePercent": 10,
    "paymentTerm": "10%  within 10 days of acceptance of  the Offer, 20 % on Shell Plan Approval within 10 days  (T/T).BG against 30% advance paid.  Balance 70% by usance LC payable 90 days after bill of lading,",
    "paymentStatus": "0.09999999940289353",
    "remark": ""
  },
  {
    "paymentId": "PAY-0034",
    "projectId": "IND-034",
    "customer": "BREN",
    "project": "POLARIS",
    "tower": "BLOCK 1, 3 ,4",
    "description": "",
    "quantitySqm": 11214,
    "rateUSD": 137.5,
    "amountUSD": 1541925,
    "advancePaidUSD": 0,
    "balanceUSD": 1541925,
    "advancePercent": null,
    "paymentTerm": "TT(after PO 10%, before production 20%, After 2 weeks of start production 20%,After 3 weeks of start production 20%, After 4 weeks of start production 20%,before ship 10%)",
    "paymentStatus": "0",
    "remark": ""
  },
  {
    "paymentId": "PAY-0035",
    "projectId": "IND-035",
    "customer": "BREN",
    "project": "IMPERIA GRANDE",
    "tower": "Wing 1",
    "description": "",
    "quantitySqm": 1799.29,
    "rateUSD": 119.5,
    "amountUSD": 215014.68,
    "advancePaidUSD": null,
    "balanceUSD": 215014.68,
    "advancePercent": null,
    "paymentTerm": "TT(after PO 10%, before production 20%, After Production 20%, 20%,20% before ship 10%)",
    "paymentStatus": "0",
    "remark": ""
  },
  {
    "paymentId": "PAY-0036",
    "projectId": "IND-036",
    "customer": "PHARANDE SPACES",
    "project": "L-AXIS",
    "tower": "",
    "description": "",
    "quantitySqm": 4076,
    "rateUSD": 119,
    "amountUSD": 485044,
    "advancePaidUSD": 242522,
    "balanceUSD": 242522,
    "advancePercent": 50,
    "paymentTerm": "Before: TT(after PO 30%, before production 40% before shipping 30%) After: TT(after PO 30%, before production 20% before shipping 50%)",
    "paymentStatus": "Received 50%",
    "remark": ""
  },
  {
    "paymentId": "PAY-3001",
    "projectId": null,
    "customer": "TOTAL ENVIRONMENT",
    "project": "DBTW",
    "tower": "T2",
    "description": "Typical floor including basement",
    "quantitySqm": 6990,
    "rateUSD": 119.36,
    "amountUSD": 834326.4,
    "advancePaidUSD": 67297.96,
    "balanceUSD": 99567.32,
    "advancePercent": 75,
    "paymentTerm": "",
    "paymentStatus": "",
    "remark": "",
    "sourceSheet": "payment TE"
  },
  {
    "paymentId": "PAY-3002",
    "projectId": null,
    "customer": "TOTAL ENVIRONMENT",
    "project": "DBTW",
    "tower": "T3",
    "description": "Typical floor including basement",
    "quantitySqm": 6990,
    "rateUSD": 119.36,
    "amountUSD": 834326.4,
    "advancePaidUSD": 67297.96,
    "balanceUSD": 99567.32,
    "advancePercent": 75,
    "paymentTerm": "",
    "paymentStatus": "",
    "remark": "",
    "sourceSheet": "payment TE"
  },
  {
    "paymentId": "PAY-3003",
    "projectId": null,
    "customer": "TOTAL ENVIRONMENT",
    "project": "DBTW",
    "tower": "T4",
    "description": "Typical floor",
    "quantitySqm": 6500,
    "rateUSD": 119.36,
    "amountUSD": 775840,
    "advancePaidUSD": 62580.36,
    "balanceUSD": 92587.64,
    "advancePercent": 75,
    "paymentTerm": "",
    "paymentStatus": "",
    "remark": "",
    "sourceSheet": "payment TE"
  },
  {
    "paymentId": "PAY-3004",
    "projectId": "IND-008",
    "customer": "TOTAL ENVIRONMENT",
    "project": "POARR-T8",
    "tower": "T8",
    "description": "Typical floor",
    "quantitySqm": 3168,
    "rateUSD": 119.36,
    "amountUSD": 378132.48,
    "advancePaidUSD": 0,
    "balanceUSD": 378132.48,
    "advancePercent": null,
    "paymentTerm": "",
    "paymentStatus": "",
    "remark": "Dispatch to be done against the excess amount paid at Project A",
    "sourceSheet": "payment TE"
  },
  {
    "paymentId": "PAY-3005",
    "projectId": "IND-008",
    "customer": "TOTAL ENVIRONMENT",
    "project": "POARR-T8",
    "tower": "T8",
    "description": "Typical floor",
    "quantitySqm": 1800,
    "rateUSD": 119.36,
    "amountUSD": 214848,
    "advancePaidUSD": 0,
    "balanceUSD": 214848,
    "advancePercent": null,
    "paymentTerm": "",
    "paymentStatus": "",
    "remark": "Dispatch to be done against the excess amount paid at Project A",
    "sourceSheet": "payment TE"
  },
  {
    "paymentId": "PAY-3006",
    "projectId": "IND-008",
    "customer": "TOTAL ENVIRONMENT",
    "project": "POARR-T8",
    "tower": "T8",
    "description": "Typical floor",
    "quantitySqm": 2200,
    "rateUSD": 119.36,
    "amountUSD": 262592,
    "advancePaidUSD": 0,
    "balanceUSD": 262592,
    "advancePercent": null,
    "paymentTerm": "",
    "paymentStatus": "",
    "remark": "Dispatch to be done against the excess amount paid at Project A",
    "sourceSheet": "payment TE"
  },
  {
    "paymentId": "PAY-3007",
    "projectId": "IND-008",
    "customer": "TOTAL ENVIRONMENT",
    "project": "POARR-T8",
    "tower": "T8",
    "description": "Typical floor",
    "quantitySqm": 1800,
    "rateUSD": 119.36,
    "amountUSD": 214848,
    "advancePaidUSD": 0,
    "balanceUSD": 214848,
    "advancePercent": null,
    "paymentTerm": "",
    "paymentStatus": "",
    "remark": "Dispatch to be done against the excess amount paid at Project A",
    "sourceSheet": "payment TE"
  },
  {
    "paymentId": "PAY-3008",
    "projectId": "IND-008",
    "customer": "TOTAL ENVIRONMENT",
    "project": "POARR-T8",
    "tower": "T8",
    "description": "Typical floor",
    "quantitySqm": 4032,
    "rateUSD": 119.36,
    "amountUSD": 481259.52,
    "advancePaidUSD": 472100,
    "balanceUSD": 9159.52,
    "advancePercent": 98,
    "paymentTerm": "",
    "paymentStatus": "",
    "remark": "Dispatch to be done against the excess amount paid at Project A",
    "sourceSheet": "payment TE"
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getProjectById(id: string): ProjectMaster | undefined {
  return projectMasterData.find(p => p.projectId === id);
}

export function getProjectsByCountry(country: string): ProjectMaster[] {
  return projectMasterData.filter(p => p.country === country);
}

export function getProjectsByCustomer(customer: string): ProjectMaster[] {
  return projectMasterData.filter(p => p.customer === customer);
}

export function getProjectsByStatus(status: string): ProjectMaster[] {
  return projectMasterData.filter(p => p.contractStatus === status);
}

export function getDesignForProject(projectId: string): DesignSchedule[] {
  return designScheduleData.filter(d => d.projectId === projectId);
}

export function getProductionForProject(projectId: string): ProductionRecord[] {
  return productionData.filter(p => p.projectId === projectId);
}

export function getShipmentsForProject(projectId: string): ShipmentRecord[] {
  return shipmentData.filter(s => s.projectId === projectId);
}

export function getPaymentsForProject(projectId: string): PaymentRecord[] {
  return paymentData.filter(p => p.projectId === projectId);
}

export function getUniqueCountries(): string[] {
  return [...new Set(projectMasterData.map(p => p.country))];
}

export function getUniqueCustomers(): string[] {
  return [...new Set(projectMasterData.map(p => p.customer))];
}

export function getUniqueStatuses(): string[] {
  return [...new Set(projectMasterData.map(p => p.contractStatus))];
}

// Dashboard KPI calculations (DERIVED from real data)
export function getDashboardKPIs() {
  const signed = projectMasterData.filter(p => p.contractStatus === 'Signed');
  const totalProjects = projectMasterData.length;
  const signedProjects = signed.length;
  const totalContractValueUSD = signed.reduce((sum, p) => sum + (p.totalAmountUSD || 0), 0);
  const totalAdvanceUSD = signed.reduce((sum, p) => sum + (p.advanceUSD || 0), 0);
  const totalBalanceUSD = signed.reduce((sum, p) => sum + (p.balanceUSD || 0), 0);
  const totalQtyM2 = signed.reduce((sum, p) => sum + (p.contractQtyM2 || p.actualDesignQtyM2 || 0), 0);
  const totalWeightTons = signed.reduce((sum, p) => sum + (p.contractWeightTons || p.actualDesignWeightTons || 0), 0);
  const collectionRate = totalContractValueUSD > 0 ? Math.round((totalAdvanceUSD / totalContractValueUSD) * 10000) / 100 : 0;
  const countryCounts: Record<string, number> = {};
  projectMasterData.forEach(p => { countryCounts[p.country] = (countryCounts[p.country] || 0) + 1; });
  return { totalProjects, signedProjects, totalContractValueUSD, totalAdvanceUSD, totalBalanceUSD, totalQtyM2, totalWeightTons, collectionRate, countryCounts };
}

// ============================================================
// COMPATIBILITY HELPERS — used by UI components
// All values are DERIVED from real source data
// ============================================================

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

export function getShipmentForProject(projectId: string): ShipmentRecord | undefined {
  return shipmentData.find(s => s.projectId === projectId);
}

/** DERIVED: projects with outstanding balance > 0 or incomplete payment */
export function getAttentionProjects(): ProjectMaster[] {
  return projectMasterData.filter(p => {
    if (p.contractStatus !== 'Signed') return false;
    const hasBalance = (p.balanceUSD || 0) > 0;
    const partialPayment = p.paymentStatus && !p.paymentStatus.toLowerCase().includes('100%') && p.paymentStatus !== '';
    return hasBalance || partialPayment;
  });
}

/** DERIVED: projects with payment status not fully received */
export function getDelayedProjects(): ProjectMaster[] {
  return projectMasterData.filter(p => {
    if (p.contractStatus !== 'Signed') return false;
    // A project is "at risk" if it has outstanding balance and payment not 100%
    const hasBalance = (p.balanceUSD || 0) > 0;
    const notFullyPaid = p.paymentStatus && !p.paymentStatus.toLowerCase().includes('100%');
    return hasBalance && notFullyPaid;
  });
}

/** DERIVED: total outstanding balance across all signed projects */
export function getTotalOutstandingBalance(): number {
  return projectMasterData
    .filter(p => p.contractStatus === 'Signed')
    .reduce((sum, p) => sum + (p.balanceUSD || 0), 0);
}

