import {
  BookOpen,
  CircleHelp,
  Ghost,
  House,
  Mail,
  Menu,
  Crosshair,
  Gamepad2,
  Target,
  Trophy,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ROTAS } from "../../routes/paths";
import { getPageAccent } from "../../theme/pageAccent";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Home", to: ROTAS.home, icon: House },
  { label: "Integrantes", to: ROTAS.integrantes, icon: Users },
  { label: "Sobre", to: ROTAS.sobre, icon: BookOpen },
  { label: "FAQ", to: ROTAS.faq, icon: CircleHelp },
  { label: "Contato", to: ROTAS.contato, icon: Mail },
  { label: "Dashboard", to: ROTAS.dashboard, icon: Target },
  { label: "Ranking", to: ROTAS.ranking, icon: Trophy },
  { label: "Caçadores", to: ROTAS.cacadores, icon: Crosshair },
  { label: "Fantasmas", to: ROTAS.fantasmas, icon: Ghost },
  { label: "Jogar", to: ROTAS.jogar, icon: Gamepad2 },
  { label: "Cardgame", to: ROTAS.cardgame, icon: Gamepad2 },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const accent = getPageAccent(location.pathname);

  function toggleMenu() {
    setMenuOpen((current) => !current);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r ${accent.stripe} shadow-lg transition-colors duration-700`}
    >
      <div className="mx-auto flex w-[92%] max-w-7xl items-center justify-between py-3">
        <NavLink
          to={ROTAS.home}
          end
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2 text-xl font-extrabold tracking-tight text-white"
        >
          <Ghost className="h-7 w-7" strokeWidth={2.2} aria-hidden="true" />
          <span className="neon-text">SoulHunter</span>
        </NavLink>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/30 text-white xl:hidden"
          id="menuToggle"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>

        <nav
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute right-4 top-[64px] z-50 w-60 flex-col gap-1 rounded-2xl border border-white/10 bg-soul-900/95 p-3 shadow-2xl backdrop-blur xl:static xl:flex xl:w-auto xl:flex-row xl:gap-0.5 xl:border-none xl:bg-transparent xl:p-0 xl:shadow-none xl:backdrop-blur-none`}
          id="navMenu"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROTAS.home}
              aria-label={item.label}
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-all duration-300 hover:bg-white/15 hover:text-white xl:px-2.5 xl:text-sm ${
                  isActive ? "bg-white/20 font-bold text-white shadow-inner" : ""
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
