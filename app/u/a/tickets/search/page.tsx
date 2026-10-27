"use client"
import React, { useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Search, SearchIcon, TicketIcon, AlertCircle, Trash2 } from 'lucide-react'
import api from '@/lib/axios'
import { Spinner } from '@/components/ui/spinner'
import TicketCarousel from '@/app/u/tickets/[id]/TicketCarousel'
import { useApp } from '@/context/AppContext'

const AdminTicketSearch = () => {
    const { user: adminUser } = useApp()
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState('')

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setIsLoading(true)
        setError('')
        setResult(null)

        try {
            const { data } = await api.get(`/admin/tickets/search?q=${searchQuery.trim()}`)
            setResult(data)
        } catch (error: any) {
            console.error("Error searching ticket", error)
            setError(error.response?.data?.error || "Ticket not found or error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='md:p-10 p-6 w-full space-y-10'>
            <PageHeader title="Ticket Lookup" />

            <div className="max-w-2xl mx-auto space-y-8">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="text-muted-foreground group-focus-within:text-orange-500 transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Ticket ID, Token, or Number..."
                        className="w-full bg-muted/50 border border-border group-hover:border-border focus:border-orange-500/50 rounded-sm py-4 pl-12 pr-4 text-foreground placeholder-zinc-500 outline-none transition-all duration-300"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="absolute right-2 top-2 bottom-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-foreground px-6 rounded-sm font-bold text-sm transition-all"
                    >
                        {isLoading ? <Spinner /> : "Search"}
                    </button>
                </form>

                {/* Error State */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-sm flex items-center gap-3 text-red-500">
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Result State */}
                {result && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-muted-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                <TicketIcon size={16} /> Result Found
                            </h3>
                            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20 font-bold uppercase">
                                Active Match
                            </span>
                        </div>

                        <div className="bg-mutedborder border-border rounded-sm p-2 sm:p-0 overflow-hidden">
                            <TicketCarousel
                                tickets={[result.ticket]}
                                eventInfo={result.event}
                                user={result.user}
                            />
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!result && !isLoading && !error && (
                    <div className="text-center py-20 space-y-4">
                        <div className="w-20 h-20 bg-mutedrounded-full flex items-center justify-center mx-auto border border-border">
                            <SearchIcon className="text-zinc-700" size={32} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-foreground font-bold">No search performed</h3>
                            <p className="text-muted-foreground text-sm">Enter a ticket identifier above to audit details</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminTicketSearch
