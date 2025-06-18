console.log("HopInCraftbier custom js");
/* Get the header element and it's position */
const headerDiv = document.querySelector("#tile-header-fcHJMd");

if (headerDiv) {
  const pos = "-" + document.querySelector(".ins-tile--header.ins-tile--left-logo-detailed .ins-header__row:nth-child(1)").offsetHeight + "px";
  let prevScrollPos = window.scrollY;
  let headerBottom = headerDiv.offsetTop + headerDiv.offsetHeight;

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
