import { json, LoaderFunction } from "remix"
import { prisma } from "~/utils/db.server"
import tmdb from "~/utils/tmdb.server"

export const loader: LoaderFunction = async ({ params }) => {
  const id = params.tmdbId as string

  try {
    const { title: name, id: tmdbId } = await tmdb.movieInfo({ id })
    if (typeof name !== "string" || typeof tmdbId !== "number") {
      throw new Response("not found", { status: 404 })
    }

    const movie = await prisma.title.upsert({
      create: {
        name,
        tmdbId: tmdbId.toString(),
        type: "movie",
        movie: { create: {} }
      },
      update: { name },
      where: {
        type_tmdbId: {
          type: "movie",
          tmdbId: tmdbId.toString()
        }
      }
    })

    return json({ movie })
  } catch (e) {
    return json({ e })
  }
}
