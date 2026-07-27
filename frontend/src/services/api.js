import axios from 'axios'

const API_BASE = '/api'

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
})

export async function sendChatMessage({ session_id, message, customer_id, platform, history }) {
  const { data } = await client.post('/chat', {
    session_id: String(session_id),
    message,
    customer_id: customer_id || '',
    platform: platform || 'web',
    history: history || [],
  })
  return data
}

export default client
