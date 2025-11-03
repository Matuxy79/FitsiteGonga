import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Input } from './Input'

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label 
          htmlFor={props.id} 
          className="block text-sm font-medium text-discord-muted"
        >
          {label}
        </label>
        <Input
          ref={ref}
          hasError={!!error}
          className={className}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${props.id}-error`} className="text-sm text-discord-error" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${props.id}-helper`} className="text-sm text-discord-muted">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

export { FormField }