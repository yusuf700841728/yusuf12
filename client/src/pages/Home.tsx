import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function Home() {
  const modules = [
    {
      title: "إدارة العملاء",
      description: "إضافة وتعديل وإدارة بيانات العملاء الأساسية",
      icon: "fas fa-users",
      link: "/clients",
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "تهيئة الوثائق",
      description: "إنشاء وتخصيص أنواع الوثائق والنماذج",
      icon: "fas fa-clipboard-list",
      link: "/templates",
      color: "bg-green-100 text-green-700"
    },
    {
      title: "العقود والوثائق",
      description: "إنشاء وإدارة الوثائق المستندة إلى النماذج",
      icon: "fas fa-file-contract",
      link: "/documents",
      color: "bg-purple-100 text-purple-700"
    },
    {
      title: "الأرشيف",
      description: "أرشفة وتنظيم الوثائق المكتملة",
      icon: "fas fa-archive",
      link: "/archive",
      color: "bg-amber-100 text-amber-700"
    },
    {
      title: "التقارير",
      description: "إنشاء وعرض تقارير متنوعة حول النظام",
      icon: "fas fa-chart-bar",
      link: "/reports",
      color: "bg-red-100 text-red-700"
    }
  ];

  return (
    <div className="p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">نظام إدارة الوثائق المتكامل</h1>
        <p className="text-muted-foreground mt-2">
          نظام متكامل لإدارة دورة حياة الوثائق بدءًا من تسجيل العملاء وصولاً إلى أرشفة الوثائق وإصدار التقارير
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <Link key={index} href={module.link}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className={`w-12 h-12 rounded-full ${module.color} flex items-center justify-center mb-3`}>
                  <i className={`${module.icon} text-lg`}></i>
                </div>
                <CardTitle>{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <button className="text-primary hover:underline flex items-center">
                  <span>الإنتقال إلى القسم</span>
                  <i className="fas fa-arrow-left mr-2"></i>
                </button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-10 p-6 bg-white rounded-lg shadow text-center">
        <h2 className="text-xl font-semibold mb-3">مرحبًا بك في نظام إدارة الوثائق المتكامل</h2>
        <p className="text-muted-foreground">
          هذا النظام مصمم لمساعدتك في إدارة جميع جوانب الوثائق والعقود بطريقة منظمة وفعالة.
          قم باختيار أحد الأقسام أعلاه للبدء، أو استخدم شريط التنقل الجانبي للتنقل بين مختلف أقسام النظام.
        </p>
      </div>
    </div>
  );
}
