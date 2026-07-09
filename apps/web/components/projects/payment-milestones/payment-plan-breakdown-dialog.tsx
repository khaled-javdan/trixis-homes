"use client"

import * as React from "react"
import { CalculatorIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { DirhamSymbol } from "@workspace/ui/components/dirham-symbol"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { formatPrice, formatUnitTypeName } from "@/lib/format"
import {
  computeMilestoneAmount,
  computeMilestoneDurations,
  formatMilestoneDate,
  formatMilestoneDuration,
  groupMilestonesByYear,
  sumMilestonePercentage,
} from "@/lib/payment-milestones"
import type { PlainProject } from "@/lib/data/serialize"

export function PaymentPlanBreakdownDialog({
  project,
  unitTypeId: initialUnitTypeId,
}: {
  project: Pick<
    PlainProject,
    "id" | "name" | "handoverDate" | "unitTypes" | "paymentMilestones"
  >
  unitTypeId?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [unitTypeId, setUnitTypeId] = React.useState<string | undefined>(
    initialUnitTypeId ?? project.unitTypes[0]?.id
  )

  const unit = project.unitTypes.find((u) => u.id === unitTypeId)
  const totalPercentage = sumMilestonePercentage(project.paymentMilestones)
  const durations = computeMilestoneDurations(project.paymentMilestones)
  const yearlyRollup = unit
    ? groupMilestonesByYear(project.paymentMilestones, unit.startingPrice)
    : []

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setUnitTypeId(initialUnitTypeId ?? project.unitTypes[0]?.id)
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="xs" />}>
        <CalculatorIcon /> Breakdown
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Payment Plan Breakdown</DialogTitle>
        </DialogHeader>

        {project.paymentMilestones.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No payment milestones defined yet — add them in the Payment Plan
            section below.
          </p>
        ) : project.unitTypes.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No unit types defined for this project yet — add one to see
            amounts.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <Select
              value={unitTypeId}
              onValueChange={(value) => setUnitTypeId(value ?? undefined)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a unit type" />
              </SelectTrigger>
              <SelectContent>
                {project.unitTypes.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.label?.trim() ||
                      formatUnitTypeName(u.propertyType, u.bedrooms)}{" "}
                    — AED {formatPrice(u.startingPrice)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {unit && (
              <>
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    {unit.label?.trim() ||
                      formatUnitTypeName(unit.propertyType, unit.bedrooms)}
                  </span>
                  <span className="flex items-center gap-0.5 font-semibold text-primary">
                    <DirhamSymbol />
                    {formatPrice(unit.startingPrice)}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead>%</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {project.paymentMilestones.map((milestone, index) => (
                        <TableRow key={milestone.id}>
                          <TableCell className="font-medium">
                            {milestone.label}
                          </TableCell>
                          <TableCell>{milestone.percentage}%</TableCell>
                          <TableCell className="font-semibold text-primary">
                            <span className="flex items-center gap-0.5">
                              <DirhamSymbol />
                              {formatPrice(
                                computeMilestoneAmount(
                                  milestone.percentage,
                                  unit.startingPrice
                                )
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>{formatMilestoneDate(milestone)}</div>
                            {milestone.note && (
                              <div className="text-xs text-muted-foreground">
                                {milestone.note}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {formatMilestoneDuration(durations[index]!)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell className="font-medium">Total</TableCell>
                        <TableCell className="font-medium">
                          {totalPercentage}%
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          <span className="flex items-center gap-0.5">
                            <DirhamSymbol />
                            {formatPrice(
                              computeMilestoneAmount(
                                totalPercentage,
                                unit.startingPrice
                              )
                            )}
                          </span>
                        </TableCell>
                        <TableCell />
                        <TableCell />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {yearlyRollup.map((row) => (
                        <TableRow key={row.year}>
                          <TableCell className="font-medium">
                            {row.year}
                          </TableCell>
                          <TableCell className="font-semibold text-primary">
                            <span className="flex items-center gap-0.5">
                              <DirhamSymbol />
                              {formatPrice(row.amount)}
                            </span>
                          </TableCell>
                          <TableCell>{row.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
