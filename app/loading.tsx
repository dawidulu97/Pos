import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
        <p className="mt-4 text-gray-600">Loading POS System...</p>
      </div>
    </div>
  )
}
