import ArchiveModule from "@/components/archive/ArchiveModule";
import { useEffect } from "react";

export default function Archive() {
  // Update document title
  useEffect(() => {
    document.title = "الأرشيف | نظام إدارة الوثائق المتكامل";
  }, []);

  return (
    <div className="h-full">
      <ArchiveModule />
    </div>
  );
}
