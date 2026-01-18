console.log("HopInCraftbier custom js v6.13");
let debug = false;
let prodMode = true;

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
document.txtNl1 = '<div class="dtooltip"><p class="hover question">Kortingscoupon</p><p class="dtooltiptext">Afhankelijk van de gekozen betaling en levering, kunt u een kortingscoupon krijgen die te gebruiken is bij een volgende bestelling. Voor dit bier ziet u de bedragen in deze tabel</p></div><table class="discount-table"><thead><tr class="first_header"><th></th><th colspan="2">Manier van levering</th></tr><tr><th>Manier van betaling</th><th>Afhaling</th><th>Levering</th></tr></thead><tbody><tr><td class="header">Betalen bij afhaling</td><td>€ ';
document.txtNl2 = '</td><td> - </td></tr><tr><td class="header">Overschrijving</td><td>€ ';
document.txtNl3 = '</td><td>€ ';
document.txtNl4 = '</td></tr><tr><td class="header">Online betaling</td><td>€ ';
document.txtNl5 = '</td><td>€ 0</td></tr></tbody></table></div>';

document.txtEn1 = '<div class="dtooltip"><p class="hover question">Discount coupon</p><p class="dtooltiptext">Depending on the chosen payment and delivery, you can get a discount coupon that can be used for a next order. For this beer you can see the amounts in this table</p></div><table class="discount-table"><thead><tr class="first_header"><th></th><th colspan="2">Method of delivery</th></tr><tr><th>Method of payment</th><th>Pickup</th><th>Delivery</th></tr></thead><tbody><tr><td class="header">Payment upon pickup</td><td>€ ';
document.txtEn2 = '</td><td> - </td></tr><tr><td class="header">Money transfer</td><td>€ ';
document.txtEn3 = '</td><td>€ ';
document.txtEn4 = '</td></tr><tr><td class="header">Online payment</td><td>€ ';
document.txtEn5 = '</td><td>€ 0</td></tr></tbody></table></div>';

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
    processProductBrowserPage();
    processProductPage(false);
    processStock();
    processExpectedPrice();
    processCartPage();

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
    const x = document.querySelector('.details-product-purchase__place span:not(.mod)');
    if (x) {
        const element = x.parentElement;
        let mod = document.querySelector('.details-product-purchase__place span.mod');
        let txt = x.textContent;
        if (txt.indexOf('(')) {
            txt = txt.substring(0, txt.indexOf('(')).trim();
        }
        if (!mod) {
            x.style.display = 'none';
            element.insertAdjacentHTML('beforeend', '<span class="mod">' + txt + '</span>');
            mod = document.querySelector('.details-product-purchase__place span.mod');
        } else if (mod.textContent !== txt) {
            mod.innerHTML = txt;
        }
        const y = txt?.split(':');
        if (y && y.length > 1) {
            const z = Number(y[1].trim().split(' ')[0]);
            if (z < 3) {
                // color should be red
                if (element.style.color !== 'red') {
                    element.style.color = 'red';
                }
            } else if (element.style.color === 'red') {
                element.style.color = 'black';
            }
            if (z > 5 && mod.textContent !== y[0]) {
                mod.innerHTML = y[0];
            }
        } else if (element.style.color === 'red') {
            element.style.color = 'black';
        }
    }
    const qtyEl = document.querySelector('span.details-product-purchase__in-stock-qty');
    if (qtyEl && qtyEl.style.display !== 'none') {
        qtyEl.style.display = 'none';
    }
}

