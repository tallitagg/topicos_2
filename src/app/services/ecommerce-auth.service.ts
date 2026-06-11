import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface LoginDTO {
  username: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  tipo: string;
}

export interface CadastroBasicoDTO {
  nome: string;
  username: string;
  email: string;
  telefone: string;
  senha: string;
  perfil: string;
  cpf: string;
}

export interface UsuarioLogado {
  id: number;
  username: string;
  nome: string;
  email: string;
  telefone: string;
  perfil: string;
}

export interface ClientePerfilResponse {
  id: number;
  usuario: UsuarioLogado;
  enderecoEntrega: any[];
  cpf: string;
}

export interface AtualizarPerfilDTO {
  senhaConfirmacao: string;
  nome: string;
  username: string;
  email: string;
  telefone: string;
  cpf: string;
}

export interface AlterarSenhaDTO {
  senhaAtual: string;
  novaSenha: string;
}

@Injectable({
  providedIn: 'root'
})
export class EcommerceAuthService {

  private readonly apiAuth = 'http://localhost:8080/auth';
  private readonly apiCadastro = 'http://localhost:8080/cadastroBasicoCliente';
  private readonly apiClientes = 'http://localhost:8080/clientes';

  constructor(private http: HttpClient) {}

  login(dto: LoginDTO): Observable<HttpResponse<AuthResponse>> {
    return this.http.post<AuthResponse>(`${this.apiAuth}/login`, dto, {
      observe: 'response'
    });
  }

  cadastrar(dto: CadastroBasicoDTO): Observable<any> {
    return this.http.post(this.apiCadastro, dto);
  }

  buscarUsuarioLogado(): Observable<UsuarioLogado> {
    return this.http.get<UsuarioLogado>(`${this.apiAuth}/me`, {
      headers: this.getHeaders()
    });
  }

  buscarMeuPerfil(): Observable<ClientePerfilResponse> {
    return this.http.get<ClientePerfilResponse>(`${this.apiClientes}/me`, {
      headers: this.getHeaders()
    });
  }

  atualizarPerfil(dto: AtualizarPerfilDTO): Observable<ClientePerfilResponse> {
    return this.http.put<ClientePerfilResponse>(`${this.apiClientes}/perfil`, dto, {
      headers: this.getHeaders()
    });
  }

  alterarSenha(dto: AlterarSenhaDTO): Observable<void> {
    return this.http.put<void>(`${this.apiAuth}/alterar-senha`, dto, {
      headers: this.getHeaders()
    });
  }

  salvarToken(token: string): void {
    const tokenLimpo = token.replace(/^Bearer\s+/i, '');
    localStorage.setItem('token', tokenLimpo);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logado(): boolean {
    return !!this.getToken();
  }

  sair(): void {
    localStorage.removeItem('token');
  }

  getHeaders(): HttpHeaders {
    const token = this.getToken();

    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getUsernameLogado(): string {
    const token = this.getToken();

    if (!token) {
      return 'visitante';
    }

    try {
      const payloadBase64 = token.split('.')[1];

      if (!payloadBase64) {
        return 'visitante';
      }

      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      return payload.sub || payload.upn || payload.preferred_username || 'visitante';
    } catch {
      return 'visitante';
    }
  }
}