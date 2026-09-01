"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { PasswordStrength } from "@/components/ui/password-strength"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import useInput from "@/hooks/useInput"
import axios from "axios"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useEffect, useState, Suspense } from "react"
import { toast } from "sonner"
import { User, Briefcase, Trophy, ChevronRight, ChevronLeft, Check, Search, ShieldCheck } from "lucide-react"

type AccountType = "user" | "organizer" | "team_manager" | null

const ACCOUNT_TYPES = [
    {
        id: "user" as AccountType,
        label: "Regular User",
        description: "Browse exciting events, buy tickets, attend, and follow your favorite football clubs.",
        icon: User,
        color: "border-border/80 dark:border-zinc-800 bg-background/50 dark:bg-zinc-900/40 hover:border-orange-500/50 hover:bg-muted/40",
        activeColor: "border-orange-500 bg-orange-500/10 dark:bg-orange-500/15 ring-1 ring-orange-500/30",
        iconColor: "text-muted-foreground",
        activeIconColor: "text-orange-500",
        badge: "Standard",
        badgeColor: "bg-orange-500/10 text-orange-400 border border-orange-500/20"
    },
    {
        id: "organizer" as AccountType,
        label: "Event Organizer",
        description: "Create, promote, manage ticket sales, and track revenue for public or private events.",
        icon: Briefcase,
        color: "border-border/80 dark:border-zinc-800 bg-background/50 dark:bg-zinc-900/40 hover:border-blue-500/50 hover:bg-muted/40",
        activeColor: "border-blue-500 bg-blue-500/10 dark:bg-blue-500/15 ring-1 ring-blue-500/30",
        iconColor: "text-muted-foreground",
        activeIconColor: "text-blue-400",
        badge: "Provider",
        badgeColor: "bg-blue-500/10 text-blue-400 border border-blue-500/20"
    },
    {
        id: "team_manager" as AccountType,
        label: "Team Manager",
        description: "Manage a registered football club, view fixture tickets, and oversee team operations.",
        icon: Trophy,
        color: "border-border/80 dark:border-zinc-800 bg-background/50 dark:bg-zinc-900/40 hover:border-emerald-500/50 hover:bg-muted/40",
        activeColor: "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 ring-1 ring-emerald-500/30",
        iconColor: "text-muted-foreground",
        activeIconColor: "text-emerald-400",
        badge: "Provider",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
    },
]

