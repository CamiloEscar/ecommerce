import { afterNextRender, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { CartService } from '../../home/service/cart.service';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-filter-advance',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ModalProductComponent],
  templateUrl: './filter-advance.component.html',
  styleUrl: './filter-advance.component.css'
})
export class FilterAdvanceComponent implements OnInit {
Math = Math;
  toggleItemsDropdown: boolean = false;
  Categories: any[] = [];
  Colors: any[] = [];
  Brands: any[] = [];
  Products_relateds: any[] = [];

  PRODUCTS: any[] = [];
  ALL_PRODUCTS: any[] = []; // Todos los productos para búsqueda
  currency: string = 'ARS';

  product_selected: any = null;
  variation_selected: any = null;
  DISCOUNT_FLASH: any = null;

  categories_selected: any[] = [];
  colors_selected: any[] = [];
  brands_selected: any[] = [];

  min_price: number = 0;
  max_price: number = 0;

  options_aditional: any[] = [];

  search: string = '';
  selectedCategoryFromUrl: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 0;
  paginatedProducts: any[] = [];
  sortOrder: string = 'default'; // Orden seleccionado
  PRODUCTS_ORIGINAL: any = []; // Guardar copia original

  constructor(
  public homeService: HomeService,
  public cookieService: CookieService,
  public cartService: CartService,
  public router: Router,
  public toastr: ToastrService,
  public cdr: ChangeDetectorRef,
  public activatedRoute: ActivatedRoute,
) {
  // Primero cargamos la configuración de filtros
  this.homeService.getConfigFilter().subscribe((resp: any) => {
    this.Categories = resp.categories;
    this.Colors = resp.colors;
    this.Brands = resp.brands;
    this.Products_relateds = resp.product_relateds.data;

    console.log('✓ Categorías cargadas:', this.Categories);

    // Después de cargar las categorías, procesamos los query params
    this.processQueryParams();
    this.PRODUCTS_ORIGINAL = [...resp.products]; // Guardar copia
  });

  // Nos suscribimos a cambios en los query params
  this.activatedRoute.queryParams.subscribe(() => {
    if (this.Categories.length > 0) {
      this.processQueryParams();
    }
  });
}

processQueryParams() {
  const params = this.activatedRoute.snapshot.queryParams;

  // console.log('---------------------------');
  // console.log('PARAMETROS DE BUSQUEDA');
  // console.log('Params completos:', params);
  // console.log('Category:', params['category']);
  // console.log('Search:', params['search']);
  // console.log('Categories disponibles:', this.Categories);
  // console.log('---------------------------');

  this.search = params['search'] || '';
  const categoryFromUrl = params['category'] || '';

  // Limpiar selección previa
  this.categories_selected = [];

  if (categoryFromUrl) {
    const categoryId = Number(categoryFromUrl);

    // Si es un número válido, usarlo directamente
    if (!isNaN(categoryId) && categoryId > 0) {
      this.categories_selected.push(categoryId);
      console.log('✓ Categoría agregada por ID:', categoryId);
    } else {
      // Si es un string (nombre), buscar el ID correspondiente
      const category = this.Categories.find(
        (cat: any) => cat.name && cat.name.toLowerCase() === categoryFromUrl.toLowerCase()
      );

      if (category) {
        this.categories_selected.push(category.id);
        console.log('✓ Categoría encontrada por nombre:', category.name, '→ ID:', category.id);
      } else {
        console.error('✗ No se encontró categoría con nombre:', categoryFromUrl);
        console.log('Categorías disponibles:', this.Categories.map((c: any) => c.name));
      }
    }
  }

  console.log('categories_selected final:', this.categories_selected);

  // Filtrar productos
  this.filterAdvanceProduct();
}

  ngOnInit(): void {
    this.currency = this.cookieService.get("currency") || 'ARS';

    if (typeof $ !== 'undefined') {
      $("#slider-range").slider({
        range: true,
        min: 0,
        max: 40000,
        values: [10, 10000],
        slide: (event: any, ui: any) => {
          $("#amount").val(this.currency + " " + ui.values[0] + " - " + this.currency + " " + ui.values[1]);
          this.min_price = ui.values[0];
          this.max_price = ui.values[1];
        },
        stop: () => {
          this.filterAdvanceProduct();
        }
      });
      $("#amount").val(this.currency + " " + $("#slider-range").slider("values", 0) +
        " - " + this.currency + " " + $("#slider-range").slider("values", 1));
    }
  }

  // Función de búsqueda flexible sin librerías
  flexibleSearch(products: any[], searchTerm: string): any[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return products;
    }

    const normalizedSearch = this.normalizeText(searchTerm.toLowerCase());
    const searchWords = normalizedSearch.split(' ').filter(word => word.length > 0);

