"use client"
import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, Upload, X } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"

export default function ConfigurationsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    
    // Config state
    const [settings, setSettings] = useState<Record<string, any>>({})
    const [events, setEvents] = useState<any[]>([])
    
    // Form specific state
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
                setSettings(loadedSettings)
                setRootHeading(loadedSettings.root_event_card_heading || "")
                setRootSubheading(loadedSettings.root_event_card_subheading || "")
                setRootEventId(loadedSettings.root_event_card_event_id || "")
                setEventsBannerPreview(loadedSettings.events_page_cover_image || null)
                setSeoTitle(loadedSettings.global_seo_title || "")
                setSeoDescription(loadedSettings.global_seo_description || "")
                setHeroHeading(loadedSettings.root_hero_heading || "")
                setHeroSubheading(loadedSettings.root_hero_subheading || "")
                
                // Only show active regular events for the card picker
                const activeEvents = (eventsRes.data.events || []).filter((e: any) => e.type === 'event' && new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
                setEvents(activeEvents)
            } catch (error) {
                toast.error("Failed to load configurations")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSaveConfig = async (configData: { key: string, value: string }[]) => {
        setSaving(true)
        try {
            await Promise.all(configData.map(data => api.patch('/settings', data)))
            toast.success("Configurations saved successfully!")
        } catch (error) {
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
        if (e.target.files && e.target.files[0]) {
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
        } catch (error) {
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
                <p className="text-zinc-500">Manage global settings, dynamic text, and UI overrides.</p>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Global SEO Settings */}
                <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:bg-white/[0.07] transition-all duration-500 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-50" />
                    <CardHeader className="relative z-10 border-b border-white/5 pb-6">
                        <CardTitle className="text-white text-xl font-bold tracking-tight">Global SEO Settings</CardTitle>
                        <CardDescription className="text-zinc-400">Configure the browser tab title and search engine description.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10 pt-6">
                        <div className="space-y-2">
                            <Label className="text-zinc-300 font-medium">Page Title</Label>
                            <Input 
                                placeholder="e.g., Senior Barman | Events & Tickets" 
                                value={seoTitle}
                                onChange={(e) => setSeoTitle(e.target.value)}
                                className={`bg-black/20 text-white rounded-xl transition-all backdrop-blur-sm px-4 py-6 ${seoTitle ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50'}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300 font-medium">Meta Description</Label>
                            <Input 
                                placeholder="Learn about our top rated entertainment..." 
                                value={seoDescription}
                                onChange={(e) => setSeoDescription(e.target.value)}
                                className={`bg-black/20 text-white rounded-xl transition-all backdrop-blur-sm px-4 py-6 ${seoDescription ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50'}`}
                            />
                        </div>
                        <Button 
                            onClick={handleSaveSeoConfig} 
                            disabled={saving}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-blue-500/25 border-0 transition-all duration-300"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save SEO Settings
                        </Button>
                    </CardContent>
                </Card>

                {/* Root Page Hero Configuration */}
                <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:bg-white/[0.07] transition-all duration-500 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-50" />
                    <CardHeader className="relative z-10 border-b border-white/5 pb-6">
                        <CardTitle className="text-white text-xl font-bold tracking-tight">Root Page Hero Text</CardTitle>
                        <CardDescription className="text-zinc-400">Configure the main introduction text on the homepage.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10 pt-6">
                        <div className="space-y-2">
                            <Label className="text-zinc-300 font-medium">Hero Heading</Label>
                            <Input 
                                placeholder="e.g., Buy Tickets for the Moments You Show Up For" 
                                value={heroHeading}
                                onChange={(e) => setHeroHeading(e.target.value)}
                                className={`bg-black/20 text-white rounded-xl transition-all backdrop-blur-sm px-4 py-6 ${heroHeading ? 'border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.15)]' : 'border-white/10 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50'}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300 font-medium">Hero Sub-heading</Label>
                            <Input 
                                placeholder="e.g., Home matches. Concerts. Parties..." 
                                value={heroSubheading}
                                onChange={(e) => setHeroSubheading(e.target.value)}
                                className={`bg-black/20 text-white rounded-xl transition-all backdrop-blur-sm px-4 py-6 ${heroSubheading ? 'border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.15)]' : 'border-white/10 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50'}`}
                            />
                        </div>
                        <Button 
                            onClick={handleSaveHeroConfig} 
                            disabled={saving}
                            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-teal-500/25 border-0 transition-all duration-300"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Hero Text
                        </Button>
                    </CardContent>
                </Card>

                {/* Root Page Card Configuration */}
                <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:bg-white/[0.07] transition-all duration-500 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-50" />
                    <CardHeader className="relative z-10 border-b border-white/5 pb-6">
                        <CardTitle className="text-white text-xl font-bold tracking-tight">Root Page Event Card</CardTitle>
                        <CardDescription className="text-zinc-400">Configure the main call-to-action event card on the homepage.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10 pt-6">
                        <div className="space-y-2">
                            <Label className="text-zinc-300 font-medium">Heading Text</Label>
                            <Input 
                                placeholder="e.g., Concerts & Parties" 
                                value={rootHeading}
                                onChange={(e) => setRootHeading(e.target.value)}
                                className={`bg-black/20 text-white rounded-xl transition-all backdrop-blur-sm px-4 py-6 ${rootHeading ? 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50'}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300 font-medium">Subheading Text</Label>
                            <Input 
                                placeholder="e.g., From Afrobeats to nightlife events..." 
                                value={rootSubheading}
                                onChange={(e) => setRootSubheading(e.target.value)}
                                className={`bg-black/20 text-white rounded-xl transition-all backdrop-blur-sm px-4 py-6 ${rootSubheading ? 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50'}`}
                            />
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
                            <p className="text-xs text-zinc-500 mt-1">
                                The selected event's flyer will be used as the background image for the card.
                            </p>
                        </div>
                        
                        <Button 
                            onClick={handleSaveTextConfig} 
                            disabled={saving}
                            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg hover:shadow-orange-500/25 border-0 transition-all duration-300"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Card Configuration
                        </Button>
                    </CardContent>
                </Card>

                {/* Events Page Banner Configuration */}
                <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:bg-white/[0.07] transition-all duration-500 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-50" />
                    <CardHeader className="relative z-10 border-b border-white/5 pb-6">
                        <CardTitle className="text-white text-xl font-bold tracking-tight">Events Page Banner</CardTitle>
                        <CardDescription className="text-zinc-400">Upload a wide banner image for the /events page cover.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10 pt-6">
                        {eventsBannerPreview && (
                            <div className="w-full aspect-[21/9] rounded-lg overflow-hidden border border-zinc-800 relative bg-zinc-900">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={eventsBannerPreview} 
                                    alt="Events Banner Preview" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-zinc-300 font-medium">Upload Banner Image (Recommended ratio 21:9)</Label>
                            <div className="relative">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleBannerFileChange}
                                    className="hidden"
                                    id="banner-upload"
                                />
                                <label 
                                    htmlFor="banner-upload"
                                    className={`flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                        eventsBannerFile 
                                            ? "border-purple-500/50 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                                            : "border-white/10 bg-black/20 hover:bg-white/5 hover:border-white/20"
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${eventsBannerFile ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-zinc-400'}`}>
                                            <Upload size={18} />
                                        </div>
                                        <span className={eventsBannerFile ? 'text-white font-medium' : 'text-zinc-400'}>
                                            {eventsBannerFile ? eventsBannerFile.name : "Browse to upload banner image"}
                                        </span>
                                    </div>
                                    {eventsBannerFile && (
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setEventsBannerFile(null);
                                                setEventsBannerPreview(null);
                                            }}
                                            className="p-1.5 rounded-full text-zinc-400 hover:bg-white/10 hover:text-white transition-colors ml-2"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </label>
                            </div>
                        </div>

                        <Button 
                            onClick={handleUploadBanner} 
                            disabled={uploading || !eventsBannerFile}
                            className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg hover:shadow-purple-500/25 border-0 transition-all duration-300"
                        >
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                            Upload and Save Banner
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
