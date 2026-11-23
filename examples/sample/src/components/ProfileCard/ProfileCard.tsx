import * as React from 'react';
import './ProfileCard.css';

export interface ProfileCardProps {
  /** Person's name. */
  name: string;
  /** Short description. */
  bio: string;
  /** Initials shown in the avatar. */
  initials: string;
}

/** A profile summary: stacked on phones, side by side from the tablet breakpoint. */
export function ProfileCard({ name, bio, initials }: ProfileCardProps) {
  return (
    <article className="sample-profile" data-slot="profile-card">
      <span className="sample-profile__avatar" data-slot="avatar" aria-hidden="true">{initials}</span>
      <div data-slot="content">
        <h3 className="sample-profile__name" data-slot="name">{name}</h3>
        <p className="sample-profile__bio" data-slot="bio">{bio}</p>
      </div>
    </article>
  );
}
