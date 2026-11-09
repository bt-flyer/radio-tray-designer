# Trayworks — Local RC Jet Radio Tray Designer

A local, editable tray-design workshop with a 2D layout editor, a solid 3D preview, filesystem autosaving and binary STL export. No account or cloud hosting is used.

## Start

Double-click **Start Trayworks.command**. It opens the app at **http://127.0.0.1:4173**. Keep its Terminal window open while designing; Control-C stops the server. If macOS opens the launcher as text, open Terminal in this folder and run `npm start`.

Dependencies and a production build are included in this workspace. After copying only the source to another computer, install Node.js 22 LTS or newer, then run `npm ci`, `npm run build`, and `npm start`. Installation needs internet; normal use is offline. The launcher installs missing dependencies and builds when necessary.

The supplied initial tray is a **310 mm long, centred trapezoid with 175 mm and 165 mm ends**, a **5 mm corner radius** and a **3 mm base**. The printer profile is **Bambu H2S, 340 × 320 × 340 mm**, with a 5 mm reserved margin on each bed edge, and PETG. Dimensions, radius, printer settings and clearances are editable. Rounding a tapered corner slightly reduces the maximum bounding width relative to its sharp vertex; nominal end widths describe the unrounded outline.

## Design workflow

1. Create a tray or open a saved design. Rectangles, trapezoids and custom polygons are supported. Use the pen tool to move polygon vertices; the right-hand point list adds, removes and precisely positions them.
2. Drag components from the library onto the tray, or use each card's **+**. A normal drag moves the selection; Shift selects multiple objects. Hold Alt to bypass snapping. The round handle rotates in 15° steps, or freely with Alt. Coordinates and rotation can also be entered in the inspector.
3. Configure cradle height, wall thickness and fit clearance. Defaults are 4 mm walls, 2 mm thickness and 0.3 mm clearance **per side**. These are starting fit values, not calibrated PETG tolerances.
4. Open **Walls & connector access** to omit walls or set opening widths, offsets and keep-out distances. North is local −Y; positive rotation turns clockwise in the top-down editor. Local coordinates rotate with the component. Keep-out areas are visible on selected components and participate in overlap checks.
5. Add strap slots, measured screw patterns, cable pass-through slots or aircraft mounting holes. Cable pass-throughs cut completely through the base. Existing aircraft supports must provide clearance below it.
6. Use the 3D view to inspect the actual generated solid. Reference electronics and your supplied UAT mesh can be hidden. They are **never included in the STL**.
7. Resolve red checks and review amber warnings. Export STL generates a binary mesh in millimetres. STL contains no unit metadata; import as millimetres in your slicer.

**Keyboard:** ⌘S/Ctrl-S save, ⌘Z/Ctrl-Z undo, Shift-⌘Z redo, ⌘D/Ctrl-D duplicate, Delete remove, arrow keys nudge by the snap increment, Shift-arrows nudge 10 mm. Undo history is session-only. Numeric fields commit on blur or Enter.

## Component library

The library contains RB-35S, SP-1, G4 GSU, G4 DRM, your custom telemetry converter, PGC, T-One lighting controller product 27, Remote NFC Panel, GPS ADV, original ASS-70, XT30/XT60 panel connectors, and the bolt-on UAT mount.

Published envelopes are seeded for RB-35S (114.4 × 73.4 × 18.7), PGC (68.6 × 50 × 18), GPS ADV (45 × 20 × 10.4), original ASS-70 (33.29 × 22.26 × 12.55), and Remote NFC Panel (33 × 19 × 6.2), all mm. Source links are stored in each definition. A nominal published envelope is not a verified housing shape or connector-access drawing.

**Still needed:** body dimensions for SP-1, G4 GSU, G4 DRM, telemetry converter and T-One controller; exact XT30/XT60 panel-mount variants, openings, flanges and hole patterns; and any additional screw patterns/connector clearances you want to use. The supplied T-One link is retained but could not be retrieved during implementation. No dimensions were invented. Missing dimensions display a striped layout placeholder and block the affected export.

