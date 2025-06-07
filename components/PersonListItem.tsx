
import React, { useState, useRef, useEffect } from 'react';
import { Person } from '../types';

interface PersonListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  person: Person;
  onRemovePerson: (personId: string) => void;
  onUpdatePerson: (personId: string, newName: string, newAmount: number) => void;
}

export const PersonListItem: React.FC<PersonListItemProps> = ({ person, onRemovePerson, onUpdatePerson, ...liProps }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(person.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editedAmount, setEditedAmount] = useState(person.amountSpent.toString());
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingAmount && amountInputRef.current) {
      amountInputRef.current.focus();
      amountInputRef.current.select();
    }
  }, [isEditingAmount]);
  
  useEffect(() => {
    if (!isEditingName) setEditedName(person.name);
    if (!isEditingAmount) setEditedAmount(person.amountSpent.toFixed(2)); // Ensure edit field also starts with .00
  }, [person, isEditingName, isEditingAmount]);


  const handleNameSubmit = () => {
    const trimmedName = editedName.trim();
    if (trimmedName && trimmedName !== person.name) {
      onUpdatePerson(person.id, trimmedName, person.amountSpent);
    } else if (!trimmedName) { // Prevent empty name, revert
      setEditedName(person.name); 
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditedName(person.name);
      setIsEditingName(false);
    }
  };

  const handleAmountSubmit = () => {
    const newAmount = parseFloat(editedAmount);
    if (!isNaN(newAmount) && newAmount >= 0) { // Allow 0 amount
      // Update only if different or to normalize (e.g. user types "34.5" for existing "34.50")
      if (parseFloat(newAmount.toFixed(2)) !== parseFloat(person.amountSpent.toFixed(2))) {
        onUpdatePerson(person.id, person.name, parseFloat(newAmount.toFixed(2)));
      }
    } else { // Revert if invalid
        setEditedAmount(person.amountSpent.toFixed(2));
    }
    setIsEditingAmount(false);
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAmountSubmit();
    } else if (e.key === 'Escape') {
      setEditedAmount(person.amountSpent.toFixed(2));
      setIsEditingAmount(false);
    }
  };


  return (
    <li
      {...liProps}
      className={`flex items-center justify-between p-4 bg-brand-surface backdrop-blur-sm border border-brand-border rounded-xl shadow-md hover:bg-brand-surfaceHover transition-all duration-200 group ${liProps.className || ''}`}
    >
      {/* Container for Avatar, Name, and Amount */}
      <div className="flex items-center flex-grow min-w-0 mr-3">
        {/* Avatar */}
        <span className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent mr-4 flex-shrink-0 shadow-sm">
          <span className="font-semibold text-white text-xl">
            {person.name.substring(0, 1).toUpperCase()}
          </span>
        </span>

        {/* Name - takes available space, allows truncation */}
        <div className="flex-grow min-w-0">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleNameKeyDown}
              className="text-lg font-medium text-brand-text bg-white/10 border border-brand-borderFocus rounded-md px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              aria-label={`Edit name for ${person.name}`}
            />
          ) : (
            <p 
              className="text-lg font-medium text-brand-text truncate cursor-pointer hover:text-brand-primaryLight transition-colors" 
              onClick={() => setIsEditingName(true)}
              title={`Edit ${person.name}`}
            >
              {person.name}
            </p>
          )}
        </div>
        
        {/* Amount - flex-shrink-0 to prevent it from being overly squished, ml-4 for spacing */}
        <div className="ml-4 flex-shrink-0">
          {isEditingAmount ? (
             <input
              ref={amountInputRef}
              type="number"
              value={editedAmount}
              onChange={(e) => setEditedAmount(e.target.value)}
              onBlur={handleAmountSubmit}
              onKeyDown={handleAmountKeyDown}
              min="0"
              step="0.01"
              className="text-lg font-medium text-brand-text bg-white/10 border border-brand-borderFocus rounded-md px-2 py-1 w-28 text-right focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              aria-label={`Edit amount for ${person.name}`}
            />
          ) : (
            <p 
              className="text-lg font-medium text-brand-primaryLight cursor-pointer hover:text-brand-accentLight transition-colors" 
              onClick={() => setIsEditingAmount(true)}
              title={`Edit amount for ${person.name}`}
            >
              {person.amountSpent.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemovePerson(person.id)}
        className="p-2 text-brand-textSecondary hover:text-brand-accent rounded-full hover:bg-brand-accent/20 transition-all duration-150 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-accent"
        aria-label={`Remove ${person.name}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </li>
  );
};
