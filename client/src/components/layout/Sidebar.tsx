import { useLocation, Link } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();
  
  const navItems = [
    { href: "/clients", icon: "fas fa-users", text: "العملاء" },
    { href: "/templates", icon: "fas fa-clipboard-list", text: "تهيئة الوثائق" },
    { href: "/documents", icon: "fas fa-file-contract", text: "العقود والوثائق" },
    { href: "/archive", icon: "fas fa-archive", text: "الأرشيف" },
    { href: "/reports", icon: "fas fa-chart-bar", text: "التقارير" }
  ];
  
  return (
    <div className="bg-white w-64 flex-shrink-0 border-l border-gray-200 shadow-sm hidden md:flex md:flex-col">
      <div className="p-4 bg-primary text-white">
        <h1 className="text-lg font-bold">نظام إدارة الوثائق</h1>
      </div>
      
      <div className="py-2 flex-1">
        <div className="px-4 py-3 text-sm text-neutral-400">القائمة الرئيسية</div>
        
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
      
      <div className="px-4 py-3 mt-auto border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <i className="fas fa-user-circle"></i>
          </div>
          <div className="mr-3">
            <div className="text-sm font-medium">المستخدم الحالي</div>
            <div className="text-xs text-neutral-400">مدير النظام</div>
          </div>
        </div>
      </div>
    </div>
  );
}
