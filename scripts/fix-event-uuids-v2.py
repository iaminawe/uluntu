#!/usr/bin/env python3
import re

# Start fresh with the original content that has bad IDs
content = """-- Sample of original bad IDs to fix:
-- Session IDs: s1001-1111-1111-1111-111111111111
-- Presenter IDs: p1001-1111-1111-1111-111111111111  
-- Resource IDs: r1001-1111-1111-1111-111111111111
"""

# Read the original file from git
import subprocess
content = subprocess.check_output(['git', 'show', 'HEAD:database/seeds/09_comprehensive_events_with_sessions.sql'], 
                                text=True, cwd='/Users/iaminawe/Sites/nelson-tech')

# These replacements need to maintain UUID format (8-4-4-4-12 characters)
# Original bad format: s1001-1111-1111-1111-111111111111 (s prefix is invalid)
# Fixed format:        a1001111-1111-1111-1111-11111111 (proper UUID)

replacements = []

# Fix session IDs - pad to 8 characters for first segment
for i in range(1001, 1009):
    replacements.append((f"'s{i}-1111-1111-1111-111111111111'", f"'a{i}1111-1111-1111-1111-11111111'"))
for i in range(2001, 2004):
    replacements.append((f"'s{i}-2222-2222-2222-222222222222'", f"'a{i}2222-2222-2222-2222-22222222'"))
for i in range(3001, 3005):
    replacements.append((f"'s{i}-3333-3333-3333-333333333333'", f"'a{i}3333-3333-3333-3333-33333333'"))
for i in range(4001, 4005):
    replacements.append((f"'s{i}-4444-4444-4444-444444444444'", f"'a{i}4444-4444-4444-4444-44444444'"))
for i in range(5001, 5005):
    replacements.append((f"'s{i}-5555-5555-5555-555555555555'", f"'a{i}5555-5555-5555-5555-55555555'"))

# Fix presenter IDs
for i in range(1001, 1013):
    replacements.append((f"'p{i}-1111-1111-1111-111111111111'", f"'b{i}1111-1111-1111-1111-11111111'"))
for i in range(2001, 2005):
    replacements.append((f"'p{i}-2222-2222-2222-222222222222'", f"'b{i}2222-2222-2222-2222-22222222'"))
for i in range(3001, 3005):
    replacements.append((f"'p{i}-3333-3333-3333-333333333333'", f"'b{i}3333-3333-3333-3333-33333333'"))
for i in range(4001, 4005):
    replacements.append((f"'p{i}-4444-4444-4444-444444444444'", f"'b{i}4444-4444-4444-4444-44444444'"))
for i in range(5001, 5006):
    replacements.append((f"'p{i}-5555-5555-5555-555555555555'", f"'b{i}5555-5555-5555-5555-55555555'"))

# Fix resource IDs
for i in range(1001, 1006):
    replacements.append((f"'r{i}-1111-1111-1111-111111111111'", f"'c{i}1111-1111-1111-1111-11111111'"))
for i in range(2001, 2005):
    replacements.append((f"'r{i}-2222-2222-2222-222222222222'", f"'c{i}2222-2222-2222-2222-22222222'"))
for i in range(4001, 4005):
    replacements.append((f"'r{i}-4444-4444-4444-444444444444'", f"'c{i}4444-4444-4444-4444-44444444'"))
for i in range(5001, 5005):
    replacements.append((f"'r{i}-5555-5555-5555-555555555555'", f"'c{i}5555-5555-5555-5555-55555555'"))

# Apply all replacements
for old, new in replacements:
    content = content.replace(old, new)

# Write the fixed content
with open('/Users/iaminawe/Sites/nelson-tech/database/seeds/09_comprehensive_events_with_sessions.sql', 'w') as f:
    f.write(content)

print(f"Fixed {len(replacements)} UUID replacements in the events seed file")