#!/bin/bash

# Git Workflow Helper Script
# Makes common development tasks easier

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the project directory
PROJECT_DIR="/home/clay/Documents/GitHub/novique.ai"

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Function: Start new feature
new_feature() {
    if [ -z "$1" ]; then
        print_error "Please provide a feature name"
        echo "Usage: ./git-workflow.sh new-feature <feature-name>"
        echo "Example: ./git-workflow.sh new-feature user-comments"
        exit 1
    fi

    cd "$PROJECT_DIR"

    print_info "Switching to main branch..."
    git checkout main

    print_info "Pulling latest changes..."
    git pull origin main

    print_info "Creating feature branch: feature/$1"
    git checkout -b "feature/$1"

    print_success "Feature branch created!"
    print_info "You can now make your changes."
    print_info "When ready, run: ./git-workflow.sh push"
}

# Function: Start bug fix
new_fix() {
    if [ -z "$1" ]; then
        print_error "Please provide a fix name"
        echo "Usage: ./git-workflow.sh new-fix <fix-name>"
        exit 1
    fi

    cd "$PROJECT_DIR"

    print_info "Switching to main branch..."
    git checkout main

    print_info "Pulling latest changes..."
    git pull origin main

    print_info "Creating fix branch: fix/$1"
    git checkout -b "fix/$1"

    print_success "Fix branch created!"
}

# Function: Push current branch
push_branch() {
    cd "$PROJECT_DIR"

    BRANCH=$(git branch --show-current)

    if [ "$BRANCH" = "main" ]; then
        print_warning "You're on main branch!"
        read -p "Are you sure you want to push to main? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            print_info "Push cancelled."
            exit 0
        fi
    fi

    print_info "Pushing branch: $BRANCH"
    git push origin "$BRANCH"

    print_success "Pushed to GitHub!"

    if [ "$BRANCH" != "main" ]; then
        print_info "Vercel is creating a preview deployment..."
        print_info "Check: https://vercel.com/mark-howells-projects/novique-ai/deployments"
    fi
}

# Function: Merge to production
merge_to_production() {
    cd "$PROJECT_DIR"

    BRANCH=$(git branch --show-current)

    if [ "$BRANCH" = "main" ]; then
        print_error "You're already on main branch!"
        exit 1
    fi

    print_warning "This will merge '$BRANCH' to main and deploy to PRODUCTION"
    read -p "Have you tested the preview deployment? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        print_info "Merge cancelled. Test your preview first!"
        exit 0
    fi

    print_info "Switching to main..."
    git checkout main

    print_info "Pulling latest changes..."
    git pull origin main

    print_info "Merging $BRANCH into main..."
    git merge "$BRANCH"

    print_info "Pushing to production..."
    git push origin main

    print_success "Deployed to production!"

    read -p "Delete branch '$BRANCH'? (yes/no): " delete_confirm
    if [ "$delete_confirm" = "yes" ]; then
        git branch -d "$BRANCH"
        git push origin --delete "$BRANCH"
        print_success "Branch deleted!"
    fi
}

# Function: Save current work
save_work() {
    cd "$PROJECT_DIR"

    if [ -z "$1" ]; then
        print_error "Please provide a commit message"
        echo "Usage: ./git-workflow.sh save \"Your commit message\""
        exit 1
    fi

    git add .
    git commit -m "$1"

    print_success "Changes committed!"
    print_info "Run './git-workflow.sh push' to push to GitHub"
}

# Function: Show current status
show_status() {
    cd "$PROJECT_DIR"

    BRANCH=$(git branch --show-current)

    echo ""
    print_info "Current branch: $BRANCH"
    echo ""

    git status

    echo ""
    if [ "$BRANCH" != "main" ]; then
        print_info "Preview URL will be at:"
        echo "https://novique-ai-git-${BRANCH/\//-}-mark-howells-projects.vercel.app"
    fi
}

# Main script
case "$1" in
    "new-feature")
        new_feature "$2"
        ;;
    "new-fix")
        new_fix "$2"
        ;;
    "push")
        push_branch
        ;;
    "save")
        save_work "$2"
        ;;
    "merge")
        merge_to_production
        ;;
    "status")
        show_status
        ;;
    *)
        echo "Git Workflow Helper"
        echo ""
        echo "Usage:"
        echo "  ./git-workflow.sh new-feature <name>  - Start new feature branch"
        echo "  ./git-workflow.sh new-fix <name>      - Start new fix branch"
        echo "  ./git-workflow.sh save \"message\"      - Commit current changes"
        echo "  ./git-workflow.sh push                - Push current branch to GitHub"
        echo "  ./git-workflow.sh merge               - Merge to production (after testing!)"
        echo "  ./git-workflow.sh status              - Show current branch and status"
        echo ""
        echo "Example workflow:"
        echo "  1. ./git-workflow.sh new-feature user-comments"
        echo "  2. # Make your changes"
        echo "  3. ./git-workflow.sh save \"Add user comments feature\""
        echo "  4. ./git-workflow.sh push"
        echo "  5. # Test preview URL"
        echo "  6. ./git-workflow.sh merge"
        ;;
esac
