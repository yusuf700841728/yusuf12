import TemplateModule from "@/components/templates/TemplateModule";
import { useEffect } from "react";

export default function Templates() {
  // Update document title
  useEffect(() => {
    document.title = "تهيئة الوثائق | نظام إدارة الوثائق المتكامل";
  }, []);

  return (
    <div className="h-full">
      <TemplateModule />
    </div>
  );
}
