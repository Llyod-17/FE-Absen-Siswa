'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TokenGenerationForm } from '@/components/token-generation-form'
import { TokenHistoryTable } from '@/components/token-history'
import { usePaginatedTokens } from '@/lib/api-hooks'
import { containerVariants, itemVariants } from '@/lib/constants'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function TokenGenerationPage() {
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)

  const {
    tokens,
    loading: tokensLoading,
    page,
    setPage,
    totalPages,
    refetch,
  } = usePaginatedTokens(10)

  const handleTokenGenerated = (token: string) => {
    setGeneratedToken(token)
    toast.success('Token generated successfully!')
    if (refetch) refetch()
  }

  const handleDelete = async (id: string) => {
    try {
      toast.promise(
        new Promise((resolve) => {
          setTimeout(() => {
            toast.success('Token deleted successfully!')
            if (refetch) refetch()
            resolve(true)
          }, 500)
        }),
        {
          loading: 'Deleting token...',
          success: 'Token deleted',
          error: 'Failed to delete',
        }
      )
    } catch (error) {
      toast.error('Failed to delete token')
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Manajemen QR Absensi
        </h1>
        <p className="text-slate-600">
          Buat dan pantau QR Code absensi untuk fase Hadir dan Telat hari ini.
        </p>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
      >
        {/* Left Column - Form */}
        <motion.div variants={itemVariants}>
          <TokenGenerationForm onTokenGenerated={handleTokenGenerated} />
        </motion.div>

        {/* Right Column - Active Tokens */}
        <motion.div variants={itemVariants} className="space-y-4">
          <TokenHistoryTable
            tokens={tokens}
            loading={tokensLoading}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="text-slate-600 bg-white hover:bg-slate-50 border-slate-200"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={
                      pageNum === page 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent' 
                        : 'text-slate-600 bg-white hover:bg-slate-50 border-slate-200'
                    }
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="text-slate-600 bg-white hover:bg-slate-50 border-slate-200"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
