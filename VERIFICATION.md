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
