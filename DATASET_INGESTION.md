# Dataset ingestion boundary

Production dataset records must enter through a server-side ingestion worker,
not through the React bundle.

```text
licensed source
  -> object storage
  -> discovery and metadata validation
  -> schema detection
  -> normalization and deduplication
  -> quality checks
  -> dataset version
  -> reviewed learning content
  -> explicitly published lab
```

The `datasets` and `dataset_versions` tables store metadata, status, checksum,
and storage references. No dataset records are seeded by the application.
Supported future inputs include CSV, JSON, JSONL, PCAP metadata, NetFlow/IPFIX,
and structured security events.

Only `CONNECTED` datasets are visible to the public catalog. A dataset must
retain source, license, version, and attribution metadata.
