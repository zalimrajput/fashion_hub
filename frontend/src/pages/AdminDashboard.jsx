import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  BadgeDollarSign,
  Bot,
  Box,
  Download,
  LogOut,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  RefreshCcw,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  clearStoredAdminAuth,
  createProduct,
  createTrainingItem,
  deleteProduct,
  deleteTrainingItem,
  getAdminProfile,
  getConversations,
  getCustomers,
  getOrders,
  getProducts,
  getStoredAdminAuth,
  getTrainingItems,
  loginAdmin,
  setStoredAdminAuth,
  updateProduct,
  updateTrainingItem,
} from '../services/adminApi.js'

const PRODUCT_TEMPLATE = {
  productName: '',
  category: '',
  subCategory: '',
  description: '',
  price: '',
  discount: '0',
  sizes: '',
  colors: '',
  stock: '0',
  gender: 'Unisex',
  season: 'All Season',
  isTrending: false,
  isBestSeller: false,
  status: true,
}

const TRAINING_TEMPLATE = {
  intent: '',
  category: 'General',
  question: '',
  answer: '',
  keywords: '',
  language: 'English',
  isActive: true,
}

const TRAINING_CATEGORIES = [
  'Greeting',
  'Product',
  'Price',
  'Size',
  'Color',
  'Delivery',
  'Order',
  'Tracking',
  'Return',
  'Exchange',
  'Complaint',
  'Discount',
  'General',
]

const PRODUCT_GENDERS = ['Men', 'Women', 'Unisex', 'Boys', 'Girls']
const PRODUCT_SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter', 'All Season']

const DASHBOARD_TABS = [
  { id: 'overview', label: 'Overview', icon: ShieldCheck },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'conversations', label: 'Conversations', icon: MessageSquare },
  { id: 'training', label: 'Train AI', icon: Bot },
  { id: 'export', label: 'Export Data', icon: Download },
]

function parseCsvList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function displayName(entity) {
  if (!entity) return '—'
  return entity.name || entity.fullName || entity.email || entity.phoneNumber || '—'
}

function formatCurrency(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return `$${amount.toFixed(2)}`
}

function LoadingPanel({ label = 'Loading dashboard data...' }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
      <RefreshCcw size={20} className="mx-auto animate-spin text-gray-400" />
      <p className="mt-4 text-sm text-gray-500">{label}</p>
    </div>
  )
}

