# Nostr

Uluntu can take part in the [Nostr](https://nostr.com) network in two ways. Both are optional. The design and later stages are in [the Nostr federation evaluation](../research/nostr-federation.md).

1. **Member identity (NIP-05).** Members can link a Nostr key from their profile. Their address `<profile-slug>@<your-domain>` then verifies in Nostr apps.
2. **Publishing public content.** The site can publish its published events, news and opportunities to Nostr relays, signed with the community's own key. Nostr apps then show the community's calendar, articles and listings.

## Member identity

- **Linking:** on **Edit profile**, a member with a NIP-07 signer extension (Alby, nos2x and others) clicks **Link with browser extension**. The extension signs a short-lived kind 27235 event that names `/api/nostr/link` and the member's account. `api/nostr/link.ts` verifies it and stores the pubkey in `members.nostr_pubkey`.
- **Who can set the key:** only the server. A database trigger (`protect_member_nostr_pubkey`) stops members writing the column directly, so nobody can claim a key without signing for it.
- **Lookup:** `/.well-known/nostr.json?name=<slug>` is rewritten to `api/nostr/nip05.ts`. It returns the key for published members who linked one, and `?name=_` returns the community's own key. Without a name it returns nothing, so it can't be used to list members.
- **Unlinking:** the same page has an **Unlink key** button.

No configuration is needed for member identity. `?name=_` only answers once `NOSTR_SECRET_KEY` is set.

## Publishing public content

`api/nostr/publish.ts` builds one Nostr event per published row:

| Content | Kind | NIP |
|---|---|---|
| Events | 31923 (time-based calendar event) | NIP-52 |
| News | 30023 (long-form article, HTML converted to Markdown) | NIP-23 |
| Opportunities | 30402 (classified listing) | NIP-99 |
| The community's profile | 0 | NIP-01 |

Each event uses the row's UUID as its `d` tag, so editing a row replaces the earlier version on relays. When a row stops being published, the next run sends a NIP-09 deletion request.

**Never published:** contact details (`contact_email`, `contact_info`, websites on opportunities), the member directory, marketplace listings, and anything not `published`.

The `nostr_publications` table records what was sent and a hash of each event, so unchanged rows are skipped. Admins can read it; only the server writes it.

### Turning it on

Relays may keep events after a deletion request, so **anything you publish should be treated as permanent**. Publishing is off until you turn it on, and you should review a dry run first.

1. **Generate an instance key**, for example with `nak key generate` or `node -e "import('nostr-tools/pure').then(m=>console.log(Buffer.from(m.generateSecretKey()).toString('hex')))"`. Store it somewhere safe; it is the community's identity on Nostr.
2. **Set the server environment variables** in Vercel (never with a `VITE_` prefix):
   - `NOSTR_SECRET_KEY`
   - `SITE_URL`, e.g. `https://uluntu.io`
   - `CRON_SECRET`
   - optionally `NOSTR_RELAYS`, `NOSTR_PROFILE_NAME`, `NOSTR_PROFILE_ABOUT`, `NOSTR_PROFILE_PICTURE` and `NOSTR_EVENT_TIMEZONE`

   See `.env.example`.
3. **Review a dry run.** As a site admin, call `GET /api/nostr/publish?dry_run=1` with your Supabase access token as a Bearer token. It returns every event that would be signed, without sending anything.
4. **Set `NOSTR_PUBLISH_ENABLED=true`** and redeploy.

A daily Vercel cron (`vercel.json`) then calls the endpoint. An admin can also run it on demand with `POST /api/nostr/publish`. Each run sends at most 25 events and reports how many remain.

### Self-hosting

The endpoints are Vercel functions. The Docker/nginx setup doesn't include them (see [Deployment](../deployment/README.md)).
