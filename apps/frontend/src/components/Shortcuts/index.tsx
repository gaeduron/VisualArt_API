'use client';


import { Dialog, DialogTrigger } from '../ui/dialog';
import HelpButton from './HelpButton';
import ShortcutModal from './ShortcutModal';
import { useShortcutData } from './useShortcutData';


const ShortcutHelp = () => {
  const shortcuts = useShortcutData();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <HelpButton onClick={() => {}} />
      </DialogTrigger>
      <ShortcutModal shortcuts={shortcuts} />
    </Dialog>
  );
};

export default ShortcutHelp;
