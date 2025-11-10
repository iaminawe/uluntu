# Vector Embedding System Technical Specification

## 1. System Overview

The vector embedding system provides semantic search and content understanding capabilities for the AI assistant, enabling intelligent retrieval of relevant information across all platform content types.

## 2. Architecture Components

### 2.1 Embedding Pipeline Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Content    │────▶│   Chunking   │────▶│  Embedding   │────▶│   Storage    │
│   Sources    │     │   Service    │     │  Generation  │     │  (pgvector)  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │                     │
       ▼                    ▼                     ▼                     ▼
  [Raw Content]      [Text Chunks]          [Vectors]           [Indexed DB]
```

### 2.2 Content Sources

```typescript
enum ContentType {
  EVENT = 'event',
  NEWS = 'news',
  RESOURCE = 'resource',
  MESSAGE = 'message',
  PROFILE = 'profile',
  COMPANY = 'company',
  GROUP = 'group',
  OPPORTUNITY = 'opportunity',
  MARKETPLACE = 'marketplace',
  PAGE = 'page'
}

interface ContentSource {
  id: string;
  type: ContentType;
  title: string;
  content: string;
  metadata: {
    author?: string;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
    category?: string;
    visibility?: 'public' | 'private' | 'members';
    customFields?: Record<string, any>;
  };
}
```

## 3. Database Schema

### 3.1 Core Tables

```sql
-- Main embeddings table with optimized structure
CREATE TABLE content_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_table TEXT NOT NULL,
    source_id UUID NOT NULL,
    content_type content_type_enum NOT NULL,
    
    -- Embedding data
    embedding vector(1536), -- OpenAI ada-002 dimensions
    embedding_model TEXT NOT NULL DEFAULT 'text-embedding-ada-002',
    embedding_version TEXT NOT NULL DEFAULT 'v1',
    
    -- Chunking metadata
    chunk_index INTEGER NOT NULL DEFAULT 0,
    chunk_text TEXT NOT NULL,
    chunk_tokens INTEGER NOT NULL,
    chunk_hash TEXT GENERATED ALWAYS AS (encode(sha256(chunk_text::bytea), 'hex')) STORED,
    
    -- Contextual metadata
    metadata JSONB NOT NULL DEFAULT '{}',
    parent_context TEXT, -- Surrounding context for better retrieval
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    indexed_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT unique_source_chunk UNIQUE(source_table, source_id, chunk_index),
    CONSTRAINT valid_chunk_index CHECK (chunk_index >= 0),
    CONSTRAINT valid_tokens CHECK (chunk_tokens > 0 AND chunk_tokens <= 8192)
);

-- Indexes for performance
CREATE INDEX idx_embeddings_source ON content_embeddings(source_table, source_id);
CREATE INDEX idx_embeddings_type ON content_embeddings(content_type);
CREATE INDEX idx_embeddings_updated ON content_embeddings(updated_at DESC);
CREATE INDEX idx_embeddings_metadata ON content_embeddings USING GIN(metadata);

-- HNSW index for vector similarity search
CREATE INDEX idx_embeddings_vector_hnsw 
ON content_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Embedding queue for async processing
CREATE TABLE embedding_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_table TEXT NOT NULL,
    source_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    content TEXT,
    metadata JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    
    -- Prevent duplicate queue entries
    CONSTRAINT unique_pending_source UNIQUE(source_table, source_id, status) 
    WHERE status IN ('pending', 'processing')
);

-- Index for queue processing
CREATE INDEX idx_queue_status_priority ON embedding_queue(status, priority DESC, created_at);

