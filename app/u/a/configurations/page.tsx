"use client"
import React, { useEffect, useState, useCallback } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, Upload, X, RefreshCw, Shield, Trophy, Search, Archive } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { CLUBS } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// ─── Types ──────────────────────────────────────────────────────────────────
interface DbTeam {
    _id: string
    name: string
    logo?: string
    stadium?: string
    isArchived: boolean
    managers?: any[]
    ticketTypes?: any[]
    createdAt: string
}

// ─── Teams Tab ──────────────────────────────────────────────────────────────
function TeamsTab() {
    const [teams, setTeams] = useState<DbTeam[]>([])
    const [loadingTeams, setLoadingTeams] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [search, setSearch] = useState("")

    const fetchTeams = useCallback(async () => {
        setLoadingTeams(true)
        try {
            const res = await api.get('/teams')
            setTeams(res.data.teams || [])
        } catch {
            toast.error("Failed to fetch teams")
        } finally {
            setLoadingTeams(false)
        }
    }, [])

    useEffect(() => { fetchTeams() }, [fetchTeams])

    const handleBulkSync = async () => {
        setSyncing(true)
        try {
            const res = await api.post('/teams', { teams: CLUBS })
            toast.success(res.data.message || "Teams synced successfully!")
            fetchTeams()
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Sync failed")
        } finally {
            setSyncing(false)
        }
    }

    const filtered = teams.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.stadium || "").toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-8">
            {/* Header bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Trophy className="text-orange-500" size={20} />
                        Club Registry
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1">
                        {teams.length} club{teams.length !== 1 ? 's' : ''} in the database &bull; {teams.filter(t => !t.isArchived).length} active
                    </p>
                </div>
                <Button
                    onClick={handleBulkSync}
                    disabled={syncing}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white gap-2 shadow-lg hover:shadow-emerald-500/25 border-0 transition-all duration-300"
                >
                    {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {syncing ? "Syncing..." : "Bulk Sync from Utils"}
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <Input
                    placeholder="Search clubs by name or stadium..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-black/20 border-white/10 text-white pl-10 rounded-xl focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
                />
            </div>

            {loadingTeams ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-500">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    <p className="font-medium animate-pulse">Loading clubs...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <Trophy className="w-12 h-12 text-zinc-600" />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-bold text-lg">No clubs found</p>
                        <p className="text-zinc-500 text-sm mt-1">
                            {teams.length === 0 ? "Click \"Bulk Sync from Utils\" to import clubs from the CLUBS constant." : "Try a different search term."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filtered.map((team) => (
                        <TeamCard key={team._id} team={team} onRefresh={fetchTeams} />
                    ))}
                </div>
            )}
        </div>
    )
}

function TeamCard({ team, onRefresh }: { team: DbTeam; onRefresh: () => void }) {
    const [archiving, setArchiving] = useState(false)

    const handleToggleArchive = async () => {
        setArchiving(true)
        try {
            await api.patch(`/teams/${team._id}`, { isArchived: !team.isArchived })
            toast.success(team.isArchived ? "Team restored" : "Team archived")
            onRefresh()
        } catch {
            toast.error("Action failed")
        } finally {
            setArchiving(false)
        }
    }

    return (
        <div className={`relative group bg-white/5 backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/40 ${team.isArchived ? 'border-white/5 opacity-50' : 'border-white/10 hover:border-orange-500/30'}`}>
            {/* Gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10 pointer-events-none" />

            {/* Logo area */}
            <div className="aspect-square bg-zinc-900 flex items-center justify-center p-4 relative">
                {team.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={team.logo}
                        alt={team.name}
                        className="w-full h-full object-contain drop-shadow-lg"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                ) : (
                    <Trophy className="w-10 h-10 text-zinc-700" />
                )}
            </div>

            {/* Name + Stadium */}
            <div className="px-3 pb-3 pt-1 relative z-20">
                <p className="text-white text-xs font-bold leading-tight truncate">{team.name}</p>
                {team.stadium && (
                    <p className="text-zinc-500 text-[10px] truncate mt-0.5">{team.stadium}</p>
                )}
                {team.ticketTypes && team.ticketTypes.length > 0 && (
                    <Badge className="mt-1 text-[9px] px-1.5 py-0 bg-orange-500/20 text-orange-400 border-orange-500/30">
                        {team.ticketTypes.length} ticket type{team.ticketTypes.length > 1 ? 's' : ''}
                    </Badge>
                )}
            </div>

            {/* Hover action */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                <button
                    onClick={handleToggleArchive}
                    disabled={archiving}
                    title={team.isArchived ? "Restore team" : "Archive team"}
                    className="p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-zinc-400 hover:text-white hover:bg-black/80 transition-colors"
                >
                    {archiving ? <Loader2 size={12} className="animate-spin" /> : <Archive size={12} />}
                </button>
            </div>
        </div>
    )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ConfigurationsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [events, setEvents] = useState<any[]>([])
    const [rootHeading, setRootHeading] = useState("")
    const [rootSubheading, setRootSubheading] = useState("")
    const [rootEventId, setRootEventId] = useState("")
    const [eventsBannerPreview, setEventsBannerPreview] = useState<string | null>(null)
    const [eventsBannerFile, setEventsBannerFile] = useState<File | null>(null)
    const [seoTitle, setSeoTitle] = useState("")
    const [seoDescription, setSeoDescription] = useState("")
    const [heroHeading, setHeroHeading] = useState("")
    const [heroSubheading, setHeroSubheading] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, eventsRes] = await Promise.all([
                    api.get('/settings'),
                    api.get('/admin/events')
                ])
                const loadedSettings = settingsRes.data.settings || {}
                setRootHeading(loadedSettings.root_event_card_heading || "")
                setRootSubheading(loadedSettings.root_event_card_subheading || "")
                setRootEventId(loadedSettings.root_event_card_event_id || "")
                setEventsBannerPreview(loadedSettings.events_page_cover_image || null)
                setSeoTitle(loadedSettings.global_seo_title || "")
                setSeoDescription(loadedSettings.global_seo_description || "")
                setHeroHeading(loadedSettings.root_hero_heading || "")
                setHeroSubheading(loadedSettings.root_hero_subheading || "")
                const activeEvents = (eventsRes.data.events || []).filter((e: any) =>
                    e.type === 'event' && new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0))
                )
                setEvents(activeEvents)
            } catch {
                toast.error("Failed to load configurations")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSaveConfig = async (configData: { key: string; value: string }[]) => {
        setSaving(true)
        try {
            await Promise.all(configData.map(data => api.patch('/settings', data)))
            toast.success("Configurations saved successfully!")
        } catch {
            toast.error("Failed to save configurations")
        } finally {
            setSaving(false)
        }
    }

    const handleSaveTextConfig = () => handleSaveConfig([
        { key: 'root_event_card_heading', value: rootHeading },
        { key: 'root_event_card_subheading', value: rootSubheading },
        { key: 'root_event_card_event_id', value: rootEventId }
    ])
    const handleSaveSeoConfig = () => handleSaveConfig([
        { key: 'global_seo_title', value: seoTitle },
        { key: 'global_seo_description', value: seoDescription }
    ])
    const handleSaveHeroConfig = () => handleSaveConfig([
        { key: 'root_hero_heading', value: heroHeading },
        { key: 'root_hero_subheading', value: heroSubheading }
    ])

    const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0]
            setEventsBannerFile(file)
            setEventsBannerPreview(URL.createObjectURL(file))
        }
    }

    const handleUploadBanner = async () => {
        if (!eventsBannerFile) return
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append("key", "events_page_cover_image")
            formData.append("imageFile", eventsBannerFile)
            await api.post('/settings/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success("Events page banner uploaded successfully!")
            setEventsBannerFile(null)
        } catch {
            toast.error("Failed to upload banner")
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <div className='md:p-10 p-6 w-full flex items-center justify-center min-h-[50vh]'>
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className='md:p-10 p-6 w-full space-y-10 min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#020202] to-[#020202]'>
            <PageHeader title="Configurations">
                <p className="text-zinc-500">Manage global settings, dynamic text, and registered clubs.</p>
            </PageHeader>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-zinc-900/50 border border-white/10 rounded-xl p-1 gap-1 mb-8 w-full sm:w-auto">
                    <TabsTrigger
                        value="general"
                        className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-zinc-400 rounded-lg px-6 py-2 font-bold uppercase tracking-widest text-xs transition-all duration-200 flex items-center gap-2"
                    >
                        <Shield size={14} /> General Settings
                    </TabsTrigger>
                    <TabsTrigger
                        value="teams"
                        className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-zinc-400 rounded-lg px-6 py-2 font-bold uppercase tracking-widest text-xs transition-all duration-200 flex items-center gap-2"
                    >
                        <Trophy size={14} /> Teams
                    </TabsTrigger>
                </TabsList>

                {/* ── General Settings Tab ────────────────────────────── */}
                <TabsContent value="general">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Global SEO */}
                        <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:bg-white/[0.07] transition-all duration-500 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-50 pointer-events-none" />
                            <CardHeader className="relative z-10 border-b border-white/5 pb-6">
                                <CardTitle className="text-white text-xl font-bold tracking-tight">Global SEO Settings</CardTitle>
                                <CardDescription className="text-zinc-400">Configure the browser tab title and search engine description.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10 pt-6">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300 font-medium">Page Title</Label>
                                    <Input placeholder="e.g., Senior Barman | Events & Tickets" value={seoTitle} onChange={e => setSeoTitle(e.target.value)}
                                        className={`bg-black/20 text-white rounded-xl transition-all backdrop-blur-sm px-4 py-6 ${seoTitle ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50'}`} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300 font-medium">Meta Description</Label>
                                    <Input placeholder="Learn about our top rated entertainment..." value={seoDescription} onChange={e => setSeoDescription(e.target.value)}
                                        className={`bg-black/20 text-white rounded-xl transition-all backdrop-blur-sm px-4 py-6 ${seoDescription ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50'}`} />
                                </div>
                                <Button onClick={handleSaveSeoConfig} disabled={saving}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-blue-500/25 border-0 transition-all duration-300">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save SEO Settings
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Hero Text */}
                        <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:bg-white/[0.07] transition-all duration-500 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-50 pointer-events-none" />
                            <CardHeader className="relative z-10 border-b border-white/5 pb-6">
                                <CardTitle className="text-white text-xl font-bold tracking-tight">Root Page Hero Text</CardTitle>
                                <CardDescription className="text-zinc-400">Configure the main introduction text on the homepage.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10 pt-6">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300 font-medium">Hero Heading</Label>
                                    <Input placeholder="e.g., Buy Tickets for the Moments You Show Up For" value={heroHeading} onChange={e => setHeroHeading(e.target.value)}
                                        className={`bg-black/20 text-white rounded-xl transition-all backdrop-blur-sm px-4 py-6 ${heroHeading ? 'border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.15)]' : 'border-white/10 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50'}`} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300 font-medium">Hero Sub-heading</Label>
                                    <Input placeholder="e.g., Home matches. Concerts. Parties..." value={heroSubheading} onChange={e => setHeroSubheading(e.target.value)}
                                        className={`bg-black/20 text-white rounded-xl transition-all backdrop-blur-sm px-4 py-6 ${heroSubheading ? 'border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.15)]' : 'border-white/10 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50'}`} />
                                </div>
                                <Button onClick={handleSaveHeroConfig} disabled={saving}
                                    className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-teal-500/25 border-0 transition-all duration-300">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Hero Text
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Root Page Event Card */}
                        <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:bg-white/[0.07] transition-all duration-500 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-50 pointer-events-none" />
                            <CardHeader className="relative z-10 border-b border-white/5 pb-6">
                                <CardTitle className="text-white text-xl font-bold tracking-tight">Root Page Event Card</CardTitle>
                                <CardDescription className="text-zinc-400">Configure the main call-to-action event card on the homepage.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10 pt-6">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300 font-medium">Heading Text</Label>
                                    <Input placeholder="e.g., Concerts & Parties" value={rootHeading} onChange={e => setRootHeading(e.target.value)}
                                        className={`bg-black/20 text-white rounded-xl transition-all backdrop-blur-sm px-4 py-6 ${rootHeading ? 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50'}`} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300 font-medium">Subheading Text</Label>
                                    <Input placeholder="e.g., From Afrobeats to nightlife events..." value={rootSubheading} onChange={e => setRootSubheading(e.target.value)}
                                        className={`bg-black/20 text-white rounded-xl transition-all backdrop-blur-sm px-4 py-6 ${rootSubheading ? 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50'}`} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300 font-medium">Background Image (Select Event)</Label>
                                    <Select value={rootEventId} onValueChange={setRootEventId}>
                                        <SelectTrigger className={`bg-black/20 text-white rounded-xl transition-all backdrop-blur-sm px-4 py-6 ${rootEventId && rootEventId !== 'none' ? 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50'}`}>
                                            <SelectValue placeholder="Select an active event" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                            <SelectItem value="none">Default Image</SelectItem>
                                            {events.map(event => (
                                                <SelectItem key={event._id} value={event._id}>
                                                    {event.title} ({new Date(event.date).toLocaleDateString()})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-zinc-500 mt-1">The selected event's flyer will be used as the background image for the card.</p>
                                </div>
                                <Button onClick={handleSaveTextConfig} disabled={saving}
                                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg hover:shadow-orange-500/25 border-0 transition-all duration-300">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Card Configuration
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Events Page Banner */}
                        <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:bg-white/[0.07] transition-all duration-500 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-50 pointer-events-none" />
                            <CardHeader className="relative z-10 border-b border-white/5 pb-6">
                                <CardTitle className="text-white text-xl font-bold tracking-tight">Events Page Banner</CardTitle>
                                <CardDescription className="text-zinc-400">Upload a wide banner image for the /events page cover.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10 pt-6">
                                {eventsBannerPreview && (
                                    <div className="w-full aspect-[21/9] rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={eventsBannerPreview} alt="Events Banner Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label className="text-zinc-300 font-medium">Upload Banner Image (Recommended ratio 21:9)</Label>
                                    <div className="relative">
                                        <input type="file" accept="image/*" onChange={handleBannerFileChange} className="hidden" id="banner-upload" />
                                        <label htmlFor="banner-upload"
                                            className={`flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all cursor-pointer ${eventsBannerFile ? "border-purple-500/50 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "border-white/10 bg-black/20 hover:bg-white/5 hover:border-white/20"}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-full ${eventsBannerFile ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-zinc-400'}`}>
                                                    <Upload size={18} />
                                                </div>
                                                <span className={eventsBannerFile ? 'text-white font-medium' : 'text-zinc-400'}>
                                                    {eventsBannerFile ? eventsBannerFile.name : "Browse to upload banner image"}
                                                </span>
                                            </div>
                                            {eventsBannerFile && (
                                                <button type="button"
                                                    onClick={e => { e.preventDefault(); setEventsBannerFile(null); setEventsBannerPreview(null) }}
                                                    className="p-1.5 rounded-full text-zinc-400 hover:bg-white/10 hover:text-white transition-colors ml-2">
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <Button onClick={handleUploadBanner} disabled={uploading || !eventsBannerFile}
                                    className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg hover:shadow-purple-500/25 border-0 transition-all duration-300">
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                    Upload and Save Banner
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ── Teams Tab ──────────────────────────────────────── */}
                <TabsContent value="teams">
                    <TeamsTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