Click the library card text or select an object and choose **Measurements & mounting pattern**. Enter body L/W/H, hole centre coordinates and diameters, source notes and verification status separately. The diagram explains the coordinate origin. Confirm the exact hardware variant. Panel connectors require a rounded-rectangle cutout, flange envelope and verified screw pattern; other keyed cutout shapes are not supported in v1. You can keep unpublished part dimensions unset and fill them in later.

**Apply measurements** updates only the selected instance, or the current session's library entry when editing the library. **Save library preset** persists it for reuse. Existing designs embed component snapshots and never silently inherit later preset changes.

## Your UAT mount

`public/references/uat.stl` is an unchanged copy of the supplied mesh. Its units are assumed to be millimetres. The mounting face has four **Ø3.0 mm holes at 50 × 20 mm centres**, through a 3 mm plate. The mesh is rigidly rotated so this face lies on the tray. Its hole-pattern centre is the placement origin; its asymmetric footprint is preserved. The original saved mesh bounds are approximately 80.623 × 35.342 × 29.917 mm; oriented on the tray, the envelope is 80.623 × 29.917 mm and 35.342 mm high.

The UAT mount bolts onto the printed tray. Only its four holes are cut into the tray STL. **Diameter allowance** changes the tray's hole diameters without changing the measured source pattern.

## Local files and recovery

- `data/designs/<id>.json`: explicit Save / Save As.
- `data/designs/<id>.autosave.json`: latest autosave, after one second of inactivity.
- Adjacent `.bak` files: previous valid saved versions. Writes use a temporary file and atomic rename. A corrupt primary file falls back to its backup.
- `data/components/<id>.json`: saved reusable component presets.

The Open dialog selects the latest autosave when newer than the explicit save. **Saved version** opens the explicit save instead. New/imported designs receive unique IDs. Design JSON preserves all editable parameters; STL does not. Imports are schema-validated before changing the current document. Save errors remain visible and you can export a JSON backup directly from the browser.

Back up the whole `data` folder or export individual design JSON files. The service binds only to `127.0.0.1` and rejects cross-origin write requests. Set `TRAYWORKS_DATA_DIR` to choose another data folder, or `PORT` to choose another port. Version 1 files declare `schemaVersion: 1`; unsupported schema versions are rejected.

## Fit samples

- `samples/holder-fit-test.stl`: 80 × 50 × 3 mm rounded plate with a 20.6 × 15.6 mm cradle cavity and 4 mm high walls. Three holes at X=60, Y=15/25/35 are Ø3.0/3.2/3.4 mm, respectively.
- `samples/fit-test-block.stl`: a separate 20 × 15 × 5 mm block for that cavity.
- `samples/example-tray.stl`: representative 310 mm tapered tray with dimensioned systems, cable slot, aircraft mounting holes and UAT hole pattern. Its layout is illustrative, not a finalized installation.
- Matching `.tray.json` files can be imported for editing. Sample STLs are also downloadable through the Help dialog.

Print the small fit samples using your intended PETG settings before committing to a tray. Check connector accessibility and printed hole fit on your hardware. This tool does not perform structural, thermal, vibration or wiring analysis; its layout warnings are geometric checks. No stand-off feet, snap clips or split joints are generated in v1.

## Development and verification

- `npm run dev`: local Vite development server through the Node file service.
- `npm run build`: TypeScript validation and offline production assets.
- `npm test`: geometry, dimensions, topology, input validation, local saves and recovery checks.
- `npm run samples`: regenerate the sample STL and JSON files.

Geometry uses Manifold WASM in a background worker. Preview and export share the same mesh. Export checks the Float32 STL surface for closed, consistently oriented triangle edges, positive volume and one connected solid. Reference geometry is kept separate. Builds and automated geometry/storage tests passed; browser checks covered import, editing, autosave/open, 3D rendering, blocked incomplete exports and STL download. An installed desktop slicer was not available here, so slicer and physical print-fit verification remain to be done.

## Imported component measurements (latest update)

The supplied `component-measurements.json` has now been integrated into the component library and existing designs. User-measured dimensions replace the earlier nominal envelopes for SP-1, GSU, telemetry converter, T-One, GPS ADV and ASS-70. PGC now has the supplied 73 × 33 mm screw pattern. T-One uses the two diagonally opposite holes at (−22, −31) and (+22, +31) mm, with the inferred axis assignment and centring explicitly provisional. Hole centring for SP-1 and PGC also remains provisional.

