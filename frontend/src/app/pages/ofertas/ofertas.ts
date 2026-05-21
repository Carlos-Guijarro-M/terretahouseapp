import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ofertas.html',
  styleUrls: ['./ofertas.css']
})
export class Ofertas {}