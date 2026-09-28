import ApplicationGrantWizard from '@/components/features/admin/ApplicationGrantWizard'
import { PageHeader } from '@/components/ui/page-header'
import React from 'react'

const ApplicationGrantWizardPage = () => {
    return (
        <div className='md:p-10 p-4 sm:p-6 w-full space-y-10 min-h-screen bg-background text-foreground'>
            <PageHeader title="Application Grant Wizard" description="Create accounts and grant audition applications/passes for candidates who need admin assistance." />
            <ApplicationGrantWizard />
        </div>
    )
}

export default ApplicationGrantWizardPage