function processAttributes() {
    log('processAttributes');
    let preOrderTxt = "";
    let lng = "";
    if ('EN' === getCustomerLng()) {
        lng = '/en';
    }
    document.querySelectorAll('span.details-product-attribute__title').forEach(function (p) {
        if (p.textContent.startsWith('hide_')) {
            p.parentElement.style.display = 'none';
            if (p.textContent.trim() === 'hide_preorder:') {
                let d = p.parentElement.childNodes[1]?.textContent;
                if (d !== 'Uitverkocht' && d !== 'Sold out') {
                    preOrderTxt = '<strong style="color:red;">PRE-ORDER</strong> ';
                    if ('EN' === getCustomerLng()) {
                        preOrderTxt += ('Expected: ' + d);
                    } else {
                        preOrderTxt += ('Verwacht: ' + d);
                    }
                }
            }
        } else {
            const attribute = p.textContent.trim();
            if (attribute === 'Brouwerij:' || attribute === 'Brewery:' || attribute === 'Type:' || attribute === 'Land:' || attribute === 'Country:') {
                const element = p.parentElement.getElementsByClassName('details-product-attribute__value').item(0);
                let content = element.textContent.trim();
                let newContent = "";

                if (attribute === 'Brouwerij:' || attribute === 'Brewery:') {
                    log('Brouwerij: ' + content);
                    content.split(",").forEach((it) => {
                        let link = lng + '/products/' + it.trim().toLowerCase().replaceAll("’", '').replaceAll('.', '').replaceAll(' ', '-');
                        log('Link: ' + link);
                        if (newContent !== "") {
                            newContent += ", ";
                        }
                        newContent += "<a href=\"" + link + "\" target=\"_blank\">" + it.trim() + "</a>";
                    });
                    log('newContent: ' + newContent);
                } else if (attribute === 'Type:') {
                    content.split(",").forEach((it) => {
                        let link = lng + '/products/alle-bieren?attribute_Type=' + it.trim().replaceAll(' ', '+');
                        if (newContent !== "") {
                            newContent += ", ";
                        }
                        newContent += "<a href=\"" + link + "\" target=\"_blank\">" + it.trim() + "</a>";
                    });
                } else if (attribute === 'Land:' || attribute === 'Country:') {
                    content.split(",").forEach((it) => {
                        // /alle-bieren?attribute_Land
                        let link = lng + '/products/alle-bieren?attribute_Land=' + it.trim().replaceAll("’", '').replaceAll(' ', '+');
                        if (newContent !== "") {
                            newContent += ", ";
                        }
                        newContent += "<a href=\"" + link + "\" target=\"_blank\">" + it.trim() + "</a>";
                    });
                }

                let newElement = document.createElement('dum');
                newElement.innerHTML = newContent; // escape html
                if (element.innerHTML !== newElement.innerHTML) {
                    log('Setting content');
                    element.innerHTML = newContent;
                }
            }
        }
    });
    const buttonTxtEl = document.querySelector('div.form-control--primary button.form-control__button span.form-control__button-text');
    if (preOrderTxt !== "" && buttonTxtEl && buttonTxtEl.textContent !== 'Pre-Order') {
        buttonTxtEl.innerHTML = 'Pre-Order';
    }
    const preOrderTxtEl = document.querySelector('div.product-details__product-options.details-product-options');
    let newElement = document.createElement('dum');
    newElement.innerHTML = preOrderTxt;
    if (preOrderTxtEl && preOrderTxtEl.textContent !== newElement.textContent) {
        preOrderTxtEl.innerHTML = preOrderTxt;
    }
}

function processProductTitle() {
    log('processProductTitle');
    let brewery = "";
    document.querySelectorAll('span.details-product-attribute__title').forEach(function (p) {
        const attribute = p.textContent.trim();
        if (attribute === 'Brouwerij:' || attribute === 'Brewery:') {
            const element = p.parentElement.getElementsByClassName('details-product-attribute__value').item(0);
            brewery = element.textContent.trim();
        }
    });

    const titleElement = document.querySelector('.product-details__product-title');
    if (titleElement) {
        let breweryElement = document.querySelector('.product-details__product-hop-title p.brewery')
        let titleElement2 = document.querySelector('.product-details__product-hop-title p.title');
        let txt = titleElement.textContent;
        if (!breweryElement) {
            titleElement.style.display = 'none';
            titleElement.parentElement.insertAdjacentHTML('afterbegin', '<div class="product-details__product-hop-title"><p class="brewery"></p><p class="title"></p></div>');
            breweryElement = document.querySelector('.product-details__product-hop-title p.brewery');
            titleElement2 = document.querySelector('.product-details__product-hop-title p.title');
        }
        if (breweryElement.textContent !== brewery) {
            breweryElement.textContent = brewery;
        }
        if (txt.indexOf(brewery + " - ") >= 0) {
            txt = txt.replace(brewery + " - ", "").trim();
        } else if (txt.indexOf(" - ") >= 0) {
            txt = txt.replace(txt.split(" - ")[0] + " - ", "").trim();
        }
        if (titleElement2.textContent !== txt) {
            titleElement2.textContent = txt;
        }
    }
}

