# Verification

Verified on November 6, 2026.

- Production build and TypeScript validation passed.
- All 18 automated tests passed: geometry, solid connectivity, STL topology/dimensions, UAT transforms, slots, cradles, connector footprints, polygon validation, input schema, local persistence and recovery.
- Browser checks passed for startup, local save/reopen, JSON import, drag movement, numeric placement, rotation, undo/redo, polygon coordinate edits, 2D/3D switching, UAT reference orientation and incomplete-dimension export blocking.
- Both desktop and narrow browser layouts were visually checked.
- Browser-generated example STL matched the independently generated sample byte-for-byte: SHA-256 `cefaa8facc1e104a8c787f119e515ea3bc44abce056b3bdda141e2f2afd102b9`.
- That STL has 2,870 triangles, zero non-manifold welded edges and a 7 mm maximum height. Electronics and the taller UAT reference were excluded.
- Local health and sample-file routes returned HTTP 200; a cross-origin API request returned HTTP 403.
- `samples/holder-fit-test.stl` and `samples/fit-test-block.stl` were generated and checked as closed solids.

Not verified: desktop slicer inspection, physical printing, structural performance or real component fit. No installed slicer was available. Missing hardware/connector dimensions remain explicitly unset in the component library.

The temporary verification server was stopped after testing. Use `Start Trayworks.command` to launch the finished app.

## Component and alignment update

Imported the supplied component-measurements specification, added estimated RB35S mounting feet and four Ø4 mm holes at 106 × 48 mm centres, and integrated the additional user-measured component dimensions. Existing designs were upgraded with backup files retained. Foot widths are adjustable assumptions; provisional pattern centring remains flagged. GSU lips/notch remain pending.

The grid/ruler origin is now the tray centre, with centre lines and snapping to component/hole centres. Production build and all **23** tests pass, including RB35S wall-opening geometry and spacing-preserving alignment. The regenerated example STL has 4,938 triangles; the earlier sample checksum above describes the original version and is superseded by this update.

## Latest interaction and connector update

Production build and all **28 tests** pass. Browser drag verification resized a 90° slot from 55 to 71 mm while preserving width and its opposite end; undo restored the change. Selecting an aligned GPS component showed the matching guide. Standard XT30/XT60 printed flanges were inspected together in the 3D view. Geometry tests check the raised flange heights, through-openings, connectivity and closed surfaces. Connector dimensions are based on the AMASS XT30U-F and XT60-F drawings linked in their presets. An additional connector fit-test plate was generated. Physical fit remains untested.

## Orientation correction

Production build and **29 tests** pass. Preview and STL now share a screen-to-printer Y-axis conversion, with winding reversed to retain outward faces and positive signed volume. The browser's 3D Top view was visually compared against the asymmetric example layout. Browser-downloaded STL was checked again: zero non-manifold edges, positive signed volume, and corrected negative Y coordinates. Regenerated all supplied sample STLs. Previously downloaded STLs need re-exporting to receive this correction.

## DRM update

The supplied drawing was integrated as a 58 × 38.4 × 17.1 mm body and 64 mm two-hole spacing. User confirmed Ø3 mm holes. Both ear ends are open. All **30 tests** and the production build pass, including DRM geometry and support for explicitly unset hole diameters without inventing values.

## RB-35S print-fit correction — November 7, 2026

Case length corrected from the estimated 98 mm to the user's measured 99 mm. The cavity is 99.6 mm at default clearance. Build and all **32 tests** pass. New geometry checks probe both inside and outside the enlarged cavity, verify the original hole locations, and check that upgrading an existing rotated instance preserves custom holder settings, placement and hole/tab data. Physical fit of the corrected print remains to be checked.

## Physical feedback update

Build and **36 tests** pass. Checks cover 8 mm pump-boss wall clearances with support material retained underneath, continuous sensor ribs preserving the accepted cavity dimensions, 2.5 mm rail migration, and 1.5 mm component pilots while standalone aircraft attachment holes retain their specified diameters. T-One body reset to 44.5 × 44.5 × 8.5 mm; its replacement two-hole geometry is pending measured offsets and export remains blocked for that incomplete pattern. PGC dimensions and hole positions are retained. DRM has not been physically fit-tested.

