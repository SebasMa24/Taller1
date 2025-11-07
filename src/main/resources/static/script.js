async function fetchWithErrorHandling(
  url,
  method = "GET",
  data = null,
  headers = {}
) {
  const config = {
    method: method,
    headers: { "Content-Type": "application/json", ...headers },
    body: data ? JSON.stringify(data) : undefined,
  };

  const response = await fetch(url, config);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(extractErrorMessage(text, response.status));
  }

  return text ? JSON.parse(text) : null;
}

function extractErrorMessage(responseText, statusCode) {
  if (!responseText) return getDefaultErrorMessage(statusCode);

  try {
    const errorJson = JSON.parse(responseText);
    return (
      errorJson.trace?.match(/\"([^\"]+)\"/)?.[1] ||
      errorJson.message ||
      errorJson.error ||
      getDefaultErrorMessage(statusCode)
    );
  } catch {
    return responseText.length > 200
      ? getDefaultErrorMessage(statusCode)
      : responseText;
  }
}

function getDefaultErrorMessage(statusCode) {
  const messages = {
    400: "Solicitud incorrecta",
    401: "No autorizado",
    403: "Prohibido",
    404: "Recurso no encontrado",
    500: "Error del servidor",
  };
  return messages[statusCode] || "Error desconocido";
}

// UI Functions
function mostrarMensaje(
  mensaje,
  tipo = "error",
  tiempo = tipo === "error" ? 5000 : 3000
) {
  const popup = document.getElementById("error-popup");
  if (!popup) return;

  popup.textContent = mensaje;
  popup.className = `popup ${tipo} hidden fixed top-4 right-4 bg-red-500 text-black px-4 py-2 rounded shadow-lg z-40`;
  popup.style.backgroundColor = tipo === "error" ? "#f8d7da" : "#d4edda";
  popup.classList.remove("hidden");

  setTimeout(() => popup.classList.add("hidden"), tiempo);
}

function obtenerDatosFormulario(formElement) {
  return Object.fromEntries(new FormData(formElement));
}

// ===============================
// Control de Modal para Editar Tarea
// ===============================
const modal = document.getElementById("modal-editar");
const formEditar = document.getElementById("form-editar-tarea");
const cancelarBtn = document.getElementById("cancelar-editar");

document.querySelectorAll(".edit-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById("id").value = button.getAttribute("data-id");
    document.getElementById("titulo").value =
      button.getAttribute("data-titulo");
    document.getElementById("descripcion").value =
      button.getAttribute("data-descripcion");
    document.getElementById("fechaVencimiento").value =
      button.getAttribute("data-fecha");
    document.getElementById("recordatorio").value =
      button.getAttribute("data-recordatorio");
    modal.classList.remove("hidden");
  });
});

cancelarBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  formEditar.reset();
});

document
  .getElementById("form-editar-tarea")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const datosFormulario = obtenerDatosFormulario(e.target);
      const idTarea = datosFormulario.id;

      if (!idTarea) {
        mostrarMensaje("No se encontró el ID de la tarea", "error");
        return;
      }

      const data = {
        titulo: datosFormulario.titulo,
        descripcion: datosFormulario.descripcion,
        fechaVencimiento: datosFormulario.fechaVencimiento,
        recordatorio: datosFormulario.recordatorio,
      };

      await fetchWithErrorHandling(`/tarea/${idTarea}`, "PUT", data);
      modal.classList.add("hidden");
      formEditar.reset();
      mostrarMensaje("Tarea editada exitosamente!", "success");
    } catch (error) {
      mostrarMensaje(error.message);
    }
  });

document
  .getElementById("form-tarea")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const datosFormulario = obtenerDatosFormulario(e.target);
      await fetchWithErrorHandling("/tarea", "POST", datosFormulario);
      e.target.reset();
      mostrarMensaje("Tarea creada exitosamente!", "success");
    } catch (error) {
      mostrarMensaje(error.message);
    }
  });

