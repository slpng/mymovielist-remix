import { NavLink, Outlet, redirect, useLoaderData } from 'remix'
import { prisma } from '~/utils/db.server'

import type { LoaderFunction } from 'remix'
import { Entry, User } from '@prisma/client'
import { getUserId } from '~/utils/session.server'

type LoaderData = {
    user: User
    ownProfile: boolean
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const { username } = params

    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            entries: true,
        },
    })
    if (!user) {
        throw new Response('User Not Found', {
            status: 404,
        })
    }

    const sessionUserId = await getUserId(request)
    const ownProfile = user.id === sessionUserId

    const data: LoaderData = {
        user,
        ownProfile,
    }
    console.log('username loader returned')
    return data
}

export type ContextData = LoaderData

export default () => {
    const { user, ownProfile } = useLoaderData<LoaderData>()
    const context: ContextData = { user, ownProfile }

    return (
        <div>
            <h1>{user.username}'s profile</h1>
            <div className="flex gap-2 text-blue-500">
                <NavLink
                    className={({ isActive }) => (isActive ? 'underline' : '')}
                    to=""
                    end
                >
                    Overview
                </NavLink>
                <NavLink
                    className={({ isActive }) => (isActive ? 'underline' : '')}
                    to="diary"
                >
                    Diary
                </NavLink>
                <NavLink
                    className={({ isActive }) => (isActive ? 'underline' : '')}
                    to="stats"
                >
                    Stats
                </NavLink>
            </div>
            <Outlet context={context} />
        </div>
    )
}
