import * as React from 'react';
import { Button } from '../../components/Button';
import { ProfileCard } from '../../components/ProfileCard';
import './Today.css';

export interface Sighting {
  /** Stable key for the entry. */
  id: string;
  /** Species seen. */
  species: string;
  /** Count, place and time, as one line. */
  detail: string;
  /** Two letters shown in the avatar. */
  initials: string;
}

export interface TodayProps {
  /** The day shown, already formatted for the reader. */
  date: string;
  /** What was seen, newest first. */
  sightings: Sighting[];
  /** `loading` shows placeholders where the list will be; `error` shows `errorMessage` and a way to retry. */
  status?: 'loaded' | 'loading' | 'error';
  /** What went wrong, in words the person can act on. */
  errorMessage?: string;
  /** Opens the form to log a new sighting. */
  onLog?: () => void;
  /** Tries loading the list again. */
  onRetry?: () => void;
}

/** Today's sightings: the date, the one main action, and what was seen. Built only from the project's components. */
export function Today({ date, sightings, status = 'loaded', errorMessage, onLog, onRetry }: TodayProps) {
  return (
    <main className="sample-today" data-slot="screen">
      <header className="sample-today__header" data-slot="header">
        <div>
          <h1 className="sample-today__title" data-slot="title">Today</h1>
          <p className="sample-today__date" data-slot="date">{date}</p>
        </div>
        <Button onClick={onLog}>Log a sighting</Button>
      </header>
      {status === 'loading' ? (
        <ul className="sample-today__list" data-slot="list" aria-busy="true" aria-label="Loading sightings">
          {[0, 1, 2].map((i) => <li key={i} className="sample-today__placeholder" data-slot="placeholder" />)}
        </ul>
      ) : status === 'error' ? (
        <div className="sample-today__message" role="alert" data-slot="message">
          <p>{errorMessage ?? 'The list could not be loaded.'}</p>
          <Button variant="secondary" onClick={onRetry}>Try again</Button>
        </div>
      ) : sightings.length === 0 ? (
        <p className="sample-today__message" data-slot="message">Nothing logged yet today. Use Log a sighting to add the first one.</p>
      ) : (
        <ul className="sample-today__list" data-slot="list" aria-label="Sightings">
          {sightings.map((s) => (
            <li key={s.id} data-slot="item"><ProfileCard name={s.species} bio={s.detail} initials={s.initials} headingLevel={2} /></li>
          ))}
        </ul>
      )}
    </main>
  );
}
