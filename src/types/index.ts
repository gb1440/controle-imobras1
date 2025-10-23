export interface Contract {
  id: string;
  name: string;
  owner: {
    name: string;
    document: string;
  };
  tenant: {
    name: string;
    document: string;
  };
  property: {
    address: string;
    iptu: string;
    dueDay: number;
  };
  contract: {
    startDate: string;
    endDate: string;
    rentValue: number;
    iptuValue: number;
    adminFeePercentage: number;
  };
}

export interface Revenue {
  id: string;
  contractId: string;
  type: 'admin' | 'location' | 'insurance';
  value: number;
  month: number;
  year: number;
}

export interface Expense {
  id: string;
  description: string;
  value: number;
  dueDate: string;
  status: 'paid' | 'pending';
  bank: string;
  paymentMethod: string;
  month: number;
  year: number;
}
