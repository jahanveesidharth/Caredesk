import React from 'react';

export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({ children, className = '', ...props }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border-main">
      <table className={`w-full text-left border-collapse text-sm text-text-main ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }) => {
  return <thead className={`bg-bg-surface-hover/80 text-text-muted border-b border-border-main ${className}`} {...props}>{children}</thead>;
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }) => {
  return <tbody className={`divide-y divide-border-main bg-bg-surface ${className}`} {...props}>{children}</tbody>;
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className = '', ...props }) => {
  return <tr className={`hover:bg-bg-surface-hover/40 transition-colors ${className}`} {...props}>{children}</tr>;
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => {
  return <th className={`px-4 py-3 font-semibold text-xs uppercase tracking-wider ${className}`} {...props}>{children}</th>;
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => {
  return <td className={`px-4 py-3 align-middle ${className}`} {...props}>{children}</td>;
};
