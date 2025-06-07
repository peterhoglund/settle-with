
import React from 'react';
import { Transaction } from '../types';

interface SettlementDisplayProps {
  transactions: Transaction[];
}

export const SettlementDisplay: React.FC<SettlementDisplayProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-light-primary opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-4 text-lg text-light-textSecondary">
          All expenses are settled, or no calculations needed yet!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {transactions.map((transaction, index) => (
        <div
          key={transaction.id}
          className="p-5 bg-light-surface border border-light-border rounded-xl shadow-lg flex items-center space-x-4 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl animate-fadeIn"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-light-primary to-light-accent rounded-full shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="flex-grow">
            <p className="text-light-text text-base sm:text-lg">
              <span className="font-semibold text-light-accent">{transaction.from}</span> should pay{' '}
              <span className="font-semibold text-light-primary">{transaction.to}</span>
            </p>
          </div>
          <div className="text-xl font-bold text-light-text">
            {transaction.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};