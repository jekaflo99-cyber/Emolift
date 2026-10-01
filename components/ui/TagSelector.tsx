
import React from 'react';
import { EntryTag, Language } from '../../types';
import { TAG_CONFIG } from '../../constants';

interface TagSelectorProps {
  selectedTags: EntryTag[];
  onToggleTag: (tag: EntryTag) => void;
  language: Language;
}

const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, onToggleTag, language }) => {
  // Filter out 'none'
  const tags = (Object.keys(TAG_CONFIG) as EntryTag[]).filter(t => t !== 'none');

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {tags.map((tag) => {
        const config = TAG_CONFIG[tag];
        const Icon = config.icon;
        const isSelected = selectedTags.includes(tag);

        return (
          <button
            key={tag}
            onClick={() => onToggleTag(tag)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200
              ${isSelected 
                ? `${config.color} ring-2 ring-offset-1 ring-indigo-200 dark:ring-indigo-800` 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }
            `}
          >
            {Icon && <Icon className="w-3 h-3" />}
            {config.label[language]}
          </button>
        );
      })}
    </div>
  );
};

export default TagSelector;
