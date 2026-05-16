export interface Invoice {
  id: string;
  projectId: string;
  projectCode: string;
  clientName: string;
  invoiceNumber: string;
  type: 'Design Fee' | 'Execution Advance' | 'Progress Payment' | 'Final Payment' | 'Variation';
  amount: number;
  tax: number;
  total: number;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  notes: string;
}

export interface BOQItem {
  id: string;
  projectId: string;
  stage: number;
  itemCode: string;
  description: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vendor: string;
  status: 'Quote-Pending' | 'Quoted' | 'Approved' | 'Ordered' | 'Delivered';
  orderDate: string | null;
  deliveryDate: string | null;
}

export const MOCK_INVOICES: Invoice[] = [
  { id:'inv-001', projectId:'proj-001', projectCode:'MOMS-2024-001', clientName:'Mansour Al-Rashid', invoiceNumber:'INV-2024-001', type:'Design Fee', amount:37000, tax:1850, total:38850, issueDate:'2024-11-03', dueDate:'2024-11-17', paidDate:'2024-11-12', status:'Paid', notes:'20% design fee as per contract.' },
  { id:'inv-002', projectId:'proj-002', projectCode:'MOMS-2024-002', clientName:'Nour Capital Group', invoiceNumber:'INV-2024-002', type:'Design Fee', amount:64000, tax:3200, total:67200, issueDate:'2024-09-18', dueDate:'2024-10-02', paidDate:'2024-09-28', status:'Paid', notes:'20% design fee.' },
  { id:'inv-003', projectId:'proj-002', projectCode:'MOMS-2024-002', clientName:'Nour Capital Group', invoiceNumber:'INV-2024-003', type:'Execution Advance', amount:128000, tax:6400, total:134400, issueDate:'2024-12-15', dueDate:'2024-12-29', paidDate:null, status:'Sent', notes:'40% execution advance per Stage 7 contract.' },
  { id:'inv-004', projectId:'proj-003', projectCode:'MOMS-2024-003', clientName:'Farah Al-Mutairi', invoiceNumber:'INV-2024-004', type:'Progress Payment', amount:43500, tax:2175, total:45675, issueDate:'2024-11-15', dueDate:'2024-11-29', paidDate:'2024-11-25', status:'Paid', notes:'30% progress payment — structural complete.' },
  { id:'inv-005', projectId:'proj-003', projectCode:'MOMS-2024-003', clientName:'Farah Al-Mutairi', invoiceNumber:'INV-2024-005', type:'Final Payment', amount:43500, tax:2175, total:45675, issueDate:'2024-12-10', dueDate:'2024-12-24', paidDate:null, status:'Overdue', notes:'Final 30% — project completion.' }
];

export const MOCK_BOQ: BOQItem[] = [
  { id:'boq-001', projectId:'proj-002', stage:7, itemCode:'FL-001', description:'Statuario marble flooring 60×60cm polished', category:'Flooring', unit:'m²', quantity:850, unitPrice:320, totalPrice:272000, vendor:'Emirates Stone LLC', status:'Approved', orderDate:'2024-12-16', deliveryDate:'2025-01-15' },
  { id:'boq-002', projectId:'proj-002', stage:7, itemCode:'WL-001', description:'Oak veneer wall panels, natural finish', category:'Wall Finishes', unit:'m²', quantity:420, unitPrice:185, totalPrice:77700, vendor:'WoodCraft UAE', status:'Ordered', orderDate:'2024-12-14', deliveryDate:'2025-01-10' },
  { id:'boq-003', projectId:'proj-002', stage:7, itemCode:'CL-001', description:'Coffered ceiling with LED strip — executive offices', category:'Ceiling', unit:'m²', quantity:120, unitPrice:450, totalPrice:54000, vendor:'Skyline Interiors', status:'Quoted', orderDate:null, deliveryDate:null },
  { id:'boq-004', projectId:'proj-002', stage:7, itemCode:'DR-001', description:'Solid mahogany main entrance double door', category:'Doors', unit:'set', quantity:1, unitPrice:18000, totalPrice:18000, vendor:'Grand Woodwork', status:'Approved', orderDate:'2024-12-15', deliveryDate:'2025-01-20' },
  { id:'boq-005', projectId:'proj-002', stage:7, itemCode:'AC-001', description:'Concealed central AC — Carrier 5-ton unit', category:'MEP', unit:'unit', quantity:3, unitPrice:22000, totalPrice:66000, vendor:'Cool Air Systems', status:'Quote-Pending', orderDate:null, deliveryDate:null }
];

export interface FinanceSummary {
  totalRevenue: number;
  invoiced: number;
  collected: number;
  outstanding: number;
  overdue: number;
  projectCount: number;
  avgProjectValue: number;
  monthlyRevenue: { month: string; revenue: number; target: number }[];
}

export const MOCK_FINANCE_SUMMARY: FinanceSummary = {
  totalRevenue: 1248000,
  invoiced: 337125,
  collected: 196725,
  outstanding: 140400,
  overdue: 45675,
  projectCount: 6,
  avgProjectValue: 207999,
  monthlyRevenue: [
    { month: 'Jul', revenue: 145000, target: 120000 },
    { month: 'Aug', revenue: 98000, target: 120000 },
    { month: 'Sep', revenue: 178000, target: 150000 },
    { month: 'Oct', revenue: 210000, target: 180000 },
    { month: 'Nov', revenue: 195000, target: 180000 },
    { month: 'Dec', revenue: 422000, target: 250000 }
  ]
};
