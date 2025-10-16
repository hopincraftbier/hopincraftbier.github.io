console.log("HopInCraftbier custom js v5.12");
let debug = false;

Ecwid.OnAPILoaded.add(function() {
    try {
        window.ec = window.ec || Object();
        window.ec.storefront = window.ec.storefront || Object();
        window.ec.storefront.shopping_cart_show_weight = true;

        Ecwid.refreshConfig && Ecwid.refreshConfig();
    } catch (error) {
        log(error);
    }
    log("HopInCraftbier Ecwid JS API is loaded.");
});
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

document.addEventListener("visibilitychange", (event) => {
    if (document.visibilityState === "visible") {
        redirectWhenNeeded();
        processInfoPages();
        processCartPage();
        processProductBrowserPage();
        processProductPage(false);
    }
});

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
const priceO = new MutationObserver(function (ms) {
    ms.forEach(function (m) {
        processProductPage(false);
    })
});
const cartTotalMo = new MutationObserver(function (ms) {
    redirectWhenNeeded();
    processInfoPages();
    // processCartPage();
    processProductBrowserPage();

    ms.forEach(function (m) {
        for (let i = 0; i < m.addedNodes.length; i++) {
            if (m.addedNodes[i].nodeType === Node.ELEMENT_NODE) {
                if (typeof m.addedNodes[i].className == "string") {
                    const className = m.addedNodes[i].className;
                    log('added node classname: ' + className);
                    if (className.indexOf('ec-store ec-store__product-page') >= 0) {
                        processProductPage(true);
                        priceO.observe(document.querySelector('div.product-details__product-price.ec-price-item'), {
                            childList: true,
                            subtree: true
                        });
                    } else if (className.indexOf('details-product-purchase__place') >= 0) {
                        processStock();
                    } else if (className.indexOf('ecwid-checkout-notice') >= 0) {
                        translateCheckoutNotice();
                    } else if (className.indexOf('ec-store__cart-page') >= 0 ||
                                className.indexOf('ec-store__checkout-page') ||
                                className.indexOf('ec-cart-step__section')) {
                        processCartPage();
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
    log('processStock');
    const x = document.querySelector('.details-product-purchase__place span');
    if (x) {
        document.querySelector('.details-product-purchase__place').style.color = 'black';
        console.log(x.textContent);
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
    log('processAttributes');
    let preOrderTxt = "";
    let lng = "";
    if ('EN' === getCustomerLng()) {
        lng = '/en';
    }
    let untappdAttrValueEl;
    let untappdRatingVal;
    let untappdDateVal;
    document.querySelectorAll('span.details-product-attribute__title').forEach(function (p) {
        if (p.textContent.startsWith('hide_')) {
            if (p.textContent.trim() === 'hide_preorder:') {
                let d = p.parentElement.childNodes[1].textContent;
                if (d !== 'Uitverkocht' && d !== 'Sold out') {
                    preOrderTxt = '<strong style="color:red;">PRE-ORDER</strong> ';
                    if ('EN' === getCustomerLng()) {
                        preOrderTxt += ('Expected: ' + d);
                    } else {
                        preOrderTxt += ('Verwacht: ' + d);
                    }
                }
            } else if (p.textContent.trim() === 'hide_untappd_ratings:') {
                untappdRatingVal = p.parentElement.getElementsByClassName('details-product-attribute__value').item(0).textContent.trim();
            } else if (p.textContent.trim() === 'hide_untappd_date:') {
                untappdDateVal = p.parentElement.getElementsByClassName('details-product-attribute__value').item(0).textContent.trim();
            }
            p.parentElement.style.display = 'none';
        } else {
            const attribute = p.textContent.trim();
            if (attribute === 'Brouwerij:' || attribute === 'Brewery:') {
                const element = p.parentElement.getElementsByClassName('details-product-attribute__value').item(0);
                let content = element.textContent.trim();
                const link = lng + '/products/' + content.toLowerCase().replaceAll('.', '').replaceAll(' ', '-');
                element.innerHTML = '<a href="' + link + '" target="_blank">' + content + '</a>';
            } else if (attribute === 'Type:') {
                const element = p.parentElement.getElementsByClassName('details-product-attribute__value').item(0);
                let content = element.textContent.trim();
                const link = lng + '/products/alle-bieren?attribute_Type=' + content.replaceAll(' ', '+');
                element.innerHTML = '<a href="' + link + '" target="_blank">' + content + '</a>';
            } else if (attribute === 'Land:' || attribute === 'Country:') {
                // /alle-bieren?attribute_Land
                const element = p.parentElement.getElementsByClassName('details-product-attribute__value').item(0);
                let content = element.textContent.trim();
                const link = lng + '/products/alle-bieren?attribute_Land=' + content.replaceAll(' ', '+');
                element.innerHTML = '<a href="' + link + '" target="_blank">' + content + '</a>';
            } else if (attribute === 'Untappd:') {
                // /alle-bieren?attribute_Land
                untappdAttrValueEl = p.parentElement.getElementsByClassName('details-product-attribute__value').item(0);
            } else if (attribute === 'Untappd:') {
                // /alle-bieren?attribute_Land
                untappdAttrValueEl = p.parentElement.getElementsByClassName('details-product-attribute__value').item(0);
            }
        }
    });
    if (untappdAttrValueEl) {
        let content = untappdAttrValueEl.textContent.trim();
        if (untappdRatingVal && content.indexOf('ratings') < 0) {
            content += ' (ratings: ' + untappdRatingVal + ', dd: ' + untappdDateVal + ')';
        }
        untappdAttrValueEl.textContent = content;
    }
    if (preOrderTxt !== "" && document.querySelector('div.form-control--primary button.form-control__button span.form-control__button-text')) {
        document.querySelector('div.form-control--primary button.form-control__button span.form-control__button-text').textContent = 'Pre-Order';
    }
    const preOrderTxtEl = document.querySelector('div.product-details__product-options.details-product-options');
    if (preOrderTxtEl && preOrderTxtEl.innerHTML !== preOrderTxt) {
        preOrderTxtEl.innerHTML = preOrderTxt;
    }
}

function soonLabel() {
    log('soonLabel');
    let notSoldOut = false;
    let preorderSoldOut = false;
    let verwachtTxt = '';
    document.querySelectorAll('div.product-details__product-attributes div.details-product-attribute span.details-product-attribute__title').forEach(
        function (item) {
            if (item.textContent.trim() === 'hide_preorder:') {
                let d = item.parentElement.childNodes[1].textContent;
                if (d === 'Uitverkocht' || d === 'Sold out') {
                    preorderSoldOut = true;
                }
            } else if (item.textContent.trim() === 'Verwacht:' || item.textContent.trim() === 'Expected:') {
                notSoldOut = true;
                verwachtTxt = item.textContent.trim() + ' ' + item.parentElement.childNodes[1].textContent.trim();
            }
        });
    if (!preorderSoldOut && (notSoldOut || (document.querySelector('div.product-details__product-price.ec-price-item')?.getAttribute('content') === "0" && document.querySelector('div.product-details__product-soldout')))) {
        let soldOutEl = document.querySelector('div.ec-label.label--flag.label--attention div.label__text');
        if (soldOutEl && (soldOutEl.textContent !== 'Verwacht' || soldOutEl.textContent !== 'Expected')) {
            if (soldOutEl.textContent === 'Uitverkocht') {
                soldOutEl.textContent = 'Verwacht';
            } else {
                soldOutEl.textContent = 'Expected';
            }
        }
        let soldOutEl2 = document.querySelector('div.product-details-module__title.details-product-purchase__sold-out');
        if (soldOutEl2 && soldOutEl2.textContent !== verwachtTxt) {
            soldOutEl2.textContent = verwachtTxt;
        }
        let soldOutTxt = document.querySelector('div.details-product-purchase__place');
        if (soldOutTxt && soldOutTxt.style.display !== 'none') soldOutTxt.style.display = 'none'
    }
}

function processExpectedLabels() {
    if (document.querySelector('.ecwid-productBrowser')) {
        log('processExpectedLabels');
        document.querySelectorAll('div.grid-product__wrap-inner').forEach(function (p) {
            const lint = p.querySelector('div.label__text')?.textContent;
            if (lint === 'Sold out' || lint === 'Uitverkocht') return;
            let buyNowEl = p.querySelector('div.grid-product__button.grid-product__buy-now');
            if (buyNowEl?.textContent === 'Sold out' || buyNowEl?.textContent === 'Uitverkocht') {
                buyNowEl.style.display = 'none';
                if (document.querySelector('h1.page-title__name.ec-header-h1')?.textContent.trim() !== 'Pre-order') {
                    let priceEl = p.querySelector('div.grid-product__price');
                    if (priceEl.style.display !== 'none') {
                        p.querySelector('div.grid-product__price').style.display = 'none';
                    }
                }
            }
        });
    }
}

function addCouponInfo(toScroll) {
    log('addCouponInfo');
    const attrValSelector = '.ec-store.ec-store__product-page .details-product-attribute:nth-child($) .details-product-attribute__value';
    let dc = document.querySelector('#discountContainer');
    if (dc) dc.remove();
    const c1E = document.querySelector(attrValSelector.replace('$', '1'));
    if (!c1E) return;

    let custDisc = 0;
    let discElement = document.querySelector('span.details-product-price-discount__value');
    if (discElement) {
        custDisc = Number(discElement.textContent.replace("%", ""));
    }
    let c1 = c1E.textContent;
    if (c1 === "0" || isNaN(c1.replace(",", ".").trim())) return;
    let c2 = document.querySelector(attrValSelector.replace('$', '2')).textContent;
    let c3 = document.querySelector(attrValSelector.replace('$', '3')).textContent;

    c1 = calcDiscount(Number(c1.replace(",", ".")), custDisc).toString();
    c2 = calcDiscount(Number(c2.replace(",", ".")), custDisc).toString();
    c3 = calcDiscount(Number(c3.replace(",", ".")), custDisc).toString();
    let txt = document.txtNl1 + c1 + document.txtNl2 + c1 + document.txtNl3 + c3 + document.txtNl4 + c2 + document.txtNl5;
    if ('EN' === getCustomerLng()) {
        txt = document.txtEn1 + c1 + document.txtEn2 + c1 + document.txtEn3 + c3 + document.txtEn4 + c2 + document.txtEn5;
    }
    document.querySelector('div.product-details-module.product-details__product-price-row').insertAdjacentHTML('beforeend', txt);
    if (toScroll) {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
}

function moveSubtitle() {
    log('moveSubtitle');
    document.querySelectorAll('div.grid-product__wrap-inner > div.grid-product__subtitle').forEach(function (p) {
        let imgWrapElement = p.parentElement.querySelector('div.grid-product__image-wrap');
        if (imgWrapElement) {
            imgWrapElement.parentElement.insertBefore(p, imgWrapElement.lastChild.nextSibling);
        }
    });
}

function calcDiscount(num, custDisc) {
    return Math.round(((num * (100 - custDisc) / 100) + Number.EPSILON) * 100) / 100;
}

function redirectWhenNeeded() {
    log('redirectWhenNeeded');
    if (window.location.href.endsWith('/products')) {
        let newLoc = window.location.href + '/alle-bieren';
        window.location.replace(newLoc);
    }
}

function translateCheckoutNotice() {
    log('translateCheckoutNotice');
    let element;
    if ('EN' === getCustomerLng()) {
        element = document.querySelector('span.adb_nl');
    } else {
        element = document.querySelector('span.adb_en');
    }
    if (element) {
        element.style.display = 'none';
    }
}

function addDeliveryInfoLink() {
    log('addDeliveryInfoLink');

    const lngTxt = getCustomerLng();
    // show link to shipping cost in cart side banner
    const cartSidebar = document.querySelector('div.ec-cart__sidebar-inner:not(:has(div#deliveryInfoSidebar))');
    if (cartSidebar) {
        if ('EN' === lngTxt) {
            cartSidebar.lastElementChild.insertAdjacentHTML('beforebegin', '<div id="deliveryInfoSidebar">View the <a class="ec-link" target="_blank" href="/delivery-info#feature-list-fjNnsD-FLT23">delivery information</a><br></div>');
        } else {
            cartSidebar.lastElementChild.insertAdjacentHTML('beforebegin', '<div id="deliveryInfoSidebar">Bekijk de <a class="ec-link" target="_blank" href="/delivery-info#feature-list-fjNnsD-FLT23">leveringsinformatie</a><br></div>');
        }
    }

    let deliveryNotice = document.querySelector('div.ec-cart-step--address .ecwid-checkout-notice:not(:has(div#deliveryInfoOnSection1))');
    if (deliveryNotice) {
        if ('EN' === lngTxt) {
            deliveryNotice.insertAdjacentHTML('beforeend', '<div id="deliveryInfoOnSection1">View the <a class="ec-link" target="_blank" href="/en/delivery-info#feature-list-fjNnsD-FLT23">delivery information</a><br></div>');
        } else {
            deliveryNotice.insertAdjacentHTML('beforeend', '<div id="deliveryInfoOnSection1">Bekijk de <a class="ec-link" target="_blank" href="/delivery-info#feature-list-fjNnsD-FLT23">leveringsinformatie</a><br></div>');
        }
        location.href = "#";
        location.href = "#deliveryInfoOnSection1";
    } else {
        deliveryNotice = document.querySelector('div.ec-cart-step--delivery .ecwid-checkout-notice:not(:has(div#deliveryInfoOnSection2))');
        if (deliveryNotice) {
            if ('EN' === lngTxt) {
                deliveryNotice.insertAdjacentHTML('beforeend', '<div id="deliveryInfoOnSection2">View the <a class="ec-link" target="_blank" href="/en/delivery-info#feature-list-fjNnsD-FLT23">delivery information</a><br></div>');
            } else {
                deliveryNotice.insertAdjacentHTML('beforeend', '<div id="deliveryInfoOnSection2">Bekijk de <a class="ec-link" target="_blank" href="/delivery-info#feature-list-fjNnsD-FLT23">leveringsinformatie</a><br></div>');
            }
            location.href = "#";
            location.href = "#deliveryInfoOnSection2";
        }
    }
}

function addTitleAttribute() {
    log('addTitleAttribute');
    document.querySelectorAll('.grid__categories .grid-category__title-inner').forEach(function (p) {
        if (!p.hasAttribute("title")) {
            p.setAttribute("title", p.textContent.trim());
        }
    });
}

function renameBuyButtonToPreorder() {
    log('renameBuyButtonToPreorder');
    document.querySelectorAll('.grid__products .grid-product').forEach(function (p) {
        let buttonTextEl = p.querySelector('.grid__products .grid-product .form-control__button-text');
        if (buttonTextEl) {
            if (buttonTextEl.textContent !== 'Pre-order') {
                let labelEl = p.querySelector('.grid-product__label');
                if (labelEl && labelEl.className.indexOf('grid-product__label--') >= 0 && labelEl.className.indexOf('grid-product__label--Nieuw') < 0) {
                    buttonTextEl.textContent = 'Pre-order';
                }
            }
        }
    });
}

function translateDeliveryInfoTable() {
    log('translateDeliveryInfoTable');
    if ('EN' === getCustomerLng()) {
        document.querySelectorAll('div.del_info_table span.en').forEach(function (p) {
            if (p.style.display !== 'inline') {
                p.style.display = 'inline';
                p.parentElement.querySelector('span.nl').style.display = 'none';
            }
        });
    }
}

function getCustomerLng() {
    const lngElement = document.querySelector('a.ins-header__language-link--active');
    if (lngElement) {
        return lngElement.textContent.trim();
    }
    return 'NL';
}

function processProductPage(toScroll) {
    if (document.querySelector('.ecwid-productBrowser-ProductPage')) {
        addCouponInfo(toScroll);
        soonLabel();
        processAttributes();
        processStock();
    }
}

function processProductBrowserPage() {
    if (document.querySelector('.ecwid-productBrowser:not(.ecwid-productBrowser-CartPage):not(.ecwid-productBrowser-ElmCheckoutShippingAddressPage):not(.ecwid-productBrowser-CheckoutPaymentDetailsPage):not(.ecwid-productBrowser-ElmCheckoutDeliveryPage)')) {
        processExpectedLabels();
        moveSubtitle();
        addTitleAttribute();
        renameBuyButtonToPreorder();
    }
}

function processCartPage() {
    if (document.querySelector('.ecwid-productBrowser-CartPage,.ecwid-productBrowser-ElmCheckoutShippingAddressPage,.ecwid-productBrowser-CheckoutPaymentDetailsPage,.ecwid-productBrowser-ElmCheckoutDeliveryPage')) {
        translateCheckoutNotice();
        addDeliveryInfoLink();
    }
}

function processInfoPages() {
    if (document.querySelector('div.del_info_table')) {
        translateDeliveryInfoTable();
    }
}

function log(txt) {
    if (debug) {
        console.log(txt);
    }
}