RB-35S now uses a 98 × 73.4 mm case, Ø4 mm holes on 106 × 48 mm centres, and four mounting-foot openings. Case length, hole geometry and foot shape are estimates. Foot projection is inferred as 8.2 mm from the 114.4 mm overall length. Foot widths start at **10 mm**, an adjustable assumption rather than a supplied measurement. Adjust each foot in **Measurements → Mounting feet / wall openings**. Wall clearance is added automatically. The complete feet are shown as reference geometry; their occupied area is included in placement checks. Their displayed 2 mm thickness is illustrative and not exported.

Tape-mounted GPS/telemetry parts now use three low locating walls, ASS-70 has both ends open, PGC has both connector sides open, SP-1 has one end open, and T-One has no surrounding walls. Open single ends are assumed to be local +X and can be reversed through the wall controls. GSU uses an open-ended cradle and strap; its retaining lips and finger notch remain to be designed, as noted in the component record.

Still pending: G4 DRM dimensions, physical Remote NFC Panel measurements (published dimensions remain available), and exact XT30/XT60 panel-mount variants. This section supersedes the original pending-measurements list above. Provisional values trigger review warnings during STL export.

### Centred grid and alignment

The layout grid and ruler zero are now centred on the tray outline. On the 310 × 175/165 mm tray this is the original-coordinate point (155, 87.5) mm. Visible centre lines show both axes. Dragging snaps component centres and mounting-hole centres to the tray axes and to other objects' centres/holes, with orange alignment guides. Hold Alt or turn Snap off to bypass snapping. The inspector and cursor still report original tray coordinates so existing designs retain their positions; ruler labels are relative to the centre. Moving multiple selected objects preserves their relative spacing.

## Alignment, slot resizing and standard connectors

Aligned selected objects now show orange guides to other items' centres, envelope edges and screw-hole centres. They also snap to those positions during dragging. Select a cable slot and drag any of its eight handles to resize it directly. A size label updates live; the opposite edge/corner stays fixed, even after rotation. Snap uses the selected grid increment; Alt bypasses it. Undo restores the whole drag as one operation.

The standard XT30 and XT60 presets now use AMASS XT30U-F (10.2 × 5.2 mm body cross-section, 12.4 mm overall depth) and XT60-F (15.5 × 8.1 mm cross-section, 20.2 mm depth) manufacturer drawings. Sources are retained in the preset. Default clearance is 0.3 mm per side, making openings 10.8 × 5.8 mm and 16.1 × 8.7 mm. Printed flanges are 3 mm high above the tray, with footprints 26.8 × 13.8 mm and 32.1 × 16.7 mm. Each has two Ø3.2 mm screw holes. All dimensions are editable in Measurements. Disable the printed-flange checkbox to use only a tray cutout.

These are adapters around standard female connector bodies, not factory panel-mount variants. The connector needs adhesive or a separate retainer to stay in the clearance opening. Male, capped and other variants can differ. `samples/connector-fit-test.stl` provides both adapters on an 80 × 40 mm test plate; matching JSON is included. Standard presets supersede the earlier empty XT panel-connector entries. Previously dimensioned custom connector definitions are preserved.

## Preview and STL orientation correction

The 2D layout uses screen coordinates (+Y down). Preview and exported STL now convert that to right-handed printer coordinates (X, −Y, Z), reversing triangle winding at the same time to preserve outward faces. This corrects the previous mirrored top-down appearance. Saved layout coordinates are unchanged. The **Top view** button in the 3D preview offers a direct comparison with the 2D editor. Existing STL files retain their old orientation: re-export them from the updated app. Sample STLs have been regenerated. Imported UAT reference geometry retains its original physical handedness and is aligned by its symmetric mounting pattern.

## DRM dimensions added

The G4 DRM preset now uses the supplied drawing: case 58 × 38.4 × 17.1 mm, two holes 64 mm apart along the length, and Ø3 mm holes confirmed by the user. Both short-end cradle walls are omitted to clear the mounting ears. The source drawing is retained at `public/references/kingtech-g4-drm-dimensions.png`. Existing unknown DRM definitions receive this update when opened. Connector access can still be adjusted using the wall/keep-out controls. DRM is no longer awaiting body or hole dimensions.

