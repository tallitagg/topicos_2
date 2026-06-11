import { ResolveFn } from '@angular/router';
import { MaterialService } from '../services/material.service';
import { inject } from '@angular/core';
import { Material } from '../models/material';

export const materialResolver: ResolveFn<Material | null> = (route, state) => {
  const id = route.paramMap.get('id');

  if (id) {
    return inject(MaterialService).findById(id);
  }

  return null;
};