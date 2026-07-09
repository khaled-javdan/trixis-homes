"use client"

import * as React from "react"
import { SparklesIcon, Trash2Icon, UploadCloudIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"

import {
  createPaymentMilestonesFromExtraction,
  extractPaymentMilestones,
} from "@/lib/actions/payment-milestone-import"
import { formatPaymentMilestoneTiming } from "@/lib/format"
import { sumMilestonePercentage } from "@/lib/payment-milestones"
import type { ExtractedPaymentMilestone } from "@workspace/db/validation/payment-milestone"

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function PaymentMilestoneAiImportDialog({
  projectId,
}: {
  projectId: string
}) {
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState<"paste" | "upload">("paste")
  const [text, setText] = React.useState("")
  const [imageDataUrl, setImageDataUrl] = React.useState<string | null>(null)
  const [imageName, setImageName] = React.useState<string | null>(null)
  const [results, setResults] = React.useState<
    ExtractedPaymentMilestone[] | null
  >(null)
  const [extracting, startExtracting] = React.useTransition()
  const [saving, startSaving] = React.useTransition()
  const inputRef = React.useRef<HTMLInputElement>(null)

  function reset() {
    setMode("paste")
    setText("")
    setImageDataUrl(null)
    setImageName(null)
    setResults(null)
  }

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image is too large (max 8MB)")
      return
    }
    setImageDataUrl(await readFileAsDataUrl(file))
    setImageName(file.name)
  }

  function handleExtract() {
    if (!text.trim() && !imageDataUrl) return
    startExtracting(async () => {
      try {
        const extracted = await extractPaymentMilestones({
          text: text.trim() || undefined,
          imageDataUrl: imageDataUrl ?? undefined,
        })
        if (extracted.length === 0) {
          toast.error("Couldn't find a payment plan breakdown in that input")
          return
        }
        setResults(extracted)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to extract"
        )
      }
    })
  }

  function removeResult(index: number) {
    setResults((prev) => (prev ? prev.filter((_, i) => i !== index) : prev))
  }

  function handleSave() {
    if (!results || results.length === 0) return
    startSaving(async () => {
      try {
        await createPaymentMilestonesFromExtraction(
          projectId,
          results.map((milestone) => ({
            label: milestone.label,
            percentage: milestone.percentage,
            timing: milestone.timing,
            offsetMonths: milestone.offsetMonths,
            fixedDate: milestone.fixedDate ? new Date(milestone.fixedDate) : null,
            note: milestone.note ?? "",
          }))
        )
        toast.success(
          `Added ${results.length} milestone${results.length === 1 ? "" : "s"}`
        )
        setOpen(false)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save milestones"
        )
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <SparklesIcon /> Import with AI
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Import Payment Plan with AI</DialogTitle>
        </DialogHeader>

        {!results ? (
          <div className="flex flex-col gap-4">
            <Tabs value={mode} onValueChange={(value) => setMode(value as "paste" | "upload")}>
              <TabsList>
                <TabsTrigger value="paste">Paste Text</TabsTrigger>
                <TabsTrigger value="upload">Upload Image</TabsTrigger>
              </TabsList>
              <TabsContent value="paste" className="pt-3">
                <Textarea
                  autoFocus
                  rows={10}
                  placeholder={
                    "Paste the payment plan breakdown, e.g. \"10% on booking, 60% during construction, 30% on handover\"…"
                  }
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                />
              </TabsContent>
              <TabsContent value="upload" className="pt-3">
                <div
                  onClick={() => inputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      inputRef.current?.click()
                    }
                  }}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
                    "border-border hover:border-muted-foreground/40 hover:bg-muted/40"
                  )}
                >
                  <UploadCloudIcon className="size-6 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {imageName ?? "Click to upload a payment plan screenshot"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, or WEBP — up to 8MB
                  </p>
                  <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => void handleFile(event.target.files?.[0])}
                  />
                </div>
                {imageDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- transient preview of a client-side data URL, not a served asset
                  <img
                    src={imageDataUrl}
                    alt="Payment plan preview"
                    className="mt-3 max-h-48 w-full rounded-lg border border-border object-contain"
                  />
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button
                onClick={handleExtract}
                disabled={extracting || (!text.trim() && !imageDataUrl)}
              >
                <SparklesIcon />
                {extracting ? "Reading…" : "Extract Milestones"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>Timing</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((milestone, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {milestone.label}
                      </TableCell>
                      <TableCell>{milestone.percentage}%</TableCell>
                      <TableCell>
                        {formatPaymentMilestoneTiming(milestone.timing)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remove"
                          onClick={() => removeResult(index)}
                        >
                          <Trash2Icon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <p className="text-xs text-muted-foreground">
              Total: {sumMilestonePercentage(results)}% — review before saving,
              you can edit or delete individual milestones afterward.
            </p>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={reset}>
                Start Over
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || results.length === 0}
              >
                {saving
                  ? "Saving…"
                  : `Add ${results.length} Milestone${results.length === 1 ? "" : "s"}`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
