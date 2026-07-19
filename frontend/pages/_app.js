import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { obterRotaLogin, verificarSessao } from '../services/authService';
import '../styles/login.css';

function rotaPublica(pathname) {
  return pathname.startsWith('/login') || pathname === '/admin';
}

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const publica = rotaPublica(router.pathname);
  const [autorizado, setAutorizado] = useState(publica);

  useEffect(() => {
    let ativo = true;

    if (publica) {
      setAutorizado(true);
      return () => {
        ativo = false;
      };
    }

    setAutorizado(false);
    verificarSessao()
      .then(() => {
        if (ativo) setAutorizado(true);
      })
      .catch(() => {
        if (ativo) router.replace(obterRotaLogin());
      });

    return () => {
      ativo = false;
    };
  }, [publica, router, router.asPath]);

  if (!autorizado) return null;

  return <Component {...pageProps} />;
}
