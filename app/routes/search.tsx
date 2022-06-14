import { Title } from '@prisma/client'
import { TvResult } from 'moviedb-promise/dist/request-types'
import { ActionFunction, Form, json, Link, useActionData } from 'remix'
import { prisma } from '~/utils/db.server'
import tmdb from "~/utils/tmdb.server"

interface ActionData {
    tvs: Title[]
    apiTvSeries: TvResult[] | undefined
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData()
    const query = form.get('query')?.toString()
    const production = form.get('production')?.toString()

    if (!query) {
        return json({ formError: 'Search query cannot be empty' }, 400)
    }
    if (!production || !['any', 'production', 'finished'].includes(production)) {
        return json({ formError: 'Invalid production status' }, 400)
    }

    const storedShows = await prisma.title.findMany({
        where: {
            type: 'show',
            name: {
                contains: query,
                mode: 'insensitive',
            }
        }
    })
    const apiShows = await tmdb.searchTv({ query })


    return json<ActionData>({
        tvs,
        apiTvSeries: apiTvSeries?.results?.filter(
            r => !tvs.some(tv => tv.tmdbId === r.id)
        ),
    })
}

export default () => {
    const action = useActionData<ActionData>()

    return (
        <div>
            <Form method="post">
                <input
                    type="text"
                    name="query"
                    id="query"
                    placeholder="Search..."
                />
                <label htmlFor="production">Production Status</label>
                <select name="production" id="production">
                    <option value="any">Any</option>
                    <option value="production">In Production</option>
                    <option value="finished">Finished</option>
                </select>
                <button className="text-blue-500" type="submit">
                    Search
                </button>
            </Form>
            <div className="flex gap-8">
                {Boolean(action?.tvs?.length) && (
                    <div>
                        <h1 className="font-bold">TV Series</h1>
                        {action?.tvs.map(r => (
                            <div>
                                <Link
                                    className="text-blue-500"
                                    to={`/title/${r.id}`}
                                >
                                    {r.name} ({r.id})
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
                {action?.apiTvSeries && (
                    <div>
                        <h1 className="font-bold">
                            Import TV Series from TMDB
                        </h1>
                        {action.apiTvSeries.map(tv => (
                            <div>
                                <Link
                                    className="text-blue-500"
                                    to={`/import/tmdb/${tv.id}`}
                                >
                                    {tv.name} ({tv.id})
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
