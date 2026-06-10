import type { Request, Response } from 'express';
import vendaDomain from '../domains/vendaDomain.js';

export async function createVenda(request: Request, response: Response) {
  const user = request.user;

  if (!request.body.cliente_id || isNaN(Number(request.body.cliente_id))) {
    return response.status(400).send({
      error: 'ID do cliente é obrigatório e deve ser um número',
    });
  }

  if (
    !request.body.produtos ||
    !Array.isArray(request.body.produtos) ||
    request.body.produtos.length === 0
  ) {
    return response.status(400).send({
      error: 'Produtos da venda são obrigatórios e devem ser uma lista',
    });
  }

  let produtosData: any[] = [];

  for (const [index, produto] of request.body.produtos.entries()) {
    if (!produto.id) {
      return response.status(400).send({
        error: `ID do produto é obrigatório para o produto na posição ${index}`,
      });
    } else if (isNaN(Number(produto.id))) {
      return response.status(400).send({
        error: `ID do produto deve ser um número para o produto na posição ${index}`,
      });
    }

    if (!produto.quantidade) {
      return response.status(400).send({
        error: `Quantidade é obrigatória para o produto na posição ${index}`,
      });
    } else if (isNaN(Number(produto.quantidade))) {
      return response.status(400).send({
        error: `Quantidade deve ser um número para o produto na posição ${index}`,
      });
    }

    if (!produto.valor_unitario) {
      return response.status(400).send({
        error: `Valor unitário é obrigatório para o produto na posição ${index}`,
      });
    } else if (isNaN(Number(produto.valor_unitario))) {
      return response.status(400).send({
        error: `Valor unitário deve ser um número para o produto na posição ${index}`,
      });
    }

    produtosData.push({
      id: produto.id,
      quantidade: produto.quantidade,
      valor_unitario: produto.valor_unitario,
    });
  }

  const vendaNova = await vendaDomain.createVenda(
    Number(request.body.cliente_id),
    produtosData,
    request.user.tenantId,
  );

  if (!vendaNova.venda_id) {
    return response.status(400).send(vendaNova);
  }

  return response.status(200).send({
    message: 'Venda criada com sucesso',
    venda_id: vendaNova.venda_id,
  });
}

export async function getVendasAbertas(request: Request, response: Response) {
  const vendas = await vendaDomain.getVendasAbertas(request.user.tenantId);
  response.status(200).send(vendas);
}

export async function getVendasFechadas(request: Request, response: Response) {
  const vendas = await vendaDomain.getVendasFechadas(request.user.tenantId);
  response.status(200).send(vendas);
}

export async function getPagamentos(request: Request, response: Response) {

  if (!request.params.id || isNaN(Number(request.params.id))) {
    return response.status(400).send({
      error: 'ID da venda é obrigatório e deve ser um número',
    });
  }

  const vendas = await vendaDomain.getVendaPagamentos(Number(request.params.id), request.user.tenantId);
  response.status(200).send(vendas);
}

// export async function updateVenda(request: Request, response: Response) {

//     const vendaId = request.params.id

//     if (!vendaId) {
//         return response.status(400).send({ error: "ID do venda é obrigatório" })
//     } else if (isNaN(Number(vendaId))) {
//         return response.status(400).send({ error: "ID do venda deve ser um número" })
//     }

//     const vendaData = {
//         id: Number(vendaId),
//         nome: request.body.nome as string || null,
//         documento: request.body.documento as string || null,
//         tenant_id: request.user.tenantId
//     }

//     const updatedVenda = await vendaDomain.updateVenda(vendaData)

//     if (updatedVenda.code != 200) {
//         return response.status(400).send(updatedVenda)
//     } else {
//         response.status(200).send(updatedVenda)
//     }

// }
