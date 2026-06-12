import { Component } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [],
  templateUrl: './hero-carousel.html',
  styleUrl: './hero-carousel.css',
})

export class HeroCarousel {

  ngOnInit(): void {
    setTimeout(() => {
      const carouselElement = document.getElementById('heroCarousel');
      if (carouselElement) {
        new bootstrap.Carousel(carouselElement);
      }
    }, 500); 
  }
}