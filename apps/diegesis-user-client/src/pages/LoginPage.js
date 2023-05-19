import { MuiMaterial, Typography } from '@eten-lab/ui-kit';
import { Button } from '@eten-lab/ui-kit';
import { useSearchParams } from 'react-router-dom';
const { TextField, Box, Container } = MuiMaterial;

export default function LoginPage() {
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/';
    return (
        <Container>
            <form action="http://localhost:1234/new-login-auth" method="post">
                <input type="hidden" name="redirect" value={redirectUrl} />
                <Box display={'flex'} alignItems={'center'} marginTop={'20vh'} sx={{ marginY: '50px' }} flexDirection={'column'}>
                    <Typography variant={'h2'} sx={{ marginY: '10px' }}>Login</Typography>
                    <TextField id="username" name="username" label="Username" variant="outlined" type={'text'} required />
                    <TextField id="password" name="password" label="Password" variant="outlined" type={'password'} sx={{ marginY: '15px' }} required />
                    <Button variant={'contained'} color={'primary'} endIcon type={"submit"}>Login</Button>
                </Box>
            </form>
        </Container>
    )
}