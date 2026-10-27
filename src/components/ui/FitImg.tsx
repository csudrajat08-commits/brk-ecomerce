import type { ImageAsset } from '../../types/commerce';
import { cn } from '../../lib/format';
import { Img } from './Img';

interface Props {
  asset: ImageAsset;
  /** Frame aspect ratio (width / height) the image is shown in */
  frameRatio: number;
  sizes?: string;
  className?: string;
  /** How far the photo's ratio may differ from the frame before we stop cropping (0.25 = 25 %) */
  tolerance?: number;
}

/**
 * Fills a frame without butchering the photo. If the photo's shape is close to
 * the frame it is cropped normally (cover); if not — e.g. a landscape banner in
 * a portrait tile — the whole photo is shown, sitting on a soft blurred copy of
 * itself so the tile still reads as full.
 */
export function FitImg({ asset, frameRatio, sizes, className, tolerance = 0.25 }: Props) {
  const mismatch = Math.abs(asset.ratio / frameRatio - 1);
  if (asset.pending || mismatch <= tolerance) return <Img asset={asset} sizes={sizes} className={className} />;
  return (
    <>
      <Img asset={asset} sizes="64px" alt="" className="scale-110 opacity-70 blur-2xl" />
      <Img asset={asset} sizes={sizes} fit="contain" className={cn(className)} />
    </>
  );
}
