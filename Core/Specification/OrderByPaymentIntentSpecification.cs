using System.Linq.Expressions;
using Core.Entities.OrderAggregate;

namespace Core.Specification
{
    public class OrderByPaymentIntentSpecification : BaseSpecification<Order>
    {
        public OrderByPaymentIntentSpecification(string paymentIntentId)
            : base(o => o.PaymentIntentId == paymentIntentId)
        {

        }
    }
}