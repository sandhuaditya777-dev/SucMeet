import { InvitePageClient } from '@/components/invite/InvitePageClient';

interface Props {
  params: { token: string };
}

export default function InvitePage({ params }: Props) {
  return <InvitePageClient token={params.token} />;
}
