import { api } from "../utils/api";

const HERO_BASE_PATH = "/api/hero";

const normalizeSlide = (item, index) => {
  const image = item?.image || item?.url || "";
  if (!image) return null;

  return {
    _id: item?._id || item?.id || `slide-${index + 1}`,
    image,
    order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index + 1,
    public_id: item?.public_id || "",
  };
};

const normalizeSlides = (items) =>
  (Array.isArray(items) ? items : [])
    .map((item, index) => normalizeSlide(item, index))
    .filter(Boolean)
    .sort((a, b) => a.order - b.order);

export async function getHeroSlides() {
  const data = await api.get(HERO_BASE_PATH);
  return normalizeSlides(data?.images);
}

export async function uploadHeroSlides(formData, token) {
  const data = await api.upload(`${HERO_BASE_PATH}/add`, formData, token);
  return normalizeSlides(data?.images);
}

export async function deleteHeroSlide(imageId, token) {
  const data = await api.delete(`${HERO_BASE_PATH}/${imageId}`, token);
  return normalizeSlides(data?.images);
}
