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
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-3xl font-bold">Update Profile</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Make changes to your profile details below.</p>
      </div>
      <div className="space-y-4">
        <form action={updateUserAction} className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <Label className="text-base font-bold" htmlFor="user-email">
                E-mail
              </Label>
              <p className="!mb-4 text-sm text-zinc-500">This is the email address you use to log in to your account.</p>
              <Fieldset>
                <Input disabled name="email" id="user-email" placeholder="Enter your email" type="email" value={formData.email} />
              </Fieldset>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Fieldset>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Enter your name" value={formData?.name || ''} onChange={handleOnChange} />
              </Fieldset>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Fieldset>
                <Label className="text-base" htmlFor="companyName">
                  Company Name
                </Label>
                <p className="!mb-4 text-sm text-zinc-500">Your company name for billing purposes.</p>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Enter your company name"
                  value={formData?.companyName || ''}
                  onChange={handleOnChange}
                />
              </Fieldset>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Fieldset>
                <Label className="text-base" htmlFor="phone">
                  Phone Number
                </Label>
                <p className="!mb-4 text-sm text-zinc-500">Your contact phone number.</p>
                <Input id="phone" name="phone" type="tel" placeholder="Enter your phone number" value={formData?.phone || ''} onChange={handleOnChange} />
              </Fieldset>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Label className="text-base">Address</Label>
              <p className="!mb-4 text-sm text-zinc-500">Your billing address.</p>
              <div className="space-y-4">
                <Fieldset>
                  <Label htmlFor="address.line1">Street Address</Label>
                  <Input
                    id="address.line1"
                    name="address.line1"
                    placeholder="Enter your street address"
                    value={formData?.address?.line1 || ''}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, line1: e.target.value } })}
                  />
                </Fieldset>
                <Fieldset>
                  <Label htmlFor="address.line2">Apartment, suite, etc.</Label>
                  <Input
                    id="address.line2"
                    name="address.line2"
                    placeholder="Enter apartment, suite, etc."
                    value={formData?.address?.line2 || ''}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, line2: e.target.value } })}
                  />
                </Fieldset>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Fieldset>
                    <Label htmlFor="address.city">City</Label>
                    <Input
                      id="address.city"
                      name="address.city"
                      placeholder="Enter city"
                      value={formData?.address?.city || ''}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                    />
                  </Fieldset>
                  <Fieldset>
                    <Label htmlFor="address.state">State/Province</Label>
                    <Input
                      id="address.state"
                      name="address.state"
                      placeholder="Enter state"
                      value={formData?.address?.state || ''}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                    />
                  </Fieldset>
                  <Fieldset>
                    <Label htmlFor="address.postalCode">ZIP/Postal Code</Label>
                    <Input
                      id="address.postalCode"
                      name="address.postalCode"
                      placeholder="Enter postal code"
                      value={formData?.address?.postalCode || ''}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, postalCode: e.target.value } })}
                    />
                  </Fieldset>
                </div>
                <Fieldset>
                  <Label htmlFor="address.country">Country</Label>
                  <Input
                    id="address.country"
                    name="address.country"
                    placeholder="Enter country"
                    value={formData?.address?.country || ''}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                  />
                </Fieldset>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid grid-cols-1 gap-x-6 gap-y-4 pt-6 md:grid-cols-2">
              <Label className="text-base md:col-span-2" htmlFor="password">
                Change Password
              </Label>
              <Fieldset>
                <Label className="text-left" htmlFor="password">
                  New Password
                </Label>
                <Input id="password" name="password" placeholder="Enter a new password" type="password" onChange={handleOnChange} />
              </Fieldset>
              <Fieldset>
                <Label className="text-left" htmlFor="confirmPassword">
                  Confirm Password
                </Label>
                <Input id="confirmPassword" name="confirmPassword" placeholder="Confirm your new password" type="password" onChange={handleOnChange} />
              </Fieldset>
            </CardContent>
          </Card>
          <Button className="w-fit" type="submit">
            {isPending ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
        <DeleteAccountSection />
      </div>
    </div>
  )
}

export default ProfileForm
