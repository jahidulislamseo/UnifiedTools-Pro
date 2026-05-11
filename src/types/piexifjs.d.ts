declare module 'piexifjs' {
  export const ImageIFD: Record<string, number>;
  export const ExifIFD: Record<string, number>;
  export const GPSIFD: Record<string, number>;
  export function dump(obj: unknown): string;
  export function insert(exif: string, image: string): string;
  export function load(image: string): unknown;
  const piexif: {
    ImageIFD: typeof ImageIFD;
    ExifIFD: typeof ExifIFD;
    GPSIFD: typeof GPSIFD;
    dump: (obj: unknown) => string;
    insert: (exif: string, image: string) => string;
    load: (image: string) => unknown;
  };
  export default piexif;
}
