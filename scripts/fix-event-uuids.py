#!/usr/bin/env python3
import re

# Read the file
with open('/Users/iaminawe/Sites/nelson-tech/database/seeds/09_comprehensive_events_with_sessions.sql', 'r') as f:
    content = f.read()

# Fix session IDs (s1001-xxxx -> a1001111-xxxx)
content = re.sub(r"'s(\d{4})-(\d{4}-\d{4}-\d{4}-\d{12})'", r"'a\g<1>111-\g<2>'", content)

# Fix presenter IDs (p1001-xxxx -> b1001b11-xxxx)
content = re.sub(r"'p(\d{4})-(\d{4}-\d{4}-\d{4}-\d{12})'", r"'b\g<1>b11-\g<2>'", content)

# Fix resource IDs (r1001-xxxx -> c1001c11-xxxx)
content = re.sub(r"'r(\d{4})-(\d{4}-\d{4}-\d{4}-\d{12})'", r"'c\g<1>c11-\g<2>'", content)

# Write the fixed content back
with open('/Users/iaminawe/Sites/nelson-tech/database/seeds/09_comprehensive_events_with_sessions.sql', 'w') as f:
    f.write(content)

print("Fixed all UUIDs in the events seed file")