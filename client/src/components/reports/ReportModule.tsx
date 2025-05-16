import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
// import { DateRangePicker } from "@/components/ui/date-range-picker";
import { formatDate } from "@/lib/utils";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Report types
const REPORT_TYPES = [
  { value: "clients", label: "تقرير العملاء" },
  { value: "documents", label: "تقرير الوثائق" },
  { value: "templates", label: "تقرير النماذج" },
  { value: "archive", label: "تقرير الأرشيف" },
];

export default function ReportModule() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>("clients");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [showChart, setShowChart] = useState<boolean>(false);
  
  // Forms
  const form = useForm({
    defaultValues: {
      reportType: "clients",
      searchQuery: "",
    },
  });
  
  // Fetch data based on selected report type
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["/api/clients"],
    enabled: reportType === "clients",
  });
  
  const { data: documents = [], isLoading: isLoadingDocuments } = useQuery({
    queryKey: ["/api/documents"],
    enabled: reportType === "documents",
  });
  
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["/api/templates"],
    enabled: reportType === "templates",
  });
  
  const { data: archive = [], isLoading: isLoadingArchive } = useQuery({
    queryKey: ["/api/archive"],
    enabled: reportType === "archive",
  });
  
  // Generate report data based on selected type
  const getReportData = () => {
    switch (reportType) {
      case "clients":
        return clients;
      case "documents":
        return documents;
      case "templates":
        return templates;
      case "archive":
        return archive;
      default:
        return [];
    }
  };
  
  // Filter report data based on date range
  const filterDataByDateRange = (data: any[]) => {
    if (!dateRange.from && !dateRange.to) return data;
    
    return data.filter((item) => {
      const itemDate = new Date(item.createdAt);
      
      if (dateRange.from && dateRange.to) {
        return itemDate >= dateRange.from && itemDate <= dateRange.to;
      }
      
      if (dateRange.from) {
        return itemDate >= dateRange.from;
      }
      
      if (dateRange.to) {
        return itemDate <= dateRange.to;
      }
      
      return true;
    });
  };
  
  // Generated filtered data
  const filteredData = filterDataByDateRange(getReportData());
  
  // Handle generate report click
  const handleGenerateReport = () => {
    if (filteredData.length === 0) {
      toast({
        title: "لا توجد بيانات",
        description: "لا توجد بيانات متاحة للتقرير المحدد",
        variant: "destructive",
      });
      return;
    }
    
    setShowChart(true);
  };
  
  // Handle export to CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      toast({
        title: "لا توجد بيانات للتصدير",
        variant: "destructive",
      });
      return;
    }
    
    // Generate CSV content
    const headers = Object.keys(filteredData[0]).join(",");
    const rows = filteredData.map((item) => Object.values(item).join(",")).join("\n");
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "تم تصدير التقرير بنجاح",
      variant: "default",
    });
  };
  
  // Handle print report
  const handlePrintReport = () => {
    if (filteredData.length === 0) {
      toast({
        title: "لا توجد بيانات للطباعة",
        variant: "destructive",
      });
      return;
    }
    
    window.print();
  };
  
  // Generate chart data based on report type
  const getChartData = () => {
    switch (reportType) {
      case "clients":
        // Group clients by creation month
        const clientMonths: { [key: string]: number } = {};
        filteredData.forEach((client: any) => {
          const month = new Date(client.createdAt).toLocaleDateString('ar-SA', { month: 'long' });
          clientMonths[month] = (clientMonths[month] || 0) + 1;
        });
        return Object.entries(clientMonths).map(([name, value]) => ({ name, value }));
        
      case "documents":
        // Group documents by template type
        const documentTemplates: { [key: string]: number } = {};
        filteredData.forEach((document: any) => {
          const templateId = document.templateId;
          const templateName = templates.find((t: any) => t.id === templateId)?.name || `نموذج ${templateId}`;
          documentTemplates[templateName] = (documentTemplates[templateName] || 0) + 1;
        });
        return Object.entries(documentTemplates).map(([name, value]) => ({ name, value }));
        
      case "templates":
        // Count documents per template
        const templateDocs: { [key: string]: number } = {};
        templates.forEach((template: any) => {
          const count = documents.filter((doc: any) => doc.templateId === template.id).length;
          templateDocs[template.name] = count;
        });
        return Object.entries(templateDocs).map(([name, value]) => ({ name, value }));
        
      case "archive":
        // Group archive by storage location
        const archiveLocations: { [key: string]: number } = {};
        filteredData.forEach((doc: any) => {
          if (doc.archiveMetadata?.storageLocation?.cabinet) {
            const location = `خزانة ${doc.archiveMetadata.storageLocation.cabinet}`;
            archiveLocations[location] = (archiveLocations[location] || 0) + 1;
          }
        });
        return Object.entries(archiveLocations).map(([name, value]) => ({ name, value }));
        
      default:
        return [];
    }
  };
  
  const chartData = getChartData();
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
  
  // Render table headers based on report type
  const renderTableHeaders = () => {
    switch (reportType) {
      case "clients":
        return (
          <TableRow>
            <TableHead>رقم العميل</TableHead>
            <TableHead>اسم العميل</TableHead>
            <TableHead>رقم الهوية</TableHead>
            <TableHead>تاريخ انتهاء الهوية</TableHead>
            <TableHead>رقم الجوال</TableHead>
            <TableHead>تاريخ التسجيل</TableHead>
          </TableRow>
        );
        
      case "documents":
        return (
          <TableRow>
            <TableHead>رقم الوثيقة</TableHead>
            <TableHead>نوع الوثيقة</TableHead>
            <TableHead>تاريخ الإنشاء</TableHead>
            <TableHead>الحالة</TableHead>
          </TableRow>
        );
        
      case "templates":
        return (
          <TableRow>
            <TableHead>رقم النموذج</TableHead>
            <TableHead>اسم النموذج</TableHead>
            <TableHead>الوصف</TableHead>
            <TableHead>عدد الحقول</TableHead>
            <TableHead>عدد الأسئلة</TableHead>
            <TableHead>تاريخ الإنشاء</TableHead>
          </TableRow>
        );
        
      case "archive":
        return (
          <TableRow>
            <TableHead>رقم الوثيقة</TableHead>
            <TableHead>عنوان الوثيقة</TableHead>
            <TableHead>نوع الوثيقة</TableHead>
            <TableHead>موقع التخزين</TableHead>
            <TableHead>تاريخ الأرشفة</TableHead>
            <TableHead>تاريخ الانتهاء</TableHead>
          </TableRow>
        );
        
      default:
        return null;
    }
  };
  
  // Render table rows based on report type
  const renderTableRows = () => {
    switch (reportType) {
      case "clients":
        return filteredData.map((client: any) => (
          <TableRow key={client.id}>
            <TableCell>{client.id}</TableCell>
            <TableCell>{client.name}</TableCell>
            <TableCell>{client.idNumber}</TableCell>
            <TableCell>{formatDate(client.idExpiry)}</TableCell>
            <TableCell>{client.mobile}</TableCell>
            <TableCell>{formatDate(client.createdAt)}</TableCell>
          </TableRow>
        ));
        
      case "documents":
        return filteredData.map((doc: any) => (
          <TableRow key={doc.id}>
            <TableCell>{doc.id}</TableCell>
            <TableCell>
              {templates.find((t: any) => t.id === doc.templateId)?.name || `نموذج ${doc.templateId}`}
            </TableCell>
            <TableCell>{formatDate(doc.createdAt)}</TableCell>
            <TableCell>
              {doc.archived ? 'مؤرشف' : 'غير مؤرشف'}
            </TableCell>
          </TableRow>
        ));
        
      case "templates":
        return filteredData.map((template: any) => (
          <TableRow key={template.id}>
            <TableCell>{template.id}</TableCell>
            <TableCell>{template.name}</TableCell>
            <TableCell>{template.description}</TableCell>
            <TableCell>{template.fields.length}</TableCell>
            <TableCell>{template.questions.length}</TableCell>
            <TableCell>{formatDate(template.createdAt)}</TableCell>
          </TableRow>
        ));
        
      case "archive":
        return filteredData.map((doc: any) => (
          <TableRow key={doc.id}>
            <TableCell>{doc.id}</TableCell>
            <TableCell>{doc.archiveMetadata?.title || 'بدون عنوان'}</TableCell>
            <TableCell>
              {templates.find((t: any) => t.id === doc.templateId)?.name || `نموذج ${doc.templateId}`}
            </TableCell>
            <TableCell>
              {doc.archiveMetadata?.storageLocation ? 
                `خزانة ${doc.archiveMetadata.storageLocation.cabinet}، رف ${doc.archiveMetadata.storageLocation.shelf}` : 
                'غير محدد'}
            </TableCell>
            <TableCell>{formatDate(doc.updatedAt)}</TableCell>
            <TableCell>{doc.archiveMetadata?.expiryDate ? formatDate(doc.archiveMetadata.expiryDate) : 'غير محدد'}</TableCell>
          </TableRow>
        ));
        
      default:
        return null;
    }
  };
  
  // Get report title
  const getReportTitle = () => {
    const type = REPORT_TYPES.find((t) => t.value === reportType)?.label || "تقرير";
    
    let dateInfo = "";
    if (dateRange.from && dateRange.to) {
      dateInfo = ` (${formatDate(dateRange.from)} - ${formatDate(dateRange.to)})`;
    } else if (dateRange.from) {
      dateInfo = ` (من ${formatDate(dateRange.from)})`;
    } else if (dateRange.to) {
      dateInfo = ` (حتى ${formatDate(dateRange.to)})`;
    }
    
    return `${type}${dateInfo}`;
  };
  
  return (
    <div className="flex-1 overflow-hidden flex flex-col" id="reports-module">
      {/* Command bar */}
      <div className="bg-white border-b border-gray-200 p-2 command-bar flex flex-wrap gap-2">
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={handleGenerateReport}
        >
          <i className="fas fa-chart-bar ml-2"></i>
          <span>إنشاء تقرير</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={handleExportCSV}
          disabled={filteredData.length === 0}
        >
          <i className="fas fa-file-export ml-2"></i>
          <span>تصدير CSV</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={handlePrintReport}
          disabled={filteredData.length === 0}
        >
          <i className="fas fa-print ml-2"></i>
          <span>طباعة</span>
        </button>
      </div>
      
      {/* Content area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>إعدادات التقرير</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reportType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع التقرير</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setReportType(value);
                            setShowChart(false);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع التقرير" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {REPORT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormItem>
                    <FormLabel>نطاق التاريخ</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input 
                          type="date" 
                          placeholder="من تاريخ"
                          onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value ? new Date(e.target.value) : undefined }))}
                        />
                        <Input 
                          type="date" 
                          placeholder="إلى تاريخ"
                          onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value ? new Date(e.target.value) : undefined }))}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                </div>
                
                <FormField
                  control={form.control}
                  name="searchQuery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>بحث</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="البحث في البيانات..." 
                            {...field}
                          />
                          <i className="fas fa-search absolute left-3 top-2.5 text-neutral-400"></i>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button type="button" onClick={handleGenerateReport}>إنشاء التقرير</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Report results */}
        {filteredData.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>{getReportTitle()}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="table">
                <TabsList className="mb-4">
                  <TabsTrigger value="table">جدول</TabsTrigger>
                  {showChart && chartData.length > 0 && (
                    <TabsTrigger value="chart">رسم بياني</TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="table">
                  <div className="border rounded overflow-x-auto">
                    <Table>
                      <TableHeader>
                        {renderTableHeaders()}
                      </TableHeader>
                      <TableBody>
                        {renderTableRows()}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-4 text-sm text-muted-foreground">
                    إجمالي السجلات: {filteredData.length}
                  </div>
                </TabsContent>
                
                {showChart && chartData.length > 0 && (
                  <TabsContent value="chart">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">مخطط دائري</CardTitle>
                        </CardHeader>
                        <CardContent className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">مخطط أعمدة</CardTitle>
                        </CardHeader>
                        <CardContent className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={chartData}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" name="العدد" fill="#0078d4" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
