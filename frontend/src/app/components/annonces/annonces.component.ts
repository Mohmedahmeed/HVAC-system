import { Component, OnInit } from '@angular/core';
import { AnnonceService, Annonce } from '../../services/annonce.service';

@Component({
  selector: 'app-annonces',
  templateUrl: './annonces.component.html',
  styleUrls: ['./annonces.component.css']
})
export class AnnoncesComponent implements OnInit {
  annonces: Annonce[] = [];
  showDescription: boolean[] = [];

  constructor(private annonceService: AnnonceService) {}

  ngOnInit() {
    this.annonceService.getAllAnnonces().subscribe({
      next: (data) => {
        this.annonces = data;
        this.showDescription = new Array(data.length).fill(false);
      },
      error: (err) => console.error('Error fetching annonces', err)
    });
  }

  toggleDescription(index: number) {
    this.showDescription[index] = !this.showDescription[index];
  }
}
