import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { useSettings } from "@/lib/settings-context"

interface SalesTargetCardProps {
  currentSales: number
  targetSales: number
}

export function SalesTargetCard({ currentSales, targetSales }: SalesTargetCardProps) {
  const { settings } = useSettings()
  const progress = (currentSales / targetSales) * 100

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Sales Target</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(currentSales, settings.currencySymbol, settings.decimalPlaces)} /{" "}
          {formatCurrency(targetSales, settings.currencySymbol, settings.decimalPlaces)}
        </div>
        <Progress value={progress} className="mt-2" />
        <p className="text-xs text-muted-foreground mt-2">{progress.toFixed(1)}% of target reached</p>
      </CardContent>
    </Card>
  )
}
