"use client"
import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Switch } from '@/components/ui/switch'
import { Earth, LayoutTemplate } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { redirect } from 'next/navigation'
import api from '@/lib/axios'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

// Defines our massive matrix isolating every primary sub-tree mapped in the router
const APP_PAGES = [
    { path: '/', name: 'Homepage Main', desc: 'The public core landing node container.' },
    { path: '/events', name: 'General Events', desc: 'The main public generic ticket explorer endpoint.' },
    { path: '/rangers', name: 'Rangers FC Portal', desc: 'The dedicated sports event ticketing structure.' },
    { path: '/tickets', name: 'Purchased Hub', desc: 'The user verification view for generated tickets.' },
    { path: '/verify', name: 'Verification System', desc: 'The core payment callback pipeline resolver.' },
    { path: '/auth/login', name: 'Authentication Login', desc: 'Login gateway mapping.' },
    { path: '/auth/register', name: 'User Registration', desc: 'Registry gateway module.' },
    { path: '/u/a/dashboard', name: 'Admin Control Center', desc: 'The protected root configuration node.' },
    { path: '/u/a/scanner', name: 'Scanner App', desc: 'The dedicated physical ticket scanning utility.' },
]

export default function DevSettingsPage() {
    const { user } = useApp()
    const [globalSettings, setGlobalSettings] = useState<Record<string, any>>({})
    const [loadingGlobal, setLoadingGlobal] = useState(true)

    useEffect(() => {
        api.get('/settings').then(res => {
            if (res.data.success) {
                setGlobalSettings(res.data.settings)
            }
        }).catch(err => {
            console.error("Failed to load global matrix:", err)
        }).finally(() => setLoadingGlobal(false))
    }, [])

    if (user && user.role !== 'dev' && user.role !== 'admin') {
        redirect('/u/a/dashboard')
    }

    const toggleGlobalSetting = async (path: string, currentValue: boolean) => {
        const key = `page_active_${path}`
        setGlobalSettings(prev => ({ ...prev, [key]: !currentValue }))
        try {
            await api.patch('/settings', { key, value: !currentValue })
            toast.success(`Global routing locked on ${path}`)
        } catch (error) {
            toast.error("Failed to sync global interception flag")
            setGlobalSettings(prev => ({ ...prev, [key]: currentValue }))
        }
    }

    return (
        <div className="p-6 md:p-10 w-full space-y-12 bg-[#020202] text-white min-h-screen">
            <PageHeader title="Global Guard Matrix">
                <div />
            </PageHeader>

            <div className="max-w-6xl space-y-16">
                <div className="space-y-6 pt-4">
                    <div className="mb-10">
                        <h2 className="text-3xl sm:text-4xl font-black flex items-center gap-3 tracking-tighter">
                            <Earth className="text-orange-500 w-10 h-10" />
                            UNIVERSAL APP ROUTING
                        </h2>
                        <p className="text-zinc-500 text-sm mt-3 max-w-2xl leading-relaxed">
                            These strict switches are monitored deeply across the entire Next.js ecosystem tree via `GlobalPageGuard`. If you sever a node, ANY incoming traffic resolving to that strict `/pathname` will instantly trigger a maximum-z-index network blackout shield directly across the DOM synchronously.
                        </p>
                    </div>

                    {loadingGlobal ? (
                        <div className="flex items-center justify-center p-12">
                            <Spinner className="text-orange-500 scale-150" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {APP_PAGES.map((pageConf) => {
                                // Default represents true. Unless explicitly banned globally in DB, it loads.
                                const isActive = globalSettings[`page_active_${pageConf.path}`] !== false;
                                
                                return (
                                    <div key={pageConf.path} className={`bg-zinc-900/50 border p-6 rounded-[2rem] flex flex-col justify-between transition-all duration-500 shadow-xl group ${isActive ? 'border-zinc-800 hover:bg-zinc-900 hover:border-orange-500/30' : 'border-red-500/30 bg-red-500/5'}`}>
                                        <div className="flex justify-between items-start mb-8">
                                            <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 ${isActive ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/20 text-red-500'}`}>
                                                <LayoutTemplate />
                                            </div>
                                            <Switch 
                                                checked={isActive} 
                                                onCheckedChange={() => toggleGlobalSetting(pageConf.path, isActive)} 
                                                className="data-[state=checked]:bg-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex flex-col gap-2 mb-3">
                                                <h3 className="text-xl font-black text-white tracking-tight">{pageConf.name}</h3>
                                                {!isActive && <span className="text-[10px] w-fit bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Intercept Active</span>}
                                            </div>
                                            <p className={`text-xs font-mono mb-3 p-1.5 rounded-lg max-w-fit ${isActive ? 'text-zinc-400 bg-black/40' : 'text-red-400 bg-red-500/10'}`}>{pageConf.path}</p>
                                            <p className="text-xs text-zinc-500 font-medium leading-relaxed">{pageConf.desc}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
