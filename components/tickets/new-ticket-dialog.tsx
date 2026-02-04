"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CreateTicketInput } from "@/types";
import { Plus } from "lucide-react";

interface UserOption {
    id: string;
    name: string | null;
    email: string;
    isActive: boolean;
}

export function NewTicketDialog() {
    const router = useRouter();
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<string>("MEDIUM");
    const [assignedToId, setAssignedToId] = useState<string>("");
    const [users, setUsers] = useState<UserOption[]>([]);
    const [usersError, setUsersError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !isAdmin) return;

        async function loadUsers() {
            try {
                const response = await fetch("/api/users");
                const data = await response.json();
                if (data.success) {
                    setUsers(data.data.filter((user: UserOption) => user.isActive));
                    setUsersError("");
                } else {
                    setUsersError(data.error || "Unable to load users");
                }
            } catch (err) {
                console.error("Failed to fetch users:", err);
                setUsersError("Unable to load users");
            }
        }

        loadUsers();
    }, [open, isAdmin]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const ticketData: CreateTicketInput = {
                title,
                description,
                priority: priority as any,
                assignedToId: assignedToId || null,
            };

            const response = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ticketData),
            });

            const data = await response.json();

            if (!data.success) {
                setError(data.error || "Failed to create ticket");
                return;
            }

            // Refresh data
            setOpen(false);
            resetForm();
            router.refresh();
            // Optionally navigate or just refresh list. 
            // Since it's a modal on the list page, refreshing list is better.
            // But router.refresh() might not trigger re-fetch in Client Component effectively if manually fetching.
            // We will handle re-fetch in parent if possible, or force reload.
            // Ideally, pass a callback onSuccess.
            window.location.reload(); // Simple way to ensure data is fresh for now, or use a callback prop.
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    function resetForm() {
        setTitle("");
        setDescription("");
        setPriority("MEDIUM");
        setAssignedToId("");
        setError("");
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Ticket
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Ticket</DialogTitle>
                    <DialogDescription>
                        Submit a new service request describing your issue.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {error && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Title"
                        placeholder="Brief description"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        autoFocus // Good for accessibility/usability
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Description
                        </label>
                        <textarea
                            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Detailed explanation..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <Select
                        label="Priority"
                        value={priority}
                        onChange={(value) => setPriority(value)}
                        options={[
                            { value: "LOW", label: "Low" },
                            { value: "MEDIUM", label: "Medium" },
                            { value: "HIGH", label: "High" },
                            { value: "URGENT", label: "Urgent" },
                        ]}
                    />

                    {isAdmin && (
                        <div>
                            <div className="text-sm font-medium leading-none mb-2">
                                Assign To
                            </div>
                            {usersError ? (
                                <p className="text-sm text-destructive">{usersError}</p>
                            ) : (
                                <Select
                                    value={assignedToId}
                                    onChange={(value) => setAssignedToId(value)}
                                    options={[
                                        { value: "", label: "Unassigned" },
                                        ...users.map((user) => ({
                                            value: user.id,
                                            label: user.name || user.email,
                                        })),
                                    ]}
                                />
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Create Ticket
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
