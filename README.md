A continuación, se presenta el enlace al prototipo funcional deployado:

🔗 **Sistema en Producción / Preproducción:**
[https://tis-sis2025.vercel.app/](https://tis-sis2025.vercel.app/)

El prototipo permite probar la mayoría de las funcionalidades implementadas en esta etapa.

---

# 🧩 **Código Fuente**

🔹 **Repositorio Frontend:**
[https://github.com/MaiteSuA/Tis_Sis2025](https://github.com/MaiteSuA/Tis_Sis2025)

🔹 **Repositorio Backend:**
[https://github.com/Domis382/Tis_Sis2025_Back](https://github.com/Domis382/Tis_Sis2025_Back)

---

# 🔐 **Credenciales de Prueba**

### 🛠 Administrador

* **Usuario:** `juan.perez@sis.example.com`
* **Contraseña:** `12345678`

### 🎛 Coordinador

* **Usuario:** `naviaeddy@gmail.com`
* **Contraseña:** `nueva123$$`

### 🧪 Evaluador

* **Usuario:** `evaluador_2@demo.com`
* **Contraseña:** `EVAL_2_NO_PASSWORD`

### 🗂 Responsable de Área

* **Usuario:** `correo@gmail.com`
* **Contraseña:** `123456`

---

# 📘 **3. Cumplimiento de Requerimientos**

## ✅ **3.1 Requerimientos Críticos**

| ID    | Requerimiento Crítico                                       | Implementado (Sí/No) | Evidencia                                                | Comentario                                                     |
| ----- | ----------------------------------------------------------- | -------------------- | -------------------------------------------------------- | -------------------------------------------------------------- |
| RC-01 | Tener una cuenta de Administrador                           | **Sí**               | Usuario: `juan.perez@sis.example.com` / Pass: `12345678` | Credenciales del administrador                                 |
| RC-02 | El Administrador crea la(s) gestión(es)                     | **No**               | —                                                        | —                                                              |
| RC-03 | El Administrador crea las áreas de competición              | **Sí**               | —                                                        | —                                                              |
| RC-04 | El Administrador crea al Coordinador                        | **Sí**               | —                                                        | —                                                              |
| RC-05 | Configurar puntuaciones mínimas por área                    | **Sí**               | —                                                        | Se parametrizó una nota mínima de clasificación general        |
| RC-06 | Coordinador/Administrador crea responsables de área         | **Sí**               | —                                                        | —                                                              |
| RC-07 | Responsables crean evaluadores                              | **Sí**               | —                                                        | El responsable solo crea evaluadores de su área                |
| RC-08 | Vista previa CSV + asignación de competidores a evaluadores | **Sí**               | —                                                        | Coordinador filtra, previsualiza y asigna inscritos            |
| RC-09 | Evaluadores evalúan competidores asignados                  | **Sí**               | —                                                        | Registro de evaluaciones en BDD                                |
| RC-10 | Evaluadores envían listas evaluadas a responsables          | **Sí**               | —                                                        | Evaluaciones guardadas y recuperadas desde BDD                 |
| RC-11 | Responsables revisan evaluaciones y generan clasificados    | **Sí**               | —                                                        | Filtro para exportar únicamente clasificados                   |
| RC-12 | Publicación/exportación de listas de clasificados           | **Sí**               | —                                                        | Se muestra en la homepage                                      |
| RC-13 | Competidores ven resultados de clasificación sin login      | **Sí**               | —                                                        | Acceso libre desde homepage                                    |
| RC-14 | Administrador habilita fase final                           | **Sí**               | —                                                        | Actualiza roles mediante hook en frontend                      |
| RC-15 | Configuración de puntajes y medallero                       | **Sí**               | —                                                        | Funciona localmente; se replanteó el modelo                    |
| RC-16 | Coordinador reasigna clasificados a evaluadores             | **No**               | —                                                        | Vista de clasificados disponible, faltan detalles              |
| RC-17 | Evaluadores evalúan clasificados asignados                  | **No**               | —                                                        | Se verá en la sección del evaluador cuando exista reasignación |
| RC-18 | Responsables generan listas de ganadores                    | **No**               | —                                                        | Falta exportación final                                        |
| RC-19 | Responsables publican/exportan ganadores                    | **No**               | —                                                        | Publicación hecha; falta exportación de ganadores              |
| RC-20 | Competidores ven resultados de fase final sin login         | **Sí**               | —                                                        | Homepage enlaza al Medallero sin restricciones                 |

---

## ⭐ **3.2 Requerimientos Deseables**

| ID    | Requerimiento Deseable                        | Implementado (Sí/No) | Evidencia | Comentario                                                                                                              |
| ----- | --------------------------------------------- | -------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------- |
| RD-01 | Interfaces responsivas móviles                | **No**               | —         | —                                                                                                                       |
| RD-02 | Cambiar contraseña                            | **No**               | —         | —                                                                                                                       |
| RD-03 | Recuperación de contraseña                    | **Sí**               | —         | Modal de login con “Recuperar contraseña”; usa OTP enviado por correo. Usuario puede cambiar contraseña inmediatamente. |
| RD-04 | Email indicando clasificación/resultado final | **No**               | —         | —                                                                                                                       |

---
