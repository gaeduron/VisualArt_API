import { useContext } from "react";
import { ObservationContext } from "@/contexts/ObservationContext.shared";

const useObservationContext = () => {
  const context = useContext(ObservationContext);
  if (!context) {
    throw new Error('useObservationContext must be used within an ObservationContextProvider');
  }
  return context;
};

export default useObservationContext;