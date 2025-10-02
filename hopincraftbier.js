console.log("HopInCraftbier custom js v4.58");
/* Get the header element and it's position */
document.txtNl1 = '<div id="discountContainer"><div class="dtooltip"><p class="hover question">Kortingscoupon</p><p class="dtooltiptext">Afhankelijk van de gekozen betaling en levering, kunt u een kortingscoupon krijgen die te gebruiken is bij een volgende bestelling. Voor dit bier ziet u de bedragen in deze tabel</p></div><table class="discount-table"><thead><tr class="first_header"><th></th><th colspan="2">Manier van levering</th></tr><tr><th>Manier van betaling</th><th>Afhaling</th><th>Levering</th></tr></thead><tbody><tr><td class="header">Betalen bij afhaling</td><td>€ ';
document.txtNl2 = '</td><td> - </td></tr><tr><td class="header">Overschrijving</td><td>€ ';
document.txtNl3 = '</td><td>€ ';
document.txtNl4 = '</td></tr><tr><td class="header">Online betaling</td><td>€ ';
document.txtNl5 = '</td><td>€ 0</td></tr></tbody></table></div></div>';

document.txtEn1 = '<div id="discountContainer"><div class="dtooltip"><p class="hover question">Discount coupon</p><p class="dtooltiptext">Depending on the chosen payment and delivery, you can get a discount coupon that can be used for a next order. For this beer you can see the amounts in this table</p></div><table class="discount-table"><thead><tr class="first_header"><th></th><th colspan="2">Method of delivery</th></tr><tr><th>Method of payment</th><th>Pickup</th><th>Delivery</th></tr></thead><tbody><tr><td class="header">Payment upon pickup</td><td>€ ';
document.txtEn2 = '</td><td> - </td></tr><tr><td class="header">Money transfer</td><td>€ ';
document.txtEn3 = '</td><td>€ ';
document.txtEn4 = '</td></tr><tr><td class="header">Online payment</td><td>€ ';
document.txtEn5 = '</td><td>€ 0</td></tr></tbody></table></div></div>';

try {
    window.ec = window.ec || Object();
    window.ec.storefront = window.ec.storefront || Object();

// Add design config
    window.ec.storefront.shopping_cart_show_weight = false;

    // to try
    // window.ec.storefront.product_filters_orientation = 'HORIZONTAL';
    // product_details_additional_images_has_shadow = true;

// Apply design configs
    Ecwid.refreshConfig && Ecwid.refreshConfig();
} catch (error) {
    console.log(error);
}

const headerDiv = document.querySelector("#tile-header-fcHJMd");

