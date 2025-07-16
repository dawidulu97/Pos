import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      <div className="flex-1 flex flex-col p-4 space-y-4">
        <div className="flex-1 flex flex-col">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-8 w-[150px]" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-[120px]" />
              <Skeleton className="h-8 w-[100px]" />
            </div>
          </div>
          <div className="p-4 pt-0">
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-[180px] mb-2" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-3 flex flex-col items-center text-center">
                  <Skeleton className="w-24 h-24 mb-2 rounded-md" />
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2 mb-2" />
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-8 w-full mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-96 flex flex-col p-4 space-y-4 border-l bg-white dark:bg-gray-900">
        <div className="flex-1 flex flex-col">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border p-3 rounded-md">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-6 w-full mt-2" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  )
}
