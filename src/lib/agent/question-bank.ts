import type { SystemDesignProblem, InterviewLevel } from "@/types";

export const SYSTEM_DESIGN_PROBLEMS: SystemDesignProblem[] = [
  // ============ CLASSIC SYSTEM DESIGN (10) ============
  {
    id: "url-shortener",
    title: "Design a URL Shortener",
    category: "classic",
    difficulty: ["junior", "mid"],
    description:
      "Design a service like bit.ly that takes long URLs and creates short, unique aliases. When users visit the short URL, they are redirected to the original URL.",
    keyComponents: [
      "URL encoding/hashing algorithm",
      "Database for URL mappings",
      "Redirect service with low latency",
      "Collision handling strategy",
      "Analytics and click tracking",
      "Expiration and cleanup",
    ],
    followUpQuestions: [
      "How do you generate a unique short code? What if two URLs hash to the same code?",
      "What database would you use and why? How would you design the schema?",
      "How would you handle 1000 URL creation requests per second?",
      "What happens when a user clicks a short URL? Walk me through the redirect flow.",
      "How would you implement custom short URLs (vanity URLs)?",
      "How would you handle URL expiration?",
    ],
    commonMistakes: [
      "Using auto-increment IDs which are predictable and sequential",
      "Not considering hash collisions",
      "Forgetting about 301 vs 302 redirects and their caching implications",
      "Not addressing read-heavy nature of the system (100:1 read:write ratio)",
    ],
    tags: ["hashing", "database", "api", "caching", "redirect"],
  },
  {
    id: "twitter-feed",
    title: "Design Twitter/X Feed",
    category: "classic",
    difficulty: ["mid", "senior"],
    description:
      "Design the home timeline/feed for a social media platform like Twitter/X. Users can post tweets, follow other users, and see a chronological or ranked feed of tweets from people they follow.",
    keyComponents: [
      "Tweet creation and storage",
      "Fan-out on write vs fan-out on read",
      "Feed generation and ranking",
      "User follow graph",
      "Caching layer for hot feeds",
      "Media storage and CDN",
      "Real-time updates via WebSocket/SSE",
    ],
    followUpQuestions: [
      "How would you handle a celebrity with 50 million followers posting a tweet?",
      "Fan-out on write or fan-out on read? What are the tradeoffs?",
      "How would you rank the feed? Chronological vs algorithmic?",
      "How do you handle the follow/unfollow graph at scale?",
      "What happens when a user scrolls their feed? How do you paginate?",
      "How would you implement real-time tweet delivery?",
      "How do you handle tweet deletion? What about cached feeds?",
    ],
    commonMistakes: [
      "Using fan-out on write for ALL users including celebrities",
      "Not considering the hybrid approach (fan-out on write for regular users, on read for celebrities)",
      "Ignoring the cold start problem for new users",
      "Not discussing cache invalidation when feed ranking changes",
      "Forgetting about media attachment storage and serving",
    ],
    tags: ["feed", "fanout", "caching", "social", "ranking", "real-time"],
  },
  {
    id: "chat-system",
    title: "Design a Chat System",
    category: "classic",
    difficulty: ["mid", "senior"],
    description:
      "Design a real-time messaging system like WhatsApp or Slack. Users can send messages in 1:1 conversations and group chats, with read receipts and online presence indicators.",
    keyComponents: [
      "WebSocket connection management",
      "Message storage and retrieval",
      "Message delivery guarantees",
      "Group chat fan-out",
      "Online presence system",
      "Read receipts and delivery status",
      "Push notifications for offline users",
      "Message encryption",
    ],
    followUpQuestions: [
      "How do you maintain persistent connections for real-time delivery?",
      "What happens when a user is offline? How do you deliver messages later?",
      "How do you handle message ordering in a distributed system?",
      "How do you implement group chats with thousands of members?",
      "How would you implement the 'typing...' indicator?",
      "How do you handle message history sync across multiple devices?",
    ],
    commonMistakes: [
      "Not distinguishing between sent, delivered, and read states",
      "Using HTTP polling instead of WebSockets for real-time",
      "Not considering message ordering across multiple servers",
      "Ignoring the offline message queue",
      "Not discussing end-to-end encryption implications on search",
    ],
    tags: ["websocket", "real-time", "messaging", "queue", "presence", "encryption"],
  },
  {
    id: "notification-system",
    title: "Design a Notification System",
    category: "classic",
    difficulty: ["mid"],
    description:
      "Design a notification system that can send push notifications, SMS, and email. It should support multiple channels, user preferences, rate limiting, and templating.",
    keyComponents: [
      "Notification ingestion API",
      "Channel routing (push, SMS, email)",
      "User preference management",
      "Template engine",
      "Rate limiting per user",
      "Priority queue for urgent notifications",
      "Delivery tracking and analytics",
    ],
    followUpQuestions: [
      "How do you handle a flash sale that triggers notifications to 10 million users?",
      "How do you prevent notification fatigue? What rate limiting strategy?",
      "How do you ensure notifications are delivered exactly once?",
      "How would you implement notification preferences per channel?",
      "How do you handle failures in third-party providers (e.g., APNS goes down)?",
      "How would you implement notification grouping/batching?",
    ],
    commonMistakes: [
      "Not separating the notification pipeline from the business logic",
      "Treating all notifications with equal priority",
      "Not implementing retry with backoff for failed deliveries",
      "Ignoring user timezone for scheduling",
      "Not considering the thundering herd problem for mass notifications",
    ],
    tags: ["queue", "push-notification", "email", "sms", "rate-limiting", "templating"],
  },
  {
    id: "rate-limiter",
    title: "Design a Rate Limiter",
    category: "classic",
    difficulty: ["junior", "mid"],
    description:
      "Design a rate limiting service that can limit API requests per user, per IP, or per endpoint. It should work in a distributed environment with multiple servers.",
    keyComponents: [
      "Rate limiting algorithms (token bucket, sliding window, fixed window)",
      "Distributed counting with Redis",
      "Per-user, per-IP, and per-endpoint rules",
      "Response headers (X-RateLimit-*)",
      "Graceful degradation under load",
    ],
    followUpQuestions: [
      "Compare token bucket vs sliding window vs fixed window. When would you use each?",
      "How do you implement this in a distributed system with multiple API servers?",
      "What data structure would you use in Redis?",
      "How do you handle race conditions when multiple requests arrive simultaneously?",
      "What happens when Redis is unavailable? Fail open or fail closed?",
      "How would you implement tiered rate limits (free vs paid users)?",
    ],
    commonMistakes: [
      "Not considering the distributed case (rate limit per server vs global)",
      "Using fixed window which allows burst at window boundaries",
      "Not addressing race conditions in the increment-and-check pattern",
      "Forgetting to include rate limit info in response headers",
    ],
    tags: ["rate-limiting", "redis", "distributed", "algorithm", "api"],
  },
  {
    id: "web-crawler",
    title: "Design a Web Crawler",
    category: "classic",
    difficulty: ["mid", "senior"],
    description:
      "Design a web crawler that can crawl billions of web pages. It should be polite (respect robots.txt), handle duplicates, and store the crawled content for indexing.",
    keyComponents: [
      "URL frontier and prioritization",
      "DNS resolution caching",
      "robots.txt compliance",
      "Content deduplication (fingerprinting)",
      "Distributed crawling architecture",
      "Politeness: per-domain rate limiting",
      "URL normalization",
    ],
    followUpQuestions: [
      "How do you prioritize which URLs to crawl first?",
      "How do you detect and handle duplicate content?",
      "How do you distribute work across multiple crawler instances?",
      "How do you handle crawler traps (infinite URLs)?",
      "What happens when a page returns a redirect chain?",
      "How do you handle dynamic JavaScript-rendered pages?",
    ],
    commonMistakes: [
      "Not implementing per-domain rate limiting (being impolite)",
      "BFS without URL prioritization",
      "Not normalizing URLs before deduplication",
      "Ignoring crawler traps and infinite URL generation",
      "Not considering DNS resolution as a bottleneck",
    ],
    tags: ["distributed", "crawling", "deduplication", "queue", "dns"],
  },
  {
    id: "video-streaming",
    title: "Design YouTube / Video Streaming",
    category: "classic",
    difficulty: ["senior"],
    description:
      "Design a video streaming platform like YouTube. Users can upload videos, which are transcoded into multiple formats and resolutions, and streamed to viewers via adaptive bitrate streaming.",
    keyComponents: [
      "Video upload and storage pipeline",
      "Transcoding to multiple resolutions/formats",
      "Adaptive bitrate streaming (HLS/DASH)",
      "CDN for video delivery",
      "Thumbnail generation",
      "Video metadata and search",
      "View counting and analytics",
      "Recommendation engine",
    ],
    followUpQuestions: [
      "Walk me through what happens when a user uploads a video.",
      "How does adaptive bitrate streaming work?",
      "How would you design the transcoding pipeline to handle 500 hours of video uploaded per minute?",
      "How do you count views accurately without double-counting?",
      "How would you implement seeking to a specific timestamp?",
      "How do you handle live streaming vs pre-recorded content?",
      "How would you optimize for mobile users on slow connections?",
    ],
    commonMistakes: [
      "Not separating upload, processing, and serving as distinct systems",
      "Serving video directly from origin instead of CDN",
      "Not discussing video segmentation for adaptive streaming",
      "Ignoring the cold start problem for newly uploaded videos",
      "Not considering copyright/content moderation in the upload pipeline",
    ],
    tags: ["streaming", "cdn", "transcoding", "storage", "hls", "media"],
  },
  {
    id: "ride-sharing",
    title: "Design Uber / Ride Sharing",
    category: "classic",
    difficulty: ["senior"],
    description:
      "Design a ride-sharing platform like Uber. Riders request rides, the system matches them with nearby drivers, tracks the ride in real-time, and handles payments.",
    keyComponents: [
      "Geospatial indexing for nearby drivers",
      "Ride matching algorithm",
      "Real-time location tracking",
      "ETA calculation",
      "Surge pricing",
      "Payment processing",
      "Trip history and receipts",
      "Driver and rider rating system",
    ],
    followUpQuestions: [
      "How do you efficiently find drivers near a rider? What data structure?",
      "How do you handle the case where a driver accepts but then cancels?",
      "How would you implement surge pricing? What signals do you use?",
      "How do you track driver location in real-time at scale?",
      "How do you handle payment failures after a ride is completed?",
      "How would you calculate accurate ETAs considering traffic?",
    ],
    commonMistakes: [
      "Using simple distance calculation instead of geospatial indexing (S2, H3, geohash)",
      "Not considering race conditions in ride matching (two riders matched to same driver)",
      "Ignoring the stateful nature of a ride (requested, matched, in-progress, completed)",
      "Not discussing how to handle network partitions during a ride",
    ],
    tags: ["geospatial", "real-time", "matching", "location", "payments"],
  },
  {
    id: "ecommerce",
    title: "Design an E-commerce Platform",
    category: "classic",
    difficulty: ["mid", "senior"],
    description:
      "Design an e-commerce platform like Amazon. Users can browse products, add to cart, and checkout with payment. Handle inventory management, search, and order fulfillment.",
    keyComponents: [
      "Product catalog and search",
      "Shopping cart (persistent across sessions)",
      "Inventory management with concurrency control",
      "Order processing pipeline",
      "Payment integration",
      "Product recommendation",
      "User reviews and ratings",
    ],
    followUpQuestions: [
      "How do you handle inventory when 1000 users try to buy the last item?",
      "How would you implement the checkout flow? What about cart abandonment?",
      "How do you ensure an order is not double-charged?",
      "How would you design product search with filters and sorting?",
      "How do you handle flash sales with extreme traffic spikes?",
      "How would you implement the 'customers also bought' feature?",
    ],
    commonMistakes: [
      "Not using optimistic or pessimistic locking for inventory",
      "Not separating the cart service from the order service",
      "Ignoring idempotency in payment processing",
      "Not considering eventual consistency between inventory and catalog",
      "Forgetting about the order state machine (placed, paid, shipped, delivered)",
    ],
    tags: ["inventory", "payments", "search", "cart", "catalog", "orders"],
  },
  {
    id: "search-autocomplete",
    title: "Design Search Autocomplete",
    category: "classic",
    difficulty: ["mid"],
    description:
      "Design a search autocomplete/typeahead system that suggests completions as the user types. It should be fast (< 100ms), personalized, and handle trending queries.",
    keyComponents: [
      "Trie data structure for prefix matching",
      "Query frequency tracking",
      "Ranking algorithm for suggestions",
      "Caching layer for popular prefixes",
      "Data collection pipeline from search logs",
      "Personalization based on user history",
    ],
    followUpQuestions: [
      "What data structure would you use for prefix matching? Why a trie over other options?",
      "How do you rank the suggestions? Just by frequency?",
      "How would you update the autocomplete data in real-time with trending queries?",
      "How do you handle offensive or sensitive suggestions?",
      "How would you personalize suggestions for individual users?",
      "What's your caching strategy? Which prefixes do you cache?",
    ],
    commonMistakes: [
      "Building the entire trie in memory without considering the dataset size",
      "Not caching popular prefix results",
      "Using only frequency without considering recency for trending",
      "Not filtering offensive or illegal content from suggestions",
      "Ignoring latency requirements (autocomplete must be < 100ms)",
    ],
    tags: ["trie", "search", "caching", "ranking", "real-time", "personalization"],
  },

  // ============ INFRASTRUCTURE (5) ============
  {
    id: "distributed-cache",
    title: "Design a Distributed Cache",
    category: "infrastructure",
    difficulty: ["senior"],
    description:
      "Design a distributed caching system like Memcached or Redis. It should support high throughput, low latency lookups, and horizontal scaling across multiple nodes.",
    keyComponents: [
      "Consistent hashing for data distribution",
      "Cache eviction policies (LRU, LFU, TTL)",
      "Replication for high availability",
      "Cache invalidation strategies",
      "Hot key handling",
      "Memory management",
    ],
    followUpQuestions: [
      "How do you distribute data across multiple cache nodes? What happens when a node is added or removed?",
      "Compare LRU vs LFU eviction. When would you use each?",
      "How do you handle a hot key that one node can't handle alone?",
      "How do you keep the cache consistent with the database?",
      "What happens when a cache node goes down? How do you prevent a stampede to the database?",
      "How would you implement cache warming?",
    ],
    commonMistakes: [
      "Using modulo hashing instead of consistent hashing (causes massive redistribution on node changes)",
      "Not considering the thundering herd problem when cache expires",
      "Ignoring hot keys that can overload a single node",
      "Not discussing cache-aside vs write-through vs write-behind patterns",
    ],
    tags: ["caching", "consistent-hashing", "distributed", "eviction", "redis"],
  },
  {
    id: "task-queue",
    title: "Design a Task Queue / Job Scheduler",
    category: "infrastructure",
    difficulty: ["mid", "senior"],
    description:
      "Design a distributed task queue system like Celery or AWS SQS. It should support job scheduling, priority queues, retry with backoff, dead letter queues, and exactly-once processing.",
    keyComponents: [
      "Job submission and storage",
      "Worker pool management",
      "Priority queue implementation",
      "Retry with exponential backoff",
      "Dead letter queue for failed jobs",
      "Scheduled/delayed job execution",
      "At-least-once or exactly-once delivery guarantees",
    ],
    followUpQuestions: [
      "How do you ensure a job is processed exactly once?",
      "What happens when a worker crashes mid-processing?",
      "How do you implement priority — do higher priority jobs always preempt?",
      "How do you scale workers horizontally?",
      "How would you implement delayed/scheduled jobs?",
      "How do you monitor and alert on queue depth and processing latency?",
    ],
    commonMistakes: [
      "Claiming exactly-once delivery without discussing the impossibility in distributed systems",
      "Not implementing visibility timeout for at-least-once processing",
      "Ignoring poison messages that always fail (need dead letter queue)",
      "Not discussing idempotency of job handlers",
    ],
    tags: ["queue", "distributed", "scheduling", "retry", "workers"],
  },
  {
    id: "logging-monitoring",
    title: "Design a Logging & Monitoring System",
    category: "infrastructure",
    difficulty: ["mid", "senior"],
    description:
      "Design a centralized logging and monitoring system like Datadog or the ELK stack. It should ingest logs from thousands of services, support search, and trigger alerts.",
    keyComponents: [
      "Log ingestion pipeline (high throughput)",
      "Log storage (time-series optimized)",
      "Full-text search indexing",
      "Alert rules engine",
      "Dashboard and visualization",
      "Log retention and archival",
      "Sampling for high-volume services",
    ],
    followUpQuestions: [
      "How do you handle ingesting 1 million log events per second?",
      "What storage format do you use? How do you optimize for time-range queries?",
      "How do you implement full-text search across petabytes of logs?",
      "How would you design the alerting system to avoid alert fatigue?",
      "How do you handle log storage costs? What's your retention policy?",
      "How do you correlate logs across microservices (distributed tracing)?",
    ],
    commonMistakes: [
      "Not using a message queue to buffer between ingestion and processing",
      "Indexing every field instead of selectively indexing",
      "Not implementing log sampling for high-volume services",
      "Ignoring the cost of storing and indexing all logs forever",
    ],
    tags: ["logging", "monitoring", "time-series", "alerting", "search", "elk"],
  },
  {
    id: "api-gateway",
    title: "Design an API Gateway",
    category: "infrastructure",
    difficulty: ["senior"],
    description:
      "Design an API gateway that sits in front of your microservices. It should handle routing, authentication, rate limiting, request transformation, and circuit breaking.",
    keyComponents: [
      "Request routing and load balancing",
      "Authentication and authorization",
      "Rate limiting (per user, per endpoint)",
      "Circuit breaker pattern",
      "Request/response transformation",
      "API versioning",
      "Observability (logging, metrics, tracing)",
    ],
    followUpQuestions: [
      "How does the gateway discover which microservice to route to?",
      "How do you implement the circuit breaker pattern?",
      "How do you handle authentication? JWT validation at the gateway vs forwarding?",
      "How do you ensure the gateway doesn't become a single point of failure?",
      "How would you implement canary deployments using the gateway?",
      "What's the latency overhead of the gateway? How do you minimize it?",
    ],
    commonMistakes: [
      "Making the gateway too smart (putting business logic in it)",
      "Not considering the gateway as a single point of failure",
      "Ignoring the latency overhead of every request passing through it",
      "Not separating external-facing vs internal API gateways",
    ],
    tags: ["api-gateway", "routing", "auth", "rate-limiting", "circuit-breaker", "microservices"],
  },
  {
    id: "cdn",
    title: "Design a Content Delivery Network",
    category: "infrastructure",
    difficulty: ["senior"],
    description:
      "Design a CDN that serves static and dynamic content from edge servers close to users. It should handle cache invalidation, origin shielding, and support millions of concurrent users.",
    keyComponents: [
      "Edge server placement and DNS-based routing",
      "Cache hierarchy (edge, regional, origin shield)",
      "Cache invalidation (purge, TTL, stale-while-revalidate)",
      "Origin shielding to protect backend",
      "TLS termination at edge",
      "DDoS protection",
      "Real-time analytics and logging",
    ],
    followUpQuestions: [
      "How does a user's request get routed to the nearest edge server?",
      "What's your cache invalidation strategy? How fast can you purge globally?",
      "How do you handle cache misses? What is origin shielding?",
      "How would you serve personalized or dynamic content from the CDN?",
      "How do you handle a DDoS attack at the edge?",
      "How do you measure cache hit rates and optimize them?",
    ],
    commonMistakes: [
      "Not discussing DNS-based vs anycast routing",
      "Ignoring cache stampede on TTL expiration across edge nodes",
      "Not distinguishing between static and dynamic content strategies",
      "Forgetting about TLS certificate management at the edge",
    ],
    tags: ["cdn", "caching", "edge", "dns", "tls", "ddos"],
  },

  // ============ ML SYSTEM DESIGN (5) ============
  {
    id: "recommendation-system",
    title: "Design a Recommendation System",
    category: "ml",
    difficulty: ["mid", "senior"],
    description:
      "Design a recommendation system for a product like Netflix, Spotify, or Amazon. It should generate personalized recommendations based on user behavior, collaborative filtering, and content features.",
    keyComponents: [
      "Data collection pipeline (user interactions)",
      "Candidate generation (recall stage)",
      "Ranking model (precision stage)",
      "Feature store for user and item features",
      "A/B testing framework",
      "Cold start handling for new users/items",
      "Real-time vs batch recommendation updates",
    ],
    followUpQuestions: [
      "How do you handle the cold start problem for a new user with no history?",
      "What's the difference between collaborative filtering and content-based filtering?",
      "How do you serve recommendations with < 100ms latency?",
      "How do you evaluate recommendation quality? What metrics do you track?",
      "How do you balance exploration vs exploitation?",
      "How do you handle the feedback loop problem (recommending only what users already like)?",
    ],
    commonMistakes: [
      "Not separating candidate generation from ranking",
      "Ignoring the cold start problem",
      "Not discussing how to evaluate recommendations beyond click-through rate",
      "Building a batch-only system without real-time signals",
      "Not considering diversity and serendipity in recommendations",
    ],
    tags: ["ml", "recommendation", "collaborative-filtering", "ranking", "feature-store"],
  },
  {
    id: "content-moderation",
    title: "Design a Content Moderation Pipeline",
    category: "ml",
    difficulty: ["mid"],
    description:
      "Design a content moderation system that detects and removes harmful content (hate speech, spam, NSFW) across text, images, and video. It should balance automation with human review.",
    keyComponents: [
      "Multi-modal classification (text, image, video)",
      "Confidence thresholds and human review queue",
      "Appeal process",
      "Training data pipeline and labeling",
      "Real-time vs batch processing",
      "Policy engine for rule-based moderation",
      "User reporting system",
    ],
    followUpQuestions: [
      "How do you handle edge cases where the model is uncertain?",
      "How do you prioritize the human review queue?",
      "How do you handle false positives (incorrectly removing content)?",
      "How do you keep the model updated as new types of harmful content emerge?",
      "How do you handle content in different languages and cultural contexts?",
      "What's the latency requirement? Should moderation happen before or after publishing?",
    ],
    commonMistakes: [
      "Relying only on ML without human-in-the-loop for edge cases",
      "Not implementing an appeals process",
      "Ignoring the cost and scale of human review",
      "Not versioning moderation policies separately from ML models",
    ],
    tags: ["ml", "moderation", "classification", "human-in-loop", "queue"],
  },
  {
    id: "search-ranking",
    title: "Design a Search Ranking System",
    category: "ml",
    difficulty: ["senior"],
    description:
      "Design a search ranking system that takes a query and returns the most relevant results from billions of documents. It should handle query understanding, retrieval, and ranking.",
    keyComponents: [
      "Query understanding (spell check, expansion, intent)",
      "Inverted index for retrieval",
      "Two-stage ranking (lightweight recall + heavy ranking)",
      "Feature engineering (BM25, click-through rate, freshness)",
      "Learning to rank model",
      "Online evaluation (interleaving, A/B tests)",
      "Index serving infrastructure",
    ],
    followUpQuestions: [
      "How do you handle a query like 'apple' — the fruit or the company?",
      "What features would you use in your ranking model?",
      "How do you train the ranking model? What data do you use?",
      "How do you handle freshness? Should newer content rank higher?",
      "How do you serve results in < 200ms from billions of documents?",
      "How do you detect and prevent SEO spam from gaming the rankings?",
    ],
    commonMistakes: [
      "Using only TF-IDF or BM25 without a learned ranking model",
      "Not considering query intent disambiguation",
      "Ignoring position bias in click-through data used for training",
      "Not separating recall (fast, broad) from ranking (slow, precise)",
    ],
    tags: ["ml", "search", "ranking", "information-retrieval", "nlp"],
  },
  {
    id: "fraud-detection",
    title: "Design a Fraud Detection System",
    category: "ml",
    difficulty: ["senior"],
    description:
      "Design a real-time fraud detection system for a payment platform. It should score transactions in real-time, minimize false positives, and adapt to new fraud patterns.",
    keyComponents: [
      "Real-time feature computation",
      "ML model for fraud scoring",
      "Rule engine for known fraud patterns",
      "Feature store (real-time and batch features)",
      "Human review workflow for borderline cases",
      "Feedback loop for model retraining",
      "Device fingerprinting and behavioral analysis",
    ],
    followUpQuestions: [
      "How do you score a transaction in < 100ms?",
      "What features would you compute? Give examples of real-time vs batch features.",
      "How do you handle the extreme class imbalance (fraud is < 0.1% of transactions)?",
      "How do you minimize false positives without letting fraud through?",
      "How do you detect new fraud patterns the model hasn't seen?",
      "How do you handle the cold start for new users with no transaction history?",
    ],
    commonMistakes: [
      "Not computing real-time aggregation features (e.g., number of transactions in last hour)",
      "Training on historical data without accounting for feedback loops",
      "Not having a rule engine alongside ML for known fraud patterns",
      "Ignoring the cost asymmetry (missing fraud is much worse than false positive)",
    ],
    tags: ["ml", "fraud", "real-time", "feature-store", "classification"],
  },
  {
    id: "feature-store",
    title: "Design a Real-time Feature Store",
    category: "ml",
    difficulty: ["senior"],
    description:
      "Design a feature store that serves ML features with low latency for online inference and supports batch feature computation for training. Used by recommendation, fraud, and ranking systems.",
    keyComponents: [
      "Online store for low-latency serving (< 10ms)",
      "Offline store for batch feature computation",
      "Feature registry and versioning",
      "Point-in-time correctness for training data",
      "Stream processing for real-time feature updates",
      "Feature monitoring and drift detection",
    ],
    followUpQuestions: [
      "How do you serve features with < 10ms latency?",
      "How do you ensure point-in-time correctness when generating training data?",
      "How do you handle feature drift? How do you detect it?",
      "How do you version features? What happens when a feature definition changes?",
      "How do you backfill features for historical data?",
      "What's the architecture for real-time feature computation from event streams?",
    ],
    commonMistakes: [
      "Not separating online (serving) and offline (training) stores",
      "Ignoring point-in-time correctness leading to data leakage in training",
      "Not monitoring feature distributions for drift",
      "Using the same computation path for batch and real-time leading to inconsistency",
    ],
    tags: ["ml", "feature-store", "real-time", "streaming", "serving"],
  },
];