## RB-35S physical fit correction

A printed fit check confirmed a 99 mm case length (replacing the earlier 98 mm image estimate). The default 0.3 mm clearance per side now produces a 99.6 mm nominal CAD cavity along that axis. Width, height, hole coordinates, mounting-ear positions and object placement are retained. Existing 98 mm RB-35S instances are corrected when reopened. Re-export the tray STL after refreshing/reopening the design. The 106 × 48 mm hole pattern already lined up on the printed part and has not been moved.

## Physical fit feedback — surrounding ribs, bosses and pilots

All locating rails now start at **2.5 mm height**. Existing electronics receive this height on reopening; dimensions and hole centres remain intact. Telemetry converter, GPS and ASS-70 now have continuous ribs on all four sides, as requested after physical fit checks. PGC cavity and mounting-hole positions are retained.

SP-1 now has **8 mm mounting-boss clearance openings** centred on its existing mounting holes. The tray beneath the bosses remains intact; only the cradle walls are relieved. Boss diameter is editable under Measurements → Mounting-boss clearance.

Printed component holes now default to **Ø1.5 mm pilots**. The original measured component-hole diameters remain in the definitions. Tray-to-aircraft holes keep their entered diameters. Change this in Tray settings → Printed screw holes. There are separate modes for measured sizes, component pilots only, and pilots for all screw holes.

T-One case dimensions have been reset to **44.5 × 44.5 × 8.5 mm** with 2.5 mm surrounding rails. The previous hole pattern failed physical fit and has been removed. Its two-hole pattern and tab openings await measured centre separations/offsets; the supplied photo confirms upper-right/lower-left orientation but is not a dimensioned drawing. Export is blocked for that component until its mounting pattern is completed. The photo is retained in `public/references/tone-remeasured-photo.png`. DRM fit remains untested.

## Light-controller hole pattern remeasured

The corrected two-hole layout is now complete. With the photo orientation and a 44.5 mm square case, upper-right is **(+30, −14.75) mm** and lower-left is **(−30, +22.75) mm**, relative to case centre. This uses the supplied 60 mm horizontal separation, centred horizontally, and top-edge offsets 7.5 mm and 45 mm. The asymmetry is intentional: vertical separation is 37.5 mm, with pattern midpoint 4 mm below case centre. Printed pilots remain Ø1.5 mm. Both tab crossings have conservative 16 mm wide clearance windows inferred from the photo, editable in the mounting-foot controls; these are clearance assumptions, not measured tab outlines. Rails remain 2.5 mm high. This supersedes the earlier pending-hole notes.

## Cable-opening rims

Cable pass-through slots now have a **1.5 mm high × 1.5 mm thick** raised rim by default, including slots in existing designs. The rim grows outward, so the original opening length/width remain clear. Its height/thickness and enabled state can be changed in the cable-slot inspector. Resize handles continue to control the opening, with the rim following automatically. Placement/edge checks and alignment use the outside rim footprint. Component locating rails remain 2.5 mm high.

## Named copies and download filenames

**Save as…** is now beside Save in the header; **Shift-⌘S / Shift-Ctrl-S** opens it. Choose a new design name to create a separately saved copy while preserving the original. The optional editable-file download has its own filename field and uses `.tray.json`. Export design JSON and Export STL also allow explicit filenames; changing an export filename does not rename the design. Extensions are added automatically without duplication. Downloads use the browser's normal save destination. All settings and geometry remain editable after importing the JSON.

## Outer tray rim

Trays now have an enabled **1.5 mm high × 1.5 mm thick perimeter rim**, including existing designs. The rim follows the rounded polygon and grows inward, preserving overall aircraft-fit dimensions. Toggle it or edit its height/thickness under Tray settings → Outer tray rim. Component footprints overlapping the rim produce a warning. The printer export and 3D preview share the same rim geometry. Cable rims retain their separate 1.5 mm defaults; component locating rails remain 2.5 mm.

### Component appearance in the 3D preview

The reference preview now includes procedural component models: cases, mounting ears, connector banks, pump fittings, screens, LEDs, sensor details and yellow XT housings. Body sizes and mounting centres use the component definition saved in the design. Appearance and connector projections are approximate; they do not define fit, create clearance checks, or change the printable STL. Custom telemetry appearance is generic pending a photograph. No remote textures or models are needed at runtime.

