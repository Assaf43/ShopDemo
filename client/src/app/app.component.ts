import { Component, OnInit } from '@angular/core';
import { BasketService } from './basket/basket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'My shop';

  constructor(private basketService: BasketService) {}

  ngOnInit(): void {
    const basketId = localStorage.getItem('basket_id');
    console.log(`basketId: ${basketId}`);
    if (basketId) this.basketService.getBasket(basketId);
  }
}
