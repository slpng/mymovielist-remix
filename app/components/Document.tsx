import { ReactNode } from "react"
import { Links, LiveReload, Meta, Scripts, ScrollRestoration } from "remix"

interface Props {
  children: ReactNode
  title?: string
}

export default ({ children, title = "Sequence" }: Props) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body className="dark:bg-dark-purple-900">
        {children}
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
        <ScrollRestoration />
      </body>
    </html>
  )
}
