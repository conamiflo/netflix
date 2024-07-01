import { Component, OnInit } from '@angular/core';
import { addIcons} from 'ionicons';
import {IonIcon} from '@ionic/angular/standalone'
import { cameraOutline, playCircle, shareSocial, play, downloadOutline, chevronUp ,calendarOutline,timeOutline,star,send} from 'ionicons/icons';
import {MovieReviewComponent} from "../movie-review/movie-review.component";
import {MovieCardComponent} from "../movie-card/movie-card.component";
import {MovieReviewDialogComponent} from "../movie-review-dialog/movie-review-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {ActivatedRoute} from "@angular/router";
import {MovieService} from "../../../../../core/services/movie/movie.service";
import {NgFor} from "@angular/common";
import {FileDownloadService} from "../../../../../core/services/download/download.service";

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [IonIcon, MovieReviewComponent, MovieCardComponent,MatLabel,MatFormField,NgFor],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css'
})
export class MovieDetailsComponent{
  constructor(public dialog: MatDialog,
              private route: ActivatedRoute,
              private movieService: MovieService,
              private fileDownloadService: FileDownloadService) {
    addIcons({ cameraOutline, playCircle, shareSocial, play, downloadOutline, chevronUp,calendarOutline,timeOutline,star,send});
  }
  movie: any;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const movieId = params.get('id');
      const movieTitle = params.get('title');

      if (movieId && movieTitle) {
        this.movieService.getMovieByIdAndTitle(movieId, movieTitle).subscribe(
          (data) => {
            this.movie = data;
          },
          (error) => {
            console.error('Error fetching movie data', error);
          }
        );
      }
    });
  }

  downloadFile() {
    this.fileDownloadService.downloadFileFromPresignedUrl(this.movie.download_url)
      .subscribe((data: Blob) => {
        // Ovde možete manipulisati sa dobijenim blob-om, npr. sačuvati ga ili prikazati korisniku
        const blob = new Blob([data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      }, error => {
        console.error('Greška prilikom skidanja fajla', error);
      });
  }

  openReviewDialog(): void{
    const dialogRef = this.dialog.open(MovieReviewDialogComponent, {
      width: '550px'
      });
  }
}