    return products.filter(product => {
      // Crear un texto combinado de todos los campos buscables
      const searchableText = this.normalizeText([
        product.title || '',
        product.resumen || '',
        product.brand?.name || '',
        product.tags || '',
        product.sku || ''
      ].join(' ').toLowerCase());

      // Calcular score de coincidencia
      const score = this.calculateMatchScore(searchableText, searchWords);

      // Retornar si tiene al menos alguna coincidencia
      return score > 0;
    }).sort((a, b) => {
      // Ordenar por relevancia
      const searchableA = this.normalizeText([
        a.title || '',
        a.resumen || '',
        a.brand?.name || '',
        a.tags || ''
      ].join(' ').toLowerCase());

      const searchableB = this.normalizeText([
        b.title || '',
        b.resumen || '',
        b.brand?.name || '',
        b.tags || ''
      ].join(' ').toLowerCase());

      const scoreA = this.calculateMatchScore(searchableA, searchWords);
      const scoreB = this.calculateMatchScore(searchableB, searchWords);

      return scoreB - scoreA; // Mayor score primero
    });
  }

  // Normalizar texto (quitar acentos, caracteres especiales)
  normalizeText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9\s]/gi, ' ') // Quitar caracteres especiales
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
  }

  // Calcular score de coincidencia
  calculateMatchScore(text: string, searchWords: string[]): number {
    let score = 0;

    searchWords.forEach(word => {
      if (word.length < 2) return;

      // Coincidencia exacta de palabra completa
      const exactMatch = new RegExp(`\\b${word}\\b`, 'i').test(text);
      if (exactMatch) {
        score += 10;
      }

      // Coincidencia parcial
      if (text.includes(word)) {
        score += 5;
      }

      // Coincidencia con errores de tipeo (similar)
      if (this.isSimilar(text, word)) {
        score += 3;
      }
    });

    return score;
  }

  // Verificar similitud (permite algunos errores de tipeo)
  isSimilar(text: string, word: string): boolean {
    if (word.length < 3) return false;

    // Buscar si existe una subcadena similar
    const words = text.split(' ');

    for (let textWord of words) {
      if (textWord.length < 3) continue;

      // Calcular distancia de Levenshtein simplificada
      const distance = this.levenshteinDistance(textWord, word);
      const maxDistance = Math.floor(word.length / 3); // Permitir 1 error cada 3 caracteres

      if (distance <= maxDistance) {
        return true;
      }
    }

    return false;
  }

  // Distancia de Levenshtein (mide diferencia entre dos strings)
  levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    if (len1 === 0) return len2;
    if (len2 === 0) return len1;

    // Inicializar matriz
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Llenar matriz
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // Eliminación
          matrix[i][j - 1] + 1,      // Inserción
          matrix[i - 1][j - 1] + cost // Sustitución
        );
      }
    }

    return matrix[len1][len2];
  }

  reset() {
    this.categories_selected = [];
    this.colors_selected = [];
    this.brands_selected = [];
    this.options_aditional = [];
    this.search = '';
    this.min_price = 0;
    this.max_price = 0;

    this.router.navigate(['/productos-busqueda']);
  }

  addOptionAditional(option: string) {
    let INDEX = this.options_aditional.findIndex((item: any) => item == option);
    if (INDEX != -1) {
      this.options_aditional.splice(INDEX, 1);
    } else {
      this.options_aditional.push(option);
    }
    this.filterAdvanceProduct();
  }

  addCategorie(categorie: any) {
    let INDEX = this.categories_selected.findIndex((item: any) => item == categorie.id);
    if (INDEX != -1) {
      this.categories_selected.splice(INDEX, 1);
    } else {
      this.categories_selected.push(categorie.id);
    }
    this.filterAdvanceProduct();
  }

  addBrand(categorie: any) {
    let INDEX = this.brands_selected.findIndex((item: any) => item == categorie.id);
    if (INDEX != -1) {
      this.brands_selected.splice(INDEX, 1);
    } else {
      this.brands_selected.push(categorie.id);
    }
    this.filterAdvanceProduct();
  }

  addColor(color: any) {
    let INDEX = this.colors_selected.findIndex((item: any) => item == color.id);
    if (INDEX != -1) {
      this.colors_selected.splice(INDEX, 1);
    } else {
      this.colors_selected.push(color.id);
    }
    this.filterAdvanceProduct();
  }

