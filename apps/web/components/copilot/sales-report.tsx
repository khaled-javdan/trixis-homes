import { CheckIcon, XIcon } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

import type { SalesReport } from "@/lib/copilot/sales-report-schema"

export function SalesReportView({ report }: { report: SalesReport }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Client Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {report.clientSummary}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {report.topMatches.map((match, index) => (
          <Card key={match.projectId}>
            <CardHeader className="flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge>#{index + 1}</Badge>
                <div>
                  <CardTitle>{match.projectName}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {match.developer}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm">{match.whyMatch}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Pros
                  </p>
                  <ul className="flex flex-col gap-1">
                    {match.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm">
                        <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Cons
                  </p>
                  <ul className="flex flex-col gap-1">
                    {match.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm">
                        <XIcon className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {match.objections.length > 0 ? (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Possible Objections
                    </p>
                    {match.objections.map((item, i) => (
                      <div key={i} className="text-sm">
                        <p className="font-medium">&ldquo;{item.objection}&rdquo;</p>
                        <p className="text-muted-foreground">
                          {item.response}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Talking Points</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex list-disc flex-col gap-1 pl-4 text-sm text-muted-foreground">
              {report.talkingPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upsell Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex list-disc flex-col gap-1 pl-4 text-sm text-muted-foreground">
              {report.upsell.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cross-sell Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex list-disc flex-col gap-1 pl-4 text-sm text-muted-foreground">
              {report.crossSell.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
