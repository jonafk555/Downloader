function downloadPreloadImages() {
  const links = document.querySelectorAll('link[rel="preload"][as="image"]');

  if (links.length === 0) {
    console.warn('找不到任何 preload image 標籤');
    return;
  }

  links.forEach((link, index) => {
    const url = link.href;
    if (!url) return;

    const filename = url.split('/').pop().split('?')[0] || `image_${index}.jpg`;

    // 先嘗試 fetch（同源或有 CORS header 時有效）
    fetch(url, { mode: 'cors', credentials: 'omit' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        triggerDownload(URL.createObjectURL(blob), filename);
        console.log(`✅ fetch 下載完成：${filename}`);
      })
      .catch(() => {
        // CORS 失敗 → fallback：用 Image 轉 Canvas
        console.warn(`⚠️ fetch 被 CORS 擋住，嘗試 Canvas 轉存：${filename}`);
        downloadViaCanvas(url, filename);
      });
  });
}

// Canvas fallback（伺服器需支援 crossorigin，否則會 tainted）
function downloadViaCanvas(url, filename) {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        triggerDownload(URL.createObjectURL(blob), filename);
        console.log(`✅ Canvas 下載完成：${filename}`);
      }, 'image/jpeg', 1.0);
    } catch (e) {
      // Canvas 被 tainted → 最後手段：直接開新分頁讓使用者手動存
      console.warn(`⚠️ Canvas tainted，改為開新分頁：${filename}`);
      downloadViaNewTab(url);
    }
  };

  img.onerror = () => {
    console.warn(`⚠️ Image 載入失敗，改為開新分頁：${filename}`);
    downloadViaNewTab(url);
  };

  img.src = url + (url.includes('?') ? '&' : '?') + '_cb=' + Date.now(); // 避免快取干擾
}

// 最後手段：開新分頁（使用者可右鍵另存）
function downloadViaNewTab(url) {
  const w = window.open(url, '_blank');
  if (!w) console.error('❌ 無法開新分頁，請允許彈出視窗');
}

function triggerDownload(href, filename) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(href), 5000);
}

downloadPreloadImages();
