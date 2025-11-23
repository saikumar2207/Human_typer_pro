#!/bin/bash
echo "🚀 Initializing Git Repository..."
echo "# Human_type_pro" >> README.md
git init

echo "📦 Adding files..."
git add .

echo "💾 Committing changes..."
git commit -m "Initial commit: Human Typing Bot v1.0"

echo "🌿 Renaming branch to main..."
git branch -M main

echo "🔗 Adding remote origin..."
git remote add origin https://github.com/saikumar2207/Human_type_pro.git

echo "⬆️ Pushing to GitHub..."
git push -u origin main

echo "✅ Done!"
