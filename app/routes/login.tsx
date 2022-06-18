import { ActionFunction, useActionData } from 'remix'
import AuthForm from '~/components/Auth/Form'
import AuthInput from '~/components/Auth/Input'
import { createUserSession, login } from '../utils/session.server'
import {
    badRequest,
    validatePassword,
    validateUsername,
} from '../utils/validate.server'

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData()

    const redirectTo = '/home'
    const username = form.get('username')
    const password = form.get('password')

    if (
        typeof redirectTo !== 'string' ||
        typeof username !== 'string' ||
        typeof password !== 'string'
    ) {
        return badRequest({ formError: 'Form not submitted correctly.' })
    }

    const fieldErrors = {
        username: validateUsername(username),
        password: validatePassword(password),
    }

    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors })
    } else {
        const user = await login({ username, password })

        if (!user) {
            return badRequest({
                formError: 'Username/Password combination is incorrect.',
            })
        }
        return createUserSession(user.id, redirectTo)
    }
}

export default () => {
    const action = useActionData()

    return (
        <AuthForm formError={action?.formError}>
            <AuthInput
                type="text"
                name="username"
                placeholder="Username"
                ariaInvalid={Boolean(action?.fieldErrors?.username)}
                ariaDescribedby={
                    action?.fieldErrors?.username ? 'username-error' : undefined
                }
                error={action?.fieldErrors?.username}
            />
            <AuthInput
                type="password"
                name="password"
                placeholder="Password"
                ariaInvalid={Boolean(action?.fieldErrors?.password)}
                ariaDescribedby={
                    action?.fieldErrors?.password ? 'password-error' : undefined
                }
                error={action?.fieldErrors?.password}
            />
        </AuthForm>
    )
}
