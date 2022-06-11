import { json, LoaderFunction } from "remix"
import { prisma } from "~/utils/db.server"
import tmdb from "~/utils/tmdb.server"

const forEachParallel = <T>(
  array: Array<T>,
  callback: (item: T) => Promise<void>
) => Promise.all(array.map((item) => callback(item)))

export const loader: LoaderFunction = async ({ params }) => {
  const id = params.tmdbId as string

  try {
    const { name, id: tmdbId, seasons } = await tmdb.tvInfo({ id })
    if (
      typeof name !== "string" ||
      typeof tmdbId !== "number" ||
      typeof seasons === "undefined"
    ) {
      throw new Response("show not found", { status: 404 })
    }

    const show = await prisma.title.upsert({
      create: {
        name,
        tmdbId: tmdbId.toString(),
        type: "show",
        show: { create: {} }
      },
      update: { name },
      where: {
        type_tmdbId: {
          type: "show",
          tmdbId: tmdbId.toString()
        }
      }
    })

    await forEachParallel(seasons, async (season) => {
      if (typeof season.season_number !== "number") {
        return
      }
      const seasonInfo = await tmdb.seasonInfo({
        id: tmdbId,
        season_number: season.season_number
      })

      if (
        typeof seasonInfo.name !== "string" ||
        typeof seasonInfo.episodes === "undefined"
      ) {
        return
      }
      const upsertedSeason = await prisma.season.upsert({
        create: {
          name: seasonInfo.name,
          seasonNumber: season.season_number,
          showId: show.id
        },
        update: { name: seasonInfo.name },
        where: {
          showId_seasonNumber: {
            seasonNumber: season.season_number,
            showId: show.id
          }
        }
      })

      await forEachParallel(seasonInfo.episodes, async (episode) => {
        if (
          typeof episode.name !== "string" ||
          typeof episode.episode_number !== "number"
        ) {
          return
        }
        await prisma.episode.upsert({
          create: {
            name: episode.name,
            episodeNumber: episode.episode_number,
            seasonId: upsertedSeason.id
          },
          update: { name: episode.name },
          where: {
            seasonId_episodeNumber: {
              episodeNumber: episode.episode_number,
              seasonId: upsertedSeason.id
            }
          }
        })
      })
    })

    return json(
      await prisma.title.findUnique({
        where: { id: show.id },
        include: {
          show: { include: { seasons: { include: { episodes: true } } } }
        }
      })
    )
  } catch (e) {
    return json({ e })
  }
}
