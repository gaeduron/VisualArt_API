'use client';

interface ShortcutItemProps {
  keyCombo: string;
  description: string;
}

const ShortcutItem = ({ keyCombo, description }: ShortcutItemProps) => {
  const formatKeyCombo = (keyCombo: string) => {
    return keyCombo
      .split('+')
      .map(key => {
        const formatted = key.charAt(0).toUpperCase() + key.slice(1);
        return formatted === 'Cmd' ? '⌘' : formatted;
      })
      .join(' + ');
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">
          {description}
        </div>
      </div>
      <div className="ml-4">
        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
          {formatKeyCombo(keyCombo)}
        </kbd>
      </div>
    </div>
  );
};

export default ShortcutItem; 