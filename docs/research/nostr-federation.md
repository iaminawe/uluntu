# Nostr for Federated Uluntu Communities: Evaluation

**Date:** 2026-11-08 · **Scope:** read-only research, no code changes · **Verdict:** Worth adopting in stages, with Supabase kept as the source of truth. The first two stages are useful on their own and cheap to build: public content published as signed Nostr events, and Nostr identity for members. Treat NIP-29 relay groups as a pilot. Don't make a relay the primary datastore.

---

## 1. What Nostr is, in Uluntu terms

Nostr is a protocol, not a platform. Users are keypairs. Content is JSON *events* signed by the user's key. *Relays* are simple servers that store and serve events over WebSockets. There is no global server and no account registry. A user's key works with any relay and any client. Interoperability is defined by NIPs (Nostr Implementation Possibilities).

Nostr federation works differently from ActivityPub. In ActivityPub (Mastodon, Lemmy), each server owns its users' accounts and pushes activities to other servers. In Nostr, users own their identity, and clients read from and write to whichever relays they choose. Two Uluntu instances could federate by publishing to relays the other reads, with no server-to-server protocol and no trust handshake.

## 2. Mapping Uluntu features to NIPs

| Uluntu feature | Nostr equivalent | Fit |
|---|---|---|
| Groups (open, closed, private) | **NIP-29** relay-based groups: membership, roles and moderation enforced by the relay. Flags `private`, `restricted`, `closed` and `hidden`; invite codes; subgroups (added July 2026). | Good. Close to Uluntu's `open`/`closed` visibility model. |
| Group discussion and chat | NIP-29 chat (kind 9 and others carrying an `h` tag); threaded comments (NIP-22, kind 1111) | Good |
| Events | **NIP-52** calendar events (kinds 31922 and 31923), calendars (31924) and RSVPs (31925) | Good. `date`, `end_date`, `location`, `latitude` and `longitude` map directly. |
| Marketplace | **NIP-99** classified listings (kind 30402) | Good, apart from `contact_info`, which shouldn't be published. |
| News and long posts | **NIP-23** long-form content (kind 30023) | Good |
| Opportunities and resources | NIP-99 or NIP-23 with tags, or a custom addressable kind | Workable, but there's no standard kind. |
| Member directory | Profile metadata (kind 0) plus **NIP-05** identifiers (`alice@uluntu.io`) | Partial. The directory holds personal data members haven't agreed to publish. |
| Direct messages | **NIP-17** private DMs (gift-wrapped, metadata-hiding) | Possible, but only with client-side keys. See section 4. |
| Media | Blossom (NIP-B7) media servers | Optional. Supabase Storage can keep serving files by URL. |
| Badges and roles | NIP-58 badges | Nice to have |
| Moderation reports | NIP-56 reports (kind 1984) | Partial. Reports are advisory, and each relay or client decides. |

Uluntu's feature set lines up with existing NIPs better than most apps do. Almost every content type has a standard kind that other Nostr clients already render.

### State of community NIPs (Nov 2026)

- **NIP-29** (relay-based groups) is the recommended path. NIP-72 (moderated communities) and NIP-28 (public chat) are now marked *unrecommended, try NIP-29 instead*.
- In July 2026, NIP-29 gained subgroups ("spaces") with `parent`/`child` tags, along with rules for moving a group to another relay and telling a legitimate move from a fork.
- Client support is growing:
  - Amethyst 1.13 added NIP-29 groups, group deletion and relay auth.
  - Dedicated clients include Flotilla (Discord-style), Chachi and Nostrord.
  - Libraries include swift-nostr and algia.
  - As of July 2026, no client had shipped subgroups or relay migration.
- Relays that support NIP-29: `relay29` (fiatjaf's reference implementation), **zooid** (Flotilla's companion community relay), and public hosts such as `groups.fiatjaf.com`.

## 3. What federation could look like

### 3.1 One instance, open to the Nostr network

- uluntu.io keeps its Supabase database, auth and admin tooling.
- It runs one community relay, for example `wss://relay.uluntu.io`, a zooid or relay29 instance deployed alongside the Docker setup.
- Public content (events, news, opportunities, listings) is published there as signed events.
- People on Amethyst, Flotilla, Coracle and other clients can follow the community's calendar, read its news and join its groups without an Uluntu account.

### 3.2 Many instances sharing content

Picture Uluntu sites for several towns in a region. Each runs its own relay and instance key. The instances federate through:
- **Subscriptions:** instance A adds instance B's relay and pubkey to its "partner communities" list, then imports B's NIP-52 events, filtered by tags such as `t:tech` or `g:` (geohash). They appear on A's calendar marked as coming from B.
- **Portable identity:** a member with a Nostr key can join groups on any instance with the same identity. Their NIP-05 name (`alice@nelson.example`) shows which community vouches for them.
- **Movable groups:** NIP-29 groups can be replicated or moved between relays, so a group can outlive the instance that started it.

