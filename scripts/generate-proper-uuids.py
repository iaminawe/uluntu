#!/usr/bin/env python3
import uuid
import re

# Read the current file
with open('/Users/iaminawe/Sites/nelson-tech/database/seeds/09_comprehensive_events_with_sessions.sql', 'r') as f:
    content = f.read()

# Generate mapping of old IDs to new UUIDs
uuid_map = {}

# Events
event_patterns = [
    'e1000001-1111-1111-1111-111111111111',
    'e2000002-2222-2222-2222-222222222222',
    'e3000003-3333-3333-3333-333333333333',
    'e4000004-4444-4444-4444-444444444444',
    'e5000005-5555-5555-5555-555555555555',
    'e6000006-6666-6666-6666-666666666666',
    'e7000007-7777-7777-7777-777777777777',
    'e8000008-8888-8888-8888-888888888888',
    'e9000009-9999-9999-9999-999999999999',
    'e1000010-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
]

for old_id in event_patterns:
    uuid_map[old_id] = str(uuid.uuid4())

# Find all session IDs (they start with 'a' and have a pattern)
session_patterns = re.findall(r"'(a\d{4}\d{3,4}-\d{4}-\d{4}-\d{4}-\d{8,12})'", content)
for old_id in set(session_patterns):
    uuid_map[old_id] = str(uuid.uuid4())

# Find all presenter IDs (they start with 'b')
presenter_patterns = re.findall(r"'(b\d{4}[a-z0-9]{3}-\d{4}-\d{4}-\d{4}-\d{8,12})'", content)
for old_id in set(presenter_patterns):
    uuid_map[old_id] = str(uuid.uuid4())

# Find all resource IDs (they start with 'c')
resource_patterns = re.findall(r"'(c\d{4}[a-z0-9]{3}-\d{4}-\d{4}-\d{4}-\d{8,12})'", content)
for old_id in set(resource_patterns):
    uuid_map[old_id] = str(uuid.uuid4())

# Replace all IDs with proper UUIDs
for old_id, new_id in uuid_map.items():
    content = content.replace(f"'{old_id}'", f"'{new_id}'")

# Write the updated content
with open('/Users/iaminawe/Sites/nelson-tech/database/seeds/09_comprehensive_events_with_sessions.sql', 'w') as f:
    f.write(content)

print(f"Replaced {len(uuid_map)} IDs with proper UUIDs:")
print(f"  - Events: {len([k for k in uuid_map if k.startswith('e')])}")
print(f"  - Sessions: {len([k for k in uuid_map if k.startswith('a')])}")
print(f"  - Presenters: {len([k for k in uuid_map if k.startswith('b')])}")
print(f"  - Resources: {len([k for k in uuid_map if k.startswith('c')])}")