-- Replace generic RAG explanations with module-specific, original teaching content.
-- This only updates lesson content and does not touch learner progress.

UPDATE public.academy_lessons AS l
SET content = CASE m.slug
  WHEN 'rag-fundamentals-architecture' THEN $rag$
# RAG fundamentals and architecture

Retrieval-Augmented Generation (RAG) separates knowledge lookup from language generation. A retriever selects evidence from an approved corpus; the generator receives the question and that evidence in a bounded prompt. This reduces unsupported answers, but it does not guarantee truth.

```text
question -> query representation -> retriever -> ranked evidence -> prompt assembly -> generator -> citations and answer
```

Start with a small corpus and inspect retrieved passages before tuning a model. A useful baseline records the query, document identifiers, scores, prompt version, model version, and answer.

**Exercise:** draw the pipeline for a support assistant and identify one failure mode at each boundary. $rag$
  WHEN 'llms-context-limitations' THEN $rag$
# LLMs and context limitations

An LLM processes a finite token window. Adding more text can reduce useful signal because relevant evidence competes with instructions and distractors. Token counts are not the same as characters or words, so measure tokens with the tokenizer used by the target model.

```python
from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
tokens = tokenizer.encode("A short question about retention policy.")
print(len(tokens))
```

**Practice:** compare a short, relevant context with a long context containing the same answer. Record latency, token usage, and whether the answer cites the right passage. $rag$
  WHEN 'data-ingestion-document-processing' THEN $rag$
# Data ingestion and document processing

Ingestion is a provenance boundary. Capture the source URI, retrieval date, MIME type, checksum, parser version, and access permission before extracting text. Reject unsupported or malformed files instead of silently indexing them.

```python
from hashlib import sha256

def provenance(blob: bytes, source: str) -> dict[str, str]:
    return {"source": source, "sha256": sha256(blob).hexdigest()}
```

**Exercise:** build a manifest for three approved documents and explain how a checksum lets you detect an unexpected replacement. $rag$
  WHEN 'text-cleaning-chunking' THEN $rag$
# Text cleaning and chunking

Cleaning should remove parser noise without destroying meaning. Preserve headings, table labels, code fences, and page references when they help retrieval. Chunk by semantic boundaries first, then enforce a token limit with a small overlap.

```python
def chunks(text: str, size: int = 120, overlap: int = 20):
    words = text.split()
    step = max(1, size - overlap)
    return [" ".join(words[i:i + size]) for i in range(0, len(words), step)]
```

**Practice:** compare fixed-size and heading-aware chunks on the same document. Evaluate whether each question can be answered from one retrieved chunk. $rag$
  WHEN 'embeddings' THEN $rag$
# Embeddings and vector representations

An embedding maps text to a numeric vector so semantically related strings can be compared. Embeddings are model- and domain-dependent: a high cosine score means proximity in that model's representation space, not factual correctness.

```python
import numpy as np

def cosine(a: np.ndarray, b: np.ndarray) -> float:
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))
```

Normalize the indexing and query pipelines identically. Store the embedding model name and dimension with the index so a later model change cannot silently mix incompatible vectors. $rag$
  WHEN 'vector-databases' THEN $rag$
# Vector databases

A vector store keeps embeddings alongside document identifiers and metadata. The metadata filter is as important as similarity: tenant, permission, document version, and content type should be enforced before evidence is passed to the model.

```sql
SELECT content, metadata
FROM document_chunks
WHERE metadata->>'tenant' = $1
ORDER BY embedding <=> $2
LIMIT 5;
```

**Exercise:** define an index record containing a stable document ID, chunk ID, checksum, source URL, and access scope. Explain which fields must never be supplied by an untrusted user. $rag$
  WHEN 'semantic-hybrid-search' THEN $rag$
# Semantic and hybrid search

Semantic search handles paraphrase, while lexical search handles exact identifiers, error codes, and names. Hybrid retrieval combines both signals and reranks the candidate union. Always measure each component separately before claiming the hybrid system improved results.

**Practice:** create ten queries containing both natural-language questions and exact product terms. Compare lexical-only, vector-only, and hybrid top-five results using a labeled relevance set. $rag$
  WHEN 'python-rag-development' THEN $rag$
