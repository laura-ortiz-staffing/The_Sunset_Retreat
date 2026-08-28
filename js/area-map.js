// Real interactive map (Leaflet + OpenStreetMap, no API key required).
// Coordinates are real, geocoded locations — not decorative placement.
// The property gets a real photo marker; other places get an on-brand
// monogram badge (no stock/mismatched photos of places we don't have
// licensed images for) — shown on both hover (tooltip) and click (popup).
document.addEventListener("DOMContentLoaded", function () {
  var el = document.getElementById("area-map");
  if (!el || !window.L) return;

  var PLACES = [
    {
      id: "home", home: true, tag: "You are here",
      name: "Sunset View Retreat",
      desc: "177 Mallard Lane, Halifax, PA — your home base for the stay.",
      lat: 40.4691, lng: -76.9315,
      link: "property.html", linkText: "See the property &rarr;"
    },
    {
      id: "tobias", tag: "Family favorite", letter: "L", color: "c-forest",
      name: "Lake Tobias Wildlife Park",
      desc: "Open-air safari tours and wildlife exhibits &mdash; one of the area's best family outings.",
      lat: 40.50031, lng: -76.89127,
      link: "https://www.google.com/maps/search/?api=1&query=Lake+Tobias+Wildlife+Park+Halifax+PA"
    },
    {
      id: "winery", tag: "Local experience", letter: "A", color: "c-accent-dark",
      name: "Armstrong Valley Winery",
      desc: "Tastings, historic grounds, and seasonal events in the Pennsylvania countryside.",
      lat: 40.48024, lng: -76.89190,
      link: "https://www.google.com/maps/search/?api=1&query=Armstrong+Valley+Winery+Halifax+PA"
    },
    {
      id: "ferry", tag: "On the water", letter: "M", color: "c-gold",
      name: "Millersburg Ferry",
      desc: "The last of its kind on the Susquehanna &mdash; a scenic paddle-wheel river crossing.",
      lat: 40.54417, lng: -76.97361,
      link: "https://www.google.com/maps/search/?api=1&query=Millersburg+Ferry+PA"
    },
    {
      id: "ned", tag: "Nature &amp; art", letter: "N", color: "c-citron",
      name: "Ned Smith Center",
      desc: "Trails, galleries, and nature programs celebrating the Pennsylvania wilds.",
      lat: 40.5417, lng: -76.9572,
      link: "https://www.google.com/maps/search/?api=1&query=Ned+Smith+Center+for+Nature+and+Art+Millersburg+PA"
    },
    {
      id: "trail", tag: "Outdoors", letter: "T", color: "c-forest",
      name: "Appalachian Trail &mdash; Peters Mountain",
      desc: "Scenic hiking and panoramic views over the Susquehanna Valley.",
      lat: 40.41196, lng: -76.93022,
      link: "https://www.google.com/maps/search/?api=1&query=Appalachian+Trail+Peters+Mountain+PA"
    },
    {
      id: "glider", tag: "Scenic overlook", letter: "H", color: "c-accent",
      name: "Hang Glider Launch",
      desc: "A quiet ridge-top overlook on Peters Mountain with sweeping valley views.",
      lat: 40.4165, lng: -76.9255,
      link: "https://www.google.com/maps/search/?api=1&query=Hang+Glider+Launch+Peters+Mountain+PA"
    }
  ];

  var map = L.map(el, { scrollWheelZoom: false }).setView([40.478, -76.918], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
  }).addTo(map);

  var bounds = [];

  PLACES.forEach(function (p) {
    var icon;
    if (p.home) {
      icon = L.divIcon({
        className: "svr-home-marker",
        html: '<span class="ring"></span><img src="img/front-house.jpg" alt="">',
        iconSize: [46, 46],
        iconAnchor: [23, 23],
        popupAnchor: [0, -20],
        tooltipAnchor: [0, -20]
      });
    } else {
      icon = L.divIcon({
        className: "svr-marker",
        html: "<span></span>",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -12],
        tooltipAnchor: [0, -12]
      });
    }

    var linkHref = p.link;
    var isExternal = /^https?:\/\//.test(linkHref);
    var linkText = p.linkText || "Get directions &rarr;";
    var linkAttrs = isExternal ? ' target="_blank" rel="noopener"' : "";

    var thumb = p.home
      ? '<span class="svr-thumb photo" style="background-image:url(\'img/front-house.jpg\')"></span>'
      : '<span class="svr-thumb ' + p.color + '">' + p.letter + "</span>";

    var tipHtml = '<div class="svr-tip">' + thumb + "<strong>" + p.name + "</strong></div>";

    var popupHtml =
      '<div class="svr-popup-head">' + thumb +
      '<div><span class="tag">' + p.tag + "</span><h4>" + p.name + "</h4></div></div>" +
      "<p>" + p.desc + "</p>" +
      '<a class="map-link" href="' + linkHref + '"' + linkAttrs + ">" + linkText + "</a>";

    var marker = L.marker([p.lat, p.lng], { icon: icon, title: p.name }).addTo(map);

    marker.bindPopup(popupHtml, { className: "svr-popup", minWidth: 230, maxWidth: 260 });

    if (p.home) {
      // The property marker is already its own photo, always visible —
      // give it a permanent name label instead of a hover tooltip.
      marker.bindTooltip("&#9733; Sunset View Retreat", {
        permanent: true, direction: "bottom", offset: [0, 16], className: "svr-home-label", interactive: false
      });
    } else {
      marker.bindTooltip(tipHtml, { direction: "top", className: "svr-tooltip" });
    }

    bounds.push([p.lat, p.lng]);
  });

  if (bounds.length) map.fitBounds(bounds, { padding: [30, 30] });
});
