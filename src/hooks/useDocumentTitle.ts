import { useEffect } from "react"

/** Keeps the title of the browser tab in step with the page. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title
  }, [title])
}
