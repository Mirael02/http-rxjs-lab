import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { ProductService } from '../../services/product';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productSvc = inject(ProductService);

  form!: FormGroup;
  isEditMode = false;
  editId: number | null = null;
  isSaving = false;

  ngOnInit() {
    this.buildForm();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.editId = +id;
      this.loadProduct(+id);
    }
  }

  buildForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      brand: ['', Validators.required],
      category: ['', Validators.required],
      thumbnail: ['', Validators.required],
      discountPercentage: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  loadProduct(id: number) {
    this.productSvc.getProduct(id).subscribe(product => {
      this.form.patchValue({
        title: product.title,
        description: product.description,
        price: product.price,
        stock: product.stock,
        brand: product.brand,
        category: product.category,
        thumbnail: product.thumbnail,
        discountPercentage: product.discountPercentage
      });
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formValue = this.form.value;

    const action$ = this.isEditMode && this.editId
      ? this.productSvc.updateProduct(this.editId, formValue)
      : this.productSvc.createProduct(formValue);

    action$.pipe(
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: () => {
        alert(this.isEditMode ? 'Produk berhasil diperbarui!' : 'Produk berhasil ditambahkan!');
        this.router.navigate(['/catalog']);
      },
      error: (err) => {
        alert('Gagal menyimpan: ' + err.message);
      }
    });
  }

  cancel() {
    this.router.navigate(['/catalog']);
  }
}
