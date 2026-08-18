/* ============================================================
   TEPIA GROUP — vacancy catalog (client-side demo data)
   Once the backend is live, replace SAMPLE_VACANCIES with:
     const res = await fetch(API_BASE + '/vacancies?lang=' + lang);
     const { items } = await res.json();
   The rendering/filtering logic below already expects this shape,
   so no other change is needed.
   ============================================================ */
(function () {
  "use strict";

  const SAMPLE_VACANCIES = [
    {
      slug: "warehouse-packer-wroclaw", title: "Warehouse Packer", country: "Poland",
      city: "Wrocław area, Poland", gender: "any", hot: true, hasHousing: true,
      salary: "from 6,100 PLN gross", housing: "20 PLN/day",
      photo: "https://images.unsplash.com/photo-1749244768351-2726dc23d26c?w=700&q=75&auto=format&fit=crop",
    },
    {
      slug: "production-line-berlin", title: "Production Line Operator", country: "Germany",
      city: "Berlin, Germany", gender: "any", hot: true, hasHousing: true,
      salary: "from 2,100 EUR gross", housing: "from 450 PLN/month",
      photo: "https://images.unsplash.com/photo-1742535038366-e1e1350a27fe?w=700&q=75&auto=format&fit=crop",
    },
    {
      slug: "greenhouse-worker-rotterdam", title: "Greenhouse Worker", country: "Netherlands",
      city: "Westland, Netherlands", gender: "female", hot: false, hasHousing: true,
      salary: "from 1,950 EUR gross", housing: "Free",
      photo: "https://images.unsplash.com/photo-1651592280602-37d79e75eee2?w=700&q=75&auto=format&fit=crop",
    },
    {
      slug: "assembly-line-brno", title: "Assembly Line Technician", country: "Czechia",
      city: "Brno, Czechia", gender: "male", hot: false, hasHousing: true,
      salary: "from 34,000 CZK gross", housing: "20 EUR/day",
      photo: "https://images.unsplash.com/photo-1741176503229-08a2af87242c?w=700&q=75&auto=format&fit=crop",
    },
    {
      slug: "logistics-picker-vilnius", title: "Logistics Picker", country: "Lithuania",
      city: "Vilnius, Lithuania", gender: "any", hot: false, hasHousing: false,
      salary: "from 1,400 EUR gross", housing: "Not provided",
      photo: "https://images.unsplash.com/photo-1749244768351-2726dc23d26c?w=700&q=75&auto=format&fit=crop",
    },
    {
      slug: "machine-operator-kosice", title: "Machine Operator", country: "Slovakia",
      city: "Košice, Slovakia", gender: "male", hot: false, hasHousing: true,
      salary: "from 1,250 EUR gross", housing: "15 EUR/day",
      photo: "https://images.unsplash.com/photo-1742535038366-e1e1350a27fe?w=700&q=75&auto=format&fit=crop",
    },
    {
      slug: "food-production-krakow", title: "Food Production Assistant", country: "Poland",
      city: "Kraków area, Poland", gender: "female", hot: true, hasHousing: true,
      salary: "from 5,600 PLN gross", housing: "20 PLN/day",
      photo: "https://images.unsplash.com/photo-1741176503229-08a2af87242c?w=700&q=75&auto=format&fit=crop",
    },
    {
      slug: "textile-sorter-munich", title: "Textile Sorter", country: "Germany",
      city: "Munich, Germany", gender: "female", hot: false, hasHousing: false,
      salary: "from 1,900 EUR gross", housing: "Not provided",
      photo: "https://images.unsplash.com/photo-1651592280602-37d79e75eee2?w=700&q=75&auto=format&fit=crop",
    },
  ];

  const grid = document.getElementById("vacCatalogGrid");
  const template = document.getElementById("vacCardTemplate");
  const resultsCount = document.getElementById("vacResultsCount");
  const noResults = document.getElementById("vacNoResults");
  if (!grid || !template) return;

  const searchInput = document.getElementById("vacSearch");
  const countryChecks = Array.from(document.querySelectorAll('.filter-sidebar input[type="checkbox"][value]'));
  const genderRadios = Array.from(document.querySelectorAll('input[name="vacGender"]'));
  const hotOnly = document.getElementById("vacHotOnly");
  const housingOnly = document.getElementById("vacHousingOnly");
  const clearBtn = document.getElementById("vacFilterClear");

  // Preselect a country if arriving from a homepage/link filter, e.g. vacancies.html?country=Poland
  const params = new URLSearchParams(window.location.search);
  if (params.get("hot") === "1" && hotOnly) hotOnly.checked = true;

  function render() {
    const q = (searchInput?.value || "").trim().toLowerCase();
    const activeCountries = countryChecks.filter((c) => c.checked).map((c) => c.value);
    const gender = genderRadios.find((r) => r.checked)?.value || "any";
    const needHot = !!hotOnly?.checked;
    const needHousing = !!housingOnly?.checked;

    const filtered = SAMPLE_VACANCIES.filter((v) => {
      if (q && !(v.title.toLowerCase().includes(q) || v.city.toLowerCase().includes(q))) return false;
      if (activeCountries.length && !activeCountries.includes(v.country)) return false;
      if (gender !== "any" && v.gender !== "any" && v.gender !== gender) return false;
      if (needHot && !v.hot) return false;
      if (needHousing && !v.hasHousing) return false;
      return true;
    });

    const dict = window.TEPIA_I18N ? window.TEPIA_I18N.LANGS : null;
    const lang = window.TEPIA_I18N ? window.TEPIA_I18N.currentLang() : "en";
    if (resultsCount) {
      const label = window.TEPIA_I18N ? window.TEPIA_I18N.get("vacPage.resultsCount", lang) : null;
      resultsCount.textContent = (label || "{n} vacancies found").replace("{n}", filtered.length);
    }

    grid.innerHTML = "";
    noResults.style.display = filtered.length ? "none" : "";

    filtered.forEach((v) => {
      const node = template.content.cloneNode(true);
      const flame = node.querySelector(".hotvac-flame");
      const img = node.querySelector("img");
      img.src = v.photo;
      img.alt = v.title;
      if (v.hot) flame.style.display = "";
      node.querySelector("h3").textContent = v.title;
      node.querySelector(".m-loc").textContent = v.city;
      node.querySelector(".m-salary").textContent = v.salary;
      node.querySelector(".m-housing").textContent = v.housing;
      const link = node.querySelector("a.btn");
      link.href = "vacancy.html?slug=" + v.slug;
      grid.appendChild(node);
    });

    if (window.TEPIA_I18N) window.TEPIA_I18N.applyLang(lang);
    if (window.TEPIA_IMG_LABELS) window.TEPIA_IMG_LABELS.scan(grid);
  }

  [searchInput, hotOnly, housingOnly, ...countryChecks, ...genderRadios].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      countryChecks.forEach((c) => (c.checked = true));
      genderRadios.forEach((r) => (r.checked = r.value === "any"));
      if (hotOnly) hotOnly.checked = false;
      if (housingOnly) housingOnly.checked = false;
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", render);
  if (document.readyState !== "loading") render();
})();
