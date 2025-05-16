import { useState } from "react";

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
}

export default function Header({ title, onMenuToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex justify-between items-center">
      <div className="flex items-center md:hidden">
        <button 
          className="text-neutral-500 hover:text-neutral-700"
          onClick={onMenuToggle}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>
      
      <div className="flex items-center">
        <h2 className="text-lg font-medium">{title}</h2>
      </div>
      
      <div className="flex items-center">
        <div className="relative">
          <input 
            type="text" 
            placeholder="بحث..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-100 border-0 rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
          />
          <i className="fas fa-search absolute left-3 top-2.5 text-neutral-400"></i>
        </div>
      </div>
    </header>
  );
}
