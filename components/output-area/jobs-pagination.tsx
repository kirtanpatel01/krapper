'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface JobsPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (n: number | ((prev: number) => number)) => void;
}

export function JobsPagination({ currentPage, totalPages, setCurrentPage }: JobsPaginationProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center bg-background/80 backdrop-blur-md border border-border/50 px-3 py-1.5 rounded-2xl shadow-xl z-50 transition-all hover:bg-background/95 group max-w-[90%] overflow-hidden">
      <Pagination className="w-auto">
        <PaginationContent className="flex-nowrap gap-0.5 overflow-x-auto no-scrollbar max-w-full px-2">
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(prev => Math.max(1, prev - 1));
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-20 h-7 w-7" : "cursor-pointer h-7 w-7"}
              text=""
            />
          </PaginationItem>
          
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink 
                  href="#" 
                  isActive={currentPage === pageNum}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(pageNum);
                  }}
                  className="cursor-pointer size-7 text-[10px] rounded-lg"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(prev => Math.min(totalPages, prev + 1));
              }}
              className={currentPage === totalPages ? "pointer-events-none opacity-20 h-7 w-7" : "cursor-pointer h-7 w-7"}
              text=""
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
