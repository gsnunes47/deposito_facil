import tenantDomain from 'src/domains/tenantDomain';
import tipoDespesaDomain from 'src/domains/tipoDespesaDomain';
import prisma from 'src/repositories/db';

async function main() {
  for (const nome of ['test', 'usuario']) {
    const existente = await prisma.tenants.findUnique({
      where: { name: nome },
      select: { id: true },
    });
    if (existente) continue;

    const resultado = await tenantDomain.createTenant(nome);
    if (resultado.code !== 201) {
      throw new Error(`Falha ao criar tenant "${nome}": ${resultado.message}`);
    }
  }

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
