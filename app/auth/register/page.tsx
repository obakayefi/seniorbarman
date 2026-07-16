"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { PasswordStrength } from "@/components/ui/password-strength"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useInput from "@/hooks/useInput"
import axios from "axios"
import api from "@/lib/axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { toast } from "sonner"
import { User, Briefcase, Trophy, ChevronRight, ChevronLeft } from "lucide-react"

type AccountType = "user" | "organizer" | "team_manager" | null

const ACCOUNT_TYPES = [
    {
        id: "user" as AccountType,
        label: "Regular User",
        description: "Browse events, buy tickets, attend.",
        icon: User,
        color: "border-zinc-700 hover:border-zinc-400",
        activeColor: "border-orange-500 bg-orange-500/10",
        iconColor: "text-zinc-400",
        activeIconColor: "text-orange-500",
    },
    {
        id: "organizer" as AccountType,
        label: "Event Organizer",
        description: "Create and manage events on the platform.",
        icon: Briefcase,
        color: "border-zinc-700 hover:border-blue-500",
        activeColor: "border-blue-500 bg-blue-500/10",
        iconColor: "text-zinc-400",
        activeIconColor: "text-blue-400",
    },
    {
        id: "team_manager" as AccountType,
        label: "Team Manager",
        description: "Manage a sports club and its events.",
        icon: Trophy,
        color: "border-zinc-700 hover:border-emerald-500",
        activeColor: "border-emerald-500 bg-emerald-500/10",
        iconColor: "text-zinc-400",
        activeIconColor: "text-emerald-400",
    },
]

