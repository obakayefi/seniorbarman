"use client"
import NButton from '@/components/native/NButton'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React from 'react'

const NoAccess = () => {
  const router = useRouter()
  return (
    <div className='h-screen flex flex-col gap-2 items-center justify-center'>
      <h3 className='text-red-400 text-3xl'>Access Denied</h3>
      <p>You are not authorized to view this page</p>
      <Button onClick={() => router.push("/u/dashboard")}>Go to homepage</Button>
    </div>
  )
}

export default NoAccess