## Completed light-controller pattern

Build and **38 tests** pass. New tests verify the 60 mm horizontal separation, exact 7.5/45 mm top-edge offsets, upper-right/lower-left diagonal, 1.5 mm pilots, 2.5 mm rails and open rail regions at both mounting tabs. Existing pending instances migrate without changing placement or rotation. Horizontal centring is assumed; tab-clearance widths are conservative estimates from the supplied photo and remain adjustable. Physical fit of this revision remains to be checked.

## Cable-opening rims

Production build and **40 tests** pass. Added default 1.5 mm raised rims with 1.5 mm walls around cable slots. Tests verify a clear through-opening, unchanged opening dimensions, correct wall height/thickness, closed connected geometry after rotation/resizing, legacy-slot defaults, and disabling the rim. Samples were regenerated with the new rims.

## Named-file saving

Production build and **42 tests** pass. Browser verification saved a separately named design and downloaded `example-layout-version-2.tray.json`; the copy had a distinct identity, retained identical component geometry, and preserved the original design/name. Independently named STL download produced `example-print-version-2.stl` without duplicating its extension. The temporary QA copy was archived outside the app's design library.

## Perimeter rim

Production build and **44 tests** pass. Tests verify the 1.5 mm inward edge band, raised edge height, unchanged outside bounds, flat central tray surface, connected/watertight geometry on rounded trapezoids and concave custom polygons, and disabling the feature. Supplied tray samples were regenerated. The solid fit-test block keeps its rim disabled.

## GitHub Pages browser build

- Added IndexedDB persistence with separate saved/autosave records, transactional updates, previous-revision recovery and schema validation.
- 49 automated tests passed, including reopening browser stores, rejecting invalid writes, storage isolation and backup recovery.
- Both the local build and Pages build passed TypeScript and Vite compilation.
- Browser QA of the Pages build at its repository subpath: created a tray, added RB-35S, saved, reloaded, reopened and downloaded a printable STL; the worker and WASM loaded without a Node API. Preview screenshot: `pages-preview.jpg`.
- Public packaging explicitly includes only built frontend assets, bundled references and two sample fit-test STLs. Local user designs and custom component files under `data/` remain ignored.

### Published T-One default layout

- Added the latest T-1 saved layout as an explicitly shared template, with current measurement migrations applied once at publication.
- New and Open dialogs create independent editable copies; the source local design is untouched.
- 51 tests passed, including template independence, preserved placements and a connected, positive-volume mesh that passes STL surface auditing. Pages compilation passed.

### Measurement warning cleanup

- Removed repeated unknown-connector-access notices from actionable design checks, without inventing clearance measurements.
- Promoted only the exact RB35S, PGC and SP-1 mounting patterns confirmed by physical fit; no coordinates or dimensions change. Old saved designs and the built-in T-One layout receive the same status correction.
- Regression coverage retains provisional warnings for changed patterns, missing-dimension errors and actual perimeter interference. All 53 tests passed; Pages build passed.

### Printable labels

- Added draggable raised text labels with editable content, letter height, extrusion height, numeric position, rotation, alignment, duplication and undo/redo through existing object controls.
- Font contours are shared between SVG and printable CSG. Letter counters are preserved with even-odd filling; all letters fuse into the tray. Reference visibility does not hide printable labels.
- All 56 tests pass, including rotated O counters, B/8/dotted glyph connectivity, watertight STL auditing, browser save/reopen geometry equality and invalid-text checks. Pages build passed.
- Browser QA: added SMOKE PUMP, changed letter height to 8 mm and verified the resulting connected raised lettering in 3D without console errors.

### Three-pin servo header