if (headerDiv) {
  redirectWhenNeeded();

  let announcementsHeight = 0;

  const pos = "-" + (announcementsHeight + document.querySelector(".ins-tile--header .ins-header__row:nth-child(1)").offsetHeight) + "px";
  let prevScrollPos = window.scrollY;
  let headerBottom = headerDiv.offsetTop + headerDiv.offsetHeight + announcementsHeight;

  window.onscroll = function () {
    let currentScrollPos = window.scrollY;
    if (Math.abs(prevScrollPos - currentScrollPos) <= 5) return;

    /* if we're scrolling up, or we haven't passed the header,
       show the header at the top */
    if (prevScrollPos > currentScrollPos || currentScrollPos < headerBottom) {
      headerDiv.style.top = "0";
    } else {
      /* otherwise we're scrolling down & have passed the header so hide it */
      headerDiv.style.top = pos;
    }

    prevScrollPos = currentScrollPos;
  }
}
  const priceO = new MutationObserver(function(ms) {
    ms.forEach(function (m) {
      addCouponInfo(false);
      soonLabel();
      processAttributes();
      processStock();
    })
  });
  var cartTotalMo = new MutationObserver(function(ms) {
    redirectWhenNeeded();
    ms.forEach(function (m) {
    for (var i = 0; i < m.addedNodes.length; i++) {
      if (m.addedNodes[i].nodeType === Node.ELEMENT_NODE) {
        if (typeof m.addedNodes[i].className == "string") {
          const className = m.addedNodes[i].className;
          // console.log('-> ' + className);
          if (className.indexOf('ec-store ec-store__product-page') >= 0) {
            addCouponInfo(true);
            soonLabel();
            processAttributes();
            processExpectedLabels();
            processStock();
            moveSubtitle();
            priceO.observe(document.querySelector('div.product-details__product-price.ec-price-item'), {
              childList: true,
              subtree: true
            });
          } else if (className.indexOf('grid__wrap-inner') >= 0) {
            moveSubtitle();
          } else if (className.indexOf('ec-store ec-store__category-page') >= 0 ||
            (className.indexOf('grid-product') >= 0 && className.indexOf('grid-product__subtitle') < 0)) {
            processExpectedLabels();
            moveSubtitle();
          } else if (className.indexOf('ec-store ec-store__search-page') >= 0) {
            processExpectedLabels();
          } else if (className.indexOf('ec-related-products') >= 0) {
            processExpectedLabels();
          }
          if (className.indexOf('ecwid-checkout-notice') >= 0) {
            if ('EN' === document.querySelector('a.ins-header__language-link--active').textContent.trim()) {
              document.querySelector('span.adb_nl').style.display = 'none';
            } else {
              document.querySelector('span.adb_en').style.display = 'none';
            }
          }
          if (className.indexOf('ec-store__cart-page') >= 0) {
            const cartTotal = document.querySelector("span.ec-cart-summary__total");
            if (cartTotal) {
              const totalBody = cartTotal.parentElement.parentElement.parentElement;
              let parts = cartTotal.textContent?.split(' ');
              if (parts.length >= 2) {
                let total = Number(parts[1].replace(',', '.'));
                if (total < 50) {
                  let pickupOnly = 'Enkel ophalen (totaal lager dan € 50).'
                  if ('EN' === document.querySelector('a.ins-header__language-link--active').textContent.trim()) {
                    pickupOnly = 'Pickup only (total lower than € 50).';
                  }
                  totalBody.insertAdjacentHTML('beforebegin', '<p style="color:red;"><strong>' + pickupOnly + '</strong></p>');
                }
              }
            }
          }
        }
      }
    }
  });
});
cartTotalMo.observe(document, {
  childList: true,
  subtree: true
});

function processStock() {
  console.log('processStock');
  const x = document.querySelector('.details-product-purchase__place span');
  if (x) {
    const y = x.textContent?.split(':');
    if (y && y.length > 1) {
      const z = Number(y[1].trim().split(' ')[0]);
      if (z > 5) {
        x.textContent = y[0];
      } else if (z < 3) {
        document.querySelector('.details-product-purchase__place').style.color = 'red';
      }
    }
  }
  if (document.querySelector('span.details-product-purchase__in-stock-qty')) {
    document.querySelector('span.details-product-purchase__in-stock-qty').style.display = 'none';
  }
}

function processAttributes() {
  console.log('processAttributes');
  var preOrderTxt = "";
  document.querySelectorAll('span.details-product-attribute__title').forEach(function (p) {
    if (p.textContent.startsWith('hide_')) {
      if (p.textContent.trim() === 'hide_preorder:') {
        var d = p.parentElement.childNodes[1].textContent;
        if (d !== 'Uitverkocht' && d !== 'Sold out') {
          preOrderTxt = '<strong style="color:red;">PRE-ORDER</strong> ';
          if ('EN' === document.querySelector('a.ins-header__language-link--active').textContent.trim()) {
            preOrderTxt += ('Expected: ' + d);
          } else {
            preOrderTxt += ('Verwacht: ' + d);
          }
        }
      }
      p.parentElement.style.display = 'none';
    }
  });
  if (preOrderTxt !== "" && document.querySelector('div.form-control--primary button.form-control__button span.form-control__button-text')) {
    document.querySelector('div.form-control--primary button.form-control__button span.form-control__button-text').textContent = 'Pre-Order';
  }
  var preOrderTxtEl = document.querySelector('div.product-details__product-options.details-product-options');
  if (preOrderTxtEl && preOrderTxtEl.innerHTML !== preOrderTxt) {
    preOrderTxtEl.innerHTML = preOrderTxt;
  }
}
function soonLabel() {
  console.log('soonLabel');
  var notSoldOut = false;
  var preorderSoldOut = false;
  var verwachtTxt = '';
  document.querySelectorAll('div.product-details__product-attributes div.details-product-attribute span.details-product-attribute__title').forEach(
    function(item) {
      if (item.textContent.trim() === 'hide_preorder:') {
        var d = item.parentElement.childNodes[1].textContent;
        if (d === 'Uitverkocht' || d === 'Sold out') {
          preorderSoldOut = true;
        }
      } else
      if (item.textContent.trim() === 'Verwacht:' || item.textContent.trim() === 'Expected:') {
        notSoldOut = true;
        verwachtTxt = item.textContent.trim() + ' ' + item.parentElement.childNodes[1].textContent.trim();
      }
    });
  if (!preorderSoldOut && (notSoldOut || (document.querySelector('div.product-details__product-price.ec-price-item')?.getAttribute('content') === "0" && document.querySelector('div.product-details__product-soldout')))) {
    var soldOutEl = document.querySelector('div.ec-label.label--flag.label--attention div.label__text');
    if (soldOutEl) {
      if (soldOutEl.textContent === 'Uitverkocht') {
        soldOutEl.textContent = 'Verwacht';
      } else {
        soldOutEl.textContent = 'Expected';
      }
    }
    var soldOutEl2 = document.querySelector('div.product-details-module__title.details-product-purchase__sold-out');
    if (soldOutEl2) {
      soldOutEl2.textContent = verwachtTxt;
    }
    var soldOutTxt = document.querySelector('div.details-product-purchase__place');
    if (soldOutTxt) soldOutTxt.style.display = 'none'
  }
}

