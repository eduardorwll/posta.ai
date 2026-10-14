import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** Limite de resolução: 1280x720 em paisagem, 720x1280 em retrato. */
const MAX_LONG_SIDE = 1280;
const MAX_SHORT_SIDE = 720;
const JPEG_QUALITY = 0.8;

export type CompressedImage = {
  uri: string;
  width: number;
  height: number;
};

/**
 * Calcula o tamanho final mantendo a proporção, sem nunca ampliar a imagem.
 * A caixa limite acompanha a orientação da foto.
 */
function fitWithinBounds(width: number, height: number) {
  const isLandscape = width >= height;
  const maxWidth = isLandscape ? MAX_LONG_SIDE : MAX_SHORT_SIDE;
  const maxHeight = isLandscape ? MAX_SHORT_SIDE : MAX_LONG_SIDE;
  const scale = Math.min(1, maxWidth / width, maxHeight / height);

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

/**
 * Redimensiona (máx. 1280x720) e recomprime como JPEG com 80% de qualidade.
 * O arquivo resultante é salvo no diretório de cache do app.
 */
export async function compressImage(
  uri: string,
  knownWidth?: number,
  knownHeight?: number
): Promise<CompressedImage> {
  const context = ImageManipulator.manipulate(uri);

  try {
    let width = knownWidth ?? 0;
    let height = knownHeight ?? 0;

    // Alguns provedores não informam as dimensões; nesse caso lemos da própria imagem.
    if (!width || !height) {
      const original = await context.renderAsync();
      width = original.width;
      height = original.height;
      original.release();
    }

    const target = fitWithinBounds(width, height);
    if (target.width !== width || target.height !== height) {
      context.resize(target);
    }

    const rendered = await context.renderAsync();
    const result = await rendered.saveAsync({
      format: SaveFormat.JPEG,
      compress: JPEG_QUALITY,
    });
    rendered.release();

    return { uri: result.uri, width: result.width, height: result.height };
  } finally {
    context.release();
  }
}
