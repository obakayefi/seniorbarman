"use client"
import React from 'react'
import { PageHeader } from '@/components/ui/page-header'

interface DashboardLayoutWrapperProps {
    title: string
    description?: string
    headerAction?: React.ReactNode
    children: React.ReactNode
    className?: string
}

export function DashboardLayoutWrapper({
    title,
    description,
    headerAction,
    children,
    className = ""
}: DashboardLayoutWrapperProps) {
    return (
        <div className={`md:p-10 p-6 w-full space-y-8 min-h-screen bg-background text-foreground transition-colors ${className}`}>
            <PageHeader title={title}>
                {headerAction}
            </PageHeader>
            {description && (
                <p className="text-muted-foreground text-sm -mt-6">{description}</p>
            )}
            <div className="space-y-8">
                {children}
            </div>
        </div>
    )
}
