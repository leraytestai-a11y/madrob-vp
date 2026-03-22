# CLAUDE.md — madrob-vp

Contexte permanent pour Claude Code. Lis ce fichier avant toute modification.

---

## C'est quoi ce projet

Application web PWA de suivi qualité de production pour une ligne de fabrication de skis. Utilisée par les opérateurs terrain sur tablette/mobile. Chaque ski passe par une série de modules et d'opérations — l'app permet de saisir les contrôles qualité, les mesures, et d'imprimer des étiquettes.

Ce projet a été initialement généré avec Bolt. Il est maintenant maintenu avec Claude Code.

---

## Stack technique

- **React 18** + **TypeScript** — composants fonctionnels avec hooks, pas de classes
- **Vite** — dev server et build
- **Tailwind CSS** — styling uniquement via classes utilitaires, pas de CSS custom sauf `index.css`
- **Supabase** — base de données (client initialisé dans `src/lib/supabase.ts`)
- **lucide-react** — icônes
- **jsbarcode** — génération de codes-barres
- **vite-plugin-pwa** — mode PWA (installable sur tablette)

---

## Architecture

```
src/
├── App.tsx                   # Routeur principal (state machine de vues)
├── types.ts                  # Tous les types TypeScript du domaine
├── main.tsx                  # Point d'entrée React
├── components/
│   ├── Home.tsx              # Écran d'accueil — liste des modules
│   ├── LoginScreen.tsx       # Écran de login opérateur
│   ├── OperatorHeader.tsx    # Header fixe avec infos opérateur + logout
│   ├── ModuleDetail.tsx      # Liste des opérations d'un module
│   ├── OperationDetail.tsx   # Détail d'une opération
│   ├── DataEntryWorkflow.tsx # Workflow principal de saisie des mesures (composant lourd)
│   ├── Summary.tsx           # Récapitulatif après saisie
│   ├── SkiReader.tsx         # Lecture d'un ski par scan/saisie manuelle
│   ├── SkiDataDisplay.tsx    # Affichage des données d'un ski lu
│   ├── SkiInfoPage.tsx       # Page détail d'un ski
│   ├── PrintLabels.tsx       # Module d'impression d'étiquettes
│   ├── Barcode.tsx           # Composant rendu code-barres
│   ├── NumericKeypad.tsx     # Clavier numérique custom pour saisie terrain
│   ├── PDFViewerModal.tsx    # Modal d'affichage PDF (fiches instructions)
│   └── UploadInstructionsModal.tsx
├── contexts/
│   └── OperatorContext.tsx   # Context React — opérateur connecté
└── lib/
    ├── supabase.ts           # Client Supabase
    ├── labelPrint.ts         # Logique impression étiquettes
    └── prerequisiteCheck.ts  # Vérification prérequis entre opérations
```

---

## Modèle de données (types.ts)

| Type | Description |
|------|-------------|
| `Module` | Étape de production. A un `color` et `icon`. |
| `Operation` | Sous-tâche dans un module. Liée à `module_id`. |
| `MeasurementField` | Champ de saisie. Types : `numeric`, `pass_fail`, `pass_repair`, `text`, `select`. Peut avoir `depends_on` pour affichage conditionnel. |
| `SkiRecord` | Enregistrement d'un ski sur une opération. `serial_number`, `side` (left/right), `status` (in_progress/completed/skipped). |
| `Measurement` | Valeur saisie pour un `MeasurementField` sur un `SkiRecord`. |
| `QualityCheck` | Contrôle qualité simple (ok/nok/pending). |

---

## Navigation (App.tsx)

Pas de React Router — machine d'états simple dans `App.tsx`.

```
home → module → operation → (workflow saisie)
home → ski_reader
operation → print_labels
```

Pour ajouter une vue : ajouter le type dans `type View`, gérer les transitions dans `handleBack()` et `handleHome()`, rendre le composant dans le JSX conditionnel.

---

## Supabase

- Importer `supabase` depuis `src/lib/supabase.ts`
- Variables d'env : `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans `.env`
- Requêtes faites directement dans les composants (pas de couche service)
- Auth : login custom via `localStorage` (`app_authenticated`), pas Supabase Auth

---

## Conventions

- Composants : PascalCase, un fichier par composant dans `src/components/`
- Types : tous dans `src/types.ts`
- Styling : Tailwind uniquement, pas de CSS custom
- State : useState + Context API, pas de librairie externe
- Icônes : lucide-react uniquement
- Pas de tests automatisés

---

## Commandes

```bash
npm run dev      # localhost:5173
npm run build    # tsc + vite build
npm run preview  # preview du build
```

---

## Points d'attention

- `DataEntryWorkflow.tsx` et `PrintLabels.tsx` sont les composants les plus lourds (~300-400 lignes). Modifier avec précaution.
- Le `node_modules` est commité (héritage Bolt) — ne pas s'en préoccuper.
- App conçue pour tablette en atelier : grands boutons, clavier numérique custom, pas d'interactions au survol.
- PWA via `vite-plugin-pwa` — manifest et service worker générés au build.
