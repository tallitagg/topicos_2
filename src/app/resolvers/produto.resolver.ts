import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Produto } from '../models/produto';
import { ProdutoService } from '../services/produto.service';

export const produtoResolver: ResolveFn<Produto | null> = (route) => {
  const id = route.paramMap.get('id');
  const produtoService = inject(ProdutoService);

  if (id) {
    return produtoService.findById(Number(id));
  }

  return null;
};