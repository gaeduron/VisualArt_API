import Canvas from '../components/Canvas';
import ShortcutHelp from '../components/Shortcuts';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ShortcutHelp />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Visual Art Drawing Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A simple and intuitive drawing canvas for creating digital artwork
          </p>
        </div>
        
        <Canvas />
        
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">More tools and features coming soon...</p>
        </div>
      </div>
    </div>
  );
}
