import { Routes } from "@angular/router";
import { MarcaListComponent } from "./components/marca/marca-list/marca-list";

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/marcas', 
    pathMatch: 'full' 
  },
  { 
    path: 'marcas', 
    component: MarcaListComponent 
  },
  // Adicione outras rotas aqui conforme necessário
  // { path: 'produtos', component: ProdutoListComponent },
  // { path: 'categorias', component: CategoriaListComponent }
];