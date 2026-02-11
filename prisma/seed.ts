import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create default topics
  const topics = [
    // Technology
    {
      name: 'AI & Machine Learning',
      description: 'Latest developments in artificial intelligence, deep learning, and machine learning technologies',
      category: 'technology',
      keywords: ['artificial intelligence', 'machine learning', 'deep learning', 'neural networks', 'AI', 'LLM', 'ChatGPT', 'Claude'],
      isGlobal: false,
    },
    {
      name: 'Cybersecurity',
      description: 'Security breaches, vulnerabilities, privacy issues, and cybersecurity trends',
      category: 'technology',
      keywords: ['cybersecurity', 'data breach', 'hacking', 'ransomware', 'security vulnerability', 'privacy'],
      isGlobal: false,
    },
    {
      name: 'Web Development',
      description: 'Web development trends, frameworks, tools, and best practices',
      category: 'technology',
      keywords: ['web development', 'JavaScript', 'React', 'TypeScript', 'Next.js', 'frontend', 'backend'],
      isGlobal: false,
    },
    {
      name: 'Startups',
      description: 'Startup funding, launches, acquisitions, and entrepreneurship news',
      category: 'technology',
      keywords: ['startup', 'venture capital', 'funding', 'Y Combinator', 'seed round', 'acquisition', 'unicorn'],
      isGlobal: false,
    },
    {
      name: 'Gadgets & Reviews',
      description: 'New gadget releases, tech product reviews, and consumer electronics',
      category: 'technology',
      keywords: ['gadgets', 'smartphone', 'laptop', 'product review', 'tech review', 'iPhone', 'Android'],
      isGlobal: false,
    },

    // Business
    {
      name: 'Stock Market',
      description: 'Stock market trends, major index movements, and trading news',
      category: 'business',
      keywords: ['stock market', 'S&P 500', 'Dow Jones', 'NASDAQ', 'stocks', 'trading', 'Wall Street'],
      isGlobal: false,
    },
    {
      name: 'Crypto & Blockchain',
      description: 'Cryptocurrency prices, blockchain technology, and Web3 developments',
      category: 'business',
      keywords: ['cryptocurrency', 'Bitcoin', 'Ethereum', 'blockchain', 'crypto', 'Web3', 'NFT', 'DeFi'],
      isGlobal: false,
    },
    {
      name: 'Entrepreneurship',
      description: 'Business strategy, leadership, and entrepreneurship insights',
      category: 'business',
      keywords: ['entrepreneurship', 'business strategy', 'leadership', 'management', 'CEO', 'startup culture'],
      isGlobal: false,
    },
    {
      name: 'Personal Finance',
      description: 'Investment tips, savings strategies, and personal finance advice',
      category: 'business',
      keywords: ['personal finance', 'investing', 'retirement', '401k', 'savings', 'financial planning', 'budget'],
      isGlobal: false,
    },

    // Science
    {
      name: 'Space & Astronomy',
      description: 'Space exploration, astronomy discoveries, and NASA missions',
      category: 'science',
      keywords: ['space', 'NASA', 'SpaceX', 'astronomy', 'rocket', 'Mars', 'satellite', 'telescope'],
      isGlobal: false,
    },
    {
      name: 'Climate & Environment',
      description: 'Climate change, environmental policy, and sustainability news',
      category: 'science',
      keywords: ['climate change', 'environment', 'sustainability', 'renewable energy', 'global warming', 'carbon emissions'],
      isGlobal: false,
    },
    {
      name: 'Medical Research',
      description: 'Medical breakthroughs, clinical trials, and healthcare innovations',
      category: 'science',
      keywords: ['medical research', 'clinical trial', 'healthcare', 'medicine', 'treatment', 'disease', 'vaccine'],
      isGlobal: false,
    },
    {
      name: 'Physics',
      description: 'Physics discoveries, quantum computing, and scientific research',
      category: 'science',
      keywords: ['physics', 'quantum', 'particle physics', 'CERN', 'scientific research', 'quantum computing'],
      isGlobal: false,
    },

    // Politics
    {
      name: 'US Politics',
      description: 'US political news, elections, and government policy',
      category: 'politics',
      keywords: ['US politics', 'Congress', 'Senate', 'House', 'president', 'election', 'White House'],
      isGlobal: false,
    },
    {
      name: 'International Relations',
      description: 'Global diplomacy, international conflicts, and foreign policy',
      category: 'politics',
      keywords: ['international relations', 'diplomacy', 'foreign policy', 'United Nations', 'geopolitics'],
      isGlobal: false,
    },
    {
      name: 'Policy & Legislation',
      description: 'New laws, regulations, and policy debates',
      category: 'politics',
      keywords: ['policy', 'legislation', 'law', 'regulation', 'bill', 'Supreme Court'],
      isGlobal: false,
    },

    // Sports
    {
      name: 'NFL',
      description: 'NFL games, scores, trades, and football news',
      category: 'sports',
      keywords: ['NFL', 'football', 'Super Bowl', 'quarterback', 'touchdown'],
      isGlobal: false,
    },
    {
      name: 'NBA',
      description: 'NBA games, player news, and basketball updates',
      category: 'sports',
      keywords: ['NBA', 'basketball', 'playoffs', 'LeBron', 'dunks'],
      isGlobal: false,
    },
    {
      name: 'Soccer/Football',
      description: 'International soccer news, leagues, and tournaments',
      category: 'sports',
      keywords: ['soccer', 'football', 'Premier League', 'Champions League', 'FIFA', 'World Cup', 'Messi', 'Ronaldo'],
      isGlobal: false,
    },
    {
      name: 'Tennis',
      description: 'Tennis tournaments, player rankings, and match results',
      category: 'sports',
      keywords: ['tennis', 'Grand Slam', 'Wimbledon', 'US Open', 'ATP', 'WTA'],
      isGlobal: false,
    },
    {
      name: 'Motorsports',
      description: 'Formula 1, NASCAR, and racing news',
      category: 'sports',
      keywords: ['Formula 1', 'F1', 'NASCAR', 'racing', 'Grand Prix', 'motorsports'],
      isGlobal: false,
    },

    // Entertainment
    {
      name: 'Movies & TV',
      description: 'New movie releases, TV shows, streaming, and entertainment news',
      category: 'entertainment',
      keywords: ['movies', 'film', 'TV shows', 'Netflix', 'streaming', 'Hollywood', 'actor', 'Oscar'],
      isGlobal: false,
    },
    {
      name: 'Music',
      description: 'Music releases, concerts, artist news, and industry updates',
      category: 'entertainment',
      keywords: ['music', 'album', 'concert', 'Grammy', 'artist', 'band', 'song'],
      isGlobal: false,
    },
    {
      name: 'Gaming',
      description: 'Video game releases, esports, and gaming industry news',
      category: 'entertainment',
      keywords: ['gaming', 'video games', 'esports', 'PlayStation', 'Xbox', 'Nintendo', 'PC gaming'],
      isGlobal: false,
    },
    {
      name: 'Books',
      description: 'Book releases, bestsellers, and literary news',
      category: 'entertainment',
      keywords: ['books', 'novel', 'bestseller', 'author', 'publishing', 'literature'],
      isGlobal: false,
    },

    // Health
    {
      name: 'Fitness',
      description: 'Workout tips, fitness trends, and exercise science',
      category: 'health',
      keywords: ['fitness', 'workout', 'exercise', 'gym', 'training', 'bodybuilding'],
      isGlobal: false,
    },
    {
      name: 'Nutrition',
      description: 'Nutrition science, diet trends, and healthy eating',
      category: 'health',
      keywords: ['nutrition', 'diet', 'healthy eating', 'vitamins', 'supplements', 'food'],
      isGlobal: false,
    },
    {
      name: 'Mental Health',
      description: 'Mental health awareness, therapy, and wellness',
      category: 'health',
      keywords: ['mental health', 'therapy', 'wellness', 'psychology', 'anxiety', 'depression', 'mindfulness'],
      isGlobal: false,
    },

    // World
    {
      name: 'Breaking News',
      description: 'Major breaking news and current events worldwide',
      category: 'world',
      keywords: ['breaking news', 'urgent', 'developing', 'alert', 'latest news'],
      isGlobal: false,
    },
    {
      name: 'Economics',
      description: 'Economic indicators, inflation, employment, and global economy',
      category: 'world',
      keywords: ['economics', 'GDP', 'inflation', 'unemployment', 'Federal Reserve', 'interest rates', 'recession'],
      isGlobal: false,
    },
    {
      name: 'Geopolitics',
      description: 'Global political dynamics, conflicts, and international news',
      category: 'world',
      keywords: ['geopolitics', 'international news', 'conflict', 'war', 'peace talks', 'sanctions'],
      isGlobal: false,
    },
  ];

  console.log(`Creating ${topics.length} default topics...`);

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: {
        name_category: {
          name: topic.name,
          category: topic.category,
        },
      },
      update: {
        description: topic.description,
        keywords: topic.keywords,
        isGlobal: topic.isGlobal,
      },
      create: topic,
    });
  }

  console.log('✓ Topics seeded successfully!');

  // Create global events
  const globalEvents = [
    // 2026 US Holidays
    {
      title: "New Year's Day",
      description: "The first day of the year, a public holiday in the United States",
      date: new Date("2026-01-01"),
      category: "holiday",
      country: "US",
      isActive: true,
    },
    {
      title: "Martin Luther King Jr. Day",
      description: "Federal holiday honoring the civil rights leader",
      date: new Date("2026-01-19"),
      category: "holiday",
      country: "US",
      isActive: true,
    },
    {
      title: "Valentine's Day",
      description: "Day of romance and love celebrated worldwide",
      date: new Date("2026-02-14"),
      category: "cultural",
      country: null, // worldwide
      isActive: true,
    },
    {
      title: "Presidents' Day",
      description: "Federal holiday honoring all U.S. presidents",
      date: new Date("2026-02-16"),
      category: "holiday",
      country: "US",
      isActive: true,
    },
    {
      title: "International Women's Day",
      description: "Global day celebrating women's achievements and advocating for gender equality",
      date: new Date("2026-03-08"),
      category: "cultural",
      country: null,
      isActive: true,
    },
    {
      title: "St. Patrick's Day",
      description: "Irish cultural and religious celebration",
      date: new Date("2026-03-17"),
      category: "cultural",
      country: null,
      isActive: true,
    },
    {
      title: "Earth Day",
      description: "Annual event demonstrating support for environmental protection",
      date: new Date("2026-04-22"),
      category: "cultural",
      country: null,
      isActive: true,
    },
    {
      title: "Memorial Day",
      description: "Federal holiday honoring those who died while serving in the U.S. military",
      date: new Date("2026-05-25"),
      category: "holiday",
      country: "US",
      isActive: true,
    },
    {
      title: "Independence Day",
      description: "Celebration of U.S. independence from Great Britain",
      date: new Date("2026-07-04"),
      category: "holiday",
      country: "US",
      isActive: true,
    },
    {
      title: "Labor Day",
      description: "Federal holiday celebrating the American labor movement",
      date: new Date("2026-09-07"),
      category: "holiday",
      country: "US",
      isActive: true,
    },
    {
      title: "Halloween",
      description: "Annual celebration with costumes, trick-or-treating, and decorations",
      date: new Date("2026-10-31"),
      category: "cultural",
      country: null,
      isActive: true,
    },
    {
      title: "Veterans Day",
      description: "Federal holiday honoring military veterans",
      date: new Date("2026-11-11"),
      category: "holiday",
      country: "US",
      isActive: true,
    },
    {
      title: "Thanksgiving",
      description: "National holiday celebrating harvest and other blessings of the past year",
      date: new Date("2026-11-26"),
      category: "holiday",
      country: "US",
      isActive: true,
    },
    {
      title: "Christmas Eve",
      description: "Day before Christmas, often celebrated with family gatherings",
      date: new Date("2026-12-24"),
      category: "holiday",
      country: null,
      isActive: true,
    },
    {
      title: "Christmas Day",
      description: "Christian holiday celebrating the birth of Jesus Christ",
      date: new Date("2026-12-25"),
      category: "holiday",
      country: null,
      isActive: true,
    },
    {
      title: "New Year's Eve",
      description: "Final day of the year, celebrated with parties and fireworks",
      date: new Date("2026-12-31"),
      category: "holiday",
      country: null,
      isActive: true,
    },

    // 2026 Cultural & Sports Events
    {
      title: "Super Bowl LX",
      description: "The NFL championship game",
      date: new Date("2026-02-08"),
      category: "sports",
      country: "US",
      isActive: true,
    },
    {
      title: "Academy Awards (Oscars)",
      description: "Annual awards ceremony honoring cinematic achievements",
      date: new Date("2026-03-29"),
      category: "cultural",
      country: "US",
      isActive: true,
    },
    {
      title: "Grammy Awards",
      description: "Annual awards ceremony for outstanding achievements in music",
      date: new Date("2026-02-01"),
      category: "cultural",
      country: "US",
      isActive: true,
    },
    {
      title: "FIFA World Cup",
      description: "International soccer tournament",
      date: new Date("2026-06-11"),
      category: "sports",
      country: null,
      isActive: true,
    },

    // 2026 Political Events
    {
      title: "U.S. Midterm Elections",
      description: "Congressional and gubernatorial elections",
      date: new Date("2026-11-03"),
      category: "election",
      country: "US",
      isActive: true,
    },
  ];

  console.log(`Creating ${globalEvents.length} global events...`);

  for (const event of globalEvents) {
    await prisma.globalEvent.create({
      data: event,
    });
  }

  console.log('✓ Global events seeded successfully!');
  console.log('✓ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
