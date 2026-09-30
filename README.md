# Libreta

App de finanzas personales: gastos del día, ocio semanal, cuotas de tarjeta, pesos y dólares, metas y proyección de ahorro.

- La app se publica con GitHub Pages desde esta carpeta.
- Los datos viven en Firebase (Firestore) y solo los puede leer tu usuario, según `firestore.rules`.
- `firebase-config.js` tiene la configuración pública de tu proyecto de Firebase. No es una clave secreta: la seguridad la dan las reglas.
