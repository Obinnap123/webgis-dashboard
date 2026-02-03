"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

const DialogContext = React.createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
} | null>(null);

export function Dialog({ children, open, onOpenChange }: DialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : uncontrolledOpen;
    const setOpen = isControlled ? onOpenChange : setUncontrolledOpen;

    const handleOpenChange = React.useCallback(
        (newOpen: boolean) => {
            if (setOpen) {
                setOpen(newOpen);
            }
        },
        [setOpen]
    );

    return (
        <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
}

export function DialogTrigger({ asChild, children, className, onClick }: any) {
    const context = React.useContext(DialogContext);
    if (!context) throw new Error("DialogTrigger must be used within Dialog");

    const handleClick = (e: React.MouseEvent) => {
        onClick?.(e);
        context.onOpenChange(true);
    };

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            onClick: handleClick,
        } as any);
    }

    return (
        <button className={className} onClick={handleClick}>
            {children}
        </button>
    );
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
    const context = React.useContext(DialogContext);
    if (!context) throw new Error("DialogContent must be used within Dialog");

    if (!context.open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-0">
            <div
                className={cn(
                    "relative w-[95%] sm:w-full max-w-lg rounded-lg bg-background p-6 shadow-lg animate-in zoom-in-95 duration-200",
                    className
                )}
            >
                <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={() => context.onOpenChange(false)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
                {children}
            </div>
        </div>
    );
}

export function DialogHeader({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
            {...props}
        />
    );
}

export function DialogTitle({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2
            className={cn("text-lg font-semibold leading-none tracking-tight", className)}
            {...props}
        />
    );
}

export function DialogDescription({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    );
}
