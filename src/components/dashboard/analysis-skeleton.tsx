import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AnalysisSkeleton() {
  return (
    <Card className="flex flex-col h-full animate-pulse">
      <CardHeader>
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </CardHeader>
      <CardContent className="flex-grow space-y-6 flex flex-col justify-center">
        <div className="flex items-center justify-center">
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-1/3 mx-auto" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-16 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
