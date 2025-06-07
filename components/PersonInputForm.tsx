
import React, { useState, useEffect } from 'react';

interface PersonInputFormProps {
  onAddPerson: (name: string, amountSpent: number) => void;
}

const exampleNames = [
"E.g. Robin", "E.g. Alex", "E.g. Noa", "E.g. Emil", "E.g. Rory",
"E.g. Elliot", "E.g. Sasha", "E.g. Alba", "E.g. Jules", "E.g. Nico",
"E.g. Sam", "E.g. Lou", "E.g. Toni", "E.g. Remy", "E.g. Mischa"
];

export const PersonInputForm: React.FC<PersonInputFormProps> = ({ onAddPerson }) => {
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [placeholderName, setPlaceholderName] = useState<string>('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * exampleNames.length);
    setPlaceholderName(exampleNames[randomIndex]);
  }, []); // Empty dependency array ensures this runs only on mount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    const spentAmount = parseFloat(amount);
    if (isNaN(spentAmount) || spentAmount < 0) {
      setError('Please enter a valid non-negative amount.');
      return;
    }
    
    setError(null);
    onAddPerson(name.trim(), spentAmount);
    setName('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col bp390:flex-row bp390:space-x-6 space-y-6 bp390:space-y-0">
        <div className="bp390:flex-[3]"> {/* Name input takes more space on wider screens */}
          <label htmlFor="name" className="block text-sm font-medium text-brand-textSecondary mb-2">
            Participant's Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null); }}
            placeholder={placeholderName}
            className="block w-full p-3.5 bg-brand-text/10 border border-brand-textSecondary/40 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-borderFocus focus:border-brand-borderFocus text-brand-text placeholder-brand-textSecondary/60 transition-all duration-150 ease-in-out"
            required
            aria-label="Participant's Name"
          />
        </div>
        <div className="bp390:flex-[1]"> {/* Amount input takes less space */}
          <label htmlFor="amount" className="block text-sm font-medium text-brand-textSecondary mb-2">
            Amount Spent
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(null); }}
            placeholder="E.g. 42.00"
            min="0"
            step="0.01"
            className="block w-full p-3.5 bg-brand-text/10 border border-brand-textSecondary/40 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-borderFocus focus:border-brand-borderFocus text-brand-text placeholder-brand-textSecondary/60 transition-all duration-150 ease-in-out"
            required
            aria-label="Amount Spent"
          />
        </div>
      </div>
      {error && <p className="text-sm text-brand-accent text-center sm:text-left">{error}</p>}
      <button
        type="submit"
        className="w-full flex justify-center items-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-xl shadow-lg text-brand-background 
                   bg-gradient-to-r from-brand-primaryLight to-brand-primaryGradientEnd 
                   hover:from-brand-primary hover:to-brand-primaryGradientEndHover 
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-primary 
                   hover:interactive-glow-primary transition-all duration-200 ease-in-out group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2.5 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add Participant
      </button>
    </form>
  );
};
