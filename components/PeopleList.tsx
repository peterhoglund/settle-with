
import React from 'react';
import { Person } from '../types';
import { PersonListItem } from './PersonListItem';

interface PeopleListProps {
  people: Person[];
  onRemovePerson: (personId: string) => void;
  onUpdatePerson: (personId: string, newName: string, newAmount: number) => void;
  baseItemAnimationDelay: number; // Base delay for the first item, in seconds
}

export const PeopleList: React.FC<PeopleListProps> = ({ people, onRemovePerson, onUpdatePerson, baseItemAnimationDelay }) => {
  if (people.length === 0) {
    return <p className="text-brand-textSecondary text-center py-4">No participants added yet. Start by adding someone above.</p>;
  }

  const staggerIncrement = 0.05; // seconds

  return (
    <ul className="space-y-4">
      {people.map((person, index) => (
        <PersonListItem
          key={person.id}
          person={person}
          onRemovePerson={onRemovePerson}
          onUpdatePerson={onUpdatePerson}
          style={{ animationDelay: `${baseItemAnimationDelay + index * staggerIncrement}s` }}
          className="animate-fadeIn" // Uses 'fadeIn' animation (defined without inherent delay)
        />
      ))}
    </ul>
  );
};
