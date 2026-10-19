# Release notes in three languages

Knowledge work benchmark · Nightshift 1.3.0 · Sep 28, 2026 · Localization · job `job_mul0ksnu0h`

**[Replay this night in 3D ↗](https://meterless.ai/Benchmarks/KnowledgeWork/nights/D14-localized-release-notes_1.3.0/index.html)** · [Read it on the Morning Desk ↗](https://meterless.ai/Benchmarks/KnowledgeWork/) · [All examples](README.md)

> Customer release notes in English, Mexican Spanish and German, localized rather than translated.

| Judge score | Winning model | Drafts raced | Drafts judged | Unattended | Words |
|---|---|---:|---:|---:|---:|
| 0.92 | Qwen3.8 27B | 3 | 3 | 20 min | 448 |

**Verified against the answer key**

- English, Spanish (Mexico) and German, each under 220 words
- "Smart Waitlist" kept in English as the UI requires; "cita" in Spanish
- Every fact carried: 40% faster, 24 h (was 48 h), SSO and CSV fixes

**Proofs passed:** complete, not cut off; every language present.

### The race

| Attempt | Lane | Model | Started | Finished | Tokens | Passed proofs | Judge | Kept |
|---:|---|---|---:|---:|---:|---|---:|---|
| 1 | router | MiniCPM5 1B | 0 min | 2.8 min | 571 | yes | 0.18 |  |
| 4 | generalist | Qwen2.5 14B | 0 min | 3 min | 753 | yes | 0.72 |  |
| 6 | vision | Qwen3.8 27B | 0 min | 19.2 min | 800 | yes | 0.92 | **winner** |

<details><summary>The brief it answered, verbatim</summary>

```text
Write customer-facing release notes for version 4.18 of our clinic-scheduling product, in English first, then the same notes localized (not word-for-word translated) for Spanish (Mexico) and German (Germany) customers. Keep each version under 220 words, with a short intro line and grouped bullets: New · Improved · Fixed. Keep product/UI names in English where the UI is not localized (the UI is localized in Spanish and German except for "Smart Waitlist").

CHANGES (internal notes)
- NEW: Smart Waitlist — when an appointment is cancelled, the next matching patient on the waitlist gets an SMS offer; first to confirm gets the slot. Admins enable it per location. Off by default.
- IMPROVED: Calendar week view loads about 40% faster for clinics with more than 20 practitioners (internal benchmark).
- IMPROVED: Patients can now reschedule from the reminder SMS up to 24 h before the appointment (was 48 h).
- FIXED: SSO sessions no longer time out after 15 minutes of inactivity when "remember me" is on.
- FIXED: Exported CSV used US date format for all locales; it now follows the clinic's locale.
Do not mention internal ticket numbers. Use the formal register in German (Sie). Use "cita" for appointment in Spanish.
```

</details>

---

## The winning deliverable, verbatim

<!-- Copied unmodified from the published job. Model output keeps its own punctuation and any dates it invented. -->

**Release Notes: Version 4.18**

We are excited to introduce smarter scheduling tools and performance enhancements in this update.

**New**
*   **Smart Waitlist**: Automatically offer open slots to the next matching patient via SMS when an appointment is cancelled. The first person to confirm secures the time. Admins can enable this feature per location. It is currently disabled by default.

**Improved**
*   **Calendar Performance**: The week view now loads approximately 40% faster for clinics with more than 20 practitioners.
*   **Rescheduling Flexibility**: Patients can now reschedule directly from reminder SMS messages up to 24 hours before their appointment, previously 48 hours.

**Fixed**
*   **SSO Sessions**: Resolved an issue where Single Sign-On sessions would time out after 15 minutes of inactivity when "remember me" was enabled.
*   **CSV Export**: Date formats in exported CSV files now correctly follow the clinic’s selected locale, rather than defaulting to US format.

***

**Notas de la versión: 4.18**

Nos complace presentar herramientas de programación más inteligentes y mejoras de rendimiento en esta actualización.

**Nuevo**
*   **Smart Waitlist**: Ofrece automáticamente las citas liberadas al siguiente paciente compatible mediante SMS cuando se cancela una cita. El primero en confirmar asegura el horario. Los administradores pueden activar esta función por ubicación. Está desactivada por defecto.

**Mejorado**
*   **Rendimiento del calendario**: La vista semanal ahora se carga un 40% más rápido para clínicas con más de 20 profesionales.
*   **Flexibilidad de reprogramación**: Los pacientes ahora pueden reprogramar directamente desde el SMS de recordatorio hasta 24 horas antes de su cita, antes era 48 horas.

**Corregido**
*   **Sesiones SSO**: Se resolvió un problema donde las sesiones de inicio único se cerraban tras 15 minutos de inactividad con la opción "recordarme" activada.
*   **Exportación CSV**: Los formatos de fecha en los archivos CSV exportados ahora siguen correctamente la configuración regional de la clínica, en lugar de usar el formato de EE. UU. por defecto.

***

**Release Notes: Version 4.18**

Wir freuen uns, Ihnen in diesem Update intelligentere Planungstools und Leistungsoptimierungen vorstellen zu dürfen.

**Neu**
*   **Smart Waitlist**: Bietet automatisch den nächsten passenden Patienten per SMS einen freien Termin an, wenn eine Terminabsage erfolgt. Der erste Bestätigende sichert sich den Slot. Administratoren können diese Funktion pro Standort aktivieren. Standardmäßig ist sie deaktiviert.

**Verbessert**
*   **Kalenderleistung**: Die Wochenansicht lädt für Kliniken mit mehr als 20 Fachkräften nun etwa 40 % schneller.
*   **Terminverschiebung**: Patienten können Termine jetzt direkt über die SMS-Erinnerung bis zu 24 Stunden vor dem Termin verschieben (zuvor 48 Stunden).

**Behoben**
*   **SSO-Sitzungen**: Ein Problem wurde behoben, bei dem sich SSO-Sitzungen nach 15 Minuten Inaktivität schlossen, wenn „Angemeldet bleiben“ aktiviert war.
*   **CSV-Export**: Datumsformate in exportierten CSV-Dateien folgen nun korrekt der Standardeinstellung der Klinik, anstatt standardmäßig das US-Format zu verwenden.
