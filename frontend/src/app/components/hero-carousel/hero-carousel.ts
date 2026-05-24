import { Component, AfterViewInit } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [],
  templateUrl: './hero-carousel.html',
  styleUrl: './hero-carousel.css',
})
export class HeroCarousel implements AfterViewInit {

  ngAfterViewInit(): void {
    setTimeout(() => {
      const element = document.getElementById('heroCarousel');
      if (element) {
        new bootstrap.Carousel(element);
      }
    }, 100);
  }
}