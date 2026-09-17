// GANTI URL INI DENGAN URL DEPLOYMENT GOOGLE APPS SCRIPT ANDA!
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxTyyjaf5nVVY0hpK5pjmh3jP6hlg0lzCGnszJjddvTQf3jdxLX08uxoLGYLxbZQTKc/exec";

export const submitClaimData = async (data, action = "insert", id = null) => {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ ...data, action, id }),
    });
    return await response.json();
  } catch (error) {
    throw new Error("Koneksi ke server gagal");
  }
};

export const getClaimHistory = async () => {
  try {
    const noCacheUrl = `${SCRIPT_URL}?t=${new Date().getTime()}`;
    const response = await fetch(noCacheUrl, { method: "GET", redirect: "follow" });
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Gagal mengambil riwayat: ", error);
    return [];
  }
};
