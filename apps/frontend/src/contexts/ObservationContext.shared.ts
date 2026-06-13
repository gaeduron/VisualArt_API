'use client';

import { createContext } from "react";

/** @private to ObservationContext.ts */
export type ObservationContextPrivateValue = {
  _startedAt: number[];
  _pausedAt: number[]; 
}

export type ObservationContextValue = {
  // Getters and Public attribute
  previouslyElapsedTime: number;
  startedAt: number | undefined;
  paused: boolean;
  finishedAt: number | undefined;


  // Setters
  setAsFinished: () => void
  stopTimer: () => void
  startTimer: () => void
  resetTimer: () => void
};

export const ObservationContext = createContext<ObservationContextValue | undefined>(undefined);
