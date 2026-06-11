import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Modelo } from '../models/modelo';
import { ModeloService } from '../services/modelo.service';

export const modeloResolver: ResolveFn<Modelo | null> = (route) => {
  const id = route.paramMap.get('id');
  const modeloService = inject(ModeloService);

  if (id) {
    return modeloService.findById(Number(id));
  }

  return null;
};