// Get that hamburger menu cookin' //

document.addEventListener("DOMContentLoaded", function() {
  // Get all "navbar-burger" elements
  var $navbarBurgers = Array.prototype.slice.call(
    document.querySelectorAll(".navbar-burger"),
    0
  );
  // Check if there are any navbar burgers
  if ($navbarBurgers.length > 0) {
    // Add a click event on each of them
    $navbarBurgers.forEach(function($el) {
      $el.addEventListener("click", function() {
        // Get the target from the "data-target" attribute
        var target = $el.dataset.target;
        var $target = document.getElementById(target);
        // Toggle the class on both the "navbar-burger" and the "navbar-menu"
        $el.classList.toggle("is-active");
        $target.classList.toggle("is-active");
      });
    });
  }
});

// Smooth Anchor Scrolling
$(document).on("click", 'a[href^="#"]:not(.js-modal-trigger)', function(event) {
  const targetId = this.getAttribute("href");

  // Ignore href="#" and links with no matching target
  if (!targetId || targetId === "#") return;

  const $target = $(targetId);
  if (!$target.length) return;

  event.preventDefault();

  $("html, body").animate({
    scrollTop: $target.offset().top
  }, 500);
});

// When the user scrolls down 20px from the top of the document, show the scroll up button
const toTop = document.getElementById("toTop");

window.addEventListener("scroll", () => {
  toTop.style.display = window.scrollY > 20 ? "block" : "none";
});

const links = [...document.querySelectorAll("#institutions-data a")];

const items = links.map((a) => ({
  text: a.textContent.trim(),
  coords: a.dataset.coords.split(',').map(Number),
  href: a.href,
  color: a.dataset.color
}));

var map = L.map('institutions-visual', {alt: "A map of the different institutions in the Greater Boston"}).setView([42.35447,-71.06813], 11);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 16,
  minZoom: 7,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const markers = new MarkerClusterGroup({
  iconCreateFunction: cluster => new L.DivIcon({
    className: '',
    html: `
    <span class="icon is-medium" style="background-color: black">
      <span class="has-text-white has-text-weight-bold">${cluster.getChildCount()}</span>
    </span>`,
    iconSize: [32, 32],
    popupAnchor: [0, -8]
  })
});

items.forEach(element => {

  const color = CSS.supports('color', element.color) ? element.color : '#001c41';

/*  const customIcon = L.divIcon({
    className: '',
    html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42"
      viewBox="0 0 32 42" aria-hidden="true">
      <path fill="${color}"
        stroke="#000000" stroke-width="1"
        d="M16 1C7.7 1 1 7.7 1 16c0 11 15 25 15 25s15-14 15-25C31 7.7 24.3 1 16 1z"/>
      <circle cx="16" cy="16" r="5" fill="#000000"/>
    </svg>`,
    iconSize: [32, 42],
    iconAnchor: [16, 12]
  }); */
  const customIcon = L.divIcon({
    className: '',
    html: `
    <span class="icon is-medium" style="border: 2px solid white; background-color: ${color};">
      <i class="fas fa-building-flag fa-lg has-text-white" aria-hidden="true"></i>
    </span>`,
    iconSize: [32, 32],
    popupAnchor: [0, -8]
  });

  L.marker(element.coords,
      {alt: element.text, icon: customIcon}).addTo(markers)
    .bindPopup('<a href="'+ element.href +'" title="Website of '+ element.text +'" target="_blank">'+ element.text + '</a>');
});

map.addLayer(markers);

// Modals (from https://bulma.io/documentation/components/modal/)
document.addEventListener('DOMContentLoaded', () => {
  // Functions to open and close a modal
  function openModal($el) {
    $el.classList.add('is-active');
  }

  function closeModal($el) {
    $el.classList.remove('is-active');
  }

  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => {
      closeModal($target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    if(event.key === "Escape") {
      closeAllModals();
    }
  });
});
