import { Outlet, useCatch, useLoaderData } from "@remix-run/react"
import styles from "~/styles/app.css"

import { User } from "@prisma/client"
import { json, LinksFunction, LoaderFunction } from "remix"
import Document from "~/components/Document"
import Header from "~/components/Header"
import { getUser } from "~/utils/session.server"
import { useRef } from "react"

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }]
}

interface LoaderData {
  user: User | null
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  useRef<HTMLDivElement>(null)
  return json<LoaderData>({ user })
}

export default () => {
  const { user } = useLoaderData<LoaderData>()

  return (
    <Document>
      <Header user={user} />
      <Outlet />
    </Document>
  )
}

export const CatchBoundary = () => {
  const caught = useCatch()

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <div className="error-container">
        <h1>
          {caught.status} {caught.statusText}
        </h1>
        <pre>{caught.data}</pre>
      </div>
    </Document>
  )
}

export const ErrorBoundary = ({ error }: { error: Error }) => {
  return (
    <Document title="Unexpected App Error">
      <div className="error-container">
        <h1>Unexpected App Error</h1>
        <p>{error.message}</p>
        <pre>{error.stack}</pre>
      </div>
    </Document>
  )
}
