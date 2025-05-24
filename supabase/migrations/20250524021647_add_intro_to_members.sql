/*
  # Add intro field to members table
  
  1. Add intro column to members table
    - `intro` (text, optional) - Short introduction sentence for directory cards
*/

-- Add intro column to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS intro TEXT;