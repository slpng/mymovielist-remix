import type { Episode, Prisma, Season } from "@prisma/client"
import { ActionFunction, LoaderFunction, useOutletContext } from "remix"
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useMatches,
  useParams
} from "remix"
import { ContextData } from "~/routes/user/$username"
import { prisma } from "~/utils/db.server"
import { getUserId } from "~/utils/session.server"
import { EntryType } from "../$entryId"

type LoaderData = {
  season: Season & { episodes: Episode[] }
}

export const loader: LoaderFunction = async ({ params }) => {
  const id = Number(params.seasonId)
  if (!Number.isInteger(id)) {
    throw new Response("Invalid ID", { status: 400 })
  }

  const season = await prisma.season.findUnique({
    where: { id },
    include: { episodes: { orderBy: { episodeNumber: "asc" } } }
  })
  if (!season) {
    throw new Response("Season not found", { status: 404 })
  }

  return json<LoaderData>({
    season
  })
}

export const action: ActionFunction = async ({ request, params }) => {
  const sessionUserId = await getUserId(request)
  const user = await prisma.user.findUnique({
    where: { username: params.username }
  })
  if (sessionUserId !== user?.id) {
    throw new Response("Not authorized", { status: 401 })
  }

  const entryId = Number(params.entryId)
  if (!Number.isInteger(entryId)) {
    throw new Response("Invalid entry ID", { status: 400 })
  }

  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    include: { episodes: { include: { season: true } } }
  })
  if (!entry) {
    throw new Response("Entry not found", { status: 404 })
  }

  const seasonId = Number(params.seasonId)
  if (!Number.isInteger(seasonId)) {
    throw new Response("Invalid season ID", { status: 400 })
  }

  const form = await request.formData()
  const episodesIds = form
    .getAll("episode[]")
    .reduce((acc: number[], episode) => {
      const episodeId = Number(episode)
      if (Number.isInteger(episodeId)) {
        return [...acc, episodeId]
      }
      return acc
    }, [])
  console.log(episodesIds)

  const episodesToDisconnect = entry.episodes.filter(
    (episode) =>
      !episodesIds.includes(episode.id) && episode.seasonId === seasonId
  )

  let promises: Prisma.Prisma__EpisodeClient<Episode>[] = []
  episodesToDisconnect.forEach((episode) => {
    const promise = prisma.episode.update({
      where: { id: episode.id },
      data: {
        entries: {
          disconnect: {
            id: entry.id
          }
        }
      }
    })
    promises.push(promise)
  })

  episodesIds.forEach((id) => {
    const promise = prisma.episode.update({
      where: { id },
      data: {
        entries: {
          connect: {
            id: entry.id
          }
        }
      }
    })
    promises.push(promise)
  })

  try {
    await Promise.all(promises)
    return null
  } catch (err) {
    return { err }
  }
}

export default () => {
  const { season } = useLoaderData<LoaderData>()
  const actionData = useActionData()
  const { ownProfile } = useOutletContext<ContextData>()

  const params = useParams()
  const match = useMatches().find(
    (m) => m.pathname === `/user/${params.username}/diary/${params.entryId}`
  )?.data as { entry: EntryType }
  const entry = match.entry

  return (
    <Form method="post">
      {season.episodes.map((episode) => {
        const isCompleted = entry.episodes.some((e) => e.id === episode.id)

        return (
          <div>
            <input
              disabled={!ownProfile}
              type="checkbox"
              name="episode[]"
              value={episode.id}
              defaultChecked={isCompleted}
            />
            {episode.episodeNumber}.{episode.name}
          </div>
        )
      })}
      <button
        disabled={!ownProfile}
        className={ownProfile ? "text-blue-500" : "text-gray-500"}
        type="submit"
      >
        Save
      </button>
      {actionData && <p>{JSON.stringify(actionData.err)}</p>}
    </Form>
  )
}
