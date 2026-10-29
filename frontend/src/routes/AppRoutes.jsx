import { Routes, Route, Navigate } from 'react-router-dom'

// layouts
import ClientLayout from '../components/layout/ClientLayout.jsx'
import AuthLayout from '../components/layout/AuthLayout.jsx'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

// client
import Home from '../pages/client/Home.jsx'
import Produtos from '../pages/client/Produtos.jsx'
import ProdutoDetalhe from '../pages/client/ProdutoDetalhe.jsx'
import Carrinho from '../pages/client/Carrinho.jsx'
import CheckoutEndereco from '../pages/client/checkout/CheckoutEndereco.jsx'
import CheckoutPagamento from '../pages/client/checkout/CheckoutPagamento.jsx'
import CheckoutConfirmacao from '../pages/client/checkout/CheckoutConfirmacao.jsx'
import MinhaConta from '../pages/client/conta/MinhaConta.jsx'
import MeusPedidos from '../pages/client/conta/MeusPedidos.jsx'

// auth
import Login from '../pages/auth/Login.jsx'
import Cadastro from '../pages/auth/Cadastro.jsx'
import RecuperarSenha from '../pages/auth/RecuperarSenha.jsx'

// admin
import Dashboard from '../pages/admin/Dashboard.jsx'
import AdminProdutos from '../pages/admin/produtos/AdminProdutos.jsx'
import AdminEstoque from '../pages/admin/estoque/AdminEstoque.jsx'
import AdminPedidos from '../pages/admin/pedidos/AdminPedidos.jsx'

import NotFound from '../pages/NotFound.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- CLIENTE ---------- */}
      <Route element={<ClientLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/produto/:id" element={<ProdutoDetalhe />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/checkout/endereco" element={<CheckoutEndereco />} />
        <Route path="/checkout/pagamento" element={<CheckoutPagamento />} />
        <Route path="/checkout/confirmacao" element={<CheckoutConfirmacao />} />

        {/* rotas que exigem login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/minha-conta" element={<MinhaConta />} />
          <Route path="/meus-pedidos" element={<MeusPedidos />} />
        </Route>
      </Route>

      {/* ---------- AUTH ---------- */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      </Route>

      {/* ---------- ADMIN ---------- */}
      <Route element={<ProtectedRoute requireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="produtos" element={<AdminProdutos />} />
          <Route path="estoque" element={<AdminEstoque />} />
          <Route path="pedidos" element={<AdminPedidos />} />
        </Route>
      </Route>

      <Route path="/verificar-2fa" element={<Verificar2FA />} />

      {/* ---------- 404 ---------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}