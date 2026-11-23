"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const AccordionContext = React.createContext({});

const Accordion = React.forwardRef(({ children, defaultValue, type = "single", className, ...props }, ref) => {
  const [openItems, setOpenItems] = React.useState(defaultValue ? [defaultValue] : []);

  const toggleItem = (value) => {
    if (type === "single") {
      // Single mode: only one item can be open at a time
      setOpenItems((prev) =>
        prev.includes(value) ? [] : [value]
      );
    } else {
      // Multiple mode: multiple items can be open
      setOpenItems((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
      );
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
});
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef(({ value, className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("border rounded-lg", className)} {...props}>
      {children}
    </div>
  );
});
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef(({ value, className, children, ...props }, ref) => {
  const { openItems, toggleItem } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <button
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between p-4 font-medium transition-all hover:bg-accent",
        isOpen && "border-b",
        className
      )}
      onClick={() => toggleItem(value)}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef(({ value, className, children, ...props }, ref) => {
  const { openItems } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden transition-all",
        isOpen ? "animate-accordion-down" : "animate-accordion-up hidden"
      )}
      {...props}
    >
      {isOpen && <div className={cn("p-4 pt-0", className)}>{children}</div>}
    </div>
  );
});
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
