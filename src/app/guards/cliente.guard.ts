import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { EcommerceAuthService } from '../services/ecommerce-auth.service';

export const clienteGuard: CanActivateFn = (route, state) => {
  const authService = inject(EcommerceAuthService);
  const router = inject(Router);

  if (!authService.logado()) {
    return router.createUrlTree(['/login'], {
      queryParams: {
        returnUrl: state.url
      }
    });
  }

  if (authService.isUsuarioComum()) {
    return true;
  }

  return authService.buscarUsuarioLogado().pipe(
    map((usuario) => {
      authService.salvarPerfil(usuario.perfil);

      if (authService.isUsuarioComum()) {
        return true;
      }

      return router.createUrlTree(['/catalogo']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/catalogo']));
    })
  );
};