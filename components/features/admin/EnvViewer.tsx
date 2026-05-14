"use client"
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Settings, Copy, Check, Loader2 } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { useDevFeatures } from "@/lib/devFeatures"

export default function EnvViewer() {
    const { showEnvViewer } = useDevFeatures();
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [envData, setEnvData] = useState<any>(null)
    const [copiedKey, setCopiedKey] = useState<string | null>(null)

    const fetchEnvVars = async () => {
        setLoading(true)
        try {
            const res = await api.get('/admin/env')
            if (res.data.success) {
                setEnvData(res.data)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to fetch environment variables")
        } finally {
            setLoading(false)
        }
    }

    const handleOpen = (isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen && !envData) {
            fetchEnvVars()
        }
    }

    const copyToClipboard = (key: string, value: string) => {
        navigator.clipboard.writeText(`${key}=${value}`)
        setCopiedKey(key)
        toast.success(`Copied ${key}`)
        setTimeout(() => setCopiedKey(null), 2000)
    }

    if (!showEnvViewer) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                >
                    <Settings className="mr-2 h-4 w-4" />
                    Environment
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Settings className="text-orange-500" />
                        Environment Variables
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Current environment configuration and settings
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin mr-2 text-orange-500" />
                        <span className="text-zinc-400">Loading environment data...</span>
                    </div>
                ) : envData ? (
                    <div className="overflow-y-auto flex-1 space-y-4 pr-2">
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                            <p className="text-xs text-zinc-500">
                                Last fetched: {new Date(envData.timestamp).toLocaleString()}
                            </p>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(envData.environment).map(([key, value]: [string, any]) => (
                                <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors group">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-bold text-orange-500 font-mono">
                                                    {key}
                                                </h4>
                                                {value === '✓ Set' && (
                                                    <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20">Set</span>
                                                )}
                                                {value === '✗ Not set' && (
                                                    <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20">Not Set</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-zinc-300 font-mono break-all">{value || <span className="text-zinc-600 italic">undefined</span>}</p>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(key, value)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            {copiedKey === key ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-zinc-500">No data loaded</div>
                )}
                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                    <Button variant="outline" onClick={() => fetchEnvVars()} disabled={loading} className="border-zinc-700">Refresh</Button>
                    <Button onClick={() => setOpen(false)} className="bg-orange-600 hover:bg-orange-700">Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
