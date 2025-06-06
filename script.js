// Initialize map dengan properti lengkap
const map = L.map("mapid", {
  center: [-6.5948, 106.7972],
  zoom: 10,
  minZoom: 8,
  maxZoom: 16,
});

// Legend simbol
var legendSimbol = L.control({ position: "topright" });
legendSimbol.onAdd = function (map) {
  var div = L.DomUtil.create("div", "legend-symbol");
  div.innerHTML = `
    <h4>Legenda</h4>
    <h5 style="margin-top:10px;">Batas Administrasi</h5>
    <div class="legend-item">
      <div class="legend-line" style="border-top: 2px solid blue;"></div> Batas Administrasi Kabupaten Bogor
    </div>
    <h5 style="margin-top:10px;">Jalan</h5>
    <div class="legend-item">
      <div class="legend-line" style="border-top: 3px solid red;"></div> Jalan
    </div>
    <h5 style="margin-top:10px;">Informasi</h5>
    <div class="legend-item"><div class="legend-circle" style="background-color:#FFA500;"><i class="fas fa-gas-pump"></i></div> SPBU</div>
    <div class="legend-item"><div class="legend-circle" style="background-color:#32CD32;"><i class="fas fa-utensils"></i></div> Rumah Makan/Cafe</div>
    <div class="legend-item"><div class="legend-circle" style="background-color:#1E90FF;"><i class="fas fa-water"></i></div> Curug</div>
  `;
  // Tambahkan event listener untuk klik collapse/expand
  div.addEventListener("click", function () {
    div.classList.toggle("collapsed");
  });
  return div;
};
legendSimbol.addTo(map);

// Basemap layers
const basemapOSM = L.tileLayer(
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution:
      '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }
);

const baseMapGoogle = L.tileLayer(
  "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    attribution: 'Map by <a href="https://maps.google.com/">Google</a>',
  }
);

const baseMapSatellite = L.tileLayer(
  "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    attribution: 'Satellite by <a href="https://maps.google.com/">Google</a>',
  }
);

// Add default basemap
basemapOSM.addTo(map);

// Function to set basemap
function setBasemap(type) {
  [basemapOSM, baseMapGoogle, baseMapSatellite].forEach((layer) => {
    if (map.hasLayer(layer)) map.removeLayer(layer);
  });
  if (type === "streets") {
    basemapOSM.addTo(map);
  } else if (type === "google") {
    baseMapGoogle.addTo(map);
  } else if (type === "satellite") {
    baseMapSatellite.addTo(map);
  }
}

// Tombol "Fullscreen"
const fullscreenControl = L.control({ position: "topleft" });
fullscreenControl.onAdd = function () {
  const div = L.DomUtil.create(
    "div",
    "leaflet-bar leaflet-control leaflet-control-custom"
  );
  div.innerHTML = '<i class="fas fa-expand-arrows-alt"></i>';
  Object.assign(div.style, {
    backgroundColor: "white",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  });
  div.title = "Fullscreen";
  const icon = div.querySelector("i");
  icon.style.fontSize = "18px";
  icon.style.color = "black";
  div.onclick = function () {
    if (!document.fullscreenElement) {
      map.getContainer().requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };
  return div;
};
fullscreenControl.addTo(map);

// Tombol "Home"
const homeControl = L.control({ position: "topleft" });
homeControl.onAdd = function () {
  const div = L.DomUtil.create(
    "div",
    "leaflet-bar leaflet-control leaflet-control-custom"
  );
  div.innerHTML = '<i class="fas fa-home"></i>';
  Object.assign(div.style, {
    backgroundColor: "white",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  });
  div.title = "Kembali ke Home";
  const icon = div.querySelector("i");
  icon.style.fontSize = "18px";
  icon.style.color = "black";
  div.onclick = () => {
    map.setView([-6.5948, 106.7972], 13);
  };
  return div;
};
homeControl.addTo(map);

// Fitur "My Location"
L.control
  .locate({
    position: "topleft",
    flyTo: true,
    strings: { title: "Temukan lokasiku" },
    icon: "fas fa-location-arrow",
  })
  .addTo(map);

// Layer groups
const overlayLayers = {
  Curug: L.layerGroup(),
  SPBU: L.layerGroup(),
  Resto: L.layerGroup(),
  Jalan: L.layerGroup(),
  Admin: L.layerGroup(),
};

// Fungsi untuk memuat GeoJSON dan menambah ke layer group
function loadGeoJSON(url, options, layerGroup) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      L.geoJSON(data, options).addTo(layerGroup);
    });
}

