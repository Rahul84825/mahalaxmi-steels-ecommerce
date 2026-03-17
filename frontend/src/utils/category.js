const toStringValue = (value) => (typeof value === "string" ? value.trim() : "");

const normalizeNameToSlug = (name = "") =>
  String(name)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\(|\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getCategoryLabel = (category, categories = []) => {
  if (!category) return "";

  if (typeof category === "object") {
    return category.label || category.name || "";
  }

  const key = toStringValue(category).toLowerCase();
  if (!key) return "";

  const found = (categories || []).find((item) => {
    const id = item?._id || item?.id;
    return id === category || item?.slug === key || normalizeNameToSlug(item?.name) === key;
  });

  return found?.label || found?.name || "";
};

export const getCategorySlug = (category, categories = []) => {
  if (!category) return "";

  if (typeof category === "object") {
    return category.slug || category._id || category.id || normalizeNameToSlug(category.name || category.label || "");
  }

  const key = toStringValue(category).toLowerCase();
  const found = (categories || []).find((item) => (item?._id || item?.id) === category);

  if (found?.slug) return found.slug;
  return key;
};

export const isCategoryMatch = (productCategory, selectedCategory, categories = []) => {
  if (!selectedCategory || selectedCategory === "all") return true;

  const selected = String(selectedCategory).toLowerCase();

  if (typeof productCategory === "object") {
    const objectId = String(productCategory._id || productCategory.id || "");
    const objectSlug = String(productCategory.slug || "").toLowerCase();
    const objectNameSlug = normalizeNameToSlug(productCategory.name || productCategory.label || "");

    return objectId === selectedCategory || objectSlug === selected || objectNameSlug === selected;
  }

  const value = String(productCategory || "").toLowerCase();
  if (value === selected) return true;

  const found = (categories || []).find(
    (item) =>
      String(item?._id || item?.id) === String(productCategory) ||
      String(item?.slug || "").toLowerCase() === value
  );

  if (!found) return false;

  return (
    String(found?._id || found?.id) === String(selectedCategory) ||
    String(found?.slug || "").toLowerCase() === selected ||
    normalizeNameToSlug(found?.name || found?.label || "") === selected
  );
};
