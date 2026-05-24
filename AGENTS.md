# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Static website for selling the iPhone 13 Pro Max 128GB, with an integrated chatbot for customer support. Built with pure HTML, CSS, and JavaScript — no build step required.

## Running the Project

Open `index.html` directly in a browser, or serve it locally:

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

## Architecture

Single-page application with no framework or bundler:

- `index.html` — page structure: hero, specs, gallery, pricing, FAQ, chatbot widget
- `css/style.css` — all styling, including responsive breakpoints and chatbot UI
- `js/main.js` — page interactions (carousel, scroll effects, add-to-cart)
- `js/chatbot.js` — chatbot logic: rule-based keyword matching against a knowledge base of product FAQs, shipping, and payment questions

## Chatbot Design

The chatbot is entirely client-side. It uses keyword pattern matching (no external API). The knowledge base lives as a plain JS object in `js/chatbot.js` — add new topics there. It does not persist conversation history between page reloads.
