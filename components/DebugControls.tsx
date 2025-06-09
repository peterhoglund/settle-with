
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug } from '@fortawesome/free-solid-svg-icons';

interface DebugControlsProps {
  onAddDebugPeople: () => void;
}

export const DebugControls: React.FC<DebugControlsProps> = ({ onAddDebugPeople }) => {
  return (
    <button
      onClick={onAddDebugPeople}
      className="fixed top-4 right-4 z-[100] flex items-center justify-center w-12 h-12 bg-brand-accent hover:bg-brand-accentHover text-white rounded-full shadow-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-accentLight focus:ring-offset-2 focus:ring-offset-brand-background group"
      aria-label="Add debug participants"
      title="Add 3 debug participants"
    >
      <FontAwesomeIcon icon={faBug} className="w-6 h-6 group-hover:scale-110 transition-transform" />
    </button>
  );
};