function processExpectedPrice() {
    log('processExpectedPrice');
    let price = "";
    const priceElement = document.querySelector('div.product-details__product-price span.details-product-price__value');
    if (priceElement) {
        document.querySelectorAll('span.details-product-attribute__title').forEach(function (p) {
            const attribute = p.textContent.trim();
            if (attribute.trim() === 'hide_max_prijs:' || attribute.trim() === 'hide_max_price:') {
                const element = p.parentElement.getElementsByClassName('details-product-attribute__value').item(0);
                if (attribute.trim() === 'hide_max_prijs:') {
                    price = "Verwachte prijs minder dan " + element.textContent.trim();
                } else {
                    price = "Expected price lower than " + element.textContent.trim();
                }
            }
        });
        let hopPriceElement = document.querySelector('div.product-details__product-price span.details-product-hop__price__value');
        if (price !== "") {
            if (!hopPriceElement) {
                priceElement.parentElement.insertAdjacentHTML('beforeend', '<span class="details-product-hop__price__value"></span>');
                hopPriceElement = document.querySelector('div.product-details__product-price span.details-product-hop__price__value');
            }
            if (priceElement.style.display !== 'none') {
                priceElement.style.display = 'none'
            }
            if (hopPriceElement) {
                if (hopPriceElement.style.display !== 'inline') {
                    hopPriceElement.style.display = 'inline';
                }
                if (hopPriceElement.textContent !== price) {
                    hopPriceElement.innerHTML = price;
                }
            }
        } else {
            if (priceElement.style.display !== 'inline') {
                priceElement.style.display = 'inline'
            }
            if (hopPriceElement && hopPriceElement.style.display !== 'none') {
                hopPriceElement.style.display = 'none';
            }
        }
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
                let d = item.parentElement.childNodes[1]?.textContent;
                if (d === 'Uitverkocht' || d === 'Sold out') {
                    preorderSoldOut = true;
                }
            } else if (item.textContent.trim() === 'Verwacht:' || item.textContent.trim() === 'Expected:') {
                notSoldOut = true;
                verwachtTxt = item.textContent.trim() + ' ' + item.parentElement.childNodes[1]?.textContent?.trim();
                if (item.textContent.trim() === 'Verwacht:') {
                    verwachtTxt = verwachtTxt + "<p class='reserve'>Stuur ons een <a href='mailto:info@hopincraftbier.be'>email</a> of een <a href='https://wa.me/32494626330' target='_blank'>whatsapp bericht</a> om dit bier te 'reserveren'</p>";
                } else {
                    verwachtTxt = verwachtTxt + "<p class='reserve'>Send us an <a href='mailto:info@hopincraftbier.be'>email</a> or a <a href='https://wa.me/32494626330' target='_blank'>whatsapp</a> message to ‘reserve’ this beer.</p>";
                }
            }
        });
    if (!preorderSoldOut && (notSoldOut || (document.querySelector('div.product-details__product-price.ec-price-item')?.getAttribute('content') === "0" && document.querySelector('div.product-details__product-soldout')))) {
        let soldOutEl = document.querySelector('div.ec-label.label--flag.label--attention div.label__text');
        if (soldOutEl && !(soldOutEl.textContent === 'Verwacht' || soldOutEl.textContent === 'Expected')) {
            if (soldOutEl.textContent === 'Uitverkocht') {
                soldOutEl.innerHTML = 'Verwacht';
            } else {
                soldOutEl.innerHTML = 'Expected';
            }
        }
        let soldOutEl2 = document.querySelector('div.product-details-module__title.details-product-purchase__sold-out');
        let newElement = document.createElement('dum');
        newElement.innerHTML = verwachtTxt;
        if (soldOutEl2 && soldOutEl2.textContent !== newElement.textContent) {
            soldOutEl2.innerHTML = verwachtTxt;
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
                if (buyNowEl.style.display !== 'none') {
                    buyNowEl.style.display = 'none';
                }
                if (document.querySelector('h1.page-title__name.ec-header-h1')?.textContent?.trim() !== 'Pre-order') {
                    let priceEl = p.querySelector('div.grid-product__price');
                    if (priceEl && priceEl.style.display !== 'none') {
                        priceEl.style.display = 'none';
                    }
                }
            }
        });
    }
}

