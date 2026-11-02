/** Classes Tailwind reutilizadas pelos formulários das páginas ligadas à API. */
export const inputBase =
  "w-full rounded-xl border bg-soul-900/60 px-4 py-3 text-white placeholder:text-white/35 transition-all duration-300 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60";

export function inputState(hasError: boolean): string {
  return hasError
    ? "border-rose-400/70 bg-rose-500/5 focus:border-rose-400 focus:ring-rose-400/30"
    : "border-white/15 focus:border-soul-cyan focus:ring-soul-cyan/30";
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
