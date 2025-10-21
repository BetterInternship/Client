#!/bin/bash

# Mock GitHub-like variables for local testing
GITHUB_SHA="8fbf9a098f1b6fb7ae2b85b86509f90a14031f03"
GITHUB_REPOSITORY="username/repo"
GITHUB_ACTOR="local-tester"
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/1430147978202583100/EgsoJ2U3beQ0ILpZy9SVM6zB0z2R-jAW-QD_DyVpysd92HETHseCn3feWQ66UOxCcZfC" # replace this
ROLE_ID="123456789012345678" # replace this

# Simulate message creation
SHORT_SHA=$(echo "$GITHUB_SHA" | cut -c1-7)
COMMIT_URL="https://github.com/$GITHUB_REPOSITORY/commit/$GITHUB_SHA"
MESSAGE=":rocket: Deployment finished for commit [${SHORT_SHA}](${COMMIT_URL}) by ${GITHUB_ACTOR} <@&${ROLE_ID}>"

# Send message to Discord
curl -H "Content-Type: application/json" \
  -d '{
    "content": "'"$MESSAGE"'",
    "allowed_mentions": { "roles": ["'"$ROLE_ID"'"] }
  }' \
  "$DISCORD_WEBHOOK_URL"
