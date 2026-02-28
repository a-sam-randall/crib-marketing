import { createFileRoute } from '@tanstack/solid-router'
import { For, Show, createSignal, createMemo, onMount } from 'solid-js'

export const Route = createFileRoute('/')({ component: App })

/* ─── Card / scoring types ─── */
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
interface Card {
  rank: Rank
  suit: Suit
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

const suitSymbol = (s: Suit) =>
  s === 'hearts' ? '\u2665' : s === 'diamonds' ? '\u2666' : s === 'clubs' ? '\u2663' : '\u2660'

const suitColor = (s: Suit) => (s === 'hearts' || s === 'diamonds' ? 'text-red-500' : 'text-foreground')

const cardValue = (r: Rank): number => {
  if (r === 'A') return 1
  if (['J', 'Q', 'K'].includes(r)) return 10
  return parseInt(r)
}

const cardOrder = (r: Rank): number => {
  const map: Record<Rank, number> = {
    A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13,
  }
  return map[r]
}

const cardKey = (c: Card) => `${c.rank}-${c.suit}`

/* ─── Scoring engine ─── */
interface ScoreBreakdown {
  fifteens: number
  pairs: number
  runs: number
  flush: number
  nobs: number
  total: number
  details: string[]
}

function scoreCribHand(hand: Card[], starter: Card): ScoreBreakdown {
  const all5 = [...hand, starter]
  const details: string[] = []
  let fifteens = 0
  let pairs = 0
  let runs = 0
  let flush = 0
  let nobs = 0

  // Fifteens — check all subsets of 2..5 cards
  const subsets: Card[][] = []
  for (let mask = 1; mask < (1 << 5); mask++) {
    const sub: Card[] = []
    for (let i = 0; i < 5; i++) {
      if (mask & (1 << i)) sub.push(all5[i])
    }
    if (sub.length >= 2) subsets.push(sub)
  }
  for (const sub of subsets) {
    if (sub.reduce((s, c) => s + cardValue(c.rank), 0) === 15) {
      fifteens += 2
      details.push(`Fifteen 2: ${sub.map((c) => c.rank + suitSymbol(c.suit)).join(' + ')}`)
    }
  }

  // Pairs
  for (let i = 0; i < 5; i++) {
    for (let j = i + 1; j < 5; j++) {
      if (all5[i].rank === all5[j].rank) {
        pairs += 2
        details.push(`Pair: ${all5[i].rank + suitSymbol(all5[i].suit)} & ${all5[j].rank + suitSymbol(all5[j].suit)}`)
      }
    }
  }

  // Runs — find longest runs of 3+ among all5
  const orders = all5.map((c) => cardOrder(c.rank))
  // Check runs of length 5, 4, 3
  for (let len = 5; len >= 3; len--) {
    let runCount = 0
    const combos = getCombinations(all5, len)
    for (const combo of combos) {
      const sorted = combo.map((c) => cardOrder(c.rank)).sort((a, b) => a - b)
      let isRun = true
      for (let k = 1; k < sorted.length; k++) {
        if (sorted[k] !== sorted[k - 1] + 1) {
          isRun = false
          break
        }
      }
      if (isRun) {
        runCount++
        details.push(`Run of ${len}: ${combo.sort((a, b) => cardOrder(a.rank) - cardOrder(b.rank)).map((c) => c.rank + suitSymbol(c.suit)).join(', ')}`)
      }
    }
    if (runCount > 0) {
      runs += runCount * len
      break // only count longest runs
    }
  }

  // Flush — 4 hand cards same suit = 4, if starter also matches = 5
  const handSuits = hand.map((c) => c.suit)
  if (handSuits.every((s) => s === handSuits[0])) {
    if (starter.suit === handSuits[0]) {
      flush = 5
      details.push('Flush: 5 cards')
    } else {
      flush = 4
      details.push('Flush: 4 cards (hand only)')
    }
  }

  // Nobs — Jack in hand matching starter suit
  for (const c of hand) {
    if (c.rank === 'J' && c.suit === starter.suit) {
      nobs = 1
      details.push(`Nobs: J${suitSymbol(c.suit)} matches starter suit`)
      break
    }
  }

  return { fifteens, pairs, runs, flush, nobs, total: fifteens + pairs + runs + flush + nobs, details }
}

function getCombinations<T>(arr: T[], len: number): T[][] {
  if (len === 1) return arr.map((v) => [v])
  const result: T[][] = []
  for (let i = 0; i <= arr.length - len; i++) {
    const rest = getCombinations(arr.slice(i + 1), len - 1)
    for (const combo of rest) result.push([arr[i], ...combo])
  }
  return result
}

function App() {
  return (
    <div class="min-h-screen bg-background">
      <Nav />
      <Hero />
      <QuipMarquee />
      <About />
      <Sayings />
      <ScoringReference />
      <HandCalculator />
      <HowToPlay />
      <Gallery />
      <Footer />
    </div>
  )
}

/* ─── Navigation ─── */
function Nav() {
  const [scrolled, setScrolled] = createSignal(false)

  onMount(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
  })

  return (
    <nav
      class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-300"
      classList={{
        'bg-background/90 backdrop-blur-md border-b border-border': scrolled(),
        'bg-transparent': !scrolled(),
      }}
    >
      <a href="#" class="font-serif text-2xl tracking-wide text-primary">
        CRIBBAGE
      </a>
      <div class="hidden md:flex items-center gap-8">
        <a href="#about" class="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
          About
        </a>
        <a href="#sayings" class="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
          Sayings
        </a>
        <a href="#scoring" class="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
          Scoring
        </a>
        <a href="#calculator" class="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
          Calculator
        </a>
        <a href="#how-to-play" class="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
          How to Play
        </a>
      </div>
      <a
        href="#how-to-play"
        class="px-5 py-2 text-sm uppercase tracking-widest bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors font-medium"
      >
        Learn the Game
      </a>
    </nav>
  )
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0">
        <img
          src="/images/cribbage-hero.jpg"
          alt="A beautifully crafted wooden cribbage board on green felt"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-background/70"></div>
      </div>

      <div class="relative text-center px-6 max-w-5xl mx-auto animate-fade-in-up">
        <p class="text-sm uppercase tracking-[0.3em] text-primary mb-6">
          The Timeless Card Game
        </p>
        <h1 class="font-serif text-5xl md:text-7xl lg:text-8xl text-foreground leading-[1.1] text-balance mb-6">
          Fifteen Two,{' '}
          <span class="text-primary">Fifteen Four</span>
        </h1>
        <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
          Born in 17th-century England and beloved across generations,
          cribbage is the perfect blend of strategy, skill, and a little bit of luck.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#how-to-play"
            class="px-8 py-3 bg-primary text-primary-foreground uppercase tracking-widest text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors"
          >
            Learn to Play
          </a>
          <a
            href="#sayings"
            class="px-8 py-3 border border-border text-foreground uppercase tracking-widest text-sm font-medium rounded-sm hover:border-primary hover:text-primary transition-colors"
          >
            Explore the Lingo
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── Scrolling Quip Marquee ─── */
function QuipMarquee() {
  const quips = [
    'Fifteen two, fifteen four',
    'One for his nob',
    'Two for his heels',
    'Go!',
    'Muggins!',
    'Last card',
    'Nineteen hand',
    'A pair is two',
    'Three of a kind is six',
    'Thirty-one for two',
    'Right Jack',
  ]

  return (
    <div class="bg-accent py-4 overflow-hidden border-y border-border">
      <div class="animate-marquee flex whitespace-nowrap">
        <For each={[...quips, ...quips]}>
          {(quip) => (
            <span class="mx-8 text-sm uppercase tracking-[0.2em] text-accent-foreground/80 font-medium">
              {quip}
              <span class="mx-8 text-primary">{'*'}</span>
            </span>
          )}
        </For>
      </div>
    </div>
  )
}

/* ─── About Section ─── */
function About() {
  return (
    <section id="about" class="py-24 md:py-32 px-6">
      <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-primary mb-4">
            A Game of Wit & Will
          </p>
          <h2 class="font-serif text-4xl md:text-5xl text-foreground leading-tight text-balance mb-6">
            Four Centuries of Cards, Pegs & Good Company
          </h2>
          <p class="text-muted-foreground leading-relaxed mb-6">
            Invented by the English poet Sir John Suckling in the early 1600s, cribbage has
            endured as one of the most beloved two-player card games in the world. With its
            unique scoring board, rich vocabulary, and depth of strategy, it has captivated
            players for over 400 years.
          </p>
          <p class="text-muted-foreground leading-relaxed">
            From pubs in England to porches in New England, cribbage brings people together.
            Whether you are chasing a 29 hand or just trying to avoid being skunked,
            every game tells a story.
          </p>
        </div>
        <div class="relative">
          <img
            src="/images/cribbage-cards.jpg"
            alt="A hand of playing cards held over a green felt table"
            class="w-full rounded-sm"
          />
          <div class="absolute -bottom-4 -left-4 w-24 h-24 border-l-2 border-b-2 border-primary"></div>
        </div>
      </div>
    </section>
  )
}

/* ─── Classic Sayings ─── */
function Sayings() {
  const sayings = [
    {
      phrase: '"Fifteen two, fifteen four, and the rest won\'t score"',
      meaning:
        'The quintessential cribbage call-out. Players count combinations of cards that total 15, each worth two points. This phrase is a playful concession that the hand has no more scoring potential.',
    },
    {
      phrase: '"One for his nob"',
      meaning:
        'Awarded when a player holds the Jack of the same suit as the starter card. A small but satisfying point that can make all the difference in a close game.',
    },
    {
      phrase: '"Two for his heels"',
      meaning:
        'When the dealer flips a Jack as the starter card, they immediately score two points. A lucky break right out of the gate.',
    },
    {
      phrase: '"Go!"',
      meaning:
        'Called when a player cannot lay down a card without exceeding 31. It concedes the count to the opponent, who scores a point. Sometimes, the most strategic move is knowing when to say go.',
    },
    {
      phrase: '"Muggins!"',
      meaning:
        'An optional rule where if your opponent misses counting points in their hand, you can call muggins and steal those points for yourself. Keeps everyone honest and on their toes.',
    },
    {
      phrase: '"Nineteen hand"',
      meaning:
        'A wry way of saying you scored zero, since it is impossible to score exactly 19 in cribbage. The ultimate sympathetic nod.',
    },
    {
      phrase: '"Thirty-one for two"',
      meaning:
        'When the running total of played cards hits exactly 31, the player who gets there scores two bonus points. The golden number.',
    },
    {
      phrase: '"Skunked!"',
      meaning:
        'When a player wins by more than 30 points (the opponent fails to pass the 91-peg mark), it is called a skunk. Some play it counts as two games. Pure domination.',
    },
  ]

  return (
    <section id="sayings" class="py-24 md:py-32 px-6 bg-card">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-sm uppercase tracking-[0.3em] text-primary mb-4">
            The Language of the Board
          </p>
          <h2 class="font-serif text-4xl md:text-5xl text-card-foreground text-balance">
            Classic Cribbage Sayings
          </h2>
        </div>
        <div class="flex flex-col">
          <For each={sayings}>
            {(item) => (
              <div class="border-t border-border py-8 group">
                <div class="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-12">
                  <h3 class="font-serif text-xl md:text-2xl text-primary shrink-0 lg:w-[340px] group-hover:text-foreground transition-colors">
                    {item.phrase}
                  </h3>
                  <p class="text-muted-foreground leading-relaxed">
                    {item.meaning}
                  </p>
                </div>
              </div>
            )}
          </For>
          <div class="border-t border-border"></div>
        </div>
      </div>
    </section>
  )
}

/* ─── Scoring Reference ─── */
function ScoringReference() {
  const categories = [
    {
      title: 'Fifteens',
      items: [
        { combo: 'Any combination totaling 15', points: '2 points each' },
      ],
    },
    {
      title: 'Pairs & Multiples',
      items: [
        { combo: 'Pair (two of a kind)', points: '2 points' },
        { combo: 'Pair Royal (three of a kind)', points: '6 points' },
        { combo: 'Double Pair Royal (four of a kind)', points: '12 points' },
      ],
    },
    {
      title: 'Runs',
      items: [
        { combo: 'Run of 3 (e.g. 3-4-5)', points: '3 points' },
        { combo: 'Run of 4 (e.g. 3-4-5-6)', points: '4 points' },
        { combo: 'Run of 5 (e.g. 3-4-5-6-7)', points: '5 points' },
        { combo: 'Double run of 3 (pair + run)', points: '8 points' },
        { combo: 'Double run of 4 (pair + run)', points: '10 points' },
        { combo: 'Triple run (trips + run of 3)', points: '15 points' },
      ],
    },
    {
      title: 'Flush',
      items: [
        { combo: '4 cards same suit (hand only)', points: '4 points' },
        { combo: '5 cards same suit (hand + starter)', points: '5 points' },
      ],
    },
    {
      title: 'Special',
      items: [
        { combo: 'His Nobs (Jack matching starter suit)', points: '1 point' },
        { combo: 'His Heels (Jack turned as starter)', points: '2 points' },
        { combo: 'Go (opponent cannot play)', points: '1 point' },
        { combo: '31 exactly during play', points: '2 points' },
        { combo: 'Last card during play', points: '1 point' },
      ],
    },
  ]

  return (
    <section id="scoring" class="py-24 md:py-32 px-6">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-sm uppercase tracking-[0.3em] text-primary mb-4">
            Know Your Points
          </p>
          <h2 class="font-serif text-4xl md:text-5xl text-foreground text-balance">
            Scoring Reference Guide
          </h2>
          <p class="text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
            Every point counts in cribbage. From fifteens to flushes, here is every way to score.
          </p>
        </div>

        <div class="flex flex-col gap-8">
          <For each={categories}>
            {(cat) => (
              <div class="border border-border rounded-sm overflow-hidden">
                <div class="bg-muted px-6 py-4">
                  <h3 class="font-serif text-xl text-primary">{cat.title}</h3>
                </div>
                <div class="flex flex-col">
                  <For each={cat.items}>
                    {(item, i) => (
                      <div
                        class="flex items-center justify-between px-6 py-4 border-t border-border first:border-t-0"
                      >
                        <span class="text-foreground text-sm md:text-base">{item.combo}</span>
                        <span class="text-primary font-serif text-lg shrink-0 ml-4">{item.points}</span>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>

        <div class="mt-12 border border-primary/30 rounded-sm p-6 bg-primary/5">
          <div class="flex flex-col md:flex-row md:items-center gap-4">
            <div class="shrink-0">
              <p class="font-serif text-5xl text-primary">29</p>
            </div>
            <div>
              <h4 class="font-serif text-lg text-foreground mb-1">The Perfect Hand</h4>
              <p class="text-muted-foreground text-sm leading-relaxed">
                Three fives plus the Jack of the same suit as the starter five:
                8 fifteens (16) + 6 pairs (12) + nobs (1) = 29 points. The rarest and most celebrated hand in cribbage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Interactive Hand Calculator ─── */
function HandCalculator() {
  const [handCards, setHandCards] = createSignal<Card[]>([])
  const [starterCard, setStarterCard] = createSignal<Card | null>(null)
  const [selectingStarter, setSelectingStarter] = createSignal(false)

  const selectedKeys = createMemo(() => {
    const keys = new Set(handCards().map(cardKey))
    const st = starterCard()
    if (st) keys.add(cardKey(st))
    return keys
  })

  const score = createMemo<ScoreBreakdown | null>(() => {
    const h = handCards()
    const s = starterCard()
    if (h.length === 4 && s) return scoreCribHand(h, s)
    return null
  })

  const handleCardClick = (card: Card) => {
    const key = cardKey(card)
    // If already selected, remove it
    if (selectedKeys().has(key)) {
      if (starterCard() && cardKey(starterCard()!) === key) {
        setStarterCard(null)
        setSelectingStarter(false)
        return
      }
      setHandCards((prev) => prev.filter((c) => cardKey(c) !== key))
      return
    }

    if (selectingStarter()) {
      setStarterCard(card)
      setSelectingStarter(false)
    } else if (handCards().length < 4) {
      setHandCards((prev) => [...prev, card])
      if (handCards().length === 3) {
        // after this add it'll be 4, prompt for starter
        // wait — the signal hasn't updated yet, so this fires when adding the 4th
      }
    }
  }

  const resetAll = () => {
    setHandCards([])
    setStarterCard(null)
    setSelectingStarter(false)
  }

  const handIsFull = createMemo(() => handCards().length === 4)
  const needsStarter = createMemo(() => handIsFull() && !starterCard())

  // Auto-set selectingStarter
  createMemo(() => {
    if (needsStarter()) setSelectingStarter(true)
    else if (starterCard()) setSelectingStarter(false)
  })

  const statusText = createMemo(() => {
    if (score()) return 'Hand scored!'
    if (selectingStarter()) return 'Now pick the starter (cut) card'
    return `Pick ${4 - handCards().length} more hand card${4 - handCards().length !== 1 ? 's' : ''}`
  })

  return (
    <section id="calculator" class="py-24 md:py-32 px-6 bg-card">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-12">
          <p class="text-sm uppercase tracking-[0.3em] text-primary mb-4">
            Try It Yourself
          </p>
          <h2 class="font-serif text-4xl md:text-5xl text-card-foreground text-balance">
            Hand Calculator
          </h2>
          <p class="text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
            Select four hand cards and one starter card to see your score calculated with a full breakdown.
          </p>
        </div>

        {/* Status & selected cards */}
        <div class="mb-8">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <p class="text-sm uppercase tracking-widest text-muted-foreground">
              {statusText()}
            </p>
            <button
              onClick={resetAll}
              class="px-4 py-2 text-xs uppercase tracking-widest border border-border text-muted-foreground rounded-sm hover:border-primary hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>

          <div class="flex items-center justify-center gap-3 flex-wrap mb-8">
            <For each={[0, 1, 2, 3]}>
              {(i) => {
                const card = createMemo(() => handCards()[i])
                return (
                  <div
                    class="w-16 h-24 md:w-20 md:h-28 rounded-sm border-2 flex items-center justify-center transition-all duration-200"
                    classList={{
                      'border-border bg-muted/50': !card(),
                      'border-primary bg-foreground cursor-pointer hover:border-primary/70': !!card(),
                    }}
                    onClick={() => card() && handleCardClick(card()!)}
                  >
                    <Show when={card()} fallback={
                      <span class="text-muted-foreground/40 text-xs">{'Card'}</span>
                    }>
                      {(c) => (
                        <div class="text-center">
                          <p class={`font-serif text-lg font-bold ${suitColor(c().suit)}`}>{c().rank}</p>
                          <p class={`text-xl leading-none ${suitColor(c().suit)}`}>{suitSymbol(c().suit)}</p>
                        </div>
                      )}
                    </Show>
                  </div>
                )
              }}
            </For>

            <div class="flex items-center mx-2">
              <div class="w-px h-16 bg-border"></div>
              <span class="text-xs uppercase tracking-widest text-muted-foreground mx-3">Cut</span>
              <div class="w-px h-16 bg-border"></div>
            </div>

            <div
              class="w-16 h-24 md:w-20 md:h-28 rounded-sm border-2 flex items-center justify-center transition-all duration-200"
              classList={{
                'border-primary/50 border-dashed bg-primary/5': !starterCard() && selectingStarter(),
                'border-border bg-muted/50': !starterCard() && !selectingStarter(),
                'border-primary bg-foreground cursor-pointer hover:border-primary/70': !!starterCard(),
              }}
              onClick={() => starterCard() && handleCardClick(starterCard()!)}
            >
              <Show when={starterCard()} fallback={
                <span class="text-muted-foreground/40 text-xs">{'Starter'}</span>
              }>
                {(c) => (
                  <div class="text-center">
                    <p class={`font-serif text-lg font-bold ${suitColor(c().suit)}`}>{c().rank}</p>
                    <p class={`text-xl leading-none ${suitColor(c().suit)}`}>{suitSymbol(c().suit)}</p>
                  </div>
                )}
              </Show>
            </div>
          </div>
        </div>

        {/* Score results */}
        <Show when={score()}>
          {(s) => (
            <div class="mb-10 border border-primary/40 rounded-sm overflow-hidden animate-fade-in-up">
              <div class="bg-primary/10 px-6 py-4 flex items-center justify-between">
                <h3 class="font-serif text-xl text-primary">Score Breakdown</h3>
                <span class="font-serif text-4xl text-primary">{s().total}</span>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                  <div class="text-center">
                    <p class="font-serif text-2xl text-foreground">{s().fifteens}</p>
                    <p class="text-xs uppercase tracking-widest text-muted-foreground mt-1">Fifteens</p>
                  </div>
                  <div class="text-center">
                    <p class="font-serif text-2xl text-foreground">{s().pairs}</p>
                    <p class="text-xs uppercase tracking-widest text-muted-foreground mt-1">Pairs</p>
                  </div>
                  <div class="text-center">
                    <p class="font-serif text-2xl text-foreground">{s().runs}</p>
                    <p class="text-xs uppercase tracking-widest text-muted-foreground mt-1">Runs</p>
                  </div>
                  <div class="text-center">
                    <p class="font-serif text-2xl text-foreground">{s().flush}</p>
                    <p class="text-xs uppercase tracking-widest text-muted-foreground mt-1">Flush</p>
                  </div>
                  <div class="text-center">
                    <p class="font-serif text-2xl text-foreground">{s().nobs}</p>
                    <p class="text-xs uppercase tracking-widest text-muted-foreground mt-1">Nobs</p>
                  </div>
                </div>
                <Show when={s().details.length > 0}>
                  <div class="border-t border-border pt-4">
                    <p class="text-xs uppercase tracking-widest text-muted-foreground mb-3">Details</p>
                    <div class="flex flex-col gap-1">
                      <For each={s().details}>
                        {(d) => (
                          <p class="text-sm text-foreground/80">{d}</p>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>
                <Show when={s().total === 0}>
                  <div class="border-t border-border pt-4 text-center">
                    <p class="font-serif text-xl text-muted-foreground italic">
                      {"\"Nineteen hand\" -- zero points!"}
                    </p>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </Show>

        {/* Card picker */}
        <div>
          <p class="text-xs uppercase tracking-widest text-muted-foreground mb-4 text-center">
            {selectingStarter() ? 'Pick the starter card' : 'Pick your cards'}
          </p>
          <div class="flex flex-col gap-3">
            <For each={SUITS}>
              {(suit) => (
                <div class="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
                  <For each={RANKS}>
                    {(rank) => {
                      const card: Card = { rank, suit }
                      const key = cardKey(card)
                      const isSelected = createMemo(() => selectedKeys().has(key))
                      const isInHand = createMemo(() => handCards().some((c) => cardKey(c) === key))
                      const isStarter = createMemo(() => starterCard() ? cardKey(starterCard()!) === key : false)
                      const isDisabled = createMemo(() => isSelected() && !selectingStarter() && !isInHand() && !isStarter())

                      return (
                        <button
                          onClick={() => handleCardClick(card)}
                          disabled={false}
                          class="w-9 h-12 md:w-11 md:h-14 rounded-sm text-xs md:text-sm flex flex-col items-center justify-center leading-none transition-all duration-150"
                          classList={{
                            'bg-primary text-primary-foreground border-2 border-primary scale-105': isSelected(),
                            'bg-muted border border-border hover:border-primary/60 hover:bg-muted/80 cursor-pointer': !isSelected(),
                            'opacity-30 cursor-not-allowed': isDisabled(),
                          }}
                        >
                          <span class={`font-bold ${isSelected() ? 'text-primary-foreground' : suitColor(suit)}`}>
                            {rank}
                          </span>
                          <span class={`text-xs leading-none ${isSelected() ? 'text-primary-foreground' : suitColor(suit)}`}>
                            {suitSymbol(suit)}
                          </span>
                        </button>
                      )
                    }}
                  </For>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </section>
  )
}
/* ─── How to Play ─── */
function HowToPlay() {
  const steps = [
    {
      number: '01',
      title: 'The Deal',
      description:
        'Each player is dealt six cards. Both players discard two cards face-down into the "crib," a bonus hand scored by the dealer at the end of the round.',
    },
    {
      number: '02',
      title: 'The Cut',
      description:
        'The non-dealer cuts the deck to reveal the "starter" card. If it is a Jack, the dealer scores two for his heels. This card is used by all hands during scoring.',
    },
    {
      number: '03',
      title: 'The Play',
      description:
        'Players alternate laying down cards, keeping a running total. Score points for hitting 15, 31, pairs, and runs. Say "Go" when you cannot play without exceeding 31.',
    },
    {
      number: '04',
      title: 'The Show',
      description:
        'After the play, each player counts their hand plus the starter card for fifteens, pairs, runs, and flushes. The non-dealer counts first, a crucial advantage near the end.',
    },
    {
      number: '05',
      title: 'The Crib',
      description:
        'Finally, the dealer scores the crib hand. First player to peg 121 points on the board wins. Keep your pegs moving and your wits sharp.',
    },
  ]

  return (
    <section id="how-to-play" class="py-24 md:py-32 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-sm uppercase tracking-[0.3em] text-primary mb-4">
            Master the Board
          </p>
          <h2 class="font-serif text-4xl md:text-5xl text-foreground text-balance">
            How to Play Cribbage
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <For each={steps}>
            {(step) => (
              <div class="border border-border rounded-sm p-8 hover:border-primary/50 transition-all duration-300 group">
                <span class="font-serif text-5xl text-primary/30 group-hover:text-primary/60 transition-colors">
                  {step.number}
                </span>
                <h3 class="font-serif text-2xl text-foreground mt-4 mb-3">
                  {step.title}
                </h3>
                <p class="text-muted-foreground leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            )}
          </For>
        </div>
      </div>
    </section>
  )
}

/* ─── Gallery ─── */
function Gallery() {
  return (
    <section id="gallery" class="py-24 md:py-32 px-6 bg-card">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="relative">
            <img
              src="/images/cribbage-pegs.jpg"
              alt="Close-up of brass pegs in a polished wooden cribbage board"
              class="w-full rounded-sm"
            />
            <div class="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-primary"></div>
          </div>
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-primary mb-4">
              More Than a Game
            </p>
            <h2 class="font-serif text-4xl md:text-5xl text-card-foreground leading-tight text-balance mb-6">
              The Perfect 29 Hand
            </h2>
            <p class="text-muted-foreground leading-relaxed mb-6">
              The highest possible hand in cribbage: three fives and the Jack of the suit
              matching the starter five. At roughly 1 in 216,580 odds, seeing one in
              the wild is the cribbage equivalent of a hole-in-one. Most players never hold one,
              but every player dreams of it.
            </p>
            <div class="flex items-center gap-8 text-center">
              <div>
                <p class="font-serif text-4xl text-primary">29</p>
                <p class="text-xs uppercase tracking-widest text-muted-foreground mt-1">Max Score</p>
              </div>
              <div class="w-px h-12 bg-border"></div>
              <div>
                <p class="font-serif text-4xl text-primary">121</p>
                <p class="text-xs uppercase tracking-widest text-muted-foreground mt-1">Points to Win</p>
              </div>
              <div class="w-px h-12 bg-border"></div>
              <div>
                <p class="font-serif text-4xl text-primary">400+</p>
                <p class="text-xs uppercase tracking-widest text-muted-foreground mt-1">Years Old</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer class="border-t border-border py-16 px-6">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div class="text-center md:text-left">
          <p class="font-serif text-2xl text-primary mb-2">CRIBBAGE</p>
          <p class="text-sm text-muted-foreground">
            Celebrating the world's finest two-player card game.
          </p>
        </div>
        <div class="flex items-center gap-8">
          <a href="#about" class="text-sm text-muted-foreground hover:text-primary transition-colors">
            About
          </a>
          <a href="#sayings" class="text-sm text-muted-foreground hover:text-primary transition-colors">
            Sayings
          </a>
          <a href="#scoring" class="text-sm text-muted-foreground hover:text-primary transition-colors">
            Scoring
          </a>
          <a href="#calculator" class="text-sm text-muted-foreground hover:text-primary transition-colors">
            Calculator
          </a>
          <a href="#how-to-play" class="text-sm text-muted-foreground hover:text-primary transition-colors">
            How to Play
          </a>
        </div>
        <p class="text-xs text-muted-foreground">
          {'Fifteen two, and the rest won\'t do.'}
        </p>
      </div>
    </footer>
  )
}
