/**
 * Configuration for Lam's Seafood website
 */
export const lamsSeafoodConfig = {
  siteName: "Lam's Seafood",
  baseUrl: "seattle.lamsseafood.com",
  selectors: {
    productContainer: ".le-col.sc-tSoMJ",
    productName: ".sc-jaZhys",
    productPrice: ".sc-gMFoeA",
    productUnit: ".sc-geEwSt.kaMOkQ",
    productImage: ".sc-jGONNV",
    productLink: "a.sc-iugpza",
  },
  patterns: {
    price: /\$?([0-9]+\.[0-9]+)/,
  },
}
