import { createBrowserRouter, type RouteObject } from "react-router-dom";
import App from "../App";
import NotFound from "../pages/NotFound/NotFound";
import Cacadores from "../pages/Cacadores/Cacadores";
import CacadorDetalhe from "../pages/Cacadores/CacadorDetalhe";
import Contato from "../pages/Contato/Contato";
import Dashboard from "../pages/Dashboard/Dashboard";
import Fantasma from "../pages/Fantasma/Fantasma";
import Fantasmas from "../pages/Fantasmas/Fantasmas";
import Faq from "../pages/Faq/Faq";
import Home from "../pages/Home/Home";
import IntegranteDetalhe from "../pages/IntegranteDetalhe/IntegranteDetalhe";
import Integrantes from "../pages/Integrantes/Integrantes";
import Ranking from "../pages/Ranking/Ranking";
import Sobre from "../pages/Sobre/Sobre";
import SoulHunter from "../pages/SoulHunter/SoulHunter";
import { PADROES, ROTAS } from "./paths";

const filhas: RouteObject[] = [
  // Rotas estáticas
  { index: true, element: <Home /> },
  { path: ROTAS.integrantes.slice(1), element: <Integrantes /> },
  { path: ROTAS.sobre.slice(1), element: <Sobre /> },
  { path: ROTAS.faq.slice(1), element: <Faq /> },
  { path: ROTAS.contato.slice(1), element: <Contato /> },
  { path: ROTAS.dashboard.slice(1), element: <Dashboard /> },
  { path: ROTAS.ranking.slice(1), element: <Ranking /> },
  { path: ROTAS.cacadores.slice(1), element: <Cacadores /> },
  { path: ROTAS.fantasmas.slice(1), element: <Fantasmas /> },
  { path: ROTAS.jogar.slice(1), element: <SoulHunter /> },
  { path: ROTAS.fantasma.slice(1), element: <Fantasma /> },

  // Rotas dinâmicas (parâmetro :id)
  { path: PADROES.integrante, element: <IntegranteDetalhe /> },
  { path: PADROES.cacador, element: <CacadorDetalhe /> },

  // Qualquer outro caminho
  { path: "*", element: <NotFound /> },
];

export const router = createBrowserRouter([
  {
    path: ROTAS.home,
    element: <App />,
    errorElement: <NotFound />,
    children: filhas,
  },
]);
