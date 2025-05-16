import ClientModule from "@/components/clients/ClientModule";
import { useEffect } from "react";

export default function Clients() {
  // Update document title
  useEffect(() => {
    document.title = "إدارة العملاء | نظام إدارة الوثائق المتكامل";
  }, []);

  return (
    <div className="h-full">
      <ClientModule />
    </div>
  );
}
