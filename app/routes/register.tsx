import { ActionFunction, useActionData } from "remix"
import AuthForm from "~/components/Auth/Form"
import AuthInput from "~/components/Auth/Input"
import { createUserSession, register } from "~/utils/session.server"
import {
  badRequest,
  validateEmail,
  validatePassword,
  validateUsername
} from "../utils/validate.server"

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()

  const redirectTo = "/home"
  const email = form.get("email")
  const username = form.get("username")
  const password = form.get("password")

  if (
    typeof email !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return badRequest({ formError: "Form not submitted correctly." })
  }

  const fieldErrors = {
    email: validateEmail(email),
    username: validateUsername(username),
    password: validatePassword(password)
  }

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors })
  } else {
    const user = await register({ username, password })
    if (!user) {
      return badRequest({
        formError: "Username is already in use."
      })
    }

    return createUserSession(user.id, redirectTo)
  }
}

export default () => {
  const action = useActionData()

  return (
    <AuthForm formError={action?.formError} isRegisterForm>
      <AuthInput
        type="text"
        name="email"
        placeholder="Email"
        ariaInvalid={Boolean(action?.fieldErrors?.email)}
        ariaDescribedby={action?.fieldErrors?.email ? "email-error" : undefined}
        error={action?.fieldErrors?.email}
      />
      <AuthInput
        type="text"
        name="username"
        placeholder="Username"
        ariaInvalid={Boolean(action?.fieldErrors?.username)}
        ariaDescribedby={
          action?.fieldErrors?.username ? "username-error" : undefined
        }
        error={action?.fieldErrors?.username}
      />
      <AuthInput
        type="password"
        name="password"
        placeholder="Password"
        ariaInvalid={Boolean(action?.fieldErrors?.password)}
        ariaDescribedby={
          action?.fieldErrors?.password ? "password-error" : undefined
        }
        error={action?.fieldErrors?.password}
      />
    </AuthForm>
  )
}
