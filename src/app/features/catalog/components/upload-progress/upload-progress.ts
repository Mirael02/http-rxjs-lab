import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product';
import { UploadProgress } from '../../../../core/models/api-response-model';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-upload-progress',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './upload-progress.html'
})
export class UploadProgressComponent {
  private productSvc = inject(ProductService);
  
  @Output() uploaded = new EventEmitter<string>();
  uploadState: UploadProgress | null = null;

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.startUpload(file);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.startUpload(file);
  }

  startUpload(file: File) {
    this.uploadState = { type: 'progress', percent: 0 };
    
    this.productSvc.uploadImage(file).subscribe({
      next: (state: UploadProgress) => {
        this.uploadState = state;
        if (state.type === 'complete' && state.result?.thumbnail) {
          this.uploaded.emit(state.result.thumbnail);
        }
      },
      error: (err) => {
        this.uploadState = { type: 'error', error: err.message };
      }
    });
  }
}