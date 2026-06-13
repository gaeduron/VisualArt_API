import { Pause, PlayIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';


interface TimerOnOffButtonProps {
  onPause: () => void;
  onStart: () => void;
  paused: boolean;
  disabled?: boolean;
}

function TimerOnOffButton({
  onPause,
  onStart,
  paused,
  disabled=false
}: TimerOnOffButtonProps) {
    const handleOnClick = () => {
      if (paused) {
        onStart();
      } else {
        onPause();
      }
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleOnClick}
              disabled={disabled}
              className="flex flex-col items-center gap-1 w-12 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {paused ?
                <PlayIcon size={20}/>
                : 
                <Pause size={20}/>
              }
              <span className={`text-xs font-medium ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>P</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {paused ? "Start" : "Pause"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
}

export default TimerOnOffButton;