function addCouponInfo(toScroll) {
    log('addCouponInfo');
    const priceRowEl = document.querySelector('div.product-details-module.product-details__product-price-row');
    if (!priceRowEl) {
        return;
    }

    const attrValSelector = '.ec-store.ec-store__product-page .details-product-attribute:nth-child($) .details-product-attribute__value';
    let dc = document.querySelector('#discountContainer');
    if (!dc) {
        priceRowEl.insertAdjacentHTML('beforeend', '<div id="discountContainer"></div>');
        dc = document.querySelector('#discountContainer');
    }
    const c1E = document.querySelector(attrValSelector.replace('$', '1'));
    if (c1E) {
        let custDisc = 0;
        let discElement = document.querySelector('span.details-product-price-discount__value');
        if (discElement) {
            custDisc = Number(discElement.textContent.replace("%", ""));
        }
        let c1 = c1E.textContent;
        if (c1 !== "0" && !isNaN(c1.replace(",", ".").trim())) {
            let c2 = document.querySelector(attrValSelector.replace('$', '2')).textContent;
            let c3 = document.querySelector(attrValSelector.replace('$', '3')).textContent;

            c1 = calcDiscount(Number(c1.replace(",", ".")), custDisc).toString();
            c2 = calcDiscount(Number(c2.replace(",", ".")), custDisc).toString();
            c3 = calcDiscount(Number(c3.replace(",", ".")), custDisc).toString();
            let txt;
            if ('EN' === getCustomerLng()) {
                txt = document.txtEn1 + c1 + document.txtEn2 + c1 + document.txtEn3 + c3 + document.txtEn4 + c2 + document.txtEn5;
            } else {
                txt = document.txtNl1 + c1 + document.txtNl2 + c1 + document.txtNl3 + c3 + document.txtNl4 + c2 + document.txtNl5;
            }

            let newElement = document.createElement('dum');
            newElement.innerHTML = txt;
            if (dc.textContent !== newElement.textContent) {
                dc.innerHTML = txt;
            }
            if (toScroll) {
                window.scrollTo({top: 0, behavior: 'smooth'});
            }
            if (dc.style.display !== 'block') {
                dc.style.display = 'block';
            }
        } else {
            if (dc.style.display !== 'none') {
                dc.style.display = 'none';
            }
        }
    } else {
        if (dc.style.display !== 'none') {
            dc.style.display = 'none';
        }
    }
}

function processProducts() {
    document.querySelectorAll('div.grid-product__wrap').forEach(function (p) {
        let pid = p.getAttribute('data-product-id');
        processProduct(pid, p);
    });
}

function processProduct(pid, element) {
    $.ajax({
        type: "GET",
        url: "https://app.ecwid.com/api/v3/112251271/products/" + pid + "?responseFields=id,price,attributes",
        dataType: 'json',
        contentType: "application/json",
        headers: {
            "Cache-Control": "no-cache",
            "Authorization": "Bearer secret_8BssSp1WCED2hZW8mHZFWEgaHJziJY7W",
        },
        data: {},
        success: function(resp){
            moveSubtitle2(element, resp);
            showMaxPrice(element, resp)
        },
        error: function(error){
        }
    });
}

function moveSubtitle2(element, resp) {
    const subtitleElement = element.querySelector('div.grid-product__wrap-inner > div.grid-product__subtitle');
    if (subtitleElement) {
        let imgWrapElement = subtitleElement.parentElement.querySelector('div.grid-product__image-wrap');
        if (imgWrapElement) {
            imgWrapElement.parentElement.insertBefore(subtitleElement, imgWrapElement.lastChild.nextSibling);
        }
        let untappd;
        resp.attributes.forEach(function(attr){
            if (attr.name === 'Untappd') untappd = attr.value;
        })
        const y = untappd?.split('(');
        let score = 'N/A';
        if (y && y.length > 0) {
            score = y[0];
        }
        p.innerHTML = p.innerHTML.replace('</div>', '<div class="untappd">\n' +
            '<img style="display: inline-block;" src="https://d2j6dbq0eux0bg.cloudfront.net/images/wysiwyg/product/112251271/724600919/1739827248845232524408/untappd_icon64_png.png" height="16px" width="16px">\n' +
            '<span style="display: inline-block">&nbsp;' + score + '</span></div></div>');
    }
}

