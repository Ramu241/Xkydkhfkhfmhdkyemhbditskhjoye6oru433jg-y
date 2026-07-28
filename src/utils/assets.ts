// Asset images from the provided HTML reference

export const NUM_IMAGES: Record<number, string> = {
  0: 'https://i.ibb.co/0RHW04jF/file-00000000bfac720890107b7a8580742e-removebg-preview.png',
  1: 'https://i.ibb.co/gMNdsGY0/file-00000000af34720882f8606465a346e9-removebg-preview.png',
  2: 'https://i.ibb.co/tPZ6VjwV/file-00000000415872089e02b68e4f732ac9-removebg-preview.png',
  3: 'https://i.ibb.co/wTwv7j1/file-0000000030b87208af4d2c8d579e2241-removebg-preview.png',
  4: 'https://i.ibb.co/SwPcbJWs/file-00000000be807208942326be1ff60345-removebg-preview.png',
  5: 'https://i.ibb.co/nMkYcLRr/file-00000000af787208a0eac3c38bbdd84a-removebg-preview.png',
  6: 'https://i.ibb.co/6cxK5syg/file-00000000e0e0720889416b11b4946333-removebg-preview.png',
  7: 'https://i.ibb.co/1YVxnymd/file-00000000ab8472089276dfdcae21360e-removebg-preview.png',
  8: 'https://i.ibb.co/qYjkLt80/file-00000000b7d47208bb8145a4582ed00e-removebg-preview.png',
  9: 'https://i.ibb.co.com/jkChC1XQ/file-0000000008a471fba67287cf1f22ffbc.png',
};

export const SIZE_IMAGES = {
  Big: 'https://i.ibb.co/G3rxTbC7/IMG-20260718-193749-807-removebg-preview.png',
  Small: 'https://i.ibb.co/G30nY8Tb/IMG-20260718-193749-608-removebg-preview.png',
};

export const APP_TITLE = "🦋⃟≛⃝🇦𝒍𝒐𝒏𝒆≛⃝❤️࿐";
export const ALONE_AVATAR = '/alone_bhai_avatar.jpg';

export function getNumColor(n: number) {
  if (n === 0) return 'text-purple-400 border-purple-500/50 shadow-purple-500/30';
  if (n === 5) return 'text-emerald-400 border-emerald-500/50 shadow-emerald-500/30';
  if ([1, 3, 7, 9].includes(n)) return 'text-[#00ff88] border-[#00ff88]/50 shadow-[#00ff88]/30';
  return 'text-rose-500 border-rose-500/50 shadow-rose-500/30';
}