export default function Register() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState<1 | 2>(1) // 1 = basic info, 2 = account type
    const [accountType, setAccountType] = useState<AccountType>(null)
    const [teams, setTeams] = useState<any[]>([])
    const [selectedTeam, setSelectedTeam] = useState("")
    const [organizationName, setOrganizationName] = useState("")
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [teamSearch, setTeamSearch] = useState("")

    const email = useInput('')
    const firstName = useInput('')
    const lastName = useInput('')
    const password = useInput('')

    const formFilled = email.value && password.value && firstName.value && lastName.value

    useEffect(() => {
        // Pre-fetch teams for team_manager selection using public axios with cache busting
        axios.get(`/api/teams?t=${Date.now()}`)
            .then(res => setTeams(res.data.teams || []))
            .catch(() => { })
    }, [])

    const filteredTeams = teams.filter(t => 
        t.name.toLowerCase().includes(teamSearch.toLowerCase())
    )

    const handleNextStep = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setStep(2)
    }

    const handleSubmit = async () => {
        if (!accountType) {
            toast.error("Please select an account type")
            return
        }
        if (accountType === "team_manager" && !selectedTeam) {
            toast.error("Please select your team")
            return
        }

        setIsLoading(true)
        try {
            const payload: any = {
                email: email.value,
                password: password.value,
                firstName: firstName.value,
                lastName: lastName.value,
            }

            if (accountType === "organizer" || accountType === "team_manager") {
                payload.intendedRole = accountType
                if (accountType === "team_manager") payload.teamId = selectedTeam
                if (accountType === "organizer" && organizationName) payload.organizationName = organizationName
            }

            const result = await axios.post('/api/auth/register', payload, { withCredentials: true })

            if (result.data.isPendingApproval) {
                router.push('/auth/pending-approval')
            } else {
                toast.success(`Your account has been created, login to continue`)
                setTimeout(() => router.push('/auth/login'), 2000)
            }
        } catch (error: any) {
            console.error('Error registering user', { error: error.message })
            const errorMsg = error.response?.data?.error || "Registration failed"
            toast.error(errorMsg)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full text-neutral-300 mx-4 border-neutral-800 md:mx-0 max-w-lg">
            <CardHeader className="mb-4">
                <div className="flex sm:flex-row-reverse justify-between flex-col gap-4">
                    <div className="border border-zinc-900">
                        <Button className="text-neutral-400 bg-transparent w-full px-2" variant="link"
                            onClick={() => router.push('/auth/login')}>Login to your account</Button>
                    </div>
                    <div>
                        <h1 className="md:text-3xl text-slate-100 text-2xl">
                            {step === 1 ? "Create an account" : "Choose your role"}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {step === 1 ? "Put in your details to get started" : "Select how you'll be using the platform"}
                        </p>
                    </div>
                </div>
                {/* Step indicator */}
                <div className="flex items-center gap-2 mt-4">
                    <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-orange-500' : 'bg-zinc-800'}`} />
                    <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-orange-500' : 'bg-zinc-800'}`} />
                </div>
            </CardHeader>

            {step === 1 ? (
                <form onSubmit={handleNextStep}>
                    <CardContent>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" type="text" autoComplete="off" placeholder="John"
                                    value={firstName.value} onChange={firstName.onChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" type="text" placeholder="Doe"
                                    value={lastName.value} onChange={lastName.onChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="johndoe@example.com"
                                    value={email.value} onChange={email.onChange} required />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="/auth/reset-password"
                                        className="ml-auto inline-block text-zinc-700 text-sm underline-offset-4 hover:underline">
                                        Forgot your password?
                                    </Link>
                                </div>
                                <PasswordInput id="password" placeholder="* * * * * * * *" required
                                    onChange={password.onChange} value={password.value} />
                                <PasswordStrength password={password.value} />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col mt-6 gap-2">
                        <Button type="submit" disabled={!formFilled}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 flex items-center gap-2">
                            Continue <ChevronRight className="w-4 h-4" />
                        </Button>
                    </CardFooter>
                </form>
            ) : (
                <div>
                    <CardContent className="space-y-5">
                        {/* Account type cards */}
                        <div className="space-y-3">
                            {ACCOUNT_TYPES.map((type) => {
                                const Icon = type.icon
                                const isActive = accountType === type.id
                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setAccountType(type.id)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${isActive ? type.activeColor : type.color} bg-zinc-900/40`}
                                    >
                                        <div className={`p-2.5 rounded-xl transition-colors ${isActive ? 'bg-white/10' : 'bg-zinc-800'}`}>
                                            <Icon className={`w-5 h-5 transition-colors ${isActive ? type.activeIconColor : type.iconColor}`} />
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm transition-colors ${isActive ? 'text-white' : 'text-zinc-300'}`}>{type.label}</p>
                                            <p className="text-zinc-500 text-xs">{type.description}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Organizer extra field */}
                        {accountType === "organizer" && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                <Label className="text-zinc-300">Organization Name <span className="text-zinc-600">(optional)</span></Label>
                                <Input
                                    placeholder="e.g., Enugu Events Ltd."
                                    value={organizationName}
                                    onChange={e => setOrganizationName(e.target.value)}
                                    className="bg-zinc-900 border-zinc-800 text-white"
                                />
                            </div>
                        )}

                        {/* Team Manager team picker */}
                        {accountType === "team_manager" && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200 relative">
                                <Label className="text-zinc-300">Your Club <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm hover:border-zinc-700 transition-colors"
                                    >
                                        <span className="truncate">
                                            {selectedTeam 
                                                ? teams.find(t => t._id === selectedTeam)?.name 
                                                : "Select your football club..."}
                                        </span>
                                        <ChevronRight className={`w-4 h-4 text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`} />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute z-50 w-full mt-2 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-2 space-y-2 max-h-60 overflow-y-auto">
                                            <Input
                                                placeholder="Search clubs..."
                                                value={teamSearch}
                                                onChange={e => setTeamSearch(e.target.value)}
                                                className="bg-zinc-900 border-zinc-800 text-white h-9 text-xs"
                                                autoFocus
                                            />
                                            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                                                {filteredTeams.length === 0 ? (
                                                    <p className="text-zinc-500 text-xs p-2 italic text-center">
                                                        {teams.length === 0 ? "No clubs registered in database yet" : "No clubs found"}
                                                    </p>
                                                ) : (
                                                    filteredTeams.map(t => (
                                                        <button
                                                            key={t._id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedTeam(t._id);
                                                                setIsDropdownOpen(false);
                                                                setTeamSearch("");
                                                            }}
                                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                                                                selectedTeam === t._id 
                                                                    ? "bg-orange-500 text-white font-bold" 
                                                                    : "text-zinc-300 hover:bg-zinc-900"
                                                            }`}
                                                        >
                                                            {t.name}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-zinc-600 text-xs">This is the team you'll be managing on the platform.</p>
                            </div>
                        )}

                        {/* Provider note */}
                        {(accountType === "organizer" || accountType === "team_manager") && (
                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                                <p className="text-blue-400 text-xs leading-relaxed">
                                    <strong>Note:</strong> Provider accounts (Organizer / Team Manager) require admin approval before your elevated role becomes active. You'll be notified once reviewed.
                                </p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 mt-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || !accountType || (accountType === "team_manager" && !selectedTeam)}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600"
                        >
                            {isLoading ? <><Spinner /> Creating account...</> : "Create Account"}
                        </Button>
                        <Button variant="ghost" onClick={() => setStep(1)}
                            className="text-zinc-500 hover:text-white flex items-center gap-1 text-sm">
                            <ChevronLeft className="w-4 h-4" /> Back
                        </Button>
                    </CardFooter>
                </div>
            )}
        </Card>
    )
}
