# Refonte NUNU — ce qui a changé

## Passe « structure & design » (dernière en date)

**Navigation — 3 onglets.** Accueil / Quêtes / Profil. L'onglet Défis devient une route ouverte
depuis le profil (`nav.open('duels')`), avec la pastille d'invitations reportée sur Profil.

**Accueil — en-tête compact.** Avatar rond + prénom + niveau + rang sur une seule ligne,
deux jauges fines (expérience, énergie) en dessous. La liste des rangs par compétence
n'est plus dupliquée ici : elle vit dans le profil.

**Mode focus.** Interrupteur en haut de l'accueil : ne reste que la quête du jour.
Choix mémorisé dans `localStorage` (`nunu.focus`).

**Combo remonté.** La chaîne en cours s'affiche sur l'accueil, plus seulement dans Quêtes.

**Quêtes — 3 sous-onglets.** Plateau / Journal / Collection.
Les quêtes ajoutées forment un bloc à part, réordonnable au doigt (`components/DragList.tsx`,
action `MOVE_QUEST`), avec tri par difficulté à la demande (`SORT_QUESTS`) et retrait (`DEL_QUEST`).
Les tâches du quotidien restent un bloc distinct, en bas du plateau.
Le classement des amis a rejoint l'écran Défis.

**Semaine et statistiques.** Nouvel historique horodaté dans l'état (`history`), alimenté par
chaque validation. Barres des 7 derniers jours (`components/WeekStrip.tsx`) sur l'accueil et le
profil, bilan complet dans `screens/routes/Week.tsx` : PX, série, meilleur jour, comparaison à la
semaine précédente, compétence la plus active, détail jour par jour, bouton de partage.

**Journal.** Champ de recherche sur les titres et les notes, en plus du filtre par compétence.