function RegisterContent() {
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

    const searchParams = useSearchParams()
    const roleParam = searchParams.get("role")

    useEffect(() => {
        if (roleParam === "organizer" || roleParam === "team_manager" || roleParam === "user") {
            setAccountType(roleParam as AccountType)
        }
    }, [roleParam])

    useEffect(() => {
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
                toast.success(`Your account has been created! Please login to continue.`)
                setTimeout(() => router.push('/auth/login'), 1500)
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
        <div className="w-full max-w-lg mx-auto">
            <div className="bg-card/95 dark:bg-zinc-950/90 backdrop-blur-md border border-border dark:border-zinc-800 rounded-sm p-6 sm:p-8 shadow-xl dark:shadow-black/40 transition-all">
                {/* Header & Step Tracker */}
                <div className="mb-6 space-y-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            {step === 1 ? "Create an account" : "Choose your role"}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {step === 1 ? "Enter your details to get started" : "Select how you will be using Senior Barman"}
                        </p>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center gap-3 pt-2">
                        <div className="flex-1 space-y-1">
                            <div className={`h-1.5 w-full rounded-xs transition-all duration-300 ${step >= 1 ? 'bg-orange-500' : 'bg-muted dark:bg-zinc-800'}`} />
                            <p className="text-[11px] font-semibold text-muted-foreground">1. Account Details</p>
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className={`h-1.5 w-full rounded-xs transition-all duration-300 ${step >= 2 ? 'bg-orange-500' : 'bg-muted dark:bg-zinc-800'}`} />
                            <p className="text-[11px] font-semibold text-muted-foreground">2. Account Type</p>
                        </div>
                    </div>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleNextStep} className="space-y-5">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                        First Name
                                    </Label>
                                    <Input
                                        id="firstName"
                                        type="text"
                                        placeholder="John"
                                        value={firstName.value}
                                        onChange={firstName.onChange}
                                        required
                                        autoComplete="given-name"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                        Last Name
                                    </Label>
                                    <Input
                                        id="lastName"
                                        type="text"
                                        placeholder="Doe"
                                        value={lastName.value}
                                        onChange={lastName.onChange}
                                        required
                                        autoComplete="family-name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="johndoe@example.com"
                                    value={email.value}
                                    onChange={email.onChange}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                        Password
                                    </Label>
                                    <Link
                                        href="/auth/reset-password"
                                        className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline transition-colors"
                                    >
                                        Forgot?
                                    </Link>
                                </div>
                                <PasswordInput
                                    id="password"
                                    placeholder="Create a strong password"
                                    required
                                    onChange={password.onChange}
                                    value={password.value}
                                    autoComplete="new-password"
                                />
                                <PasswordStrength password={password.value} />
                            </div>
                        </div>

                        <div className="pt-2 space-y-4">
                            <Button
                                type="submit"
                                disabled={!formFilled}
                                className="w-full h-10 rounded-sm bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue to Role Selection <ChevronRight className="w-4 h-4" />
                            </Button>

                            <p className="text-sm text-center text-muted-foreground pt-1">
                                Already have an account?{" "}
                                <Link href="/auth/login" className="text-orange-500 hover:text-orange-400 hover:underline font-bold transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-5">
                        {/* Account type cards */}
                        <div className="space-y-2.5">
                            {ACCOUNT_TYPES.map((type) => {
                                const Icon = type.icon
                                const isActive = accountType === type.id
                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setAccountType(type.id)}
                                        className={`w-full flex items-start gap-4 p-3.5 rounded-sm border text-left transition-all duration-200 cursor-pointer ${
                                            isActive ? type.activeColor : type.color
                                        }`}
                                    >
                                        <div className={`p-2 rounded-sm transition-colors shrink-0 mt-0.5 ${
                                            isActive ? 'bg-orange-500/15 dark:bg-orange-500/25' : 'bg-muted dark:bg-zinc-800'
                                        }`}>
                                            <Icon className={`w-4 h-4 transition-colors ${isActive ? type.activeIconColor : type.iconColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`font-bold text-sm transition-colors ${isActive ? 'text-foreground font-extrabold' : 'text-foreground/90'}`}>
                                                    {type.label}
                                                </p>
                                                {isActive ? (
                                                    <span className="flex items-center justify-center w-4 h-4 rounded-xs bg-orange-500 text-white shadow-sm">
                                                        <Check className="w-3 h-3 stroke-[3]" />
                                                    </span>
                                                ) : (
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-xs ${type.badgeColor}`}>
                                                        {type.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{type.description}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Organizer extra field */}
                        {accountType === "organizer" && (
                            <div className="space-y-2 p-3.5 rounded-sm bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 animate-in slide-in-from-top-2 duration-200">
                                <Label htmlFor="orgName" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                                    Organization / Business Name <span className="text-muted-foreground text-[10px] normal-case">(optional)</span>
                                </Label>
                                <Input
                                    id="orgName"
                                    placeholder="e.g. Enugu Events & Entertainment Ltd"
                                    value={organizationName}
                                    onChange={e => setOrganizationName(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Team Manager team picker */}
                        {accountType === "team_manager" && (
                            <div className="space-y-2 p-3.5 rounded-sm bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 animate-in slide-in-from-top-2 duration-200 relative">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center justify-between">
                                    <span>Select Your Football Club <span className="text-red-500">*</span></span>
                                    <span className="text-[10px] text-muted-foreground normal-case">Required</span>
                                </Label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full flex items-center justify-between bg-background/80 dark:bg-zinc-900/90 border border-border dark:border-zinc-800 rounded-sm px-3.5 py-2.5 text-foreground text-sm hover:border-emerald-500/60 transition-colors shadow-xs"
                                    >
                                        <span className="truncate font-medium">
                                            {selectedTeam 
                                                ? teams.find(t => t._id === selectedTeam)?.name 
                                                : "Choose your club from list..."}
                                        </span>
                                        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`} />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute z-50 left-0 right-0 mt-1 bg-popover/98 dark:bg-zinc-900/98 backdrop-blur-md border border-border dark:border-zinc-800 rounded-sm shadow-2xl p-2 space-y-2 max-h-64 overflow-hidden">
                                            <div className="relative">
                                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search club name..."
                                                    value={teamSearch}
                                                    onChange={e => setTeamSearch(e.target.value)}
                                                    className="pl-8 bg-background dark:bg-zinc-950 border-input text-foreground h-9 text-xs"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                                                {filteredTeams.length === 0 ? (
                                                    <p className="text-muted-foreground text-xs p-3 italic text-center">
                                                        {teams.length === 0 ? "No clubs registered in database yet" : "No matching clubs found"}
                                                    </p>
                                                ) : (
                                                    filteredTeams.map(t => (
                                                        <button
                                                            key={t._id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedTeam(t._id)
                                                                setIsDropdownOpen(false)
                                                                setTeamSearch("")
                                                            }}
                                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs font-medium transition-colors cursor-pointer ${
                                                                selectedTeam === t._id 
                                                                    ? "bg-emerald-500 text-white font-bold" 
                                                                    : "text-foreground hover:bg-muted/80 dark:hover:bg-zinc-800"
                                                            }`}
                                                        >
                                                            <span>{t.name}</span>
                                                            {selectedTeam === t._id && <Check className="w-3.5 h-3.5" />}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-[11px]">This is the club you will administer on Senior Barman.</p>
                            </div>
                        )}

                        {/* Provider note banner */}
                        {(accountType === "organizer" || accountType === "team_manager") && (
                            <div className="flex items-start gap-3 bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/25 rounded-sm p-3 text-xs text-blue-400 leading-relaxed">
                                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                                <div>
                                    <strong className="text-blue-300 font-semibold">Admin Verification:</strong> Provider accounts (Organizer / Team Manager) undergo verification before elevated management privileges activate.
                                </div>
                            </div>
                        )}

                        <div className="pt-2 space-y-3">
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading || !accountType || (accountType === "team_manager" && !selectedTeam)}
                                className="w-full h-10 rounded-sm bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Spinner /> Creating your account...
                                    </span>
                                ) : (
                                    "Complete Registration"
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => setStep(1)}
                                className="w-full text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 text-xs cursor-pointer h-9 rounded-sm"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back to Personal Details
                            </Button>

                            <p className="text-sm text-center text-muted-foreground pt-1">
                                Already have an account?{" "}
                                <Link href="/auth/login" className="text-orange-500 hover:text-orange-400 hover:underline font-bold transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function Register() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Spinner className="text-orange-500" />
            </div>
        }>
            <RegisterContent />
        </Suspense>
    )
}
