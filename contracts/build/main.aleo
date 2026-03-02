program veilnet_ai_v3.aleo;

mapping proof_registry:
    key as field.public;
    value as boolean.public;

mapping verification_stats:
    key as u8.public;
    value as u64.public;

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
    hash.bhp256 r0 into r6 as field;
    cast r2 into r7 as field;
    cast r3 into r8 as field;
    async submit_analysis r6 r2 into r9;
    output r9 as veilnet_ai_v3.aleo/submit_analysis.future;

finalize submit_analysis:
    input r0 as field.public;
    input r1 as u8.public;
    set true into proof_registry[r0];
    lte r1 25u8 into r2;
    lte r1 60u8 into r3;
    lte r1 85u8 into r4;
    ternary r4 3u8 4u8 into r5;
    ternary r3 2u8 r5 into r6;
    ternary r2 1u8 r6 into r7;
    get.or_use verification_stats[r7] 0u64 into r8;
    add r8 1u64 into r9;
    set r9 into verification_stats[r7];

function verify_proof_exists:
    input r0 as field.private;
    async verify_proof_exists r0 into r1;
    output r1 as veilnet_ai_v3.aleo/verify_proof_exists.future;

finalize verify_proof_exists:
    input r0 as field.public;
    get.or_use proof_registry[r0] false into r1;
    assert.eq r1 true;

function get_verification_stats:
    input r0 as u8.private;
    async get_verification_stats r0 into r1;
    output r1 as veilnet_ai_v3.aleo/get_verification_stats.future;

finalize get_verification_stats:
    input r0 as u8.public;
    get.or_use verification_stats[r0] 0u64 into r1;

constructor:
    assert.eq edition 0u16;
