import { Link, LoaderFunction, redirect } from "remix"
import { getUser } from "../utils/session.server"

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)

  return user ? redirect(`/home`) : null
}

export default () => {
  return (
    <div>
      <h1>nu zdarova</h1>
      <Link className="text-blue-500" to="/register">
        Register
      </Link>
    </div>
  )
}
