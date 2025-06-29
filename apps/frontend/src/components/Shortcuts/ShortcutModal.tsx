'use client';

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import ShortcutItem from './ShortcutItem';

interface ShortcutData {
  key: string;
  description: string;
}

interface ShortcutModalProps {
  shortcuts: ShortcutData[];
}

const ShortcutModal = ({ shortcuts }: ShortcutModalProps) => {
  return (
    <DialogContent className="max-w-md max-h-96">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Available keyboard shortcuts in the app
          </DialogDescription>
        </DialogHeader>
        
        <Separator />

        {/* Shortcuts List */}
        <div className="overflow-y-auto max-h-80 -mx-6 px-6">
          <div className="space-y-3 py-4">
            {shortcuts.map(({ key, description }) => (
              <ShortcutItem
                key={key}
                keyCombo={key}
                description={description}
              />
            ))}
          </div>
          
          {shortcuts.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No shortcuts available
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Escape</kbd> to close
          </p>
        </DialogFooter>
      </DialogContent>
  );
};

export default ShortcutModal; 