// Links de download do app, usados pela landing page e pela página de download

const appStoreUrl = "https://apps.apple.com/br/app//spotify-music-and-podcasts/id324684580";
const playStoreUrl = "https://play.google.com/store/apps/details?id=com.spotify.music";
const downloadPageUrl = "https://quimia.tech/download";

// Retorna o link da loja do aparelho, ou null se não for iOS nem Android
function getMobileStoreUrl() {
  const userAgent = navigator.userAgent;

  const isIOS =
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (navigator.platform === "MacIntel" &&
     navigator.maxTouchPoints > 1);

  const isAndroid = /Android/i.test(userAgent);

  if (isIOS) {
    return appStoreUrl;
  }

  if (isAndroid) {
    return playStoreUrl;
  }

  return null;
}