Each instance stays in control of its own moderation. It decides which partner content it imports and displays, which matches how NIP-29 leaves policy to each relay.

## 4. The hard problems

1. **Key custody.** Members sign up with email through Supabase Auth and have no Nostr keys. The options are:
   - **Custodial keys:** the server generates and stores a key per member and signs on their behalf. This is easy, but Uluntu then holds signing keys, which become a breach target and need encryption at rest, separate from the database.
   - **Bring your own key:** login with NIP-07 (browser extension) or NIP-46 (remote signer). This is correct, but most community members won't have a key.
   - **Hybrid (recommended if this goes ahead):** the instance key signs community-level content (calendar, news). Members can link their own key optionally, and only linked members' posts federate as themselves.

2. **Publishing can't be undone.** Once an event reaches other relays, a deletion request (NIP-09, kind 5) is only a request. This conflicts with privacy expectations and data-deletion requests. Publishing must be opt-in, and never cover the member directory, contact details or `contact_info`.

3. **Private data.** A NIP-29 `private` group is only as private as its relay. Events are signed but not encrypted. NIP-17 DMs are properly end-to-end encrypted, but need client-side keys, and Uluntu's admin and moderation tools couldn't read them.

4. **Moderation across instances.** Uluntu can moderate what it stores and displays, but not what other relays hold. Imported partner content needs its own review queue, or an allowlist of trusted pubkeys.

5. **Two sources of truth.** Mirroring between Postgres and a relay needs a sync job, idempotent event IDs, and a decision about which side wins on edits. Addressable kinds (31922, 30402, 30023) help, because each edit replaces the previous version under the same `d` tag, which can be the row's UUID.

6. **Hosting.** A relay needs long-lived WebSocket connections and persistent storage. Vercel Functions now support WebSockets, but a relay is a better fit for a small VPS or container. That means a second piece of infrastructure next to Vercel, which fits the existing `docker-compose.yml` self-hosting path.

7. **Spam and abuse.** The community relay should only accept writes from authenticated members (NIP-42 AUTH) and from the instance key.

## 5. Suggested stages

| Stage | What | Effort | Risk |
|---|---|---|---|
| 1. NIP-05 identity | `api/.well-known/nostr.json` (or a rewrite in `vercel.json`) maps opted-in members' names to their linked pubkeys. Add a "link Nostr key" field to the profile, verified with a NIP-07 signature. | Small | Low |
| 2. Publish public content | A server job signs events, news and opportunities with the instance key and publishes them to a few public relays plus the instance's own relay. It uses addressable kinds keyed by row UUID, so edits replace earlier versions and deletions send kind 5. Read-only for the outside world. | Small–medium | Low. Content is already public on uluntu.io. |
| 3. Import partner calendars | Subscribe to allowlisted partner pubkeys' NIP-52 events and show them on the calendar with attribution. This is the first real federation between instances. | Medium | Medium (moderation) |
| 4. Pilot a NIP-29 group | Run zooid or relay29 and back one Uluntu group with a NIP-29 group. Members with linked keys post from Uluntu or from Flotilla, Chachi or Amethyst, and Uluntu mirrors posts into Postgres for display and search. | Medium–large | Medium. Key custody and two-way sync. |
| 5. Nostr-native groups and DMs | Make relays authoritative for groups and messaging. | Large (rewrite of `groups` and `messaging`) | High. Only worth it if stage 4 shows real outside use. |

Stages 1–2 are worth doing even if federation goes no further. They give members portable, verifiable identities and put community content where Nostr users already read.

## 6. Open questions for maintainers

- Is the goal reach (more people see uluntu.io content) or a network of Uluntu instances? Stage 2 serves the first, and stage 3 is the start of the second.
- Are custodial member keys acceptable, or must federation be opt-in with the member's own key?
- Who hosts the relay for each instance, and is that a requirement for self-hosters or optional?
- Should ActivityPub be evaluated alongside Nostr? It reaches more people today (Mastodon, Lemmy groups via FEP-1b12), but it ties identity to the server, which fits Supabase's account model more naturally.

## Sources

- [NIP-29: Relay-based Groups](https://github.com/nostr-protocol/nips/blob/master/29.md)
- [NIP-72: Moderated Communities (marked unrecommended)](https://github.com/nostr-protocol/nips/blob/master/72.md)
- [Nostr Compass #33 (July 2026): NIP-29 subgroups, migration rules, client support](https://nostrcompass.org/en/newsletters/2026-07-29-newsletter/)
- [Flotilla: Discord-like Nostr client for relay-based communities](https://nobsbitcoin.com/flotilla-v0-1)
- [Chachi: relay-based group chat client](https://nobsbitcoin.com/chachi-chat)
- [Nostrord: NIP-29 group chat client](https://nostrord.com/blog/introducing-nostrord.html)
- [NIP index](https://nips.nostr.com/)
