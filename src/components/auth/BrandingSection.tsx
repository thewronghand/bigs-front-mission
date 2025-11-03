import logoSvg from '../../assets/logo.svg';

export default function BrandingSection() {
  return (
    <div className="hidden md:flex md:w-1/2 lg:w-3/5 min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 items-center justify-center p-8 lg:p-12">
      <div className="max-w-lg">
        <img src={logoSvg} alt="BIGS Logo" className="w-24 h-24 mb-6" />
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900">BIGS Board</h1>
        <p className="text-lg lg:text-xl text-gray-700 mb-6">
          Frontend Developer Mission
        </p>
        <div className="space-y-2 text-gray-600">
          <p className="font-medium mb-3">Tech Stack</p>
          <ul className="space-y-1.5 text-sm lg:text-base">
            <li>• React 19 & TypeScript</li>
            <li>• Vite</li>
            <li>• Zustand</li>
            <li>• React Router</li>
            <li>• React Hook Form</li>
            <li>• Axios</li>
            <li>• Tailwind CSS 4</li>
            <li>• React Hot Toast</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