Visual references consulted: FrSky RB-35S product imagery, SP-1/PGC product illustrations at https://www.horusrc.com/en/frsky-smoke-pump-sp-1.html, KingTech GSU imagery at https://alshobbies.co.uk/KINGTECH-GSU-TOUCH-SCREEN-KT-GSU, GPS ADV imagery at https://www.turbines-rc.com/en/sensors/3413-frsky-gps-sensor-adv-high-precision.html, Remote NFC imagery at https://globaljet.club/collections/frsky/nfc-power-switch, and the supplied DRM drawing and T-One photograph. Sensor variants may differ visually; measured envelopes take precedence. The original UAT STL remains the reference for that mount.

## Public browser version (GitHub Pages)

The public tool is https://bt-flyer.github.io/radio-tray-designer/ . It runs the editor, Three.js preview and Manifold STL generation entirely on the visitor's computer. No account or local Node service is needed.

Save, Save As, autosave and custom presets use IndexedDB in that browser profile. Saved revisions and autosaves remain separate, and each record keeps its previous revision for recovery. Designs are not uploaded to GitHub. Clearing website data, private browsing or changing device can make browser saves unavailable: export editable `.tray.json` backups regularly. Import a JSON file to transfer a local Mac design to the website. STL is a print artifact, not an editable backup.

`npm run build:pages` builds into `dist-pages/`; `npm run preview:pages` previews at http://127.0.0.1:4174/radio-tray-designer/ . The separate `npm run build` and `npm start` commands retain the localhost service and filesystem storage. A push to `main` runs tests, builds the Pages version and deploys through `.github/workflows/pages.yml`. The deployment contains the built app, bundled references and two explicitly selected fit-test STLs. It excludes local `data/`, personal tray files and server code.

The New and Open dialogs include **T-One radio tray**, a published snapshot of the owner's T-1 aircraft installation (310 × 175 / 165 mm, nine components and four cable pass-throughs). Opening it creates a new design with independent object IDs and preserves the layout's component definitions. This one explicitly shared layout is bundled with the app; other local saved designs remain excluded. Review the retained fit and clearance warnings before printing.

Design checks omit generic notices for unspecified connector access; measurement status remains visible in the component form. RB35S, PGC and SP-1 hole centres matching the user's successful physical fit checks are marked confirmed, including when reopening older designs. Changed patterns retain provisional status. Actual access obstructions, overlaps, missing geometry and printer constraints still appear in design checks.

## Printable labels

Under **Tray features**, click or drag **Text label** onto the tray. Edit **Label text**, **Text size** (actual letter height in millimetres) and **Raised height** in the inspector. Labels default to 5 mm letters raised 0.6 mm; move, rotate, align, duplicate and undo them like other objects. Text is centred on its placement point. It is fused to the tray, appears in 3D and is included in STL; it stays visible when reference electronics are hidden. Save/export JSON preserves the text and style. Keep lettering clear of holders and openings, and check thin strokes in your slicer.

The bundled Helvetiker font works offline; its permission notice is in `public/licenses/helvetiker.txt`. Text is single-line, up to 80 characters. Missing font characters and empty labels block export. The SVG editor and Manifold generator use the same sampled glyph contours, including enclosed spaces in letters.

### Servo header panel flange

**Mounts & connectors → 3-pin servo header** adds an upward-facing generic 1×3 male header on 2.54 mm pitch. The designed insulator envelope is 7.62 × 2.54 × 2.54 mm; a through-opening of 8.22 × 3.14 mm leaves 0.3 mm per side. Its integrated flange is 24.22 × 11.14 × 3 mm, with two Ø1.5 mm pilots on 16.22 mm centres. All cutout, flange and mounting-hole dimensions are editable in Measurements. The black header and three metal pins are preview references excluded from STL; install and retain the real header separately. This is a generic bare header adapter, rather than a keyed Futaba/JR or manufacturer-specific panel housing. Pin assignments are unspecified. Pitch reference: https://suddendocs.samtec.com/catalog_english/tsw_th.pdf .

## Separate TPU cable grommets