function statCard(Icon, label, value, tone = 'indigo') {
  const tones = {
    indigo: 'from-indigo-500 to-purple-600',
    emerald: 'from-emerald-500 to-green-600',
    amber: 'from-amber-500 to-orange-500',
    rose: 'from-rose-500 to-pink-600',
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-2xl bg-linear-to-br p-3 text-white ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

function DataPanel({ title, subtitle, action, children, panelRef }) {
  return (
    <section ref={panelRef} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {subtitle ? <p className="text-sm text-gray-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
      <p className="text-base font-medium text-gray-700">{title}</p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [authForm, setAuthForm] = useState({
    password: '',
  })
  const [auth, setAuth] = useState(() => getStoredAdminAuth())
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [conversations, setConversations] = useState([])
  const [trainingItems, setTrainingItems] = useState([])

  const [productForm, setProductForm] = useState(PRODUCT_TEMPLATE)
  const [productFiles, setProductFiles] = useState([])
  const [editingProductId, setEditingProductId] = useState('')
  const [productActionId, setProductActionId] = useState('')
  const productFormRef = useRef(null)

  const [trainingForm, setTrainingForm] = useState(TRAINING_TEMPLATE)
  const [editingTrainingId, setEditingTrainingId] = useState('')

  const dashboardReady = Boolean(auth?.token)

  const stats = useMemo(() => {
    const orderRevenue = orders.reduce((sum, order) => {
      const total = Number(order.grandTotal)
      return Number.isFinite(total) ? sum + total : sum
    }, 0)
    const unresolvedConversations = conversations.filter((item) => !item.isResolved).length
    return {
      products: products.length,
      customers: customers.length,
      orders: orders.length,
      orderRevenue,
      unresolvedConversations,
      trainings: trainingItems.length,
    }
  }, [products, customers, orders, conversations, trainingItems])

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5),
    [orders],
  )

  const recentCustomers = useMemo(
    () => [...customers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [customers],
  )

  const recentConversations = useMemo(
    () => [...conversations].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5),
    [conversations],
  )

  async function loadDashboardData() {
    setLoading(true)
    setError('')

    try {
      const [
        profileResult,
        productsResult,
        customersResult,
        ordersResult,
        conversationsResult,
        trainingResult,
      ] = await Promise.allSettled([
        getAdminProfile(),
        getProducts(),
        getCustomers(),
        getOrders(),
        getConversations(),
        getTrainingItems(),
      ])

      const failures = []

      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value.data || null)
      } else {
        failures.push('profile')
        if (profileResult.reason?.response?.status === 401) {
          clearStoredAdminAuth()
          setAuth(null)
          return
        }
      }

      if (productsResult.status === 'fulfilled') {
        setProducts(productsResult.value.data || [])
      } else {
        failures.push('products')
      }

      if (customersResult.status === 'fulfilled') {
        setCustomers(customersResult.value.data || [])
      } else {
        failures.push('customers')
      }

      if (ordersResult.status === 'fulfilled') {
        setOrders(ordersResult.value.data || [])
      } else {
        failures.push('orders')
      }

      if (conversationsResult.status === 'fulfilled') {
        setConversations(conversationsResult.value.data || [])
      } else {
        failures.push('conversations')
      }

      if (trainingResult.status === 'fulfilled') {
        setTrainingItems(trainingResult.value.data || [])
      } else {
        failures.push('training')
      }

      if (failures.length > 0) {
        setError(`Could not load: ${failures.join(', ')}`)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
      setInitialLoadDone(true)
    }
  }

  useEffect(() => {
    if (dashboardReady) {
      loadDashboardData()
    }
  }, [dashboardReady])

  function resetProductForm() {
    setProductForm(PRODUCT_TEMPLATE)
    setProductFiles([])
    setEditingProductId('')
  }

  function resetTrainingForm() {
    setTrainingForm(TRAINING_TEMPLATE)
    setEditingTrainingId('')
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await loginAdmin({ password: authForm.password })
      const nextAuth = { token: response.token, admin: response.data }
      setStoredAdminAuth(nextAuth)
      setAuth(nextAuth)
      setProfile(response.data || null)
      setMessage('Admin login successful.')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  function handleAuthFailure(err) {
    if (err?.response?.status === 401) {
      clearStoredAdminAuth()
      setAuth(null)
      setError('Session expired. Please log in again.')
      return true
    }
    return false
  }

  async function handleProductSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const formData = new FormData()

      Object.entries(productForm).forEach(([key, value]) => {
        if (key === 'sizes' || key === 'colors') {
          formData.append(key, JSON.stringify(parseCsvList(value)))
          return
        }

        if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false')
          return
        }

        formData.append(key, value)
      })

      Array.from(productFiles).forEach((file) => {
        formData.append('images', file)
      })

      if (editingProductId) {
        await updateProduct(editingProductId, formData)
        setMessage('Product updated successfully.')
      } else {
        await createProduct(formData)
        setMessage('Product added successfully.')
      }

      resetProductForm()
      await loadDashboardData()
      setActiveTab('products')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      if (!handleAuthFailure(err)) {
        setError(err.response?.data?.message || err.message || 'Unable to save product.')
      }
    } finally {
      setLoading(false)
    }
  }

  function startEditProduct(product) {
    setEditingProductId(product._id)
    setProductForm({
      productName: product.productName || '',
      category: product.category || '',
      subCategory: product.subCategory || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      discount: String(product.discount ?? 0),
      sizes: (product.sizes || []).join(', '),
      colors: (product.colors || []).join(', '),
      stock: String(product.stock ?? 0),
      gender: product.gender || 'Unisex',
      season: product.season || 'All Season',
      isTrending: Boolean(product.isTrending),
      isBestSeller: Boolean(product.isBestSeller),
      status: product.status !== false,
    })
    setProductFiles([])
    setActiveTab('products')
    setMessage(`Editing "${product.productName}". Update the form above and click Update Product.`)
    window.requestAnimationFrame(() => {
      productFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  async function handleDeleteProduct(productId) {
    const product = products.find((item) => item._id === productId)
    const productLabel = product?.productName || 'this product'
    if (!window.confirm(`Delete "${productLabel}" permanently?`)) return

    setProductActionId(productId)
    setError('')
    setMessage('')

    try {
      await deleteProduct(productId)
      setMessage(`"${productLabel}" deleted successfully.`)
      if (editingProductId === productId) {
        resetProductForm()
      }
      await loadDashboardData()
    } catch (err) {
      if (!handleAuthFailure(err)) {
        setError(err.response?.data?.message || err.message || 'Unable to delete product.')
      }
    } finally {
      setProductActionId('')
    }
  }

  async function handleTrainingSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const payload = {
        ...trainingForm,
        keywords: parseCsvList(trainingForm.keywords),
      }

      if (editingTrainingId) {
        await updateTrainingItem(editingTrainingId, payload)
        setMessage('Training item updated successfully.')
      } else {
        await createTrainingItem(payload)
        setMessage('Training item created successfully.')
      }

      resetTrainingForm()
      await loadDashboardData()
      setActiveTab('training')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to save training item.')
    } finally {
      setLoading(false)
    }
  }

  function startEditTraining(item) {
    setEditingTrainingId(item._id)
    setTrainingForm({
      intent: item.intent || '',
      category: item.category || 'General',
      question: item.question || '',
      answer: item.answer || '',
      keywords: (item.keywords || []).join(', '),
      language: item.language || 'English',
      isActive: item.isActive !== false,
    })
    setActiveTab('training')
  }

  async function handleDeleteTraining(trainingId) {
    if (!window.confirm('Delete this training item?')) return

    setLoading(true)
    setError('')
    setMessage('')

    try {
      await deleteTrainingItem(trainingId)
      setMessage('Training item deleted successfully.')
      if (editingTrainingId === trainingId) {
        resetTrainingForm()
      }
      await loadDashboardData()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to delete training item.')
    } finally {
      setLoading(false)
    }
  }

  function handleExport(type) {
    const datasets = {
      products,
      customers,
      orders,
      conversations,
      training: trainingItems,
      complete: { products, customers, orders, conversations, training: trainingItems, profile },
    }

    const content = JSON.stringify(datasets[type], null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fashionhub-${type}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    setMessage(`${type} export downloaded.`)
  }

  function logout() {
    clearStoredAdminAuth()
    setAuth(null)
    setProfile(null)
    setProducts([])
    setCustomers([])
    setOrders([])
    setConversations([])
    setTrainingItems([])
    setInitialLoadDone(false)
    resetProductForm()
    resetTrainingForm()
  }

  if (!dashboardReady) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-linear-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 text-white shadow-2xl">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-indigo-100 hover:text-white">
              <ArrowLeft size={16} />
              Back to chat assistant
            </Link>
            <div className="mt-10 max-w-lg">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-indigo-100">
                <ShieldCheck size={14} />
                Admin Control Center
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight">
                Manage products, customers, orders, conversations, exports, and AI training in one place.
              </h1>
              <p className="mt-4 text-base text-indigo-100/90">
                Sign in to manage live products, customers, orders, conversations, exports, and AI training data.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Admin Login</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the admin password to open the dashboard.
                </p>
              </div>
              <div className="rounded-full bg-gray-100 p-2">
                <ShieldCheck size={18} className="text-gray-700" />
              </div>
            </div>

            <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Admin password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                required
              />

              {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
              {message ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60"
              >
                {loading ? 'Please wait...' : 'Open Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <ArrowLeft size={16} />
              Chat App
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Fashion Hub Admin Dashboard</h1>
              <p className="text-sm text-gray-500">
                {profile?.fullName || auth?.admin?.fullName
                  ? `Signed in as ${profile?.fullName || auth?.admin?.fullName}${profile?.role ? ` (${profile.role})` : ''}`
                  : 'Signed in'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <nav className="space-y-1">
            {DASHBOARD_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeTab === id ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="space-y-6">
          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
          {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}

          {activeTab === 'overview' ? (
            !initialLoadDone && loading ? (
              <LoadingPanel />
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {statCard(Box, 'Products', stats.products, 'indigo')}
                  {statCard(Users, 'Customers', stats.customers, 'emerald')}
                  {statCard(ShoppingCart, 'Orders', stats.orders, 'amber')}
                  {statCard(BadgeDollarSign, 'Order Revenue', formatCurrency(stats.orderRevenue), 'rose')}
                  {statCard(MessageSquare, 'Open Conversations', stats.unresolvedConversations, 'indigo')}
                  {statCard(Bot, 'Training Items', stats.trainings, 'emerald')}
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <DataPanel title="Recent Orders" subtitle={`${recentOrders.length} latest records from the database`}>
                    {recentOrders.length === 0 ? (
                      <EmptyState title="No orders yet" description="Orders will appear here once customers place them." />
                    ) : (
                      <div className="space-y-3">
                        {recentOrders.map((order) => (
                          <div key={order._id} className="rounded-xl border border-gray-200 px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-gray-900">{order.orderId}</p>
                                <p className="mt-1 text-sm text-gray-500">{displayName(order.customer)}</p>
                              </div>
                              <span className="text-sm font-medium text-gray-700">{formatCurrency(order.grandTotal)}</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">{formatDate(order.updatedAt || order.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </DataPanel>

                  <DataPanel title="Recent Customers" subtitle={`${recentCustomers.length} latest records from the database`}>
                    {recentCustomers.length === 0 ? (
                      <EmptyState title="No customers yet" description="Customer records will appear here once they are created." />
                    ) : (
                      <div className="space-y-3">
                        {recentCustomers.map((customer) => (
                          <div key={customer._id} className="rounded-xl border border-gray-200 px-4 py-3">
                            <p className="font-medium text-gray-900">{displayName(customer)}</p>
                            <p className="mt-1 text-sm text-gray-500">{customer.email || '—'}</p>
                            <p className="mt-2 text-xs text-gray-400">{formatDate(customer.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </DataPanel>
                </div>

                <DataPanel title="Recent Conversations" subtitle={`${recentConversations.length} latest records from the database`}>
                  {recentConversations.length === 0 ? (
                    <EmptyState title="No conversations yet" description="Conversation history will appear here once messages are stored." />
                  ) : (
                    <div className="space-y-3">
                      {recentConversations.map((conversation) => (
                        <div key={conversation._id} className="rounded-xl border border-gray-200 px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-gray-900">{displayName(conversation.customer)}</p>
                              <p className="mt-1 text-sm text-gray-500">{conversation.platform || '—'}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs ${conversation.isResolved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {conversation.isResolved ? 'Resolved' : 'Open'}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{conversation.lastMessage || '—'}</p>
                          <p className="mt-2 text-xs text-gray-400">{formatDate(conversation.updatedAt || conversation.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </DataPanel>
              </>
            )
          ) : null}

          {activeTab === 'products' ? (
            !initialLoadDone && loading ? (
              <LoadingPanel label="Loading products..." />
            ) : (
            <>
              <DataPanel
                panelRef={productFormRef}
                title={editingProductId ? 'Edit Product' : 'Add Product'}
                subtitle={editingProductId ? 'Update the selected product and save your changes.' : 'Create new catalog items in MongoDB.'}
                action={
                  editingProductId ? (
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel edit
                    </button>
                  ) : null
                }
              >
                <form onSubmit={handleProductSubmit} className="grid gap-4 lg:grid-cols-2">
                  <input className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="Product name" value={productForm.productName} onChange={(e) => setProductForm((prev) => ({ ...prev, productName: e.target.value }))} required />
                  <input className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="Category" value={productForm.category} onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))} required />
                  <input className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="Sub category" value={productForm.subCategory} onChange={(e) => setProductForm((prev) => ({ ...prev, subCategory: e.target.value }))} />
                  <input className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="Price" type="number" min="0" step="0.01" value={productForm.price} onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))} required />
                  <input className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="Discount %" type="number" min="0" value={productForm.discount} onChange={(e) => setProductForm((prev) => ({ ...prev, discount: e.target.value }))} />
                  <input className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="Stock" type="number" min="0" value={productForm.stock} onChange={(e) => setProductForm((prev) => ({ ...prev, stock: e.target.value }))} />
                  <input className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="Sizes (comma separated)" value={productForm.sizes} onChange={(e) => setProductForm((prev) => ({ ...prev, sizes: e.target.value }))} />
                  <input className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="Colors (comma separated)" value={productForm.colors} onChange={(e) => setProductForm((prev) => ({ ...prev, colors: e.target.value }))} />
                  <select className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400" value={productForm.gender} onChange={(e) => setProductForm((prev) => ({ ...prev, gender: e.target.value }))}>
                    {PRODUCT_GENDERS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                  <select className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400" value={productForm.season} onChange={(e) => setProductForm((prev) => ({ ...prev, season: e.target.value }))}>
                    {PRODUCT_SEASONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                    <input type="checkbox" checked={productForm.isTrending} onChange={(e) => setProductForm((prev) => ({ ...prev, isTrending: e.target.checked }))} />
                    Trending product
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                    <input type="checkbox" checked={productForm.isBestSeller} onChange={(e) => setProductForm((prev) => ({ ...prev, isBestSeller: e.target.checked }))} />
                    Best seller
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                    <input type="checkbox" checked={productForm.status} onChange={(e) => setProductForm((prev) => ({ ...prev, status: e.target.checked }))} />
                    Active
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setProductFiles(e.target.files)}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700"
                  />
                  <textarea
                    className="min-h-32 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 lg:col-span-2"
                    placeholder="Description"
                    value={productForm.description}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-60 lg:col-span-2"
                  >
                    <Plus size={16} />
                    {editingProductId ? 'Update Product' : 'Add Product'}
                  </button>
                </form>
              </DataPanel>

              <DataPanel title="Product Inventory" subtitle={`${products.length} products available`}>
                {products.length === 0 ? (
                  <EmptyState title="No products found" description="Create your first product using the form above." />
                ) : (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {products.map((product) => (
                      <article key={product._id} className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">{product.productName}</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {product.category} {product.subCategory ? `• ${product.subCategory}` : ''} {product.gender ? `• ${product.gender}` : ''}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditProduct(product)}
                              disabled={productActionId === product._id}
                              aria-label={`Edit ${product.productName}`}
                              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product._id)}
                              disabled={productActionId === product._id}
                              aria-label={`Delete ${product.productName}`}
                              className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {productActionId === product._id ? <RefreshCcw size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            </button>
                          </div>
                        </div>
                        <p className="mt-3 line-clamp-3 text-sm text-gray-600">{product.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{formatCurrency(product.price)}</span>
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">Stock {product.stock}</span>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{product.status ? 'Active' : 'Inactive'}</span>
                          {product.isTrending ? <span className="rounded-full bg-pink-50 px-3 py-1 text-pink-700">Trending</span> : null}
                          {product.isBestSeller ? <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700">Best Seller</span> : null}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </DataPanel>
            </>
            )
          ) : null}

          {activeTab === 'customers' ? (
            !initialLoadDone && loading ? (
              <LoadingPanel label="Loading customers..." />
            ) : (
            <DataPanel title="Customers" subtitle={`${customers.length} customer records`}>
              {customers.length === 0 ? (
                <EmptyState title="No customers found" description="Customer data will appear here once the backend returns records." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-gray-500">
                      <tr>
                        <th className="pb-3 pr-4 font-medium">Name</th>
                        <th className="pb-3 pr-4 font-medium">Email</th>
                        <th className="pb-3 pr-4 font-medium">Phone</th>
                        <th className="pb-3 pr-4 font-medium">Orders</th>
                        <th className="pb-3 pr-4 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {customers.map((customer) => (
                        <tr key={customer._id}>
                          <td className="py-3 pr-4 font-medium text-gray-900">{displayName(customer)}</td>
                          <td className="py-3 pr-4 text-gray-600">{customer.email || '—'}</td>
                          <td className="py-3 pr-4 text-gray-600">{customer.phoneNumber || customer.whatsappNumber || '—'}</td>
                          <td className="py-3 pr-4 text-gray-600">{customer.orderHistory?.length || 0}</td>
                          <td className="py-3 pr-4 text-gray-600">{formatDate(customer.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DataPanel>
            )
          ) : null}

          {activeTab === 'orders' ? (
            !initialLoadDone && loading ? (
              <LoadingPanel label="Loading orders..." />
            ) : (
            <DataPanel title="Orders" subtitle={`${orders.length} order records`}>
              {orders.length === 0 ? (
                <EmptyState title="No orders found" description="Placed orders will appear here." />
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <article key={order._id} className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">{order.orderId}</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {displayName(order.customer)} • {order.paymentMethod || '—'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{order.status}</span>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{order.paymentStatus}</span>
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{formatCurrency(order.grandTotal)}</span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-gray-600">
                        {order.products?.length || 0} products • {order.shippingAddress}, {order.city}, {order.province}
                      </p>
                      <p className="mt-2 text-xs text-gray-400">Updated {formatDate(order.updatedAt)}</p>
                    </article>
                  ))}
                </div>
              )}
            </DataPanel>
            )
          ) : null}

          {activeTab === 'conversations' ? (
            !initialLoadDone && loading ? (
              <LoadingPanel label="Loading conversations..." />
            ) : (
            <DataPanel title="Conversations" subtitle={`${conversations.length} customer conversation threads`}>
              {conversations.length === 0 ? (
                <EmptyState title="No conversations found" description="WhatsApp and Instagram conversations will appear here." />
              ) : (
                <div className="space-y-4">
                  {conversations.map((conversation) => (
                    <article key={conversation._id} className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {displayName(conversation.customer)}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {conversation.platform || '—'} • {conversation.lastIntent || conversation.intent || '—'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{conversation.sentiment}</span>
                          <span className={`rounded-full px-3 py-1 ${conversation.isResolved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {conversation.isResolved ? 'Resolved' : 'Open'}
                          </span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-gray-700">{conversation.lastMessage || '—'}</p>
                      <p className="mt-2 text-xs text-gray-400">
                        {conversation.messages?.length || 0} messages • Updated {formatDate(conversation.updatedAt)}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </DataPanel>
            )
          ) : null}

          {activeTab === 'training' ? (
            !initialLoadDone && loading ? (
              <LoadingPanel label="Loading training data..." />
            ) : (
            <>
              <DataPanel
                title={editingTrainingId ? 'Edit Training Response' : 'Train AI Responses'}
                subtitle="Add intent examples and curated answers for the assistant."
                action={
                  editingTrainingId ? (
                    <button
                      type="button"
                      onClick={resetTrainingForm}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel edit
                    </button>
                  ) : null
                }
              >
                <form onSubmit={handleTrainingSubmit} className="grid gap-4 lg:grid-cols-2">
                  <input className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="Intent" value={trainingForm.intent} onChange={(e) => setTrainingForm((prev) => ({ ...prev, intent: e.target.value }))} required />
                  <select className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400" value={trainingForm.category} onChange={(e) => setTrainingForm((prev) => ({ ...prev, category: e.target.value }))}>
                    {TRAINING_CATEGORIES.map((option) => <option key={option}>{option}</option>)}
                  </select>
                  <input className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 lg:col-span-2" placeholder="Keywords (comma separated)" value={trainingForm.keywords} onChange={(e) => setTrainingForm((prev) => ({ ...prev, keywords: e.target.value }))} />
                  <input className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 lg:col-span-2" placeholder="Question" value={trainingForm.question} onChange={(e) => setTrainingForm((prev) => ({ ...prev, question: e.target.value }))} required />
                  <input className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="Language" value={trainingForm.language} onChange={(e) => setTrainingForm((prev) => ({ ...prev, language: e.target.value }))} />
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                    <input type="checkbox" checked={trainingForm.isActive} onChange={(e) => setTrainingForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
                    Active response
                  </label>
                  <textarea className="min-h-28 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 lg:col-span-2" placeholder="Answer" value={trainingForm.answer} onChange={(e) => setTrainingForm((prev) => ({ ...prev, answer: e.target.value }))} required />
                  <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-60 lg:col-span-2">
                    <Bot size={16} />
                    {editingTrainingId ? 'Update Training Item' : 'Save Training Item'}
                  </button>
                </form>
              </DataPanel>

              <DataPanel title="Training Library" subtitle={`${trainingItems.length} AI response records`}>
                {trainingItems.length === 0 ? (
                  <EmptyState title="No training data found" description="Use the form above to add the first AI response item." />
                ) : (
                  <div className="space-y-4">
                    {trainingItems.map((item) => (
                      <article key={item._id} className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">{item.intent}</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {item.category} • {item.language} • {item.isActive ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => startEditTraining(item)} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50">
                              <Pencil size={15} />
                            </button>
                            <button type="button" onClick={() => handleDeleteTraining(item._id)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-700">{item.question}</p>
                        <p className="mt-2 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">{item.answer}</p>
                      </article>
                    ))}
                  </div>
                )}
              </DataPanel>
            </>
            )
          ) : null}

          {activeTab === 'export' ? (
            !initialLoadDone && loading ? (
              <LoadingPanel label="Preparing export data..." />
            ) : (
            <DataPanel title="Export Data" subtitle="Download JSON snapshots of the current dashboard datasets.">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ['products', 'Product catalog'],
                  ['customers', 'Customer directory'],
                  ['orders', 'Order history'],
                  ['conversations', 'Conversation archive'],
                  ['training', 'AI training set'],
                  ['complete', 'Full dashboard export'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleExport(key)}
                    className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="mt-1 text-xs text-gray-500">Download {key}.json</p>
                    </div>
                    <Download size={18} className="text-gray-500" />
                  </button>
                ))}
              </div>
            </DataPanel>
            )
          ) : null}
        </main>
      </div>
    </div>
  )
}
