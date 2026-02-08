import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../home/service/cart.service';
import { HomeService } from '../../home/service/home.service';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


declare var $:any;
@Component({
  selector: 'app-campaing-link',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ModalProductComponent],
  templateUrl: './campaing-link.component.html',
  styleUrl: './campaing-link.component.css'
})
export class CampaingLinkComponent {
Categories:any = [];
  Colors:any = [];
  Brands:any = [];
  Products_relateds: any = [];



  PRODUCTS: any = [];
  PRODUCTS_ORIGINAL: any = []; // Guardar copia original
  currency: string = 'ARS';

  product_selected: any = null;
  variation_selected: any = null;
  DISCOUNT_FLASH: any = null;

  categories_selected:any = [];

  colors_selected:any = [];
  brands_selected: any = [];

  min_price: number = 0;
  max_price: number = 0;

  options_aditional:any = [];

  CODE_DISCOUNT:any = null;

  DISCOUNT_LINK:any = null;
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 0;
  paginatedProducts: any[] = [];
  sortOrder: string = 'default'; // Orden seleccionado
  Math = Math; // Para usar Math.min en el template

  constructor(
    public homeService: HomeService,
    public cookieService: CookieService,
    public cartService: CartService,
    public router: Router,
    public toastr: ToastrService,
    public cdr: ChangeDetectorRef,
    public activatedRoute: ActivatedRoute,

  ) {

    this.homeService.getConfigFilter().subscribe((resp:any) => {
      // console.log(resp)
      this.Categories = resp.categories;
      this.Colors = resp.colors;
      this.Brands = resp.brands;
      this.Products_relateds = resp.product_relateds.data;
    })

    this.activatedRoute.params.subscribe((resp:any) => {
      this.CODE_DISCOUNT = resp.code;
    })

    this.homeService.campaingDiscountLink({code_discount: this.CODE_DISCOUNT}).subscribe((resp:any) => {
      console.log('Respuesta del servidor:', resp);
      if(resp.message == 403) {
        this.toastr.info('Validacion', resp.message_text);
        return;
      }
      this.PRODUCTS = resp.products;
      this.PRODUCTS_ORIGINAL = [...resp.products]; // Guardar copia
      this.DISCOUNT_LINK = resp.discount;

      console.log('Productos cargados:', this.PRODUCTS.length);
      console.log('Productos originales guardados:', this.PRODUCTS_ORIGINAL.length);

      // Asegurar que la paginación se actualice después de cargar los productos
      setTimeout(() => {
        this.updatePagination();
        console.log('Paginación inicializada');
      }, 100);
    })
  }

    ngOnInit(): void {
      // Set currency FIRST before loading any data
      this.currency = this.cookieService.get("currency") || 'ARS';

      if(typeof $ !== 'undefined'){
        $("#slider-range").slider({
              range: true,
              min: 0,
              max: 40000,
              values: [10, 10000],
              slide: (event:any, ui:any) => {
                $("#amount").val(this.currency+ " " + ui.values[0] + " - "+this.currency+ " " + ui.values[1]);
                this.min_price = ui.values[0];
                this.max_price = ui.values[1];
              },stop: () => {
                // this.filterAdvanceProduct();
              }
            });
            $("#amount").val(this.currency+ " " + $("#slider-range").slider("values", 0) +
              " - "+this.currency+ " " + $("#slider-range").slider("values", 1));
        }
      };

    ngAfterViewInit(): void {
      // Usar jQuery y nice-select para capturar el cambio
      setTimeout(() => {
        if (typeof $ !== 'undefined') {
          // Esperar a que nice-select se inicialice
          const checkNiceSelect = setInterval(() => {
            const $select = $('#sortSelectElement');
            if ($select.length && $select.next('.nice-select').length) {
              console.log('Nice-select encontrado, agregando listener');

              // Capturar el cambio en el nice-select
              $select.on('change', (event: any) => {
                const value = $(event.target).val();
                console.log('Nice-select cambió, valor:', value);
                this.sortProducts(value as string);
              });

              clearInterval(checkNiceSelect);
            }
          }, 100);

          // Timeout de seguridad de 3 segundos
          setTimeout(() => {
            clearInterval(checkNiceSelect);
          }, 3000);
        } else {
          console.error('jQuery no disponible');
        }
      }, 500);
    }

    reset(){
      window.location.href = "/productos-busqueda";
    }

    addOptionAditional(option:string){
    //chequeamos si la categoria ya fue seleccionada
    let INDEX = this.options_aditional.findIndex((item:any) => item == option);
    //SI YA EXISTE
    if(INDEX != -1){
      //la eliminamos de la lista de seleccionados
      this.options_aditional.splice(INDEX, 1)
    } else {
      //si no fue seleccionada la agregamos
      this.options_aditional.push(option);
    }
    // console.log(this.categories_selected)
    //cada vez que seleccionamos una categoria llamamos al servicio para filtrar los product
    // this.filterAdvanceProduct();

    }

    addCategorie(categorie:any){

      //chequeamos si la categoria ya fue seleccionada
      let INDEX = this.categories_selected.findIndex((item:any) => item == categorie.id);
      //SI YA EXISTE
      if(INDEX != -1){
        //la eliminamos de la lista de seleccionados
        this.categories_selected.splice(INDEX, 1)
      } else {
        //si no fue seleccionada la agregamos
        this.categories_selected.push(categorie.id);
      }
      // console.log(this.categories_selected)
      //cada vez que seleccionamos una categoria llamamos al servicio para filtrar los product
      // this.filterAdvanceProduct();
    }