Click **TPU grommets** below the workspace (also available in the tray export dialog), select cable openings and download a separately named STL. The preview shows only the TPU parts, laid flat with 5 mm spacing; they are never merged into the tray export. Enable one opening for a fit test or select all for a set. Each selected slot contributes one grommet, including duplicate sizes.

In a cable opening's **TPU wire grommet** properties, adjust sleeve wall, fit clearance per side, top and retaining lip overhang, lip thickness and grip allowance. Grip depth follows tray thickness plus the opening's raised rim, if enabled. The small bottom retaining lip prints on the bed; the larger top lip reaches beyond the cable rim. The cable bore is reduced by the sleeve walls and clearance; its resulting dimensions are shown before export. These are untested starting dimensions for a flexible insert: print one in your TPU and adjust the fit before making the set. Slots can be resized later and the grommets regenerate to match.

Defaults: 1.2 mm sleeve, 0.2 mm clearance per side, 2.3 mm top overhang, 0.8 mm retaining overhang, 1 mm lip thickness and 0.2 mm grip allowance. Empty/too-small bores, insufficient top-lip reach and parts or batches exceeding the printer volume block TPU export. Grommet settings save in editable JSON and browser/local saves. Aircraft screw holes are not lined.

Ready-to-print starting samples: `samples/t-one-tpu-grommets.stl` contains the four inserts for the built-in T-One layout; `samples/tpu-grommet-fit-test.stl` contains just its first 50 × 6 mm opening's insert. Both use the defaults above and a 3 mm tray with a 1.5 mm cable rim.

### Latest physical fit corrections

The RB35S uses a 100 mm length envelope (100.6 mm inner holder length at 0.3 mm per-side clearance). Telemetry uses a **46 mm total inner opening including clearance**: its designed fit envelope is 45.4 mm, plus 0.3 mm on each side; the original measured 45.25 mm body remains recorded in the measurement specification. The light controller body is remeasured as 52.5 × 52.5 × 16.5 mm, giving a 53.1 × 53.1 mm inner holder at default clearance. All confirmed screw centres and object placements are preserved.

The smoke pump is retained by screws with no locating ribs, because the ribs interfered while the holes and boss clearances lined up. PGC has four-side 2.5 mm locating ribs, with conservative 8 mm foot windows around its confirmed mounting centres. Fit windows remain adjustable. These changes apply once to the corresponding older stock definitions and holders when reopened; subsequent manual sizing and holder edits are preserved. The published T-One template includes the corrections.

Revised print checks are in `samples/rb35s-fit-test.stl`, `samples/telemetry-fit-test.stl`, `samples/pgc-fit-test.stl` and `samples/light-controller-fit-test.stl`. `samples/t-one-tray.stl` is the complete updated T-One tray. Regenerate them using `node --import tsx scripts/generate-fit-checks.ts`. Check the separate fit pieces before reprinting the full tray.

### SP-1 asymmetric body and restored ribs

The pump retains its proven 26 × 32 mm mounting-hole pattern. Its 51 × 26 mm body centre is **5.375 mm rearward** of the mounting-pattern midpoint: local X = −5.375 mm, with the hose-nipple end pointing +X. User edge measurements imply 26.25 mm longitudinal spacing; keeping the already fitted 26 mm holes gives 7.125 mm front and 17.875 mm rear edge distances, 0.125 mm above each reported measurement. No screw holes move.

Four 2.5 mm locating ribs and the Ø8 mm boss reliefs are restored around that offset body. A component's editable **Body centre X/Y offset** moves its case, ribs and connector zones while keeping holes and bosses at the placement origin. SVG, reference models and STL use the same offset. Old pump cradles update once; later manual body-offset and wall edits are retained.

The built-in T-One template moves its adjacent vertical cable opening from X=78 to X=82.2 mm to clear the restored rear rib. Existing saved layouts retain their slot positions and show an overlap warning if adjustment is needed. `samples/smoke-pump-fit-test.stl` provides an individual pump fit check; the complete `samples/t-one-tray.stl` is regenerated with the restored outline.

### Approved uploaded default

The built-in T-One default now uses the owner's uploaded `T-One radio tray copy.tray.json` exactly: 10 components, four cable openings and the GSU text label. Opening the template changes only document/object IDs and document metadata; it does not reapply fit or layout transformations to the approved snapshot. Existing personal designs remain separate. The matching complete tray STL is regenerated from that snapshot.

