import { useState } from 'react';
import { npubEncode } from 'nostr-tools/nip19';
import { hasNostrSigner } from '../api/nostrApi';
import { useLinkNostrKey, useNostrIdentity, useUnlinkNostrKey } from '../hooks/useNostrIdentity';

interface NostrIdentitySectionProps {
  userId?: string;
}

function shortNpub(pubkey: string): string {
  const npub = npubEncode(pubkey);
  return `${npub.slice(0, 12)}…${npub.slice(-6)}`;
}

export default function NostrIdentitySection({ userId }: NostrIdentitySectionProps) {
  const { data: identity, isLoading } = useNostrIdentity(userId);
  const link = useLinkNostrKey(userId);
  const unlink = useUnlinkNostrKey(userId);
  const [signerAvailable] = useState(hasNostrSigner);

  const busy = link.isPending || unlink.isPending;
  const error = (link.error || unlink.error) as Error | null;
  const nip05 =
    identity?.pubkey && identity.slug ? `${identity.slug}@${window.location.host}` : null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Nostr identity</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Link your Nostr key to get a verified address on this community (NIP-05). Nostr apps will
        show your posts as coming from a member here.
      </p>

      {isLoading ? null : identity?.pubkey ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Linked key: <code className="font-mono">{shortNpub(identity.pubkey)}</code>
          </p>
          {nip05 && (
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Your Nostr address: <code className="font-mono">{nip05}</code>. Add it as the NIP-05
              identifier in your Nostr profile.
            </p>
          )}
          <button
            type="button"
            onClick={() => unlink.mutate()}
            disabled={busy}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm
                      text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700
                      transition-colors disabled:opacity-70"
          >
            {unlink.isPending ? 'Unlinking…' : 'Unlink key'}
          </button>
        </div>
      ) : signerAvailable ? (
        <button
          type="button"
          onClick={() => link.mutate()}
          disabled={busy || !userId}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600
                    transition-colors disabled:opacity-70"
        >
          {link.isPending ? 'Waiting for signature…' : 'Link with browser extension'}
        </button>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          To link a key, install a Nostr signer extension such as Alby or nos2x, then reload this
          page.
        </p>
      )}

      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error.message}</p>}
    </div>
  );
}
