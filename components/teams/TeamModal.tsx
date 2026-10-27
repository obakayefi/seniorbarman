"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { CLUBS, STADIUMS } from "@/lib/utils";

export interface TicketTypeInput {
  name: string;
  price: number;
  perks: string[];
  isActive?: boolean;
}

export interface TeamData {
  _id?: string;
  name: string;
  logo: string;
  stadium: string;
  description: string;
  isArchived?: boolean;
  managers?: any[];
  ticketTypes?: TicketTypeInput[];
}

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  team?: TeamData | null;
}

export function TeamModal({ isOpen, onClose, onSuccess, team }: TeamModalProps) {
  const isEditing = Boolean(team?._id);

  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [stadium, setStadium] = useState("");
  const [description, setDescription] = useState("");
  const [isArchived, setIsArchived] = useState(false);
  
  // Managers
  const [availableManagers, setAvailableManagers] = useState<any[]>([]);
  const [selectedManagerIds, setSelectedManagerIds] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Ticket Types
  const [ticketTypes, setTicketTypes] = useState<TicketTypeInput[]>([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available manager candidates
  useEffect(() => {
    if (!isOpen) return;

    const fetchManagers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch("/api/users?limit=100");
        if (res.ok) {
          const data = await res.json();
          setAvailableManagers(data.users || []);
        }
      } catch (err) {
        console.error("Failed to load potential managers", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchManagers();
  }, [isOpen]);

  // Populate form state when editing
  useEffect(() => {
    if (team) {
      setName(team.name || "");
      setLogo(team.logo || "");
      setStadium(team.stadium || "");
      setDescription(team.description || "");
      setIsArchived(Boolean(team.isArchived));
      setSelectedManagerIds(
        (team.managers || []).map((m: any) => (typeof m === "string" ? m : m._id))
      );
      setTicketTypes(team.ticketTypes || []);
    } else {
      setName("");
      setLogo("");
      setStadium("");
      setDescription("");
      setIsArchived(false);
      setSelectedManagerIds([]);
      setTicketTypes([
        { name: "Regular Stand", price: 1500, perks: ["General Admission"], isActive: true },
        { name: "VIP Stand", price: 5000, perks: ["Covered Seat", "Free Drink"], isActive: true }
      ]);
    }
    setError(null);
  }, [team, isOpen]);

  // Dynamic ticket type actions
  const addTicketType = () => {
    setTicketTypes((prev) => [
      ...prev,
      { name: "", price: 0, perks: [], isActive: true }
    ]);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTicketType = (index: number, field: keyof TicketTypeInput, value: any) => {
    setTicketTypes((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleManagerToggle = (userId: string) => {
    setSelectedManagerIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Team name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        logo: logo || "/clubs/rangers-logo.png",
        stadium,
        description,
        isArchived,
        managers: selectedManagerIds,
        ticketTypes
      };

      const url = isEditing ? `/api/teams/${team?._id}` : "/api/teams";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save team");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? `Edit Team: ${team?.name}` : "Create New Team"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-3 rounded-md text-sm border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name *</Label>
              <Input
                id="team-name"
                placeholder="e.g. Rangers FC"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-stadium">Home Stadium</Label>
              <Select value={stadium} onValueChange={(val) => setStadium(val)}>
                <SelectTrigger id="team-stadium">
                  <SelectValue placeholder="Select or type stadium" />
                </SelectTrigger>
                <SelectContent>
                  {STADIUMS.map((s) => (
                    <SelectItem key={s.name} value={s.name}>
                      {s.name} ({s.state})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-logo">Logo URL or Quick Preset</Label>
            <div className="flex gap-2">
              <Input
                id="team-logo"
                placeholder="/clubs/rangers-logo.png or https://..."
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="flex-1"
              />
              <Select
                onValueChange={(val) => setLogo(val)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Presets" />
                </SelectTrigger>
                <SelectContent>
                  {CLUBS.map((club) => (
                    <SelectItem key={club.name} value={club.icon}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {logo && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">Preview:</span>
                <img src={logo} alt="Logo Preview" className="h-8 w-8 object-contain rounded border p-0.5" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-desc">Description / Overview</Label>
            <Textarea
              id="team-desc"
              rows={3}
              placeholder="Brief overview of the team..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Archive Status Toggle (when editing) */}
          {isEditing && (
            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
              <input
                type="checkbox"
                id="archive-status"
                checked={isArchived}
                onChange={(e) => setIsArchived(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <Label htmlFor="archive-status" className="cursor-pointer font-medium text-sm">
                Archive this Team (Hide from active lists)
              </Label>
            </div>
          )}

          {/* Managers Selection */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Assigned Team Managers</span>
              {loadingUsers && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </Label>

            <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2 bg-background">
              {availableManagers.length === 0 && !loadingUsers ? (
                <p className="text-xs text-muted-foreground text-center py-2">No users found.</p>
              ) : (
                availableManagers.map((u: any) => {
                  const isChecked = selectedManagerIds.includes(u._id);
                  return (
                    <label
                      key={u._id}
                      className="flex items-center justify-between text-sm p-1.5 rounded hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleManagerToggle(u._id)}
                          className="rounded text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="font-medium">{u.firstName} {u.lastName}</span>
                        <span className="text-xs text-muted-foreground">({u.email})</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase font-semibold">
                        {u.role}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Default Ticket Tiers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Default Ticket Types</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
                <Plus className="h-4 w-4 mr-1" /> Add Ticket Tier
              </Button>
            </div>

            <div className="space-y-2">
              {ticketTypes.map((tier, idx) => (
                <div key={idx} className="flex gap-2 items-center border p-2.5 rounded-md bg-muted/20">
                  <Input
                    placeholder="Tier Name (e.g. VIP)"
                    value={tier.name}
                    onChange={(e) => updateTicketType(idx, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Price (₦)"
                    value={tier.price || ""}
                    onChange={(e) => updateTicketType(idx, "price", Number(e.target.value))}
                    className="w-28"
                  />
                  <Input
                    placeholder="Perks (comma separated)"
                    value={Array.isArray(tier.perks) ? tier.perks.join(", ") : tier.perks || ""}
                    onChange={(e) =>
                      updateTicketType(
                        idx,
                        "perks",
                        e.target.value.split(",").map((p) => p.trim()).filter(Boolean)
                      )
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTicketType(idx)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {ticketTypes.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No default ticket tiers added. Click "+ Add Ticket Tier" to add one.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
