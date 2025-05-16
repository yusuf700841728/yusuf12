import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getFormattedDate } from "@/lib/utils";

// Define the form schema with validation - only name is required
const clientSchema = z.object({
  name: z.string().min(3, { message: "اسم العميل يجب أن يكون 3 أحرف على الأقل" }),
  idNumber: z.string().optional(),
  idExpiry: z.string().optional(),
  mobile: z.string().optional(),
  description: z.string().optional(),
  idImage: z.any().optional() // Will be handled separately
});

interface ClientFormProps {
  client?: any;
  onSave: (data: any) => void;
  isDisabled?: boolean;
  isPending?: boolean;
}

export default function ClientForm({ client, onSave, isDisabled = false, isPending = false }: ClientFormProps) {
  const [idImagePreview, setIdImagePreview] = useState<string | null>(client?.idImageUrl || null);
  
  // Initialize the form with client data or empty values
  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name || "",
      idNumber: client?.idNumber || "",
      idExpiry: client?.idExpiry ? getFormattedDate(new Date(client.idExpiry)) : getFormattedDate(),
      mobile: client?.mobile || "",
      description: client?.description || ""
    }
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = (data: z.infer<typeof clientSchema>) => {
    // Handle file upload separately (would be implemented in a real app)
    const fileInput = document.getElementById('client-id-image') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    // For now, just pass the form data to the parent component
    onSave({
      ...data,
      // In a real app, you would upload the file and get a URL
      idImageFile: file,
      idImageUrl: idImagePreview
    });
  };
  
  return (
    <Form {...form}>
      <form id="client-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>اسم العميل</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="أدخل اسم العميل" 
                    {...field} 
                    disabled={isDisabled || isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="idNumber"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>رقم الهوية</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="أدخل رقم الهوية" 
                    {...field} 
                    disabled={isDisabled || isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="idExpiry"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>تاريخ انتهاء الهوية</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    disabled={isDisabled || isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>رقم الجوال</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="أدخل رقم الجوال" 
                    {...field} 
                    disabled={isDisabled || isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <FormLabel>تحميل صورة البطاقة</FormLabel>
          <div className="flex items-center">
            <div className="flex-grow mr-3">
              <div className="border border-gray-300 border-dashed rounded px-3 py-8 text-center bg-gray-50">
                <div className="space-y-2">
                  <i className="fas fa-upload text-neutral-400 text-xl"></i>
                  <div className="text-sm text-neutral-500">اسحب الملف هنا أو</div>
                  <Button 
                    type="button" 
                    onClick={() => document.getElementById('client-id-image')?.click()}
                    disabled={isDisabled || isPending}
                  >
                    اختر ملف
                  </Button>
                  <Input 
                    id="client-id-image"
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                    disabled={isDisabled || isPending}
                  />
                </div>
              </div>
            </div>
            
            <div className="w-24 h-24 border border-gray-200 rounded flex items-center justify-center bg-white">
              {idImagePreview ? (
                <img 
                  src={idImagePreview} 
                  alt="معاينة البطاقة" 
                  className="max-w-full max-h-full object-contain" 
                />
              ) : (
                <div className="text-neutral-300 text-center">
                  <i className="fas fa-id-card text-3xl"></i>
                  <div className="text-xs mt-1">معاينة</div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>وصف</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="أدخل وصفًا للعميل" 
                  rows={3}
                  {...field} 
                  disabled={isDisabled || isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
