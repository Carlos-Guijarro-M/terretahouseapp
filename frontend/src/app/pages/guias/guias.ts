import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-guias',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './guias.html',
  styleUrls: ['./guias.css']
})
export class Guias {}