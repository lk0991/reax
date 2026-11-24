import * as React from 'react';
import './ProfileCard.css';

export interface ProfileCardProps {
  /** Person's name. */
  name: string;
  /** Short description. */
  bio: string;
  /** Initials shown in the avatar. */
  initials: string;
  /** Heading level of the name, so the card fits the outline of the page it is on. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

/** A profile summary: stacked on phones, side by side from the tablet breakpoint. */
export function ProfileCard({ name, bio, initials, headingLevel = 3 }: ProfileCardProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return (
    <article className="sample-profile" data-slot="profile-card">
      <span className="sample-profile__avatar" data-slot="avatar" aria-hidden="true">{initials}</span>
      <div data-slot="content">
        <Heading className="sample-profile__name" data-slot="name">{name}</Heading>
        <p className="sample-profile__bio" data-slot="bio">{bio}</p>
      </div>
    </article>
  );
}
