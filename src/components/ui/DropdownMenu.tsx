'use client'

import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check, ChevronRight, Circle } from 'lucide-react'
import cn from '@/utils/cn'
import { usePathname } from 'next/navigation'

type DropdownMenuRootProps = React.ComponentProps<typeof DropdownMenuPrimitive.Root> & {
  closeOnPathChange?: boolean
}

const DropdownMenu = ({ closeOnPathChange = false, ...props }: DropdownMenuRootProps) => {
  const [isOpen, setIsOpen] = React.useState(props.open ?? false)
  const pathname = usePathname()

  React.useEffect(() => {
    if (closeOnPathChange) setIsOpen(false)
  }, [pathname, closeOnPathChange])

  const handleOpenChange = (open: boolean) => {
    if (props.onOpenChange) props.onOpenChange(open)
    setIsOpen(open)
  }

  return <DropdownMenuPrimitive.Root open={isOpen} onOpenChange={handleOpenChange} {...props} />
}

DropdownMenu.displayName = DropdownMenuPrimitive.Root.displayName

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

interface DropdownMenuSubTriggerProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> {
  inset?: boolean
}

const DropdownMenuSubTrigger = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>, DropdownMenuSubTriggerProps>(
  ({ className, inset, children, ...props }, ref) => (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        `flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-zinc-100 data-[state=open]:bg-zinc-100
        dark:focus:bg-zinc-800 dark:data-[state=open]:bg-zinc-800`,
        inset && 'pl-8',
        className
      )}
      {...props}>
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
)
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName

interface DropdownMenuSubContentProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent> {}

const DropdownMenuSubContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.SubContent>, DropdownMenuSubContentProps>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        `z-50 min-w-[8rem] overflow-hidden rounded-md border border-zinc-200 bg-white p-1 text-zinc-950 shadow-lg data-[state=open]:animate-in
        data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
        data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2
        data-[side=top]:slide-in-from-bottom-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50`,
        className
      )}
      {...props}
    />
  )
)
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName

interface DropdownMenuContentProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {}

const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Content>, DropdownMenuContentProps>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          `z-50 min-w-[8rem] overflow-hidden rounded-md border border-zinc-200 bg-white p-1 text-zinc-950 shadow-md data-[state=open]:animate-in
          data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95
          data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2
          data-[side=top]:slide-in-from-bottom-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50`,
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
)
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

interface DropdownMenuItemProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {
  inset?: boolean
}

const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Item>, DropdownMenuItemProps>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      `relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-zinc-100 focus:text-zinc-900
      data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-zinc-800 dark:focus:text-zinc-50`,
      inset && 'pl-8',
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

interface DropdownMenuCheckboxItemProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> {
  checked?: boolean
}

const DropdownMenuCheckboxItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>, DropdownMenuCheckboxItemProps>(
  ({ className, children, checked, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        `relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-zinc-100
        focus:text-zinc-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-zinc-800 dark:focus:text-zinc-50`,
        className
      )}
      checked={checked}
      {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
)
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName

interface DropdownMenuRadioItemProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> {}

const DropdownMenuRadioItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>, DropdownMenuRadioItemProps>(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(
        `relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-zinc-100
        focus:text-zinc-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-zinc-800 dark:focus:text-zinc-50`,
        className
      )}
      {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
)
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

interface DropdownMenuLabelProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> {
  inset?: boolean
}

const DropdownMenuLabel = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Label>, DropdownMenuLabelProps>(
  ({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Label ref={ref} className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)} {...props} />
  )
)
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

interface DropdownMenuSeparatorProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator> {}

const DropdownMenuSeparator = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Separator>, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-zinc-100 dark:bg-zinc-800', className)} {...props} />
  )
)
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup
}
