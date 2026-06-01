import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Allow multiple panels open at once. Defaults to false (single open). */
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion = ({ items, allowMultiple = false, className = '' }: AccordionProps) => {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {items.map((item, index) => {
        const isOpen = openIds.has(item.id);
        return (
          <div
            key={item.id}
            className={`overflow-hidden rounded-xl border transition-all duration-300 ${
              isOpen
                ? 'border-indigo-200 bg-indigo-50/40 shadow-sm shadow-indigo-100'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <button
              id={`accordion-btn-${item.id}`}
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus:outline-none"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${
                    isOpen
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isOpen ? 'text-indigo-700' : 'text-gray-800'
                  }`}
                >
                  {item.question}
                </span>
              </div>

              <ChevronDown
                className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-indigo-500' : ''
                }`}
              />
            </button>

            {/* Animated panel */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              } overflow-hidden`}
            >
              <div className="border-t border-indigo-100 px-5 py-4 pl-[3.75rem]">
                <p className="text-sm leading-relaxed text-gray-600">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
