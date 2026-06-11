import { ResolveFn } from '@angular/router';
import { CorService } from '../services/cor.service';
import { inject } from '@angular/core';
import { Cor } from '../models/cor';

export const corResolver: ResolveFn<Cor | null> = (route, state) => {
  const id = route.paramMap.get('id');

  if (id) {
    return inject(CorService).findById(id);
  }

  return null;
};