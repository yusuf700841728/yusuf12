import ReportModule from "@/components/reports/ReportModule";
import { useEffect } from "react";

export default function Reports() {
  // Update document title
  useEffect(() => {
    document.title = "التقارير | نظام إدارة الوثائق المتكامل";
  }, []);

  return (
    <div className="h-full">
      <ReportModule />
    </div>
  );
}
