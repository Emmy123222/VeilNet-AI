program veilnet_ai.aleo;

record AnalysisProof:
    owner as address.private;
    input_hash as field.private;
    ai_output_hash as field.private;
    ai_score as u8.private;
    timestamp as u64.private;
    proof_id as field.private;

mapping verified_proofs:
    key as field.public;
    value as boolean.public;

mapping initialized:
    key as u8.public;
    value as boolean.public;

function initialize:
    async initialize into r0;
    output r0 as veilnet_ai.aleo/initialize.future;

finalize initialize:
    set true into initialized[0u8];

function submit_analysis:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as u8.public;
    input r3 as u64.public;
    input r4 as address.private;
    lte r2 100u8 into r5;
    assert.eq r5 true;
    hash.bhp256 r0 into r6 as field;
    cast r4 r0 r1 r2 r3 r6 into r7 as AnalysisProof.record;
    async submit_analysis r6 into r8;
    output r7 as AnalysisProof.record;
    output r8 as veilnet_ai.aleo/submit_analysis.future;

finalize submit_analysis:
    input r0 as field.public;
    set true into verified_proofs[r0];

function verify_proof:
    input r0 as field.public;
    async verify_proof r0 into r1;
    output true as boolean.private;
    output r1 as veilnet_ai.aleo/verify_proof.future;

finalize verify_proof:
    input r0 as field.public;
    get.or_use verified_proofs[r0] false into r1;
    assert.eq r1 true;

constructor:
    assert.eq edition 0u16;
