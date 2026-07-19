import { site } from "@/lib/content"
import { WhatsAppIcon } from "@/components/whatsapp-icon"

export function WhatsAppFloat() {
  return (
    <a
      href={site.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with our team on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-[#25D366] py-3 pl-3 pr-4 text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
    >
      <span
        className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/60 [animation-duration:3.5s]"
        aria-hidden
      />
      <WhatsAppIcon className="size-6 shrink-0" />
      <span className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] sm:inline">
        Chat with our team
      </span>
    </a>
  )
}