**Palette.** Accents désaturés (`lime` #B9DE64, `honey` #E8B863, `coral` #E2685A) et trois
nouvelles couleurs : `azur` #6FA5D8 (information), `iris` #9C8AD6 (rare), `teal` #5CBFAE (réussite).
Surfaces sombres étagées : `ink` / `night` / `slate` / `steel`, plus des filets `line`.
Couleurs de compétences, de rangs, de difficultés et de confettis alignées sur cette palette.


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


---

# Refonte NUNU — vague 2 (onboarding, dock, profil, accueil, quêtes)

## 1. Parcours de première connexion
Flow obligatoire, non-skippable, joué une seule fois. Piloté par `state.flow` (0..3),
clôturé par l'action `FINISH_FLOW` qui passe `seen.onboarding` à `true`.

`Login` → `FirstRun` :
| étape | `flow` | écran |
|---|---|---|
| 1 | 0 | `routes/AvatarStudio.tsx` (Studio Avatar complet, non simplifié, en mode `onDone`) |
| 2 | 1 | `screens/onboarding/Guide.tsx` — 5 slides au swipe |
| 3 | 2 | `screens/Onboarding.tsx` repris **tel quel** |
| 4 | 3 | `screens/onboarding/FirstQuest.tsx` — la vraie quête générée par `START_SKILL`, lue via `currentQuest()` |

- `START_SKILL` ne termine plus l'onboarding : il pousse `flow: 3`.
- `AvatarStudio` accepte désormais `onDone`, `ctaLabel`, `hideBack`, et `nav` est optionnel.
- Guide rejouable : route `guide` (rendue plein écran, hors `<main>`), accessible depuis
  Profil → Réglages → « Revoir le guide de démarrage ».
- `SAVE_VERSION` passe à 3 et la clé localStorage à `nunu.save.v3` : les sauvegardes v1/v2 sont effacées.

## 2. Logo
`public/icons/logo-mark.png` remplacé par le PNG transparent fourni (2000×2000, même nom,
`Logo.tsx` inchangé). Toutes les occurrences en héritent.

## 3. Dock (TabBar)
Le dock reste `position: fixed`. Corrections côté pages :
- `DioramaScene.tsx` : le conteneur crée un contexte d'empilement (`isolation: isolate; z-index: 0`),
  les objets déplaçables (z-index déduit de leur profondeur) ne peuvent plus passer au-dessus du dock.
- `AvatarStudio.tsx` : CTA « Enregistrer / Continuer » déplacé dans une barre fixe à
  `bottom: 0` avec `padding-bottom: calc(var(--dock-space) + 4px)`, et le panneau réserve
  `calc(var(--dock-space) + 78px)`.
- `Diorama.tsx` et `Quests.tsx` : `padding-bottom` en `var(--dock-space)` / `var(--dock-space-cta)`
  au lieu de valeurs en dur.
- Pendant le parcours de première connexion, `FirstRun` redéfinit `--dock-space` (pas de dock affiché).

Ordre d'empilement : dock 40 · CTA flottants 30-35 · toast 60 · récompense 70 · modale profil 80 · splash 90.

## 4. Profil
- Section « NIVEAU DE PERSONNAGE » : `/ 999` retiré, niveau en 54px, jauge pilule de 26px
  avec le pourcentage intégré dans le remplissage (et hors remplissage sous 24 %).
- Diorama : z-index corrigé (voir §3).
- « RÉGLAGES » devient un accordéon replié par défaut (`grid-template-rows: 0fr → 1fr`),
  qui regroupe les préférences, « Modifier le profil », « Revoir le guide » et la réinitialisation.
- Nouvelle modale `components/ProfileEdit.tsx` : prénom + gamertag, ouverte depuis le crayon
  près du header ou depuis les réglages.

## 5. Accueil
Nouveau header type overlay de personnage : avatar encadré avec pastille de niveau,
« SALUT, {prénom} » et `@gamertag` conservés, puis un panneau de statuts translucide
(barres EXPÉRIENCE et ÉNERGIE, badges rang / EN FEU ×2 / COMBO / pièces).
La carte « niveau global + énergie » qui vivait plus bas est supprimée — plus de doublon.

Pack d'animations commun : `nuRise` (apparition décalée des cases), `nuHalo` (halos discrets),
`nuGrad` (dégradé animé sur la quête du jour), `nuStat` (remplissage des jauges),
plus le micro-scale au tap déjà porté par `Tap`.

## 6. Quêtes
- **Combo** : `state.combo = { n, best, last }`. Deux validations à moins de 30 min s'enchaînent
  (`COMBO_WINDOW`). Bonus de PX +10 / +20 / +30 / +40 % aux paliers 3 / 5 / 10 / 20 (`comboBonus`).
  Barre de combo en tête de plateau avec chrono, meilleure chaîne, et badge sur le CTA flottant.
- **Validation** : coche instantanée, onde double (`nuBurst`), rature du titre (`nuStrike`),
  PX qui s'envolent (`nuFly`), puis la récompense s'ouvre 300 ms plus tard.
- **Son** : `sfx.check`, `sfx.combo(n)` (gamme qui monte d'un demi-ton par palier), `sfx.streak`.
- **Haptique** : patterns `combo` et `milestone` ajoutés ; `milestone` sur les paliers de combo
  et les montées de rang.

## Réglages de balance
| valeur | fichier |
|---|---|
| Fenêtre de combo (30 min) | `state/store.tsx` · `COMBO_WINDOW` |
| Paliers de combo | `state/store.tsx` · `COMBO_STEPS` |
| Bonus PX du combo | `state/store.tsx` · `comboBonus` |
| Multiplicateur « en feu » | `state/store.tsx` · `FIRE_MULT` |
| Coûts de rang | `data/ranks.ts` |


---

# Refonte NUNU — vague 3 (dock PWA, HUD, roue, journal)

## Bug du dock en PWA iOS — corrigé
Trois causes cumulées, toutes traitées :

1. `html, body, #root { height: 100% }` plafonnait la hauteur du document en mode
   standalone : le contenu débordait sans que la page puisse défiler jusqu'au bout.
   → `min-height: 100%` sur html/body, `min-height` + flex column sur `#root`.
2. L'espace du dock était calculé théoriquement (`--nav-h` + `env(safe-area-inset-bottom)`),
   valeur qui ne correspond pas à la hauteur réellement rendue en PWA installée.
   → `TabBar` mesure sa propre hauteur (`getBoundingClientRect`) et la publie dans
   `--dock-h` au montage, puis à chaque redimensionnement (`ResizeObserver`,
   `resize`, `orientationchange`, plus deux relances différées pour les safe areas
   qu'iOS met à jour après le passage en plein écran).
3. Plusieurs écrans réservaient l'espace deux fois (`<main>` + la page), d'autres
   pas du tout. → `<main>` est désormais le seul responsable de `--dock-space` ;
   les écrans n'ajoutent que ce qui leur est propre (barre d'action flottante).

`--dock-space = --dock-h + 24px`. `scroll-padding-bottom` global au même niveau.
Les modales (profil, journal) restent au-dessus du dock et réservent son espace
elles-mêmes puisqu'elles le recouvrent.

## Accueil — HUD façon fiche de personnage
Direction retenue : avatar grand format à gauche, jauges pilules à droite.
- Avatar **en pied** (`crop="full"`) dans un cadre 132×196, badge de niveau en surimpression,
  tap → Studio Avatar.
- Deux jauges pilules de 42 px, libellé et valeur intégrés dans la barre :
  EXPÉRIENCE et ÉNERGIE (qui devient « ÉNERGIE · ×2 » en corail quand tu es en feu).
- Sous les jauges, un bloc rang de la compétence principale + pièces.
- `SALUT, {prénom}` et `@gamertag` conservés, fond violet et formes organiques inchangés.
- Retirés du HUD à ta demande : logo, date, badge combo, badge « EN FEU » séparé
  (fondu dans la jauge d'énergie).

## Profil — personnage en pied
Le header passe en grille 128 px + reste : l'avatar s'affiche en entier dans un cadre
de 208 px de haut (couleur du cadre équipé conservée), légende « STUDIO AVATAR » en pied.

## Page Quêtes — sélecteur en roue
Nouveau composant `components/SkillWheel.tsx`, inspiré de ta référence :
- Dossiers à onglet, contenu qui dépasse (feuilles rangées à l'intérieur), gros format.
- Trois dossiers visibles, celui du centre nettement plus grand ; les voisins sont
  rognés par les bords.
- Disposition en arc : rotation autour d'un pivot virtuel à 430 px sous les cartes,
  26° entre deux dossiers.
- **Rotation au doigt sur l'arc de graduations** (41 traits, ceux du centre plus longs
  et lime). Le tap direct sur un dossier voisin marche aussi.
- La compétence en cours ouvre toujours la roue (`currentId`), les autres suivent.
- Le dossier **perso est blanc** ; les autres gardent leur couleur de compétence.

## Journal de progression
Nouveau modèle `JournalEntry` : compétence, palier (ou entrée libre), titre, note,
ressenti 0-4, difficulté 0-4, durée, photos, date.

**Ancrage mixte, comme demandé** : chaque palier validé crée automatiquement une entrée
vide, prête à être complétée ; on peut aussi en créer une quand on veut.

**Trois accès :**
| où | quoi |
|---|---|
| Page Quêtes, onglet JOURNAL | entrées de la compétence affichée + création |
| Ligne d'un palier validé | bouton appareil photo, coloré si l'entrée est remplie |
| Écran de récompense | bouton « DOCUMENTER CE PALIER » juste après la validation |
| Route `journal` (plein écran) | tout, groupé par mois, filtrable par compétence |

**Photos** : compressées avant stockage — redimensionnées à 1080 px sur le plus grand
côté, ré-encodées en JPEG qualité 0,62, 4 photos maximum par entrée
(`src/lib/photo.ts`, valeurs en tête de fichier). Tout reste sur l'appareil.

`SAVE_VERSION` passe à 4, clé `nunu.save.v4` : les sauvegardes précédentes sont effacées.

## Fichiers ajoutés
```
src/components/SkillWheel.tsx
src/components/JournalEditor.tsx
src/components/JournalCard.tsx
src/screens/routes/Journal.tsx
src/lib/photo.ts
```


---

# Passe rang / palette / quêtes

## Système de rang unique
- `src/data/rankIcons.ts` : un jeu d'icônes SVG (viewBox 24) par palier de `TIERS` — bouclier
  contour (Fer), chevrons (Bronze, Argent), bouclier plein étoilé (Or), gemmes à facettes
  (Platine, Émeraude, Diamant), couronne (Maître), couronne ailée (Grand Maître),
  étoile rayonnante (Challenger). Formes géométriques nettes, dans l'esprit d'`avatarEngine`.
- `src/components/RankIcon.tsx` : `<RankIcon />` (icône + indicatif de stade en points remplis,
  jamais le texte « III ») et `<RankBadge />` (icône + libellé + couleur du tier, tailles sm/md/lg).
- Réutilisés à l'identique : Accueil, Profil, Quêtes, Chemin, roue de compétences, et
  `ShareCard.tsx` (mêmes tracés redessinés en `Path2D` sur le canvas d'export).

## Accueil
- Gros badge de rang de la compétence principale à côté du bloc SALUT / pseudo — la puce la plus
  visible de l'en-tête ; les PIÈCES et le studio avatar passent dans le panneau de statuts.
- Avatar en **buste** (`crop="bust"`) dans un cadre carré, badge de niveau en bas à gauche.
- Badge de difficulté sur la carte « quête du jour ».

## Écran de montée de rang
`src/components/RankUpCard.tsx` : carte dédiée aux événements `kind: 'rang'` (tilt/parallax au
doigt, halo qui suit le geste, reflet qui traverse, grande icône de palier, entrée `nuRankIn`,
double salve de confettis, conseil du palier). Les validations simples et les paliers majeurs
restent sur `RewardOverlay`.

## Palette resserrée (`theme.ts`)
Trois accents + neutres : **lime** (progression / action), **honey** (récompense / validation),
**coral** (alerte / urgence, réservée au combo chaud et à l'état en feu), neutres
ink / night / slate / sand / paper. `violet`, `sky`, `purple`, `mint` sont conservés comme
alias pour ne rien casser mais retombent sur la palette. Couleurs de compétence, confettis,
raretés, cadres et tags du mur réalignés. Les couleurs de palier (`TIERS[].c`) restent
indépendantes : elles codent une information.

## Difficulté des quêtes
- `Difficulty` + `DIFFS` + `diffOfPx()` + `byDiff()` dans `data/quests.ts`, champ `diff` sur
  `CustomQuest` (`state/types.ts`) et sur `BoardRow`. Aucun verrouillage par rang.
- `components/DiffBadge.tsx` : libellé + jauge de segments, même traitement partout
  (plateau, chemin, pioche, création).
- Tri : les paliers de plateau gardent leur ordre de progression, les quêtes ajoutées
  (pioche, perso) sont triées par difficulté ; la pioche sert les quêtes accessibles d'abord.
- `data/tips.ts` : un conseil statique par palier, affiché sur le Profil, sur le Chemin,
  dans la carte de rang des Quêtes et sur l'écran de montée de rang.

## Quêtes perso
`NewQuest.tsx` : sélecteur de difficulté, PX proposés par difficulté, **suggestion automatique**
par mots-clés (`suggestQuest()`, mapping statique, aucun appel distant) applicable en un tap,
et champ **lien / tuto** sauvegardé avec la quête (`link`), rendu par un bouton « Voir le tuto »
sur la carte de quête (plateau et chemin).

## Roue de compétences
`SkillWheel.tsx` : position continue non bornée, dossiers piochés modulo le nombre de
compétences → **rotation infinie** dans les deux sens ; retour au cran le plus proche par
easing exponentiel en `requestAnimationFrame` (plus de à-coups), arc de graduations qui suit
le doigt, icône de rang sur chaque dossier.

## Section Quêtes plus « gaming »
Carte de rang sombre avec grande icône, barre d'XP segmentée et conseil de palier ;
`ComboBar` traitée en loot (dégradé, reflet, halo corail, bonus en pastille) ;
badges de difficulté sur chaque ligne.

## Hors scope
Point 7 (feedback / recommandations IA) volontairement non implémenté : nécessiterait un backend,
incompatible avec l'hébergement GitHub Pages actuel.
