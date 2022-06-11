import { useOutletContext } from 'remix'
import { ContextData } from '../$username'

export default () => {
  const { user } = useOutletContext<ContextData>()

  return (
    <div>
      <p>Created at: {user.createdAt}</p>
    </div>
  )
}
