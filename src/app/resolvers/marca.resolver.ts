import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Marca } from '../models/marca';
import { MarcaService } from '../services/marca.service';

export const marcaResolver: ResolveFn<Marca | null> = (route) => {
  const id = route.paramMap.get('id');
  const marcaService = inject(MarcaService);

  if (id) {
    return marcaService.findById(Number(id));
  }

  return null;
};