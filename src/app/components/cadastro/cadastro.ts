import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { EcommerceAuthService } from '../../services/ecommerce-auth.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class CadastroComponent {

  form: FormGroup;
  ocultarSenha = true;
  ocultarConfirmacao = true;

  constructor(
    private fb: FormBuilder,
    private authService: EcommerceAuthService,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.minLength(11)]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.minLength(10)]],
      senha: ['', [Validators.required, Validators.minLength(3)]],
      confirmarSenha: ['', [Validators.required]]
    }, {
      validators: this.senhasIguais
    });
  }

  senhasIguais(control: AbstractControl): ValidationErrors | null {
    const senha = control.get('senha')?.value;
    const confirmarSenha = control.get('confirmarSenha')?.value;

    if (senha && confirmarSenha && senha !== confirmarSenha) {
      return { senhasDiferentes: true };
    }

    return null;
  }

  cadastrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto = {
      nome: this.form.value.nome,
      username: this.form.value.username,
      email: this.form.value.email,
      telefone: this.form.value.telefone,
      senha: this.form.value.senha,
      perfil: 'USER',
      cpf: this.form.value.cpf
    };

    this.authService.cadastrar(dto).subscribe({
      next: () => {
        this.exibirMensagem('Cadastro realizado com sucesso!');
        this.router.navigateByUrl('/login');
      },
      error: (erro) => {
        const mensagem = erro.error?.message || 'Erro ao realizar cadastro.';
        this.exibirMensagem(mensagem);
      }
    });
  }

  exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}