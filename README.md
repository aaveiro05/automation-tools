# Automation Tools

Internal tools I build and use to run my process-automation work for small
businesses in northeast Argentina.

> This repository is mostly for me. It holds the utilities I need to do the
> job — not the product I sell. I keep it public because it doubles as a
> record of how I work.

## About

I'm Alejo Aveiro, a Systems Engineering student at UTN Facultad Regional
Resistencia, Argentina. I automate repetitive administrative tasks for small
local businesses: appointment reminders, after-hours WhatsApp replies,
payment follow-ups.

I started this to gain real experience and to earn my own income
while studying. The tools here exist because I ran into the problems they
solve.

## What I sell

Small businesses lose time on work that repeats every day: confirming
appointments one by one, answering the same five questions on WhatsApp,
chasing overdue payments. That work is necessary, but it does not need a
person doing it by hand.

I build automations that handle it, so the owner can spend those hours on
something that actually needs a human. Each project is an initial setup plus
a monthly fee that covers monitoring, adjustments and reporting — because an
automation nobody watches is a problem waiting to happen.

## Tools

**WhatsApp cost calculator** — Estimates the monthly cost of sending WhatsApp
Business messages in Argentina, based on volume and template category
(utility, marketing, authentication). I need it to quote a monthly fee
without guessing: if messages eat a third of the fee, the price is wrong.

**Argentine phone number normalizer** — Converts phone numbers from the many
formats real people use (`379-412-3456`, `03794123456`, `+549 379 4123456`)
into the international format the WhatsApp API requires, and fails loudly
when a number cannot be fixed.

## How I work

These are rules, not preferences. They come from problems that are expensive
to fix after the fact.

- **Official APIs only.** For WhatsApp I use Meta's Cloud API. Unofficial
  libraries that hijack WhatsApp Web get the client's number banned, and in a
  small city that costs more than the contract is worth.
- **No credentials in the code, ever.** Secrets live in `.env`, which is in
  `.gitignore` from the first commit. `.env.example` documents what is needed
  without exposing anything.
- **Anything that sends messages must be idempotent.** Webhooks arrive twice
  and retries exist. A client who gets the same reminder four times at 3 AM is
  a client I lost.
- **UTC internally, local time only for display.** Time zones are the main
  source of bugs in reminder systems.
- **Nothing fails silently.** Every error is logged, and critical ones alert
  me. An automation that broke three weeks ago and nobody noticed is worse
  than no automation.
- **Client work stays private.** Their data and their processes belong to
  them, not to my portfolio.

## Stack

Node.js. Make.com for the automation flows themselves, WhatsApp Cloud API,
Google Calendar and Sheets APIs.

## Status

Early stage. The tools listed above are being built now — this repository is
where they land as they are finished.
...