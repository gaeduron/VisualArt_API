import Workspace from '../components/Workspace';
import ShortcutHelp from '../components/Shortcuts';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ShortcutHelp />
      <Workspace />
    </div>
  );
}
