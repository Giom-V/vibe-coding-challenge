
import React from 'react';
import { TooltipTerm } from '../types';
import { Tooltip } from './Tooltip';

interface TextWithTooltipsProps {
  text: string;
  tooltipData: TooltipTerm[];
  onTellMeMore: (term: string) => void;
}

export const TextWithTooltips: React.FC<TextWithTooltipsProps> = ({ text, tooltipData, onTellMeMore }) => {
  if (!text || !tooltipData || tooltipData.length === 0) {
    return <span>{text}</span>;
  }

  // Create a regex that matches any of the tooltip terms, ensuring whole word matching
  const termsRegex = new RegExp(`\\b(${tooltipData.map(t => t.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi');
  
  const parts = text.split(termsRegex);

  return (
    <span>
      {parts.map((part, index) => {
        if (!part) return null;
        const matchingTerm = tooltipData.find(t => t.term.toLowerCase() === part.toLowerCase());
        if (matchingTerm) {
          return (
            <Tooltip
              key={index}
              term={part} // Use original casing from the text
              definition={matchingTerm.definition}
              onTellMeMore={onTellMeMore}
            />
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
