"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SelectContext = React.createContext({});

const Select = ({ children, value, onValueChange, defaultValue }) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "");
    const [isOpen, setIsOpen] = React.useState(false);

    const currentValue = value !== undefined ? value : internalValue;

    const handleValueChange = (newValue) => {
        if (value === undefined) {
            setInternalValue(newValue);
        }
        onValueChange?.(newValue);
        setIsOpen(false);
    };

    return (
        <SelectContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, isOpen, setIsOpen }}>
            <div className="relative">
                {children}
            </div>
        </SelectContext.Provider>
    );
};

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(SelectContext);

    return (
        <button
            ref={ref}
            type="button"
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            onClick={() => setIsOpen(!isOpen)}
            {...props}
        >
            {children}
            <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
        </button>
    );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }) => {
    const { value } = React.useContext(SelectContext);
    return <span>{value || placeholder}</span>;
};

const SelectContent = ({ children, className }) => {
    const { isOpen, setIsOpen } = React.useContext(SelectContext);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !event.target.closest('[role="listbox"]') && !event.target.closest('button')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, setIsOpen]);

    if (!isOpen) return null;

    return (
        <div
            role="listbox"
            className={cn(
                "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md",
                className
            )}
        >
            {children}
        </div>
    );
};

const SelectItem = ({ value, children, className }) => {
    const { value: selectedValue, onValueChange } = React.useContext(SelectContext);

    return (
        <div
            role="option"
            aria-selected={selectedValue === value}
            className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                selectedValue === value && "bg-accent",
                className
            )}
            onClick={() => onValueChange(value)}
        >
            {children}
        </div>
    );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
