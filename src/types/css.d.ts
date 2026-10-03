import "react"

declare module "react" {
  // custom properties such as --i, which the stylesheet reads for the order of an animation
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style -- augments an interface
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined
  }
}
