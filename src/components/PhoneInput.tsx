import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const COUNTRY_CODES = [
  { code: "+1", country: "US", flag: "🇺🇸", label: "Estados Unidos" },
  { code: "+1", country: "CA", flag: "🇨🇦", label: "Canadá" },
  { code: "+52", country: "MX", flag: "🇲🇽", label: "México" },
  { code: "+54", country: "AR", flag: "🇦🇷", label: "Argentina" },
  { code: "+55", country: "BR", flag: "🇧🇷", label: "Brasil" },
  { code: "+56", country: "CL", flag: "🇨🇱", label: "Chile" },
  { code: "+57", country: "CO", flag: "🇨🇴", label: "Colombia" },
  { code: "+58", country: "VE", flag: "🇻🇪", label: "Venezuela" },
  { code: "+51", country: "PE", flag: "🇵🇪", label: "Perú" },
  { code: "+53", country: "CU", flag: "🇨🇺", label: "Cuba" },
  { code: "+593", country: "EC", flag: "🇪🇨", label: "Ecuador" },
  { code: "+591", country: "BO", flag: "🇧🇴", label: "Bolivia" },
  { code: "+595", country: "PY", flag: "🇵🇾", label: "Paraguay" },
  { code: "+598", country: "UY", flag: "🇺🇾", label: "Uruguay" },
  { code: "+507", country: "PA", flag: "🇵🇦", label: "Panamá" },
  { code: "+506", country: "CR", flag: "🇨🇷", label: "Costa Rica" },
  { code: "+502", country: "GT", flag: "🇬🇹", label: "Guatemala" },
  { code: "+503", country: "SV", flag: "🇸🇻", label: "El Salvador" },
  { code: "+504", country: "HN", flag: "🇭🇳", label: "Honduras" },
  { code: "+505", country: "NI", flag: "🇳🇮", label: "Nicaragua" },
  { code: "+509", country: "HT", flag: "🇭🇹", label: "Haití" },
  { code: "+1809", country: "DO", flag: "🇩🇴", label: "Rep. Dominicana" },
  { code: "+34", country: "ES", flag: "🇪🇸", label: "España" },
  { code: "+44", country: "GB", flag: "🇬🇧", label: "Reino Unido" },
  { code: "+49", country: "DE", flag: "🇩🇪", label: "Alemania" },
  { code: "+33", country: "FR", flag: "🇫🇷", label: "Francia" },
  { code: "+39", country: "IT", flag: "🇮🇹", label: "Italia" },
  { code: "+351", country: "PT", flag: "🇵🇹", label: "Portugal" },
];

interface PhoneInputProps {
  value: string;
  onChange: (fullPhone: string) => void;
  className?: string;
}

export default function PhoneInput({ value, onChange, className }: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Parse existing value into code + number
  const parseValue = () => {
    if (!value) return { countryCode: "+58", number: "" };
    const match = COUNTRY_CODES.sort((a, b) => b.code.length - a.code.length)
      .find(c => value.startsWith(c.code));
    if (match) return { countryCode: match.code, number: value.slice(match.code.length).trim() };
    return { countryCode: "+58", number: value.replace(/^\+?\d{1,4}\s?/, "") };
  };

  const { countryCode, number } = parseValue();
  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[7]; // default VE

  const filtered = search
    ? COUNTRY_CODES.filter(c =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search) ||
        c.country.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRY_CODES;

  const handleCodeChange = (code: string) => {
    onChange(`${code} ${number}`.trim());
    setOpen(false);
    setSearch("");
  };

  const handleNumberChange = (num: string) => {
    const cleaned = num.replace(/[^\d]/g, "");
    onChange(`${countryCode} ${cleaned}`.trim());
  };

  return (
    <div className={cn("flex gap-1.5", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            type="button"
            className="w-[110px] shrink-0 justify-between px-2 font-normal"
          >
            <span className="flex items-center gap-1.5 text-sm">
              <span className="inline-flex items-center justify-center w-6 h-4 rounded-[3px] bg-muted text-[10px] font-bold text-muted-foreground shrink-0">{selectedCountry.country}</span>
              <span>{countryCode}</span>
            </span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0" align="start">
          <div className="p-2 border-b">
            <Input
              placeholder="Buscar país..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
          </div>
          <ScrollArea className="h-[200px]">
            <div className="p-1">
              {filtered.map((c, i) => (
                <button
                  key={`${c.country}-${i}`}
                  type="button"
                  onClick={() => handleCodeChange(c.code)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    c.code === countryCode && c.country === selectedCountry.country && "bg-accent"
                  )}
                >
                  <span className="inline-flex items-center justify-center w-7 h-5 rounded-[3px] bg-muted text-[10px] font-bold text-muted-foreground shrink-0">{c.country}</span>
                  <span className="flex-1 text-left truncate">{c.label}</span>
                  <span className="text-muted-foreground text-xs">{c.code}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No encontrado</p>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      <Input
        value={number}
        onChange={(e) => handleNumberChange(e.target.value)}
        placeholder="Número de teléfono"
        className="flex-1"
      />
    </div>
  );
}
