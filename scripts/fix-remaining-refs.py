#!/usr/bin/env python3

# Map old broken session IDs to the new proper UUIDs
session_map = {
    'a10051111-1111-1111-111111111111': 'f3bd81de-e6c8-4a9c-ac53-5a340374e6f2',  # Computer Vision session
    'a10061111-1111-1111-111111111111': '9e0aac42-4a1d-41b9-a3fb-09cfac639bae',  # Production ML session
    'a10071111-1111-1111-111111111111': '4caa6c70-a797-450b-b29d-4c5d5ccee236',  # Healthcare AI session
    'a20012222-2222-2222-222222222222': '4418ff1e-76c5-4a8a-94a9-fe07475e861a',  # Full Stack Day 1
    'a20022222-2222-2222-222222222222': '6de590ab-51a8-4bf1-8409-f3221017c487',  # Full Stack Day 2
    'a20032222-2222-2222-222222222222': 'be6a68a8-299a-4f4f-a65a-c2ee2c6f8152',  # Full Stack Day 3
    'a30043333-3333-3333-333333333333': '137ffae8-9162-4bfb-a08f-01edbfaea512',  # Startup Panel
    'a40014444-4444-4444-444444444444': '74b77450-90c8-45bf-ab73-c7c054df0cac',  # Cybersec Week 1
    'a40024444-4444-4444-444444444444': '93d4cd4e-b597-4997-8c3d-fa493f9ccec6',  # Cybersec Week 2
    'a40034444-4444-4444-444444444444': '6a9137b2-c044-4a24-859e-0039d36530ed',  # Cybersec Week 3
    'a40044444-4444-4444-444444444444': '942e04c3-58bc-491d-b28d-ce3ee12b0f06',  # Cybersec Week 4
    'a50015555-5555-5555-555555555555': 'f5762891-d251-4fea-af64-36d82cca1a9e',  # Data Science Keynote
    'a50025555-5555-5555-555555555555': '8e7c6858-2af2-4b4d-9f56-10ee7992f0c9',  # Data Science Viz
    'a50035555-5555-5555-555555555555': 'b12999d7-b1a4-48c7-ad19-8da2f9e606b8',  # Data Science Time Series
    'a50045555-5555-5555-555555555555': 'c84fcaf7-1f7b-45b4-9d15-04c4ca2f98df',  # Data Science Panel
    
    # Also fix some that appear to have wrong references
    'e3179aef-39ff-4c56-85c8-52eb871cc1f5': 'f5bf6675-28df-4346-9672-ef93345cce9e',  # AI Summit Opening
    '94f883fe-d3cd-4a25-a2e9-3dd34cd8e725': '04ab2b74-9393-4c03-9724-10e9caf9aff7',  # ML Workshop
    '96b237ea-e478-4fd8-947c-45afb0d41564': '56679df8-ee39-41c2-a350-f3aa9acd1ef3',  # Ethics Panel
    '89758c45-2894-4bd5-af21-77ad3e3f3c01': '07d39cd7-651b-4ced-9624-4a63da219668',  # NLP Deep Dive
}

# Read the file
with open('/Users/iaminawe/Sites/nelson-tech/database/seeds/09_comprehensive_events_with_sessions.sql', 'r') as f:
    content = f.read()

# Apply all replacements
for old_id, new_id in session_map.items():
    count = content.count(f"'{old_id}'")
    if count > 0:
        content = content.replace(f"'{old_id}'", f"'{new_id}'")
        print(f"Replaced {count} occurrences of {old_id}")

# Write back
with open('/Users/iaminawe/Sites/nelson-tech/database/seeds/09_comprehensive_events_with_sessions.sql', 'w') as f:
    f.write(content)

print("Done fixing session references!")