import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export const withRouter = (Component) => {
    const Wrapper = (props) => {
        const { pathname } = useLocation()
        const navigate = useNavigate()
        const [searchParams] = useSearchParams()

        return (
            <Component asPath={pathname} navigate={navigate} searchParams={searchParams} {...props}/>
        )
    }

    return Wrapper
}
