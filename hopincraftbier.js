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
