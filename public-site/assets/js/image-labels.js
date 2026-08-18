/* ============================================================
   TEPIA GROUP — image fallback
   Wraps every content <img> so that if the underlying photo
   fails to load (offline preview, blocked CDN, etc.) a clean
   placeholder pattern renders instead of a broken-image icon.
   No visible label — purely a graceful fallback.
   ============================================================ */
(function () {
  "use strict";

  function scan(root) {
    (root || document).querySelectorAll("main img, .site-header img, .site-footer img").forEach((img) => {
      // Skip the brand logo — that's not a content photo slot.
      if (img.closest(".logo-badge") || img.closest(".footer-brand")) return;
      if (img.dataset.noSlot !== undefined) return;
      if (img.closest(".img-slot")) return; // already wrapped

      let wrapper = img.parentElement;
      const alreadySlot = wrapper && wrapper.classList.contains("img-slot");
      if (!alreadySlot) {
        wrapper = document.createElement("span");
        wrapper.className = "img-slot";
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
      }

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

