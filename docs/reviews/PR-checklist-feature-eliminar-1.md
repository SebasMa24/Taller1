# Checklist de Revisión de Código - PR #<7>

**Título del PR: Feature/eliminar**  
**Autor/a: Luis Miguel Polo**  
**Revisores/as: Luis Sebastian Martinez Guerrero y Miguel Angel Veloza**  
**Fecha de revisión:25/09/2025**  

---

## 1. Criterios de Aceptación

- [x] Se cumple el flujo principal de la historia de usuario.
- [x] Se manejan casos borde (entrada vacía, no encontrada, errores).
- [x] La funcionalidad cumple con la definición de “Hecho” (DoD).

> Observaciones:  
> Caso borde no contemplado: entrada vacía

## 2. Legibilidad y Mantenibilidad

- [x] Nombres de variables y funciones claros y consistentes.
- [x] Funciones concisas y bien estructuradas.
- [ ] Comentarios solo donde agreguen valor.
- [x] Código modular organizado correctamente (`src/`).

> Observaciones:  
> No hay codigo comentado

## 3. Evidencias y Pruebas

- [x] Incluye al menos una prueba ejecutable en `/tests`.
- [ ] Evidencia adjunta (captura o video en la descripción del PR).
- [x] Todas las pruebas pasan correctamente.

> Observaciones:  
> Dado que se ejecuta una prueba estatica no es necesario adjuntar una evidencia.

## 4. GitHub Actions

- [ ] Workflow de `Static Analysis` ejecutado correctamente.
- [ ] El PR muestra el check en verde antes del merge.

> Observaciones:  
> El workflow fallo ya que encontro 1 Security Hostspot.

## 5. Resumen y Decisión

**Estado final del PR:**  

- [ ] Mergeado  
- [x] Cambios solicitados  

**Comentarios finales:**
>
> - Usar @RequestMapping no es optimo, ya que permite que el mismo endpoint tenga varios http methods, por lo que es una brecha de seguridad detectada en SonarQube, es mejor usar @PostMapping o @DeleteMapping
> - Realizar la validación basica de que al menos ese registro existe antes de eliminarlo, asi como esta sirve desde el frontend pero si usamos postman para probar el backend puede fallar en ese caso.
> - Jamas editar el archivo application.properties, ya que al hacer el merge cambia en la rama principal.
Dejar tal y como estaba, implementar un .env personal donde este esa información de la base de datos.
>

## 6. Defectos detectados

| ID       | Archivo        | Línea | Tipo       | Severidad | Estado    |
|----------|----------------|-------|------------|-----------|-----------|
| DEF-001  | TareaController.java  | 44 | Seguridad     | Alta | PENDIENTE |
| DEF-002  | TareaService.java  | 50 | Validación     | Media | PENDIENTE |
| DEF-003  | application.properties  | 5-7 | Configuración     | Media | PENDIENTE |

> Detalle completo en `docs/defects.csv`
