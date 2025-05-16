import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ClientForm from "./ClientForm";
import ClientTable from "./ClientTable";
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

export default function ClientModule() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  
  // Fetch clients data
  const { data: clients = [], isLoading, isError } = useQuery({
    queryKey: ["/api/clients"],
  });
  
  // Mutations for client operations
  const createClientMutation = useMutation({
    mutationFn: (newClient: any) => 
      apiRequest("POST", "/api/clients", newClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "تم إضافة العميل بنجاح",
        variant: "default",
      });
      handleNew();
    },
    onError: (error) => {
      toast({
        title: "خطأ في إضافة العميل",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const updateClientMutation = useMutation({
    mutationFn: (client: any) => 
      apiRequest("PATCH", `/api/clients/${client.id}`, client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "تم تحديث بيانات العميل بنجاح",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تحديث بيانات العميل",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const deleteClientMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "تم حذف العميل بنجاح",
        variant: "default",
      });
      setSelectedClient(null);
    },
    onError: (error) => {
      toast({
        title: "خطأ في حذف العميل",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handler functions
  const handleSave = (clientData: any) => {
    if (selectedClient?.id) {
      updateClientMutation.mutate({ ...clientData, id: selectedClient.id });
    } else {
      createClientMutation.mutate(clientData);
    }
  };
  
  const handleEdit = () => {
    if (!selectedClient) {
      toast({
        title: "الرجاء اختيار عميل للتعديل",
        variant: "destructive",
      });
      return;
    }
    setIsFormDisabled(false);
  };
  
  const handleNew = () => {
    setSelectedClient(null);
    setIsFormDisabled(false);
  };
  
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
  };
  
  const handlePrint = () => {
    if (!selectedClient) {
      toast({
        title: "الرجاء اختيار عميل للطباعة",
        variant: "destructive",
      });
      return;
    }
    window.print();
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };
  
  const handleDelete = () => {
    if (!selectedClient) {
      toast({
        title: "الرجاء اختيار عميل للحذف",
        variant: "destructive",
      });
      return;
    }
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedClient?.id) {
      deleteClientMutation.mutate(selectedClient.id);
    }
    setIsDeleteDialogOpen(false);
  };
  
  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
    setIsFormDisabled(true);
  };
  
  return (
    <div className="flex-1 overflow-hidden flex flex-col" id="clients-module">
      {/* Command bar - Fixed position */}
      <div className="bg-white border-b border-gray-200 p-2 command-bar flex flex-wrap gap-2 sticky top-0 z-10 shadow-md">
        <div className="flex flex-wrap gap-2 items-center mr-auto">
          <input
            type="text"
            placeholder="بحث بالاسم، رقم الهوية أو رقم الجوال..."
            className="px-3 py-1.5 border rounded flex-grow min-w-[200px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            className="flex items-center px-3 py-1.5 rounded text-sm text-white bg-blue-500 hover:bg-blue-600"
            onClick={() => handleSearch(searchQuery)}
          >
            <i className="fas fa-search ml-2"></i>
            <span>بحث</span>
          </button>
        </div>

        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={() => {
            const form = document.getElementById('client-form') as HTMLFormElement;
            if (form) {
              // Submit the form safely
              const event = new Event('submit', { bubbles: true, cancelable: true });
              form.dispatchEvent(event);
            }
          }}
          disabled={createClientMutation.isPending || updateClientMutation.isPending}
        >
          <i className="fas fa-save ml-2"></i>
          <span>حفظ</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={handleEdit}
          disabled={!selectedClient}
        >
          <i className="fas fa-edit ml-2"></i>
          <span>تعديل</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={handleNew}
        >
          <i className="fas fa-plus ml-2"></i>
          <span>إضافة جديد</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <i className="fas fa-sync-alt ml-2"></i>
          <span>تحديث</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={handlePrint}
        >
          <i className="fas fa-print ml-2"></i>
          <span>طباعة</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-white bg-red-500 hover:bg-red-600"
          onClick={handleDelete}
          disabled={!selectedClient || deleteClientMutation.isPending}
        >
          <i className="fas fa-trash-alt ml-2"></i>
          <span>حذف</span>
        </button>
      </div>
      
      {/* Content area with split view */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Client form section */}
        <div className="p-4 bg-white border-b lg:border-b-0 lg:border-l border-gray-200 lg:w-1/2 overflow-y-auto">
          <h3 className="text-lg font-medium mb-4">بيانات العميل</h3>
          <ClientForm 
            client={selectedClient} 
            onSave={handleSave} 
            isDisabled={isFormDisabled}
            isPending={createClientMutation.isPending || updateClientMutation.isPending}
          />
        </div>
        
        {/* Client records table */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-lg font-medium mb-4">سجل العملاء</h3>
          <ClientTable 
            clients={clients}
            isLoading={isLoading}
            isError={isError}
            selectedClient={selectedClient}
            onSelectClient={handleSelectClient}
            searchQuery={searchQuery}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في حذف بيانات العميل؟ هذا الإجراء لا يمكن التراجع عنه.
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
