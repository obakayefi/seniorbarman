import TicketGrantWizard from '@/components/features/admin/TicketGrantWizard'
import { PageHeader } from '@/components/ui/page-header'
import React from 'react'

const TicketGrantWizardPage = () => {
    return (
        <div className='md:p-10 p-6 w-full space-y-10'>
            <PageHeader title="Ticket Grant Wizard" description="Create accounts and grant tickets for guests who need admin assistance." />
            <TicketGrantWizard />
        </div>
    )
}

export default TicketGrantWizardPage
