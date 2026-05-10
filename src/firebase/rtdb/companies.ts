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
type CompanyMeta = { title: string; logo: string; website: string }

export async function savePostCompany(
  companyId: string,
  meta: CompanyMeta,
  postId: string,
  timestamp: string,
) {
  if (!companyId) throw new Error('Missing company id')
  const base = postCompaniesPath(companyId)
  const updates: Record<string, any> = {}
  updates[`${base}/meta`] = meta
  updates[`${base}/posts/${postId}`] = { id: postId, timestamp }
  return update(ref(rtdb), updates)
}

export async function removePostFromCompany(companyId: string, postId: string) {
  if (!companyId || !postId) return
  const updates: Record<string, any> = {}
  updates[`${postCompaniesPath(companyId)}/posts/${postId}`] = null
  return update(ref(rtdb), updates)
}
