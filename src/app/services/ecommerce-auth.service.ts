import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface LoginDTO {
  username: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  tipo?: string;
  perfil?: string;
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

  salvarToken(token: string, perfil?: string | null): void {
    const tokenLimpo = token.replace(/^Bearer\s+/i, '');

    localStorage.setItem('token', tokenLimpo);

    const perfilNormalizado =
      this.normalizarPerfil(perfil) ||
      this.extrairPerfilDoToken(tokenLimpo);

    if (perfilNormalizado) {
      this.salvarPerfil(perfilNormalizado);
    } else {
      localStorage.removeItem('perfil');
    }
  }

  salvarPerfil(perfil: string | null | undefined): void {
    const perfilNormalizado = this.normalizarPerfil(perfil);

    if (perfilNormalizado) {
      localStorage.setItem('perfil', perfilNormalizado);
      return;
    }

    localStorage.removeItem('perfil');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getPerfilLogado(): string {
    const perfilSalvo = localStorage.getItem('perfil');

    if (perfilSalvo) {
      return this.normalizarPerfil(perfilSalvo) || 'USER';
    }

    const token = this.getToken();

    if (!token) {
      return 'VISITANTE';
    }

    return this.extrairPerfilDoToken(token) || 'USER';
  }

  logado(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getPerfilLogado() === 'ADM';
  }

  isUsuarioComum(): boolean {
    const perfil = this.getPerfilLogado();
    return perfil === 'USER' || perfil === 'CLIENTE';
  }

  rotaInicialPorPerfil(): string {
    if (this.isAdmin()) {
      return '/admin';
    }

    return '/catalogo';
  }

  sair(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('perfil');
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

    const payload = this.decodificarToken(token);

    return payload?.sub ||
      payload?.upn ||
      payload?.preferred_username ||
      payload?.username ||
      'visitante';
  }

  private extrairPerfilDoToken(token: string): string | null {
    const payload = this.decodificarToken(token);

    if (!payload) {
      return null;
    }

    const perfilDireto = this.normalizarPerfil(
      payload.perfil ||
      payload.tipo ||
      payload.role ||
      payload.authority ||
      payload['groups'] ||
      payload['roles'] ||
      payload['authorities']
    );

    return perfilDireto;
  }

  private decodificarToken(token: string): any | null {
    try {
      const payloadBase64 = token.split('.')[1];

      if (!payloadBase64) {
        return null;
      }

      const base64 = payloadBase64
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const base64Completo = base64.padEnd(
        base64.length + ((4 - base64.length % 4) % 4),
        '='
      );

      return JSON.parse(atob(base64Completo));
    } catch {
      return null;
    }
  }

  private normalizarPerfil(valor: any): string | null {
    if (!valor) {
      return null;
    }

    if (Array.isArray(valor)) {
      const perfis = valor
        .map(item => this.normalizarPerfil(item))
        .filter(Boolean) as string[];

      if (perfis.includes('ADM')) {
        return 'ADM';
      }

      if (perfis.includes('ADMIN')) {
        return 'ADM';
      }

      if (perfis.includes('ADMINISTRADOR')) {
        return 'ADM';
      }

      if (perfis.includes('CLIENTE')) {
        return 'CLIENTE';
      }

      if (perfis.includes('USER')) {
        return 'USER';
      }

      return perfis[0] || null;
    }

    const texto = String(valor)
      .toUpperCase()
      .trim()
      .replace(/^ROLE_/, '');

    if (!texto || texto === 'BEARER' || texto === 'TOKEN') {
      return null;
    }

    if (texto.includes('ADM') || texto.includes('ADMIN')) {
      return 'ADM';
    }

    if (texto.includes('CLIENTE')) {
      return 'CLIENTE';
    }

    if (texto.includes('USER') || texto.includes('USUARIO') || texto.includes('USUÁRIO')) {
      return 'USER';
    }

    return texto;
  }
}