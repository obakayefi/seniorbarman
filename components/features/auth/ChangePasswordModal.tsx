"use client"

import { useState } from "react"
import { useApp } from "@/context/AppContext"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { PasswordStrength } from "@/components/ui/password-strength"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import axios from "axios"
import { KeyRound, Mail, ArrowLeft } from "lucide-react"

interface ChangePasswordModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function ChangePasswordModal({ isOpen, onOpenChange }: ChangePasswordModalProps) {
    const { user } = useApp()
    const [mode, setMode] = useState<"choice" | "change" | "forgot">("choice")
    const [isLoading, setIsLoading] = useState(false)

    // Change password fields
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const resetFields = () => {
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setMode("choice")
    }

    const handleClose = (open: boolean) => {
        if (!open) resetFields()
        onOpenChange(open)
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setIsLoading(true)
        try {
            await axios.post("/api/auth/change-password", {
                oldPassword,
                newPassword,
            })
            toast.success("Password updated successfully")
            handleClose(false)
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update password")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSendResetLink = async () => {
        if (!user?.email) return

        setIsLoading(true)
        try {
            const { data } = await axios.post("/api/auth/forgot-password", {
                email: user.email
            })
            toast.success(data.message || "Reset link sent to your email")
            handleClose(false)
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to send reset link")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-[#0c0b0b] border-zinc-800 text-zinc-100 sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        {mode !== "choice" && (
                            <button
                                onClick={() => setMode("choice")}
                                className="p-1 hover:bg-zinc-800 rounded-md transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        )}
                        Password Settings
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        {mode === "choice" && "What would you like to do?"}
                        {mode === "change" && "Update your current password."}
                        {mode === "forgot" && "We'll send a password reset link to your email."}
                    </DialogDescription>
                </DialogHeader>

                {mode === "choice" && (
                    <div className="grid gap-4 py-4">
                        <Button
                            variant="outline"
                            className="h-20 flex flex-col items-center bg-zinc-800 justify-center gap-2 border-zinc-800 hover:bg-zinc-900 hover:text-white"
                            onClick={() => setMode("change")}
                        >
                            <KeyRound className="h-5 w-5" />
                            <span>I know my old password</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex flex-col items-center justify-center gap-2 bg-zinc-800 border-zinc-800 hover:bg-zinc-900 hover:text-white"
                            onClick={() => setMode("forgot")}
                        >
                            <Mail className="h-5 w-5" />
                            <span>I forgot my old password</span>
                        </Button>
                    </div>
                )}

                {mode === "change" && (
                    <form onSubmit={handleChangePassword}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="oldPassword">Old Password</Label>
                                <PasswordInput
                                    id="oldPassword"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                    className="bg-zinc-900 border-zinc-800"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <PasswordInput
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="bg-zinc-900 border-zinc-800"
                                />
                                <PasswordStrength password={newPassword} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <PasswordInput
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="bg-zinc-900 border-zinc-800"
                                />
                            </div>
                        </div>
                        <DialogFooter className="z-100">
                            <Button type="submit" className="w-full" disabled={isLoading || !newPassword || newPassword !== confirmPassword}>
                                Change Password {isLoading && <Spinner className="ml-2" />}
                            </Button>
                        </DialogFooter>
                    </form>
                )}

                {mode === "forgot" && (
                    <div className="py-6 flex flex-col items-center text-center gap-4">
                        <div className="p-3 bg-zinc-900 rounded-full">
                            <Mail className="h-8 w-8 text-orange-500" />
                        </div>
                        <p className="text-sm">
                            We'll send a password recovery link to: <br />
                            <span className="font-semibold text-white">{user?.email}</span>
                        </p>
                        <Button onClick={handleSendResetLink} className="w-full mt-4" disabled={isLoading}>
                            Send Reset Link {isLoading && <Spinner className="ml-2" />}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
