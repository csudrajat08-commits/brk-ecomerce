import { MotionConfig } from 'motion/react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Layout } from './components/layout/Layout';
import { ShopProvider } from './context/ShopContext';
import HomePage from './pages/HomePage';
import PhaseStubPage from './pages/PhaseStubPage';
import SegmentCatalogPage from './pages/SegmentCatalogPage';
import SegmentHubPage from './pages/SegmentHubPage';
import BagPage from './pages/BagPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import InvoicePage from './pages/InvoicePage';
import AdminPage from './pages/admin/AdminPage';
import ShopPage from './pages/ShopPage';
import CollectionsPage from './pages/CollectionsPage';
import ProductPage from './pages/ProductPage';
import WishlistPage from './pages/WishlistPage';
import WholesalePage from './pages/WholesalePage';
import AboutPage from './pages/AboutPage';
import CarePage from './pages/CarePage';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ShopProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="women" element={<SegmentHubPage key="women" segment="women" />} />
              <Route path="women/:sub" element={<SegmentCatalogPage key="women" segment="women" />} />
              <Route path="men" element={<SegmentHubPage key="men" segment="men" />} />
              <Route path="men/:sub" element={<SegmentCatalogPage key="men" segment="men" />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="shop/:category" element={<ShopPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="product/:slug" element={<ProductPage />} />
              <Route path="bag" element={<BagPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="checkout/confirmation" element={<OrderConfirmationPage />} />
              <Route path="orders/:reference/invoice" element={<InvoicePage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="wholesale" element={<WholesalePage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="account" element={<PhaseStubPage title="Account" />} />
              <Route path="care/:topic" element={<CarePage />} />
              <Route path="*" element={<PhaseStubPage title="Page not found" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ShopProvider>
    </MotionConfig>
  );
}
