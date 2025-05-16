import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import TemplateForm from "./TemplateForm";

export default function TemplateModule() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch templates data
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/templates"],
  });
  
  // Mutations for template operations
  const createTemplateMutation = useMutation({
    mutationFn: (newTemplate: any) => 
      apiRequest("POST", "/api/templates", newTemplate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "تم إضافة النموذج بنجاح",
        variant: "default",
      });
      setSelectedTemplate(null);
    },
    onError: (error) => {
      toast({
        title: "خطأ في إضافة النموذج",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const updateTemplateMutation = useMutation({
    mutationFn: (template: any) => 
      apiRequest("PATCH", `/api/templates/${template.id}`, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "تم تحديث النموذج بنجاح",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تحديث النموذج",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "تم حذف النموذج بنجاح",
        variant: "default",
      });
      setSelectedTemplate(null);
    },
    onError: (error) => {
      toast({
        title: "خطأ في حذف النموذج",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handler functions
  const handleSaveTemplate = (templateData: any) => {
    if (selectedTemplate?.id) {
      updateTemplateMutation.mutate({ ...templateData, id: selectedTemplate.id });
    } else {
      createTemplateMutation.mutate(templateData);
    }
  };
  
  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
  };
  
  const handleDeleteTemplate = () => {
    if (!selectedTemplate) {
      toast({
        title: "الرجاء اختيار نموذج للحذف",
        variant: "destructive",
      });
      return;
    }
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedTemplate?.id) {
      deleteTemplateMutation.mutate(selectedTemplate.id);
    }
    setIsDeleteDialogOpen(false);
  };
  
  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
  };
  
  const handlePreviewTemplate = () => {
    if (!selectedTemplate) {
      toast({
        title: "الرجاء اختيار نموذج للمعاينة",
        variant: "destructive",
      });
      return;
    }
    // Implement preview logic
    toast({
      title: "جاري معاينة النموذج",
      description: "هذه الميزة قيد التطوير",
      variant: "default",
    });
  };
  
  return (
    <div className="flex-1 overflow-hidden flex flex-col" id="templates-module">
      {/* Command bar */}
      <div className="bg-white border-b border-gray-200 p-2 command-bar flex flex-wrap gap-2">
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={() => document.getElementById('template-form')?.requestSubmit()}
          disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
        >
          <i className="fas fa-save ml-2"></i>
          <span>حفظ النموذج</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={handleCreateTemplate}
        >
          <i className="fas fa-plus ml-2"></i>
          <span>نموذج جديد</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={handleDeleteTemplate}
          disabled={!selectedTemplate || deleteTemplateMutation.isPending}
        >
          <i className="fas fa-trash-alt ml-2"></i>
          <span>حذف النموذج</span>
        </button>
      </div>
      
      {/* Content area with split view */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Template selection sidebar */}
        <div className="p-4 bg-white border-b lg:border-b-0 lg:border-l border-gray-200 lg:w-1/3 overflow-y-auto">
          <h3 className="text-lg font-medium mb-4">نماذج الوثائق</h3>
          
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-4">جاري تحميل البيانات...</div>
            ) : templates.length > 0 ? (
              templates.map((template: any) => (
                <button
                  key={template.id}
                  className={`w-full flex items-center px-3 py-2 rounded ${
                    selectedTemplate?.id === template.id
                      ? 'bg-primary bg-opacity-10 border border-primary text-primary'
                      : 'hover:bg-gray-50 border border-gray-200 text-neutral-700'
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <i className="fas fa-file-contract ml-2"></i>
                  <span>{template.name}</span>
                </button>
              ))
            ) : (
              <div className="text-center py-4 text-neutral-500">لا توجد نماذج للعرض</div>
            )}
            
            <button 
              className="w-full flex items-center px-3 py-2 rounded hover:bg-gray-50 border border-transparent text-primary"
              onClick={handleCreateTemplate}
            >
              <i className="fas fa-plus ml-2"></i>
              <span>إضافة نموذج جديد</span>
            </button>
          </div>
        </div>
        
        {/* Template design area */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {selectedTemplate 
                ? `تصميم النموذج: ${selectedTemplate.name}` 
                : 'تصميم نموذج جديد'
              }
            </h3>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviewTemplate}
                disabled={!selectedTemplate}
              >
                <i className="fas fa-eye ml-2"></i>
                <span>معاينة</span>
              </Button>
              
              <Button
                size="sm"
                onClick={() => document.getElementById('template-form')?.requestSubmit()}
                disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
              >
                <i className="fas fa-save ml-2"></i>
                <span>حفظ النموذج</span>
              </Button>
            </div>
          </div>
          
          <TemplateForm
            template={selectedTemplate}
            onSave={handleSaveTemplate}
            isPending={createTemplateMutation.isPending || updateTemplateMutation.isPending}
          />
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا النموذج؟ هذا الإجراء لا يمكن التراجع عنه.
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
