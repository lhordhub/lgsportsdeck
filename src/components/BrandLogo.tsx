interface BrandLogoProps {
  size?: 'sm' | 'lg'
  light?: boolean
}

export default function BrandLogo({ size = 'sm', light = true }: BrandLogoProps) {
  const ball = size === 'lg' ? 'h-12 w-12' : 'h-8 w-8'
  const text = size === 'lg' ? 'text-3xl' : 'text-xl'

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${ball} relative shrink-0 rounded-full bg-brand-gradient shadow-glow animate-bounce-ball`}
      >
        <span className="absolute left-[22%] top-[26%] h-[14%] w-[14%] rounded-full bg-navy-900/40" />
        <span className="absolute left-[56%] top-[22%] h-[14%] w-[14%] rounded-full bg-navy-900/40" />
        <span className="absolute left-[40%] top-[48%] h-[14%] w-[14%] rounded-full bg-navy-900/40" />
        <span className="absolute left-[18%] top-[64%] h-[14%] w-[14%] rounded-full bg-navy-900/40" />
        <span className="absolute left-[64%] top-[60%] h-[14%] w-[14%] rounded-full bg-navy-900/40" />
      </div>
      <span
        className={`${text} font-display font-extrabold tracking-tight ${
          light ? 'text-white' : 'text-navy-900'
        }`}
      >
        LG Sports <span className="text-brand-gradient">Deck</span>
      </span>
    </div>
  )
}