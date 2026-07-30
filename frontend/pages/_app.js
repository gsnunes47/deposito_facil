import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { obterVisualTenant } from '../config/tenants';
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
  const visualTenant = obterVisualTenant(usuario?.tenantId);

  useEffect(() => {
    if (!visualTenant) return undefined;

    const body = document.body;
    body.style.backgroundImage = `url("${visualTenant.background}")`;
    body.style.backgroundColor = visualTenant.backgroundColor;
    body.style.backgroundSize = visualTenant.backgroundSize;
    body.style.backgroundPosition = visualTenant.backgroundPosition;

    return () => {
      body.style.removeProperty('background-image');
      body.style.removeProperty('background-color');
      body.style.removeProperty('background-size');
      body.style.removeProperty('background-position');
    };
  }, [
    visualTenant?.background,
    visualTenant?.backgroundColor,
    visualTenant?.backgroundSize,
    visualTenant?.backgroundPosition,
  ]);

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
