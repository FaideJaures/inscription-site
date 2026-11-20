# MBAYA CODE CONTEST — édition 2026

Site d'inscription de la 4ᵉ édition : accueil avec compteurs en direct, photos des éditions
passées, partenaires et écoles, règlement, FAQ, inscription solo ou en équipe en plusieurs étapes
et espace organisateurs. Thème clair ou sombre, au choix du visiteur.

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis renseigner MONGODB_URI
npm run dev                   # http://localhost:3000
```

## Ce qui change d'une édition à l'autre

Tout est dans `app/lib/contest.ts` :

- `EDITION`, `YEAR` — numéro et année ;
- `EVENT_DATE` — date de la finale (`"2026-12-12"`), `null` tant qu'elle n'est pas fixée
  (le site affiche alors « Date annoncée prochainement ») ;
- `REGISTRATION_OPEN` — `false` ferme le formulaire et l'API ;
- `CONTACT_PHONE`, `PARTNERS`, `SCHOOLS`, `PAST_EDITIONS`.

## Pages

| Route | Rôle |
| --- | --- |
| `/` | Accueil : compteurs en direct, principe, déroulement, éditions passées, partenaires, FAQ |
| `/inscription` | Choix solo / équipe, puis formulaire sur une seule page (équipe, membres, projet, règlement et envoi) |
| `/inscription/merci` | Confirmation |
| `/conditions` | Règlement (13 articles, retranscrits du document original, consultable aussi) |
| `/galerie` | Toutes les photos des éditions 1 et 2 |
| `/faq` | Questions fréquentes |
| `/admin` | Espace organisateurs : statistiques, recherche, détail, export CSV, archive 2025 |

## Données

- Les nouvelles inscriptions vont dans la collection `registrations`, avec un champ `edition`.
  Une adresse e-mail est unique **par édition** (l'ancienne collection `users` imposait l'unicité
  globale, ce qui empêchait un candidat 2025 de se réinscrire).
- Les comptes admin restent dans `users` (`role: "admin"`, mot de passe bcrypt) : les comptes
  existants fonctionnent tels quels. Pour en créer un :

  ```bash
  MONGODB_URI=... npm run create-admin -- admin@exemple.com "mot-de-passe-solide"
  ```

- Les inscriptions 2025 (collection `users`, `role: "user"`) restent lisibles dans l'admin,
  onglet « Archive 2025 ».

## API

- `POST /api/register` — validation côté serveur (mêmes règles que le formulaire,
  `app/lib/registration.ts`), refus si une adresse est déjà inscrite à l'édition.
- `GET /api/stats` — compteurs agrégés publics (aucune donnée personnelle).
- `POST /api/admin/registrations` — identifiants dans le corps de la requête, plus dans l'URL.

## Styles

Les feuilles de style sont dans `app/styles/` : `tokens.css` (couleurs et polices, thèmes clair et sombre),
`base.css`, `buttons.css`, puis une feuille par zone (`header`, `home`, `form`, `gallery`, `rules`,
`admin`, `footer`). Elles sont importées dans `app/layout.tsx`.