loadGeoJSON(
  "curug.geojson",
  {
    pointToLayer: (f, latlng) =>
      L.marker(latlng, {
        icon: createIcon("fas fa-water", "white", "#1E90FF"), // ikon biru untuk curug
      }),
    onEachFeature: (f, layer) => {
      if (f.properties) {
        const props = f.properties;
        const popupContent = `
          <strong>${props["Nama"]}</strong><br><br>
          <strong>Lokasi:</strong> ${props["Lokasi"]}<br>
          <strong>Harga:</strong> ${props["Harga"]}<br>
        `;
        layer.bindPopup(popupContent);
      }
    },
  },
  overlayLayers["Curug"]
);

loadGeoJSON(
  "SPBU.geojson",
  {
    pointToLayer: (f, latlng) =>
      L.marker(latlng, {
        icon: createIcon("fas fa-gas-pump", "white", "#FFA500"), // oranye
      }),
    onEachFeature: (f, layer) => {
      if (f.properties?.name) layer.bindPopup(f.properties.name);
    },
  },
  overlayLayers["SPBU"]
);

loadGeoJSON(
  "restofix.geojson",
  {
    pointToLayer: (f, latlng) =>
      L.marker(latlng, {
        icon: createIcon("fas fa-utensils", "white", "#32CD32"), // hijau
      }),
    onEachFeature: (f, layer) => {
      if (f.properties) {
        const props = f.properties;
        const popupContent = `
          <strong>${props["Resto"]}</strong><br>
          <strong>Menu andalan:</strong> ${props["Menu andalan"]}<br>
          <strong>Harga:</strong> ${props["Harga"]}<br>
          <strong>Lokasi:</strong> ${props["Lokasi"]}<br>
          <strong>Jam buka:</strong> ${props["Jam buka"]}<br>
          <strong>Telepon:</strong> ${props["Telepon"]}
        `;
        layer.bindPopup(popupContent);
      }
    },
  },
  overlayLayers["Resto"]
);

loadGeoJSON(
  "admin.geojson",
  {
    pointToLayer: (f, latlng) =>
      L.circleMarker(latlng, {
        radius: 2,
        fillColor: "#87cefa",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      }),
    onEachFeature: (f, layer) => {
      if (f.properties?.name) layer.bindPopup(f.properties.name);
    },
  },
  overlayLayers["Admin"]
);

loadGeoJSON(
  "jalan.geojson",
  {
    style: {
      color: "red",
      weight: 2,
    },
  },
  overlayLayers["Jalan"]
);

// Tambahkan semua layer ke peta
Object.values(overlayLayers).forEach((layerGroup) => layerGroup.addTo(map));

// Efek scroll ke section "Wisata"
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href="#wisata-section"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector("#wisata-section");
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });
});

// Slider tombol geser kartu
const slider = document.getElementById("cardSlider");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const slideAmount = 300; // Atur sesuai lebar kartu
prevBtn?.addEventListener("click", () => {
  slider?.scrollBy({ left: -slideAmount, behavior: "smooth" });
});
nextBtn?.addEventListener("click", () => {
  slider?.scrollBy({ left: slideAmount, behavior: "smooth" });
});

// Panggil setupLayerToggles setelah semua layer dimuat
setupLayerToggles();

// Fungsi buat marker icon dari Font Awesome
function createIcon(iconClass, iconColor, bgColor) {
  return L.divIcon({
    html: `<div style="display:flex; align-items:center; justify-content:center; width:30px; height:30px; background-color:${bgColor}; border-radius:50%; color:${iconColor}; font-size:16px;"><i class="${iconClass}"></i></div>`,
    className: "", // hilangkan class default
    iconSize: [30, 30],
    popupAnchor: [0, -15],
  });
}

// Legenda
const legendControl = L.control({ position: "bottomright" });
legendControl.onAdd = function (map) {
  const div = L.DomUtil.create("div", "legend");
  div.innerHTML = `
    <h4>Legenda</h4>
    <div class="legend-item">
      <div class="legend-circle" style="background-color:#1E90FF;"><i class="fas fa-water"></i></div> Curug
    </div>
    <div class="legend-item">
      <div class="legend-circle" style="background-color:#FFA500;"><i class="fas fa-gas-pump"></i></div> SPBU
    </div>
    <div class="legend-item">
      <div class="legend-circle" style="background-color:#32CD32;"><i class="fas fa-utensils"></i></div> Rumah Makan/Cafe
    </div>
    <div class="legend-item">
      <div class="legend-line" style="border-top: 3px solid red;"></div> Jalan
    </div>
    <div class="legend-item">
      <div class="legend-line" style="border-top: 2px solid blue;"></div> Batas Administrasi
    </div>
  `;
  return div;
};
legendControl.addTo(map);
