"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
}

interface TooltipProviderProps {
  children: React.ReactNode
}

interface TooltipTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

interface TooltipContentProps {
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}

export function TooltipProvider({ children }: Readonly<TooltipProviderProps>) {
  return <>{children}</>
}

export function Tooltip({ children }: Readonly<TooltipProps>) {
  return <>{children}</>
}

export function TooltipTrigger({ asChild = false, children }: Readonly<TooltipTriggerProps>) {
  return <>{children}</>
}

export function TooltipContent({
  children,
  side = "top",
  className,
}: Readonly<TooltipContentProps>) {
  // Simple implementation of tooltip content
  // This is not using radix-ui but mimicking its API for compatibility
  const [show, setShow] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    const parent = document.querySelector('[data-tooltip-trigger="true"]')
    
    if (parent) {
      const showTooltip = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setShow(true)
      }
      
      const hideTooltip = () => {
        timeoutRef.current = setTimeout(() => {
          setShow(false)
        }, 200)
      }
      
      parent.addEventListener('mouseenter', showTooltip)
      parent.addEventListener('mouseleave', hideTooltip)
      parent.addEventListener('focus', showTooltip)
      parent.addEventListener('blur', hideTooltip)
      
      return () => {
        parent.removeEventListener('mouseenter', showTooltip)
        parent.removeEventListener('mouseleave', hideTooltip)
        parent.removeEventListener('focus', showTooltip)
        parent.removeEventListener('blur', hideTooltip)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (!show) return null

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  }

  return (
    <div
      className={cn(
        "absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-md shadow-md",
        sideClasses[side],
        className
      )}
    >
      {children}
      <div
        className={cn(
          "absolute w-0 h-0 border-4 border-transparent",
          {
            "bottom-[100%] left-1/2 -ml-1 border-b-gray-900 dark:border-b-gray-700":
              side === "top",
            "left-[100%] top-1/2 -mt-1 border-l-gray-900 dark:border-l-gray-700":
              side === "right",
            "top-[100%] left-1/2 -ml-1 border-t-gray-900 dark:border-t-gray-700":
              side === "bottom",
            "right-[100%] top-1/2 -mt-1 border-r-gray-900 dark:border-r-gray-700":
              side === "left",
          }
        )}
      />
    </div>
  )
}
