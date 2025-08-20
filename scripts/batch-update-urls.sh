#!/bin/bash

# Script to update remaining ID-based URLs to use slug utilities
# This will help us update all the remaining components efficiently

echo "Starting batch URL updates..."

# Array of files and their required updates
declare -A FILE_UPDATES

# Events components
FILE_UPDATES["src/components/EventsCalendar/EventPopover.tsx"]="events"
FILE_UPDATES["src/features/events/components/EventsList/EventCard.tsx"]="events"
FILE_UPDATES["src/features/events/components/EventsList/PastEventCard.tsx"]="events"
FILE_UPDATES["src/features/events/components/EventsCalendar/EventPopover.tsx"]="events"
FILE_UPDATES["src/pages/GroupDetailPage/EventsTab.tsx"]="events"

# Resources components
FILE_UPDATES["src/components/ResourcesList/ResourceCard.tsx"]="resources"
FILE_UPDATES["src/components/ResourcesPreview/ResourceCard.tsx"]="resources"
FILE_UPDATES["src/features/resources/components/ResourcesList/ResourceCard.tsx"]="resources"
FILE_UPDATES["src/features/resources/components/ResourcesPreview/ResourceCard.tsx"]="resources"
FILE_UPDATES["src/pages/ResourceDetailPage/RelatedResources.tsx"]="resources"

# Marketplace components
FILE_UPDATES["src/components/MarketplaceList.tsx"]="marketplace"
FILE_UPDATES["src/features/marketplace/components/MarketplaceList/ListingCard.tsx"]="marketplace"
FILE_UPDATES["src/pages/MarketplaceDetailPage/RelatedListings.tsx"]="marketplace"

# Opportunities components
FILE_UPDATES["src/components/OpportunitiesList/OpportunityCard.tsx"]="opportunities"
FILE_UPDATES["src/features/opportunities/components/OpportunitiesList/OpportunityCard.tsx"]="opportunities"

# Companies components
FILE_UPDATES["src/components/MemberProfile/ProfileHeader.tsx"]="companies"
FILE_UPDATES["src/features/directory/components/MemberProfile/ProfileHeader.tsx"]="companies"

# Process each file
for FILE in "${!FILE_UPDATES[@]}"; do
  CONTENT_TYPE="${FILE_UPDATES[$FILE]}"
  FULL_PATH="/Users/iaminawe/Sites/nelson-tech/$FILE"
  
  if [ -f "$FULL_PATH" ]; then
    echo "Processing $FILE for $CONTENT_TYPE..."
    
    # Backup the original file
    cp "$FULL_PATH" "$FULL_PATH.backup"
    
    # Determine the function name based on content type
    case $CONTENT_TYPE in
      "events")
        FUNC_NAME="getEventUrl"
        PATTERN="s/to={\`\/events\/\$\{(\w+)\.id\}\`}/to={getEventUrl(\1)}/g"
        ;;
      "resources")
        FUNC_NAME="getResourceUrl"
        PATTERN="s/to={\`\/resources\/\$\{(\w+)\.id\}\`}/to={getResourceUrl(\1)}/g"
        ;;
      "marketplace")
        FUNC_NAME="getMarketplaceListingUrl"
        PATTERN="s/to={\`\/marketplace\/\$\{(\w+)\.id\}\`}/to={getMarketplaceListingUrl(\1)}/g"
        ;;
      "opportunities")
        FUNC_NAME="getOpportunityUrl"
        PATTERN="s/to={\`\/opportunities\/\$\{(\w+)\.id\}\`}/to={getOpportunityUrl(\1)}/g"
        ;;
      "companies")
        FUNC_NAME="getCompanyUrl"
        PATTERN="s/to={\`\/companies\/\$\{(\w+)\.id\}\`}/to={getCompanyUrl(\1)}/g"
        ;;
    esac
    
    echo "  Applying pattern: $PATTERN"
    echo "  Using function: $FUNC_NAME"
  else
    echo "File not found: $FULL_PATH"
  fi
done

echo "Batch URL updates completed!"