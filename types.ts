
export interface Person {
  id: string;
  name: string;
  amountSpent: number;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
}
    