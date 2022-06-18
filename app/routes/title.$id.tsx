import { Entry, Title, User } from "@prisma/client"
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  useLoaderData,
  useMatches
} from "remix"
import { prisma } from "~/utils/db.server"
import { getUserId } from "~/utils/session.server"

const validateTitleId = (id: string | undefined) => {
  const num = Number(id)
  if (!Number.isInteger(num)) {
    throw json("Title id must be an integer value", { status: 400 })
  }
  return num
}

interface LoaderData {
  title: Title
  entry: Entry | null
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const id = validateTitleId(params.id)

  const title = await prisma.title.findUnique({ where: { id } })
  if (!title) {
    throw json("Title not found", { status: 404 })
  }

  const userId = await getUserId(request)
  const entry =
    typeof userId === "number"
      ? await prisma.entry.findFirst({
          where: {
            library: {
              userId
            },
            titleId: title.id
          }
        })
      : null

  return json<LoaderData>({ title, entry })
}

export const action: ActionFunction = async ({ params, request }) => {
  const id = validateTitleId(params.id)

  const form = await request.formData()
  const action = form.get("action") as "delete" | "add"

  const userId = await getUserId(request)
  if (typeof userId !== "number") {
    throw json("Unauthorized", { status: 401 })
  }

  switch (action) {
    case "add":
      await prisma.entry.create({
        data: {
          library: { connect: { userId } },
          title: { connect: { id } },
          rewatchedTimes: 0,
          status: "plan_to_watch"
        }
      })
      break
    case "delete":
      await prisma.entry.deleteMany({
        where: {
          titleId: id,
          library: { userId }
        }
      })
      break
    default:
  }

  return null
}

export default () => {
  const { title, entry } = useLoaderData<LoaderData>()
  const { user } = useMatches().find((match) => match.id === "root")?.data as {
    user: User
  }

  return (
    <div>
      {user && (
        <Form method="post">
          <input type="hidden" name="action" value={entry ? "delete" : "add"} />
          <button type="submit">{entry ? "delete" : "add"}</button>
        </Form>
      )}
      <pre>{JSON.stringify(title, null, 2)}</pre>
    </div>
  )
}
