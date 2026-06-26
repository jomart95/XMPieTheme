import { useParams, useSearchParams , useNavigate} from 'react-router-dom'
import urlGenerator from '$ustoreinternal/services/urlGenerator'

const RedirectToReorder = () => {
  const {id, name} = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  navigate(`${urlGenerator.get({ page: 'products', id, name})}?OrderItemId=${searchParams.get('OrderItemId')}&reorder=true`, {replace: true})
  return null
}

export default RedirectToReorder
