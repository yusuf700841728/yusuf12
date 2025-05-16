import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
  FormMessage,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function DocumentModule() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formSchema, setFormSchema] = useState<any>(null);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  
  // Fetch templates data
  const { data: templates = [] } = useQuery({
    queryKey: ["/api/templates"],
  });
  
  // Fetch documents based on selected template
  const { data: documents = [], isLoading: isDocumentsLoading } = useQuery({
    queryKey: ["/api/documents", selectedTemplate?.id],
    enabled: !!selectedTemplate?.id,
  });
  
  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });
  
  // Create dynamic form schema based on template fields
  useEffect(() => {
    if (selectedTemplate?.fields) {
      const schemaObj: { [key: string]: any } = {};
      
      selectedTemplate.fields.forEach((field: any) => {
        if (field.required) {
          if (field.type === 'number') {
            schemaObj[field.id] = z.number().min(0, { message: `${field.name} مطلوب` });
          } else {
            schemaObj[field.id] = z.string().min(1, { message: `${field.name} مطلوب` });
          }
        } else {
          if (field.type === 'number') {
            schemaObj[field.id] = z.number().optional();
          } else {
            schemaObj[field.id] = z.string().optional();
          }
        }
      });
      
      // Add question answers
      if (selectedTemplate.questions) {
        selectedTemplate.questions.forEach((question: any) => {
          if (question.required) {
            if (question.type === 'yesno') {
              schemaObj[`q_${question.id}`] = z.boolean();
            } else {
              schemaObj[`q_${question.id}`] = z.string().min(1, { message: `${question.text} مطلوب` });
            }
          } else {
            if (question.type === 'yesno') {
              schemaObj[`q_${question.id}`] = z.boolean().optional();
            } else {
              schemaObj[`q_${question.id}`] = z.string().optional();
            }
          }
        });
      }
      
      setFormSchema(z.object(schemaObj));
    }
  }, [selectedTemplate]);
  
  // Create form based on dynamic schema
  const form = useForm<any>({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
    defaultValues: selectedDocument || {},
  });
  
  // Update form values when document changes
  useEffect(() => {
    if (selectedDocument) {
      form.reset(selectedDocument);
      setIsFormDisabled(true);
    } else {
      form.reset({});
      setIsFormDisabled(false);
    }
  }, [selectedDocument, form]);
  
  // CRUD operations
  const createDocumentMutation = useMutation({
    mutationFn: (newDocument: any) => 
      apiRequest("POST", "/api/documents", newDocument),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", selectedTemplate?.id] });
      toast({
        title: "تم إنشاء الوثيقة بنجاح",
        variant: "default",
      });
      handleNew();
    },
    onError: (error) => {
      toast({
        title: "خطأ في إنشاء الوثيقة",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const updateDocumentMutation = useMutation({
    mutationFn: (document: any) => 
      apiRequest("PATCH", `/api/documents/${document.id}`, document),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", selectedTemplate?.id] });
      toast({
        title: "تم تحديث الوثيقة بنجاح",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تحديث الوثيقة",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const deleteDocumentMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", selectedTemplate?.id] });
      toast({
        title: "تم حذف الوثيقة بنجاح",
        variant: "default",
      });
      setSelectedDocument(null);
    },
    onError: (error) => {
      toast({
        title: "خطأ في حذف الوثيقة",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handler functions
  const handleSave = (data: any) => {
    const documentData = {
      ...data,
      templateId: selectedTemplate.id,
    };
    
    if (selectedDocument?.id) {
      updateDocumentMutation.mutate({ ...documentData, id: selectedDocument.id });
    } else {
      createDocumentMutation.mutate(documentData);
    }
  };
  
  const handleEdit = () => {
    if (!selectedDocument) {
      toast({
        title: "الرجاء اختيار وثيقة للتعديل",
        variant: "destructive",
      });
      return;
    }
    setIsFormDisabled(false);
  };
  
  const handleNew = () => {
    setSelectedDocument(null);
    form.reset({});
    setIsFormDisabled(false);
  };
  
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/documents", selectedTemplate?.id] });
  };
  
  const handlePrint = () => {
    if (!selectedDocument) {
      toast({
        title: "الرجاء اختيار وثيقة للطباعة",
        variant: "destructive",
      });
      return;
    }
    window.print();
  };
  
  const handleDelete = () => {
    if (!selectedDocument) {
      toast({
        title: "الرجاء اختيار وثيقة للحذف",
        variant: "destructive",
      });
      return;
    }
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedDocument?.id) {
      deleteDocumentMutation.mutate(selectedDocument.id);
    }
    setIsDeleteDialogOpen(false);
  };
  
  const handleSelectDocument = (document: any) => {
    setSelectedDocument(document);
  };
  
  const handleTemplateChange = (templateId: string) => {
    const template = templates ? templates.find((t: any) => t.id.toString() === templateId) : null;
    setSelectedTemplate(template);
    setSelectedDocument(null);
    form.reset({});
  };
  
  // Render client form field based on field type
  const renderFormField = (field: any) => {
    switch(field.type) {
      case 'text':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}</FormLabel>
                <FormControl>
                  <Input 
                    {...formField} 
                    disabled={isFormDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'number':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    {...formField}
                    onChange={(e) => formField.onChange(parseInt(e.target.value) || 0)}
                    disabled={isFormDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'date':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    {...formField}
                    disabled={isFormDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'select':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}</FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                  disabled={isFormDisabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`اختر ${field.name}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'file':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}</FormLabel>
                <FormControl>
                  <Input 
                    type="file"
                    onChange={(e) => formField.onChange(e.target.files?.[0])}
                    disabled={isFormDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'client':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}</FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                  disabled={isFormDisabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`اختر ${field.name}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients && Array.isArray(clients) ? clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name} - {client.idNumber}
                      </SelectItem>
                    )) : (
                      <SelectItem value="none">لا يوجد عملاء</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      default:
        return null;
    }
  };
  
  // Render question field based on question type
  const renderQuestionField = (question: any) => {
    switch(question.type) {
      case 'yesno':
        return (
          <FormField
            key={`q_${question.id}`}
            control={form.control}
            name={`q_${question.id}`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isFormDisabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {question.text}
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'multiple':
        return (
          <FormField
            key={`q_${question.id}`}
            control={form.control}
            name={`q_${question.id}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.text}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isFormDisabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر إجابة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {question.options?.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'text':
        return (
          <FormField
            key={`q_${question.id}`}
            control={form.control}
            name={`q_${question.id}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.text}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="أدخل إجابتك هنا"
                    disabled={isFormDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="flex-1 overflow-hidden flex flex-col" id="documents-module">
      {/* Command bar */}
      <div className="bg-white border-b border-gray-200 p-2 command-bar flex flex-wrap gap-2">
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={() => {
            const formEl = document.getElementById('document-form') as HTMLFormElement;
            if (formEl) {
              // طريقة آمنة لتقديم النموذج بدون استخدام requestSubmit
              const event = new Event('submit', { bubbles: true, cancelable: true });
              formEl.dispatchEvent(event);
            }
          }}
          disabled={!selectedTemplate || isFormDisabled || createDocumentMutation.isPending || updateDocumentMutation.isPending}
        >
          <i className="fas fa-save ml-2"></i>
          <span>حفظ</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={handleEdit}
          disabled={!selectedDocument}
        >
          <i className="fas fa-edit ml-2"></i>
          <span>تعديل</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={handleNew}
          disabled={!selectedTemplate}
        >
          <i className="fas fa-plus ml-2"></i>
          <span>إضافة جديد</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={handleRefresh}
          disabled={!selectedTemplate || isDocumentsLoading}
        >
          <i className="fas fa-sync-alt ml-2"></i>
          <span>تحديث الجداول</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={handlePrint}
          disabled={!selectedDocument}
        >
          <i className="fas fa-print ml-2"></i>
          <span>طباعة</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={handleDelete}
          disabled={!selectedDocument || deleteDocumentMutation.isPending}
        >
          <i className="fas fa-trash-alt ml-2"></i>
          <span>حذف</span>
        </button>
      </div>
      
      {/* Template selector */}
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="max-w-md">
          <Label>نوع الوثيقة</Label>
          <Select
            onValueChange={handleTemplateChange}
            value={selectedTemplate?.id?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع الوثيقة" />
            </SelectTrigger>
            <SelectContent>
              {templates && templates.map((template: any) => (
                <SelectItem key={template.id} value={template.id.toString()}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Content area with split view */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Document form */}
        <div className="p-4 bg-white border-b lg:border-b-0 lg:border-l border-gray-200 lg:w-1/2 overflow-y-auto">
          <h3 className="text-lg font-medium mb-4">
            {selectedTemplate 
              ? `${selectedTemplate.name} ${selectedDocument ? '- تعديل' : '- جديد'}`
              : 'اختر نوع الوثيقة أولاً'
            }
          </h3>
          
          {selectedTemplate ? (
            <Form {...form}>
              <form id="document-form" onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                {/* Fields section */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">بيانات الوثيقة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTemplate.fields?.map((field: any) => renderFormField(field))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Questions section */}
                {selectedTemplate.questions?.length > 0 && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">أسئلة المتابعة</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedTemplate.questions.map((question: any) => renderQuestionField(question))}
                    </CardContent>
                  </Card>
                )}
              </form>
            </Form>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              الرجاء اختيار نوع الوثيقة أولاً لعرض نموذج الإدخال
            </div>
          )}
        </div>
        
        {/* Documents list */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-lg font-medium mb-4">سجل الوثائق</h3>
          
          {!selectedTemplate ? (
            <div className="text-center py-8 text-neutral-500">
              الرجاء اختيار نوع الوثيقة لعرض الوثائق المتاحة
            </div>
          ) : isDocumentsLoading ? (
            <div className="text-center py-4">جاري تحميل البيانات...</div>
          ) : documents && documents.length > 0 ? (
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      رقم الوثيقة
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      تاريخ الإنشاء
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents && documents.map((document: any) => (
                    <tr
                      key={document.id}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedDocument?.id === document.id ? 'bg-blue-50' : ''}`}
                      onClick={() => handleSelectDocument(document)}
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-700">
                        {document.id}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-500">
                        {new Date(document.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          مكتمل
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              لا توجد وثائق متاحة لهذا النوع. قم بإنشاء وثيقة جديدة.
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في حذف هذه الوثيقة؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
