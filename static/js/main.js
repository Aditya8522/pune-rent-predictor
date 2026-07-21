(function () {
  "use strict";

  const form = document.getElementById("prediction-form");
  const submitBtn = document.getElementById("submit-btn");
  const btnLabel = submitBtn.querySelector(".btn-label");
  const btnSpinner = submitBtn.querySelector(".btn-spinner");
  const formError = document.getElementById("form-error");

  const states = {
    empty: document.getElementById("result-empty"),
    loading: document.getElementById("result-loading"),
    content: document.getElementById("result-content"),
    error: document.getElementById("result-error"),
  };

  const bhkInput = document.getElementById("bhk");
  const areaInput = document.getElementById("area_sqft");
  const areaHint = document.getElementById("area-hint");

  // Typical Pune sq. ft. sizes by BHK, used only as a starting point for the
  // area field — the user can always override it.
  const typicalArea = { 1: 550, 2: 900, 3: 1300, 4: 1800, 5: 2500 };
  let areaTouchedManually = false;

  areaInput.addEventListener("input", () => { areaTouchedManually = true; });

  bhkInput.addEventListener("input", () => {
    const bhk = parseInt(bhkInput.value, 10);
    if (!typicalArea[bhk]) return;
    areaHint.textContent = `Typical for ${bhk} BHK in Pune`;
    if (!areaTouchedManually) {
      areaInput.value = typicalArea[bhk];
    }
  });

  function showState(name) {
    Object.entries(states).forEach(([key, el]) => {
      el.hidden = key !== name;
    });
  }

  function formatCurrency(value) {
    return "₹" + Math.round(value).toLocaleString("en-IN");
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    btnSpinner.hidden = !isLoading;
    btnLabel.textContent = isLoading ? "Estimating…" : "Estimate rent";
  }

  function collectPayload() {
    return {
      search_locality: document.getElementById("search_locality").value,
      property_type: document.getElementById("property_type").value,
      bhk: parseInt(document.getElementById("bhk").value, 10),
      area_sqft: parseFloat(document.getElementById("area_sqft").value),
      floor_current: parseFloat(document.getElementById("floor_current").value),
      bathrooms: parseFloat(document.getElementById("bathrooms").value),
      balcony: parseFloat(document.getElementById("balcony").value),
      furnishing: document.getElementById("furnishing").value,
      tenant_preference: document.getElementById("tenant_preference").value,
      water_supply: document.getElementById("water_supply").value,
      facing: document.getElementById("facing").value,
      non_veg_allowed: document.getElementById("non_veg_allowed").value,
      negotiable: document.getElementById("negotiable").checked,
    };
  }

  function renderResult(data, payload) {
    document.getElementById("result-amount").textContent = formatCurrency(data.predicted_rent);

    const range = data.rent_range;
    document.getElementById("result-range").textContent =
      `Likely range ${formatCurrency(range.low)} – ${formatCurrency(range.high)} / month`;

    document.getElementById("stat-rate").textContent = `₹${data.rate_per_sqft}/sqft`;
    document.getElementById("stat-locality").textContent = payload.search_locality;
    document.getElementById("stat-config").textContent =
      `${payload.bhk} BHK · ${payload.property_type}`;

    showState("content");
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    formError.hidden = true;

    const payload = collectPayload();
    setLoading(true);
    showState("loading");

    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        renderResult(result, payload);
      } else {
        document.getElementById("result-error-message").textContent =
          result.error || "The server could not produce an estimate.";
        showState("error");
      }
    } catch (err) {
      document.getElementById("result-error-message").textContent =
        "Could not reach the server. Check your connection and try again.";
      showState("error");
    } finally {
      setLoading(false);
    }
  });
})();
