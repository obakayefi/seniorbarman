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
        <div className="space-y-6">
            {/* Header bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                        <Trophy className="text-orange-500" size={18} />
                        Club Registry
                    </h2>
                    <p className="text-muted-foreground text-xs mt-1">
                        {teams.length} club{teams.length !== 1 ? 's' : ''} in the database &bull; {teams.filter(t => !t.isArchived).length} active
                    </p>
                </div>
                <Button
                    onClick={handleBulkSync}
                    disabled={syncing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-sm h-10 px-5 uppercase tracking-wider text-xs shadow-sm"
                >
                    {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
                    {syncing ? "Syncing..." : "Bulk Sync from Utils"}
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Search clubs by name or stadium..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-background border-border dark:border-zinc-700 text-foreground pl-10 rounded-sm focus:border-orange-500 transition-all h-10 text-sm"
                />
            </div>

            {loadingTeams ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    <p className="font-medium text-sm">Loading clubs...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 bg-card border border-border dark:border-zinc-800 rounded-sm shadow-sm p-8">
                    <div className="p-4 rounded-sm bg-muted border border-border">
                        <Trophy className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                        <p className="text-foreground font-bold text-base">No clubs found</p>
                        <p className="text-muted-foreground text-xs mt-1 max-w-sm">
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
        <div className={`relative group bg-card border rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-black/50 ${team.isArchived ? 'border-border opacity-50' : 'border-border dark:border-zinc-800 hover:border-orange-500/40'}`}>
            {/* Logo area */}
            <div className="aspect-square bg-muted/20 dark:bg-zinc-900/40 border-b border-border/60 dark:border-zinc-800 flex items-center justify-center p-4 relative">
                {team.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={team.logo}
                        alt={team.name}
                        className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                ) : (
                    <Trophy className="w-10 h-10 text-muted-foreground/60" />
                )}
            </div>

            {/* Name + Stadium */}
            <div className="p-3 relative z-20 bg-card">
                <p className="text-foreground text-xs font-bold leading-tight truncate">{team.name}</p>
                {team.stadium && (
                    <p className="text-muted-foreground text-[10px] truncate mt-0.5">{team.stadium}</p>
                )}
                {team.ticketTypes && team.ticketTypes.length > 0 && (
                    <Badge className="mt-1.5 text-[9px] px-1.5 py-0 bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/30 rounded-xs font-bold">
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
                    className="p-1.5 rounded-xs bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-border transition-colors shadow-sm"
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
        <div className='md:p-10 p-4 sm:p-6 w-full space-y-8 min-h-screen bg-background text-foreground pb-20'>
            <PageHeader title="Configurations">
                <p className="text-muted-foreground text-sm">Manage global settings, dynamic text, and registered clubs.</p>
            </PageHeader>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-muted/60 border border-border dark:border-zinc-800 rounded-sm p-1 gap-1 mb-8 w-full sm:w-auto">
                    <TabsTrigger
                        value="general"
                        className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-muted-foreground rounded-xs px-5 py-2 font-bold uppercase tracking-wider text-xs transition-all duration-200 flex items-center gap-2 shadow-sm"
                    >
                        <Shield size={14} /> General Settings
                    </TabsTrigger>
                    <TabsTrigger
                        value="teams"
                        className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-muted-foreground rounded-xs px-5 py-2 font-bold uppercase tracking-wider text-xs transition-all duration-200 flex items-center gap-2 shadow-sm"
                    >
                        <Trophy size={14} /> Teams
                    </TabsTrigger>
                </TabsList>

                {/* ── General Settings Tab ────────────────────────────── */}
                <TabsContent value="general">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Global SEO */}
                        <Card className="bg-card border border-border dark:border-zinc-800 rounded-sm shadow-md dark:shadow-black/40 hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500/20 via-blue-500 to-blue-500/20" />
                            <CardHeader className="border-b border-border/80 dark:border-zinc-800 bg-muted/20 dark:bg-zinc-900/40 p-5">
                                <CardTitle className="text-foreground text-base font-bold tracking-tight">Global SEO Settings</CardTitle>
                                <CardDescription className="text-muted-foreground text-xs">Configure the browser tab title and search engine description.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 sm:p-6 space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-foreground text-xs font-bold">Page Title</Label>
                                    <Input
                                        placeholder="e.g., Senior Barman | Events & Tickets"
                                        value={seoTitle}
                                        onChange={e => setSeoTitle(e.target.value)}
                                        className="bg-background border-border dark:border-zinc-700 text-foreground rounded-sm h-11 text-sm focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground text-xs font-bold">Meta Description</Label>
                                    <Input
                                        placeholder="Learn about our top rated entertainment..."
                                        value={seoDescription}
                                        onChange={e => setSeoDescription(e.target.value)}
                                        className="bg-background border-border dark:border-zinc-700 text-foreground rounded-sm h-11 text-sm focus:border-blue-500"
                                    />
                                </div>
                                <Button
                                    onClick={handleSaveSeoConfig}
                                    disabled={saving}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-sm h-10 uppercase tracking-wider text-xs shadow-sm transition-all"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save SEO Settings
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Hero Text */}
                        <Card className="bg-card border border-border dark:border-zinc-800 rounded-sm shadow-md dark:shadow-black/40 hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-teal-500/20 via-teal-500 to-teal-500/20" />
                            <CardHeader className="border-b border-border/80 dark:border-zinc-800 bg-muted/20 dark:bg-zinc-900/40 p-5">
                                <CardTitle className="text-foreground text-base font-bold tracking-tight">Root Page Hero Text</CardTitle>
                                <CardDescription className="text-muted-foreground text-xs">Configure the main introduction text on the homepage.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 sm:p-6 space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-foreground text-xs font-bold">Hero Heading</Label>
                                    <Input
                                        placeholder="e.g., Buy Tickets for the Moments You Show Up For"
                                        value={heroHeading}
                                        onChange={e => setHeroHeading(e.target.value)}
                                        className="bg-background border-border dark:border-zinc-700 text-foreground rounded-sm h-11 text-sm focus:border-teal-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground text-xs font-bold">Hero Sub-heading</Label>
                                    <Input
                                        placeholder="e.g., Home matches. Concerts. Parties..."
                                        value={heroSubheading}
                                        onChange={e => setHeroSubheading(e.target.value)}
                                        className="bg-background border-border dark:border-zinc-700 text-foreground rounded-sm h-11 text-sm focus:border-teal-500"
                                    />
                                </div>
                                <Button
                                    onClick={handleSaveHeroConfig}
                                    disabled={saving}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-sm h-10 uppercase tracking-wider text-xs shadow-sm transition-all"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Hero Text
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Root Page Event Card */}
                        <Card className="bg-card border border-border dark:border-zinc-800 rounded-sm shadow-md dark:shadow-black/40 hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-orange-500/20 via-orange-500 to-orange-500/20" />
                            <CardHeader className="border-b border-border/80 dark:border-zinc-800 bg-muted/20 dark:bg-zinc-900/40 p-5">
                                <CardTitle className="text-foreground text-base font-bold tracking-tight">Root Page Event Card</CardTitle>
                                <CardDescription className="text-muted-foreground text-xs">Configure the main call-to-action event card on the homepage.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 sm:p-6 space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-foreground text-xs font-bold">Heading Text</Label>
                                    <Input
                                        placeholder="e.g., Concerts & Parties"
                                        value={rootHeading}
                                        onChange={e => setRootHeading(e.target.value)}
                                        className="bg-background border-border dark:border-zinc-700 text-foreground rounded-sm h-11 text-sm focus:border-orange-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground text-xs font-bold">Subheading Text</Label>
                                    <Input
                                        placeholder="e.g., From Afrobeats to nightlife events..."
                                        value={rootSubheading}
                                        onChange={e => setRootSubheading(e.target.value)}
                                        className="bg-background border-border dark:border-zinc-700 text-foreground rounded-sm h-11 text-sm focus:border-orange-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground text-xs font-bold">Background Image (Select Event)</Label>
                                    <Select value={rootEventId} onValueChange={setRootEventId}>
                                        <SelectTrigger className="bg-background border-border dark:border-zinc-700 text-foreground rounded-sm h-11 text-sm focus:border-orange-500">
                                            <SelectValue placeholder="Select an active event" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border dark:border-zinc-800 text-foreground">
                                            <SelectItem value="none">Default Image</SelectItem>
                                            {events.map(event => (
                                                <SelectItem key={event._id} value={event._id}>
                                                    {event.type === 'sports' ? `${event.homeTeam?.name || event.homeTeam} vs ${event.awayTeam?.name || event.awayTeam}` : event.title} ({new Date(event.date).toLocaleDateString()})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[11px] text-muted-foreground mt-1">The selected event's flyer will be used as the background image for the card.</p>
                                </div>
                                <Button
                                    onClick={handleSaveTextConfig}
                                    disabled={saving}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-sm h-10 uppercase tracking-wider text-xs shadow-sm transition-all"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Card Configuration
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Events Page Banner */}
                        <Card className="bg-card border border-border dark:border-zinc-800 rounded-sm shadow-md dark:shadow-black/40 hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-purple-500/20 via-purple-500 to-purple-500/20" />
                            <CardHeader className="border-b border-border/80 dark:border-zinc-800 bg-muted/20 dark:bg-zinc-900/40 p-5">
                                <CardTitle className="text-foreground text-base font-bold tracking-tight">Events Page Banner</CardTitle>
                                <CardDescription className="text-muted-foreground text-xs">Upload a wide banner image for the /events page cover.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 sm:p-6 space-y-5">
                                {eventsBannerPreview && (
                                    <div className="w-full aspect-[21/9] rounded-sm overflow-hidden border border-border bg-muted shadow-sm">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={eventsBannerPreview} alt="Events Banner Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label className="text-foreground text-xs font-bold">Upload Banner Image (Recommended ratio 21:9)</Label>
                                    <div className="relative">
                                        <input type="file" accept="image/*" onChange={handleBannerFileChange} className="hidden" id="banner-upload" />
                                        <label htmlFor="banner-upload"
                                            className={`flex items-center justify-between w-full p-3.5 rounded-sm border transition-all cursor-pointer ${eventsBannerFile ? "border-purple-500 bg-purple-500/10" : "border-border dark:border-zinc-700 bg-background hover:bg-muted/50"}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xs ${eventsBannerFile ? 'bg-purple-500/20 text-purple-500 dark:text-purple-400' : 'bg-muted text-muted-foreground'}`}>
                                                    <Upload size={16} />
                                                </div>
                                                <span className={`text-xs ${eventsBannerFile ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                                                    {eventsBannerFile ? eventsBannerFile.name : "Browse to upload banner image"}
                                                </span>
                                            </div>
                                            {eventsBannerFile && (
                                                <button type="button"
                                                    onClick={e => { e.preventDefault(); setEventsBannerFile(null); setEventsBannerPreview(null) }}
                                                    className="p-1 rounded-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-2">
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleUploadBanner}
                                    disabled={uploading || !eventsBannerFile}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-sm h-10 uppercase tracking-wider text-xs shadow-sm transition-all"
                                >
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
