#!/bin/sh

# husky v9 shared helpers — sourced by individual hooks

CURRENT_BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
GIT_STATUS_PORCELAIN=$(git status --porcelain | head -1)
REGEX_GIT_BRANCH_NAME="^(feat|fix|chore|bug|task|wiki|docs|changeset-release)\/[a-zA-Z0-9_\.\-]+(\/[a-zA-Z0-9_\.\-]+)*$"
REGEX_GIT_COMMIT_MSG="^(feat|fix|chore|task|docs|test|style|ref|perf|build|ci|revert|wip|Merge\?*)(\(.+?\))?:?.{1,}|\d*.\d*.\d*$"
REGEX_GIT_MSG_LENGTH="^.{1,88}$"

# formators
magentafy() { echo "\e[1m\e[35m$*\e[0m"; }
cyanfy() { echo "\e[1m\e[36m$*\e[0m"; }
greenfy() { echo "\e[1m\e[32m$*\e[0m"; }
redfy() { echo "\e[1m\e[31m$*\e[0m"; }
yellowfy() { echo "\e[1m\e[33m$*\e[0m"; }
bluefy() { echo "\e[1m\e[34m$*\e[0m"; }
bolderfy() { echo "\e[1m$*\e[0m"; }
info() { echo "$(bolderfy \[)$(greenfy 'husky')$(bolderfy '@')$(magentafy "$(echo "$0" | cut -c 8-)")$(bolderfy \])$(bolderfy ' --') $(cyanfy "$*")"; }
debug() { echo "$(bolderfy \[)$(greenfy 'husky')$(bolderfy '@')$(yellowfy debug-hint)$(bolderfy \])$(bolderfy ' --') $(bluefy "$*")"; }

# all files must be stagged and commited!
check_working_directory() {
    if [ -n "$GIT_STATUS_PORCELAIN" ]; then
        info "$(redfy error): working directory not clean (uncommitted changes)"
        debug "please commit your changes"
        exit 1
    else
        info "$(yellowfy ok): working directory is clean (all changes committed)"
    fi
}

# branch identifier must pass REGEX_GIT_BRANCH_NAME
check_branch_identifier() {
    if [ -z "$(echo "$CURRENT_BRANCH_NAME" | grep -E "$REGEX_GIT_BRANCH_NAME" 2>/dev/null)" ]; then
        info "$(redfy error): pushing to branch $CURRENT_BRANCH_NAME is not permitted"
        debug "please adhere to the branch naming convention."
        debug "$REGEX_GIT_BRANCH_NAME"
        exit 1
    else
        info "$(yellowfy ok): branch indentifier"
    fi
}

# commit message must pass REGEX_GIT_COMMIT_MSG
check_commit_msg_format() {
    if ! head -1 "$1" | grep -qE "$REGEX_GIT_COMMIT_MSG"; then
        info "$(redfy error): commit message format"
        debug "commit message must follow the conventional style!"
        debug "resolve your commit message: $(redfy "$(head -1 "$1")")"
        exit 1
    else
        info "$(yellowfy ok): commit message format"
    fi
}

# commit message length must pass REGEX_GIT_MSG_LENGTH
check_commit_msg_length() {
    if ! head -1 "$1" | grep -qE "$REGEX_GIT_MSG_LENGTH"; then
        COMMIT_MSG_LENGTH=$(head -1 "$1" | wc -m)
        info "$(redfy error): commit message length"
        debug "commit message length exceeded $(bolderfy \[)$(redfy "$COMMIT_MSG_LENGTH")/88$(bolderfy \])"
        exit 1
    else
        info "$(yellowfy ok): commit message length"
    fi
}

# lint staged files
check_lint_staged() {
    if npx lint-staged --allow-empty; then
        info "$(yellowfy ok): lint-staged"
    else
        info "$(redfy error): lint-staged"
        debug "npx lint-staged"
        exit 1
    fi
}

create_backup_branch() {
    current_branch=$(git symbolic-ref --short HEAD)
    new_branch="pre-rebase_${current_branch}_$(date "+%Y%m%d-%H%M%S")"
    git branch "$new_branch"
    info "$(bluefy "$new_branch") created"
}

cleanup_old_backup_branches() {
    git fetch --prune
    git branch --list 'pre-rebase_*' | while read -r branch; do
        ts=$(echo "$branch" | grep -o '[0-9]\{8\}-[0-9]\{6\}')
        if [ -n "$ts" ]; then
            year=$(echo "$ts" | cut -c1-4)
            month=$(echo "$ts" | cut -c5-6)
            day=$(echo "$ts" | cut -c7-8)
            hour=$(echo "$ts" | cut -c10-11)
            min=$(echo "$ts" | cut -c12-13)
            sec=$(echo "$ts" | cut -c14-15)
            
            branch_date=$(date -d "$year-$month-$day $hour:$min:$sec" +%s)
            now=$(date +%s)
            age=$(( (now - branch_date) / 86400 ))
            if [ "$age" -gt 7 ]; then
                git branch -D "$branch"
                echo "Deleted old backup branch: $branch"
            fi
        fi
    done
}
