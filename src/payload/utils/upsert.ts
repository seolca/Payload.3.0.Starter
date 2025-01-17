import { getPayload } from '@/lib/payload'
import type { Where } from 'payload/types'
import type { Config } from '~/payload-types'

interface UpsertOptions<T extends keyof Config['collections']> {
  collection: T
  data: Omit<Config['collections'][T], 'createdAt' | 'id' | 'updatedAt' | 'sizes'>
  where: Where
}

export const payloadUpsert = async <T extends keyof Config['collections']>({
  collection,
  data,
  where
}: UpsertOptions<T>): Promise<Config['collections'][T] | null> => {
  const payload = await getPayload()
  try {
    const existingDocs = await payload.find({
      collection,
      where,
      pagination: false,
      limit: 1
    })

    const existingDocId = existingDocs.docs?.at(0)?.id
    if (existingDocId) {
      const updatedDoc = await payload.update({
        collection,
        id: existingDocId,
        data: data as any
      })

      return updatedDoc as unknown as Config['collections'][T] | null
    }

    const newDoc = await payload.create({
      collection,
      data
    })

    return newDoc as unknown as Config['collections'][T]
  } catch (error) {
    console.error(`Error in payloadUpsert: ${error}`)
    throw new Error(`Failed to upsert document in collection ${collection}`)
  }
}
