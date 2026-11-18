'use client';

import type { Profile } from '@/lib/types';

export default function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <aside className="card">
      <div className="body">
        <h4>{profile.display_name}</h4>
        <p className="muted">Hearth seller</p>
      </div>
    </aside>
  );
}
