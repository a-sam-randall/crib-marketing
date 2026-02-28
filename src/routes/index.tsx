import { createFileRoute } from '@tanstack/solid-router'
import { For, createSignal, onMount } from 'solid-js'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div class="min-h-screen bg-background">
      <Nav />
      <Hero />
      <QuipMarquee />
      <About />
      <Sayings />
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
        <a href="#how-to-play" class="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
          How to Play
        </a>
        <a href="#gallery" class="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
          Gallery
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
