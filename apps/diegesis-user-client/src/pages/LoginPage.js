import { MuiMaterial, Typography, Button } from '@eten-lab/ui-kit';
import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
const { TextField, Box, Container } = MuiMaterial;

export default function LoginPage() {
    const [message, setMessage] = useState('');
    const formRef = useRef();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/';

    const doLogin = async (e) => {
        e.preventDefault()
        try {
            setMessage('')
            const urlEncodedPayload = new URLSearchParams(new FormData(formRef.current))
            const res = await fetch('/new-login-auth', {
                method: 'POST',
                body: urlEncodedPayload
            })
            if (res.redirected && window) {
                window.location.href = res.url;
            } else {
                setMessage(await res.text())
            }
        } catch (error) {
            setMessage(error.message || 'Something went wrong! please check your internet connection.')
        }
    }

    return (
        <Container>
            <form ref={formRef} method="post" onSubmit={doLogin}>
                <input type="hidden" name="redirect" value={redirectUrl} />
                <Box display={'flex'} alignItems={'center'} marginTop={'20vh'} sx={{ marginY: '50px' }} flexDirection={'column'}>
                    <Typography variant={'caption'} textAlign={'center'} color={'Highlight'} fontWeight={700}>{message}</Typography>
                    <Typography variant={'h2'} sx={{ marginY: '25px' }}>Login</Typography>
                    <TextField id="username" name="username" label="Username" variant="outlined" type={'text'} required />
                    <TextField id="password" name="password" label="Password" variant="outlined" type={'password'} sx={{ marginY: '15px' }} required />
                    <Button variant={'contained'} color={'primary'} endIcon type={"submit"}>Login</Button>
                </Box>
            </form>
        </Container>
    )
}