import type { Entry, Episode, Season, Title } from "@prisma/client"
import {
  json,
  LoaderFunction,
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext
} from "remix"
import { prisma } from "~/utils/db.server"
import { ContextData } from "../../$username"

export type EntryType = Entry & {
  title: Title & { seasons: (Season & { episodes: Episode[] })[] }
  episodes: Episode[]
}

interface LoaderData {
  entry: EntryType
}

export const loader: LoaderFunction = async ({ params }) => {
  const id = Number(params.entryId)
  if (!Number.isInteger(id)) {
    throw new Response("Invalid ID", { status: 400 })
  }

  const entry = await prisma.entry.findUnique({
    where: { id },
    include: {
      title: {
        include: {
          seasons: {
            include: {
              episodes: {
                orderBy: {
                  episodeNumber: "asc"
                }
              }
            },
            orderBy: {
              seasonNumber: "asc"
            }
          }
        }
      },
      episodes: true
    }
  })
  if (!entry) {
    throw new Response("Entry Not Found", {
      status: 404
    })
  }

  return json<LoaderData>({
    entry
  })
}

export default () => {
  const { entry } = useLoaderData<LoaderData>()
  const context = useOutletContext<ContextData>()

  return (
    <div>
      <h1>Editing {entry.title.name}</h1>
      <>
        <div className="flex gap-2 text-blue-500">
          {entry.title.seasons.map((season) => (
            <NavLink
              className={({ isActive }) => (isActive ? "underline" : "")}
              to={`season/${season.id}`}
              end
            >
              {season.name}
            </NavLink>
          ))}
        </div>
        <Outlet context={context} />
      </>
    </div>
  )
}
