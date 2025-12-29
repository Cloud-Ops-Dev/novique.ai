'use client'

import { useState } from 'react'

interface LabGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: {
    slug: string
    title: string
    overview: string
    architecture: string
    setupDeployment: string
    troubleshooting: string
    businessUse: string
    workflowSvg: string
    githubUrl: string
    tags: string[]
  }) => void
}

type GenerationStep = 'input' | 'generating' | 'preview' | 'error'

export default function LabGenerationModal({
  isOpen,
  onClose,
  onComplete,
}: LabGenerationModalProps) {
  const [githubUrl, setGithubUrl] = useState('')
  const [step, setStep] = useState<GenerationStep>('input')
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [generatedData, setGeneratedData] = useState<any>(null)

  const handleGenerate = async () => {
    if (!githubUrl) {
      setError('Please enter a GitHub URL')
      return
    }

    if (!githubUrl.includes('github.com')) {
      setError('Please enter a valid GitHub URL')
      return
    }

    setStep('generating')
    setProgress('Reading repository...')
    setError('')

    try {
      const response = await fetch('/api/labs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl, generateSvg: true }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Generation failed')
      }

      // Use the data returned from generation (already saved to DB)
      const genData = result.generationData
      setGeneratedData({
        slug: result.slug,
        title: genData.sections.title,
        overview: genData.sections.overviewHtml || '',
        architecture: genData.sections.architectureHtml || '',
        setupDeployment: genData.sections.setupDeploymentHtml || '',
        troubleshooting: genData.sections.troubleshootingHtml || '',
        businessUse: genData.sections.businessUseHtml || '',
        workflowSvg: genData.workflowSvg || '',
        githubUrl: githubUrl,
        tags: genData.sections.tags || [],
      })

      setStep('preview')
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setStep('error')
    }
  }

  const handleConfirm = () => {
    if (generatedData) {
      onComplete(generatedData)
    }
  }

  const handleClose = () => {
    setStep('input')
    setGithubUrl('')
    setProgress('')
    setError('')
    setGeneratedData(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Input Step */}
          {step === 'input' && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Generate Lab from GitHub</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Enter a GitHub repository URL and AI will generate content automatically.
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="github-url" className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Repository URL
                </label>
                <input
                  id="github-url"
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>

              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-purple-900 mb-2">What AI will generate:</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Animated workflow diagram</li>
                  <li>• Lab overview and description</li>
                  <li>• Architecture explanation</li>
                  <li>• Setup and deployment guide</li>
                  <li>• Troubleshooting highlights</li>
                  <li>• Practical business use cases</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Generate
                </button>
              </div>
            </>
          )}

          {/* Generating Step */}
          {step === 'generating' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <svg
                  className="w-8 h-8 text-purple-600 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Lab Content</h3>
              <p className="text-sm text-gray-600">{progress}</p>
              <p className="text-xs text-gray-400 mt-4">This may take a minute...</p>
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && generatedData && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Generation Complete!</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Review the generated content below. You can edit it after importing.
                </p>
              </div>

              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Title</h3>
                  <p className="text-gray-900">{generatedData.title}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">Tags</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {generatedData.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">Workflow Diagram</h3>
                  {generatedData.workflowSvg ? (
                    <div
                      className="mt-2 border border-gray-200 rounded-lg overflow-hidden"
                      style={{ height: '150px' }}
                      dangerouslySetInnerHTML={{ __html: generatedData.workflowSvg }}
                    />
                  ) : (
                    <p className="text-gray-500 text-sm">No diagram generated</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">Sections Generated</h3>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li className={generatedData.overview ? 'text-green-600' : 'text-gray-400'}>
                      {generatedData.overview ? '✓' : '○'} Overview
                    </li>
                    <li className={generatedData.architecture ? 'text-green-600' : 'text-gray-400'}>
                      {generatedData.architecture ? '✓' : '○'} Architecture
                    </li>
                    <li className={generatedData.setupDeployment ? 'text-green-600' : 'text-gray-400'}>
                      {generatedData.setupDeployment ? '✓' : '○'} Setup & Deployment
                    </li>
                    <li className={generatedData.troubleshooting ? 'text-green-600' : 'text-gray-400'}>
                      {generatedData.troubleshooting ? '✓' : '○'} Troubleshooting
                    </li>
                    <li className={generatedData.businessUse ? 'text-green-600' : 'text-gray-400'}>
                      {generatedData.businessUse ? '✓' : '○'} Business Use
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Use Generated Content
                </button>
              </div>
            </>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <>
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Generation Failed</h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => setStep('input')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Try Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
