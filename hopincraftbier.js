console.log("HopInCraftbier custom js v3");
/* Get the header element and it's position */
const headerDiv = document.querySelector("#tile-header-fcHJMd");

if (headerDiv) {
  let announcementsHeight = 0;
  // const announcementDivs = document.querySelectorAll('.ins-tile--announcement-bar');
  // if (announcementDivs) {
  //   announcementDivs.forEach(function (d) {
  //     announcementsHeight += d.offsetHeight;
  //   });
  // }

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
var cartTotalMo = new MutationObserver(function(ms) {
  ms.forEach(function (m) {
    for (var i = 0; i < m.addedNodes.length; i++) {
      if (m.addedNodes[i].nodeType == Node.ELEMENT_NODE) {
        if (typeof m.addedNodes[i].className == "string") {
          var className = m.addedNodes[i].className;
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
