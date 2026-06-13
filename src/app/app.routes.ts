import { Routes } from '@angular/router';

import { adminGuard, adminChildGuard } from './guards/admin.guard';
import { clienteGuard } from './guards/cliente.guard';

import { HomeComponent } from './components/administrador/home/home.component/home.component';

import { ModeloList } from './components/administrador/modelo/modelo-list/modelo-list';
import { ModeloForm } from './components/administrador/modelo/modelo-form/modelo-form';
import { modeloResolver } from './resolvers/modelo.resolver';

import { MarcaList } from './components/administrador/marca/marca-list/marca-list';
import { MarcaForm } from './components/administrador/marca/marca-form/marca-form';
import { marcaResolver } from './resolvers/marca.resolver';

import { MaterialList } from './components/administrador/material/material-list/material-list';
import { MaterialForm } from './components/administrador/material/material-form/material-form';
import { materialResolver } from './resolvers/material.resolver';

import { CorList } from './components/administrador/cor/cor-list/cor-list';
import { CorForm } from './components/administrador/cor/cor-form/cor-form';
import { corResolver } from './resolvers/cor.resolver';

import { ProdutoList } from './components/administrador/produto/produto-list/produto-list';
import { ProdutoForm } from './components/administrador/produto/produto-form/produto-form';
import { produtoResolver } from './resolvers/produto.resolver';

import { LoginComponent } from './components/login/login';
import { CadastroComponent } from './components/cadastro/cadastro';
import { RecuperarSenhaComponent } from './components/recuperar-senha/recuperar-senha';

import { CatalogoComponent } from './components/usuario/catalogo/catalogo';
import { CarrinhoComponent } from './components/usuario/carrinho/carrinho';
import { ListaDesejosComponent } from './components/usuario/lista-desejos/lista-desejos';
import { FinalizarCompraComponent } from './components/usuario/finalizar-compra/finalizar-compra';
import { ResumoCompraComponent } from './components/usuario/resumo-compra/resumo-compra';
import { ProdutoDetalheComponent } from './components/usuario/produto-detalhe/produto-detalhe';
import { PerfilUsuarioComponent } from './components/usuario/perfil-usuario/perfil-usuario';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'catalogo',
    pathMatch: 'full'
  },

  {
    path: 'home',
    redirectTo: 'catalogo',
    pathMatch: 'full'
  },

  {
    path: 'catalogo',
    component: CatalogoComponent
  },

  {
    path: 'produto/:id',
    component: ProdutoDetalheComponent
  },

  {
    path: 'detalhe-produto/:id',
    redirectTo: 'produto/:id',
    pathMatch: 'full'
  },

  {
    path: 'carrinho',
    component: CarrinhoComponent,
    canActivate: [clienteGuard]
  },

  {
    path: 'desejos',
    component: ListaDesejosComponent,
    canActivate: [clienteGuard]
  },

  {
    path: 'perfil',
    component: PerfilUsuarioComponent,
    canActivate: [clienteGuard]
  },

  {
    path: 'finalizar-compra',
    component: FinalizarCompraComponent,
    canActivate: [clienteGuard]
  },

  {
    path: 'resumo-compra',
    component: ResumoCompraComponent,
    canActivate: [clienteGuard]
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'cadastro',
    component: CadastroComponent
  },

  {
    path: 'recuperar-senha',
    component: RecuperarSenhaComponent
  },

  {
    path: 'admin',
    canActivate: [adminGuard],
    canActivateChild: [adminChildGuard],
    children: [
      {
        path: '',
        component: HomeComponent
      },

      {
        path: 'dashboard',
        component: HomeComponent
      },

      {
        path: 'marcas',
        children: [
          {
            path: '',
            component: MarcaList
          },
          {
            path: 'new',
            component: MarcaForm
          },
          {
            path: 'edit/:id',
            component: MarcaForm,
            resolve: {
              marca: marcaResolver
            }
          }
        ]
      },

      {
        path: 'modelos',
        children: [
          {
            path: '',
            component: ModeloList
          },
          {
            path: 'new',
            component: ModeloForm
          },
          {
            path: 'edit/:id',
            component: ModeloForm,
            resolve: {
              modelo: modeloResolver
            }
          }
        ]
      },

      {
        path: 'materiais',
        children: [
          {
            path: '',
            component: MaterialList
          },
          {
            path: 'new',
            component: MaterialForm
          },
          {
            path: 'edit/:id',
            component: MaterialForm,
            resolve: {
              material: materialResolver
            }
          }
        ]
      },

      {
        path: 'cores',
        children: [
          {
            path: '',
            component: CorList
          },
          {
            path: 'new',
            component: CorForm
          },
          {
            path: 'edit/:id',
            component: CorForm,
            resolve: {
              cor: corResolver
            }
          }
        ]
      },

      {
        path: 'produtos',
        children: [
          {
            path: '',
            component: ProdutoList
          },
          {
            path: 'new',
            component: ProdutoForm
          },
          {
            path: 'edit/:id',
            component: ProdutoForm,
            resolve: {
              produto: produtoResolver
            }
          }
        ]
      }
    ]
  },

  {
    path: 'marcas',
    redirectTo: 'admin/marcas',
    pathMatch: 'full'
  },

  {
    path: 'marcas/new',
    redirectTo: 'admin/marcas/new',
    pathMatch: 'full'
  },

  {
    path: 'marcas/edit/:id',
    redirectTo: 'admin/marcas/edit/:id',
    pathMatch: 'full'
  },

  {
    path: 'modelos',
    redirectTo: 'admin/modelos',
    pathMatch: 'full'
  },

  {
    path: 'modelos/new',
    redirectTo: 'admin/modelos/new',
    pathMatch: 'full'
  },

  {
    path: 'modelos/edit/:id',
    redirectTo: 'admin/modelos/edit/:id',
    pathMatch: 'full'
  },

  {
    path: 'materiais',
    redirectTo: 'admin/materiais',
    pathMatch: 'full'
  },

  {
    path: 'materiais/new',
    redirectTo: 'admin/materiais/new',
    pathMatch: 'full'
  },

  {
    path: 'materiais/edit/:id',
    redirectTo: 'admin/materiais/edit/:id',
    pathMatch: 'full'
  },

  {
    path: 'cores',
    redirectTo: 'admin/cores',
    pathMatch: 'full'
  },

  {
    path: 'cores/new',
    redirectTo: 'admin/cores/new',
    pathMatch: 'full'
  },

  {
    path: 'cores/edit/:id',
    redirectTo: 'admin/cores/edit/:id',
    pathMatch: 'full'
  },

  {
    path: 'produtos',
    redirectTo: 'admin/produtos',
    pathMatch: 'full'
  },

  {
    path: 'produtos/new',
    redirectTo: 'admin/produtos/new',
    pathMatch: 'full'
  },

  {
    path: 'produtos/edit/:id',
    redirectTo: 'admin/produtos/edit/:id',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'catalogo'
  }
];