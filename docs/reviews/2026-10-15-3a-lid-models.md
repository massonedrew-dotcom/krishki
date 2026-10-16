# Review — task 3a, Blender lid models (threed-dev)

Date: 2026-10-15 · Reviewer: lead architect · Verdict: **changes requested (minor)**

## Checked by the lead
- Rebuilt SKO headless into a temp folder: 1.6 s, 27,648 tris, height 8.61 mm — matches the report; script is reproducible.
- Scope: only scripts/blender, assets/blender, qa/screens/3d. No HDRI, no third-party assets, no client artwork.
- Looked at sko-top34, sko-side, sko-under, twist-red-top34, twist-green-under.

## Good
SKO top: ribs and gold lacquer read as a real lid. SKO underside: silver enamel + red-brown wikel ring look right. Twist-Off: vacuum button and recessed panel are clear. Tri budget met.

## Changes requested
1. **SKO curl shows as a separate silver band** (sko-top34 bottom edge, sko-side: thin silver line under the gold skirt). In the catalog photos the stacked SKO lids are gold to the very edge. Make the visible outer face of the curl use the outside gold material (or roll the curl so the gold side faces out).
2. **Twist-Off top edge has a cream/white rim** (twist-red-top34: thin light ring around the top). On real Twist-Off lids the colour continues over the top shoulder onto the skirt; the inner lacquer must not be visible from above. Fix the material split on the shoulder/curl.
3. **Twist-Off lugs deform the outer skirt into waves** (twist-green-under rim, twist-red-top34 silhouette). Real lugs are small tabs pressed inward at the bottom curl; the outer skirt stays round with at most a small local dent near the bottom edge. Reduce the deformation to the lower ~2–3 mm of the skirt.
4. Re-render the 9 previews and overwrite them in qa/screens/3d/.

## Accepted as is (open for client)
Dimensions are assumptions (TODO(client) drawings). Placeholder litho texture. GLB size check moves to phase 2.

## Re-review (same day) — **accepted**
Checked sko-top34, sko-side, twist-red-top34, twist-green-under after the fix:
1. SKO is gold to the very edge, no silver band — fixed (curl rolled inward, ring widened to r 35.9–39.6 mm).
2. Twist-Off top rim is gone — root cause was the plastisol poking through the shoulder corner, not the materials; fixed.
3. Twist-Off skirt silhouette is round; lugs visible only from below — fixed.
Tri counts unchanged (27,648 / 29,696). Non-blocking: in twist-green-under the outer green shows on the inner face of the curl at the lugs; plausible for a rolled edge, leave as is unless the client photo shows otherwise.
