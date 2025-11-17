import { rtdb } from '@/firebase/config'
import { ref, update } from 'firebase/database'
import { postCompaniesPath } from './helpers'

/**
 * Save or update metadata and post entry for a given company in RTDB under postCompanies
 * @param {string} companyId - Identifier for the company
 * @param {{title: string, logo: string, website: string}} meta - Company metadata
 * @param {string} postId - Identifier for the post
 * @param {string} timestamp - ISO timestamp or similar
 */
export async function savePostCompany(companyId, meta, postId, timestamp) {
  if (!companyId) throw new Error('Missing company id')
  const base = postCompaniesPath(companyId)
  const updates = {}
  updates[`${base}/meta`] = meta
  updates[`${base}/posts/${postId}`] = { id: postId, timestamp }
  return update(ref(rtdb), updates)
}

export async function removePostFromCompany(companyId, postId) {
  if (!companyId || !postId) return
  const updates = {}
  updates[`${postCompaniesPath(companyId)}/posts/${postId}`] = null
  return update(ref(rtdb), updates)
}
