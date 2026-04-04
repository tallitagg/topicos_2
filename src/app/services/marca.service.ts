import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Marca } from "../models/marca";


export interface MarcaDTO {
  nome: string;
}

@Injectable({
    providedIn: "root"
})
export class MarcaService {
    private apiUrl = "http://localhost:8080/api/marcas";

  constructor(private http: HttpClient) {}

  getMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.apiUrl);
  }   

  getMarcasByName(nome: string): Observable<Marca[]> {
    return this.http.get<Marca[]>(`${this.apiUrl}?nome=${nome}`);
  }

  incluirMarca(marca: MarcaDTO): Observable<Marca> {
    return this.http.post<Marca>(this.apiUrl, marca);
  }       

  alterarMarca(id: number, marca: MarcaDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, marca);
  }

  deleteMarca(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}