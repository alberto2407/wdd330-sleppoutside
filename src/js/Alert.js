export default class Alert {
  constructor(jsonPath = "/json/alerts.json") {
    this.jsonPath = jsonPath;
    this.alerts = [];
  }

  async init() {
    try {
      // Load alerts from JSON
      this.alerts = await this.getAlerts();

      // If there are no alerts, do nothing
      if (!this.alerts || this.alerts.length === 0) {
        return;
      }

      // Render alerts
      this.renderAlerts();
    } catch (error) {
      console.error("❌ Error cargando las alertas:", error);
    }
  }

  async getAlerts() {
    const response = await fetch(this.jsonPath);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  }

  renderAlerts() {
    // Create the container section
    const section = document.createElement("section");
    section.classList.add("alert-list");

    this.alerts.forEach((alert) => {
      // Create a <p> element for the alert
      const p = document.createElement("p");
      p.style.backgroundColor = alert.background;
      p.style.color = alert.color;

      // Message span for the alert text
      const message = document.createElement("span");
      message.textContent = alert.message;
      p.appendChild(message);

      // Button for closing the alert (X)
      const closeBtn = document.createElement("span");
      closeBtn.textContent = "✕";
      closeBtn.classList.add("alert-list-close");
      closeBtn.setAttribute("aria-label", "Close alert");
      closeBtn.setAttribute("role", "button");
      closeBtn.setAttribute("tabindex", "0");

      // Listener for closing the alert
      closeBtn.addEventListener("click", () => {
        p.remove();
        // if the section has no more children, remove it from the DOM
        if (section.children.length === 0) {
          section.remove();
        }
      });

      p.appendChild(closeBtn);
      section.appendChild(p);
    });

    // Insert the section at the beginning of the <main> element
    const main = document.querySelector("main");
    if (main) {
      main.prepend(section);
    }
  }
}
