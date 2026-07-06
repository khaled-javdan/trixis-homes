"use client"

import * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import { DirhamSymbol } from "@workspace/ui/components/dirham-symbol"

import { DeleteUnitTypeDialog } from "@/components/projects/unit-types/delete-unit-type-dialog"
import { UnitTypeFormDialog } from "@/components/projects/unit-types/unit-type-form-dialog"
import {
  formatAreaInUnit,
  formatPrice,
  formatUnitTypeName,
} from "@/lib/format"
import type { PlainUnitType } from "@/lib/data/serialize"

export function UnitTypeTable({
  projectId,
  unitTypes,
}: {
  projectId: string
  unitTypes: PlainUnitType[]
}) {
  const [areaUnit, setAreaUnit] = React.useState<"ft" | "m">("ft")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-lg border border-border p-0.5">
          <Button
            type="button"
            size="xs"
            variant={areaUnit === "ft" ? "secondary" : "ghost"}
            onClick={() => setAreaUnit("ft")}
          >
            sq ft
          </Button>
          <Button
            type="button"
            size="xs"
            variant={areaUnit === "m" ? "secondary" : "ghost"}
            onClick={() => setAreaUnit("m")}
          >
            sq m
          </Button>
        </div>
        <UnitTypeFormDialog projectId={projectId} />
      </div>

      {unitTypes.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No unit types yet. Add the first one above.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Starting Price</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>BUA</TableHead>
                <TableHead>Plot</TableHead>
                <TableHead>Bed / Bath</TableHead>
                <TableHead>Parking</TableHead>
                <TableHead>Payment Plan</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unitTypes.map((unit) => {
                const label =
                  unit.label?.trim() ||
                  formatUnitTypeName(unit.propertyType, unit.bedrooms)
                return (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{label}</TableCell>
                    <TableCell>{unit.unitCount ?? "—"}</TableCell>
                    <TableCell className="font-semibold text-primary">
                      <span className="flex items-center gap-0.5">
                        <DirhamSymbol />
                        {formatPrice(unit.startingPrice)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatAreaInUnit(unit.size, areaUnit) ?? "—"}
                    </TableCell>
                    <TableCell>
                      {formatAreaInUnit(unit.bua, areaUnit) ?? "—"}
                    </TableCell>
                    <TableCell>
                      {formatAreaInUnit(unit.plotSize, areaUnit) ?? "—"}
                    </TableCell>
                    <TableCell>
                      {unit.bedrooms ?? "-"} / {unit.bathrooms ?? "-"}
                    </TableCell>
                    <TableCell>{unit.parking ?? "—"}</TableCell>
                    <TableCell className="max-w-48 truncate">
                      {unit.paymentPlan ?? "Project default"}
                    </TableCell>
                    <TableCell className="flex justify-end gap-1">
                      <UnitTypeFormDialog projectId={projectId} unit={unit} />
                      <DeleteUnitTypeDialog
                        unitId={unit.id}
                        projectId={projectId}
                        unitLabel={label}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
