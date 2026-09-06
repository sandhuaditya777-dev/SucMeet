import { Metadata } from 'next';
import { RoomPageClient } from '@/components/room/RoomPageClient';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Room: ${params.slug}` };
}

export default function RoomPage({ params }: Props) {
  return <RoomPageClient slug={params.slug} />;
}
