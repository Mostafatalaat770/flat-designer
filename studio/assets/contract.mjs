// Asset dimensions describe actual outside geometry; furniture dimensions are never a stretch target.
export function checkAsset(record) {
  if (!record || record.schema !== "ApartmentAsset/1")
    throw Error("Expected ApartmentAsset/1 metadata");
  if (!["m", "mm"].includes(record.units))
    throw Error("Declare asset units: m or mm");
  if (!["+Z", "-Z"].includes(record.forward_axis))
    throw Error("Declare furniture forward axis +Z or -Z");
  if (record.up_axis !== "+Y") throw Error("glTF must use +Y up");
  if (record.origin !== "center-floor")
    throw Error("Declare center-floor placement origin");
  if (!["GENERIC", "REFERENCE", "REAL_PRODUCT"].includes(record.fidelity))
    throw Error("Declare asset fidelity");
  if (!record.source || !record.license || !record.attribution)
    throw Error("Record source, license and attribution");
  if (
    [record.source, record.license, record.attribution].some((v) =>
      /^TBD/i.test(v),
    )
  )
    throw Error(
      "Replace metadata placeholders with actual source, license and author",
    );
  if (record.fidelity === "REAL_PRODUCT" && !record.product_reference_id)
    throw Error("Real product needs product_reference_id");
  if (
    !Array.isArray(record.dimensions_mm) ||
    record.dimensions_mm.length !== 3 ||
    !record.dimensions_mm.every((v) => Number.isFinite(v) && v > 0)
  )
    throw Error("Declare width, height and depth in mm");
  if(record.dimensions_mm[1]>2500)throw Error('Furniture asset exceeds the locked 2.50 m clear height');
  if (record.material_variants !== undefined) {
    if (
      !Array.isArray(record.material_variants) ||
      record.material_variants.length > 30
    )
      throw Error("Invalid material variants");
    for (const v of record.material_variants) {
      if (
        !v.id ||
        !v.name ||
        !["GENERIC", "REFERENCE", "REAL_MATERIAL"].includes(v.fidelity) ||
        !Array.isArray(v.changes)
      )
        throw Error("Declare material variant identity and fidelity");
      if (
        v.fidelity === "REAL_MATERIAL" &&
        (!v.material_reference_id || !v.source)
      )
        throw Error("Real material needs a material record and source");
      for (const c of v.changes)
        if (
          !c.material_name ||
          !/^#[0-9a-f]{6}$/i.test(c.base_colour) ||
          (c.roughness !== undefined &&
            !(c.roughness >= 0 && c.roughness <= 1)) ||
          (c.metalness !== undefined && !(c.metalness >= 0 && c.metalness <= 1))
        )
          throw Error("Invalid material variant finish");
    }
  }
  return record;
}
export function measureAsset(size, record, footprint) {
  checkAsset(record);
  const mm = size.map((v) => v * 1000);
  if (
    mm.some(
      (v, i) =>
        Math.abs(v - record.dimensions_mm[i]) >
        Math.max(5, record.dimensions_mm[i] * 0.01),
    )
  )
    throw Error("Measured GLB bounding box differs from declared dimensions");
  if (Math.abs(mm[0] - footprint[0]) > 5 || Math.abs(mm[2] - footprint[1]) > 5)
    throw Error(
      "Asset outside footprint differs from layout. Update and validate the furniture dimensions first; assets cannot be stretched.",
    );
  return mm;
}