- Added a designed generic 1×3, 2.54 mm-pitch header adapter to the connector library, with editable integrated flange, through-cutout and two component pilot holes.
- Reference model shows three square pins; pins remain excluded from exported solids.
- All 58 tests passed, including rotated watertight connected flange geometry, a clear centre opening, correct pin spacing, schema roundtrip and export exclusion. Pages build passed.

### Separate TPU grommet export

- Added per-slot persisted fit settings, a selection/export dialog, separate background-worker generation and an independent print-layout preview. Main tray solids are unchanged.
- Grommets have continuous clear bores, bottom retaining lips, rim-aware grip depths and wider top lips; geometry is packed flat within usable printer volume.
- All 62 tests pass, including watertight geometry, two-part output, open bores, automatic grip updates, unchanged main-tray geometry, persistence and invalid-fit/bed checks. Pages compilation passed.
- Browser QA generated all four T-One cable inserts in the separate export preview. Generated sample STL contains four distinct grommets at 6.7 mm overall height; an individual first-opening fit-test STL is provided.

### Further user physical fit feedback

- RB35S fit envelope 100 mm, telemetry total inner length 46 mm including clearance, light-controller measured body 52.5 × 52.5 × 16.5 mm.
- Retained all successful mounting centres. Removed pump locating ribs for screw-only retention. Added PGC's missing pair of ribs plus mounting-foot openings.
- Added one-time fit and holder migration markers, with regression coverage for old snapshots, positions/rotations, hole preservation and subsequent manual edits.
- All 68 tests pass, including exact cavity probes, four PGC rails and foot clearances, light-controller dimensions, pump rib removal, watertight STL and updated template connectivity. Revised component fit coupons and complete T-One STL generated successfully.

### SP-1 body-offset sanity check

- Reconciled the 51 mm case and 7/17.75 mm front/rear dimensions, keeping the physically confirmed 26 × 32 mm mounting centres. Front is the nipple end (+X); case/ribs move −5.375 mm relative to the hole-pattern origin.
- Restored four locating ribs and retained boss reliefs. Body offsets now consistently affect footprint checks, wall generation, SVG, references, keepouts and strap slots, while leaving mounting holes fixed.
- Added regressions for the measurement arithmetic, 0°/37°/180° exports, front/rear rib probes, clear boss windows and one-time migration without moving placements or overwriting later edits. All 71 tests passed.
- Updated the built-in T-One cable slot X=78 → 82.2 mm to avoid the restored rib. Existing user slot positions are preserved.

### Uploaded T-One copy adopted as default

- Replaced the built-in snapshot with the supplied `T-One radio tray copy.tray.json`; retained all placements, rotations, dimensions, offsets, holder settings, servo header and GSU label.
- Template creation now only creates fresh IDs and document metadata. Regression comparison checks every other field against the approved snapshot.
- Generated meshes from the upload and new template are identical: one connected solid, 10,754 triangles. All 71 tests and Pages build pass. Updated complete T-One STL matches the uploaded geometry.

### Light-controller opening width doubled

- Added independent tab `openingWidth` so increasing rib relief does not enlarge reference mounting feet or their footprint checks.
- Standard light-controller reliefs upgrade 16 → 32 mm once; body, holes and placements remain unchanged. Default T-One snapshot and affected STLs regenerated.
- All 73 tests pass, including widened CSG gap probes, preserved remaining ribs, connected watertight export and protection of later manual edits. Pages compilation passed.

### UAT mounting-plate outline

- Extracted the STL bottom-face boundary: 60 × 29.91702 mm, centred at (0, −0.04149), plate thickness 3 mm. Mesh vertices below 2.5 mm remain within this footprint.
- Added four integrated 2.5 mm ribs with 0.3 mm per-side clearance; preview and export use mounting-plate dimensions while retaining the full mount's overhang as a reference/check footprint.
- All 76 tests pass, including comparison against source STL, rotated outlines, unchanged screw centres, connected watertight exports, reference exclusion and one-time saved-design updates.
- Updated the approved default with only the UAT outline and added the UAT-only fit-test STL. All other uploaded placements and settings remain unchanged.
