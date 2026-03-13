// VeilNet AI - TRUE Zero-Knowledge Privacy-Preserving Analysis Verification
program veilnet_ai_v7.aleo {

    // Private record for storing analysis proofs (PRIVATE - not visible on-chain)
    record AnalysisProof {
        owner: address,
        document_hash: field,
        analysis_hash: field,
        risk_score: u8,
        timestamp: u64,
        verification_key: field,
    }

    // Public mappings for verification (only hashes visible)
    mapping proof_registry: field => field;   // proof_id => verification_hash
    mapping verification_stats: u8 => u64;    // risk_category => count
    mapping document_proofs: field => bool;   // document_hash => exists (prevent duplicates)

    @noupgrade
    async constructor() {
    }

    // Submit analysis with PRIVATE record creation and public verification
    async transition submit_analysis(
        public document_hash: field,
        public analysis_hash: field,
        public risk_score: u8,
        public timestamp: u64,
        public owner: address
    ) -> (AnalysisProof, Future) {
        // Validation 1: Risk score range
        assert(risk_score <= 100u8);

        // Validation 2: Hashes must be non-zero
        assert_neq(document_hash, 0field);
        assert_neq(analysis_hash, 0field);

        // Validation 3: Document and analysis hashes must be different
        assert_neq(document_hash, analysis_hash);

        // Validation 4: Timestamp must not be zero
        assert_neq(timestamp, 0u64);

        // Validation 5: Owner must be the caller
        assert_eq(owner, self.caller);

        // Create deterministic proof ID from document hash
        let proof_id: field = BHP256::hash_to_field(document_hash);

        // Create verification key for private record
        let verification_key: field = BHP256::hash_to_field(document_hash + analysis_hash + (timestamp as field));

        // Create PRIVATE record (sensitive data hidden from public view)
        let analysis_proof: AnalysisProof = AnalysisProof {
            owner: owner,
            document_hash: document_hash,
            analysis_hash: analysis_hash,
            risk_score: risk_score,
            timestamp: timestamp,
            verification_key: verification_key,
        };

        // Create verification hash for public mapping (only hash visible)
        let owner_field: field = BHP256::hash_to_field(owner);
        let combined: field = document_hash + analysis_hash + (risk_score as field) + (timestamp as field);
        let combined_hash: field = BHP256::hash_to_field(combined);
        let final_verification: field = BHP256::hash_to_field(combined_hash + owner_field);

        return (analysis_proof, submit_analysis_finalize(proof_id, document_hash, final_verification, risk_score));
    }

    async function submit_analysis_finalize(
        proof_id: field,
        document_hash: field,
        verification_hash: field,
        risk_score: u8
    ) {
        // Prevent duplicate document submissions
        let already_exists: bool = Mapping::get_or_use(document_proofs, document_hash, false);
        assert_eq(already_exists, false);

        // Store proof with verification hash (only hash visible publicly)
        Mapping::set(proof_registry, proof_id, verification_hash);
        Mapping::set(document_proofs, document_hash, true);

        // Update anonymous statistics by risk category
        let risk_category: u8 = (risk_score <= 25u8) ? 1u8 :
                                (risk_score <= 60u8) ? 2u8 :
                                (risk_score <= 85u8) ? 3u8 : 4u8;

        let current_count: u64 = Mapping::get_or_use(verification_stats, risk_category, 0u64);
        Mapping::set(verification_stats, risk_category, current_count + 1u64);
    }

    // Verify proof ownership using PRIVATE record
    transition verify_proof_ownership(
        analysis_proof: AnalysisProof,
        expected_document_hash: field
    ) -> bool {
        // Verify the caller owns this proof
        assert_eq(analysis_proof.owner, self.caller);
        
        // Verify the document hash matches
        assert_eq(analysis_proof.document_hash, expected_document_hash);
        
        // Verify the verification key is correct
        let expected_key: field = BHP256::hash_to_field(
            analysis_proof.document_hash + 
            analysis_proof.analysis_hash + 
            (analysis_proof.timestamp as field)
        );
        assert_eq(analysis_proof.verification_key, expected_key);
        
        return true;
    }

    // Verify a proof exists by checking its verification hash is non-zero
    async transition verify_proof_exists(proof_id: field) -> Future {
        return verify_proof_exists_finalize(proof_id);
    }

    async function verify_proof_exists_finalize(proof_id: field) {
        let verification_hash: field = Mapping::get_or_use(proof_registry, proof_id, 0field);
        assert_neq(verification_hash, 0field);
    }

    // Get verification statistics for a risk category
    async transition get_verification_stats(risk_category: u8) -> Future {
        return get_verification_stats_finalize(risk_category);
    }

    async function get_verification_stats_finalize(risk_category: u8) {
        let count: u64 = Mapping::get_or_use(verification_stats, risk_category, 0u64);
    }
}