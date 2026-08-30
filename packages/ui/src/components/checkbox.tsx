import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'

import { cn } from '../lib/utils'

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(
  (
    {
      className,
      ...props
    },
    ref
  ) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'h-4 w-4 rounded border border-gray-300 bg-white',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
        ✓
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
)

Checkbox.displayName =
  CheckboxPrimitive.Root.displayName

export { Checkbox }