filterAdvanceProduct() {
  let data = {
    categories_selected: this.categories_selected,
    colors_selected: this.colors_selected,
    brands_selected: this.brands_selected,
    min_price: this.min_price,
    max_price: this.max_price,
    currency: this.currency,
    options_aditional: this.options_aditional,
    search: this.search,
  };

  // console.log('=== ENVIANDO AL BACKEND ===');
  // console.log('Data completa:', data);
  // console.log('categories_selected:', this.categories_selected);
  // console.log('===========================');

  this.homeService.filterAdvanceProduct(data).subscribe((resp: any) => {
    // console.log('=== RESPUESTA DEL BACKEND ===');
    // console.log('Productos recibidos:', resp.products.data.length);
    // console.log('===========================');

    this.ALL_PRODUCTS = resp.products.data;

    // Aplicar búsqueda flexible si hay término de búsqueda
    if (this.search && this.search.trim() !== '') {
      this.PRODUCTS = this.flexibleSearch(this.ALL_PRODUCTS, this.search);
    } else {
      this.PRODUCTS = this.ALL_PRODUCTS;
    }

    // Actualizar paginación después de recibir productos
    this.currentPage = 1;
    this.updatePagination();
  });
}

  getTotalCurrency(PRODUCTS: any): number {
    if (!PRODUCTS) {
      return 0;
    }

    let price: number;

    if (this.currency == 'ARS') {
      if (!PRODUCTS.price_ars) {
        return 0;
      }
      price = PRODUCTS.price_ars;
    } else {
      if (!PRODUCTS.price_usd) {
        return 0;
      }
      price = PRODUCTS.price_usd;
    }

    return parseFloat(price.toFixed(2));
  }

  addCart(PRODUCT: any): void {
    if (!this.cartService.authService.user) {
      this.toastr.error('Error', 'Ingrese a la tienda');
      this.router.navigateByUrl("/login");
      return;
    }

    if (PRODUCT.variations && PRODUCT.variations.length > 0) {
      $("#producQuickViewModal").modal("show");
      this.openDetailProduct(PRODUCT);
      return;
    }

    let discount_g = null;

    if (PRODUCT.discount_g) {
      discount_g = PRODUCT.discount_g;
    }

    let data = {
      product_id: PRODUCT.id,
      type_discount: discount_g ? discount_g.type_discount : null,
      discount: discount_g ? discount_g.discount : null,
      type_campaing: discount_g ? discount_g.type_campaing : null,
      code_cupon: null,
      code_discount: discount_g ? discount_g.code : null,
      product_variation_id: null,
      quantity: 1,
      price_unit: this.currency == 'ARS' ? PRODUCT.price_ars : PRODUCT.price_usd,
      subtotal: this.getTotalPriceProduct(PRODUCT),
      total: this.getTotalPriceProduct(PRODUCT) * 1,
      currency: this.currency,
    };

    this.cartService.registerCart(data).subscribe(
      (resp: any) => {
        if (resp.message == 403) {
          this.toastr.error('Error', resp.message_text);
        } else {
          this.cartService.changeCart(resp.cart);
          this.toastr.success('Exito', 'El producto se agrego al carrito de compra');
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }

  openDetailProduct(PRODUCT: any, DISCOUNT_FLASH: any = null): void {
    this.product_selected = null;
    this.variation_selected = null;

    setTimeout(() => {
      this.product_selected = PRODUCT;

      setTimeout(() => {
        if (DISCOUNT_FLASH) {
          this.product_selected.discount_g = DISCOUNT_FLASH;
        }
        this.cdr.detectChanges();
      }, 25);
    }, 100);
  }

  getNewTotal(PRODUCTS: any, DISCOUNT_FLASH_P: any): number {
    if (!PRODUCTS || !DISCOUNT_FLASH_P) {
      return 0;
    }

    let result: number;

    if (this.currency == 'ARS') {
      if (!PRODUCTS.price_ars) {
        return 0;
      }

      if (DISCOUNT_FLASH_P.type_discount == 1) {
        result = PRODUCTS.price_ars - (PRODUCTS.price_ars * (DISCOUNT_FLASH_P.discount * 0.01));
      } else {
        result = PRODUCTS.price_ars - DISCOUNT_FLASH_P.discount;
      }
    } else {
      if (!PRODUCTS.price_usd) {
        return 0;
      }

      if (DISCOUNT_FLASH_P.type_discount == 1) {
        result = PRODUCTS.price_usd - (PRODUCTS.price_usd * (DISCOUNT_FLASH_P.discount * 0.01));
      } else {
        result = PRODUCTS.price_usd - DISCOUNT_FLASH_P.discount;
      }
    }

    return parseFloat(result.toFixed(2));
  }

  getTotalPriceProduct(PRODUCTS: any): number {
    if (!PRODUCTS) {
      return 0;
    }

    let result: number;

    if (PRODUCTS.discount_g) {
      result = this.getNewTotal(PRODUCTS, PRODUCTS.discount_g);
    } else if (this.DISCOUNT_FLASH && this.PRODUCTS &&
      this.PRODUCTS.includes &&
      this.PRODUCTS.includes(PRODUCTS)) {
      result = this.getNewTotal(PRODUCTS, this.DISCOUNT_FLASH);
    } else {
      if (this.currency == "ARS") {
        if (!PRODUCTS.price_ars) {
          return 0;
        }
        result = parseFloat(PRODUCTS.price_ars.toFixed(2));
      } else {
        if (!PRODUCTS.price_usd) {
          return 0;
        }
        result = parseFloat(PRODUCTS.price_usd.toFixed(2));
      }
    }

    return result;
  }

  addCompareProduct(PRODUCT: any) {
    let COMPARES = localStorage.getItem('compares') ? JSON.parse(localStorage.getItem('compares') || '') : [];

    let INDEX = COMPARES.findIndex((item: any) => item.id == PRODUCT.id);

    if (INDEX != -1) {
      this.toastr.error('Validacion', 'El producto ya fue agregado a la comparacion');
      return;
    }

    COMPARES.push(PRODUCT);
    this.toastr.success('Exito', 'Producto agregado a la comparacion');

    localStorage.setItem('compares', JSON.stringify(COMPARES));

    if (COMPARES.length > 1) {
      this.router.navigateByUrl('/compare-product');
    }
  }

  // Método para ordenar productos
    sortProducts(value: string) {
      console.log('MÉTODO LLAMADO - valor recibido:', value);

      this.sortOrder = value;

      console.log('=== INICIANDO ORDENAMIENTO ===');
      console.log('Orden seleccionado:', value);
      console.log('Productos antes:', this.PRODUCTS.length);
      console.log('Productos originales disponibles:', this.PRODUCTS_ORIGINAL.length);

      switch(value) {
        case 'price_low_high':
          console.log('Caso: Menor a mayor precio');
          this.PRODUCTS = this.PRODUCTS.slice().sort((a: any, b: any) => {
            const priceA = this.getTotalPriceProduct(a);
            const priceB = this.getTotalPriceProduct(b);
            return priceA - priceB;
          });
          break;

        case 'price_high_low':
          console.log('Caso: Mayor a menor precio');
          this.PRODUCTS = this.PRODUCTS.slice().sort((a: any, b: any) => {
            const priceA = this.getTotalPriceProduct(a);
            const priceB = this.getTotalPriceProduct(b);
            return priceB - priceA;
          });
          break;

        case 'newest':
          console.log('Caso: Más nuevos primero');
          this.PRODUCTS = this.PRODUCTS.slice().sort((a: any, b: any) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA;
          });
          break;

        case 'default':
        default:
          console.log('Caso: Orden original');
          this.PRODUCTS = [...this.PRODUCTS_ORIGINAL];
          break;
      }

      console.log('Productos después del sort:', this.PRODUCTS.length);
      console.log('Primer producto:', this.PRODUCTS[0]?.title, this.getTotalPriceProduct(this.PRODUCTS[0]));
      console.log('Último producto:', this.PRODUCTS[this.PRODUCTS.length-1]?.title, this.getTotalPriceProduct(this.PRODUCTS[this.PRODUCTS.length-1]));

      // Resetear a página 1
      this.currentPage = 1;

      // Actualizar paginación
      this.updatePagination();

      console.log('Productos paginados:', this.paginatedProducts.length);
      console.log('=== FIN ORDENAMIENTO ===');
    }

    // Actualizar paginación
  updatePagination() {
    if (!this.PRODUCTS || this.PRODUCTS.length === 0) {
      console.log('No hay productos para paginar');
      this.totalPages = 0;
      this.paginatedProducts = [];
      return;
    }

    this.totalPages = Math.ceil(this.PRODUCTS.length / this.itemsPerPage);

    // Asegurar que currentPage esté dentro del rango válido
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.PRODUCTS.slice(startIndex, endIndex);

    console.log('Paginación actualizada:', {
      totalProducts: this.PRODUCTS.length,
      totalPages: this.totalPages,
      currentPage: this.currentPage,
      paginatedProductsCount: this.paginatedProducts.length,
      startIndex,
      endIndex
    });

    // Scroll al inicio de los productos solo si no es la primera carga
    if (this.currentPage > 1 || this.sortOrder !== 'default') {
      this.scrollToProducts();
    }
  }

  // Cambiar página
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.updatePagination();
  }

  // Ir a página anterior
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  // Ir a página siguiente
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  // Obtener números de páginas a mostrar
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas con elipsis
      if (this.currentPage <= 3) {
        // Al inicio
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // -1 representa "..."
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        // Al final
        pages.push(1);
        pages.push(-1);
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // En el medio
        pages.push(1);
        pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  // Scroll suave al inicio de productos
  scrollToProducts() {
    setTimeout(() => {
      const element = document.querySelector('.tp-shop-top');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Cambiar items por página
  changeItemsPerPage(items: number) {
    this.itemsPerPage = items;
    this.currentPage = 1;
    this.updatePagination();
  }
}