-- Embedding statistics for monitoring
CREATE TABLE embedding_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    content_type content_type_enum NOT NULL,
    total_embeddings INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    avg_chunk_size FLOAT,
    avg_processing_time_ms FLOAT,
    cache_hit_rate FLOAT,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_daily_stats UNIQUE(date, content_type)
);
```

### 3.2 Supporting Functions

```sql
-- Function to calculate semantic similarity
CREATE OR REPLACE FUNCTION calculate_similarity(
    embedding1 vector(1536),
    embedding2 vector(1536)
) RETURNS FLOAT AS $$
BEGIN
    RETURN 1 - (embedding1 <=> embedding2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get similar content
CREATE OR REPLACE FUNCTION find_similar_content(
    query_embedding vector(1536),
    content_types content_type_enum[] DEFAULT NULL,
    similarity_threshold FLOAT DEFAULT 0.7,
    max_results INTEGER DEFAULT 10,
    user_id UUID DEFAULT NULL
) RETURNS TABLE (
    source_id UUID,
    source_table TEXT,
    content_type content_type_enum,
    chunk_text TEXT,
    similarity_score FLOAT,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.source_id,
        ce.source_table,
        ce.content_type,
        ce.chunk_text,
        calculate_similarity(ce.embedding, query_embedding) as similarity_score,
        ce.metadata
    FROM content_embeddings ce
    WHERE 
        (content_types IS NULL OR ce.content_type = ANY(content_types))
        AND calculate_similarity(ce.embedding, query_embedding) >= similarity_threshold
        -- Add permission check if user_id provided
        AND (user_id IS NULL OR check_content_permission(user_id, ce.source_id, ce.source_table))
    ORDER BY ce.embedding <=> query_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic embedding updates
CREATE OR REPLACE FUNCTION trigger_embedding_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Queue embedding generation for content changes
    INSERT INTO embedding_queue (source_table, source_id, action, content, priority)
    VALUES (
        TG_TABLE_NAME,
        NEW.id,
        CASE WHEN TG_OP = 'INSERT' THEN 'create' ELSE 'update' END,
        COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, NEW.content, ''),
        CASE 
            WHEN TG_TABLE_NAME IN ('events', 'news') THEN 8
            WHEN TG_TABLE_NAME IN ('resources', 'opportunities') THEN 6
            ELSE 5
        END
    )
    ON CONFLICT (source_table, source_id, status) 
    WHERE status IN ('pending', 'processing')
    DO UPDATE SET 
        content = EXCLUDED.content,
        metadata = EXCLUDED.metadata,
        created_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 4. Chunking Strategies

### 4.1 Content-Specific Chunking

```typescript
interface ChunkingStrategy {
  maxTokens: number;
  overlapTokens: number;
  preserveBoundaries: boolean;
  contextWindow: boolean;
}

class ContentChunker {
  private strategies: Map<ContentType, ChunkingStrategy> = new Map([
    [ContentType.EVENT, {
      maxTokens: 600,
      overlapTokens: 100,
      preserveBoundaries: true,
      contextWindow: true
    }],
    [ContentType.NEWS, {
      maxTokens: 800,
      overlapTokens: 150,
      preserveBoundaries: true,
      contextWindow: true
    }],
    [ContentType.MESSAGE, {
      maxTokens: 400,
      overlapTokens: 50,
      preserveBoundaries: false,
      contextWindow: false
    }],
    [ContentType.PROFILE, {
      maxTokens: 300,
      overlapTokens: 0,
      preserveBoundaries: true,
      contextWindow: false
    }]
  ]);

  async chunkContent(
    content: string,
    contentType: ContentType,
    metadata?: any
  ): Promise<ContentChunk[]> {
    const strategy = this.strategies.get(contentType) || this.getDefaultStrategy();
    
    if (strategy.preserveBoundaries) {
      return this.semanticChunking(content, strategy, metadata);
    } else {
      return this.fixedSizeChunking(content, strategy);
    }
  }

  private semanticChunking(
    content: string,
    strategy: ChunkingStrategy,
    metadata?: any
  ): ContentChunk[] {
    // Implementation of semantic chunking
    // Preserves paragraph boundaries, headers, lists
    const chunks: ContentChunk[] = [];
    const sections = this.identifySections(content);
    
    for (const section of sections) {
      if (this.tokenCount(section.text) <= strategy.maxTokens) {
        chunks.push({
          text: section.text,
          index: chunks.length,
          tokens: this.tokenCount(section.text),
          metadata: { ...metadata, sectionType: section.type }
        });
      } else {
        // Split large sections with overlap
        const subChunks = this.splitWithOverlap(
          section.text,
          strategy.maxTokens,
          strategy.overlapTokens
        );
        chunks.push(...subChunks);
      }
    }
    
    if (strategy.contextWindow) {
      return this.addContextualInformation(chunks, content);
    }
    
    return chunks;
  }

  private fixedSizeChunking(
    content: string,
    strategy: ChunkingStrategy
  ): ContentChunk[] {
    // Simple fixed-size chunking with overlap
    return this.splitWithOverlap(
      content,
      strategy.maxTokens,
      strategy.overlapTokens
    );
  }
}
```

### 4.2 Contextual Retrieval Enhancement

```typescript
class ContextualRetrieval {
  /**
   * Implements Anthropic's Contextual Retrieval pattern
   * Adds document-level context to each chunk
   */
  async enhanceChunksWithContext(
    chunks: ContentChunk[],
    document: Document
  ): Promise<EnhancedChunk[]> {
    const enhancedChunks: EnhancedChunk[] = [];
    
    for (const chunk of chunks) {
      const context = await this.generateChunkContext(chunk, document);
      
      enhancedChunks.push({
        ...chunk,
        contextualDescription: context,
        documentSummary: document.summary,
        documentTitle: document.title,
        enhancedText: `${context}\n\n${chunk.text}`
      });
    }
    
    return enhancedChunks;
  }

  private async generateChunkContext(
    chunk: ContentChunk,
    document: Document
  ): Promise<string> {
    // Generate a brief contextual description of where this chunk
    // fits within the larger document
    const prompt = `
      Document: ${document.title}
      Summary: ${document.summary}
      
      Chunk content: ${chunk.text}
      
      Provide a 1-2 sentence description of what this chunk discusses
      and how it relates to the overall document.
    `;
    
    return await this.llm.generateContext(prompt);
  }
}
```

## 5. Embedding Generation

### 5.1 Embedding Service Implementation

```typescript
interface EmbeddingService {
  generateEmbedding(text: string): Promise<number[]>;
  generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
  getModel(): string;
  getMaxTokens(): number;
}

class OpenAIEmbeddingService implements EmbeddingService {
  private client: OpenAI;
  private model = 'text-embedding-ada-002';
  private maxTokens = 8191;
  private batchSize = 100;

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: this.model,
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      // Implement retry logic with exponential backoff
      return this.retryWithBackoff(() => this.generateEmbedding(text));
    }
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    // Process in batches to respect API limits
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);
      
      const response = await this.client.embeddings.create({
        model: this.model,
        input: batch,
      });
      
      embeddings.push(...response.data.map(d => d.embedding));
    }
    
    return embeddings;
  }
}

class SentenceTransformerService implements EmbeddingService {
  private model = 'all-MiniLM-L6-v2';
  private maxTokens = 512;
  private dimensions = 384;

  async generateEmbedding(text: string): Promise<number[]> {
    // Local sentence transformer implementation
    // Using ONNX runtime for browser/edge deployment
    const tokenized = await this.tokenizer.encode(text);
    const truncated = tokenized.slice(0, this.maxTokens);
    const embedding = await this.model.embed(truncated);
    
    return Array.from(embedding);
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    // Batch processing for local model
    const embeddings = await Promise.all(
      texts.map(text => this.generateEmbedding(text))
    );
    
    return embeddings;
  }
}
```

### 5.2 Hybrid Embedding Strategy

```typescript
class HybridEmbeddingStrategy {
  private openAI: OpenAIEmbeddingService;
  private sentenceTransformer: SentenceTransformerService;
  
  async generateEmbedding(
    text: string,
    contentType: ContentType
  ): Promise<EmbeddingResult> {
    // Use different models based on content type and importance
    const strategy = this.selectStrategy(contentType);
    
    if (strategy === 'openai') {
      return {
        embedding: await this.openAI.generateEmbedding(text),
        model: 'text-embedding-ada-002',
        dimensions: 1536
      };
    } else if (strategy === 'local') {
      return {
        embedding: await this.sentenceTransformer.generateEmbedding(text),
        model: 'all-MiniLM-L6-v2',
        dimensions: 384
      };
    } else {
      // Dual embedding for high-value content
      const [openAIEmb, localEmb] = await Promise.all([
        this.openAI.generateEmbedding(text),
        this.sentenceTransformer.generateEmbedding(text)
      ]);
      
      return {
        embedding: openAIEmb,
        alternativeEmbedding: localEmb,
        model: 'hybrid',
        dimensions: 1536
      };
    }
  }

  private selectStrategy(contentType: ContentType): 'openai' | 'local' | 'hybrid' {
    const highValueContent = [
      ContentType.EVENT,
      ContentType.NEWS,
      ContentType.RESOURCE
    ];
    
    const userGeneratedContent = [
      ContentType.MESSAGE,
      ContentType.PROFILE
    ];
    
    if (highValueContent.includes(contentType)) {
      return 'openai';
    } else if (userGeneratedContent.includes(contentType)) {
      return 'local';
    } else {
      return 'hybrid';
    }
  }
}
```

## 6. Search Implementation

### 6.1 Hybrid Search System

```typescript
class HybridSearchSystem {
  async search(
    query: string,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    // Generate query embedding
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);
    
    // Perform parallel searches
    const [semanticResults, keywordResults] = await Promise.all([
      this.semanticSearch(queryEmbedding, options),
      this.keywordSearch(query, options)
    ]);
    
    // Combine results using Reciprocal Rank Fusion
    return this.fuseResults(semanticResults, keywordResults, options);
  }

  private async semanticSearch(
    queryEmbedding: number[],
    options: SearchOptions
  ): Promise<SemanticResult[]> {
    const results = await this.db.query(`
      SELECT 
        source_id,
        source_table,
        content_type,
        chunk_text,
        metadata,
        1 - (embedding <=> $1::vector) as similarity
      FROM content_embeddings
      WHERE 
        ($2::content_type_enum[] IS NULL OR content_type = ANY($2))
        AND 1 - (embedding <=> $1::vector) >= $3
      ORDER BY embedding <=> $1::vector
      LIMIT $4
    `, [queryEmbedding, options.contentTypes, options.minSimilarity || 0.7, options.limit || 20]);
    
    return results.rows;
  }

  private async keywordSearch(
    query: string,
    options: SearchOptions
  ): Promise<KeywordResult[]> {
    // Implement full-text search across content tables
    const searchQuery = this.buildFullTextQuery(query);
    
    const results = await this.db.query(`
      WITH search_results AS (
        SELECT 
          id as source_id,
          'events' as source_table,
          title,
          description as content,
          ts_rank(
            to_tsvector('english', title || ' ' || description),
            plainto_tsquery('english', $1)
          ) as rank
        FROM events
        WHERE 
          to_tsvector('english', title || ' ' || description) @@
          plainto_tsquery('english', $1)
        
        UNION ALL
        
        SELECT 
          id as source_id,
          'news' as source_table,
          title,
          content,
          ts_rank(
            to_tsvector('english', title || ' ' || content),
            plainto_tsquery('english', $1)
          ) as rank
        FROM news
        WHERE 
          to_tsvector('english', title || ' ' || content) @@
          plainto_tsquery('english', $1)
      )
      SELECT * FROM search_results
      ORDER BY rank DESC
      LIMIT $2
    `, [query, options.limit || 20]);
    
    return results.rows;
  }

  private fuseResults(
    semanticResults: SemanticResult[],
    keywordResults: KeywordResult[],
    options: SearchOptions
  ): SearchResult[] {
    const k = options.rrfK || 60;
    const semanticWeight = options.semanticWeight || 0.7;
    const keywordWeight = options.keywordWeight || 0.3;
    
    // Calculate RRF scores
    const scores = new Map<string, number>();
    
    // Add semantic results
    semanticResults.forEach((result, index) => {
      const key = `${result.source_table}-${result.source_id}`;
      const rrfScore = 1 / (k + index + 1);
      scores.set(key, rrfScore * semanticWeight);
    });
    
    // Add keyword results
    keywordResults.forEach((result, index) => {
      const key = `${result.source_table}-${result.source_id}`;
      const rrfScore = 1 / (k + index + 1);
      const existing = scores.get(key) || 0;
      scores.set(key, existing + (rrfScore * keywordWeight));
    });
    
    // Sort by combined score
    const sortedResults = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, options.limit || 10);
    
    // Fetch full content for top results
    return this.fetchFullContent(sortedResults);
  }
}
```

## 7. Performance Optimization

### 7.1 Caching Strategy

```typescript
class EmbeddingCache {
  private redis: Redis;
  private localCache: LRUCache<string, number[]>;
  
  constructor() {
    this.localCache = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 60 // 1 hour
    });
  }

  async get(text: string): Promise<number[] | null> {
    const hash = this.hashText(text);
    
    // Check local cache first
    const local = this.localCache.get(hash);
    if (local) return local;
    
    // Check Redis cache
    const cached = await this.redis.get(`embedding:${hash}`);
    if (cached) {
      const embedding = JSON.parse(cached);
      this.localCache.set(hash, embedding);
      return embedding;
    }
    
    return null;
  }

  async set(text: string, embedding: number[]): Promise<void> {
    const hash = this.hashText(text);
    
    // Store in both caches
    this.localCache.set(hash, embedding);
    await this.redis.setex(
      `embedding:${hash}`,
      3600 * 24, // 24 hours
      JSON.stringify(embedding)
    );
  }

  private hashText(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}
```

### 7.2 Batch Processing

```typescript
class BatchEmbeddingProcessor {
  private queue: EmbeddingTask[] = [];
  private processing = false;
  private batchSize = 50;
  private batchInterval = 5000; // 5 seconds

  async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    try {
      // Get batch of tasks
      const batch = this.queue.splice(0, this.batchSize);
      
      // Group by content type for optimal processing
      const grouped = this.groupByContentType(batch);
      
      for (const [contentType, tasks] of grouped) {
        await this.processBatch(tasks, contentType);
      }
    } finally {
      this.processing = false;
      
      // Schedule next batch
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), this.batchInterval);
      }
    }
  }

  private async processBatch(
    tasks: EmbeddingTask[],
    contentType: ContentType
  ): Promise<void> {
    // Extract texts
    const texts = tasks.map(t => t.text);
    
    // Generate embeddings in batch
    const embeddings = await this.embeddingService.generateBatchEmbeddings(texts);
    
    // Store embeddings
    const storagePromises = tasks.map((task, index) => 
      this.storeEmbedding(task, embeddings[index])
    );
    
    await Promise.all(storagePromises);
    
    // Update statistics
    await this.updateStatistics(contentType, tasks.length);
  }
}
```

## 8. Monitoring & Analytics

### 8.1 Performance Metrics

```typescript
interface EmbeddingMetrics {
  // Performance metrics
  embeddingGenerationTime: Histogram;
  searchLatency: Histogram;
  cacheHitRate: Gauge;
  
  // Usage metrics
  dailyEmbeddings: Counter;
  tokensUsed: Counter;
  searchQueries: Counter;
  
  // Quality metrics
  searchRelevance: Histogram;
  embeddingSimilarity: Histogram;
  
  // Error metrics
  embeddingErrors: Counter;
  searchErrors: Counter;
}

class MetricsCollector {
  async recordEmbeddingGeneration(
    contentType: ContentType,
    duration: number,
    tokens: number
  ): Promise<void> {
    this.metrics.embeddingGenerationTime.observe({ contentType }, duration);
    this.metrics.tokensUsed.inc({ contentType }, tokens);
    this.metrics.dailyEmbeddings.inc({ contentType });
  }

  async recordSearch(
    queryType: 'semantic' | 'keyword' | 'hybrid',
    duration: number,
    resultCount: number
  ): Promise<void> {
    this.metrics.searchLatency.observe({ queryType }, duration);
    this.metrics.searchQueries.inc({ queryType });
  }
}
```

## 9. Migration Plan

### 9.1 Initial Setup

```bash
# 1. Enable pgvector extension
psql -d your_database -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 2. Run migration scripts
npm run migrate:embeddings

# 3. Initialize embedding service
npm run embeddings:init

# 4. Process existing content
npm run embeddings:backfill
```

### 9.2 Backfill Strategy

```typescript
class EmbeddingBackfill {
  async backfillContent(): Promise<void> {
    const contentTypes = [
      ContentType.EVENT,
      ContentType.NEWS,
      ContentType.RESOURCE,
      ContentType.PROFILE,
      ContentType.COMPANY
    ];
    
    for (const contentType of contentTypes) {
      await this.backfillContentType(contentType);
    }
  }

  private async backfillContentType(contentType: ContentType): Promise<void> {
    const batchSize = 100;
    let offset = 0;
    let hasMore = true;
    
    while (hasMore) {
      const items = await this.fetchContent(contentType, batchSize, offset);
      
      if (items.length === 0) {
        hasMore = false;
        continue;
      }
      
      // Process in parallel with rate limiting
      await this.processWithRateLimit(items, contentType);
      
      offset += batchSize;
      
      // Progress logging
      console.log(`Processed ${offset} ${contentType} items`);
    }
  }
}
```

## 10. API Endpoints

### 10.1 Search API

```typescript
// POST /api/ai/search
interface SearchRequest {
  query: string;
  contentTypes?: ContentType[];
  limit?: number;
  minSimilarity?: number;
  includeContext?: boolean;
}

interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  searchType: 'semantic' | 'keyword' | 'hybrid';
  processingTime: number;
}

// GET /api/ai/similar/:contentType/:id
interface SimilarContentRequest {
  contentType: ContentType;
  id: string;
  limit?: number;
}

interface SimilarContentResponse {
  similar: SimilarContent[];
  processingTime: number;
}
```

### 10.2 Management API

```typescript
// POST /api/ai/embeddings/generate
interface GenerateEmbeddingRequest {
  contentType: ContentType;
  contentId: string;
  force?: boolean; // Force regeneration
}

// GET /api/ai/embeddings/stats
interface EmbeddingStatsResponse {
  totalEmbeddings: number;
  byContentType: Record<ContentType, number>;
  totalTokensUsed: number;
  lastUpdated: Date;
  queueStatus: {
    pending: number;
    processing: number;
    failed: number;
  };
}

// POST /api/ai/embeddings/reindex
interface ReindexRequest {
  contentType?: ContentType;
  startDate?: Date;
  endDate?: Date;
}
```

## Conclusion

This specification provides a comprehensive technical foundation for implementing a production-ready vector embedding system. The architecture supports semantic search, content understanding, and intelligent retrieval while maintaining performance, scalability, and cost-effectiveness. The hybrid approach combining OpenAI and local embeddings ensures optimal balance between quality and operational efficiency.