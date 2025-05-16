import { useLocation, Link } from "wouter";
import { useEffect } from "react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const [location] = useLocation();
  
  const navItems = [
    { href: "/clients", icon: "fas fa-users", text: "العملاء" },
    { href: "/templates", icon: "fas fa-clipboard-list", text: "تهيئة الوثائق" },
    { href: "/documents", icon: "fas fa-file-contract", text: "العقود والوثائق" },
    { href: "/archive", icon: "fas fa-archive", text: "الأرشيف" },
    { href: "/reports", icon: "fas fa-chart-bar", text: "التقارير" }
  ];
  
  // Close sidebar when navigating to a new page
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location]);
  
  return (
    <div className={`fixed inset-0 z-40 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`absolute inset-y-0 right-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 bg-primary text-white flex justify-between items-center">
          <h1 className="text-lg font-bold">نظام إدارة الوثائق</h1>
          <button onClick={onClose} className="text-white">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="py-2">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`nav-item flex items-center px-4 py-3 text-neutral-500 hover:bg-gray-50 ${location === item.href ? 'active' : ''}`}
            >
              <i className={`${item.icon} w-5 text-center ml-3`}></i>
              <span>{item.text}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