// Helper functions

export function getAllProblems(): SystemDesignProblem[] {
  return SYSTEM_DESIGN_PROBLEMS;
}

export function getProblemById(id: string): SystemDesignProblem | undefined {
  return SYSTEM_DESIGN_PROBLEMS.find((p) => p.id === id);
}

export function getProblemsByCategory(
  category: SystemDesignProblem["category"]
): SystemDesignProblem[] {
  return SYSTEM_DESIGN_PROBLEMS.filter((p) => p.category === category);
}

export function getProblemsByDifficulty(
  level: InterviewLevel
): SystemDesignProblem[] {
  return SYSTEM_DESIGN_PROBLEMS.filter((p) => p.difficulty.includes(level));
}

export function getRandomProblem(
  level?: InterviewLevel,
  category?: SystemDesignProblem["category"]
): SystemDesignProblem {
  let pool = SYSTEM_DESIGN_PROBLEMS;
  if (level) pool = pool.filter((p) => p.difficulty.includes(level));
  if (category) pool = pool.filter((p) => p.category === category);
  if (pool.length === 0) pool = SYSTEM_DESIGN_PROBLEMS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function matchProblemsToTags(tags: string[]): SystemDesignProblem[] {
  const lowerTags = tags.map((t) => t.toLowerCase());
  return SYSTEM_DESIGN_PROBLEMS.filter((p) =>
    p.tags.some((tag) => lowerTags.some((t) => tag.includes(t) || t.includes(tag)))
  ).sort((a, b) => {
    const aMatches = a.tags.filter((tag) =>
      lowerTags.some((t) => tag.includes(t) || t.includes(tag))
    ).length;
    const bMatches = b.tags.filter((tag) =>
      lowerTags.some((t) => tag.includes(t) || t.includes(tag))
    ).length;
    return bMatches - aMatches;
  });
}