function showMaxPrice(element, resp) {
    if (resp?.price === 0) {
        let maxPrice;
        resp.attributes.forEach(function(attr){
            if (attr.name === 'hide_max_prijs') maxPrice = attr.value;
        })
        const priceElement = element.querySelector('div.grid-product__price-value');
        if (priceElement && priceElement.textContent !== maxPrice) {
            priceElement.textContent = maxPrice;
        }
    }
}

function moveSubtitle() {
    log('moveSubtitle');

    document.querySelectorAll('div.grid-product__wrap-inner > div.grid-product__subtitle').forEach(function (p) {
        let imgWrapElement = p.parentElement.querySelector('div.grid-product__image-wrap');
        if (imgWrapElement) {
           imgWrapElement.parentElement.insertBefore(p, imgWrapElement.lastChild.nextSibling);
        }
        let pid = p.closest('div.grid-product__wrap').getAttribute('data-product-id');
        $.ajax({
            type: "GET",
            url: "https://app.ecwid.com/api/v3/112251271/products/" + pid + "?responseFields=id,attributes",
            dataType: 'json',
            contentType: "application/json",
            headers: {
                "Cache-Control": "no-cache",
                "Authorization": "Bearer secret_8BssSp1WCED2hZW8mHZFWEgaHJziJY7W",
            },
            data: {},
            success: function(resp){
                let untappd;
                resp.attributes.forEach(function(attr){
                    if (attr.name === 'Untappd') untappd = attr.value;
                })
                const y = untappd?.split('(');
                let score = 'N/A';
                if (y && y.length > 0) {
                    score = y[0];
                }
                p.innerHTML = p.innerHTML.replace('</div>', '<div class="untappd">\n' +
                    '<img style="display: inline-block;" src="https://d2j6dbq0eux0bg.cloudfront.net/images/wysiwyg/product/112251271/724600919/1739827248845232524408/untappd_icon64_png.png" height="16px" width="16px">\n' +
                    '<span style="display: inline-block">&nbsp;' + score + '</span></div></div>');
            },
            error: function(error){
            }
        });
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

function showCouponBlock() {
    log('showCouponBlock');
    document.querySelectorAll('div.ec-cart__discount').forEach(function (p) {
        if (p.className !== 'ec-cart__discount--focus ec-cart-coupon--focus') {
            p.className = 'ec-cart__discount--focus ec-cart-coupon--focus';
        }
    });
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
                if (labelEl &&
                    labelEl.className.indexOf('grid-product__label--') >= 0 &&
                    labelEl.className.indexOf('grid-product__label--Nieuw') < 0 &&
                    labelEl.className.indexOf('grid-product__label--Laatste') < 0) {
                    buttonTextEl.innerHTML = 'Pre-order';
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
        processProductTitle();
        processAttributes();
    }
}

function processProductBrowserPage() {
    if (document.querySelector('.ecwid-productBrowser:not(.ecwid-productBrowser-CartPage):not(.ecwid-productBrowser-ElmCheckoutShippingAddressPage):not(.ecwid-productBrowser-CheckoutPaymentDetailsPage):not(.ecwid-productBrowser-ElmCheckoutDeliveryPage)')) {
        processExpectedLabels();
        if (prodMode) {
            moveSubtitle();
        } else {
            processProducts();
        }
        addTitleAttribute();
        renameBuyButtonToPreorder();
    }
}

function processCartPage() {
    if (document.querySelector('.ecwid-productBrowser-CartPage')
        || document.querySelector('.ecwid-productBrowser-ElmCheckoutShippingAddressPage')
        || document.querySelector('.ecwid-productBrowser-CheckoutPaymentDetailsPage')
        || document.querySelector('.ecwid-productBrowser-ElmCheckoutDeliveryPage')) {
        translateCheckoutNotice();
        addDeliveryInfoLink();
        showCouponBlock();
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
