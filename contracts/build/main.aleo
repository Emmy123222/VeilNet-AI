program veilnet_ai_v7.aleo;

record AnalysisProof:
    owner as address.private;
    document_hash as field.private;
    analysis_hash as field.private;
    risk_score as u8.private;
    timestamp as u64.private;
    verification_key as field.private;

mapping proof_registry:
    key as field.public;
    value as field.public;

mapping verification_stats:
    key as u8.public;
    value as u64.public;

mapping document_proofs:
    key as field.public;
    value as boolean.public;

function submit_analysis:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as u8.public;
    input r3 as u64.public;
    input r4 as address.public;
    lte r2 100u8 into r5;
    assert.eq r5 true;
    assert.neq r0 0field;
    assert.neq r1 0field;
    assert.neq r0 r1;
    assert.neq r3 0u64;
    assert.eq r4 self.caller;
    hash.bhp256 r0 into r6 as field;
    add r0 r1 into r7;
    cast r3 into r8 as field;
    add r7 r8 into r9;
    hash.bhp256 r9 into r10 as field;
    cast r4 r0 r1 r2 r3 r10 into r11 as AnalysisProof.record;
    hash.bhp256 r4 into r12 as field;
    cast r2 into r13 as field;
    add r7 r13 into r14;
    cast r3 into r15 as field;
    add r14 r15 into r16;
    hash.bhp256 r16 into r17 as field;
    add r17 r12 into r18;
    hash.bhp256 r18 into r19 as field;
    async submit_analysis r6 r0 r19 r2 into r20;
    output r11 as AnalysisProof.record;
    output r20 as veilnet_ai_v7.aleo/submit_analysis.future;

finalize submit_analysis:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as field.public;
    input r3 as u8.public;
    get.or_use document_proofs[r1] false into r4;
    assert.eq r4 false;
    set r2 into proof_registry[r0];
    set true into document_proofs[r1];
    lte r3 25u8 into r5;
    lte r3 60u8 into r6;
    lte r3 85u8 into r7;
    ternary r7 3u8 4u8 into r8;
    ternary r6 2u8 r8 into r9;
    ternary r5 1u8 r9 into r10;
    get.or_use verification_stats[r10] 0u64 into r11;
    add r11 1u64 into r12;
    set r12 into verification_stats[r10];

function verify_proof_ownership:
    input r0 as AnalysisProof.record;
    input r1 as field.private;
    assert.eq r0.owner self.caller;
    assert.eq r0.document_hash r1;
    add r0.document_hash r0.analysis_hash into r2;
    cast r0.timestamp into r3 as field;
    add r2 r3 into r4;
    hash.bhp256 r4 into r5 as field;
    assert.eq r0.verification_key r5;
    output true as boolean.private;

function verify_proof_exists:
    input r0 as field.private;
    async verify_proof_exists r0 into r1;
    output r1 as veilnet_ai_v7.aleo/verify_proof_exists.future;

finalize verify_proof_exists:
    input r0 as field.public;
    get.or_use proof_registry[r0] 0field into r1;
    assert.neq r1 0field;

function get_verification_stats:
    input r0 as u8.private;
    async get_verification_stats r0 into r1;
    output r1 as veilnet_ai_v7.aleo/get_verification_stats.future;

finalize get_verification_stats:
    input r0 as u8.public;
    get.or_use verification_stats[r0] 0u64 into r1;

constructor:
    assert.eq edition 0u16;