// ===============================
// HU7: Recordatorios (Toast)
// ===============================
function parseFecha(fechaStr) {
  if (!fechaStr) return null;
  if (fechaStr instanceof Date) return fechaStr;
  const parsed = Date.parse(fechaStr);
  return isNaN(parsed) ? null : new Date(parsed);
}

function mostrarToast(mensaje) {
  let toast = document.getElementById("recordatorio-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "recordatorio-toast";
    toast.className = "fixed bottom-6 right-6 p-4 rounded shadow-lg z-50";
    toast.style.background = "#fff3cd";
    toast.style.color = "#856404";
    toast.style.border = "1px solid #ffeeba";
    toast.style.transition = "opacity 0.5s ease";
    toast.style.opacity = "0";
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 7000);
}

function iniciarRecordatorios({ intervaloSeg = 30 } = {}) {
  const raw = window._TASKS_FROM_SERVER ?? window.recordatorios ?? [];
  if (!Array.isArray(raw) || raw.length === 0) return;

  const tareas = raw.map((t) => ({
    ...t,
    _fechaObj: parseFecha(t.recordatorio),
    _notificado: false,
  }));

  const revisar = () => {
    const ahora = new Date();
    tareas.forEach((t) => {
      if (!t._fechaObj || t._notificado) return;
      const diffMs = t._fechaObj.getTime() - ahora.getTime();
      if (diffMs <= 0 && diffMs > -60000) {
        mostrarToast(
          `⏰ Recordatorio: ${t.titulo}${
            t.descripcion ? " — " + t.descripcion : ""
          }`
        );
        t._notificado = true;
      }
    });
  };

  revisar();
  setInterval(revisar, intervaloSeg * 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    iniciarRecordatorios({ intervaloSeg: 10 });
  } catch {}
});

// ===============================
// HU6: Búsqueda de tareas
// ===============================
const inputBusqueda = document.getElementById("busqueda-input");
const btnLimpiar = document.getElementById("limpiar-busqueda");
const mensajeBusqueda = document.getElementById("mensaje-busqueda");

let timeoutBusqueda;
inputBusqueda.addEventListener("input", function () {
  clearTimeout(timeoutBusqueda);
  timeoutBusqueda = setTimeout(async () => {
    const texto = this.value.trim();
    if (texto === "") return window.location.reload();
    await buscarTareas(texto);
  }, 300);
});

btnLimpiar.addEventListener("click", function () {
  inputBusqueda.value = "";
  mensajeBusqueda.classList.add("hidden");
  window.location.reload();
});

