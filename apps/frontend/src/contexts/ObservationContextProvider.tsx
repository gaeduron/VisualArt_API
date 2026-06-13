'use client';

// this context is gonna keep track of the following
// Observation startedAt[], pausedAt[], evaluations[], setAsFinishedAt, reference, observation
import { useCallback, useMemo, useState } from "react";
import {
    ObservationContext,
    ObservationContextValue,
    ObservationContextPrivateValue
} from "./ObservationContext.shared"

const ObservationContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [_pausedAt, _setPausedAt] = useState<ObservationContextPrivateValue["_pausedAt"]>([]);
    const [_startedAt, _setStartedAt] = useState<ObservationContextPrivateValue["_startedAt"]>([]);
    const [finishedAt, setFinishedAt] = useState<ObservationContextValue["finishedAt"]>(undefined);

    /** Computed values **/
    const paused: ObservationContextValue["paused"] = useMemo(() => {
        return _startedAt.length === _pausedAt.length 
    }, [_pausedAt, _startedAt])
    
    const previouslyElapsedTime: ObservationContextValue["previouslyElapsedTime"] = useMemo(() => {
        let elapsedTime = 0
        _pausedAt.forEach((pausedAt, index) => {
            elapsedTime += pausedAt - _startedAt[index];
        })
        return elapsedTime;
    }, [_pausedAt, _startedAt])
    
    const startedAt: ObservationContextValue["startedAt"] = useMemo(() => {
        return _startedAt[_startedAt.length - 1];
    }, [_startedAt])

    const startTimer = useCallback(() => {
        _setStartedAt(prev => [...prev, Date.now()])
    }, [_setStartedAt])

    const stopTimer = useCallback(() => {
        _setPausedAt(prev => [...prev, Date.now()])
    }, [_setPausedAt])

    const resetTimer = useCallback(() => {
        _setStartedAt([])
        _setPausedAt([])
    }, [_setStartedAt, _setPausedAt])

    const setAsFinished = useCallback(() => {
        if (finishedAt) return;
        setFinishedAt(Date.now())
    }, [finishedAt, setFinishedAt])

    const value = {
        paused,
        previouslyElapsedTime,
        startedAt,
        finishedAt,

        startTimer,
        stopTimer,
        resetTimer,
        setAsFinished
    }

    return <ObservationContext.Provider value={value}>{children}</ObservationContext.Provider>
}

export default ObservationContextProvider;