function processExpectedLabels() {
  console.log('processExpectedLabels');
  document.querySelectorAll('div.grid-product__wrap-inner').forEach(function (p) {
    var lint = p.querySelector('div.label__text')?.textContent;
    if (lint === 'Sold out' || lint === 'Uitverkocht') return;
    var buyNowEl = p.querySelector('div.grid-product__button.grid-product__buy-now');
    if (buyNowEl?.textContent === 'Sold out' || buyNowEl?.textContent === 'Uitverkocht') {
      buyNowEl.style.display = 'none';
      if (document.querySelector('h1.page-title__name.ec-header-h1')?.textContent.trim() !== 'Pre-order') {
        p.querySelector('div.grid-product__price').style.display = 'none';
      }
    }
  });
}

function addCouponInfo(initial) {
  console.log('addCouponInfo');
  const attrValSelector = '.ec-store.ec-store__product-page .details-product-attribute:nth-child($) .details-product-attribute__value';
  if (!initial) {
    var dc = document.querySelector('#discountContainer');
    if (dc) dc.remove();
  }
  var c1E = document.querySelector(attrValSelector.replace('$', '1'));
  if (!c1E) return;

  var custDisc = 0;
  var discElement = document.querySelector('span.details-product-price-discount__value');
  if (discElement) {
    custDisc = Number(discElement.textContent.replace("%", ""));
  }
  var c1 = c1E.textContent;
  if (c1 === "0" || isNaN(c1.replace(",", "."))) return;
  var c2 = document.querySelector(attrValSelector.replace('$', '2')).textContent;
  var c3 = document.querySelector(attrValSelector.replace('$', '3')).textContent;

  c1 = calcDiscount(Number(c1.replace(",", ".")), custDisc).toString();
  c2 = calcDiscount(Number(c2.replace(",", ".")), custDisc).toString();
  c3 = calcDiscount(Number(c3.replace(",", ".")), custDisc).toString();
  var txt = document.txtNl1 + c1 + document.txtNl2 + c1 + document.txtNl3 + c3 + document.txtNl4 + c2 + document.txtNl5;
  if ('EN' === document.querySelector('a.ins-header__language-link--active').textContent.trim()) {
    txt = document.txtEn1 + c1 + document.txtEn2 + c1 + document.txtEn3 + c3 + document.txtEn4 + c2 + document.txtEn5;
  }
  document.querySelector('div.product-details-module.product-details__product-price-row').insertAdjacentHTML('beforeend', txt);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function moveSubtitle() {
  redirectWhenNeeded();
  console.log('moveSubtitle');
  document.querySelectorAll('div.grid-product__wrap-inner div.grid-product__subtitle').forEach(function (p) {
    var imgWrapElement = p.parentElement.querySelector('div.grid-product__image-wrap');
    if (imgWrapElement) {
      imgWrapElement.parentElement.insertBefore(p, imgWrapElement.lastChild.nextSibling);
    }
  });
}

function calcDiscount(num, custDisc) {
  return Math.round(((num * (100-custDisc) / 100) + Number.EPSILON) * 100) / 100;
}

function redirectWhenNeeded() {
  console.log('redirectWhenNeeded');
  if (window.location.href.endsWith('/products')) {
    let newLoc = window.location.href + '/alle-bieren';
    window.location.replace(newLoc);
  }
}
