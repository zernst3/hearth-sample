'use client';

import { useState } from 'react';

export default function PhotoUploader({ listingId }: { listingId: string }) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'failed'>('idle');

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('uploading');
    const form = new FormData();
    form.append('file', file);
    form.append('filename', file.name);
    form.append('listingId', listingId);
    const res = await fetch('/api/uploads', { method: 'POST', body: form });
    setStatus(res.ok ? 'done' : 'failed');
  }

  return (
    <div className="form">
      <label>
        Add a photo
        <input type="file" accept="image/*" onChange={onChange} />
      </label>
      {status === 'uploading' ? <p className="muted">Uploading...</p> : null}
      {status === 'done' ? <p>Photo added.</p> : null}
      {status === 'failed' ? <p className="error">Upload failed.</p> : null}
    </div>
  );
}
