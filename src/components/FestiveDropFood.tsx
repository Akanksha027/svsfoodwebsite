import Image from "next/image";

type FestiveDropFoodProps = {
  src: string;
  alt: string;
  size?: number;
  scale?: number;
};

export default function FestiveDropFood({
  src,
  alt,
  size = 56,
  scale = 1,
}: FestiveDropFoodProps) {
  const px = Math.round(size * scale);

  return (
    <div
      className="festive-drop-food"
      style={{ width: px, height: px }}
    >
      <Image
        src={src}
        alt={alt}
        width={px}
        height={px}
        className="festive-drop-food-img"
        draggable={false}
        sizes={`${px}px`}
      />
    </div>
  );
}
