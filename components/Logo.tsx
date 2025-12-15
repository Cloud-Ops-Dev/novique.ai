import Image from 'next/image';

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/novique-logo2.png"
      alt="Novique - AI Solutions for Your Business"
      width={400}
      height={300}
      className={className}
      priority
    />
  );
}
