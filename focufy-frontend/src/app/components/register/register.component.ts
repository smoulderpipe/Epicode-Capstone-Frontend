import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user';
import { passwordMatchValidator } from 'src/app/validators/validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit{
    registerForm!: FormGroup;

    private baseUrl = 'http://localhost:8080/auth/register';

    constructor(private http: HttpClient){
    }

    ngOnInit(): void {
      this.registerForm = new FormGroup({
        name: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
        email: new FormControl(null, [Validators.required, Validators.email]),
        password: new FormControl(null, [Validators.required, Validators.minLength(8), Validators.maxLength(30)]),
        passwordConf: new FormControl(null, [
          Validators.required,
          Validators.minLength(8), Validators.maxLength(30),
          passwordMatchValidator('password')
        ])
      });
  
      this.registerForm.get('password')?.valueChanges.subscribe(passwordValue => {
        this.registerForm.get('passwordConf')?.updateValueAndValidity();
      });
    }

    onSubmit() {
      if (this.registerForm && this.registerForm.valid) {
        const user: User = {
          name: this.registerForm.value.name,
          email: this.registerForm.value.email,
          password: this.registerForm.value.password
        };
  
        this.http.post(this.baseUrl, user)
          .subscribe(response => {
            console.log('Utente creato con successo:', response);
            alert('Grazie per esserti registrato!');
            window.location.href = "/login";
          }, error => {
            console.error('Errore nella creazione dell utente:', error);
            alert('Si è verificato un errore, riprovare più tardi');
          });
      } else {
        console.error('Il form non è valido!');
      }
    }

    
}
