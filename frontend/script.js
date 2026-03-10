const form = document.getElementById("weather-form");
const resultBox = document.getElementById("result");

const API_URL = "/api/weather";

const renderResult = (message, details = "") => {
  resultBox.innerHTML = `
    <strong>${message}</strong>
    ${details ? `<span>${details}</span>` : ""}
  `;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const city = (formData.get("city") || "").trim();

  if (!city) {
    renderResult("Ingresa una ciudad válida");
    return;
  }

  renderResult("Consultando clima...");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city }),
    });

    if (!response.ok) {
      throw new Error("Error al obtener la recomendación");
    }

    const data = await response.json();
    const { temperature, condition, recommendation } = data;

    renderResult(recommendation, `${city} · ${temperature}°C · ${condition}`);
  } catch (error) {
    console.error(error);
    renderResult(
      "No se pudo completar la consulta",
      "Inténtalo nuevamente en unos segundos",
    );
  }
});
