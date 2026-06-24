import tenantDomain from 'src/domains/tenantDomain';

async function main() {
  await tenantDomain.createTenant('test');
  await tenantDomain.createTenant('usuario');
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
