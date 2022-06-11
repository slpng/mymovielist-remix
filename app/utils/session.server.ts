import { prisma } from './db.server'
import bcrypt from 'bcryptjs'
import { createCookieSessionStorage, redirect } from 'remix'

type LoginForm = {
    username: string
    password: string
}

export const register = async ({ username, password }: LoginForm) => {
    const passwordHash = await bcrypt.hash(password, 10)

    try {
        const user = await prisma.user.create({
            data: {
                username,
                passwordHash,
            },
        })
        return user
    } catch {
        return null
    }
}

export const login = async ({ username, password }: LoginForm) => {
    const user = await prisma.user.findUnique({
        where: { username },
    })
    if (!user) {
        return null
    }

    const isCorrectPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isCorrectPassword) {
        return null
    }

    return user
}

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
    throw new Error('SESSION_SECRET must be set.')
}

const storage = createCookieSessionStorage({
    cookie: {
        name: '__session',
        secure: process.env.NODE_ENV === 'production',
        secrets: [sessionSecret],
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60,
        httpOnly: true,
    },
})

export const createUserSession = async (userId: number, redirectTo: string) => {
    const session = await storage.getSession()
    session.set('userId', userId)
    return redirect(redirectTo, {
        headers: {
            'Set-Cookie': await storage.commitSession(session),
        },
    })
}

export const getUserSession = (request: Request) => {
    return storage.getSession(request.headers.get('Cookie'))
}

export const getUserId = async (request: Request) => {
    const session = await getUserSession(request)
    const userId = session.get('userId')
    if (!userId || typeof userId !== 'number') {
        return null
    }
    return userId
}

export const requireUserId = async (
    request: Request,
    redirectTo: string = new URL(request.url).pathname
) => {
    const session = await getUserSession(request)
    const userId = session.get('userId')
    if (!userId || typeof userId !== 'number') {
        const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
        throw redirect(`/login?${searchParams}`)
    }
    return userId
}

export const getUser = async (request: Request) => {
    const userId = await getUserId(request)
    if (typeof userId !== 'number') {
        return null
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    })
    return user
}

export const logout = async (request: Request) => {
    const session = await getUserSession(request)
    return redirect('/login', {
        headers: {
            'Set-Cookie': await storage.destroySession(session),
        },
    })
}
