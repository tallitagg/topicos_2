import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  AuthResponse,
  EcommerceAuthService
} from '../../services/ecommerce-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  form: FormGroup;

  ocultarSenha = true;
  carregando = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snack: MatSnackBar,
    private authService: EcommerceAuthService
  ) {
    this.form = this.formBuilder.group({
      username: ['', [Validators.required]],
      senha: ['', [Validators.required]]
    });
  }

  entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.exibirMensagem('Informe usuário e senha.');
      return;
    }

    this.carregando = true;

    const dto = {
      username: this.form.value.username,
      senha: this.form.value.senha
    };

    this.authService.login(dto).subscribe({
      next: (response: HttpResponse<AuthResponse>) => {
        this.carregando = false;

        const tokenBody = response.body?.token;
        const tokenHeader = response.headers.get('Authorization');
        const token = tokenBody || tokenHeader;

        if (!token) {
          this.exibirMensagem('Login realizado, mas o token não foi retornado.');
          return;
        }

        this.authService.salvarToken(token);

        this.exibirMensagem('Login realizado com sucesso!');
        this.router.navigateByUrl('/catalogo');
      },
      error: () => {
        this.carregando = false;
        this.exibirMensagem('Usuário ou senha inválidos.');
      }
    });
  }

  login(): void {
    this.entrar();
  }

  irParaCadastro(): void {
    this.router.navigateByUrl('/cadastro');
  }

  irParaRecuperarSenha(): void {
    this.router.navigateByUrl('/recuperar-senha');
  }

  private exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}