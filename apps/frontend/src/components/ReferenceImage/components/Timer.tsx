interface TimerProps {
    startTime: number;
    previouslyElapsedTime: number;
    paused: boolean;
}

import { useEffect, useState } from "react"

function millisecondsToFmt(milliseconds: number): {time: string, ms: string} {
    const timeDate = new Date(milliseconds)
    let ms = timeDate.getMilliseconds().toString().slice(0,2)
    if (ms.length == 0) ms = "00"
    if (ms.length == 1) ms = `${ms}0`
    const time = timeDate.toLocaleTimeString("FR", {
        timeZone: "UTC",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    })
    return { time, ms }
}

type DisplayMode = "simple" | "precise"

interface TimeDisplayProps {
    milliseconds: number,
    mode: DisplayMode
}

function TimeDisplay({milliseconds, mode }: TimeDisplayProps) {
    const { time, ms } = millisecondsToFmt(milliseconds);

    return (
        <>
            <span>{time}</span>
            {
                mode === "precise" && 
                <span className="text-xs text-gray-400 pt-1">{ms}</span>
            }
        </>
    )
}

function Timer({
    startTime,
    previouslyElapsedTime,
    paused
}: TimerProps) {
    const [elapsedTime, setElapsed] = useState(previouslyElapsedTime)
    const [displayMode, setDisplayMode] = useState<DisplayMode>("precise")

    const handleToggleDisplayMode = () => {
        if (displayMode === "precise") {
            setDisplayMode("simple");
        } else {
            setDisplayMode("precise")
        }
    }

    useEffect(() => {
        if (startTime === 0 || paused) {
            setElapsed(previouslyElapsedTime)
            return
        }
        const timeUpdateLoop = setInterval(() => {
            const currentTime = new Date().valueOf()
            const currentlyElapsedTime = (currentTime - startTime) + previouslyElapsedTime 
            setElapsed(currentlyElapsedTime)
        }, 90)
        return () => clearInterval(timeUpdateLoop)
    }, [startTime, previouslyElapsedTime, paused]);

    return (
        <div
            className={`
                p-2 rounded-lg hover:cursor-pointer hover:bg-gray-100
                font-mono text-lg font-bold
                flex items-center
                ${paused ? "text-gray-400" : "text-gray-600" }
            `}
            onClick={handleToggleDisplayMode}
        >
            <TimeDisplay
                milliseconds={elapsedTime}
                mode={displayMode}
            />
        </div>
    ) 
}

export default Timer