import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Share2, X as XIcon, MessageCircle, Link2, Check, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ShareButtonProps {
  text: string;
  title?: string;
  className?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "icon";
  iconOnly?: boolean;
}

const SHARE_PLATFORMS = [
  {
    key: "twitter",
    label: "X / Twitter",
    icon: XIcon,
    color: "hover:bg-foreground/10",
    getUrl: (text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    color: "hover:bg-success/10",
    getUrl: (text: string) =>
      `https://wa.me/?text=${encodeURIComponent(text)}`,
  },
  {
    key: "copy",
    label: "Copiar",
    icon: Copy,
    color: "hover:bg-primary/10",
    getUrl: null,
  },
];

export const ShareButton = forwardRef<HTMLDivElement, ShareButtonProps>(({
  text,
  title = "Compartir",
  className = "",
  variant = "ghost",
  size = "sm",
  iconOnly = false,
}, ref) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async (platformKey: string) => {
    const platform = SHARE_PLATFORMS.find((p) => p.key === platformKey);
    if (!platform) return;

    if (platformKey === "copy") {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "¡Copiado!", description: "Texto copiado al portapapeles" });
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    // Try native share on mobile first
    if (navigator.share && platformKey === "native") {
      try {
        await navigator.share({ title, text });
        return;
      } catch {}
    }

    if (platform.getUrl) {
      window.open(platform.getUrl(text), "_blank", "noopener,noreferrer,width=600,height=400");
    }

    setOpen(false);
  };

  const handleMainClick = async () => {
    // On mobile, try native share first
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch {
        // User cancelled or not supported, show manual options
      }
    }
    setOpen(!open);
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        size={size}
        variant={variant}
        onClick={handleMainClick}
        className={className}
      >
        <Share2 className="h-3.5 w-3.5" />
        {!iconOnly && <span className="ml-1.5">Compartir</span>}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            className="absolute bottom-full mb-2 right-0 bg-card border rounded-xl shadow-card-hover p-2 flex gap-1 z-50"
          >
            {SHARE_PLATFORMS.map((platform) => (
              <motion.button
                key={platform.key}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleShare(platform.key)}
                className={`p-2.5 rounded-lg transition-colors ${platform.color}`}
                title={platform.label}
              >
                {platform.key === "copy" && copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <platform.icon className="h-4 w-4 text-foreground" />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ShareButton.displayName = "ShareButton";
