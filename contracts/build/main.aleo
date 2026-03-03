program veilnet_ai_v6.aleo;

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
    hash.bhp256 r0 into r6 as field;
    hash.bhp256 r4 into r7 as field;
    add r0 r1 into r8;
    cast r2 into r9 as field;
    add r8 r9 into r10;
    cast r3 into r11 as field;
    add r10 r11 into r12;
    hash.bhp256 r12 into r13 as field;
    add r13 r7 into r14;
    hash.bhp256 r14 into r15 as field;
    async submit_analysis r6 r0 r15 r2 into r16;
    output r16 as veilnet_ai_v6.aleo/submit_analysis.future;

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

function verify_proof_exists:
    input r0 as field.private;
    async verify_proof_exists r0 into r1;
    output r1 as veilnet_ai_v6.aleo/verify_proof_exists.future;

finalize verify_proof_exists:
    input r0 as field.public;
    get.or_use proof_registry[r0] 0field into r1;
    assert.neq r1 0field;

function get_verification_stats:
    input r0 as u8.private;
    async get_verification_stats r0 into r1;
    output r1 as veilnet_ai_v6.aleo/get_verification_stats.future;

finalize get_verification_stats:
    input r0 as u8.public;
    get.or_use verification_stats[r0] 0u64 into r1;

constructor:
    assert.eq edition 0u16;
