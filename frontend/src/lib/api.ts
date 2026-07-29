import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

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

export const registerCustomer = async (data: { name: string; email: string; password: string; phone?: string }) => {
  const res = await api.post('/customer/register', data);
  return res.data;
};

export const loginCustomer = async (data: { email: string; password: string }) => {
  const res = await api.post('/customer/login', data);
  return res.data;
};

export const fetchCustomerOrders = async (email: string) => {
  const res = await api.get('/customer/orders', { params: { email } });
  return res.data?.orders || res.data || [];
};

// Admin API
export const fetchAdminProducts = async (page: number = 1, search: string = '') => {
  const res = await api.get('/admin/products', { params: { page, search } });
  return res.data;
};

export const fetchAdminProductById = async (id: number | string) => {
  const res = await api.get(`/admin/products/${id}`);
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

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  brand?: string;
  price: number | string;
  compare_at_price?: number | string;
  primary_image?: string;
  gallery_images?: string[];
  description?: string;
  short_description?: string;
  stock_quantity?: number;
  is_active?: boolean;
  fitments?: any[];
  custom_attributes?: any[];
  product_attribute_values?: any[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
}

export interface AvailableFilters {
  brands?: string[];
  categories?: any[];
  attributes?: Array<{
    id: number;
    name: string;
    slug: string;
    values: Array<{ id: number; value: string; label?: string }>;
  }>;
}
