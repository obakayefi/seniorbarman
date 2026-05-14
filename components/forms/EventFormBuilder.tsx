"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, GripVertical, Type, CircleDot, CheckSquare } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type FormFieldType = "text" | "radio" | "checkbox"

export interface FormField {
    label: string
    type: FormFieldType
    options: string[]
    required: boolean
}

interface EventFormBuilderProps {
    fields: FormField[]
    onChange: (fields: FormField[]) => void
}

const FIELD_ICONS = {
    text: Type,
    radio: CircleDot,
    checkbox: CheckSquare,
}

const FIELD_LABELS = {
    text: "Text Input",
    radio: "Single Choice (Radio)",
    checkbox: "Multiple Choice (Checkbox)",
}

const MAX_FIELDS = 10
const MAX_OPTIONS = 6

export default function EventFormBuilder({ fields, onChange }: EventFormBuilderProps) {
    const addField = () => {
        if (fields.length >= MAX_FIELDS) return
        onChange([...fields, { label: "", type: "text", options: [], required: false }])
    }

    const removeField = (index: number) => {
        const updated = fields.filter((_, i) => i !== index)
        onChange(updated)
    }

    const updateField = (index: number, patch: Partial<FormField>) => {
        const updated = fields.map((f, i) => {
            if (i !== index) return f
            const merged = { ...f, ...patch }
            // Reset options if switching to text
            if (patch.type === "text") merged.options = []
            // Ensure options has at least 2 entries when switching to radio/checkbox
            if ((patch.type === "radio" || patch.type === "checkbox") && merged.options.length < 2) {
                merged.options = ["", ""]
            }
            return merged
        })
        onChange(updated)
    }

    const addOption = (fieldIndex: number) => {
        const field = fields[fieldIndex]
        if (field.options.length >= MAX_OPTIONS) return
        updateField(fieldIndex, { options: [...field.options, ""] })
    }

    const removeOption = (fieldIndex: number, optIndex: number) => {
        const field = fields[fieldIndex]
        const newOpts = field.options.filter((_, i) => i !== optIndex)
        updateField(fieldIndex, { options: newOpts })
    }

    const updateOption = (fieldIndex: number, optIndex: number, value: string) => {
        const field = fields[fieldIndex]
        const newOpts = field.options.map((o, i) => (i === optIndex ? value : o))
        updateField(fieldIndex, { options: newOpts })
    }

    return (
        <div className="space-y-4">
            {fields.map((field, index) => {
                const Icon = FIELD_ICONS[field.type]
                const hasOptions = field.type === "radio" || field.type === "checkbox"
                return (
                    <div
                        key={index}
                        className="bg-zinc-900/60 border border-white/8 rounded-2xl p-5 space-y-4 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                                <Icon size={16} className="text-orange-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                Field {index + 1}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="ml-auto h-7 w-7 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                onClick={() => removeField(index)}
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>

                        {/* Label */}
                        <div className="space-y-1.5">
                            <Label className="text-zinc-400 text-xs">Question / Label</Label>
                            <Input
                                className="bg-zinc-950 border-zinc-800 text-white"
                                placeholder="e.g. What is your experience level?"
                                value={field.label}
                                onChange={(e) => updateField(index, { label: e.target.value })}
                            />
                        </div>

                        {/* Type + Required row */}
                        <div className="flex gap-3 items-end">
                            <div className="flex-1 space-y-1.5">
                                <Label className="text-zinc-400 text-xs">Field Type</Label>
                                <Select
                                    value={field.type}
                                    onValueChange={(v) => updateField(index, { type: v as FormFieldType })}
                                >
                                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(Object.keys(FIELD_LABELS) as FormFieldType[]).map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {FIELD_LABELS[t]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer pb-2 shrink-0">
                                <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateField(index, { required: e.target.checked })}
                                    className="accent-orange-500 w-4 h-4"
                                />
                                <span className="text-zinc-400 text-xs font-medium">Required</span>
                            </label>
                        </div>

                        {/* Options (for radio/checkbox) */}
                        {hasOptions && (
                            <div className="space-y-2 pt-1">
                                <Label className="text-zinc-400 text-xs">Options</Label>
                                {field.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex gap-2 items-center">
                                        <div className="h-4 w-4 shrink-0">
                                            {field.type === "radio" ? (
                                                <div className="h-4 w-4 rounded-full border-2 border-zinc-600" />
                                            ) : (
                                                <div className="h-4 w-4 rounded border-2 border-zinc-600" />
                                            )}
                                        </div>
                                        <Input
                                            className="bg-zinc-950 border-zinc-800 text-white flex-1 h-8 text-sm"
                                            placeholder={`Option ${optIdx + 1}`}
                                            value={opt}
                                            onChange={(e) => updateOption(index, optIdx, e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg shrink-0"
                                            onClick={() => removeOption(index, optIdx)}
                                            disabled={field.options.length <= 2}
                                        >
                                            <Trash2 size={12} />
                                        </Button>
                                    </div>
                                ))}
                                {field.options.length < MAX_OPTIONS && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-zinc-500 hover:text-orange-400 h-7 text-xs px-2"
                                        onClick={() => addOption(index)}
                                    >
                                        <Plus size={12} className="mr-1" /> Add Option
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}

            {fields.length < MAX_FIELDS ? (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-orange-500/50 hover:bg-orange-500/5 rounded-2xl h-12"
                    onClick={addField}
                >
                    <Plus size={16} className="mr-2" />
                    Add Question ({fields.length}/{MAX_FIELDS})
                </Button>
            ) : (
                <p className="text-center text-xs text-zinc-600 py-2">Maximum {MAX_FIELDS} questions reached</p>
            )}
        </div>
    )
}
