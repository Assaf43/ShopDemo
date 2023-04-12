using System.Security.Claims;

namespace API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static string RetiveEmailFromPrincipal(this ClaimsPrincipal user)
        {
            //var email = user?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Email);
            return user.FindFirstValue(ClaimTypes.Email);
        }
    }
}