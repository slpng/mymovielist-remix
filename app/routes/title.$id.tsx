import { Entry, Title } from '@prisma/client'
import {
    ActionFunction,
    Form,
    json,
    LoaderFunction,
    useLoaderData,
} from 'remix'
import { prisma } from '~/utils/db.server'
import { getUserId } from '~/utils/session.server'

interface LoaderData {
    title: Title
    entry: Entry | null
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const id = Number(params.id)
    if (!Number.isInteger(id)) {
        throw new Response('Invalid ID', { status: 400 })
    }

    const userId = await getUserId(request)

    const title = await prisma.title.findUnique({
        where: { id },
        include: { seasons: { include: { episodes: true } } },
    })
    if (!title) {
        throw new Response('Title Not Found', { status: 404 })
    }

    const entry = userId
        ? await prisma.entry.findUnique({
              where: {
                  userId_titleId: { userId, titleId: id },
              },
          })
        : null

    return json<LoaderData>({ title, entry })
}

export const action: ActionFunction = async ({ params, request }) => {
    const id = Number(params.id)
    if (!Number.isInteger(id)) {
        throw new Response('Invalid ID', { status: 400 })
    }

    const form = await request.formData()
    const method = form.get('_method')?.toString()
    if (!method || !/create|delete/i.test(method)) {
        throw new Response('Invalid method', { status: 400 })
    }

    const userId = await getUserId(request)
    if (!userId) {
        throw new Response('You are not logged in', { status: 401 })
    }

    if (method === 'create') {
        await prisma.entry.create({
            data: {
                userId,
                titleId: id,
                status: 'WATCHING',
            },
        })
    }
    if (method === 'delete') {
        await prisma.entry.delete({
            where: {
                userId_titleId: {
                    userId,
                    titleId: id,
                },
            },
        })
    }

    return null
}

export default () => {
    const { title, entry } = useLoaderData<LoaderData>()

    return (
        <div>
            <Form method="post">
                {entry ? (
                    <div>
                        <input type="hidden" name="_method" value="delete" />
                        <button type="submit" className="text-blue-500">
                            Delete
                        </button>
                    </div>
                ) : (
                    <div>
                        <input type="hidden" name="_method" value="create" />
                        <button type="submit" className="text-blue-500">
                            Add
                        </button>
                    </div>
                )}
            </Form>
            <pre>{JSON.stringify(title, null, 4)}</pre>
        </div>
    )
}
