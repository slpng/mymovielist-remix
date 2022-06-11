import { User } from "@prisma/client"
import { useMemo } from "react"
import { NavLink } from "remix"

interface NavigationLink {
  path: string
  text: string
}

const commonLinks: NavigationLink[] = [
  {
    path: "/",
    text: "Home"
  },
  {
    path: "/search",
    text: "Search"
  }
]

const noUserLinks: NavigationLink[] = [
  {
    path: "/login",
    text: "Login"
  },
  {
    path: "/register",
    text: "Register"
  }
]

interface Props {
  user: User | null
}

export default ({ user }: Props) => {
  const links = useMemo(() => {
    if (user) {
      return commonLinks.concat([
        {
          path: `/user/${user.username}`,
          text: user.username
        },
        {
          path: "/logout",
          text: "Logout"
        }
      ])
    }
    return commonLinks.concat(noUserLinks)
  }, [user])

  return (
    <nav className="flex items-center gap-5">
      {links.map((link) => (
        <NavLink to={link.path}>{link.text}</NavLink>
      ))}
    </nav>
  )
}
