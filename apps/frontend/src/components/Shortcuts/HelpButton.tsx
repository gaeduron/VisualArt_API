'use client';

interface HelpButtonProps {
  onClick?: () => void;
}

const HelpButton = ({ onClick }: HelpButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-4 z-50 bg-white border border-gray-300 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200 hover:bg-gray-50"
      title="Keyboard Shortcuts"
    >
      <span className="text-gray-600 font-medium text-lg">?</span>
    </button>
  );
};

export default HelpButton; 