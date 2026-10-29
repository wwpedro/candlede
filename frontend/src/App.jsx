import { Routes, Route } from 'react-router-dom'

// layouts
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import AuthLayout from './components/layout/AuthLayout.jsx'
import AccountLayout from './components/layout/AccountLayout.jsx'
import CheckoutLayout from './components/layout/CheckoutLayout.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import ScrollToTop from './components/layout/ScrollToTop.jsx'
import BackToTop from './components/layout/BackToTop.jsx'

// client público
import Home from './pages/client/Home.jsx'
import Produtos from './pages/client/Produtos.jsx'
import ProdutoDetalhe from './pages/client/ProdutoDetalhe.jsx'
import Contato from './pages/client/Contato.jsx'
import Sobre from './pages/client/Sobre.jsx'
import Busca from './pages/client/Busca.jsx'

// client PRIVADO
import Carrinho from './pages/client/Carrinho.jsx'
import MinhaConta from './pages/client/conta/MinhaConta.jsx'
import MeusPedidos from './pages/client/conta/MeusPedidos.jsx'
import DetalhePedido from './pages/client/conta/DetalhePedido.jsx'
import MeusEnderecos from './pages/client/conta/MeusEnderecos.jsx'
import MeusDados from './pages/client/conta/MeusDados.jsx'

// auth
import Login from './pages/auth/Login.jsx'
import Cadastro from './pages/auth/Cadastro.jsx'
import RecuperarSenha from './pages/auth/RecuperarSenha.jsx'
import RedefinirSenha from './pages/auth/RedefinirSenha.jsx'

// checkout
import Checkout from './pages/client/checkout/Checkout.jsx'
import CheckoutPagamento from './pages/client/checkout/CheckoutPagamento.jsx'
import CheckoutConfirmacao from './pages/client/checkout/CheckoutConfirmacao.jsx'
import CheckoutStatus from './pages/client/checkout/CheckoutStatus.jsx'

// admin
import Dashboard from './pages/admin/Dashboard.jsx'
import AdminProdutos from './pages/admin/produtos/AdminProdutos.jsx'
import AdminProdutoForm from './pages/admin/produtos/AdminProdutoForm.jsx'
import AdminCategorias from './pages/admin/produtos/AdminCategorias.jsx'
import AdminPedidos from './pages/admin/pedidos/AdminPedidos.jsx'
import AdminPedidoDetalhe from './pages/admin/pedidos/AdminPedidoDetalhe.jsx'
import AdminEstoque from './pages/admin/estoque/AdminEstoque.jsx'
import AdminEstoqueDetalhe from './pages/admin/estoque/AdminEstoqueDetalhe.jsx'
import AdminBanners from './pages/admin/conteudo/AdminBanners.jsx'
import AdminTextos from './pages/admin/conteudo/AdminTextos.jsx'
import AdminClientes from './pages/admin/clientes/AdminClientes.jsx'
import AdminClienteDetalhe from './pages/admin/clientes/AdminClienteDetalhe.jsx'
import AdminNotFound from './pages/admin/AdminNotFound.jsx'

import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* ================= AUTH ================= */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
        </Route>

        {/* ================= ADMIN ================= */}
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="produtos" element={<AdminProdutos />} />
            <Route path="produtos/novo" element={<AdminProdutoForm />} />
            <Route path="produtos/:id" element={<AdminProdutoForm />} />
            <Route path="categorias" element={<AdminCategorias />} />
            <Route path="estoque" element={<AdminEstoque />} />
            <Route path="estoque/:id" element={<AdminEstoqueDetalhe />} />
            <Route path="pedidos" element={<AdminPedidos />} />
            <Route path="pedidos/:id" element={<AdminPedidoDetalhe />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="textos" element={<AdminTextos />} />
            <Route path="clientes" element={<AdminClientes />} />
            <Route path="clientes/:id" element={<AdminClienteDetalhe />} />
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Route>

        {/* ================= CHECKOUT (logado) ================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<CheckoutLayout />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/pagamento" element={<CheckoutPagamento />} />
            <Route path="/checkout/confirmacao" element={<CheckoutConfirmacao />} />
            <Route path="/checkout/status/:id" element={<CheckoutStatus />} />
          </Route>
        </Route>

        {/* ================= SITE ================= */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <main>
                <Routes>
                  {/* ---------- PÚBLICO ---------- */}
                  <Route path="/" element={<Home />} />
                  <Route path="/produtos" element={<Produtos />} />
                  <Route path="/categorias/:slug" element={<Produtos />} />
                  <Route path="/produto/:id" element={<ProdutoDetalhe />} />
                  <Route path="/contato" element={<Contato />} />
                  <Route path="/sobre" element={<Sobre />} />
                  <Route path="/busca" element={<Busca />} />

                  {/* ---------- PRIVADO (cliente logado) ---------- */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/carrinho" element={<Carrinho />} />

                    <Route element={<AccountLayout />}>
                      <Route path="/minha-conta" element={<MinhaConta />} />
                      <Route path="/minha-conta/enderecos" element={<MeusEnderecos />} />
                      <Route path="/minha-conta/dados" element={<MeusDados />} />
                      <Route path="/meus-pedidos" element={<MeusPedidos />} />
                      <Route path="/meus-pedidos/:id" element={<DetalhePedido />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <BackToTop />
            </>
          }
        />
      </Routes>
    </>
  )
}