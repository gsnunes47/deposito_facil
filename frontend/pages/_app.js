import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthProvider } from '../contexts/AuthContext';
import { obterRotaLogin, verificarSessao } from '../services/authService';
import '../styles/login.css';

function rotaPublica(pathname) {
  return pathname.startsWith('/login') || pathname === '/admin';
}

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const publica = rotaPublica(router.pathname);
  const [autorizado, setAutorizado] = useState(publica);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    let ativo = true;

    if (publica) {
      setUsuario(null);
      setAutorizado(true);
      return () => {
        ativo = false;
      };
    }

    setAutorizado(false);
    verificarSessao()
      .then(({ user }) => {
        if (!ativo) return;

        const rotaRelatorios = router.pathname.startsWith('/relatorios');
        const podeVerRelatorios = ['admin', 'gerente'].includes(
          user.accessLevel,
        );

        if (rotaRelatorios && !podeVerRelatorios) {
          router.replace('/');
          return;
        }

        setUsuario(user);
        setAutorizado(true);
      })
      .catch(() => {
        if (ativo) router.replace(obterRotaLogin());
      });

    return () => {
      ativo = false;
    };
  }, [publica, router, router.asPath]);

  if (!autorizado) return null;

  return (
    <AuthProvider value={usuario}>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
