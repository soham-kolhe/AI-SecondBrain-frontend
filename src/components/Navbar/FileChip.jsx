import React from 'react';

const FileChip = ({ file, onChipClick, onDelete }) => {
  return (
    <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-full group animate-fade-in hover:border-cyan-500/30 transition-all">
      <span 
        onClick={() => onChipClick && onChipClick(file.name)}
        className="text-[10px] text-slate-400 font-bold whitespace-nowrap cursor-pointer hover:text-cyan-400 transition-colors"
      >
        📄 {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
      </span>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(file._id, file.name);
        }}
        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 text-slate-600 transition-all font-black text-[10px]"
        title="Delete file from memory"
      >
        ×
      </button>
    </div>
  );
};

export default FileChip;