    addBrand(categorie:any){

      //chequeamos si la categoria ya fue seleccionada
      let INDEX = this.brands_selected.findIndex((item:any) => item == categorie.id);
      //SI YA EXISTE
      if(INDEX != -1){
        //la eliminamos de la lista de seleccionados
        this.brands_selected.splice(INDEX, 1)
      } else {
        //si no fue seleccionada la agregamos
        this.brands_selected.push(categorie.id);
      }
      // console.log(this.categories_selected)
      //cada vez que seleccionamos una categoria llamamos al servicio para filtrar los product
      // this.filterAdvanceProduct();
    }

    addColor(color:any){

      //chequeamos si la categoria ya fue seleccionada
      let INDEX = this.colors_selected.findIndex((item:any) => item == color.id);
      //SI YA EXISTE
      if(INDEX != -1){
        //la eliminamos de la lista de seleccionados
        this.colors_selected.splice(INDEX, 1)
      } else {
        //si no fue seleccionada la agregamos
        this.colors_selected.push(color.id);
      }
      // console.log(this.categories_selected)
      //cada vez que seleccionamos una categoria llamamos al servicio para filtrar los product
      // this.filterAdvanceProduct();
    }

    // filterAdvanceProduct(){

    //   let data = {
    //     categories_selected: this.categories_selected,
    //     colors_selected: this.colors_selected,
    //     brands_selected: this.brands_selected,
    //     min_price: this.min_price,
    //     max_price: this.max_price,
    //     currency: this.currency,
    //     options_aditional: this.options_aditional,
    //   }
    //   this.homeService.filterAdvanceProduct(data).subscribe((resp:any) => {
    //     //console.log(resp);
    //     this.PRODUCTS = resp.products.data;
    //   })
    // }

    getTotalCurrency(PRODUCTS: any): number {
      // Add null checks
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

      // Always return a number with 2 decimal places
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
      // First reset the variation_selected
      this.product_selected = null;
      this.variation_selected = null;

      // Then set the new product
      setTimeout(() => {
        this.product_selected = PRODUCT;

        setTimeout(() => {
          if (DISCOUNT_FLASH) {
            this.product_selected.discount_g = DISCOUNT_FLASH;
          }
          this.cdr.detectChanges(); // Force change detection after updating product
        }, 25);
      }, 100);
    }

    getNewTotal(PRODUCTS: any, DISCOUNT_FLASH_P: any): number {
      // Add null checks
      if (!PRODUCTS || !DISCOUNT_FLASH_P) {
        return 0;
      }

      let result: number;

      if (this.currency == 'ARS') {
        if (!PRODUCTS.price_ars) {
          return 0;
        }

        if (DISCOUNT_FLASH_P.type_discount == 1) { //% de descuento
          result = PRODUCTS.price_ars - (PRODUCTS.price_ars * (DISCOUNT_FLASH_P.discount * 0.01));
        } else { //monto fijo /-pesos -dolares
          result = PRODUCTS.price_ars - DISCOUNT_FLASH_P.discount;
        }
      } else {
        if (!PRODUCTS.price_usd) {
          return 0;
        }

        if (DISCOUNT_FLASH_P.type_discount == 1) { //% de descuento
          result = PRODUCTS.price_usd - (PRODUCTS.price_usd * (DISCOUNT_FLASH_P.discount * 0.01));
        } else { //monto fijo /-pesos -dolares
          result = PRODUCTS.price_usd - DISCOUNT_FLASH_P.discount;
        }
      }

      // Always return a number with 2 decimal places
      return parseFloat(result.toFixed(2));
    }

    getTotalPriceProduct(PRODUCTS: any): number {
      // Add null checks
      if (!PRODUCTS) {
        return 0;
      }

      let result: number;

      // primero chequeamos que hay un descuento en el producto
      if (this.DISCOUNT_LINK) {
        result = this.getNewTotal(PRODUCTS, this.DISCOUNT_LINK);
      }
      // luego chequeamos si tiene el descuento flash
      else if (this.DISCOUNT_LINK && this.PRODUCTS &&
              this.PRODUCTS.includes &&
              this.PRODUCTS.includes(PRODUCTS)) {
        result = this.getNewTotal(PRODUCTS, this.DISCOUNT_LINK);
      }
      // precio comun
      else {
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

    addCompareProduct(PRODUCT:any){
      let COMPARES = localStorage.getItem('compares') ? JSON.parse(localStorage.getItem('compares') || '') : [];

      let INDEX = COMPARES.findIndex((item:any) => item.id == PRODUCT.id);

      if(INDEX != -1) {

        this.toastr.error('Validacion', 'El producto ya fue agregado a la comparacion')

        return;
      }

      COMPARES.push(PRODUCT);
      this.toastr.success('Exito', 'Producto agregado a la comparacion')

      localStorage.setItem('compares', JSON.stringify(COMPARES));

      if(COMPARES.length > 1) {
        this.router.navigateByUrl('/compare-product')
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

        case 'on_sale':
          console.log('Caso: En oferta');
          this.PRODUCTS = this.PRODUCTS.slice().sort((a: any, b: any) => {
            const hasDiscountA = (a.discount_g || this.DISCOUNT_LINK) ? 1 : 0;
            const hasDiscountB = (b.discount_g || this.DISCOUNT_LINK) ? 1 : 0;
            return hasDiscountB - hasDiscountA;
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
