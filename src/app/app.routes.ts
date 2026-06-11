import { Routes } from '@angular/router';

import { ModeloList } from './components/modelo/modelo-list/modelo-list';
import { ModeloForm } from './components/modelo/modelo-form/modelo-form';
import { modeloResolver } from './resolvers/modelo.resolver';

import { MarcaList } from './components/marca/marca-list/marca-list';
import { MarcaForm } from './components/marca/marca-form/marca-form';
import { marcaResolver } from './resolvers/marca.resolver';

import { MaterialList } from './components/material/material-list/material-list';
import { MaterialForm } from './components/material/material-form/material-form';
import { materialResolver } from './resolvers/material.resolver';

import { CorList } from './components/cor/cor-list/cor-list';
import { CorForm } from './components/cor/cor-form/cor-form';
import { corResolver } from './resolvers/cor.resolver';

import { ProdutoList } from './components/produto/produto-list/produto-list';
import { ProdutoForm } from './components/produto/produto-form/produto-form';
import { produtoResolver } from './resolvers/produto.resolver';

import { LoginComponent } from './components/login/login';
import { CadastroComponent } from './components/cadastro/cadastro';
import { RecuperarSenhaComponent } from './components/recuperar-senha/recuperar-senha';

import { CatalogoComponent } from './components/catalogo/catalogo';
import { CarrinhoComponent } from './components/carrinho/carrinho';
import { ListaDesejosComponent } from './components/lista-desejos/lista-desejos';
import { FinalizarCompraComponent } from './components/finalizar-compra/finalizar-compra';
import { ResumoCompraComponent } from './components/resumo-compra/resumo-compra';
import { ProdutoDetalheComponent } from './components/produto-detalhe/produto-detalhe';
import { PerfilUsuarioComponent } from './components/perfil-usuario/perfil-usuario';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'catalogo',
    pathMatch: 'full'
  },

  {
    path: 'home',
    component: CatalogoComponent
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
    component: ProdutoDetalheComponent
  },

  {
    path: 'carrinho',
    component: CarrinhoComponent
  },

  {
    path: 'desejos',
    component: ListaDesejosComponent
  },

  {
    path: 'perfil',
    component: PerfilUsuarioComponent
  },

  {
    path: 'finalizar-compra',
    component: FinalizarCompraComponent
  },

  {
    path: 'resumo-compra',
    component: ResumoCompraComponent
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
];