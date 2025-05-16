import { useState, useMemo } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface ClientTableProps {
  clients: any[];
  isLoading: boolean;
  isError: boolean;
  selectedClient: any;
  onSelectClient: (client: any) => void;
  searchQuery: string;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function ClientTable({ 
  clients, 
  isLoading,
  isError,
  selectedClient, 
  onSelectClient,
  searchQuery,
  currentPage,
  onPageChange
}: ClientTableProps) {
  const itemsPerPage = 5;
  
  // Filter clients based on search query
  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    return clients.filter((client) => 
      client.name.includes(searchQuery) || 
      client.idNumber.includes(searchQuery) ||
      client.mobile.includes(searchQuery)
    );
  }, [clients, searchQuery]);
  
  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const displayedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredClients.slice(startIndex, endIndex);
  }, [filteredClients, currentPage, itemsPerPage]);
  
  if (isLoading) {
    return <div className="text-center py-4">جاري تحميل البيانات...</div>;
  }
  
  if (isError) {
    return <div className="text-center py-4 text-destructive">حدث خطأ أثناء تحميل البيانات. الرجاء المحاولة مرة أخرى.</div>;
  }
  
  return (
    <div>
      <div className="overflow-x-auto">
        <Table className="min-w-full border border-gray-200 table-hover">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-3 py-2 border-b border-gray-200 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                اسم العميل
              </TableHead>
              <TableHead className="px-3 py-2 border-b border-gray-200 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                رقم الهوية
              </TableHead>
              <TableHead className="px-3 py-2 border-b border-gray-200 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                تاريخ انتهاء الهوية
              </TableHead>
              <TableHead className="px-3 py-2 border-b border-gray-200 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                رقم الجوال
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {displayedClients.length > 0 ? (
              displayedClients.map((client) => (
                <TableRow 
                  key={client.id}
                  className={`hover:bg-gray-50 cursor-pointer ${selectedClient?.id === client.id ? 'bg-blue-50' : ''}`}
                  onClick={() => onSelectClient(client)}
                >
                  <TableCell className="px-3 py-2 whitespace-nowrap text-sm text-neutral-700">{client.name}</TableCell>
                  <TableCell className="px-3 py-2 whitespace-nowrap text-sm text-neutral-500">{client.idNumber}</TableCell>
                  <TableCell className="px-3 py-2 whitespace-nowrap text-sm text-neutral-500">{formatDate(client.idExpiry)}</TableCell>
                  <TableCell className="px-3 py-2 whitespace-nowrap text-sm text-neutral-500">{client.mobile}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-neutral-500">
                  لا توجد بيانات للعرض
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {filteredClients.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-neutral-500">
            عرض {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredClients.length)} من {filteredClients.length} عميل
          </div>
          <div className="flex">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-r"
            >
              السابق
            </Button>
            
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 3) {
                pageNumber = i + 1;
              } else if (currentPage <= 2) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 1) {
                pageNumber = totalPages - 2 + i;
              } else {
                pageNumber = currentPage - 1 + i;
              }
              
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                  className="px-3 py-1 border-t border-b"
                >
                  {pageNumber}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-l"
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
