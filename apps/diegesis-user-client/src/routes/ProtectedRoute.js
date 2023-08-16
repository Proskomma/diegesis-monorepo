import { useLocation, useNavigate } from "react-router-dom";
import { MuiMaterial } from '@eten-lab/ui-kit';
import { useAppContext } from "../contexts/AppContext";

const { Typography } = MuiMaterial;

const ProtectedRoute = ({ children, roles = [] }) => {
    const { authLoaded, authed, user } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    if (authLoaded) {
        const loginUrl = `/login?redirect=${location.pathname}`;
        if (authed) {
            if (roles.length) {
                const roleAllowed = !!user.roles.find(ur => roles.includes(ur));
                if (roleAllowed) return children;
                else {
                    navigate(loginUrl);
                }
            } else {
                return children;
            }
        } else {
            navigate(loginUrl);
        }
    }
    return <Typography variant={'h1'} textAlign={'center'}>Loading...</Typography>
}

export default ProtectedRoute