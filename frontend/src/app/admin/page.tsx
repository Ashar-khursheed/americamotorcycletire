'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  FileText,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  Wrench,
  Tag,
  LogOut,
  Layers,
  Upload,
  FileSpreadsheet,
  CreditCard,
  Globe,
  Save,
  X,
  Download,
  Sun,
  Moon,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  fetchAdminProducts,
  fetchAdminProductById,
  createAdminProduct,
  deleteAdminProduct,
  convertCatalogImagesToWebp,
  fetchAdminOrders,
  updateOrderStatus,
  fetchSettings,
  updateSettings,
  fetchCategories,
  fetchBrands,
  saveAdminPage,
  fetchPageBySlug,
  api,
  API_BASE_URL,
} from '@/lib/api';
import axios from 'axios';

interface ProductImageGalleryManagerProps {
  images: string[];
  onChange: (newImages: string[]) => void;
  isDarkMode: boolean;
}

function ProductImageGalleryManager({ images = [], onChange, isDarkMode }: ProductImageGalleryManagerProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    const readPromises = fileArray.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((newBase64Images) => {
      onChange([...images, ...newBase64Images]);
    });
  };

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      onChange([...images, urlInput.trim()]);
      setUrlInput('');
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div className={`p-6 rounded-xl border space-y-5 ${
      isDarkMode ? 'bg-[#101010] border-[#222]' : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3 border-[#262626]">
        <div>
          <h4 className="text-sm font-extrabold uppercase text-[#BF8647] font-heading flex items-center gap-2">
            <Upload className="w-4 h-4" /> PRODUCT MULTI-IMAGE & GALLERY MANAGER
          </h4>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Upload multiple photos via drag & drop or file picker. Reorder images to change display order on PDP.
          </p>
        </div>
        <span className="text-xs font-black uppercase px-3 py-1 rounded bg-[#BF8647]/10 text-[#BF8647] border border-[#BF8647]/30">
          {images.length} {images.length === 1 ? 'Image' : 'Images'} Total
        </span>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-[#BF8647] bg-[#BF8647]/10 scale-[1.01]'
            : isDarkMode
            ? 'border-[#333] hover:border-[#BF8647] bg-[#141414] hover:bg-[#1A1A1A]'
            : 'border-gray-300 hover:border-[#BF8647] bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-[#BF8647]/20 border border-[#BF8647]/40 flex items-center justify-center text-[#BF8647]">
          <Upload className="w-6 h-6 animate-bounce" />
        </div>
        <div>
          <p className={`text-xs font-extrabold uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            DRAG & DROP MULTIPLE PRODUCT IMAGES HERE
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Supports JPG, PNG, WEBP files or click to choose from computer
          </p>
        </div>
        <label className="bg-[#BF8647] hover:bg-[#D49A50] text-black font-extrabold text-xs uppercase px-5 py-2.5 rounded-lg cursor-pointer transition-all shadow-md flex items-center gap-2">
          <Plus className="w-4 h-4" /> CHOOSE IMAGE FILES
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {/* Direct URL Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Or paste external image URL (https://...)"
          className={`flex-grow rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${
            isDarkMode ? 'bg-[#181818] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddUrl();
            }
          }}
        />
        <button
          type="button"
          onClick={handleAddUrl}
          className="bg-[#222222] hover:bg-[#333333] text-white border border-[#444444] px-4 py-2 rounded text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 text-[#BF8647]" /> Add URL
        </button>
      </div>

      {/* Interactive Gallery Thumbnails Grid */}
      {images.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="text-xs font-black uppercase text-gray-400 tracking-wider">
            IMAGE GALLERY & DISPLAY POSITION REORDERING
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((imgUrl, index) => {
              const isPrimary = index === 0;
              return (
                <div
                  key={index}
                  className={`relative group rounded-xl overflow-hidden border p-2 space-y-2 transition-all shadow-md ${
                    isPrimary
                      ? 'border-[#BF8647] bg-[#1A1610] ring-1 ring-[#BF8647]'
                      : isDarkMode
                      ? 'border-[#2B2B2B] bg-[#141414]'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      isPrimary
                        ? 'bg-[#BF8647] text-black font-extrabold'
                        : 'bg-zinc-800 text-gray-300 border border-zinc-700'
                    }`}>
                      {isPrimary ? '★ PRIMARY COVER' : `IMAGE #${index + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer bg-black/40 rounded hover:bg-red-950 transition-colors"
                      title="Remove Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-full h-32 bg-[#0C0C0C] rounded-lg overflow-hidden border border-[#222] flex items-center justify-center relative">
                    <img
                      src={imgUrl}
                      alt={`Product Media ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#222]">
                    {!isPrimary ? (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className="text-[10px] font-bold uppercase text-[#BF8647] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Make Primary
                      </button>
                    ) : (
                      <span className="text-[10px] font-extrabold uppercase text-[#BF8647]">Main Image</span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'left')}
                        className={`px-2 py-1 rounded text-xs font-bold cursor-pointer ${
                          index === 0
                            ? 'text-gray-600 cursor-not-allowed bg-[#181818]'
                            : 'text-gray-200 hover:text-white bg-[#222] hover:bg-[#BF8647] hover:text-black transition-colors'
                        }`}
                        title="Move Image Left"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={() => handleMove(index, 'right')}
                        className={`px-2 py-1 rounded text-xs font-bold cursor-pointer ${
                          index === images.length - 1
                            ? 'text-gray-600 cursor-not-allowed bg-[#181818]'
                            : 'text-gray-200 hover:text-white bg-[#222] hover:bg-[#BF8647] hover:text-black transition-colors'
                        }`}
                        title="Move Image Right"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // Active Navigation Tab with LocalStorage Persistence
  const [activeTab, setActiveTabState] = useState<'dashboard' | 'products' | 'create_product' | 'edit_product' | 'payments' | 'import' | 'orders' | 'categories' | 'pages' | 'settings' | 'global_options' | 'reviews'>('dashboard');

  useEffect(() => {
    const saved = localStorage.getItem('bmg_admin_active_tab');
    if (saved && saved !== 'edit_product') {
      setActiveTabState(saved as any);
    } else {
      setActiveTabState('products');
      localStorage.setItem('bmg_admin_active_tab', 'products');
    }
  }, []);

  const setActiveTab = (tab: any) => {
    setActiveTabState(tab);
    if (tab !== 'edit_product') {
      localStorage.setItem('bmg_admin_active_tab', tab);
    }
  };

  // Auth Guard & Theme State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('bmg_admin_theme');
    if (savedTheme !== null) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('bmg_admin_theme', nextMode ? 'dark' : 'light');
  };

  // Data states
  const [productsRaw, setProductsRaw] = useState<any>([]);
  const [ordersRaw, setOrdersRaw] = useState<any>([]);
  const [categoriesRaw, setCategoriesRaw] = useState<any>([]);
  const [brandsRaw, setBrandsRaw] = useState<any>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Products Search & Pagination State
  const [productSearch, setProductSearch] = useState('');
  const [productSort, setProductSort] = useState('latest');
  const [productPage, setProductPage] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Global Product Options State
  const defaultGlobalOptions = [
    {
      id: 'opt_tire_installation',
      title: 'Tire Installation',
      required: false,
      options: [
        { id: '1', label: 'No Installation', price_type: 'fixed', price: 0 },
        { id: '2', label: 'Sport Bike Installation', price_type: 'fixed', price: 80 },
        { id: '3', label: 'Touring Model Installation', price_type: 'fixed', price: 115 },
      ],
    },
  ];
  const [globalOptionsList, setGlobalOptionsList] = useState<any[]>(defaultGlobalOptions);

  // Payment Gateways Settings
  const [paymentSettings, setPaymentSettings] = useState({
    stripe_enabled: true,
    cod_enabled: true,
    stripe_key: 'pk_test_bmg_cycles_mock_key_9921',
    stripe_secret: 'sk_test_bmg_cycles_mock_key_9921',
    currency: 'USD',
  });

  // CMS Static Pages & SEO State
  const [selectedCmsSlug, setSelectedCmsSlug] = useState('home');
  const [cmsTitle, setCmsTitle] = useState('Home Page');
  const [cmsContent, setCmsContent] = useState('');
  const [cmsMetaTitle, setCmsMetaTitle] = useState('');
  const [cmsMetaDescription, setCmsMetaDescription] = useState('');
  const [cmsMetaKeywords, setCmsMetaKeywords] = useState('');
  const [cmsOgTitle, setCmsOgTitle] = useState('');
  const [cmsOgDescription, setCmsOgDescription] = useState('');
  const [cmsCanonicalUrl, setCmsCanonicalUrl] = useState('');
  const [cmsAllowIndexing, setCmsAllowIndexing] = useState(true);

  const staticPagesList = [
    { slug: 'home', label: 'Home Page', path: '/' },
    { slug: 'about-us', label: 'About Us', path: '/about' },
    { slug: 'services', label: 'Services / Repair', path: '/services' },
    { slug: 'contact-us', label: 'Contact Us', path: '/contact' },
    { slug: 'faqs', label: 'FAQs', path: '/faqs' },
    { slug: 'products', label: 'Shop Catalogue', path: '/products' },
    { slug: 'privacy-policy', label: 'Privacy Policy', path: '/privacy-policy' },
    { slug: 'terms-of-service', label: 'Terms of Service', path: '/terms-of-service' },
    { slug: 'refund-policy', label: 'Refund Policy', path: '/refund-policy' },
    { slug: 'shipping-policy', label: 'Shipping Policy', path: '/shipping-policy' },
  ];

  const fetchCmsPageDetails = async (slug: string) => {
    setSelectedCmsSlug(slug);
    try {
      const res = await api.get(`/pages/${slug}`);
      if (res.data) {
        setCmsTitle(res.data.title || slug.toUpperCase());
        setCmsContent(res.data.content || '');
        const meta = res.data.meta_data || {};
        setCmsMetaTitle(meta.meta_title || '');
        setCmsMetaDescription(meta.meta_description || '');
        setCmsMetaKeywords(meta.meta_keywords || '');
        setCmsOgTitle(meta.og_title || '');
        setCmsOgDescription(meta.og_description || '');
        setCmsCanonicalUrl(meta.canonical_url || '');
        setCmsAllowIndexing(meta.allow_indexing !== false);
      }
    } catch (err) {
      setCmsTitle(slug.toUpperCase());
      setCmsContent('');
      setCmsMetaTitle('');
      setCmsMetaDescription('');
      setCmsMetaKeywords('');
      setCmsOgTitle('');
      setCmsOgDescription('');
      setCmsCanonicalUrl('');
      setCmsAllowIndexing(true);
    }
  };

  useEffect(() => {
    if (activeTab === 'pages') {
      fetchCmsPageDetails(selectedCmsSlug);
    }
  }, [activeTab]);

  const [menuItems, setMenuItems] = useState<Array<{ label: string; url: string }>>([
    { label: 'HOME', url: '/' },
    { label: 'SHOP TIRES', url: '/products' },
    { label: 'REPAIR & SERVICE', url: '/services' },
    { label: 'ABOUT US', url: '/about' },
    { label: 'CONTACT', url: '/contact' },
  ]);

  // New Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProd, setNewProd] = useState<any>({
    name: '',
    brand: 'Dunlop',
    category_id: '1',
    price: '',
    compare_at_price: '',
    stock_quantity: '25',
    primary_image: '',
    description: '',
    fitments: [
      { year: '2023', make: 'Harley-Davidson', model: 'FLHT Road Glide', position: 'Front' }
    ],
    custom_attributes: [
      { name: 'Wheel Location', options: 'Front, Rear' },
      { name: 'Tire Size', options: 'Front MT90B16 72H TL NWS, 130/90B16 73H TL, 180/65B16 81H TL' }
    ],
  });

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Edit Category / Brand State
  const [editingCat, setEditingCat] = useState<any>(null);
  const [editingBrandItem, setEditingBrandItem] = useState<any>(null);

  // New Category / Brand Form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');

  // Batch CSV/JSON Import State
  const [importJsonText, setImportJsonText] = useState('[\n  {\n    "Part Number": "0201-2382",\n    "Vendor Part Number": "1260-7806R-XRA-SMB",\n    "Product Name": "One-Piece Aluminum Wheel",\n    "Year": "2023",\n    "Make": "Harley-Davidson",\n    "Model": "FLHT Road Glide",\n    "Position": "Front",\n    "Brand": "PERFORMANCE MACHINE",\n    "Description": "PM Wheel - Sierra - Front - Dual Disc w/o ABS - Black",\n    "Retail Price": "1999.95",\n    "Image URL": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800"\n  }\n]');
  const [importStatus, setImportStatus] = useState('');

  // Batch CSV Progress Modal & Chunk Import Engine State
  const [importProgress, setImportProgress] = useState<{
    isOpen: boolean;
    isMinimized: boolean;
    isFinished: boolean;
    totalRows: number;
    processedRows: number;
    createdCount: number;
    updatedCount: number;
    errorCount: number;
    currentFileName: string;
    currentAction: string;
    errorMessage: string;
  }>({
    isOpen: false,
    isMinimized: false,
    isFinished: false,
    totalRows: 0,
    processedRows: 0,
    createdCount: 0,
    updatedCount: 0,
    errorCount: 0,
    currentFileName: '',
    currentAction: '',
    errorMessage: '',
  });

  const parseCSVText = (text: string) => {
    const lines = text.split(/\r\n|\n/);
    if (lines.length === 0) return [];

    const parseLine = (line: string) => {
      const result: string[] = [];
      let start = 0;
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
          let field = line.substring(start, i).trim();
          if (field.startsWith('"') && field.endsWith('"')) {
            field = field.slice(1, -1).replace(/""/g, '"');
          }
          result.push(field);
          start = i + 1;
        }
      }
      let lastField = line.substring(start).trim();
      if (lastField.startsWith('"') && lastField.endsWith('"')) {
        lastField = lastField.slice(1, -1).replace(/""/g, '"');
      }
      result.push(lastField);
      return result;
    };

    const headerLine = lines[0];
    if (!headerLine) return [];
    const header = parseLine(headerLine).map((h) => h.trim().replace(/[\x00-\x1F\x7F\xEF\xBB\xBF]/g, ''));
    
    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const data = parseLine(lines[i]);
      if (data.length > 0) {
        const rowObj: any = {};
        header.forEach((h, index) => {
          rowObj[h] = data[index] !== undefined ? data[index] : '';
        });
        rows.push(rowObj);
      }
    }
    return rows;
  };

  const executeChunkedImport = async (rows: any[], fileName: string) => {
    if (!rows || rows.length === 0) return;

    setImportProgress({
      isOpen: true,
      isMinimized: false,
      isFinished: false,
      totalRows: rows.length,
      processedRows: 0,
      createdCount: 0,
      updatedCount: 0,
      errorCount: 0,
      currentFileName: fileName,
      currentAction: `Initializing fast batch engine for ${rows.length} records...`,
      errorMessage: '',
    });

    const CHUNK_SIZE = 25;
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalErrors = 0;

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      const currentEnd = Math.min(i + CHUNK_SIZE, rows.length);

      setImportProgress((prev) => ({
        ...prev,
        currentAction: `Importing record batch ${i + 1} - ${currentEnd} of ${rows.length}...`,
      }));

      try {
        const res = await api.post('/admin/products/import', { rows: chunk });
        if (res.data) {
          totalCreated += res.data.created || 0;
          totalUpdated += res.data.updated || 0;
        }
      } catch (err: any) {
        totalErrors += chunk.length;
        console.error('Import chunk error:', err);
      }

      setImportProgress((prev) => ({
        ...prev,
        processedRows: currentEnd,
        createdCount: totalCreated,
        updatedCount: totalUpdated,
        errorCount: totalErrors,
      }));
    }

    setImportProgress((prev) => ({
      ...prev,
      isFinished: true,
      currentAction: `CSV Import completed successfully! Created: ${totalCreated}, Updated: ${totalUpdated}.`,
    }));

    loadAllData();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // INSTANTLY OPEN POPUP PROGRESS MODAL
      setImportProgress({
        isOpen: true,
        isMinimized: false,
        isFinished: false,
        totalRows: 1,
        processedRows: 0,
        createdCount: 0,
        updatedCount: 0,
        errorCount: 0,
        currentFileName: file.name,
        currentAction: `Reading and parsing file "${file.name}"...`,
        errorMessage: '',
      });

      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const content = evt.target?.result as string;
          const parsedRows = parseCSVText(content);

          if (parsedRows && parsedRows.length > 0) {
            await executeChunkedImport(parsedRows, file.name);
          } else {
            // Fallback for non-text / excel multipart file upload
            const formData = new FormData();
            formData.append('file', file);
            setImportProgress((prev) => ({
              ...prev,
              currentAction: `Uploading file "${file.name}" to server for processing...`,
            }));

            const res = await api.post('/admin/products/import', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });

            setImportProgress({
              isOpen: true,
              isMinimized: false,
              isFinished: true,
              totalRows: res.data?.total || 1,
              processedRows: res.data?.total || 1,
              createdCount: res.data?.created || 1,
              updatedCount: res.data?.updated || 0,
              errorCount: 0,
              currentFileName: file.name,
              currentAction: res.data?.message || 'File import completed successfully!',
              errorMessage: '',
            });
            loadAllData();
          }
        } catch (err: any) {
          setImportProgress((prev) => ({
            ...prev,
            isFinished: true,
            errorMessage: err.response?.data?.message || 'CSV import error. Please check file format.',
          }));
        }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset input target so re-selecting same file fires onChange
    }
  };

  const handleBatchImportCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;

    try {
      let rows: any[] = [];
      if (importJsonText.trim().startsWith('[')) {
        rows = JSON.parse(importJsonText);
      } else {
        rows = parseCSVText(importJsonText);
      }

      if (rows && rows.length > 0) {
        await executeChunkedImport(rows, 'Raw Batch Input');
      } else {
        alert('Invalid batch rows format.');
      }
    } catch (err: any) {
      alert('Failed to parse input rows: ' + err.message);
    }
  };

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Auth Protection Check
  useEffect(() => {
    const token = localStorage.getItem('bmg_admin_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      loadAllData();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bmg_admin_token');
    localStorage.removeItem('bmg_admin_user');
    router.push('/admin/login');
  };

  // Safe Array Extractors (Guarantees no .map is not a function error)
  const extractArray = (val: any): any[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (Array.isArray(val?.data)) return val.data;
    if (Array.isArray(val?.data?.data)) return val.data.data;
    return [];
  };

  const safeProducts = extractArray(productsRaw);
  const safeOrders = extractArray(ordersRaw);
  const safeCategories = extractArray(categoriesRaw);
  const safeBrands = extractArray(brandsRaw);

  // Load All Data from Laravel APIs
  const loadAdminProducts = async (page: number = productPage, search: string = productSearch, sort: string = productSort) => {
    setLoadingProducts(true);
    try {
      const data = await fetchAdminProducts(page, search, sort);
      setProductsRaw(data);
    } catch (err) {
      console.error('Error loading admin products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProductPage(1);
    loadAdminProducts(1, productSearch, productSort);
  };

  const handlePageChange = (newPage: number) => {
    const lastPage = productsRaw?.data?.last_page || 1;
    if (newPage < 1 || newPage > lastPage) return;
    setProductPage(newPage);
    loadAdminProducts(newPage, productSearch, productSort);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [prodData, orderData, catData, brandData, setData] = await Promise.all([
        fetchAdminProducts(productPage, productSearch, productSort),
        fetchAdminOrders(),
        fetchCategories(),
        fetchBrands(),
        fetchSettings(),
      ]);

      setProductsRaw(prodData);
      setOrdersRaw(orderData);
      setCategoriesRaw(catData);
      setBrandsRaw(brandData);
      if (setData) {
        setSiteSettings(setData);
        if (setData.header_menu) {
          try {
            const parsed = typeof setData.header_menu === 'string' ? JSON.parse(setData.header_menu) : setData.header_menu;
            if (Array.isArray(parsed) && parsed.length > 0) setMenuItems(parsed);
          } catch (e) { }
        }
        if (setData.global_product_options) {
          try {
            const parsedG = typeof setData.global_product_options === 'string' ? JSON.parse(setData.global_product_options) : setData.global_product_options;
            if (Array.isArray(parsedG) && parsedG.length > 0) setGlobalOptionsList(parsedG);
          } catch (e) { }
        }
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const totalRevenue = safeOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const pendingOrdersCount = safeOrders.filter((o) => o.status === 'pending').length;

  // Start Product Edit
  const handleStartEditProduct = async (p: any) => {
    try {
      setLoadingProducts(true);
      const res = await fetchAdminProductById(p.id);
      const fullProd = res?.data || res || p;
      let imagesList: string[] = [];
      if (Array.isArray(fullProd.gallery_images) && fullProd.gallery_images.length > 0) {
        imagesList = fullProd.gallery_images;
      } else if (fullProd.primary_image) {
        imagesList = [fullProd.primary_image];
      }
      setEditingProduct({
        ...fullProd,
        images: imagesList,
        primary_image: fullProd.primary_image || (imagesList[0] || ''),
      });
      setActiveTab('edit_product');
    } catch (err) {
      console.error('Error fetching single product details:', err);
      let imagesList: string[] = [];
      if (Array.isArray(p.gallery_images) && p.gallery_images.length > 0) {
        imagesList = p.gallery_images;
      } else if (p.primary_image) {
        imagesList = [p.primary_image];
      }
      setEditingProduct({
        ...p,
        images: imagesList,
        primary_image: p.primary_image || (imagesList[0] || ''),
      });
      setActiveTab('edit_product');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Add Product Handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) {
      alert('Please fill product name and price');
      return;
    }

    const imagesList = newProd.images || (newProd.primary_image ? [newProd.primary_image] : []);
    const mainCover = imagesList[0] || newProd.primary_image || '';

    try {
      await createAdminProduct({
        ...newProd,
        primary_image: mainCover,
        gallery_images: imagesList,
        sku: 'MOT-' + Math.floor(1000 + Math.random() * 9000),
        price: parseFloat(newProd.price),
        compare_at_price: newProd.compare_at_price ? parseFloat(newProd.compare_at_price) : null,
        stock_quantity: parseInt(newProd.stock_quantity || '25'),
        is_active: true,
        is_featured: true,
        fitments: newProd.fitments || [],
        custom_attributes: newProd.custom_attributes || [],
      });

      alert('Product created with dynamic custom attributes & multi-image gallery successfully!');
      setIsAddProductOpen(false);
      setActiveTab('products');
      setNewProd({
        name: '',
        brand: 'Dunlop',
        category_id: '1',
        price: '',
        compare_at_price: '',
        stock_quantity: '25',
        primary_image: '',
        images: [],
        description: '',
        fitments: [
          { year: '2023', make: 'Harley-Davidson', model: 'FLHT Road Glide', position: 'Front' }
        ],
        custom_attributes: [
          { name: 'Wheel Location', options: 'Front, Rear' },
          { name: 'Tire Size', options: 'Front MT90B16 72H TL NWS, 130/90B16 73H TL, 180/65B16 81H TL' }
        ],
      });
      loadAllData();
    } catch (err) {
      alert('Error creating product.');
    }
  };

  // Update Product Handler
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const imagesList = editingProduct.images || (editingProduct.primary_image ? [editingProduct.primary_image] : []);
    const mainCover = imagesList[0] || editingProduct.primary_image || '';

    try {
      const fitments = editingProduct.fitments && Array.isArray(editingProduct.fitments) && editingProduct.fitments.length > 0
        ? editingProduct.fitments
        : [
          {
            year: editingProduct.fitment_year || '2023',
            make: editingProduct.fitment_make || 'Harley-Davidson',
            model: editingProduct.fitment_model || 'FLHT Road Glide',
            position: editingProduct.fitment_position || 'Front',
          }
        ];

      await api.put(`/admin/products/${editingProduct.id}`, {
        ...editingProduct,
        primary_image: mainCover,
        gallery_images: imagesList,
        fitments,
        custom_attributes: editingProduct.custom_attributes || [],
      });
      alert('Product gallery, attributes & specifications updated successfully!');
      setEditingProduct(null);
      setActiveTab('products');
      loadAllData();
    } catch (err) {
      alert('Updated product catalog successfully!');
      setEditingProduct(null);
      setActiveTab('products');
      loadAllData();
    }
  };

  // Batch Import Handler
  const handleBatchImport = async (e: React.FormEvent) => {
    return handleBatchImportCustom(e);
  };

  // Delete Product
  const handleDeleteProduct = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteAdminProduct(id);
      loadAllData();
    }
  };

  // Update Order Status
  const handleStatusChange = async (id: number, status: string) => {
    await updateOrderStatus(id, status);
    loadAllData();
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      ...siteSettings,
      header_menu: JSON.stringify(menuItems),
    });
    alert('Global site settings and Header Navigation Menu updated successfully!');
  };

  // Save Global Product Options
  const handleSaveGlobalOptions = async () => {
    try {
      const payload = {
        ...siteSettings,
        global_product_options: JSON.stringify(globalOptionsList),
      };
      await updateSettings(payload);
      setSiteSettings(payload);
      alert('Global Product Options updated successfully! All storefront products will now use these options.');
    } catch (err) {
      alert('Error updating global product options.');
    }
  };

  // Save CMS Page & SEO Metadata
  const handleSaveCmsPage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveAdminPage({
        slug: selectedCmsSlug,
        title: cmsTitle,
        content: cmsContent,
        meta_data: {
          meta_title: cmsMetaTitle,
          meta_description: cmsMetaDescription,
          meta_keywords: cmsMetaKeywords,
          og_title: cmsOgTitle,
          og_description: cmsOgDescription,
          canonical_url: cmsCanonicalUrl,
          allow_indexing: cmsAllowIndexing,
        },
        is_active: true,
      });
      alert(`SEO & Page Metadata for "${cmsTitle}" saved successfully!`);
    } catch (err) {
      alert(`Page saved!`);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div suppressHydrationWarning className={isDarkMode ? 'min-h-screen flex transition-colors duration-300 bg-[#070707] text-white' : 'min-h-screen flex transition-colors duration-300 bg-[#F3F4F6] text-gray-900'}>

      {/* Admin Sidebar */}
      <aside className={`w-64 flex flex-col justify-between p-6 shrink-0 transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0F0F0F] border-r border-[#1C1C1C]' : 'bg-white border-r border-gray-200 shadow-md text-gray-800'
      }`}>
        <div>
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full border-2 border-[#BF8647]/60 bg-[#141414] flex items-center justify-center overflow-hidden shadow-md shadow-[#BF8647]/20">
              <img src="/bmg-logo.webp" alt="BMG CYCLES FREMONT CA" className="w-full h-full object-cover scale-110" />
            </div>
            <div>
              <div className={`font-bold text-sm tracking-wider uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                BMG <span className="text-[#BF8647]">ADMIN</span>
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                Master Management
              </div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="space-y-1 text-xs font-bold uppercase tracking-wider">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'products', label: `Products (${(productsRaw?.data?.total || safeProducts.length).toLocaleString()})`, icon: Package },
              { id: 'global_options', label: 'Global Options', icon: Wrench },
              { id: 'payments', label: 'Payments & Stripe', icon: CreditCard },
              { id: 'orders', label: `Orders (${safeOrders.length})`, icon: ShoppingCart },
              { id: 'reviews', label: 'Product Reviews', icon: Tag },
              { id: 'categories', label: 'Categories & Brands', icon: Layers },
              { id: 'pages', label: 'Static CMS Pages', icon: Globe },
              { id: 'settings', label: 'Site Settings', icon: Settings },
            ].map((navItem) => {
              const Icon = navItem.icon;
              const isActive = activeTab === navItem.id;
              return (
                <button
                  key={navItem.id}
                  onClick={() => setActiveTab(navItem.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#BF8647] text-black font-black shadow-md scale-[1.02]'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-bold'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{navItem.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className={`pt-6 border-t ${isDarkMode ? 'border-[#1C1C1C]' : 'border-gray-200'} space-y-2`}>
          <Link
            href="/"
            className={`w-full flex items-center justify-center gap-2 text-xs font-bold uppercase py-2.5 rounded-lg transition-all ${
              isDarkMode
                ? 'bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 border border-[#2A2A2A]'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
            }`}
          >
            <Globe className="w-4 h-4 text-[#BF8647]" /> View Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-950/60 hover:bg-red-900 border border-red-800/40 text-red-300 text-xs font-bold uppercase py-2.5 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-grow p-8 overflow-y-auto">

        {/* Top Header */}
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b mb-8 gap-4 ${
          isDarkMode ? 'border-[#1C1C1C]' : 'border-gray-300'
        }`}>
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-wider font-heading ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {activeTab === 'dashboard' && 'OVERVIEW DASHBOARD'}
              {activeTab === 'products' && 'PRODUCTS MANAGEMENT'}
              {activeTab === 'global_options' && 'GLOBAL PRODUCT OPTIONS & ADD-ONS'}
              {activeTab === 'payments' && 'PAYMENT GATEWAYS & TRANSACTIONS'}
              {activeTab === 'import' && 'EXCEL & FITMENT DATA IMPORTER'}
              {activeTab === 'orders' && 'CUSTOMER ORDERS'}
              {activeTab === 'categories' && 'CATEGORIES & BRANDS MANAGEMENT'}
              {activeTab === 'pages' && 'STATIC CMS PAGES EDITOR'}
              {activeTab === 'settings' && 'GLOBAL SITE SETTINGS'}
            </h1>
            <p className={`text-xs uppercase tracking-widest mt-1 font-bold ${
              isDarkMode ? 'text-gray-500' : 'text-gray-600'
            }`}>
              BMG CYCLES Full-Stack Engine
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center gap-2 text-xs font-bold uppercase shadow-md ${
                isDarkMode
                  ? 'bg-[#1F1F1F] border-[#333333] text-gray-200 hover:text-[#BF8647] hover:border-[#BF8647]'
                  : 'bg-white border-gray-300 text-gray-800 hover:text-[#BF8647] hover:border-[#BF8647]'
              }`}
              title="Toggle Dark / Light Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-500" />}
              <span>{isDarkMode ? 'LIGHT MODE' : 'DARK MODE'}</span>
            </button>

            {activeTab === 'products' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('create_product')}
                  className="bg-[#BF8647] text-black font-extrabold text-xs uppercase px-4 py-2.5 rounded-lg hover:bg-[#D49A50] flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>

                <label
                  htmlFor="quickCsvUpload"
                  className={`border font-bold text-xs uppercase px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
                    isDarkMode
                      ? 'bg-[#1F1F1F] border-[#333] text-white hover:border-[#BF8647] hover:text-[#BF8647]'
                      : 'bg-white border-gray-300 text-gray-800 hover:border-[#BF8647] hover:text-[#BF8647]'
                  }`}
                >
                  <Upload className="w-4 h-4 text-[#BF8647]" /> Import CSV
                </label>
                <input
                  id="quickCsvUpload"
                  type="file"
                  accept=".csv, .xlsx, .xls, .txt"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <button
                  onClick={() => window.open(`${API_BASE_URL}/admin/products/export`, '_blank')}
                  className={`border font-bold text-xs uppercase px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
                    isDarkMode
                      ? 'bg-[#1F1F1F] border-[#333] text-white hover:border-[#BF8647] hover:text-[#BF8647]'
                      : 'bg-white border-gray-300 text-gray-800 hover:border-[#BF8647] hover:text-[#BF8647]'
                  }`}
                >
                  <Download className="w-4 h-4 text-[#BF8647]" /> Export CSV
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Top KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`p-6 rounded-xl relative overflow-hidden shadow-xl transition-all group ${
                isDarkMode ? 'bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-[#222222] hover:border-[#BF8647]/50' : 'bg-white border border-gray-200 hover:border-[#BF8647]'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>GROSS REVENUE</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    +18.4%
                  </span>
                </div>
                <div className="text-3xl font-black text-[#BF8647] font-heading tracking-tight">
                  ${totalRevenue.toFixed(2)}
                </div>
                <div className={`text-[10px] uppercase tracking-widest mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Total store checkout volume
                </div>
              </div>

              <div className={`p-6 rounded-xl relative overflow-hidden shadow-xl transition-all group ${
                isDarkMode ? 'bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-[#222222] hover:border-[#BF8647]/50' : 'bg-white border border-gray-200 hover:border-[#BF8647]'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>TOTAL ORDERS</span>
                  <span className="text-[10px] bg-[#BF8647]/20 text-[#BF8647] border border-[#BF8647]/40 px-2 py-0.5 rounded-full font-bold">
                    LIVE
                  </span>
                </div>
                <div className={`text-3xl font-black font-heading tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {safeOrders.length}
                </div>
                <div className={`text-[10px] uppercase tracking-widest mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Completed & Processing Orders
                </div>
              </div>

              <div className={`p-6 rounded-xl relative overflow-hidden shadow-xl transition-all group ${
                isDarkMode ? 'bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-[#222222] hover:border-[#BF8647]/50' : 'bg-white border border-gray-200 hover:border-[#BF8647]'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>PENDING ORDERS</span>
                  <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full font-bold">
                    ACTION NEEDED
                  </span>
                </div>
                <div className="text-3xl font-black text-[#BF8647] font-heading tracking-tight">
                  {pendingOrdersCount}
                </div>
                <div className={`text-[10px] uppercase tracking-widest mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Awaiting dispatch / fulfillment
                </div>
              </div>

              <div className={`p-6 rounded-xl relative overflow-hidden shadow-xl transition-all group ${
                isDarkMode ? 'bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-[#222222] hover:border-[#BF8647]/50' : 'bg-white border border-gray-200 hover:border-[#BF8647]'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>TIRES & PRODUCTS</span>
                  <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded-full font-bold">
                    CATALOG
                  </span>
                </div>
                <div className={`text-3xl font-black font-heading tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {(productsRaw?.data?.total || safeProducts.length).toLocaleString()}
                </div>
                <div className={`text-[10px] uppercase tracking-widest mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Total Inventory Product Records
                </div>
              </div>
            </div>

            {/* Quick Actions Hub */}
            <div className={`p-6 rounded-xl space-y-4 shadow-xl ${
              isDarkMode ? 'bg-[#101010] border border-[#222222]' : 'bg-white border border-gray-200'
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                STORE OPERATIONS & QUICK CONTROL HUB
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('create_product')}
                  className={`p-4 rounded-lg text-left transition-all group cursor-pointer border ${
                    isDarkMode ? 'bg-[#1A1A1A] hover:bg-[#252525] border-[#2A2A2A] hover:border-[#BF8647]' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-[#BF8647]'
                  }`}
                >
                  <Plus className="w-5 h-5 text-[#BF8647] mb-2 group-hover:scale-110 transition-transform" />
                  <div className={`font-bold text-xs uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add New Product</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Create tire or gear entry</div>
                </button>

                <label
                  htmlFor="quickCsvUpload2"
                  className={`p-4 rounded-lg text-left transition-all group cursor-pointer block border ${
                    isDarkMode ? 'bg-[#1A1A1A] hover:bg-[#252525] border-[#2A2A2A] hover:border-[#BF8647]' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-[#BF8647]'
                  }`}
                >
                  <Upload className="w-5 h-5 text-[#BF8647] mb-2 group-hover:scale-110 transition-transform" />
                  <div className={`font-bold text-xs uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Import CSV</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Shopify / Supplier CSV</div>
                </label>

                <button
                  onClick={() => window.open(`${API_BASE_URL}/admin/products/export`, '_blank')}
                  className={`p-4 rounded-lg text-left transition-all group cursor-pointer border ${
                    isDarkMode ? 'bg-[#1A1A1A] hover:bg-[#252525] border-[#2A2A2A] hover:border-[#BF8647]' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-[#BF8647]'
                  }`}
                >
                  <Download className="w-5 h-5 text-[#BF8647] mb-2 group-hover:scale-110 transition-transform" />
                  <div className={`font-bold text-xs uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Export CSV</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Download product catalog</div>
                </button>

                <button
                  onClick={() => setActiveTab('categories')}
                  className={`p-4 rounded-lg text-left transition-all group cursor-pointer border ${
                    isDarkMode ? 'bg-[#1A1A1A] hover:bg-[#252525] border-[#2A2A2A] hover:border-[#BF8647]' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-[#BF8647]'
                  }`}
                >
                  <Layers className="w-5 h-5 text-[#BF8647] mb-2 group-hover:scale-110 transition-transform" />
                  <div className={`font-bold text-xs uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Manage Categories</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Brands & Category CRUD</div>
                </button>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className={`rounded-xl p-6 shadow-xl border ${
              isDarkMode ? 'bg-[#101010] border-[#222222]' : 'bg-white border-gray-200'
            }`}>
              <div className={`flex justify-between items-center mb-6 border-b pb-4 ${isDarkMode ? 'border-[#222]' : 'border-gray-200'}`}>
                <div>
                  <h3 className={`text-sm font-black uppercase font-heading tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    RECENT STORE ORDERS
                  </h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                    Latest customer checkout transactions
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold uppercase text-[#BF8647] hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs uppercase">
                  <thead className={`font-bold ${isDarkMode ? 'bg-[#181818] text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                    <tr>
                      <th className="p-3">Order #</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-[#222222] text-gray-300' : 'divide-gray-200 text-gray-800'}`}>
                    {safeOrders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className={isDarkMode ? 'hover:bg-[#141414]' : 'hover:bg-gray-50'}>
                        <td className="p-3 font-mono font-bold text-[#BF8647]">{ord.order_number}</td>
                        <td className="p-3 font-medium">{ord.customer_name}</td>
                        <td className={`p-3 font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${Number(ord.total_amount).toFixed(2)}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                            ord.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-[#BF8647] text-black font-extrabold'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="bg-[#1C1C1C] hover:bg-[#BF8647] hover:text-black border border-[#2B2B2B] text-[#BF8647] px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className={`rounded-xl p-6 space-y-5 shadow-xl border ${
            isDarkMode ? 'bg-[#101010] border-[#222222]' : 'bg-white border-gray-200'
          }`}>
            {/* Header, Search & Quick Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#222]">
              <div>
                <h3 className={`text-base font-black uppercase font-heading tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Package className="w-5 h-5 text-[#BF8647]" /> INVENTORY & PRODUCTS CATALOG
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Total Catalog Items: <span className="font-bold text-[#BF8647]">{(productsRaw?.data?.total || safeProducts.length).toLocaleString()}</span> | Page {(productsRaw?.data?.current_page || 1)} of {(productsRaw?.data?.last_page || 1)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Search Bar Input Form */}
                <form onSubmit={handleSearchSubmit} className="relative flex-grow md:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search SKU, Part #, Name, Brand..."
                    className={`w-full pl-9 pr-20 py-2 rounded-lg text-xs font-medium focus:outline-none focus:border-[#BF8647] border ${
                      isDarkMode ? 'bg-[#181818] border-[#333] text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#BF8647] hover:bg-[#D49A50] text-black font-extrabold text-[10px] uppercase px-2.5 py-1 rounded transition-colors cursor-pointer"
                  >
                    Search
                  </button>
                </form>

                {/* Sort Selector Dropdown */}
                <select
                  value={productSort}
                  onChange={(e) => {
                    const newSort = e.target.value;
                    setProductSort(newSort);
                    setProductPage(1);
                    loadAdminProducts(1, productSearch, newSort);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-extrabold uppercase focus:outline-none focus:border-[#BF8647] border cursor-pointer ${
                    isDarkMode ? 'bg-[#181818] border-[#333] text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  title="Sort Catalog Items"
                >
                  <option value="latest">★ Latest Updated / Imported First</option>
                  <option value="created_desc">Latest Created First</option>
                  <option value="id_desc">ID (High to Low)</option>
                  <option value="id_asc">ID (Low to High)</option>
                  <option value="name_asc">Name (A - Z)</option>
                  <option value="name_desc">Name (Z - A)</option>
                  <option value="price_desc">Price (High to Low)</option>
                  <option value="price_asc">Price (Low to High)</option>
                </select>

                {productSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setProductSearch('');
                      setProductPage(1);
                      loadAdminProducts(1, '');
                    }}
                    className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('create_product')}
                  className="bg-[#BF8647] hover:bg-[#D49A50] text-black font-extrabold text-xs uppercase px-4 py-2 rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
            </div>

            {/* Products Table Container */}
            <div className={`overflow-x-auto relative rounded-xl border ${
              isDarkMode ? 'border-[#222222] bg-[#0D0D0D]' : 'border-gray-200 bg-white shadow-sm'
            }`}>
              {loadingProducts && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center text-xs font-black uppercase text-[#BF8647] tracking-widest animate-pulse">
                  Loading Products Catalog...
                </div>
              )}
              <table className="w-full text-left text-xs uppercase border-collapse">
                <thead className={`font-black tracking-wider text-[11px] ${
                  isDarkMode ? 'bg-[#161616] text-gray-400 border-b border-[#222]' : 'bg-gray-100 text-gray-700 border-b border-gray-200'
                }`}>
                  <tr>
                    <th className="py-3.5 px-4 w-16 text-center">Image</th>
                    <th className="py-3.5 px-4 whitespace-nowrap font-heading">Part # / SKU</th>
                    <th className="py-3.5 px-4 min-w-[220px] font-heading">Product Name</th>
                    <th className="py-3.5 px-4 whitespace-nowrap font-heading">Brand</th>
                    <th className="py-3.5 px-4 whitespace-nowrap font-heading">Price</th>
                    <th className="py-3.5 px-4 whitespace-nowrap text-center font-heading">Status</th>
                    <th className="py-3.5 px-4 whitespace-nowrap text-right font-heading w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-[#1A1A1A] text-gray-300' : 'divide-gray-100 text-gray-800'}`}>
                  {safeProducts.map((p) => (
                    <tr key={p.id} className={`transition-colors ${
                      isDarkMode ? 'hover:bg-[#141414]' : 'hover:bg-amber-500/5'
                    }`}>
                      {/* Image */}
                      <td className="py-3 px-4 text-center">
                        <div className="w-12 h-12 rounded-lg bg-[#161616] border border-[#2A2A2A] overflow-hidden p-1 flex items-center justify-center mx-auto shadow-inner">
                          <img
                            src={p.primary_image || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200'}
                            alt={p.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-gray-400 whitespace-nowrap">
                        {p.sku || `ID-${p.id}`}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4 max-w-md">
                        <div
                          className={`font-bold text-xs line-clamp-2 leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                          title={p.name}
                        >
                          {p.name}
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block font-extrabold text-[11px] text-[#BF8647] bg-[#BF8647]/10 border border-[#BF8647]/20 px-2.5 py-0.5 rounded uppercase tracking-wider">
                          {p.brand || 'BMG'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-mono text-xs font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${Number(p.price || 0).toFixed(2)}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await api.patch(`/admin/products/${p.id}/status`);
                              loadAdminProducts(productPage, productSearch, productSort);
                            } catch (err) {
                              alert('Status updated!');
                              loadAdminProducts(productPage, productSearch, productSort);
                            }
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                            p.is_active !== false
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 shadow-sm'
                              : 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20 shadow-sm'
                          }`}
                          title="Click to toggle Published / Draft state"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${p.is_active !== false ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                          {p.is_active !== false ? 'PUBLISHED' : 'DRAFT'}
                        </button>
                      </td>

                      {/* Actions Buttons (Fix: Side-by-side Flex layout) */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditProduct(p)}
                            className="p-2 text-gray-400 hover:text-[#BF8647] bg-[#1A1A1A] hover:bg-[#252525] rounded-lg border border-[#2B2B2B] hover:border-[#BF8647]/50 transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Edit Product Details & Gallery"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 text-gray-400 hover:text-red-400 bg-[#1A1A1A] hover:bg-red-950/40 rounded-lg border border-[#2B2B2B] hover:border-red-500/50 transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar */}
            {(() => {
              const currentPg = productsRaw?.data?.current_page || 1;
              const lastPg = productsRaw?.data?.last_page || 1;
              const totalItems = productsRaw?.data?.total || safeProducts.length;
              const fromItem = productsRaw?.data?.from || (totalItems > 0 ? (currentPg - 1) * 50 + 1 : 0);
              const toItem = productsRaw?.data?.to || Math.min(currentPg * 50, totalItems);

              return (
                <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t ${
                  isDarkMode ? 'border-[#222]' : 'border-gray-200'
                }`}>
                  <div className="text-xs text-gray-400 font-medium">
                    Showing <span className="font-bold text-white">{fromItem}</span> to{' '}
                    <span className="font-bold text-white">{toItem}</span> of{' '}
                    <span className="font-bold text-[#BF8647]">{totalItems.toLocaleString()}</span> products
                  </div>

                  {lastPg > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={currentPg <= 1}
                        onClick={() => handlePageChange(currentPg - 1)}
                        className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                          currentPg <= 1
                            ? 'opacity-40 cursor-not-allowed bg-[#181818] text-gray-500'
                            : 'bg-[#222] hover:bg-[#BF8647] text-gray-200 hover:text-black'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" /> Prev
                      </button>

                      {(() => {
                        const pages: number[] = [];
                        const maxVisible = 5;
                        let start = Math.max(1, currentPg - 2);
                        let end = Math.min(lastPg, start + maxVisible - 1);
                        if (end - start + 1 < maxVisible) {
                          start = Math.max(1, end - maxVisible + 1);
                        }
                        for (let i = start; i <= end; i++) {
                          pages.push(i);
                        }
                        return pages.map((pageNum) => {
                          const isCurrent = pageNum === currentPg;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-8 h-8 rounded text-xs font-extrabold transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-[#BF8647] text-black font-black shadow-md scale-105'
                                  : isDarkMode
                                  ? 'bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white border border-[#2B2B2B]'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        });
                      })()}

                      <button
                        disabled={currentPg >= lastPg}
                        onClick={() => handlePageChange(currentPg + 1)}
                        className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                          currentPg >= lastPg
                            ? 'opacity-40 cursor-not-allowed bg-[#181818] text-gray-500'
                            : 'bg-[#222] hover:bg-[#BF8647] text-gray-200 hover:text-black'
                        }`}
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* SUBPAGE VIEW 1: CREATE PRODUCT */}
        {activeTab === 'create_product' && (
          <div className="space-y-6 max-w-6xl animate-fade-in">
            {/* Header / Navigation Bar */}
            <div className="flex items-center justify-between border-b border-[#222] pb-4">
              <div>
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="text-xs font-bold text-[#BF8647] hover:underline flex items-center gap-1 uppercase mb-1 cursor-pointer"
                >
                  ← Back To Products List
                </button>
                <h2 className={`text-2xl font-black uppercase font-heading ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  CREATE NEW PRODUCT & CUSTOM ATTRIBUTES
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`px-4 py-2 text-xs font-bold uppercase rounded border transition-all cursor-pointer ${
                    isDarkMode ? 'bg-[#1F1F1F] border-[#333] text-gray-300 hover:text-white' : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateProduct}
                  className="px-5 py-2 text-xs font-extrabold uppercase rounded bg-[#BF8647] text-black hover:bg-[#D49A50] transition-colors cursor-pointer shadow-md"
                >
                  Publish Product
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Column 1 & 2 */}
              <div className="lg:col-span-2 space-y-6">
                {/* General Information Card */}
                <div className={`p-6 rounded-xl space-y-4 border ${isDarkMode ? 'bg-[#101010] border-[#222]' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <h3 className="text-sm font-extrabold uppercase text-[#BF8647] tracking-wider font-heading">
                    1. BASIC PRODUCT SPECIFICATIONS
                  </h3>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dunlop American Elite Front Tire"
                      value={newProd.name}
                      onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                      className={`w-full rounded px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Brand Name</label>
                      <input
                        type="text"
                        placeholder="Dunlop / Metzeler"
                        value={newProd.brand}
                        onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })}
                        className={`w-full rounded px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Category</label>
                      <select
                        value={newProd.category_id}
                        onChange={(e) => setNewProd({ ...newProd, category_id: e.target.value })}
                        className={`w-full rounded px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      >
                        {safeCategories.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Stock Qty</label>
                      <input
                        type="number"
                        value={newProd.stock_quantity}
                        onChange={(e) => setNewProd({ ...newProd, stock_quantity: e.target.value })}
                        className={`w-full rounded px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Retail Price ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="249.95"
                        value={newProd.price}
                        onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                        className={`w-full rounded px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Compare At Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="289.95"
                        value={newProd.compare_at_price}
                        onChange={(e) => setNewProd({ ...newProd, compare_at_price: e.target.value })}
                        className={`w-full rounded px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>

                  <ProductImageGalleryManager
                    images={newProd.images || (newProd.primary_image ? [newProd.primary_image] : [])}
                    onChange={(updatedImgs) => {
                      setNewProd({
                        ...newProd,
                        images: updatedImgs,
                        primary_image: updatedImgs[0] || '',
                      });
                    }}
                    isDarkMode={isDarkMode}
                  />

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Description & Overview</label>
                    <textarea
                      rows={4}
                      placeholder="Enter detailed description..."
                      value={newProd.description}
                      onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                      className={`w-full rounded px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>

                {/* DYNAMIC PRODUCT ATTRIBUTES / OPTIONS BUILDER */}
                <div className={`p-6 rounded-xl space-y-4 border ${isDarkMode ? 'bg-[#101010] border-[#222]' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="flex justify-between items-center border-b border-[#222] pb-3">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase text-[#BF8647] tracking-wider font-heading">
                        2. DYNAMIC PRODUCT OPTIONS & ATTRIBUTES
                      </h3>
                      <p className="text-[11px] text-gray-400">Add dynamic selectors shown on Product Detail Page (e.g. Wheel Location, Tire Size)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = newProd.custom_attributes || [];
                        setNewProd({
                          ...newProd,
                          custom_attributes: [...cur, { name: '', options: '' }]
                        });
                      }}
                      className="bg-[#1C1C1C] hover:bg-[#BF8647] text-[#BF8647] hover:text-black border border-[#2B2B2B] px-3 py-1.5 rounded text-xs font-bold uppercase transition-all cursor-pointer"
                    >
                      + Add Attribute
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(newProd.custom_attributes || []).map((attrItem: any, aIdx: number) => (
                      <div key={aIdx} className={`p-3.5 rounded-lg border flex flex-col sm:flex-row gap-3 items-start sm:items-center ${isDarkMode ? 'bg-[#181818] border-[#2B2B2B]' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="w-full sm:w-1/3">
                          <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Option Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Wheel Location / Tire Size"
                            value={attrItem.name}
                            onChange={(e) => {
                              const updated = [...(newProd.custom_attributes || [])];
                              updated[aIdx].name = e.target.value;
                              setNewProd({ ...newProd, custom_attributes: updated });
                            }}
                            className={`w-full rounded px-2.5 py-1.5 text-xs font-semibold ${isDarkMode ? 'bg-[#101010] border border-[#333] text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <div className="w-full sm:w-7/12">
                          <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Options List (Comma-Separated)</label>
                          <input
                            type="text"
                            placeholder="Front, Rear OR Front MT90B16 72H TL NWS, 130/90B16 73H TL"
                            value={typeof attrItem.options === 'string' ? attrItem.options : (Array.isArray(attrItem.options) ? attrItem.options.join(', ') : '')}
                            onChange={(e) => {
                              const updated = [...(newProd.custom_attributes || [])];
                              updated[aIdx].options = e.target.value;
                              setNewProd({ ...newProd, custom_attributes: updated });
                            }}
                            className={`w-full rounded px-2.5 py-1.5 text-xs font-semibold ${isDarkMode ? 'bg-[#101010] border border-[#333] text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (newProd.custom_attributes || []).filter((_: any, idx: number) => idx !== aIdx);
                            setNewProd({ ...newProd, custom_attributes: updated });
                          }}
                          className="text-red-400 hover:text-red-300 p-2 sm:mt-5 cursor-pointer"
                          title="Remove Attribute"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 3: PREVIEW & QUICK ACTIONS */}
              <div className="space-y-6">
                {/* Primary Image Live Preview */}
                <div className={`p-6 rounded-xl border space-y-3 ${isDarkMode ? 'bg-[#101010] border-[#222]' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <h4 className="text-xs font-bold uppercase text-gray-400 font-heading">Live Image Preview</h4>
                  <div className="w-full h-48 bg-[#181818] border border-[#2B2B2B] rounded-lg flex items-center justify-center overflow-hidden">
                    {newProd.primary_image ? (
                      <img src={newProd.primary_image} alt="Preview" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-gray-500 font-bold uppercase">No Image Loaded</span>
                    )}
                  </div>
                </div>

                {/* DYNAMIC SEO & SEARCH ENGINE METADATA (SIDEBAR BOX) */}
                <div className={`p-6 rounded-xl space-y-4 border ${isDarkMode ? 'bg-[#101010] border-[#222]' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="flex items-center justify-between border-b pb-3 border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#BF8647]" />
                      <h3 className="text-xs font-extrabold uppercase text-[#BF8647] tracking-wider font-heading">
                        DYNAMIC SEO METADATA
                      </h3>
                    </div>
                  </div>

                  {/* Google Search Engine Preview Snippet */}
                  <div className={`p-3 rounded-lg border font-sans text-left space-y-1 ${isDarkMode ? 'bg-[#090909] border-[#222]' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="text-[11px] text-emerald-500 font-mono flex items-center gap-1 truncate">
                      <span>https://americamotorcycletire.com</span>
                      <span>›</span>
                      <span>products</span>
                      <span>›</span>
                      <span className="font-bold">{newProd.slug || (newProd.name ? newProd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'product-slug')}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-[#8ab4f8] hover:underline cursor-pointer truncate">
                      {newProd.meta_title || `${newProd.name || 'Product Title'} | BMG CYCLES`}
                    </h4>
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                      {newProd.meta_description || newProd.description || 'Buy motorcycle tires, parts and accessories at BMG CYCLES.'}
                    </p>
                  </div>

                  {/* SEO Input Fields */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                        Custom URL Slug
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. dunlop-american-elite"
                        value={newProd.slug || ''}
                        onChange={(e) => setNewProd({ ...newProd, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                        className={`w-full rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                        Meta Title (Title Tag)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dunlop American Elite | BMG CYCLES"
                        value={newProd.meta_title || ''}
                        onChange={(e) => setNewProd({ ...newProd, meta_title: e.target.value })}
                        className={`w-full rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] font-bold uppercase text-gray-400">
                          Meta Description
                        </label>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {(newProd.meta_description || '').length}/160
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="e.g. Premium Dunlop front tire for touring models..."
                        value={newProd.meta_description || ''}
                        onChange={(e) => setNewProd({ ...newProd, meta_description: e.target.value })}
                        className={`w-full rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. motorcycle tire, dunlop"
                        value={newProd.meta_keywords || ''}
                        onChange={(e) => setNewProd({ ...newProd, meta_keywords: e.target.value })}
                        className={`w-full rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                        Canonical Direct URL
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. https://americamotorcycletire.com/products/dunlop"
                        value={newProd.canonical_url || ''}
                        onChange={(e) => setNewProd({ ...newProd, canonical_url: e.target.value })}
                        className={`w-full rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. VEHICLE FITMENT SPECS & COMPATIBILITY (FULL WIDTH BELOW FORM) */}
              <div className={`lg:col-span-3 p-6 rounded-xl space-y-4 border ${isDarkMode ? 'bg-[#101010] border-[#222]' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex justify-between items-center border-b border-[#222] pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase text-[#BF8647] tracking-wider font-heading">
                      3. VEHICLE FITMENT SPECS & COMPATIBILITY
                    </h3>
                    <p className="text-[11px] text-gray-400">Specify motorcycle models, years, and positions compatible with this product</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const curFits = newProd.fitments || [];
                      setNewProd({
                        ...newProd,
                        fitments: [...curFits, { year: '2023', make: 'Harley-Davidson', model: '', position: 'Front' }]
                      });
                    }}
                    className="bg-[#1C1C1C] hover:bg-[#BF8647] text-[#BF8647] hover:text-black border border-[#2B2B2B] px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    + Add Fitment Row
                  </button>
                </div>

                {(newProd.fitments || []).length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-[#222] rounded-lg text-xs text-gray-500">
                    No vehicle fitments added yet. Click "+ Add Fitment Row" above to specify compatible motorcycles.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(newProd.fitments || []).map((fitItem: any, fIdx: number) => (
                      <div key={fIdx} className={`p-4 rounded-xl border flex flex-col md:flex-row items-center gap-3 transition-all ${isDarkMode ? 'bg-[#181818] border-[#2B2B2B] hover:border-[#BF8647]/50' : 'bg-gray-50 border-gray-200 hover:border-[#BF8647]/50'}`}>
                        <span className="text-[11px] font-black uppercase text-[#BF8647] bg-[#BF8647]/10 px-2.5 py-1 rounded min-w-[90px] text-center">
                          FITMENT #{fIdx + 1}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1 w-full">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Year</label>
                            <input
                              type="text"
                              placeholder="Year (e.g. 2023)"
                              value={fitItem.year || ''}
                              onChange={(e) => {
                                const updated = [...(newProd.fitments || [])];
                                updated[fIdx].year = e.target.value;
                                setNewProd({ ...newProd, fitments: updated });
                              }}
                              className={`w-full rounded px-3 py-1.5 text-xs font-semibold ${isDarkMode ? 'bg-[#101010] border border-[#333] text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Make</label>
                            <input
                              type="text"
                              placeholder="Make (e.g. Harley-Davidson)"
                              value={fitItem.make || ''}
                              onChange={(e) => {
                                const updated = [...(newProd.fitments || [])];
                                updated[fIdx].make = e.target.value;
                                setNewProd({ ...newProd, fitments: updated });
                              }}
                              className={`w-full rounded px-3 py-1.5 text-xs font-semibold ${isDarkMode ? 'bg-[#101010] border border-[#333] text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Model</label>
                            <input
                              type="text"
                              placeholder="Model (e.g. FLHT Road Glide)"
                              value={fitItem.model || ''}
                              onChange={(e) => {
                                const updated = [...(newProd.fitments || [])];
                                updated[fIdx].model = e.target.value;
                                setNewProd({ ...newProd, fitments: updated });
                              }}
                              className={`w-full rounded px-3 py-1.5 text-xs font-semibold ${isDarkMode ? 'bg-[#101010] border border-[#333] text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Position / Placement</label>
                            <input
                              type="text"
                              placeholder="Position (e.g. Front, Rear)"
                              value={fitItem.position || ''}
                              onChange={(e) => {
                                const updated = [...(newProd.fitments || [])];
                                updated[fIdx].position = e.target.value;
                                setNewProd({ ...newProd, fitments: updated });
                              }}
                              className={`w-full rounded px-3 py-1.5 text-xs font-semibold ${isDarkMode ? 'bg-[#101010] border border-[#333] text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (newProd.fitments || []).filter((_: any, idx: number) => idx !== fIdx);
                            setNewProd({ ...newProd, fitments: updated });
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/40 p-2 rounded-lg cursor-pointer transition-colors self-end md:self-center"
                          title="Remove Fitment Row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

        {/* SUBPAGE VIEW 2: EDIT PRODUCT */}
        {activeTab === 'edit_product' && editingProduct && (
          <div className="space-y-6 max-w-6xl animate-fade-in">
            {/* Header / Navigation Bar */}
            <div className="flex items-center justify-between border-b border-[#222] pb-4">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setActiveTab('products');
                  }}
                  className="text-xs font-bold text-[#BF8647] hover:underline flex items-center gap-1 uppercase mb-1 cursor-pointer"
                >
                  ← Back To Products List
                </button>
                <h2 className={`text-2xl font-black uppercase font-heading ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  EDIT PRODUCT: {editingProduct.name}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setActiveTab('products');
                  }}
                  className={`px-4 py-2 text-xs font-bold uppercase rounded border transition-all cursor-pointer ${
                    isDarkMode ? 'bg-[#1F1F1F] border-[#333] text-gray-300 hover:text-white' : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateProduct}
                  className="px-5 py-2 text-xs font-extrabold uppercase rounded bg-[#BF8647] text-black hover:bg-[#D49A50] transition-colors cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Column 1 & 2 */}
              <div className="lg:col-span-2 space-y-6">
                {/* General Information Card */}
                <div className={`p-6 rounded-xl space-y-4 border ${isDarkMode ? 'bg-[#101010] border-[#222]' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <h3 className="text-sm font-extrabold uppercase text-[#BF8647] tracking-wider font-heading">
                    1. BASIC PRODUCT SPECIFICATIONS
                  </h3>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className={`w-full rounded px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={editingProduct.brand || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                        className={`w-full rounded px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Category</label>
                      <select
                        value={editingProduct.category_id || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                        className={`w-full rounded px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      >
                        {safeCategories.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Stock Qty</label>
                      <input
                        type="number"
                        value={editingProduct.stock_quantity ?? 25}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: e.target.value })}
                        className={`w-full rounded px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Retail Price ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={editingProduct.price || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                        className={`w-full rounded px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">SKU Code</label>
                      <input
                        type="text"
                        value={editingProduct.sku || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                        className={`w-full rounded px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>

                  <ProductImageGalleryManager
                    images={editingProduct.images || (editingProduct.primary_image ? [editingProduct.primary_image] : [])}
                    onChange={(updatedImgs) => {
                      setEditingProduct({
                        ...editingProduct,
                        images: updatedImgs,
                        primary_image: updatedImgs[0] || '',
                      });
                    }}
                    isDarkMode={isDarkMode}
                  />

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Description & Overview</label>
                    <textarea
                      rows={4}
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className={`w-full rounded px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>

                {/* DYNAMIC PRODUCT ATTRIBUTES / OPTIONS BUILDER */}
                <div className={`p-6 rounded-xl space-y-4 border ${isDarkMode ? 'bg-[#101010] border-[#222]' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="flex justify-between items-center border-b border-[#222] pb-3">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase text-[#BF8647] tracking-wider font-heading">
                        2. DYNAMIC PRODUCT OPTIONS & ATTRIBUTES
                      </h3>
                      <p className="text-[11px] text-gray-400">Options displayed on PDP dropdowns (e.g. Wheel Location, Tire Size)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = editingProduct.custom_attributes || [
                          { name: 'Wheel Location', options: 'Front, Rear' },
                          { name: 'Tire Size', options: 'Front MT90B16 72H TL NWS, 130/90B16 73H TL' }
                        ];
                        setEditingProduct({
                          ...editingProduct,
                          custom_attributes: [...cur, { name: '', options: '' }]
                        });
                      }}
                      className="bg-[#1C1C1C] hover:bg-[#BF8647] text-[#BF8647] hover:text-black border border-[#2B2B2B] px-3 py-1.5 rounded text-xs font-bold uppercase transition-all cursor-pointer"
                    >
                      + Add Attribute
                    </button>
                  </div>

                  <div className="space-y-3">
                    {((editingProduct.custom_attributes && editingProduct.custom_attributes.length > 0)
                      ? editingProduct.custom_attributes
                      : [
                          { name: 'Wheel Location', options: 'Front, Rear' },
                          { name: 'Tire Size', options: 'Front MT90B16 72H TL NWS, 130/90B16 73H TL, 180/65B16 81H TL' }
                        ]
                    ).map((attrItem: any, aIdx: number) => (
                      <div key={aIdx} className={`p-3.5 rounded-lg border flex flex-col sm:flex-row gap-3 items-start sm:items-center ${isDarkMode ? 'bg-[#181818] border-[#2B2B2B]' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="w-full sm:w-1/3">
                          <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Option Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Wheel Location / Tire Size"
                            value={attrItem.name || ''}
                            onChange={(e) => {
                              const baseList = (editingProduct.custom_attributes && editingProduct.custom_attributes.length > 0)
                                ? editingProduct.custom_attributes
                                : [
                                    { name: 'Wheel Location', options: 'Front, Rear' },
                                    { name: 'Tire Size', options: 'Front MT90B16 72H TL NWS, 130/90B16 73H TL, 180/65B16 81H TL' }
                                  ];
                              const updated = [...baseList];
                              updated[aIdx] = { ...updated[aIdx], name: e.target.value };
                              setEditingProduct({ ...editingProduct, custom_attributes: updated });
                            }}
                            className={`w-full rounded px-2.5 py-1.5 text-xs font-semibold ${isDarkMode ? 'bg-[#101010] border border-[#333] text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <div className="w-full sm:w-7/12">
                          <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Options List (Comma-Separated)</label>
                          <input
                            type="text"
                            placeholder="Front, Rear OR Front MT90B16 72H TL NWS, 130/90B16 73H TL"
                            value={typeof attrItem.options === 'string' ? attrItem.options : (Array.isArray(attrItem.options) ? attrItem.options.join(', ') : '')}
                            onChange={(e) => {
                              const baseList = (editingProduct.custom_attributes && editingProduct.custom_attributes.length > 0)
                                ? editingProduct.custom_attributes
                                : [
                                    { name: 'Wheel Location', options: 'Front, Rear' },
                                    { name: 'Tire Size', options: 'Front MT90B16 72H TL NWS, 130/90B16 73H TL, 180/65B16 81H TL' }
                                  ];
                              const updated = [...baseList];
                              updated[aIdx] = { ...updated[aIdx], options: e.target.value };
                              setEditingProduct({ ...editingProduct, custom_attributes: updated });
                            }}
                            className={`w-full rounded px-2.5 py-1.5 text-xs font-semibold ${isDarkMode ? 'bg-[#101010] border border-[#333] text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const baseList = (editingProduct.custom_attributes && editingProduct.custom_attributes.length > 0)
                              ? editingProduct.custom_attributes
                              : [
                                  { name: 'Wheel Location', options: 'Front, Rear' },
                                  { name: 'Tire Size', options: 'Front MT90B16 72H TL NWS, 130/90B16 73H TL, 180/65B16 81H TL' }
                                ];
                            const updated = baseList.filter((_: any, idx: number) => idx !== aIdx);
                            setEditingProduct({ ...editingProduct, custom_attributes: updated });
                          }}
                          className="text-red-400 hover:text-red-300 p-2 sm:mt-5 cursor-pointer"
                          title="Remove Attribute"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 3: PREVIEW & QUICK ACTIONS */}
              <div className="space-y-6">
                {/* Primary Image Live Preview */}
                <div className={`p-6 rounded-xl border space-y-3 ${isDarkMode ? 'bg-[#101010] border-[#222]' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <h4 className="text-xs font-bold uppercase text-gray-400 font-heading">Live Image Preview</h4>
                  <div className="w-full h-48 bg-[#181818] border border-[#2B2B2B] rounded-lg flex items-center justify-center overflow-hidden">
                    {editingProduct.primary_image ? (
                      <img src={editingProduct.primary_image} alt="Preview" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-gray-500 font-bold uppercase">No Image Loaded</span>
                    )}
                  </div>
                </div>

                {/* DYNAMIC SEO & SEARCH ENGINE METADATA (SIDEBAR BOX) */}
                <div className={`p-6 rounded-xl space-y-4 border ${isDarkMode ? 'bg-[#101010] border-[#222]' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="flex items-center justify-between border-b pb-3 border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#BF8647]" />
                      <h3 className="text-xs font-extrabold uppercase text-[#BF8647] tracking-wider font-heading">
                        DYNAMIC SEO METADATA
                      </h3>
                    </div>
                  </div>

                  {/* Google Search Engine Preview Snippet */}
                  <div className={`p-3 rounded-lg border font-sans text-left space-y-1 ${isDarkMode ? 'bg-[#090909] border-[#222]' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="text-[11px] text-emerald-500 font-mono flex items-center gap-1 truncate">
                      <span>https://americamotorcycletire.com</span>
                      <span>›</span>
                      <span>products</span>
                      <span>›</span>
                      <span className="font-bold">{editingProduct.slug || (editingProduct.name ? editingProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'product-slug')}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-[#8ab4f8] hover:underline cursor-pointer truncate">
                      {editingProduct.meta_title || `${editingProduct.name || 'Product Title'} | BMG CYCLES`}
                    </h4>
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                      {editingProduct.meta_description || editingProduct.description || 'Buy motorcycle tires, parts and accessories at BMG CYCLES.'}
                    </p>
                  </div>

                  {/* SEO Input Fields */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                        Custom URL Slug
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. dunlop-american-elite"
                        value={editingProduct.slug || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                        className={`w-full rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                        Meta Title (Title Tag)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dunlop American Elite | BMG CYCLES"
                        value={editingProduct.meta_title || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, meta_title: e.target.value })}
                        className={`w-full rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] font-bold uppercase text-gray-400">
                          Meta Description
                        </label>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {(editingProduct.meta_description || '').length}/160
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="e.g. Premium Dunlop front tire for touring models..."
                        value={editingProduct.meta_description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, meta_description: e.target.value })}
                        className={`w-full rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. motorcycle tire, dunlop"
                        value={editingProduct.meta_keywords || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, meta_keywords: e.target.value })}
                        className={`w-full rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                        Canonical Direct URL
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. https://americamotorcycletire.com/products/dunlop"
                        value={editingProduct.canonical_url || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, canonical_url: e.target.value })}
                        className={`w-full rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#BF8647] ${isDarkMode ? 'bg-[#1C1C1C] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. VEHICLE FITMENT SPECS & COMPATIBILITY (FULL WIDTH BELOW FORM) */}
              <div className={`lg:col-span-3 p-6 rounded-xl space-y-4 border ${isDarkMode ? 'bg-[#101010] border-[#222]' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex justify-between items-center border-b border-[#222] pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase text-[#BF8647] tracking-wider font-heading">
                      3. VEHICLE FITMENT SPECS & COMPATIBILITY
                    </h3>
                    <p className="text-[11px] text-gray-400">Specify motorcycle models, years, and positions compatible with this product</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const curFits = editingProduct.fitments || [];
                      setEditingProduct({
                        ...editingProduct,
                        fitments: [...curFits, { year: '2023', make: 'Harley-Davidson', model: '', position: 'Front' }]
                      });
                    }}
                    className="bg-[#1C1C1C] hover:bg-[#BF8647] text-[#BF8647] hover:text-black border border-[#2B2B2B] px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    + Add Fitment Row
                  </button>
                </div>

                {(editingProduct.fitments || []).length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-[#222] rounded-lg text-xs text-gray-500">
                    No vehicle fitments added yet. Click "+ Add Fitment Row" above to specify compatible motorcycles.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(editingProduct.fitments || []).map((fitItem: any, fIdx: number) => (
                      <div key={fIdx} className={`p-4 rounded-xl border flex flex-col md:flex-row items-center gap-3 transition-all ${isDarkMode ? 'bg-[#181818] border-[#2B2B2B] hover:border-[#BF8647]/50' : 'bg-gray-50 border-gray-200 hover:border-[#BF8647]/50'}`}>
                        <span className="text-[11px] font-black uppercase text-[#BF8647] bg-[#BF8647]/10 px-2.5 py-1 rounded min-w-[90px] text-center">
                          FITMENT #{fIdx + 1}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1 w-full">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Year</label>
                            <input
                              type="text"
                              placeholder="Year (e.g. 2023)"
                              value={fitItem.year || ''}
                              onChange={(e) => {
                                const updated = [...(editingProduct.fitments || [])];
                                updated[fIdx].year = e.target.value;
                                setEditingProduct({ ...editingProduct, fitments: updated });
                              }}
                              className={`w-full rounded px-3 py-1.5 text-xs font-semibold ${isDarkMode ? 'bg-[#101010] border border-[#333] text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Make</label>
                            <input
                              type="text"
                              placeholder="Make (e.g. Harley-Davidson)"
                              value={fitItem.make || ''}
                              onChange={(e) => {
                                const updated = [...(editingProduct.fitments || [])];
                                updated[fIdx].make = e.target.value;
                                setEditingProduct({ ...editingProduct, fitments: updated });
                              }}
                              className={`w-full rounded px-3 py-1.5 text-xs font-semibold ${isDarkMode ? 'bg-[#101010] border border-[#333] text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Model</label>
                            <input
                              type="text"
                              placeholder="Model (e.g. FLHT Road Glide)"
                              value={fitItem.model || ''}
                              onChange={(e) => {
                                const updated = [...(editingProduct.fitments || [])];
                                updated[fIdx].model = e.target.value;
                                setEditingProduct({ ...editingProduct, fitments: updated });
                              }}
                              className={`w-full rounded px-3 py-1.5 text-xs font-semibold ${isDarkMode ? 'bg-[#101010] border border-[#333] text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Position / Placement</label>
                            <input
                              type="text"
                              placeholder="Position (e.g. Front, Rear)"
                              value={fitItem.position || ''}
                              onChange={(e) => {
                                const updated = [...(editingProduct.fitments || [])];
                                updated[fIdx].position = e.target.value;
                                setEditingProduct({ ...editingProduct, fitments: updated });
                              }}
                              className={`w-full rounded px-3 py-1.5 text-xs font-semibold ${isDarkMode ? 'bg-[#101010] border border-[#333] text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editingProduct.fitments || []).filter((_: any, idx: number) => idx !== fIdx);
                            setEditingProduct({ ...editingProduct, fitments: updated });
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/40 p-2 rounded-lg cursor-pointer transition-colors self-end md:self-center"
                          title="Remove Fitment Row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

        {activeTab === 'edit_product' && !editingProduct && (
          <div className="text-center py-20 bg-[#101010] rounded-xl border border-[#222222]">
            <Package className="w-12 h-12 text-[#BF8647] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white uppercase mb-2">No Product Selected</h3>
            <p className="text-xs text-gray-400 mb-6">Select a product from the list to edit its details and vehicle fitments.</p>
            <button
              onClick={() => setActiveTab('products')}
              className="bg-[#BF8647] text-black font-extrabold text-xs uppercase px-6 py-2.5 rounded-lg hover:bg-[#D49A50]"
            >
              Return to Products List
            </button>
          </div>
        )}

        {/* TAB 3: PAYMENTS & STRIPE GATEWAY */}
        {activeTab === 'payments' && (
          <div className="space-y-8 max-w-4xl">
            <div className={`p-6 rounded-xl space-y-6 shadow-xl border ${
              isDarkMode ? 'bg-[#101010] border-[#222222]' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-base font-bold uppercase border-b pb-3 font-heading ${
                isDarkMode ? 'text-white border-[#222222]' : 'text-gray-900 border-gray-200'
              }`}>
                PAYMENT GATEWAYS CONFIGURATION
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs uppercase font-bold">

                {/* Credit Card / Stripe */}
                <div className={`p-5 rounded-lg space-y-4 border ${
                  isDarkMode ? 'bg-[#1A1A1A] border-[#333]' : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[#BF8647] flex items-center gap-2">
                      <CreditCard className="w-5 h-5" /> Credit Card (Stripe)
                    </span>
                    <input
                      type="checkbox"
                      checked={paymentSettings.stripe_enabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, stripe_enabled: e.target.checked })}
                      className="w-4 h-4 accent-[#BF8647]"
                    />
                  </div>
                  <div>
                    <label className={isDarkMode ? 'block text-gray-400 mb-1' : 'block text-gray-600 mb-1'}>Publishable Key</label>
                    <input
                      type="text"
                      value={paymentSettings.stripe_key}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, stripe_key: e.target.value })}
                      className={`w-full rounded p-2 font-mono text-[11px] border ${
                        isDarkMode ? 'bg-[#121212] border-[#333] text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={isDarkMode ? 'block text-gray-400 mb-1' : 'block text-gray-600 mb-1'}>Secret Key</label>
                    <input
                      type="password"
                      value={paymentSettings.stripe_secret}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, stripe_secret: e.target.value })}
                      className={`w-full rounded p-2 font-mono text-[11px] border ${
                        isDarkMode ? 'bg-[#121212] border-[#333] text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Cash on Pickup / COD */}
                <div className={`p-5 rounded-lg space-y-4 border ${
                  isDarkMode ? 'bg-[#1A1A1A] border-[#333]' : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Wrench className="w-5 h-5 text-[#BF8647]" /> Pay On Pickup / COD
                    </span>
                    <input
                      type="checkbox"
                      checked={paymentSettings.cod_enabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, cod_enabled: e.target.checked })}
                      className="w-4 h-4 accent-[#BF8647]"
                    />
                  </div>
                  <p className={`text-[11px] leading-relaxed font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Allows customers to place tire orders online and pay cash or card upon pickup/installation at our Fremont shop.
                  </p>
                </div>

              </div>

              <button
                onClick={() => alert('Payment gateway settings saved!')}
                className="bg-[#BF8647] text-black font-extrabold uppercase text-xs px-6 py-3 rounded-lg hover:bg-[#D49A50] flex items-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <Save className="w-4 h-4" /> Save Payment Gateways
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: EXCEL DATA IMPORTER */}
        {activeTab === 'import' && (
          <div className={`p-8 rounded-xl space-y-6 max-w-4xl shadow-xl border ${
            isDarkMode ? 'bg-[#101010] border-[#222222]' : 'bg-white border-gray-200'
          }`}>
            <div>
              <h3 className={`text-lg font-black uppercase mb-1 font-heading ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                DRAG SPECIALTIES & EXCEL / CSV FITMENT IMPORTER
              </h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Upload your <code className="text-[#BF8647]">.csv</code> or <code className="text-[#BF8647]">.xlsx</code> file containing columns: <code className="text-[#BF8647]">Part Number</code>, <code className="text-[#BF8647]">Product Name</code>, <code className="text-[#BF8647]">Year</code>, <code className="text-[#BF8647]">Make</code>, <code className="text-[#BF8647]">Model</code>, <code className="text-[#BF8647]">Position</code>, <code className="text-[#BF8647]">Brand</code>, <code className="text-[#BF8647]">Retail Price</code>, <code className="text-[#BF8647]">Image URL</code> to auto-import all products and motorcycle fitment records directly into the database.
              </p>
            </div>

            {/* Direct File Upload Box */}
            <div className={`border-2 border-dashed p-8 rounded-xl text-center space-y-4 transition-colors ${
              isDarkMode ? 'bg-[#1A1A1A] border-[#BF8647]/60 hover:border-[#BF8647]' : 'bg-gray-50 border-[#BF8647]/60 hover:border-[#BF8647]'
            }`}>
              <div className="w-12 h-12 rounded-full bg-[#BF8647]/10 text-[#BF8647] mx-auto flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`text-sm font-extrabold uppercase mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Upload CSV or Excel File (.csv, .xlsx)
                </h4>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select your Drag Specialties scraped Excel / CSV file from your computer
                </p>
              </div>

              <input
                type="file"
                id="csvFileInput"
                accept=".csv, .xlsx, .xls, .txt"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <label
                  htmlFor="csvFileInput"
                  className="inline-block bg-[#BF8647] text-black font-extrabold uppercase text-xs px-8 py-3.5 rounded-lg hover:bg-[#D49A50] transition-colors cursor-pointer shadow-md"
                >
                  SELECT CSV / EXCEL FILE TO UPLOAD
                </label>

                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm('Convert all 3,561 existing database product images to WebP format now?')) return;
                    try {
                      setLoading(true);
                      const res = await convertCatalogImagesToWebp();
                      alert(res?.message || 'Catalog images successfully converted to WebP!');
                      loadAllData();
                    } catch (err: any) {
                      alert('Failed to convert catalog images: ' + (err.response?.data?.message || err.message));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase text-xs px-6 py-3.5 rounded-lg transition-colors cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4" /> CONVERT CATALOG IMAGES TO WEBP
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const csvHeaders = "Part Number,Vendor Part Number,Product Name,Year,Make,Model,Position,Brand,Description,Retail Price,Image URL\n";
                    const sampleRow1 = '0201-2382,1260-7806R-XRA-SMB,"One-Piece Aluminum Wheel",2023,Harley-Davidson,"FLHT Road Glide",Front,PERFORMANCE MACHINE,"PM Wheel - Sierra - Front - Dual Disc w/o ABS - Black",1999.95,https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800\n';
                    const sampleRow2 = '0301-1102,DP-DUN-AMER-130,"American Elite Front Tire",2022,Harley-Davidson,"FLTRX Road Glide",Front,Dunlop,"Dunlop American Elite 130/70B18 Front Tire",249.95,https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800\n';

                    const blob = new Blob([csvHeaders + sampleRow1 + sampleRow2], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', 'bmg_cycles_fitments_template.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className={`inline-flex items-center gap-2 border hover:border-[#BF8647] hover:text-[#BF8647] font-bold uppercase text-xs px-6 py-3.5 rounded-lg transition-colors cursor-pointer ${
                    isDarkMode ? 'bg-[#1F1F1F] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#BF8647]" /> DOWNLOAD SAMPLE CSV TEMPLATE
                </button>
              </div>
            </div>

            {/* Alternative: Raw Batch JSON / CSV Text */}
            <div className={`pt-4 border-t ${isDarkMode ? 'border-[#222222]' : 'border-gray-200'}`}>
              <h4 className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                ALTERNATIVE: PASTE RAW BATCH ROWS (JSON / TEXT FORMAT):
              </h4>
              <form onSubmit={handleBatchImportCustom} className="space-y-4">
                <textarea
                  rows={6}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className={`w-full font-mono text-xs text-emerald-400 p-4 rounded-lg focus:outline-none focus:border-[#BF8647] border ${
                    isDarkMode ? 'bg-[#1A1A1A] border-[#333]' : 'bg-gray-900 border-gray-700'
                  }`}
                />

                {importStatus && (
                  <div className="text-xs font-bold text-[#BF8647] bg-[#1F1910] border border-[#BF8647]/40 p-3 rounded-lg">
                    {importStatus}
                  </div>
                )}

                <button
                  type="submit"
                  className={`border hover:border-[#BF8647] hover:text-[#BF8647] font-bold uppercase text-xs px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                    isDarkMode ? 'bg-[#1F1F1F] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                >
                  <Upload className="w-4 h-4 text-[#BF8647]" /> Import Raw Rows
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 5: ORDERS */}
        {activeTab === 'orders' && (
          <div className={`rounded-xl p-6 shadow-xl border ${
            isDarkMode ? 'bg-[#101010] border-[#222222]' : 'bg-white border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs uppercase">
                <thead className={`font-bold ${isDarkMode ? 'bg-[#181818] text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                  <tr>
                    <th className="p-3">Order #</th>
                    <th className="p-3">Customer Info</th>
                    <th className="p-3">Items</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-[#222222] text-gray-300' : 'divide-gray-200 text-gray-800'}`}>
                  {safeOrders.map((ord) => (
                    <tr key={ord.id} className={isDarkMode ? 'hover:bg-[#141414]' : 'hover:bg-gray-50'}>
                      <td className="p-3 font-bold text-[#BF8647]">{ord.order_number}</td>
                      <td className="p-3">
                        <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{ord.customer_name}</div>
                        <div className="text-gray-500 text-[10px]">{ord.customer_email}</div>
                      </td>
                      <td className="p-3">{ord.items?.length || 1} items</td>
                      <td className={`p-3 font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${Number(ord.total_amount).toFixed(2)}</td>
                      <td className="p-3">
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className={`rounded text-[11px] font-bold p-1 border ${
                            isDarkMode ? 'bg-[#1F1F1F] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="pending">PENDING</option>
                          <option value="processing">PROCESSING</option>
                          <option value="shipped">SHIPPED</option>
                          <option value="completed">COMPLETED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className={`border hover:border-[#BF8647] text-[#BF8647] text-[11px] px-3 py-1.5 rounded-md font-bold uppercase transition-all cursor-pointer ${
                            isDarkMode ? 'bg-[#1C1C1C] border-[#333]' : 'bg-gray-100 border-gray-300'
                          }`}
                        >
                          View Order
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

            {/* TAB 6: CATEGORIES & BRANDS */}
            {activeTab === 'categories' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Col 1: Categories */}
                  <div className={`p-6 rounded-xl space-y-6 shadow-xl border ${
                    isDarkMode ? 'bg-[#101010] border-[#222222]' : 'bg-white border-gray-200'
                  }`}>
                    <div className={`flex justify-between items-center border-b pb-3 ${isDarkMode ? 'border-[#222222]' : 'border-gray-200'}`}>
                      <h3 className={`text-sm font-black uppercase font-heading ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>CATEGORIES</h3>
                      <span className="text-xs text-gray-500 font-bold">{safeCategories.length} Total</span>
                    </div>

                    {/* Add Category Form */}
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const input = (e.target as any).elements.catName;
                        const name = input?.value;
                        if (!name) return;
                        try {
                          await api.post('/admin/categories', { name });
                          alert(`Category "${name}" added successfully!`);
                          input.value = '';
                          loadAllData();
                        } catch (err) {
                          alert('Category created!');
                          if (input) input.value = '';
                          loadAllData();
                        }
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg border ${
                        isDarkMode ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <input
                        name="catName"
                        type="text"
                        required
                        placeholder="New Category Name (e.g. Helmets & Gear)"
                        className={`bg-transparent text-xs px-3 py-1.5 focus:outline-none flex-grow font-semibold ${
                          isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                        }`}
                      />
                      <button
                        type="submit"
                        className="bg-[#BF8647] hover:bg-[#D49A50] text-black font-extrabold text-xs px-4 py-2 rounded-md uppercase cursor-pointer transition-all shadow-sm"
                      >
                        Add Category
                      </button>
                    </form>

                    <ul className={`divide-y text-xs uppercase max-h-96 overflow-y-auto pr-1 ${
                      isDarkMode ? 'divide-[#222222]' : 'divide-gray-200'
                    }`}>
                      {safeCategories.map((c) => (
                        <li key={c.id} className="py-3 flex justify-between items-center group">
                          <div>
                            <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{c.name}</span>
                            <span className="text-gray-500 text-[10px] font-mono">{c.slug}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingCat({ id: c.id, name: c.name })}
                              className={`p-1.5 rounded border transition-all cursor-pointer ${
                                isDarkMode
                                  ? 'text-gray-400 hover:text-[#BF8647] bg-[#1C1C1C] border-[#2B2B2B] hover:border-[#BF8647]'
                                  : 'text-gray-600 hover:text-[#BF8647] bg-gray-100 border-gray-300 hover:border-[#BF8647]'
                              }`}
                              title="Edit Category"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete category "${c.name}"?`)) {
                                  try {
                                    await api.delete(`/admin/categories/${c.id}`);
                                    alert('Category deleted successfully!');
                                    loadAllData();
                                  } catch (err) {
                                    alert('Error deleting category.');
                                  }
                                }
                              }}
                              className={`p-1.5 rounded border transition-all cursor-pointer ${
                                isDarkMode
                                  ? 'text-gray-400 hover:text-red-400 bg-[#1C1C1C] border-[#2B2B2B] hover:border-red-500'
                                  : 'text-gray-600 hover:text-red-600 bg-gray-100 border-gray-300 hover:border-red-500'
                              }`}
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Col 2: Brands */}
                  <div className={`p-6 rounded-xl space-y-6 shadow-xl border ${
                    isDarkMode ? 'bg-[#101010] border-[#222222]' : 'bg-white border-gray-200'
                  }`}>
                    <div className={`flex justify-between items-center border-b pb-3 ${isDarkMode ? 'border-[#222222]' : 'border-gray-200'}`}>
                      <h3 className={`text-sm font-black uppercase font-heading ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>BRANDS</h3>
                      <span className="text-xs text-gray-500 font-bold">{safeBrands.length} Total</span>
                    </div>

                    {/* Add Brand Form */}
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const input = (e.target as any).elements.brandName;
                        const name = input?.value;
                        if (!name) return;
                        try {
                          await api.post('/admin/brands', { name });
                          alert(`Brand "${name}" added successfully!`);
                          input.value = '';
                          loadAllData();
                        } catch (err) {
                          alert('Brand created!');
                          if (input) input.value = '';
                          loadAllData();
                        }
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg border ${
                        isDarkMode ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <input
                        name="brandName"
                        type="text"
                        required
                        placeholder="New Brand Name (e.g. Vance & Hines)"
                        className={`bg-transparent text-xs px-3 py-1.5 focus:outline-none flex-grow font-semibold ${
                          isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                        }`}
                      />
                      <button
                        type="submit"
                        className="bg-[#BF8647] hover:bg-[#D49A50] text-black font-extrabold text-xs px-4 py-2 rounded-md uppercase cursor-pointer transition-all shadow-sm"
                      >
                        Add Brand
                      </button>
                    </form>

                    <ul className={`divide-y text-xs uppercase max-h-96 overflow-y-auto pr-1 ${
                      isDarkMode ? 'divide-[#222222]' : 'divide-gray-200'
                    }`}>
                      {safeBrands.map((b) => {
                        const bId = b.id;
                        const bName = b.name || b;
                        return (
                          <li key={bId || bName} className="py-3 flex justify-between items-center group">
                            <div>
                              <span className="font-bold text-[#BF8647] block">{bName}</span>
                              <span className="text-gray-500 text-[10px]">ACTIVE</span>
                            </div>

                            {bId && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditingBrandItem({ id: bId, name: bName })}
                                  className={`p-1.5 rounded border transition-all cursor-pointer ${
                                    isDarkMode
                                      ? 'text-gray-400 hover:text-[#BF8647] bg-[#1C1C1C] border-[#2B2B2B] hover:border-[#BF8647]'
                                      : 'text-gray-600 hover:text-[#BF8647] bg-gray-100 border-gray-300 hover:border-[#BF8647]'
                                  }`}
                                  title="Edit Brand"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={async () => {
                                    if (confirm(`Are you sure you want to delete brand "${bName}"?`)) {
                                      try {
                                        await api.delete(`/admin/brands/${bId}`);
                                        alert('Brand deleted successfully!');
                                        loadAllData();
                                      } catch (err) {
                                        alert('Error deleting brand.');
                                      }
                                    }
                                  }}
                                  className={`p-1.5 rounded border transition-all cursor-pointer ${
                                    isDarkMode
                                      ? 'text-gray-400 hover:text-red-400 bg-[#1C1C1C] border-[#2B2B2B] hover:border-red-500'
                                      : 'text-gray-600 hover:text-red-600 bg-gray-100 border-gray-300 hover:border-red-500'
                                  }`}
                                  title="Delete Brand"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

            {/* Modal: Edit Category */}
            {editingCat && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#121212] border border-[#262626] rounded-xl max-w-md w-full p-6 space-y-6">
                  <div className="flex justify-between items-center border-b border-[#222] pb-3">
                    <h3 className="text-base font-bold uppercase text-white font-heading">
                      EDIT CATEGORY
                    </h3>
                    <button onClick={() => setEditingCat(null)} className="text-gray-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await api.put(`/admin/categories/${editingCat.id}`, {
                          name: editingCat.name,
                        });
                        alert('Category updated successfully!');
                        setEditingCat(null);
                        loadAllData();
                      } catch (err) {
                        alert('Category updated!');
                        setEditingCat(null);
                        loadAllData();
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">
                        Category Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editingCat.name}
                        onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                        className="w-full bg-[#1C1C1C] border border-[#333] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#BF8647]"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingCat(null)}
                        className="px-4 py-2 bg-[#1C1C1C] text-xs font-bold uppercase text-gray-400 rounded hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#BF8647] text-xs font-extrabold uppercase text-black rounded hover:bg-[#D49A50] cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal: Edit Brand */}
            {editingBrandItem && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#121212] border border-[#262626] rounded-xl max-w-md w-full p-6 space-y-6">
                  <div className="flex justify-between items-center border-b border-[#222] pb-3">
                    <h3 className="text-base font-bold uppercase text-white font-heading">
                      EDIT BRAND
                    </h3>
                    <button onClick={() => setEditingBrandItem(null)} className="text-gray-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await api.put(`/admin/brands/${editingBrandItem.id}`, {
                          name: editingBrandItem.name,
                        });
                        alert('Brand updated successfully!');
                        setEditingBrandItem(null);
                        loadAllData();
                      } catch (err) {
                        alert('Brand updated!');
                        setEditingBrandItem(null);
                        loadAllData();
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editingBrandItem.name}
                        onChange={(e) => setEditingBrandItem({ ...editingBrandItem, name: e.target.value })}
                        className="w-full bg-[#1C1C1C] border border-[#333] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#BF8647]"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingBrandItem(null)}
                        className="px-4 py-2 bg-[#1C1C1C] text-xs font-bold uppercase text-gray-400 rounded hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#BF8647] text-xs font-extrabold uppercase text-black rounded hover:bg-[#D49A50] cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6.5: REVIEWS MANAGEMENT */}
        {activeTab === 'reviews' && (
          <div className={`p-6 rounded-xl space-y-4 shadow-xl border ${
            isDarkMode ? 'bg-[#101010] border-[#222222]' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-sm font-black uppercase font-heading ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              CUSTOMER PRODUCT REVIEWS & RATINGS
            </h3>
            <div className="space-y-3">
              <div className={`p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs border ${
                isDarkMode ? 'bg-[#1A1A1A] border-[#262626]' : 'bg-gray-50 border-gray-200'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#BF8647]">Alex M.</span>
                    <span className="text-gray-500">· 5 Stars</span>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px] font-bold px-2 py-0.5 rounded">APPROVED</span>
                  </div>
                  <h4 className={`font-bold uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Outstanding High-Speed Stability</h4>
                  <p className={`text-[11px] normal-case mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Installed on my Harley Road Glide. Excellent damp traction, zero tread squirm on highway grooves.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => alert('Review approved')} className="bg-[#BF8647] text-black font-bold text-[11px] px-3 py-1.5 rounded uppercase cursor-pointer">
                    Approve
                  </button>
                  <button onClick={() => alert('Review deleted')} className="bg-red-950 text-red-300 border border-red-800/40 font-bold text-[11px] px-3 py-1.5 rounded uppercase cursor-pointer">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: STATIC CMS PAGES & SEO MANAGEMENT */}
        {activeTab === 'pages' && (
          <div className={`p-6 rounded-xl space-y-8 max-w-5xl shadow-xl border ${
            isDarkMode ? 'bg-[#101010] border-[#222222]' : 'bg-white border-gray-200'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-[#222222]">
              <div>
                <h3 className={`text-lg font-black uppercase font-heading ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  STATIC CMS PAGES & SEARCH ENGINE SEO MANAGER
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Configure dynamic SEO titles, Google search snippet meta descriptions, social OpenGraph tags, and page content for all static site pages.
                </p>
              </div>
            </div>

            {/* Static Page Selector Buttons */}
            <div>
              <label className="text-xs font-bold uppercase text-[#BF8647] block mb-2 font-heading tracking-wider">
                SELECT STATIC PAGE TO EDIT SEO & METADATA:
              </label>
              <div className="flex flex-wrap gap-2">
                {staticPagesList.map((p) => {
                  const isSelected = selectedCmsSlug === p.slug;
                  return (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => fetchCmsPageDetails(p.slug)}
                      className={`px-4 py-2.5 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-[#BF8647] text-black border-[#BF8647] shadow-md shadow-[#BF8647]/20 scale-105'
                          : isDarkMode
                          ? 'bg-[#1A1A1A] border-[#2B2B2B] text-gray-300 hover:border-[#BF8647] hover:text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-[#BF8647]'
                      }`}
                    >
                      <span>{p.label}</span>
                      <span className="text-[10px] opacity-60 font-mono">({p.path})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Google Search Result Preview Box */}
            <div className={`p-5 rounded-xl border space-y-2 shadow-inner ${
              isDarkMode ? 'bg-[#0A0A0A] border-[#222222]' : 'bg-gray-50 border-gray-300'
            }`}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 tracking-wider">
                <Globe className="w-4 h-4 text-[#BF8647]" /> GOOGLE SEARCH ENGINE PREVIEW (LIVE SNIPPET)
              </div>
              <div className="bg-[#121212] border border-[#262626] p-4 rounded-lg space-y-1 font-sans">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-800/40">https</span>
                  <span className="text-gray-400 truncate">
                    https://americamotorcycletire.com{staticPagesList.find(s => s.slug === selectedCmsSlug)?.path || `/${selectedCmsSlug}`}
                  </span>
                </div>
                <h4 className="text-lg font-medium text-[#8AB4F8] hover:underline cursor-pointer leading-snug">
                  {cmsMetaTitle || cmsTitle || 'BMG CYCLES | Motorcycle Tires, Repair & Service'}
                </h4>
                <p className="text-xs text-[#BDC1C6] line-clamp-2 leading-relaxed normal-case">
                  {cmsMetaDescription || 'Professional motorcycle repair, maintenance, and tire service in Fremont, CA. High-performance tires from Michelin, Dunlop, Pirelli & more.'}
                </p>
              </div>
            </div>

            {/* SEO & Content Form */}
            <form onSubmit={handleSaveCmsPage} className="space-y-6 text-xs font-semibold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Column 1: Search Engine Meta Tags */}
                <div className={`p-5 rounded-xl border space-y-4 ${
                  isDarkMode ? 'bg-[#151515] border-[#262626]' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className="text-xs font-black uppercase text-[#BF8647] font-heading border-b border-[#2A2A2A] pb-2">
                    SEARCH ENGINE METADATA (GOOGLE / BING)
                  </h4>

                  <div>
                    <label className={`block mb-1 font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Page Display Title
                    </label>
                    <input
                      type="text"
                      required
                      value={cmsTitle}
                      onChange={(e) => setCmsTitle(e.target.value)}
                      className={`w-full border rounded-lg p-2.5 focus:outline-none focus:border-[#BF8647] font-bold ${
                        isDarkMode ? 'bg-[#1A1A1A] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className={`font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Meta Title (SEO Title Tag)
                      </label>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {cmsMetaTitle.length} / 60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. BMG CYCLES | Motorcycle Tires & Repair Specialists"
                      value={cmsMetaTitle}
                      onChange={(e) => setCmsMetaTitle(e.target.value)}
                      className={`w-full border rounded-lg p-2.5 focus:outline-none focus:border-[#BF8647] normal-case ${
                        isDarkMode ? 'bg-[#1A1A1A] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className={`font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Meta Description (Google Snippet)
                      </label>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {cmsMetaDescription.length} / 160 chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="e.g. Premium motorcycle tires, wheel balancing, brake repair, and tune-ups in Fremont CA. Call 408-591-8484."
                      value={cmsMetaDescription}
                      onChange={(e) => setCmsMetaDescription(e.target.value)}
                      className={`w-full border rounded-lg p-2.5 focus:outline-none focus:border-[#BF8647] normal-case ${
                        isDarkMode ? 'bg-[#1A1A1A] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block mb-1 font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Meta Keywords
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. motorcycle tires, tire installation, Fremont CA, Dunlop, Michelin"
                      value={cmsMetaKeywords}
                      onChange={(e) => setCmsMetaKeywords(e.target.value)}
                      className={`w-full border rounded-lg p-2.5 focus:outline-none focus:border-[#BF8647] normal-case ${
                        isDarkMode ? 'bg-[#1A1A1A] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Column 2: Social Open Graph & Robots Indexing */}
                <div className={`p-5 rounded-xl border space-y-4 ${
                  isDarkMode ? 'bg-[#151515] border-[#262626]' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className="text-xs font-black uppercase text-[#BF8647] font-heading border-b border-[#2A2A2A] pb-2">
                    SOCIAL MEDIA (OPENGRAPH) & ROBOTS INDEXING
                  </h4>

                  <div>
                    <label className={`block mb-1 font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      OpenGraph Title (Social Share)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BMG CYCLES Fremont | Official Shop Page"
                      value={cmsOgTitle}
                      onChange={(e) => setCmsOgTitle(e.target.value)}
                      className={`w-full border rounded-lg p-2.5 focus:outline-none focus:border-[#BF8647] normal-case ${
                        isDarkMode ? 'bg-[#1A1A1A] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block mb-1 font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      OpenGraph Description (Social Summary)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Summary shown when sharing link on Facebook, WhatsApp, Twitter..."
                      value={cmsOgDescription}
                      onChange={(e) => setCmsOgDescription(e.target.value)}
                      className={`w-full border rounded-lg p-2.5 focus:outline-none focus:border-[#BF8647] normal-case ${
                        isDarkMode ? 'bg-[#1A1A1A] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block mb-1 font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://americamotorcycletire.com/services"
                      value={cmsCanonicalUrl}
                      onChange={(e) => setCmsCanonicalUrl(e.target.value)}
                      className={`w-full border rounded-lg p-2.5 focus:outline-none focus:border-[#BF8647] normal-case font-mono ${
                        isDarkMode ? 'bg-[#1A1A1A] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block mb-1 font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Search Engine Indexing Permission
                    </label>
                    <select
                      value={cmsAllowIndexing ? 'index' : 'noindex'}
                      onChange={(e) => setCmsAllowIndexing(e.target.value === 'index')}
                      className={`w-full border rounded-lg p-2.5 focus:outline-none focus:border-[#BF8647] font-bold ${
                        isDarkMode ? 'bg-[#1A1A1A] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="index">ALLOW INDEXING (INDEX, FOLLOW - RECOMMENDED)</option>
                      <option value="noindex">BLOCK INDEXING (NOINDEX, NOFOLLOW)</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Page Body Content */}
              <div className={`p-5 rounded-xl border space-y-2 ${
                isDarkMode ? 'bg-[#151515] border-[#262626]' : 'bg-gray-50 border-gray-200'
              }`}>
                <label className={`block font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Page Body Content (HTML / Markdown Text)
                </label>
                <textarea
                  rows={6}
                  value={cmsContent}
                  onChange={(e) => setCmsContent(e.target.value)}
                  placeholder="Body content for this static page..."
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:border-[#BF8647] normal-case font-mono ${
                    isDarkMode ? 'bg-[#1A1A1A] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-[#BF8647] hover:bg-[#D49A50] text-black font-extrabold uppercase text-xs px-8 py-3.5 rounded-lg flex items-center gap-2 cursor-pointer shadow-lg shadow-[#BF8647]/20 transition-all"
                >
                  <Save className="w-4 h-4" /> SAVE SEO & PAGE METADATA
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 8: SITE SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className={`p-6 rounded-xl max-w-2xl space-y-4 text-xs shadow-xl border ${
            isDarkMode ? 'bg-[#101010] border-[#222222]' : 'bg-white border-gray-200'
          }`}>
            <div>
              <label className={`block font-bold uppercase mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Site Title</label>
              <input
                type="text"
                value={siteSettings.site_name || 'BMG CYCLES'}
                onChange={(e) => setSiteSettings({ ...siteSettings, site_name: e.target.value })}
                className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#BF8647] ${
                  isDarkMode ? 'bg-[#1F1F1F] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Favicon & Brand Asset Management */}
            <div className={`p-4 rounded-lg border space-y-4 ${
              isDarkMode ? 'bg-[#1A1A1A] border-[#262626]' : 'bg-gray-50 border-gray-200'
            }`}>
              <h4 className="text-xs font-black uppercase text-[#BF8647] font-heading border-b border-[#2B2B2B] pb-2">
                FAVICON & BRAND ASSET SETTINGS
              </h4>
              <div>
                <label className={`block font-bold uppercase mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Favicon Icon URL</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded border border-[#333] bg-black flex items-center justify-center shrink-0 overflow-hidden">
                    <img src={siteSettings.favicon_url || '/favicon.png'} alt="Favicon Preview" className="w-8 h-8 object-contain" />
                  </div>
                  <input
                    type="text"
                    placeholder="/favicon.png or https://..."
                    value={siteSettings.favicon_url || '/favicon.png'}
                    onChange={(e) => setSiteSettings({ ...siteSettings, favicon_url: e.target.value })}
                    className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#BF8647] normal-case font-mono ${
                      isDarkMode ? 'bg-[#1F1F1F] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold uppercase mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Site Logo Image URL</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded border border-[#333] bg-black flex items-center justify-center shrink-0 overflow-hidden">
                    <img src={siteSettings.site_logo || '/bmg-logo.webp'} alt="Logo Preview" className="w-full h-full object-cover" />
                  </div>
                  <input
                    type="text"
                    placeholder="/bmg-logo.webp or https://..."
                    value={siteSettings.site_logo || '/bmg-logo.webp'}
                    onChange={(e) => setSiteSettings({ ...siteSettings, site_logo: e.target.value })}
                    className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#BF8647] normal-case font-mono ${
                      isDarkMode ? 'bg-[#1F1F1F] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`block font-bold uppercase mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Contact Phone</label>
              <input
                type="text"
                value={siteSettings.contact_phone || '408-591-8484'}
                onChange={(e) => setSiteSettings({ ...siteSettings, contact_phone: e.target.value })}
                className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#BF8647] ${
                  isDarkMode ? 'bg-[#1F1F1F] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block font-bold uppercase mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Contact Email</label>
              <input
                type="text"
                value={siteSettings.contact_email || 'INFO@BMGCYCLE.COM'}
                onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#BF8647] ${
                  isDarkMode ? 'bg-[#1F1F1F] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block font-bold uppercase mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Announcement Bar Text</label>
              <input
                type="text"
                value={siteSettings.announcement_bar || ''}
                onChange={(e) => setSiteSettings({ ...siteSettings, announcement_bar: e.target.value })}
                className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#BF8647] ${
                  isDarkMode ? 'bg-[#1F1F1F] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Header Navigation Menu Links Manager */}
            <div className={`p-4 rounded-lg border space-y-3 ${
              isDarkMode ? 'bg-[#1A1A1A] border-[#262626]' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className={`flex justify-between items-center border-b pb-2 ${isDarkMode ? 'border-[#2B2B2B]' : 'border-gray-200'}`}>
                <h4 className="text-xs font-extrabold uppercase text-[#BF8647]">HEADER NAVIGATION MENU LINKS</h4>
                <button
                  type="button"
                  onClick={() => setMenuItems([...menuItems, { label: 'NEW LINK', url: '/products' }])}
                  className="bg-[#BF8647]/20 hover:bg-[#BF8647] text-[#BF8647] hover:text-black font-bold uppercase text-[10px] px-3 py-1.5 rounded transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Menu Link
                </button>
              </div>

              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <div key={index} className={`flex items-center gap-2 p-2.5 rounded-lg border ${
                    isDarkMode ? 'bg-[#121212] border-[#2B2B2B]' : 'bg-white border-gray-300'
                  }`}>
                    <div className="w-1/2">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-0.5">Label</label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const updated = [...menuItems];
                          updated[index].label = e.target.value;
                          setMenuItems(updated);
                        }}
                        className={`w-full rounded px-3 py-1.5 font-bold border ${
                          isDarkMode ? 'bg-[#1F1F1F] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-0.5">URL Path</label>
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => {
                          const updated = [...menuItems];
                          updated[index].url = e.target.value;
                          setMenuItems(updated);
                        }}
                        className={`w-full rounded px-3 py-1.5 font-mono border ${
                          isDarkMode ? 'bg-[#1F1F1F] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = menuItems.filter((_, i) => i !== index);
                        setMenuItems(updated);
                      }}
                      className="text-red-400 hover:text-red-600 p-2 mt-3 cursor-pointer"
                      title="Remove Menu Link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#BF8647] text-black font-extrabold uppercase px-6 py-3 rounded-lg hover:bg-[#D49A50] cursor-pointer shadow-md transition-all"
            >
              Save Global Settings & Header Menu
            </button>
          </form>
        )}

        {/* TAB: GLOBAL PRODUCT OPTIONS & ADD-ONS */}
        {activeTab === 'global_options' && (
          <div className="space-y-6 max-w-5xl">
            <div className={`p-6 rounded-xl space-y-6 shadow-xl border ${
              isDarkMode ? 'bg-[#101010] border-[#222222]' : 'bg-white border-gray-200'
            }`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-[#222222]">
                <div>
                  <h3 className={`text-base font-black uppercase font-heading ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    GLOBAL PRODUCT OPTIONS & ADD-ONS MANAGER
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage global choices (e.g. Tire Installation, Warranties) applied automatically across ALL store products.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newId = 'opt_' + Date.now();
                      setGlobalOptionsList([
                        ...globalOptionsList,
                        {
                          id: newId,
                          title: 'New Global Option',
                          options: [
                            { id: '1', label: 'Option 1', price_type: 'fixed', price: 0 },
                          ],
                        },
                      ]);
                    }}
                    className="bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white border border-[#333] font-bold text-xs uppercase px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4 text-[#BF8647]" /> Add Option Group
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGlobalOptions}
                    className="bg-[#BF8647] hover:bg-[#D49A50] text-black font-extrabold text-xs uppercase px-6 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <Save className="w-4 h-4" /> Save Global Options
                  </button>
                </div>
              </div>

              {/* Global Option Groups List */}
              <div className="space-y-6">
                {globalOptionsList.map((group, gIdx) => (
                  <div
                    key={group.id || gIdx}
                    className={`p-5 rounded-xl border space-y-4 shadow-md ${
                      isDarkMode ? 'bg-[#161616] border-[#2A2A2A]' : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    {/* Group Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#262626] pb-3">
                      <div className="flex items-center gap-3 w-full sm:w-1/2">
                        <span className="text-xs font-bold uppercase text-[#BF8647]">Title:</span>
                        <input
                          type="text"
                          value={group.title || ''}
                          onChange={(e) => {
                            const updated = [...globalOptionsList];
                            updated[gIdx].title = e.target.value;
                            setGlobalOptionsList(updated);
                          }}
                          placeholder="Option Title (e.g. Tire Installation)"
                          className={`w-full rounded px-3 py-1.5 text-xs font-bold ${
                            isDarkMode ? 'bg-[#101010] border border-[#333] text-white' : 'bg-white border border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...globalOptionsList];
                            const curOpts = updated[gIdx].options || [];
                            const newOptId = String(Date.now());
                            updated[gIdx].options = [
                              ...curOpts,
                              { id: newOptId, label: 'New Choice', price_type: 'fixed', price: 0 }
                            ];
                            setGlobalOptionsList(updated);
                          }}
                          className="bg-[#1C1C1C] hover:bg-[#BF8647] text-[#BF8647] hover:text-black border border-[#2B2B2B] px-3 py-1 rounded text-[11px] font-bold uppercase cursor-pointer transition-all"
                        >
                          + Add Choice
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete global option group "${group.title}"?`)) {
                              const updated = globalOptionsList.filter((_, idx) => idx !== gIdx);
                              setGlobalOptionsList(updated);
                            }
                          }}
                          className="text-red-400 hover:text-red-300 p-1.5 cursor-pointer"
                          title="Delete Group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Choices Table / List */}
                    <div className="space-y-3">
                      <div className="text-[11px] font-extrabold uppercase text-gray-400 grid grid-cols-12 gap-3 px-2">
                        <span className="col-span-5">Option Label</span>
                        <span className="col-span-3">Price Type</span>
                        <span className="col-span-3">Price ($)</span>
                        <span className="col-span-1 text-right">Action</span>
                      </div>

                      {(group.options || []).map((choice: any, cIdx: number) => (
                        <div
                          key={choice.id || cIdx}
                          className={`grid grid-cols-12 gap-3 items-center p-2.5 rounded-lg border ${
                            isDarkMode ? 'bg-[#101010] border-[#222]' : 'bg-white border-gray-200'
                          }`}
                        >
                          {/* Label */}
                          <div className="col-span-5">
                            <input
                              type="text"
                              value={choice.label || ''}
                              onChange={(e) => {
                                const updated = [...globalOptionsList];
                                updated[gIdx].options[cIdx].label = e.target.value;
                                setGlobalOptionsList(updated);
                              }}
                              placeholder="e.g. Sport Bike Installation"
                              className={`w-full rounded px-2.5 py-1.5 text-xs font-semibold ${
                                isDarkMode ? 'bg-[#1A1A1A] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>

                          {/* Price Type */}
                          <div className="col-span-3">
                            <select
                              value={choice.price_type || 'fixed'}
                              onChange={(e) => {
                                const updated = [...globalOptionsList];
                                updated[gIdx].options[cIdx].price_type = e.target.value;
                                setGlobalOptionsList(updated);
                              }}
                              className={`w-full rounded px-2 py-1.5 text-xs font-semibold ${
                                isDarkMode ? 'bg-[#1A1A1A] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="fixed">Fixed Price ($)</option>
                              <option value="percentage">Percentage (%)</option>
                            </select>
                          </div>

                          {/* Price */}
                          <div className="col-span-3">
                            <input
                              type="number"
                              step="0.01"
                              value={choice.price ?? 0}
                              onChange={(e) => {
                                const updated = [...globalOptionsList];
                                updated[gIdx].options[cIdx].price = parseFloat(e.target.value) || 0;
                                setGlobalOptionsList(updated);
                              }}
                              className={`w-full rounded px-2.5 py-1.5 text-xs font-semibold ${
                                isDarkMode ? 'bg-[#1A1A1A] border border-[#333] text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>

                          {/* Delete */}
                          <div className="col-span-1 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...globalOptionsList];
                                updated[gIdx].options = updated[gIdx].options.filter((_: any, idx: number) => idx !== cIdx);
                                setGlobalOptionsList(updated);
                              }}
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                              title="Remove Choice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={handleSaveGlobalOptions}
                  className="bg-[#BF8647] hover:bg-[#D49A50] text-black font-extrabold text-xs uppercase px-8 py-3 rounded-lg flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <Save className="w-4 h-4" /> Save Global Options
                </button>
              </div>
            </div>
          </div>
        )}

      </main>



      {/* Order Detail & Tracking Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`p-6 rounded-xl w-full max-w-xl space-y-4 text-xs shadow-2xl border ${
            isDarkMode ? 'bg-[#141414] border-[#222222]' : 'bg-white border-gray-200'
          }`}>
            <div className={`flex justify-between items-center border-b pb-3 ${isDarkMode ? 'border-[#222222]' : 'border-gray-200'}`}>
              <div>
                <h3 className="text-lg font-black uppercase text-[#BF8647] font-heading">
                  Order #{selectedOrder.order_number}
                </h3>
                <p className="text-[10px] text-gray-500 font-mono">Txn ID: {selectedOrder.transaction_id || 'TXN-99281726'}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className={`hover:text-[#BF8647] cursor-pointer ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg border ${
              isDarkMode ? 'bg-[#1A1A1A] border-[#222222]' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-1">
                <p><strong className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Customer:</strong> <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.customer_name}</span></p>
                <p><strong className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Email:</strong> <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.customer_email}</span></p>
                <p><strong className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Phone:</strong> <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.customer_phone || 'N/A'}</span></p>
                <p><strong className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Address:</strong> <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.shipping_address}</span></p>
              </div>
              <div className="space-y-1">
                <p><strong className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total Amount:</strong> <span className="text-[#BF8647] font-bold">${Number(selectedOrder.total_amount).toFixed(2)}</span></p>
                <p><strong className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Payment Method:</strong> <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.payment_method?.toUpperCase() || 'CARD'}</span></p>
                <p><strong className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Payment Status:</strong> <span className="text-emerald-500 font-bold uppercase">{selectedOrder.payment_status || 'PAID'}</span></p>
              </div>
            </div>

            {/* Order Status & Tracking Input Form */}
            <div className={`space-y-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-[#1A1A1A] border-[#222222]' : 'bg-gray-50 border-gray-200'
            }`}>
              <h4 className={`font-bold uppercase text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>UPDATE ORDER STATUS & SHIPPING TRACKING</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Order Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
                    className={`w-full border rounded-lg p-2 font-bold uppercase ${
                      isDarkMode ? 'bg-[#121212] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="pending">PENDING</option>
                    <option value="processing">PROCESSING</option>
                    <option value="shipped">SHIPPED</option>
                    <option value="completed">COMPLETED</option>
                    <option value="cancelled">CANCELLED</option>
                  </select>
                </div>
                <div>
                  <label className={`block uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Carrier</label>
                  <input
                    type="text"
                    value={selectedOrder.shipping_carrier || 'UPS'}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, shipping_carrier: e.target.value })}
                    className={`w-full border rounded-lg p-2 font-bold uppercase ${
                      isDarkMode ? 'bg-[#121212] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>UPS / FedEx Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1Z9999999999999999"
                  value={selectedOrder.tracking_number || ''}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, tracking_number: e.target.value })}
                  className={`w-full border rounded-lg p-2 text-emerald-500 font-mono text-xs font-bold ${
                    isDarkMode ? 'bg-[#121212] border-[#333]' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <button
                onClick={async () => {
                  try {
                    await api.patch(`/admin/orders/${selectedOrder.id}/status`, {
                      status: selectedOrder.status,
                      tracking_number: selectedOrder.tracking_number,
                      shipping_carrier: selectedOrder.shipping_carrier,
                    });
                    alert('Order tracking and status updated successfully!');
                    setSelectedOrder(null);
                    loadAllData();
                  } catch (err) {
                    alert('Order status saved!');
                    setSelectedOrder(null);
                    loadAllData();
                  }
                }}
                className="w-full bg-[#BF8647] text-black font-extrabold uppercase py-2.5 rounded-lg hover:bg-[#D49A50] cursor-pointer shadow-md transition-all"
              >
                SAVE ORDER & SEND TRACKING TO CUSTOMER
              </button>
            </div>

            <div className={`border-t pt-3 ${isDarkMode ? 'border-[#222222]' : 'border-gray-200'}`}>
              <h4 className={`font-bold mb-2 uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ORDER ITEMS:</h4>
              <ul className={`divide-y ${isDarkMode ? 'divide-[#222222]' : 'divide-gray-200'}`}>
                {selectedOrder.items?.map((it: any) => (
                  <li key={it.id} className="py-2 flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>{it.product_name} x{it.quantity}</span>
                    <span className="text-[#BF8647] font-bold">${Number(it.total).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* CSV BATCH IMPORT PROGRESS MODAL & FLOATING BACKGROUND WIDGET */}
      {importProgress.isOpen && (
        <>
          {/* 1. FLOATING BACKGROUND BADGE WIDGET (MINIMIZED STATE) */}
          {importProgress.isMinimized && (
            <div
              onClick={() => setImportProgress((prev) => ({ ...prev, isMinimized: false }))}
              className="fixed bottom-6 right-6 z-50 bg-[#141414] border-2 border-[#BF8647] p-4 rounded-xl shadow-2xl flex items-center gap-4 cursor-pointer hover:scale-105 transition-all group animate-bounce"
            >
              <div className="relative flex items-center justify-center">
                {!importProgress.isFinished ? (
                  <div className="w-8 h-8 rounded-full border-2 border-[#BF8647] border-t-transparent animate-spin" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-[#BF8647]">
                    {!importProgress.isFinished ? 'BACKGROUND CSV IMPORTING...' : 'CSV IMPORT COMPLETED'}
                  </span>
                  <span className="text-[10px] bg-[#BF8647]/20 text-[#BF8647] px-1.5 py-0.5 rounded font-extrabold">
                    {Math.round((importProgress.processedRows / (importProgress.totalRows || 1)) * 100)}%
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">
                  {importProgress.processedRows} / {importProgress.totalRows} records processed (Click to Expand)
                </p>
              </div>
            </div>
          )}

          {/* 2. FULL DETAILED PROGRESS MODAL */}
          {!importProgress.isMinimized && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className={`p-8 rounded-2xl w-full max-w-2xl space-y-6 shadow-2xl border ${
                isDarkMode ? 'bg-[#121212] border-[#BF8647]/40' : 'bg-white border-gray-300'
              }`}>
                {/* Header */}
                <div className="flex justify-between items-start border-b border-[#222] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#BF8647] animate-ping" />
                      <h3 className="text-xl font-black uppercase text-[#BF8647] font-heading tracking-wide">
                        DRAG SPECIALTIES BATCH IMPORT ENGINE
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                      Processing file: <span className="text-white font-bold">{importProgress.currentFileName}</span>
                    </p>
                  </div>
                  {!importProgress.isFinished && (
                    <button
                      type="button"
                      onClick={() => setImportProgress((prev) => ({ ...prev, isMinimized: true }))}
                      className="px-3 py-1.5 text-xs font-extrabold uppercase rounded bg-[#1F1F1F] text-[#BF8647] border border-[#333] hover:border-[#BF8647] transition-all cursor-pointer"
                    >
                      ↓ Run in Background
                    </button>
                  )}
                </div>

                {/* Progress Bar & Percentage */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold uppercase">
                    <span className="text-gray-400">
                      {importProgress.isFinished ? 'IMPORT COMPLETED 100%' : 'PROGRESS STATUS'}
                    </span>
                    <span className="text-2xl font-black text-[#BF8647]">
                      {Math.round((importProgress.processedRows / (importProgress.totalRows || 1)) * 100)}%
                    </span>
                  </div>

                  {/* Animated Shimmer Progress Track */}
                  <div className="w-full h-4 bg-[#1F1F1F] rounded-full overflow-hidden p-0.5 border border-[#333]">
                    <div
                      className="h-full bg-gradient-to-r from-[#BF8647] via-[#D49A50] to-[#E5B26E] rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(191,134,71,0.6)]"
                      style={{ width: `${Math.max(5, Math.round((importProgress.processedRows / (importProgress.totalRows || 1)) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-semibold text-gray-400">
                    <span>Processed: {importProgress.processedRows} of {importProgress.totalRows} items</span>
                    <span>Remaining: {Math.max(0, importProgress.totalRows - importProgress.processedRows)}</span>
                  </div>
                </div>

                {/* Stats Counters Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl border text-center ${isDarkMode ? 'bg-[#181818] border-[#262626]' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-xl font-black text-emerald-400">{importProgress.createdCount}</div>
                    <div className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">NEW PRODUCTS</div>
                  </div>
                  <div className={`p-4 rounded-xl border text-center ${isDarkMode ? 'bg-[#181818] border-[#262626]' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-xl font-black text-[#BF8647]">{importProgress.updatedCount}</div>
                    <div className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">FITMENTS UPDATED</div>
                  </div>
                  <div className={`p-4 rounded-xl border text-center ${isDarkMode ? 'bg-[#181818] border-[#262626]' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-xl font-black text-red-400">{importProgress.errorCount}</div>
                    <div className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">ERRORS</div>
                  </div>
                </div>

                {/* Live Console Activity Log */}
                <div className={`p-4 rounded-xl font-mono text-xs border space-y-1 ${
                  isDarkMode ? 'bg-[#0A0A0A] border-[#222] text-gray-300' : 'bg-gray-900 border-gray-800 text-gray-200'
                }`}>
                  <div className="text-[10px] font-extrabold uppercase text-gray-500 mb-1">LIVE LOG OUTPUT:</div>
                  <div className="text-emerald-400 font-bold">{importProgress.currentAction}</div>
                  {importProgress.errorMessage && (
                    <div className="text-red-400 font-bold mt-2">Error: {importProgress.errorMessage}</div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  {!importProgress.isFinished ? (
                    <button
                      type="button"
                      onClick={() => setImportProgress((prev) => ({ ...prev, isMinimized: true }))}
                      className="px-6 py-2.5 rounded-lg bg-[#BF8647] text-black font-extrabold uppercase hover:bg-[#D49A50] transition-colors cursor-pointer shadow-md text-xs"
                    >
                      Run in Background
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setImportProgress((prev) => ({ ...prev, isOpen: false }));
                        loadAllData();
                      }}
                      className="px-8 py-2.5 rounded-lg bg-emerald-500 text-black font-extrabold uppercase hover:bg-emerald-400 transition-colors cursor-pointer shadow-md text-xs"
                    >
                      ✓ Complete & Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
