'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useState } from 'react'
import type { User } from '~/payload-types'
import { Fieldset } from '@/components/ui/FieldSet'
import { Card, CardContent } from '@/components/ui/Card'
import { updateUser } from './actions'
import { useFormState } from 'react-dom'
import { toast } from 'sonner'
import DeleteAccountSection from './DeleteAccountSection'

type UserFormData = User & {
  companyName?: string
  phone?: string
  address?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
}

const ProfileForm = ({ user }: { user: User }) => {
  const [formData, setFormData] = useState<UserFormData>(user)

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const [response, updateUserAction, isPending] = useFormState(async () => {
    const response = await updateUser(formData)
    if (!response || !response.user) return null
    toast.success('Profile updated successfully!', { duration: 2000, position: 'top-center', dismissible: true })
    return response
  }, null)

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-left">
        <h2 className="text-3xl font-bold tracking-tight">Update Profile</h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Make changes to your profile details below.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        <Card className="h-full">
          <CardContent className="p-6">
            <form action={updateUserAction} className="space-y-4">
              <Fieldset>
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleOnChange}
                      placeholder="Your name"
                      className="w-full"
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={handleOnChange}
                      placeholder="Your email"
                      className="w-full"
                      disabled={isPending}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </Fieldset>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card className="h-full">
            <CardContent className="p-6">
              <DeleteAccountSection />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfileForm
