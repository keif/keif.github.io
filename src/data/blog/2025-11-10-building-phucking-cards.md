---
title: Building a Real-Time Multiplayer Card Game (and Fixing the Weird Bugs)
pubDatetime: 2025-11-10T21:33:00.000Z
modDatetime: 2025-11-11T15:43:05.194Z
slug: building-phucking-cards
featured: true
draft: false
tags:
    - Socket.IO
    - Real-Time
    - React
    - Redis
    - Express
    - TypeScript
    - Mobile
description: Built Phucking Cards, a free Cards Against Humanity clone for 3-20 players. Runs on Express + Socket.IO + Redis. Ran into some interesting problems with timeout propagation, mobile touch events, and callback registration.
---

So back during Covid - everyone got into online gaming. My friends and I played using [Pretend You're Xyzzy](https://pretendyoure.xyz/zy/). It's a very simplistic interface - and I wanted something a little more polished, and (at the time) a little more stable. So - because nothing is original anymore, I sought to see what's been done! I found [this configuration](https://github.com/yusufameri/cards-against-humanity) by Yusuf Ameri! The pieces were all there to modernize and tweak issues.

[Phucking Cards](https://phuckingcards.com) is a free, no-login-required party game for 3-20 players. I originally picked it up a couple years back, but did a lot of recent work cleaning up bugs and improving mobile UX - which taught me some things about real-time multiplayer development worth documenting (playing with Sockets was my main goal with this project - what a whirlwind that was).

## The Stack

**Backend:**

- [Express.js](https://expressjs.com/) for HTTP routes
- [Socket.IO](https://socket.io/) for real-time communication
- [Redis](https://redis.io/) for session storage and to expand the card management.
- [TypeScript](https://www.typescriptlang.org/) everywhere
- [Winston](https://github.com/winstonjs/winston) for structured logging

**Frontend:**

- [React](https://react.dev/) 18 with TypeScript
- Socket.IO client
- [React DnD](https://react-dnd.github.io/react-dnd/about) (drag-and-drop for desktop)
- React DnD Touch Backend (mobile support)
- [Vite](https://vite.dev/) for bundling

**Infrastructure:**

- Deployed on [DigtialOcean](https://m.do.co/c/b5d5d06893a2)
- [nginx](https://nginx.org/) for reverse proxy
- [GoatCounter](https://www.goatcounter.com/) for privacy-friendly analytics

## How It Works

### Real-Time Architecture

The game state lives in memory on the server. Each game has a `Game` class instance that manages:

- Player hands (10-11 cards each - depending on game configuration)
- Current question card
- Submitted answer cards
- Round timer (configurable)
- Judge rotation
- Score tracking

When anything changes, [Socket.IO broadcasts updates](https://github.com/keif/cards-against-humanity/blob/79a3be5869c251520619de42357cb88edc7e978f/server/src/index.ts#L363) to all players in that game room:

```typescript
socket.on("playCard", async (partyCode, cardID) => {
    // Validate and process card submission
    game.playCard(partyCode, cardID, sessionID);

    // Broadcast to all players in this game
    io.to(partyCode).emit("newGameState");
});
```

Sessions persist in Redis, so players can refresh without losing their spot.

### The Question/Answer Flow

1. One player is randomly selected as judge
2. Judge sees a question card (e.g., "What helps Obama unwind? **\_**")
3. Other players submit answer cards from their hand
4. When all answers are in (or timer expires), judge picks a winner
5. Winner gets a point, judge role rotates, new round starts

Simple game loop. Lots of edge cases.

## The Bugs That Taught Me Things

### Bug 1: Timeout State Never Propagated

**Problem:** Round timer would expire, but clients never saw the state transition to "judge selection." Backend logs showed correct state changes, but Socket.IO events weren't reaching clients.

**Root cause:**

The game creates a `roundFinishedNotifier` callback on initialization to emit Socket.IO events when the round ends. But `getLobbyState()` gets called every time a client connects, and each call created a new callback... which overwrote nothing because the game instance already had its original callback from construction.

```typescript
// This runs once when game is created
new Game(partyCode, roundLength, (success, message) => {
    io.to(partyCode).emit("newGameState");
});

// This runs on EVERY client connection, but does nothing
// because the game already has its callback set
getLobbyState(partyCode, sessionID, (success, message) => {
    io.to(partyCode).emit("newGameState"); // Never registered!
});
```

Only the first connected client's callback worked. Everyone else got silence.

**Fix:**

Added a `setRoundFinishedNotifier()` method to dynamically update the callback:

```typescript
// In Game class
setRoundFinishedNotifier(cb: CallbackType): void {
  this.roundFinishedNotifier = cb;
}

// In getLobbyState
existingGame.setRoundFinishedNotifier(cb);
```

Now every connection refreshes the callback, ensuring the latest Socket.IO context is always used.

**Lesson learned:** When dealing with callbacks in long-lived objects, explicit update methods beat "set once at construction."

### Bug 2: Mobile Users Couldn't Select Cards

**Problem:** On mobile, users could swipe through their cards (carousel worked fine) but tapping to select did nothing. Desktop drag-and-drop worked. Mobile tap? Dead.

**Root cause:**

React DnD Touch Backend has a `delayTouchStart` option. It was set to 200ms:

```typescript
export const touchBackendOptions = {
    delayTouchStart: 200, // 200ms delay before drag starts
    touchSlop: 5, // 5px movement threshold
};
```

The delay exists to distinguish between taps and drags. But 200ms is long enough to break tap recognition entirely. Taps were getting swallowed.

**Fix:**

Removed the delay, increased the movement threshold:

```typescript
export const touchBackendOptions = {
    delayTouchStart: 0, // No delay - immediate tap recognition
    touchSlop: 10, // Larger threshold still allows drag detection
};
```

Now taps register instantly. Drags still work if you move >10px. Much better UX.

**Lesson learned:** Default config values aren't always right. Mobile gesture recognition requires tuning.

### Bug 3: Mobile Players Got Wrong Instructions

After fixing tap recognition, mobile users still didn't know they could tap. Instructions said "Choose one card" (desktop language) instead of "Tap a card" (mobile language).

**Fix:**

Added device detection and conditional messaging:

```typescript
if (isTouchDevice) {
    directions = numCards > 1 ? `Tap ${numCards} Cards` : "Tap a Card";
} else {
    directions = numCards > 1 ? `Pick ${numCards} Cards` : "Choose one Card";
}
```

Small change, big clarity improvement.

**Lesson learned:** Instructions matter. Device-appropriate language improves discoverability.

## The Features Worth Mentioning

### Round Timers with Partial Submissions

When the timer expires, the judge can still pick from whatever cards were submitted. No penalty for slow players — game just moves forward.

Implementation required careful state management:

```typescript
if (round.otherPlayerCards && round.otherPlayerCards.length > 0) {
    // At least one card submitted - proceed to judge selection
    round.roundState = JUDGE_SELECTING;
    this.roundFinishedNotifier(true, "Judge-selection time!");
} else {
    // Nobody submitted - skip round entirely
    this.endRound(true, "Skipping judge!");
}
```

This prevents games from stalling when one player goes AFK.

### User-Submitted Cards

Players can submit their own cards. They go into a moderation queue. Moderators (authenticated via admin key, currently) can approve/reject with reasons.

Cards are stored in Redis with vote tracking:

```typescript
// Store card
await redis.hset(`card:${cardId}`, {
    text: sanitizedText,
    type: cardType,
    status: "pending",
    submitter: sessionId,
    timestamp: Date.now(),
});

// Track vote
await redis.hincrby(`card:${cardId}:votes`, "upvotes", 1);
```

Moderation includes spam detection (checks for similar recent submissions) and rate limiting (10 cards per hour per session).

### Special Game Modes

Once I had the core game locked down and most of the issues worked through - I added optional rule variations I found online (h/t to [GameRules.com](https://gamerules.com/rules/cards-against-humanity-card-game/)):

- **Rebooting the Universe:** Trade a point for a completely new hand
- **Packing Heat:** Draw extra cards, keep your favorite
- **Happy Ending:** Final round is a "Make a Haiku" card
- **Never Have I Ever:** Discard cards you don't understand (broadcasts shame notification to all players)
- **God is Dead:** Everyone votes, no single judge
- **Survival of the Fittest:** Elimination voting until one card remains

These let the user configure the game to their liking. Future enhancements may allow further configuration (like if you don't want a point deducted).

## Technical Decisions That Paid Off

### TypeScript Everywhere

Using TypeScript on both frontend and backend meant shared type definitions:

```typescript
// Shared types
export interface RoundInterface {
    roundNum: number;
    roundState: "player-selecting" | "judge-selecting" | "viewing-winner";
    cards: CardProps[];
    otherPlayerCards: CardProps[];
    timeLeft?: number;
}
```

Refactoring was safer. IDE autocomplete worked everywhere. Type mismatches got caught at compile time instead of runtime.

### Redis for Sessions

Express-session + Redis gave persistent sessions with minimal setup:

```typescript
app.use(
    session({
        store: new RedisStore({ client: redis }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000 },
    })
);
```

Sessions survive server restarts. Players can refresh without losing their game state. This was a HUGE win and lesson for my mental mind.

### Socket.IO Rooms

Each game gets its own Socket.IO room. Broadcasting updates is simple:

```typescript
// Join room when entering game
socket.join(partyCode);

// Broadcast to entire game
io.to(partyCode).emit("newGameState");

// Broadcast to everyone except sender
socket.to(partyCode).emit("playerJoined", { name });
```

No manual filtering required. Socket.IO handles the room membership.

## Performance Observations

With 10-15 concurrent games (30-60 players), server load stays minimal:

- **CPU:** ~5-10% (single DigitalOcean droplet)
- **Memory:** ~150-200 MB
- **Redis:** ~50 MB (sessions + card data)

Socket.IO scales well for this use case. The in-memory game state is fast enough.

## What I'd Do Differently

### State Persistence

Games live only in memory. Server restart = all active games lost. This hasn't been a real problem (games are 15-30 minutes, deployments are rare after the initial launch), but proper state persistence would be better.

Options I considered:

- Redis for full game state (adds complexity)
- SQLite snapshots (good for recovery, not real-time)
- Accept ephemeral state (current approach)

Went with ephemeral for simplicity. Trade-off accepted. It's a free personal project, I'm not getting paid for it!

### Mobile-First Development

Built desktop-first, added mobile support later. This led to the touch event bugs. Starting with mobile constraints would have avoided them.

### Better Test Coverage for Real-Time Events

Testing Socket.IO event flows is annoying:

```typescript
// Mock Socket.IO in tests
const mockSocket = {
    emit: vi.fn(),
    on: vi.fn(),
    to: vi.fn().mockReturnThis(),
};
```

That works, but feels brittle. End-to-end tests with real Socket.IO connections would catch more issues.

## What I Learned

**Callbacks in long-lived objects need explicit update mechanisms.** Don't assume "set once at construction" will work when clients connect/disconnect.

**Mobile gesture libraries require tuning.** Default configs optimize for different use cases than yours.

**Real-time debugging is harder than REST debugging.** Events fire asynchronously. Timing matters. Logs need structured context.

**User-submitted content needs moderation.** Even in a silly card game, spam happens. Rate limiting and similarity detection are table stakes (☞ﾟヮﾟ)☞.

**Small UX improvements compound.** Device-specific instructions, timeout notifications, visual feedback — each one minor, together they make the experience usable.

## Try It

[Phucking Cards](https://phuckingcards.com) is live and free. No ads, no login, no tracking beyond basic analytics.

Create a game, share the party code, play with friends.

[Source code is public](http://github.com/keif/cards-against-humanity/).
