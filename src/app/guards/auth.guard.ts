import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { EcommerceAuthService } from '../services/ecommerce-auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(EcommerceAuthService);
  const router = inject(Router);

  if (authService.logado()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: {
      returnUrl: state.url
    }
  });
};