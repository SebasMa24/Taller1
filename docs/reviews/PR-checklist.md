# Checklist de Revisión de Código - PR #<#>

**Título del PR:**  
**Autor/a:**  
**Revisores/as:**  
**Fecha de revisión:**  

---

## 1. Criterios de Aceptación

- [ ] Se cumple el flujo principal de la historia de usuario.
- [ ] Se manejan casos borde (entrada vacía, no encontrada, errores).
- [ ] La funcionalidad cumple con la definición de “Hecho” (DoD).

> Observaciones:  
> _..._

---

## 2. Legibilidad y Mantenibilidad

- [ ] Nombres de variables y funciones claros y consistentes.
- [ ] Funciones concisas y bien estructuradas.
- [ ] Comentarios solo donde agreguen valor.
- [ ] Código modular organizado correctamente (`src/`).

> Observaciones:  
> _..._

---

## 3. Evidencias y Pruebas

- [ ] Incluye al menos una prueba ejecutable en `/tests`.
- [ ] Evidencia adjunta (captura o video en la descripción del PR).
- [ ] Todas las pruebas pasan correctamente.

> Observaciones:  
> _..._

---

## 4. GitHub Actions

- [ ] Workflow de `Static Analysis` ejecutado correctamente.
- [ ] El PR muestra el check en verde antes del merge.

> Observaciones:  
> _..._

---

## 5. Resumen y Decisión

**Estado final del PR:**  

- [ ] Mergeado  
- [ ] Cambios solicitados  

**Comentarios finales:**
> _..._

---

## 6. Defectos detectados

| ID       | Archivo        | Línea | Tipo       | Severidad | Estado    |
|----------|----------------|-------|------------|-----------|-----------|
| DEF-XXX  | _archivo.ext_  | _#_   | _tipo_     | _alta/media/baja_ | _ACEPTADO/RECHAZADO_ |

> Detalle completo en `docs/defects.csv`
