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
      contact_address: '3541 YALE WAY FREMONT, FREMONT, CA 94538',
      announcement_bar: 'FREE SHIPPING ON ORDERS OVER $99 | REPAIR & SERVICE SPECIALISTS',
    };
  }
};

export const cleanString = (str?: string | null): string => {
  if (!str) return '';
  return str
    .replace(/[\uFFFD\u00A0]/g, '')
    .replace(/\uFFFD/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const getImageUrl = (url?: string | null): string => {
  if (!url) return 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop';

  let cleanUrl = url.trim();

  // Convert extension to .webp for local storage assets
  cleanUrl = cleanUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, '') || 'http://127.0.0.1:8000';

  if (apiOrigin.includes('127.0.0.1') || apiOrigin.includes('localhost')) {
    cleanUrl = cleanUrl.replace(/^https?:\/\/americaapi\.kaafifoods\.com/, apiOrigin);
  }

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    const relativePath = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    if (!relativePath.startsWith('/storage/')) {
      return `${apiOrigin}/storage${relativePath}`;
    }
    return `${apiOrigin}${relativePath}`;
  }

  return cleanUrl;
};

export const sanitizeProduct = (product: any): any => {
  if (!product || typeof product !== 'object') return product;
  return {
    ...product,
    name: cleanString(product.name),
    short_description: cleanString(product.short_description),
    description: cleanString(product.description),
    primary_image: getImageUrl(product.primary_image),
    gallery_images: Array.isArray(product.gallery_images)
      ? product.gallery_images.map((img: string) => getImageUrl(img))
      : product.gallery_images,
  };
};

export const fetchProducts = async (params?: Record<string, any>) => {
  const res = await api.get('/products', { params });
  const raw = res.data;

  if (raw && raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
    return {
      ...raw,
      ...raw.data,
      data: Array.isArray(raw.data.data) ? raw.data.data.map(sanitizeProduct) : [],
    };
  }

  if (Array.isArray(raw)) {
    return { data: raw.map(sanitizeProduct), current_page: 1, last_page: 1, total: raw.length, per_page: raw.length };
  }

  if (raw && Array.isArray(raw.data)) {
    return {
      ...raw,
      data: raw.data.map(sanitizeProduct),
    };
  }
  return raw;
};

export const fetchProductBySlug = async (slug: string) => {
  const res = await api.get(`/products/${slug}`);
  const data = res.data?.data || res.data;
  return sanitizeProduct(data);
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
export const fetchAdminProducts = async (page: number = 1, search: string = '', sort: string = 'latest') => {
  const res = await api.get('/admin/products', { params: { page, search, sort } });
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

export const convertCatalogImagesToWebp = async () => {
  const res = await api.post('/admin/products/convert-images-webp');
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
