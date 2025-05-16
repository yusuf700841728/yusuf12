import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FIELD_TYPES, CLIENT_FIELDS } from "@/lib/utils";

interface FieldConfigProps {
  field: any;
  index: number;
  onChange: (index: number, field: any) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export default function FieldConfig({ field, index, onChange, onRemove, disabled = false }: FieldConfigProps) {
  const [fieldData, setFieldData] = useState(field);
  
  useEffect(() => {
    setFieldData(field);
  }, [field]);
  
  const handleChange = (key: string, value: any) => {
    const updatedField = { ...fieldData, [key]: value };
    setFieldData(updatedField);
    onChange(index, updatedField);
  };
  
  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex justify-between mb-2">
        <div className="flex items-center">
          <i className="fas fa-grip-vertical text-neutral-300 ml-2 cursor-move"></i>
          <div className="font-medium">
            <Input
              placeholder="اسم الحقل"
              value={fieldData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="font-medium border-0 p-0 h-auto bg-transparent focus-visible:ring-0"
              disabled={disabled}
            />
          </div>
        </div>
        
        <div className="flex space-x-2 space-x-reverse">
          <button 
            type="button"
            className="text-neutral-500 hover:text-neutral-700"
            disabled={disabled}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button 
            type="button"
            className="text-destructive hover:text-red-700"
            onClick={() => onRemove(index)}
            disabled={disabled}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="block text-xs text-neutral-500 mb-1">نوع الحقل</Label>
          <Select
            value={fieldData.type}
            onValueChange={(value) => handleChange("type", value)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر نوع الحقل" />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {fieldData.type === "client" && (
          <div>
            <Label className="block text-xs text-neutral-500 mb-1">حقل العميل</Label>
            <Select
              value={fieldData.clientField || ""}
              onValueChange={(value) => handleChange("clientField", value)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر حقل العميل" />
              </SelectTrigger>
              <SelectContent>
                {CLIENT_FIELDS.map((field) => (
                  <SelectItem key={field.value} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {fieldData.type === "date" && (
          <div>
            <Label className="block text-xs text-neutral-500 mb-1">تنسيق العرض</Label>
            <Select
              value={fieldData.format || "DMY"}
              onValueChange={(value) => handleChange("format", value)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر تنسيق العرض" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DMY">يوم/شهر/سنة</SelectItem>
                <SelectItem value="YMD">سنة/شهر/يوم</SelectItem>
                <SelectItem value="Hijri">التاريخ الهجري</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div>
          <Label className="block text-xs text-neutral-500 mb-1">إلزامي</Label>
          <div className="mt-1">
            <label className="inline-flex items-center">
              <Checkbox 
                checked={fieldData.required}
                onCheckedChange={(checked) => handleChange("required", checked)}
                disabled={disabled}
              />
              <span className="mr-2 text-sm">حقل إلزامي</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
