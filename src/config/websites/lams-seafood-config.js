/**
 * Configuration for Lam's Seafood website
 */
export const lamsSeafoodConfig = {
  siteName: "Lam's Seafood",
  baseUrl: "seattle.lamsseafood.com",
  selectors: {
    productContainer: ".sc-kTYlsj, .lgGUGt",
    productName: ".sc-jGONNV, .ea-dyye",
    productPrice: ".sc-iugpza, .kldjci",
    productUnit: ".sc-gMFoeA, .lpuqvE",
    productImage: ".sc-lopPiv, .itlMCX",
    productLink: "a.sc-dEMAZk, a.bdwhla",
  },
  patterns: {
    price: /\$?([0-9]+\.[0-9]+)/,
  },
}