### Wider light-controller rib reliefs

The light-controller mounting-tab openings now use 32 mm width, doubled from the previous 16 mm, plus the existing per-side clearance. The physical tab reference sizes, body, hole centres and placement are unchanged. **Foot opening width** is independently editable in Measurements. Existing standard openings upgrade once on reopening; later manual opening widths are preserved. The built-in T-One default, complete tray STL and light-controller fit-test STL include this change.

### UAT locating outline

The UAT mount now has four 2.5 mm-high locating ribs around its **60 × 29.91702 mm mounting plate**, measured from the supplied STL's bottom face. At default 0.3 mm per-side clearance, the opening is 60.6 × 30.51702 mm; ribs are 2 mm thick. The plate centre is (0, −0.04149 mm) relative to the unchanged 50 × 20 mm screw pattern. The wider, overhanging mount remains a reference object and is never merged into tray STL.

Adjust or disable the ribs under the selected UAT's **Locating outline** controls. Existing UAT instances receive the outline once when reopened; later manual holder edits persist. The published T-One default and complete tray STL include it. Use `samples/uat-outline-fit-test.stl` to check the fit against your existing mount before printing a full tray.

### UAT overhang override

The separately installed UAT mount's reference footprint may overhang the tray. This produces a warning, rather than the blocking “footprint extends beyond the tray” error. Review and acknowledge the clearance warnings in the STL dialog to export. Printed locating ribs and mounting holes are checked independently and must stay supported by the tray; disable the locating outline if only the original bolt-on mount should overhang.

### KingTech KP-600 fuel pump

The KP-600 uses the confirmed 2026-11-08 measurements: 48.5 × Ø27 mm case, two holes 32 mm apart at 15 mm from the nipple-end case edge (local X −9.25, Y ±16). The original dummy STL is resized for the visual reference; its 4 mm case elevation is retained, giving an estimated 31 mm total height. Clamp/feet and fitting details remain estimates. Hardware hole diameter remains estimated Ø3 mm; printed component pilots are 1.5 mm by default. There are no printed pump outline ribs. The pump mesh is excluded from STL exports.

The DRM uses a 51.5 × 33.5 mm case, retaining the earlier 17.1 mm height. Its Ø3.5 mm hardware holes have 58 mm horizontal separation, with right 10 mm below the top and left 10 mm above the bottom: local (−29,+6.75), (+29,−6.75). Printed pilots remain 1.5 mm. These updates apply once when reopening older designs, preserving item positions and subsequent manual measurement edits. The built-in default and sample STL are updated.

Print `samples/kp600-fit-test.stl` to check the estimated mounting pattern first; its editable source is alongside it. Regenerate with `node --import tsx scripts/generate-kp600-fit.ts`.

The UAT preview also includes an estimated translucent tank (70 × 32 × 32 mm), filler neck and two red retaining straps, oriented to the supplied mount’s 30° seat. These photo-based appearance objects toggle with the other reference bodies and never enter tray STL generation or alter the measured mounting pattern. They are not measured clearance specifications.

The built-in T-One default now uses the user-approved `T-One radio tray copy.tray (1).json` snapshot: 313 × 175 / 165 mm, 2.5 mm tray thickness, 12 components including the KP-600 and NFC panel, and four cable openings. All supplied placements and holder settings are retained. Existing saved designs are unaffected. The downloadable T-One tray and TPU grommet samples match this default.

### Centred tray extensions

In Tray settings → Centred tray extensions, enable Front (−X, left in top view), Rear (+X, right), or both. Each has independent width, outward depth and corner radius in millimetres. Rectangle and trapezoid extensions are centred across the tray, share its thickness, and carry the perimeter rim. Width must be smaller than the selected end; radii are reduced locally for short edges. The complete outline is used for snapping, boundary/print-bed checks, preview and STL. Settings save with the design and participate in normal undo/redo. Existing designs have both extensions disabled. Converting to a custom polygon bakes the extension vertices for manual editing; adjustable extension controls are available on rectangles and trapezoids.

Updated fit coupons: `samples/drm-fit-test.stl` and `samples/kp600-fit-test.stl`, with editable design JSON beside each. Both use 1.5 mm printed component pilots. The DRM has 2.5 mm locating ribs on all four sides with tab clearance openings; the KP-600 has no outline ribs.


