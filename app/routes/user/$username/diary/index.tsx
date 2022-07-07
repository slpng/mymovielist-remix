import { Entry, Title } from "@prisma/client"
import { json, Link, LoaderFunction, useLoaderData } from "remix"
import { prisma } from "~/utils/db.server"

type LoaderData = {
  entries: (Entry & { title: Title })[]
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const { username } = params

  const entries = await prisma.entry.findMany({
    where: {
      user: {
        username
      }
    },
    include: {
      title: true
    }
  })

  return json<LoaderData>({ entries })
}

export default () => {
  const { entries } = useLoaderData<LoaderData>()

  return (
    <div>
      <table className="w-full text-left">
        <thead>
          <th>ID</th>
          <th>Title</th>
          <th>Status</th>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr>
              <td>{entry.titleId}</td>
              <td>
                <Link
                  className="text-blue-500 underline"
                  to={`/title/${entry.titleId}`}
                >
                  {entry.title.name}
                </Link>
              </td>
              <td className="capitalize">
                <Link className="text-blue-500 underline" to={`${entry.id}`}>
                  {entry.status}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
