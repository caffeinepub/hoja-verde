# Hoja Verde

## Current State
El backend requiere permisos de `#admin` para eliminar gastos, ingresos, facturas, cotizaciones, prospectos y trabajos. El usuario normal solo tiene permiso `#user`, por lo que al intentar eliminar cualquiera de estos registros recibe un error de autorización.

## Requested Changes (Diff)

### Add
- Nada nuevo.

### Modify
- Cambiar permiso requerido de `#admin` a `#user` en las funciones: `deleteFinancialEntry`, `deleteInvoice`, `deleteQuote`, `deleteJob`, `deleteProspect`.

### Remove
- Nada.

## Implementation Plan
1. Actualizar `src/backend/main.mo`: cambiar las verificaciones de permiso en las 5 funciones de eliminación de `#admin` a `#user`.
