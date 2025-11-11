#!/bin/bash

###############################################################################
# Dead Code Cleanup Script
#
# Removes identified dead code files from the nelson-tech codebase
#
# Usage:
#   ./scripts/cleanup-dead-code.sh           # Dry run (default)
#   ./scripts/cleanup-dead-code.sh --execute # Actually delete files
#   ./scripts/cleanup-dead-code.sh --help    # Show help
#
# Safety Features:
#   - Dry run by default
#   - Creates archive before deletion
#   - Verifies git status
#   - Provides rollback instructions
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DRY_RUN=true
ARCHIVE_DIR=".dead-code-archive-$(date +%Y%m%d-%H%M%S)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Files to delete (Phase 1 - Safe to delete immediately)
DEAD_CODE_FILES=(
    "src/hooks/useSupabase.ts"
    "src/hooks/useGroupQueries.ts.bak"
    "src/main.tsx.backup"
    "database/seeds/05_gallery_newsletter_relationships.sql.backup"
    "database/seeds/04_newsletter_campaign_seed_data.sql.backup"
    "database/fresh_demo_content_seed.sql.bak"
    "src/features/messaging/hooks/useRealtimeChat.backup.ts"
)

# Directories to delete
DEAD_CODE_DIRS=(
    ".cleanup-backup"
)

###############################################################################
# Functions
###############################################################################

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}          Dead Code Cleanup Script - Nelson Tech          ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo
}

