# Refonte NUNU — ce qui a changé

Stack inchangée : React 18 + TypeScript + Vite, état local dans `src/state/store.tsx`, PWA.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## 1. Logo
Nouveau composant `src/components/Logo.tsx` (lit `public/icons/logo-mark.png`).
Présent sur : login, en-tête d'accueil, splash de lancement et de retour au premier plan
(`ResumeOverlay` dans `Overlays.tsx`), carte de récompense, carte de palier partageable, profil.

## 2. Login neutre
`src/screens/Login.tsx` réécrit : logo, **Prénom** et **Nom d'utilisateur** (gamertag,
normalisé en minuscules sans espaces). Aucune authentification, aucun backend :
`IDENTITY` initialise le profil localement. C'est le premier écran à la première ouverture.

## 3. Validation instantanée
Règle : `rarityOfBoard()` dans `src/data/quests.ts` — palier majeur → **légendaire**,
sinon ≥ 50 PX → **rare**, sinon **commune**.
- commune / rare → `VALIDATE` dispatché directement au tap (confettis, haptique, son conservés).
- légendaire → `Validate.tsx`, avec étapes cochées **et photo obligatoire**.

La règle est expliquée dans un bloc dépliable en haut de l'onglet Plateau (ouvert par défaut
tant que `seen.questHelp` est faux).

## 4. Dock de navigation
`--dock-space` / `--dock-space-cta` (dans `index.css`) réservent la hauteur du dock + la
safe-area sous le contenu ; `App.tsx` applique `--dock-space` au `<main>`, et l'écran Quêtes
ajoute une marge supplémentaire quand le bouton flottant « Valider » est affiché.
Le dock a désormais une hauteur explicite, plus rien ne passe dessous.

## 5. Deux monnaies
`GameState` ne contient plus que **`px`** (progression) et **`coins`** (cosmétique).
Supprimés : `lp`, `pal`, `div`, `streak`, `lastDay`.

**Niveau global 1 → 999** : agrégat de tous les PX, courbe qui s'aplatit —
`pxForLevel(n) = 50 × (n−1)^1.35` (`src/data/ranks.ts`). Affiché sur l'accueil et le profil.

**Streak** : remplacé par l'état **« en feu »**, sans compteur dédié — juste un badge
discret sur l'accueil, le profil et l'écran Quêtes.

## 6. Rangs par compétence
`src/data/ranks.ts` : Fer, Bronze, Argent, Or, Platine, Émeraude, Diamant (4 divisions IV→I
chacun), puis Maître, Grand Maître, Challenger. Coût d'une division : 100 PX en Fer jusqu'à
460 PX en Diamant ; 2 000 PX pour Maître, 3 000 pour Grand Maître.
Les PX gagnés sur une compétence font progresser **le rang de cette compétence**.
Affichés sur l'accueil, le sélecteur de compétence, le profil et l'écran de chemin.

## 7. Énergie inversée
Chaque quête validée **remplit** la jauge (+10 à +34 selon la taille de la quête).
À 100 % → **en feu** : PX **×2**. Chaque quête validée en feu consomme 25 % de la jauge ;
à zéro, l'état s'arrête. Sans aucune validation pendant **24 h**, la jauge retombe à zéro
(`decayed()` dans `store.tsx`, appliqué à l'hydratation et à chaque validation).

## 8. Ligue supprimée
`screens/League.tsx` supprimé, onglet retiré du `TabBar` (4 onglets), action `LP` retirée,
`LEAGUES` remplacé par `FRIENDS_RANK` (simple comparaison entre amis).
Duels et quiz conservés : l'enjeu d'un duel est désormais en **PX** (gain = mise, consolation
= 25 % de la mise) plus 40 pièces en cas de victoire.

## 9. Onboarding
`src/screens/Onboarding.tsx`, affiché une seule fois (`seen.onboarding`) juste après le login :
choix d'**un** skill de départ (PERSO reste toujours actif). `START_SKILL` crée
automatiquement un premier palier commun à 15 PX, validable en un tap.

## 10. Chemin de progression
Nouvelle route `path` (`src/screens/routes/Path.tsx`) : rang courant, PX dans le rang,
PX restants avant le rang suivant, puis la ligne verticale des paliers (validé / en cours /
à venir) avec leur rareté. Accessible depuis les cartes de compétence de l'accueil,
le bouton « Voir le chemin » de l'écran Quêtes et la liste des rangs du profil.

## 11. Carte de palier partageable
`src/components/ShareCard.tsx` : image 1080 × 1350 générée sur canvas (logo, titre du palier,
rang atteint, compétence, PX, gamertag) proposée après chaque palier légendaire **ou** chaque
montée de rang, via le bouton « Créer ma carte » de l'overlay de récompense.
Partage natif (Web Share API avec fichier) quand il est disponible, téléchargement PNG sinon.

## Persistance
Clé `nunu.save.v2`, `SAVE_VERSION = 2`. L'ancienne clé `nunu.save.v1` est supprimée au
chargement et toute sauvegarde d'une autre version est ignorée : repart d'un état propre.