# Python RAG development

Keep retrieval, prompt assembly, and generation as separate functions so each can be tested independently. The application should return evidence IDs with the answer and should fail clearly when retrieval returns no authorized context.

```python
def build_prompt(question: str, passages: list[str]) -> str:
    context = "\n\n---\n\n".join(passages)
    return f"Answer only from the context.\nContext:\n{context}\nQuestion: {question}"
```

**Exercise:** add a no-context branch that returns a review message instead of asking the model to guess. $rag$
  WHEN 'rag-frameworks' THEN $rag$
# RAG frameworks

Frameworks can provide loaders, retrievers, prompt templates, and tracing, but they do not replace architecture decisions. Pin versions, inspect generated prompts, and keep provider-specific adapters behind a small interface.

**Practice:** implement the same retrieval contract with a direct SDK call and one framework adapter. Compare dependencies, observability, retry behavior, and testability rather than choosing by feature count. $rag$
  WHEN 'retrieval-evaluation' THEN $rag$
# Retrieval evaluation

Retrieval quality is measured before generation quality. Build a labeled question-to-document set and calculate recall@k, precision@k, and mean reciprocal rank. Include hard negatives and questions that should return no result.

```text
recall@k = relevant documents in top k / all relevant documents
```

**Exercise:** create twenty small evaluation cases from your approved corpus and record the retrieved chunk IDs for k=3 and k=5. $rag$
  WHEN 'reranking-query-transformation' THEN $rag$
# Reranking and query transformation

First-stage retrieval should be fast and broad. A reranker can inspect a smaller candidate set with richer features. Query expansion, decomposition, and hypothetical-answer methods can improve recall, but each transformation must be logged because it can introduce unsupported terms.

**Practice:** compare the original question with a two-query decomposition on a multi-part request. Keep the transformation only if it improves labeled recall without retrieving unauthorized material. $rag$
  WHEN 'advanced-multimodal-rag' THEN $rag$
# Advanced and multimodal RAG

Multimodal systems retrieve text, images, tables, or audio-derived representations. Preserve relationships between an asset and its caption, page, bounding box, and source. Do not flatten a chart into prose without retaining the original artifact for verification.

**Exercise:** design a record for a PDF figure containing an image URI, page number, caption, OCR text, and access scope. Define how the answer will cite the figure. $rag$
  WHEN 'rag-security-prompt-injection' THEN $rag$
# RAG security and prompt injection defence

Retrieved text is data, not authority. A document can contain instructions designed to override the system prompt. Separate trusted application instructions from untrusted evidence, escape or label retrieved content, enforce authorization before retrieval, and test indirect injection cases.

**Practice:** place a malicious instruction in an otherwise relevant document and verify that the application quotes it as evidence instead of executing it. Record the test and expected safe behavior. $rag$
  WHEN 'production-deployment-monitoring' THEN $rag$
# Production deployment and monitoring

Production RAG needs traces for retrieval latency, candidate IDs, token counts, model response time, refusal rate, citation coverage, and user feedback. Use redacted logs, bounded retries, timeouts, and a rollback path for indexes and prompts.

**Exercise:** define an alert for a sudden drop in recall proxy or citation coverage. State which data is safe to retain and which must be removed from telemetry. $rag$
  WHEN 'rag-capstone' THEN $rag$
# Real-world RAG capstone

Build a working assistant over an approved document collection. Deliver a provenance manifest, ingestion job, chunking policy, embedding configuration, metadata authorization filter, retriever, prompt template, evaluation set, security tests, and deployment runbook.

The acceptance test must include a supported question, an ambiguous question, a no-answer question, an unauthorized-document question, and an indirect prompt-injection document. Report retrieval metrics, answer quality, citations, latency, cost assumptions, and known limitations. $rag$
  ELSE l.content
END,
updated_at = now()
FROM public.academy_modules AS m
JOIN public.academy_courses AS c ON c.id = m.course_id
WHERE l.module_id = m.id
  AND c.slug = 'retrieval-augmented-generation'
  AND l.slug LIKE 'explain-%';

