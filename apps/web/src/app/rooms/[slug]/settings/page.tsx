import { RoomSettingsClient } from '@/components/room/RoomSettingsClient';

interface Props {
  params: { slug: string };
}

export function generateMetadata({ params }: Props) {
  return { title: `Settings — ${params.slug}` };
}

export default function RoomSettingsPage({ params }: Props) {
  return <RoomSettingsClient slug={params.slug} />;
}
