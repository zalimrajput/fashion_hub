import axios from 'axios'

const STORAGE_KEY = 'fashionhub_admin_auth'

const adminClient = axios.create({
  baseURL: '/backend-api',
  timeout: 30000,
})

adminClient.interceptors.request.use((config) => {
  const auth = getStoredAdminAuth()

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }

  return config
})

export function getStoredAdminAuth() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredAdminAuth(value) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export function clearStoredAdminAuth() {
  window.localStorage.removeItem(STORAGE_KEY)
}

export async function loginAdmin(payload) {
  const { data } = await adminClient.post('/admin/login', payload)
  return data
}

export async function registerAdmin(payload) {
  const { data } = await adminClient.post('/admin/register', payload)
  return data
}

export async function getAdminProfile() {
  const { data } = await adminClient.get('/admin/profile')
  return data
}

export async function getProducts() {
  const { data } = await adminClient.get('/products')
  return data
}

export async function createProduct(formData) {
  const { data } = await adminClient.post('/products', formData)
  return data
}

export async function updateProduct(productId, formData) {
  const { data } = await adminClient.put(`/products/${productId}`, formData)
  return data
}

export async function deleteProduct(productId) {
  const { data } = await adminClient.delete(`/products/${productId}`)
  return data
}

export async function getCustomers() {
  const { data } = await adminClient.get('/customers')
  return data
}

export async function getOrders() {
  const { data } = await adminClient.get('/orders')
  return data
}

export async function getConversations() {
  const { data } = await adminClient.get('/conversations')
  return data
}

export async function getTrainingItems() {
  const { data } = await adminClient.get('/training')
  return data
}

export async function createTrainingItem(payload) {
  const { data } = await adminClient.post('/training', payload)
  return data
}

export async function updateTrainingItem(trainingId, payload) {
  const { data } = await adminClient.put(`/training/${trainingId}`, payload)
  return data
}

export async function deleteTrainingItem(trainingId) {
  const { data } = await adminClient.delete(`/training/${trainingId}`)
  return data
}
