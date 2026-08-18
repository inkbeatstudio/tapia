/* ============================================================
   TEPIA GROUP — image slot labels
   Wraps every content <img> in a labelled "slot" so it's obvious,
   even before real photography is in place, exactly which image
   goes where and what it should show. If the underlying photo
   fails to load (offline preview, blocked CDN, etc.) a clean
   placeholder pattern renders instead of a broken-image icon.
   Purely cosmetic/dev-aid — safe to delete this script once all
   real photos are in place via the admin media library.
   ============================================================ */
(function () {
  "use strict";

  function labelText(img) {
    if (img.dataset.slotLabel) return img.dataset.slotLabel;
    return img.getAttribute("alt") || "Photo";
  }

  function scan(root) {
    (root || document).querySelectorAll("main img, .site-header img, .site-footer img").forEach((img) => {
      // Skip the brand logo — that's not a content photo slot.
      if (img.closest(".logo-badge") || img.closest(".footer-brand")) return;
      if (img.dataset.noSlot !== undefined) return;
      if (img.closest(".img-slot")) return; // already labelled

      let wrapper = img.parentElement;
      const alreadySlot = wrapper && wrapper.classList.contains("img-slot");
      if (!alreadySlot) {
        wrapper = document.createElement("span");
        wrapper.className = "img-slot";
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
      }

      const tag = document.createElement("span");
      tag.className = "img-slot-label";
      tag.textContent = labelText(img);
      wrapper.appendChild(tag);

      img.addEventListener(
        "error",
        () => {
          wrapper.classList.add("img-slot-broken");
        },
        { once: true }
      );
      // Handle images that already failed before this script ran.
      if (img.complete && img.naturalWidth === 0) {
        wrapper.classList.add("img-slot-broken");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => scan());
  if (document.readyState !== "loading") scan();

  window.TEPIA_IMG_LABELS = { scan };
})();

