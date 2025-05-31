
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface AISidebarContextType {
  isAIDocked: boolean;
  toggleAIDock: () => void;
  openAIDock: () => void;
  closeAIDock: () => void;
}

const AISidebarContext = createContext<AISidebarContextType | undefined>(undefined);

export const AISidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isAIDocked, setIsAIDocked] = useState(false);

  const toggleAIDock = useCallback(() => {
    setIsAIDocked(prev => !prev);
  }, []);

  const openAIDock = useCallback(() => {
    setIsAIDocked(true);
  }, []);

  const closeAIDock = useCallback(() => {
    setIsAIDocked(false);
  }, []);

  return (
    <AISidebarContext.Provider value={{ isAIDocked, toggleAIDock, openAIDock, closeAIDock }}>
      {children}
    </AISidebarContext.Provider>
  );
};

export const useAISidebar = () => {
  const context = useContext(AISidebarContext);
  if (context === undefined) {
    throw new Error('useAISidebar must be used within an AISidebarProvider');
  }
  return context;
};