async function buscarTareas(texto) {
  try {
    const data = await fetchWithErrorHandling(
      `/tareas/buscar?texto=${encodeURIComponent(texto)}`
    );
    const tareas = data.tareas || [];

    if (tareas.length === 0) {
      mensajeBusqueda.textContent = "No se encontraron tareas con ese título";
      mensajeBusqueda.classList.remove("hidden");
      mostrarTareasEnListado([], {}, {}, {});
    } else {
      mensajeBusqueda.classList.add("hidden");
      mostrarTareasEnListado(
        tareas,
        data.recordatorioFormat,
        data.estadoVisual,
        data.recordatorioProximo
      );
    }
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

function mostrarTareasEnListado(
  tareas,
  recordatorioFormat,
  estadoVisual,
  recordatorioProximo
) {
  const seccionListado = document.querySelector(
    "section.bg-white.rounded-lg.shadow-md.p-6:last-of-type"
  );
  let contenedor = seccionListado.querySelector(".space-y-4");

  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.className = "space-y-4";
    seccionListado.appendChild(contenedor);
  }

  if (!tareas || tareas.length === 0) {
    contenedor.innerHTML =
      '<p class="text-center text-gray-500 italic">No hay tareas que coincidan con tu búsqueda.</p>';
    return;
  }

  contenedor.innerHTML = tareas
    .map((tarea) => {
      let estadoClass = "";
      switch (tarea.estado) {
        case "COMPLETADA":
          estadoClass = "bg-green-100 text-green-800";
          break;
        case "PENDIENTE":
          estadoClass = "bg-red-100 text-red-800";
          break;
        case "EN_PROGRESO":
          estadoClass = "bg-yellow-100 text-yellow-800";
          break;
      }

      // Recordatorios
      let tieneRecordatorio = recordatorioFormat[tarea.id] != null;
      let textoRecordatorio = recordatorioFormat[tarea.id] || "";
      let esProximo = recordatorioProximo[tarea.id] === true;
      let claseRecordatorio = esProximo
        ? "bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full"
        : "bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full";

      return `
    <div class="bg-white shadow-md rounded-lg p-4 border border-gray-200 ${
      tarea.estado === "COMPLETADA" ? "opacity-60 line-through" : ""
    }">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-800">${tarea.titulo}</h3>
          <p class="text-gray-600 text-sm mt-1">${tarea.descripcion ?? ""}</p>
          <p class="text-xs text-gray-500 mt-2">${
            tarea.fechaVencimiento ?? ""
          }</p>

          ${
            tieneRecordatorio
              ? `<span class="${claseRecordatorio}">⏰ ${textoRecordatorio}</span>`
              : ""
          }
        </div>

        <div class="flex flex-col items-end space-y-2 ml-4">
          <form action="/tareas/${tarea.id}/estado" method="post">
            <select name="estado" onchange="this.form.submit()"
              class="px-2 py-1 border rounded text-sm ${estadoClass}">
              <option value="PENDIENTE" ${
                tarea.estado === "PENDIENTE" ? "selected" : ""
              }>Pendiente</option>
              <option value="EN_PROGRESO" ${
                tarea.estado === "EN_PROGRESO" ? "selected" : ""
              }>En Progreso</option>
              <option value="COMPLETADA" ${
                tarea.estado === "COMPLETADA" ? "selected" : ""
              }>Completada</option>
            </select>
          </form>

          <div class="flex space-x-2">
            <button type="button" class="edit-btn bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded shadow"
              data-id="${tarea.id}" data-titulo="${
        tarea.titulo
      }" data-descripcion="${tarea.descripcion}" data-fecha="${
        tarea.fechaVencimiento
      }">
              Editar
            </button>

            <form action="/eliminar" method="post" onsubmit="return confirm('¿Estás seguro de que deseas eliminar esta tarea?')">
              <input type="hidden" name="id" value="${tarea.id}">
              <button type="submit" class="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded shadow">Eliminar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    `;
    }).join("");
  activarBotonesEditar();
}

function activarBotonesEditar() {
  const botones = document.querySelectorAll(".edit-btn");
  if (!botones) return;

  botones.forEach((boton) => {
    boton.removeEventListener &&
      boton.removeEventListener("click", boton._editHandler); // limpiar si existiera

    const handler = () => {
      // Usar los IDs reales que tienes en el modal (según tu HTML original)
      const campoId = document.getElementById("id"); // hidden input del modal
      const campoTitulo = document.getElementById("titulo");
      const campoDescripcion = document.getElementById("descripcion");
      const campoFecha = document.getElementById("fechaVencimiento");
      const campoRecordatorio = document.getElementById("recordatorio");

      // Seguridad: si no existen, abortar y loggear para debug
      if (!campoId || !campoTitulo || !campoDescripcion || !campoFecha) {
        console.warn(
          "Campos del modal no encontrados. Revisa los IDs del modal (id, titulo, descripcion, fechaVencimiento)."
        );
        return;
      }

      // Poblar valores desde data-*
      campoId.value = boton.dataset.id ?? "";
      campoTitulo.value = boton.dataset.titulo ?? "";
      campoDescripcion.value = boton.dataset.descripcion ?? "";
      campoFecha.value = boton.dataset.fecha ?? "";
      if (campoRecordatorio)
        campoRecordatorio.value = boton.dataset.recordatorio ?? "";

      // mostrar modal (según tu implementación)
      const modal = document.getElementById("modal-editar");
      if (modal) modal.classList.remove("hidden");
    };

    // guardar referencia para poder remover en futuras rebinds
    boton._editHandler = handler;
    boton.addEventListener("click", handler);
  });
}
