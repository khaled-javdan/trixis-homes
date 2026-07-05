import {
  BookOpenIcon,
  FileIcon,
  ImageIcon,
  ReceiptIcon,
  RulerIcon,
  type LucideIcon,
} from "lucide-react"

import { attachmentCategoryValues } from "@workspace/db/validation/attachment"

export type AttachmentCategory = (typeof attachmentCategoryValues)[number]

export const attachmentCategoryMeta: Record<
  AttachmentCategory,
  { label: string; icon: LucideIcon }
> = {
  BROCHURE: { label: "Brochure", icon: BookOpenIcon },
  FLOOR_PLAN: { label: "Floor Plan", icon: RulerIcon },
  IMAGE: { label: "Image", icon: ImageIcon },
  PRICE_LIST: { label: "Price List", icon: ReceiptIcon },
  OTHER: { label: "Other", icon: FileIcon },
}
