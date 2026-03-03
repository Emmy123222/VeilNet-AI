// VeilNet AI - Privacy-Preserving Analysis Verification with On-Chain Validation
program veilnet_ai_v6.aleo {

    @noupgrade
    async constructor() {
    }

    // Store proof metadata with verification
    mapping proof_registry: field => field;   // proof_id => verification_hash
    mapping verification_stats: u8 => u64;    // risk_category => count
    mapping document_proofs: field => bool;   // document_hash => exists (prevent duplicates)

    async transition submit_analysis(
        public document_hash: field,
        public analysis_hash: field,
        public risk_score: u8,
        public timestamp: u64,
        public owner: address
    ) -> Future {
        // Validation 1: Risk score range
        assert(risk_score <= 100u8);

        // Validation 2: Hashes must be non-zero
        assert_neq(document_hash, 0field);
        assert_neq(analysis_hash, 0field);

        // Validation 3: Document and analysis hashes must be different
        assert_neq(document_hash, analysis_hash);

        // Validation 4: Timestamp must not be zero
        assert_neq(timestamp, 0u64);

        // Create deterministic proof ID from document hash
        let proof_id: field = BHP256::hash_to_field(document_hash);

        // Create verification hash combining document + analysis + score + time
        // FIX: Removed invalid `owner as field` cast — address cannot be cast to field in Aleo.
        // Instead we hash the owner address directly using BHP256 to get a field, then combine.
        let owner_field: field = BHP256::hash_to_field(owner);
        let combined: field = document_hash + analysis_hash + (risk_score as field) + (timestamp as field);
        let combined_hash: field = BHP256::hash_to_field(combined);

        // Final verification hash includes owner to prevent replay attacks
        let final_verification: field = BHP256::hash_to_field(combined_hash + owner_field);

        return submit_analysis_finalize(proof_id, document_hash, final_verification, risk_score);
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

        // Store proof with verification hash
        Mapping::set(proof_registry, proof_id, verification_hash);
        Mapping::set(document_proofs, document_hash, true);

        // Update anonymous statistics by risk category
        let risk_category: u8 = (risk_score <= 25u8) ? 1u8 :
                                (risk_score <= 60u8) ? 2u8 :
                                (risk_score <= 85u8) ? 3u8 : 4u8;

        let current_count: u64 = Mapping::get_or_use(verification_stats, risk_category, 0u64);
        Mapping::set(verification_stats, risk_category, current_count + 1u64);
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