The T-One lighting-controller pattern is centred on the 52.5 mm case: upper-right (+30, −18.75), lower-left (−30, +18.75), each 7.5 mm from its nearest top/bottom edge. Horizontal spacing remains 60 mm and vertical spacing 37.5 mm. Tab openings move with the corrected pattern while keeping their widened 32 mm clearance. Older snapshots update once on reopen; the default tray and light-controller fit coupon are updated.

The current built-in default is the uploaded **T-One Final** design: 313 mm body with a 19 mm centred rear extension (332 mm overall), 175 / 165 mm tapered width, 3.5 mm thickness, and the supplied final component placements. Only the subsequently confirmed lighting-controller hole/tab correction is applied. The design retains the usable-bed warning because its 332 mm overall length exceeds the configured 330 mm usable X dimension. Downloadable tray and TPU grommet samples match the new default.

### Side-specific rim reinforcement

Tray settings → Outer tray rim → **Set height by side** enables separate front (−X), rear (+X), upper long side (−Y), and lower long side (+Y) heights above the tray. Set **Smooth transition length** to control the gradual rise between adjacent sides; longer lengths give gentler ramps. The profile blends heights along the perimeter using a cosine transition and is included in the shared preview/export solid. Front/rear extensions keep the uniform/base rim height; taller reinforcement transitions down on the main tray before reaching them. Custom polygon edges use their direction in top view to select a side. The rim remains inside the outline, with unchanged wall thickness. Printer-height checks and through-cuts use the tallest selected height. Existing designs keep their uniform rim until this option is enabled; side heights and transition length save in design JSON.


### Remote NFC Panel mounting ears

The NFC reference model has two diagonal mounting ears, matching cradle reliefs and tray drill/pilot holes. The manufacturer’s overview labels a 33 × 19 mm case but does not dimension its holes; the preset therefore marks the approximate 40 × 9 mm centre pattern and Ø2.5 mm hardware holes as **estimated**. Reference: https://blog.horusrc.com/wp-content/uploads/2025/02/1738894909876.png . Printed pilots follow project settings (default Ø1.5 mm). Ear rectangles are estimated 8 × 6 mm. Check `samples/nfc-fit-test.stl` against your hardware; editable JSON is alongside it. Existing unconfigured NFC instances upgrade once on reopen, preserving placements and subsequent custom edits. Existing user-defined hole patterns are preserved. The default T-One Final includes these ears and holes; reference electronics/ears remain excluded from tray STL.

The T-One Final default includes four Ø3 mm aircraft attachment holes: X 4.3 / 307.3 mm (303 mm apart), Y 36.5 / 138.5 mm (102 mm apart, centred on Y 87.5). These are standalone tray holes and retain Ø3 mm with the standard component-only pilot setting.

Use **Circular wire pass-through** in Tray features to click or drag a round cable opening onto the tray. Set its diameter in Object properties; drag handles resize it while preserving circular shape. The opening supports the standard 1.5 mm cable rim and a separately exported round TPU grommet. Existing cable openings can switch between rounded slot and circular hole using Opening shape. Wire openings are independent of screw pilot-hole settings and save with the design.


The servo panel preset fits the user’s 10.75 × 4 mm male connector with a tight 10.95 × 4.2 mm opening (0.1 mm per-side clearance). Flange dimensions and screw centres stay unchanged. Housing height and pin details remain illustrative. Old servo presets and saved instances update once on reopen, preserving later edits. The default tray and `samples/servo-connector-fit-test.stl` use this opening; print the small coupon first to check your printer’s fit.


The current default is **T-One Final-withall**, based on the supplied file of that name. Its placements and reinforced rim settings are preserved, with the latest confirmed component corrections (including the 10.95 × 4.2 mm tight servo opening). Four Ø3 mm aircraft mounting holes are added at X 4.3 / 307.3 and Y 36.5 / 138.5 mm. It has six cable slots, a 15 mm rear extension (328 mm total length), and 3.5 mm thickness. Review the front mounting-hole clearances near the smoke/fuel pump footprints before printing; geometry is connected and watertight. Tray and TPU samples match this default.
