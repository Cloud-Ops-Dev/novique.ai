import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import LabForm from '@/components/labs/LabForm'

export default async function NewLabPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin' && user.role !== 'editor') {
    redirect('/editor')
  }

  const isAdmin = user.role === 'admin'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Lab</h1>
        <p className="mt-2 text-sm text-gray-700">
          Generate a lab from a GitHub repository or create one manually
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <LabForm isAdmin={isAdmin} />
      </div>
    </div>
  )
}
