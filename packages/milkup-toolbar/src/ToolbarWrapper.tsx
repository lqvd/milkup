import React from 'react';

export function ToolbarWrapper({ children }: { children: React.ReactNode }) {
  return <div className="toolbar"> {children} </div>;
}