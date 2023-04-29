import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BasketService } from 'src/app/basket/basket.service';
import { CheckoutService } from '../checkout.service';
import { ToastrService } from 'ngx-toastr';
import { Basket } from 'src/app/shared/models/basket';
import { Address } from 'src/app/shared/models/user';
import { NavigationExtras, Router } from '@angular/router';
import {
  Stripe,
  StripeCardCvcElement,
  StripeCardExpiryElement,
  StripeCardNumberElement,
  loadStripe,
} from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';
import { OrderToCreate } from 'src/app/shared/models/order';

@Component({
  selector: 'app-checkout-payment',
  templateUrl: './checkout-payment.component.html',
  styleUrls: ['./checkout-payment.component.scss'],
})
export class CheckoutPaymentComponent implements OnInit {
  @Input() checkoutForm?: FormGroup;
  @ViewChild('cardNumber') cardNumberElement?: ElementRef;
  @ViewChild('cardExpiry') cardExpiryElement?: ElementRef;
  @ViewChild('cardCvc') cardCvcElement?: ElementRef;
  stripe: Stripe | null = null;
  cardNumber?: StripeCardNumberElement;
  cardExpiry?: StripeCardExpiryElement;
  cardCvc?: StripeCardCvcElement;
  cardNumberComplite = false;
  cardExpiryComplite = false;
  cardCvcComplite = false;
  cardError: any;
  cardExpiryError: any;
  loading = false;

  constructor(
    private basketService: BasketService,
    private checkoutService: CheckoutService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    loadStripe(
      'pk_test_51MyuxuLr24MLY7DAeK2yHDiwrSMuHPYDFdNefkftjYVOfkUubSeiMnCNG1U4dKI7ZSXh0gXWnPUgsfD9KO6seGvX00gdactcHY'
    ).then((stripe) => {
      this.stripe = stripe;
      const element = stripe?.elements();
      if (element) {
        this.cardNumber = element.create('cardNumber');
        this.cardNumber.mount(this.cardNumberElement?.nativeElement);
        this.cardNumber.on('change', (event) => {
          this.cardNumberComplite = event.complete;
          if (event.error) this.cardError = event.error.message;
          else this.cardError = null;
        });

        this.cardExpiry = element.create('cardExpiry');
        this.cardExpiry.mount(this.cardExpiryElement?.nativeElement);
        this.cardExpiry.on('change', (event) => {
          this.cardExpiryComplite = event.complete;
          if (event.error) this.cardExpiryError = event.error.message;
          else this.cardExpiryError = null;
        });

        this.cardCvc = element.create('cardCvc');
        this.cardCvc.mount(this.cardCvcElement?.nativeElement);
        this.cardCvc.on('change', (event) => {
          this.cardCvcComplite = event.complete;
          if (event.error) this.cardError = event.error.message;
          else this.cardError = null;
        });
      }
    });
  }

  get paymentFormComplete() {
    return (
      this.checkoutForm?.get('paymentForm')?.valid &&
      this.cardNumberComplite &&
      this.cardExpiryComplite &&
      this.cardCvcComplite
    );
  }

  async submitOrder() {
    this.loading = true;
    const basket = this.basketService.getCurrentBasketValue();
    if (!basket) throw new Error('cannot get basket');
    try {
      const createdOrder = await this.CreateOrder(basket);
      const paymentResult = await this.confirmPaymentWithStripe(basket);
      if (paymentResult.paymentIntent) {
        this.basketService.deleteBasket(basket);
        const NavigationExtras: NavigationExtras = { state: createdOrder };
        this.router.navigate(['checkout/success'], NavigationExtras);
      } else {
        this.toastr.error(paymentResult.error.message);
      }
    } catch (error: any) {
      console.log(error);
      this.toastr.error(error.message);
    } finally {
      this.loading = false;
    }
  }

  private async confirmPaymentWithStripe(basket: Basket | null) {
    if (!basket) throw new Error('Basket is null');
    const result = this.stripe?.confirmCardPayment(basket.clinetSecret!, {
      payment_method: {
        card: this.cardNumber!,
        billing_details: {
          name: this.checkoutForm?.get('paymentForm')?.get('nameOnCard')?.value,
        },
      },
    });

    if (!result) throw new Error('Problem attempting payment with stripe');

    return result;
  }

  private async CreateOrder(basket: Basket | null) {
    if (!basket) throw new Error('Basket is null');
    const orderToCreate = this.getOrderToCreate(basket);

    return firstValueFrom(this.checkoutService.createOrder(orderToCreate));
  }

  private getOrderToCreate(basket: Basket): OrderToCreate {
    const deliveryMethodId = this.checkoutForm
      ?.get('deliveryForm')
      ?.get('deliveryMethod')?.value;
    const shipToAddress = this.checkoutForm?.get('addressForm')
      ?.value as Address;

    if (!deliveryMethodId || !shipToAddress)
      throw new Error('Problem in basket');

    return {
      basketId: basket.id,
      deliveryMethodId: deliveryMethodId,
      shipToAddress: shipToAddress,
    };
  }
}
