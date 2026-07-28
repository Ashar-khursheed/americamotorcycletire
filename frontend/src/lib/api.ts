import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const fetchSettings = async () => {
  try {
    const res = await api.get('/settings');
    return res.data;
  } catch (err) {
    return {
      site_name: 'BMG CYCLES',
      contact_phone: '408-591-8484',
      contact_email: 'INFO@BMGCYCLE.COM',
      contact_address: '39575 CHERRY ST, FREMONT, CA 94538',
      announcement_bar: 'FREE SHIPPING ON ORDERS OVER $99 | REPAIR & SERVICE SPECIALISTS',
    };
  }
};

export const fetchProducts = async (params?: Record<string, any>) => {
  const res = await api.get('/products', { params });
  return res.data?.data || res.data;
};

export const fetchProductBySlug = async (slug: string) => {
  const res = await api.get(`/products/${slug}`);
  return res.data?.data || res.data;
};

export const fetchCategories = async () => {
  const res = await api.get('/categories');
  return res.data;
};

export const fetchBrands = async () => {
  const res = await api.get('/brands');
  return res.data;
};

export const fetchPageBySlug = async (slug: string) => {
  const res = await api.get(`/pages/${slug}`);
  return res.data;
};

export const placeOrder = async (orderData: any) => {
  const res = await api.post('/orders', orderData);
  return res.data;
};

export const fetchOrderById = async (id: string) => {
  const res = await api.get(`/orders/lookup/${id}`);
  return res.data;
};

// Admin API
export const fetchAdminProducts = async () => {
  const res = await api.get('/admin/products');
  return res.data;
};

export const createAdminProduct = async (productData: any) => {
  const res = await api.post('/admin/products', productData);
  return res.data;
};

export const deleteAdminProduct = async (id: number) => {
  const res = await api.delete(`/admin/products/${id}`);
  return res.data;
};

export const fetchAdminOrders = async () => {
  const res = await api.get('/admin/orders');
  return res.data;
};

export const updateOrderStatus = async (id: number, status: string) => {
  const res = await api.patch(`/admin/orders/${id}/status`, { status });
  return res.data;
};

export const updateSettings = async (settings: any) => {
  const res = await api.post('/admin/settings', settings);
  return res.data;
};

export const saveAdminPage = async (pageData: any) => {
  const res = await api.post('/admin/pages', pageData);
  return res.data;
};
