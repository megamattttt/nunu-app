# NUNU

> Tes compétences deviennent un plateau de jeu. Une quête, une preuve, un palier.

Application web mobile-first (PWA installable) construite en **React + Vite + TypeScript**.
Reprise fidèle de la direction artistique du prototype **v13** : Bricolage Grotesque / DM Sans / JetBrains Mono,
palette encre + lime + violet + corail + miel, avatar et diorama en papier découpé.

---

## Démarrer

```bash
npm install
npm run dev        # http://localhost:5173 (accessible aussi depuis le téléphone sur le même Wi-Fi)
npm run build      # génère dist/
npm run preview    # sert dist/ en local
npm run typecheck  # vérification TypeScript
```

Node 18+ recommandé.

### Tester sur iPhone en local
`npm run dev` écoute sur le réseau (`host: true`). Ouvre `http://<ip-de-ton-mac>:5173` depuis Safari iOS.
Le service worker n'est actif qu'en production (`npm run build && npm run preview`).

---

## Structure

```
public/
  manifest.webmanifest   manifeste PWA
  sw.js                  service worker (cache statique + navigation hors-ligne)
  icons/                 jeu d'icônes généré depuis LOGO NUNU.png
src/
  main.tsx               point d'entrée + enregistrement du service worker
  App.tsx                coquille : onglets, pile d'écrans secondaires, overlays
  index.css              reset, variables, safe areas, keyframes
  theme.ts               jetons de design (couleurs, typos, rayons)
  data/                  contenu du jeu (compétences, plateaux, quêtes, quiz, boutique, avatar, diorama)
  state/
    types.ts             modèle de données
    initial.ts           sauvegarde initiale
    persistence.ts       couche de données isolée (LocalAdapter -> Supabase/API plus tard)
    store.tsx            reducer + contexte + sauvegarde auto + effets de récompense
    selectors.ts         dérivés (niveau, plateau, quête du jour, pourcentages…)
  lib/                   haptique, sons WebAudio, confettis canvas, swipe, parseur CSS
  components/            UI partagée, barre d'onglets, overlays, avatar, diorama
  screens/               Accueil, Quêtes, Défis, Ligue, Profil
  screens/routes/        pioche, création, validation, mur, boutique, avatar, diorama, bannière, quiz
```

### Couche de données
Toute la persistance passe par `DataAdapter` (`src/state/persistence.ts`).
Aujourd'hui `LocalAdapter` (localStorage, clé `nunu.save.v1`), sauvegarde débouncée à chaque changement d'état.
Pour brancher Supabase ou une API : écrire un adaptateur avec les mêmes méthodes `load / save / clear` et
remplacer l'export `adapter`. Les signatures sont déjà asynchrones, rien d'autre à changer dans l'app.

---

## Fonctionnalités

**Plateau de compétences** — six compétences (couture, course, photo, cuisine, jardin, perso), PX,
paliers ordonnés, paliers majeurs mis en scène, niveaux, badges et titres débloqués par progression.

**Quêtes** — pioche par glissé (swipe, retour haptique, quêtes rares et légendaires, bonus surprise),
création de quête personnalisée (nom, compétence, énergie, moment de la journée),
validation en étapes avec chronomètre, preuve photo (appareil du téléphone), note, ressenti,
confirmation par un témoin (+20 % de PX), animation de récompense avec compteur et confettis.

**Perso** — tâches du quotidien qui rechargent la barre d'énergie, ajout rapide, aucune comparaison.

**Défis** — invitations reçues, duels en cours, duel éclair, quiz chronométré (4 questions, 10 s),
résultat qui ajuste les LP, les pièces et l'historique.

**Ligue** — amis / locale / mondiale, podium, division et palier, montée et descente automatiques
quand les LP franchissent 100 ou passent sous zéro.

**Mur** — fil d'activité, likes, commentaires, publication (récompensée en PX et pièces).

**Profil** — bannière personnalisable (titre, citation, épinglés, message), journal, diorama papier découpé
avec objets déplaçables au doigt, murs / sols / lumières interchangeables, inventaire,
studio avatar (27 catégories, options verrouillées par niveau de compétence), boutique, réglages.

**Sensations** — vibrations (API Vibration), sons de validation synthétisés (WebAudio, désactivés par défaut),
confettis canvas, micro-échelle au toucher, respect de `prefers-reduced-motion`.

---

## Ajouté par rapport au prototype v13

- Progression **persistante** (localStorage) derrière une couche de données remplaçable.
- **Série (streak)** calculée sur les jours réels d'activité, pas une valeur figée.
- **Raretés de quêtes** (commune / rare / légendaire) avec multiplicateur de PX et bonus surprise à la pioche.
- **Swipe réel** au doigt sur la pioche : suivi du geste, seuil, intention affichée, retour haptique.
- **Validation complète** : chronomètre, preuve photo depuis l'appareil, note libre, ressenti en trois axes,
  témoin qui applique réellement le bonus de 20 %.
- **Quiz de duel jouable** : minuterie par question, score adverse, LP et pièces mis à jour, historique des duels.
- **Ligue dynamique** : montées et descentes de division calculées à partir des LP.
- **Commentaires** et publication réels sur le mur, avec récompense.
- **Diorama éditable** au doigt (déplacement, rangement, inventaire, remise à zéro).
- **Options d'avatar verrouillées** par niveau de compétence, avec message expliquant le palier requis.
- **Réglages** : vibrations, sons, confettis, réinitialisation de la progression.
- **États vides** partout où une liste peut être vide.
- **PWA** : manifeste, jeu d'icônes complet, icône maskable, service worker, méta iOS.
- Accessibilité mobile : cibles ≥ 44 px, champs à 16 px (pas de zoom Safari), safe areas, `100dvh`,
  pas de rebond de page, navigation basse atteignable au pouce.

---

## Installer la PWA

**iPhone (Safari)** — ouvrir le site, bouton Partager, « Sur l'écran d'accueil », Ajouter.
L'app se lance ensuite en plein écran, sans barre Safari, avec l'icône NUNU.

**Android (Chrome)** — menu ⋮, « Installer l'application » (ou la bannière proposée automatiquement).

L'installation exige **HTTPS** (ou localhost). En local, faire `npm run build && npm run preview`.

---

## Déployer

**Vercel** — `vercel` puis suivre les questions ; framework détecté : Vite, commande `npm run build`, dossier `dist`.

**Netlify** — build `npm run build`, publish `dist`. Ajouter un fichier `_redirects` contenant
`/* /index.html 200` si tu passes à un routeur d'URL (l'app actuelle n'utilise pas d'URL par écran).

**GitHub Pages** —
```bash
npm run build
npx gh-pages -d dist
```
`base: './'` est déjà configuré, l'app fonctionne dans un sous-dossier.

---

## Pousser sur GitHub

```bash
cd nunu-app
git init
git add .
git commit -m "NUNU — application PWA (React + Vite)"
git branch -M main
git remote add origin git@github.com:<toi>/nunu-app.git
git push -u origin main
```

---

## Licence

Projet personnel. Le logo NUNU et le contenu éditorial appartiennent à leur autrice.
