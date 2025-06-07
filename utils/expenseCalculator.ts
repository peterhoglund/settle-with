
import { Person, Transaction } from '../types';

export function calculateSettlements(people: Person[]): Transaction[] {
  if (people.length < 2) {
    return [];
  }

  const totalSpent = people.reduce((sum, p) => sum + p.amountSpent, 0);
  const averageSpent = totalSpent / people.length;

  // Create a mutable copy of balances for processing
  const balances = people.map(p => ({
    id: p.id, // Keep id for potential future use, though name is used for display
    name: p.name,
    balance: p.amountSpent - averageSpent,
  }));

  const debtors = balances.filter(p => p.balance < -0.005).sort((a, b) => a.balance - b.balance); // Owe most (most negative)
  const creditors = balances.filter(p => p.balance > 0.005).sort((a, b) => b.balance - a.balance); // Owed most (most positive)

  const transactions: Transaction[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const amountToTransfer = Math.min(Math.abs(debtor.balance), creditor.balance);

    if (amountToTransfer > 0.005) { // Only record meaningful transactions
      transactions.push({
        id: `txn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        from: debtor.name,
        to: creditor.name,
        amount: parseFloat(amountToTransfer.toFixed(2)),
      });

      debtor.balance += amountToTransfer;
      creditor.balance -= amountToTransfer;
    }

    // If debtor's balance is close to zero, move to next debtor
    if (Math.abs(debtor.balance) < 0.01) {
      debtorIndex++;
    }
    // If creditor's balance is close to zero, move to next creditor
    if (Math.abs(creditor.balance) < 0.01) {
      creditorIndex++;
    }
  }
  return transactions;
}
    