print_help() {
    cat << EOF
Dead Code Cleanup Script

Removes identified dead code files from the codebase safely.

Usage:
    $0 [OPTIONS]

Options:
    --execute    Actually delete files (default is dry-run)
    --help       Show this help message

Safety Features:
    - Dry run by default (shows what would be deleted)
    - Creates timestamped archive before deletion
    - Verifies git repository status
    - Provides rollback instructions

Examples:
    # Preview what will be deleted
    $0

    # Actually delete the files
    $0 --execute

Dead Code Files ($(( ${#DEAD_CODE_FILES[@]} + ${#DEAD_CODE_DIRS[@]} )) total):
EOF

    for file in "${DEAD_CODE_FILES[@]}"; do
        echo "    - $file"
    done
    for dir in "${DEAD_CODE_DIRS[@]}"; do
        echo "    - $dir/ (directory)"
    done
    echo
}

check_git_status() {
    echo -e "${YELLOW}➜ Checking git status...${NC}"

    if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
        echo -e "${RED}✗ Not in a git repository!${NC}"
        exit 1
    fi

    if [[ -n $(git status --porcelain) ]]; then
        echo -e "${YELLOW}⚠ Warning: You have uncommitted changes${NC}"
        echo -e "  It's recommended to commit or stash changes before cleanup"
        echo
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}Cleanup cancelled${NC}"
            exit 0
        fi
    else
        echo -e "${GREEN}✓ Git working directory is clean${NC}"
    fi
    echo
}

scan_files() {
    local found_count=0
    local missing_count=0

    echo -e "${YELLOW}➜ Scanning for dead code files...${NC}"
    echo

    for file in "${DEAD_CODE_FILES[@]}"; do
        if [[ -f "$PROJECT_ROOT/$file" ]]; then
            local size=$(du -h "$PROJECT_ROOT/$file" | cut -f1)
            echo -e "  ${GREEN}✓${NC} Found: $file ${BLUE}($size)${NC}"
            ((found_count++))
        else
            echo -e "  ${YELLOW}⊘${NC} Missing: $file ${YELLOW}(already deleted?)${NC}"
            ((missing_count++))
        fi
    done

    for dir in "${DEAD_CODE_DIRS[@]}"; do
        if [[ -d "$PROJECT_ROOT/$dir" ]]; then
            local size=$(du -sh "$PROJECT_ROOT/$dir" | cut -f1)
            echo -e "  ${GREEN}✓${NC} Found: $dir/ ${BLUE}($size)${NC}"
            ((found_count++))
        else
            echo -e "  ${YELLOW}⊘${NC} Missing: $dir/ ${YELLOW}(already deleted?)${NC}"
            ((missing_count++))
        fi
    done

    echo
    echo -e "${BLUE}Summary:${NC} $found_count found, $missing_count already removed"
    echo

    if [[ $found_count -eq 0 ]]; then
        echo -e "${GREEN}✓ All dead code already cleaned up!${NC}"
        exit 0
    fi
}

create_archive() {
    echo -e "${YELLOW}➜ Creating archive...${NC}"

    mkdir -p "$PROJECT_ROOT/$ARCHIVE_DIR"

    local archived_count=0

    for file in "${DEAD_CODE_FILES[@]}"; do
        if [[ -f "$PROJECT_ROOT/$file" ]]; then
            local archive_path="$PROJECT_ROOT/$ARCHIVE_DIR/$file"
            mkdir -p "$(dirname "$archive_path")"
            cp "$PROJECT_ROOT/$file" "$archive_path"
            echo -e "  ${GREEN}✓${NC} Archived: $file"
            ((archived_count++))
        fi
    done

    for dir in "${DEAD_CODE_DIRS[@]}"; do
        if [[ -d "$PROJECT_ROOT/$dir" ]]; then
            local archive_path="$PROJECT_ROOT/$ARCHIVE_DIR/$dir"
            mkdir -p "$(dirname "$archive_path")"
            cp -r "$PROJECT_ROOT/$dir" "$archive_path"
            echo -e "  ${GREEN}✓${NC} Archived: $dir/"
            ((archived_count++))
        fi
    done

    echo
    echo -e "${GREEN}✓ Archived $archived_count items to: $ARCHIVE_DIR${NC}"
    echo
}

delete_files() {
    local deleted_count=0

    echo -e "${YELLOW}➜ Deleting dead code...${NC}"

    for file in "${DEAD_CODE_FILES[@]}"; do
        if [[ -f "$PROJECT_ROOT/$file" ]]; then
            if $DRY_RUN; then
                echo -e "  ${BLUE}[DRY RUN]${NC} Would delete: $file"
            else
                rm "$PROJECT_ROOT/$file"
                echo -e "  ${GREEN}✓${NC} Deleted: $file"
                ((deleted_count++))
            fi
        fi
    done

    for dir in "${DEAD_CODE_DIRS[@]}"; do
        if [[ -d "$PROJECT_ROOT/$dir" ]]; then
            if $DRY_RUN; then
                echo -e "  ${BLUE}[DRY RUN]${NC} Would delete: $dir/"
            else
                rm -rf "$PROJECT_ROOT/$dir"
                echo -e "  ${GREEN}✓${NC} Deleted: $dir/"
                ((deleted_count++))
            fi
        fi
    done

    echo

    if $DRY_RUN; then
        echo -e "${BLUE}✓ Dry run complete - no files were actually deleted${NC}"
        echo -e "${YELLOW}➜ Run with --execute to actually delete files${NC}"
    else
        echo -e "${GREEN}✓ Successfully deleted $deleted_count items${NC}"
    fi
}

print_rollback_instructions() {
    if ! $DRY_RUN; then
        echo
        echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║${NC}                  Rollback Instructions                     ${YELLOW}║${NC}"
        echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
        echo
        echo "If you need to restore deleted files:"
        echo
        echo "  # Restore all files from archive"
        echo "  cp -r $ARCHIVE_DIR/* ."
        echo
        echo "  # Or restore specific file"
        echo "  cp $ARCHIVE_DIR/path/to/file path/to/file"
        echo
        echo "  # Delete archive when done"
        echo "  rm -rf $ARCHIVE_DIR"
        echo
    fi
}

verify_cleanup() {
    echo -e "${YELLOW}➜ Running verification...${NC}"

    # Check if TypeScript compilation still works
    if command -v npm &> /dev/null; then
        echo "  Running TypeScript check..."
        if npm run typecheck > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} TypeScript compilation successful"
        else
            echo -e "  ${RED}✗${NC} TypeScript errors detected (may be unrelated)"
        fi
    fi

    echo
}

###############################################################################
# Main Script
###############################################################################

main() {
    cd "$PROJECT_ROOT"

    print_header

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --execute)
                DRY_RUN=false
                shift
                ;;
            --help)
                print_help
                exit 0
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    if $DRY_RUN; then
        echo -e "${BLUE}MODE: DRY RUN (no files will be deleted)${NC}"
        echo
    else
        echo -e "${YELLOW}MODE: EXECUTION (files will be DELETED)${NC}"
        echo
    fi

    check_git_status
    scan_files

    if ! $DRY_RUN; then
        create_archive
    fi

    delete_files

    if ! $DRY_RUN; then
        verify_cleanup
        print_rollback_instructions
    fi

    echo
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}                     Cleanup Complete!                      ${GREEN}║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
}

main "$@"
