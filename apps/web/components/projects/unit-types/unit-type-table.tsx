import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { DirhamSymbol } from "@workspace/ui/components/dirham-symbol"

import { DeleteUnitTypeDialog } from "@/components/projects/unit-types/delete-unit-type-dialog"
import { UnitTypeFormDialog } from "@/components/projects/unit-types/unit-type-form-dialog"
import { formatArea, formatPrice, formatUnitTypeName } from "@/lib/format"
import type { PlainUnitType } from "@/lib/data/serialize"

export function UnitTypeTable({
  projectId,
  unitTypes,
}: {
  projectId: string
  unitTypes: PlainUnitType[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
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
                    <TableCell>{formatArea(unit.size) ?? "—"}</TableCell>
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
