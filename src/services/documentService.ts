export async function findDocumentImages() {
  const res = await fetch('https://picsum.photos/v2/list?page=1&limit=12');
  return await res.json();
}
