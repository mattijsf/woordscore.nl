import type { InputHTMLAttributes } from "react"
import { useLayoutEffect, useRef } from "react"

interface CleanedInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value: string
  /** what the field may hold, applied while typing */
  clean: (text: string) => string
  /** the cleaned value, and what was typed or pasted before cleaning */
  onValue: (cleaned: string, typed: string) => void
}

/** A text field that drops what it may not hold as it is typed, with the cursor kept in place. */
export function CleanedInput({
  value,
  clean,
  onValue,
  ...props
}: CleanedInputProps): React.JSX.Element {
  const field = useRef<HTMLInputElement>(null)
  const caret = useRef<number | null>(null)
  useLayoutEffect(() => {
    if (caret.current !== null) {
      field.current?.setSelectionRange(caret.current, caret.current)
      caret.current = null
    }
  })
  return (
    <input
      {...props}
      ref={field}
      value={value}
      onChange={event => {
        const typed = event.target.value
        const cleaned = clean(typed)
        if (cleaned !== typed) {
          // keep the cursor where it was
          caret.current = clean(typed.slice(0, event.target.selectionStart ?? typed.length)).length
        }
        onValue(cleaned, typed)
      }}
    />
  )
}
