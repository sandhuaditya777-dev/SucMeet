'use client';

import {
  useParticipants,
  useLocalParticipant,
  ParticipantTile as LKParticipantTile,
  TrackLoop,
  TrackRefContext,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { cn } from '@/lib/utils';

export function ParticipantGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const gridCols =
    tracks.length <= 1
      ? 'grid-cols-1'
      : tracks.length <= 4
      ? 'grid-cols-2'
      : tracks.length <= 9
      ? 'grid-cols-3'
      : 'grid-cols-4';

  return (
    <div className={cn('grid h-full w-full gap-1 p-1', gridCols)}>
      <TrackLoop tracks={tracks}>
        <TrackRefContext.Consumer>
          {(track) =>
            track ? (
              <LKParticipantTile
                key={`${track.participant.identity}-${track.source}`}
                trackRef={track}
                className="overflow-hidden rounded-xl"
              />
            ) : null
          }
        </TrackRefContext.Consumer>
      </TrackLoop>
    </div>
  );
}
