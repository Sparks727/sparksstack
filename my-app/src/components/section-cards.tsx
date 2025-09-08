import { IconTrendingDown, IconTrendingUp, IconUsers } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Visitors</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            12,345
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="flex items-center gap-1">
              <IconTrendingUp className="size-3" />
              +12.5%
            </Badge>
            <IconUsers className="size-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Visitors for the last 6 months
          </p>
        </CardContent>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="flex items-center gap-1">
              <IconTrendingDown className="size-3" />
              -20%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Acquisition needs attention
          </p>
        </CardContent>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            45,678
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="flex items-center gap-1">
              <IconTrendingUp className="size-3" />
              +12.5%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Engagement exceed targets
          </p>
        </CardContent>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="flex items-center gap-1">
              <IconTrendingUp className="size-3" />
              +4.5%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Meets growth projections
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
