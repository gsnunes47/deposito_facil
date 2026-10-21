import tenantDomain from 'src/domains/tenantDomain';
import tipoDespesaDomain from 'src/domains/tipoDespesaDomain';
import prisma from 'src/repositories/db';

async function main() {
  await tenantDomain.createTenant('test');
  await tenantDomain.createTenant('usuario');

  const tenants = await prisma.tenants.findMany({ select: { id: true } });
  for (const tenant of tenants) {
    await tipoDespesaDomain.inicializar(tenant.id);
  }
}

main()
  .then(() => {
    console.log('Seed finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  });
