const visualBananasFerreira = {
  backgroundColor: '#242424',
  backgroundSize: 'clamp(220px, 25vw, 420px) auto',
  backgroundPosition: 'right 24px bottom 24px',
};

const visualMeaPostePadrao = {
  backgroundColor: '#FFFFFF',
  backgroundSize: 'clamp(220px, 25vw, 420px) auto',
  backgroundPosition: 'right 24px bottom 24px',
};

const visualMax = {
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  backgroundColor: '#C3C3C3',
};

const VISUAIS_TENANT = {
  // 2: {
  // ...visualMeaPostePadrao,
  // background: '/tenants/2/background.png',
  // },
  5: {
    ...visualBananasFerreira,
    background: '/tenants/5/background.png',
  },
  6: {
    ...visualMeaPostePadrao,
    background: '/tenants/6/background.png',
  },
  8: {
    ...visualMax,
    background: '/tenants/8/background.png',
  },
};

export function obterVisualTenant(tenantId) {
  return VISUAIS_TENANT[Number(tenantId)] ?? null;
}
