# Acompanya'm – Prototipus funcional

Aquest projecte és un prototip funcional d’una aplicació per a la gestió i promoció de la donació de sang. A continuació es detallen les funcionalitats principals cobertes:

## Funcionalitats principals

- **Registre i autenticació d’usuaris**
  - Creació de nous comptes i inici de sessió segur.

- **Gestió de donacions**
  - Registre manual o per codi de noves donacions.
  - Consulta de l’historial de donacions personals.

- **Calendari d’esdeveniments**
  - Visualització i gestió de donacions, cites i altres esdeveniments.
  - Classificació per categories i recordatoris.

- **Perfil d’usuari**
  - Consulta i edició de dades personals.
  - Visualització d’assoliments, estadístiques i historial.

- **Notificacions**
  - Recepció de recordatoris, avisos d’assoliments i informació rellevant.
  - Gestió de notificacions i paperera.

- **Gestió de grups i xats**
  - Creació i gestió de grups de donació.
  - Comunicació entre usuaris mitjançant xat.

- **Premis i sorteigs**
  - Consulta del premi mensual i participació en el sorteig.
  - Visualització de resultats i historial de premis.

- **Configuració**
  - Ajust de preferències d’idioma, tema i notificacions.
  - Gestió de la seguretat i privadesa del compte.

- **Cercador de centres de donació**
  - Cerca d’hospitals i centres propers per donar sang.

- **Seccions informatives**
  - Recomanacions i passos previs a la donació.

## Estructura de les pantalles principals

- `index.html` – Inici i accés a l’aplicació.
- `login.html` / `register.html` – Autenticació i registre d’usuaris.
- `home.html` – Resum d’activitat i accés ràpid a funcionalitats.
- `registrar-donacio.html` – Registre de donacions.
- `calendari.html` – Gestió del calendari personal.
- `personalizacion.html` – Perfil d’usuari i estadístiques.
- `notificacions.html` – Gestió de notificacions.
- `xat.html` – Comunicació i grups.
- `prize.html` – Premis i sorteigs.
- `configuracio.html` – Preferències i configuració.
- `localitzacions.html` – Cerca de centres de donació.
- `abans-donar.html` – Informació prèvia a la donació.

## Requisits

- Navegador web.
- No requereix backend: totes les dades es gestionen en localStorage.