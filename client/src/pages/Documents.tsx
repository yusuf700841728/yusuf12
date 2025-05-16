import DocumentModule from "@/components/documents/DocumentModule";
import { useEffect } from "react";

export default function Documents() {
  // Update document title
  useEffect(() => {
    document.title = "العقود والوثائق | نظام إدارة الوثائق المتكامل";
  }, []);

  return (
    <div className="h-full">
      <DocumentModule />
    </div>
  );
}
