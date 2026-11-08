# Features

Each feature lives in its own module under `src/features/<name>/` with `api/`, `hooks/`, `components/` and `types/` folders. See [building a feature](../guides/feature-development.md) for the pattern.

| Area | What it does | Docs |
|------|--------------|------|
| Events | Community events with RSVPs, sessions and media galleries | [Events](events/README.md) |
| Groups | Public, private and secret groups with admin/moderator/member roles, posts and invitations | [Overview](groups/README.md), [API](groups/API.md) |
| Messaging | Real-time direct and group conversations with typing indicators | [Overview](messaging/README.md), [Deleting conversations](messaging/CONVERSATION_DELETION.md) |
| Photo galleries | Batch upload with compression, albums and per-entity galleries | [System](gallery/GALLERY_SYSTEM.md), [API](gallery/GALLERY_API_REFERENCE.md), [Schema](gallery/PHOTO_GALLERY_DATABASE_SCHEMA.md), [Admin guide](gallery/admin-guide.md), [Admin API](gallery/admin-api-reference.md) |
| Menus and navigation | Admin-editable menus, drag-and-drop ordering and feature toggles | [Overview](menu/README.md), [Toggles](menu/TOGGLE_SYSTEM.md), [Drag and drop](menu/DRAG_DROP.md), [Security](menu/SECURITY.md) |
| Dashboard | The signed-in member dashboard | [Overview](dashboard/README.md), [Architecture](dashboard/ARCHITECTURE.md), [API](dashboard/API.md) |
| Admin | User management, roles and gallery moderation | [Overview](admin/README.md), [Users](admin/users/GUIDE.md), [Galleries](admin/gallery/MANAGEMENT_SYSTEM.md) |
| Content | Author bylines and URL slugs for news, pages and listings | [Authors](content/authors.md), [Slugs](content/slugs.md) |
| Editors | BlockNote (with optional AI assistance) and Tiptap rich-text editing | [BlockNote](editor/blocknote.md), [Tiptap](editor/tiptap.md) |
| Theming | Theme presets, live preview, dark mode and font management | [Themes](theming/README.md), [Fonts](theming/fonts.md) |

Member directory, companies, marketplace, opportunities, resources, news and newsletters don't have dedicated docs yet. Their code is in the matching `src/features/` folders. Pull requests adding docs for them are welcome.
