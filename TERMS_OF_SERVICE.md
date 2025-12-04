# Terms of Service & Privacy Policy
**Last Updated:** December 2025

By using the Pragma API ("Service"), you agree to the following terms.

## 1. Nature of the Service
Pragma provides a technical infrastructure to notarize digital fingerprints (Hashes) of files on a public Blockchain. Pragma acts as a technical middleware and does not provide legal advice.

## 2. Data Privacy & File Storage (Crucial)
To protect your privacy and trade secrets, **Pragma adopts a "Zero-Knowledge" approach regarding file content:**

* **We DO NOT store your original files.** When you upload a file to our API, we calculate its cryptographic hash (SHA-256) in memory and immediately discard the file data.
* **We ONLY store the Hash.** The only data persisted in our database and on the Blockchain is the file's Hash and metadata (name, size, timestamp).
* **You represent the file owner.** You are responsible for the content you certify.

## 3. Blockchain Immutability
You acknowledge that writing data to a Blockchain is an **irreversible action**. Once a certification is confirmed on-chain, it cannot be deleted, modified, or hidden by Pragma or anyone else.

## 4. AI Labeling
The "Human/AI" declaration is self-asserted by the API caller. Pragma records this declaration on-chain but does not algorithmically verify the origin of the content.

## 5. API Usage & Limits
* **Rate Limiting:** Pragma reserves the right to throttle or block API requests that exceed the plan limits or threaten system stability.
* **Billing:** API credits are deducted upon successful certification transaction generation.

## 6. Liability
The Service is provided "AS IS". Pragma is not liable for network congestion, gas price spikes, or failures of the underlying public Blockchain network (Ethereum/Sepolia/Polygon).

---
**Contact:**
For enterprise inquiries or legal questions: legal@pragma.io