import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ArrowUpRight, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomerSatisfactionCardProps {
  responses: number
  score: number
  changePercentage: number
}

export function CustomerSatisfactionCard({ responses, score, changePercentage }: CustomerSatisfactionCardProps) {
  const maxResponses = 500 // Assuming a max for the radial chart
  const filledSegments = Math.min(responses / maxResponses, 1) * 100 // Percentage of responses filled
  const segmentCount = 20 // Number of segments in the radial chart
  const filledSegmentCount = Math.round((filledSegments / 100) * segmentCount)

  return (
    <Card className="relative p-6 rounded-lg shadow-card bg-white text-flux-text-dark border border-flux-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
        <Gauge className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex justify-between items-start mb-4">
          <p className="text-flux-text-muted text-sm mb-4">Top Positive Feedback</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MoreHorizontal className="w-5 h-5 text-flux-text-muted cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white border-flux-border shadow-lg rounded-md">
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 text-sm">View Details</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 text-sm">Export</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative w-48 h-24 overflow-hidden">
            <div className="absolute inset-0 flex justify-center items-end">
              <div className="grid grid-cols-10 gap-1 w-full max-w-[180px] transform rotate-180 origin-bottom">
                {Array.from({ length: segmentCount }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2 w-2 rounded-full",
                      i < filledSegmentCount
                        ? i < filledSegmentCount / 2
                          ? "bg-flux-teal-dark"
                          : "bg-flux-teal-light"
                        : "bg-gray-200",
                    )}
                    style={{ transform: `rotate(${i * (180 / (segmentCount - 1))}deg)` }}
                  ></div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-full bg-white border-4 border-white flex items-center justify-center shadow-md">
              <div className="text-3xl font-bold text-flux-text-dark">{responses}</div>
            </div>
          </div>
          <p className="text-flux-text-muted text-sm mt-8">Responses this month</p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-flux-teal-dark"></span> High
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-flux-teal-light"></span> Low
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-flux-green-light-bg text-flux-green-dark text-xs font-medium">
            <ArrowUpRight className="w-3 h-3" /> {changePercentage}%
          </span>
          <span className="text-sm text-flux-text-muted">Customer Satisfaction (CSAT): {score.toFixed(1)} / 5.0</span>
        </div>
        <p className="text-sm text-flux-text-muted mt-2">Based on recent feedback</p>
      </CardContent>
    </Card>
  )
}
