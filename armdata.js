// [armdata.js]
// ARM instruction-set data.
//
// [License]
// Public Domain.


// This file can be parsed as pure JSON, locate ${JSON:BEGIN} and ${JSON:END}
// marks and strip everything outside, a sample JS function that would do the job:
//
// function strip(s) {
//   return s.replace(/(^.*\$\{JSON:BEGIN\}\s+)|(\/\/\s*\$\{JSON:END\}\s*.*$)/g, "");
// }


// DESCRIPTION
// -----------
//
// These tables can be used for any purpose. The idea is to have an instruction DB
// that can be used to generate tables used by assemblers and disassemblers, and
// also to have data that can be used to generate instruction tables for developers.


// INSTRUCTION TUPLE
// -----------------
//
// Each instruction tuple consists of 5 strings:
//
//   [0] - Instruction name.
//   [1] - Instruction operands.
//   [2] - Instruction type (specifies instruction's layout and architecture as well).
//   [3] - Instruction opcode (fields separated by '|' forming the instruction word or halfword).
//   [4] - Instruction metadata - CPU requirements, APSR (read/write), and other metadata.
//
// The fields should match ARM instruction reference manual as possible, however,
// it's allowed to make changes that make parsing easier and data more consistent.


// INSTRUCTION OPERANDS
// --------------------
//
// Instruction operands contain standard operand field(s) as defined by ARM
// instruction reference, and also additional metadata that is defined by
// ARM, but in notes section (instead of instruction format section). Additional
// data include:
//
//   - "R?!=HI" - The register cannot be R8..R15 (most T16 instructions).
//   - "R?!=PC" - The register cannot be R15 (PC).
//   - "R?!=SP" - The register cannot be R13 (SP).
//   - "R?!=XX" - The register cannot be R13 (SP) or R15 (PC).
//
// Also, all instructions that use T16 layout were normalized into 3 operand
// form to make these compatible with T32 and A32 architecturess. It was designed
// for convenience. These are easily recognizable as they always share the first
// two operands.
//
// Divergence from ARM Manual:
//   - "Rdn" register (used by T16) was renamed to Rx to make the table easier to
//     read when multiple instructions follow (register names have the same length).


// METADATA
// --------
//
// The following metadata is used to describe instructions:
//
//   "ARMv??"
///    - Required ARM version:
//       - '+' sign means it's supported by that version and above.
//       - '-' sign means it's deprecated (and discontinued) by that version.
//
//   "ARMv6T2_IF_LOW"
//     - The instruction requires at least ARMv6T2 if both registers are LOW (R0..R7).
//
//   "IT"
//     - Conditional execution block THUMB/THUMB2:
//       - IT=ANY      - means the instruction can be executed inside or outside
//                       of IT block.
//       - IT=IN       - means the instruction can be executed inside of IT block.
//       - IT=OUT      - means the instruction can be executed outside of IT block.
//       - IT=OUT|LAST - means the instruction can be executed outside of IT block,
//                       alternatively, it must be the last conditionally executed
//                       instruction inside of IT block.
//
//   "APSR"
//     - The instruction reads/writes APSR register:
//       - [N|Z|C|V] - Which flags are read/written
//       - Since most of ARM instructions provide conditional execution the
//         APSR mostly defines APSR writes, as reads are controlled by IT
//         or condition code {cond}, which is part of each instruction.
//
//   "APSR_IF_NOT_PC"
//     - Instruction writes to APSR register only if the destination register
//       is not R15 (PC). In that case APSR is not modified (ARM specific).
//
//   "LSL_3_IF_SP"
//     - If the destination register is SP the only possible shift type is LSL
//       and the shift constant can be only contain values from 0 to 3, inclusive.
//
//   "UNPRED_COMPLEX"
//     - The instruction has complex rules for unpredictability (TODO, should be fixed).
//
//   "UNPRED_IF_ALL_LOW"
//     - At least one register must be HI reg (R8..R15) or the instruction is UNPREDICTABLE.
//
//   "T16_LDM"
//     - Writeback is enabled if Rn is specified also in RdList (T16).
//
//   "T32_LDM"
//     - RdList mask is restricted, can contain one of R15|R14 and requires at least 2
//       registers to be present.

// TODO: MISSING/REVIEW:
//   cdp
//   cdp2
//   chka
//   cps
//   enterx
//   leavex
//   HB, HBL, HBLP, HBP
//   ldc / ldc2
//   ADD 'mov' with shift spec.
//   MRS/MSR <banked_reg>
//   RFE
//   SMC
//   SRS
//   STC / SRC2
//   STC
//   STM
//   SUBS PC, LR
//
//   vl?
//   vmrs
//   vmsr
//   vpop
//   vpush
//   vst?
//   vstm
//   vstr

// TODO (Metadata):
//   ARMv8-A removes UNPREDICTABLE for R13
//   if ArchVersion() < 6 && d == n then UNPREDICTABLE;

(function($export, $as) {
"use strict";

$export[$as] =
// ${JSON:BEGIN}
{
  "architectures": [
    "T16",
    "T32",
    "A32",
    "A64"
  ],

  "versions": [
    "ARMv4",
    "ARMv4T",
    "ARMv5T",
    "ARMv5TE",
    "ARMv5TEJ",
    "ARMv6",
    "ARMv6K",
    "ARMv6T2",
    "ARMv7",
    "ARMv8",
    "ARMv8_1",
    "ARMv8_2"
  ],

  "features": {
    "IDIVT"   : { "mandatory": "ARMv7R+"  },
    "IDIVA"   : { "mandatory": "ARMv8+"   },
    "CRC32"   : { "mandatory": "ARMv8_1+" },
    "SECURITY": { "mandatory": ""         }
  },

  "registers": {
    "w"   : { "kind": "gp" , "any": "w", "names": ["w0-31"] },
    "x"   : { "kind": "gp" , "any": "x", "names": ["x0-31"] },
    "s"   : { "kind": "vec", "any": "s", "names": ["s0-31"] },
    "d"   : { "kind": "vec", "any": "d", "names": ["d0-31"] },
    "v"   : { "kind": "vec", "any": "v", "names": ["v0-31"] }
  },

  "instructions": [
    ["adc"              , "Rd!=XX, Rn!=XX, #ImmA"                       , "T32", "1111|0|ImmA:1|0|1010|0|Rn|0|ImmA:3|Rd|ImmA:8"           , "ARMv6T2+ IT=ANY"],
    ["adcs"             , "Rd!=XX, Rn!=XX, #ImmA"                       , "T32", "1111|0|ImmA:1|0|1010|1|Rn|0|ImmA:3|Rd|ImmA:8"           , "ARMv6T2+ IT=ANY APSR.NZCV=W APSR_IF_NOT_PC"],
    ["adc"              , "Rd    , Rn    , #ImmA"                       , "A32", "Cond|001|0101|0|Rn|Rd|ImmA:12"                          , "ARMv4+"],
    ["adcs"             , "Rd!=PC, Rn    , #ImmA"                       , "A32", "Cond|001|0101|1|Rn|Rd|ImmA:12"                          , "ARMv4+ APSR.NZCV=W"],
    ["adc"              , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|000|101|Rm:3|Rx:3"                                 , "ARMv4T+  IT=IN"],
    ["adcs"             , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|000|101|Rm:3|Rx:3"                                 , "ARMv4T+  IT=OUT APSR.NZCV=W APSR_IF_NOT_PC"],
    ["adc"              , "Rd    , Rn    , Rm    , {Sop #Shift}"        , "A32", "Cond|000|0101|0|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],
    ["adcs"             , "Rd!=PC, Rn    , Rm    , {Sop #Shift}"        , "A32", "Cond|000|0101|1|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+ APSR.NZCV=W"],
    ["adc"              , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|1010|0|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY"],
    ["adcs"             , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|1010|1|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY APSR.NZCV=W APSR_IF_NOT_PC"],
    ["adc"              , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|0101|0|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+"],
    ["adcs"             , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|0101|1|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+ APSR.NZCV=W"],

    ["add"              , "Rx!=HI, Rx!=HI, #ImmZ"                       , "T16", "0011|0|Rx:3|ImmZ:8"                                     , "ARMv4T+  IT=IN"],
    ["adds"             , "Rx!=HI, Rx!=HI, #ImmZ"                       , "T16", "0011|0|Rx:3|ImmZ:8"                                     , "ARMv4T+  IT=OUT APSR.NZCV=W"],
    ["add"              , "Rd!=HI, Rn!=HI, #ImmZ"                       , "T16", "0001|110|ImmZ:3|Rn:3|Rd:3"                              , "ARMv4T+  IT=IN"],
    ["adds"             , "Rd!=HI, Rn!=HI, #ImmZ"                       , "T16", "0001|110|ImmZ:3|Rn:3|Rd:3"                              , "ARMv4T+  IT=OUT APSR.NZCV=W"],
    ["add"              , "Rx==SP, Rx==SP, #ImmZ*4"                     , "T16", "1011|00000|ImmZ:7"                                      , "ARMv4T+  IT=ANY"],
    ["add"              , "Rd!=SP, Rn==SP, #ImmZ*4"                     , "T16", "1010|1|Rd:3|ImmZ:8"                                     , "ARMv4T+  IT=ANY"],
    ["add"              , "Rd!=XX, Rn!=PC, #ImmZ"                       , "T32", "1111|0|ImmZ:1|1|0000|0|Rn|0|ImmZ:3|Rd|ImmZ:8"           , "ARMv6T2+ IT=ANY"],
    ["add"              , "Rd!=XX, Rn!=PC, #ImmA"                       , "T32", "1111|0|ImmA:1|0|1000|0|Rn|0|ImmA:3|Rd|ImmA:8"           , "ARMv6T2+ IT=ANY"],
    ["adds"             , "Rd!=XX, Rn!=PC, #ImmA"                       , "T32", "1111|0|ImmA:1|0|1000|1|Rn|0|ImmA:3|Rd|ImmA:8"           , "ARMv6T2+ IT=ANY APSR.NZCV=W"],
    ["add"              , "Rd!=PC, Rn==SP, #ImmZ"                       , "T32", "1111|0|ImmZ:1|1|0000|0|1101|0|ImmZ:3|Rd|ImmZ:8"         , "ARMv6T2+ IT=ANY"],
    ["add"              , "Rd!=PC, Rn==SP, #ImmA"                       , "T32", "1111|0|ImmA:1|0|1000|0|1101|0|ImmA:3|Rd|ImmA:8"         , "ARMv6T2+ IT=ANY"],
    ["adds"             , "Rd!=PC, Rn==SP, #ImmA"                       , "T32", "1111|0|ImmA:1|0|1000|1|1101|0|ImmA:3|Rd|ImmA:8"         , "ARMv6T2+ IT=ANY APSR.NZCV=W"],
    ["add"              , "Rd    , Rn!=XX, #ImmA"                       , "A32", "Cond|001|0100|0|Rn|Rd|ImmA:12"                          , "ARMv4+"],
    ["adds"             , "Rd!=PC, Rn!=SP, #ImmA"                       , "A32", "Cond|001|0100|1|Rn|Rd|ImmA:12"                          , "ARMv4+ APSR.NZCV=W"],
    ["add"              , "Rd    , Rn==SP, #ImmA"                       , "A32", "Cond|001|0100|0|1101|Rd|ImmA:12"                        , "ARMv4+"],
    ["adds"             , "Rd!=PC, Rn==SP, #ImmA"                       , "A32", "Cond|001|0100|1|1101|Rd|ImmA:12"                        , "ARMv4+ APSR.NZCV=W"],
    ["add"              , "Rd!=HI, Rn!=HI, Rm!=HI"                      , "T16", "0001|100|Rm:3|Rn:3|Rd:3"                                , "ARMv4T+  IT=IN"],
    ["adds"             , "Rd!=HI, Rn!=HI, Rm!=HI"                      , "T16", "0001|100|Rm:3|Rn:3|Rd:3"                                , "ARMv4T+  IT=OUT APSR.NZCV=W"],
    ["add"              , "Rx!=XX, Rx!=XX, Rm!=XX"                      , "T16", "0100|010|0|Rx:1|Rm:4|Rx:3"                              , "ARMv4T+  IT=IN  ARMv6T2_IF_LOW"],
    ["add"              , "Rx    , Rx    , Rm==SP"                      , "T16", "0100|010|0|Rx:1|1101|Rx:3"                              , "ARMv4T+  IT=ANY"],
    ["add"              , "Rx==SP, Rx==SP, Rm"                          , "T16", "0100|010|0|1|Rm:4|101"                                  , "ARMv4T+  IT=ANY"],
    ["add"              , "Rd!=XX, Rn!=PC, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|1000|0|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY"],
    ["adds"             , "Rd!=XX, Rn!=PC, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|1000|1|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY"],
    ["add"              , "Rd!=PC, Rn==SP, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|1000|0|1101|0|Shift:3|Rd|Shift:2|Sop:2|Rm"     , "ARMv6T2+ IT=ANY LSL_3_IF_SP"],
    ["adds"             , "Rd!=PC, Rn==SP, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|1000|1|1101|0|Shift:3|Rd|Shift:2|Sop:2|Rm"     , "ARMv6T2+ IT=ANY LSL_3_IF_SP"],
    ["add"              , "Rd    , Rn!=SP, Rm    , {Sop #Shift}"        , "A32", "Cond|000|0100|0|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],
    ["adds"             , "Rd!=PC, Rn!=SP, Rm    , {Sop #Shift}"        , "A32", "Cond|000|0100|1|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+ APSR.NZCV=W"],
    ["add"              , "Rd    , Rn==SP, Rm    , {Sop #Shift}"        , "A32", "Cond|000|0100|0|1101|Rd|Shift:5|Sop:2|0|Rm"             , "ARMv4+"],
    ["adds"             , "Rd!=PC, Rn==SP, Rm    , {Sop #Shift}"        , "A32", "Cond|000|0100|1|1101|Rd|Shift:5|Sop:2|0|Rm"             , "ARMv4+ APSR.NZCV=W"],
    ["add"              , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|0100|0|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+"],
    ["adds"             , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|0100|1|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+ APSR.NZCV=W"],

    ["adr"              , "Rd!=HI, #RelZ*4"                             , "T16", "1010|0|Rd:3|RelZ:8"                                     , "ARMv4T+  IT=ANY ADD=1"],
    ["adr"              , "Rd!=XX, #RelZ"                               , "T32", "1111|0|RelZ:1|10000|0|1111|0|RelZ:3|Rd|RelZ:8"          , "ARMv6T2+ IT=ANY ADD=1"],
    ["adr"              , "Rd!=XX, #RelZ"                               , "T32", "1111|0|RelZ:1|10101|0|1111|0|RelZ:3|Rd|RelZ:8"          , "ARMv6T2+ IT=ANY ADD=0"],
    ["adr"              , "Rd    , #RelA"                               , "A32", "Cond|001|0100|0|1111|Rd|RelA:12"                        , "ARMv4+ ADD=1"],
    ["adr"              , "Rd    , #RelA"                               , "A32", "Cond|001|0010|0|1111|Rd|RelA:12"                        , "ARMv4+ ADD=0"],

    ["and"              , "Rd!=XX, Rn!=XX, #ImmC"                       , "T32", "1111|0|ImmC:1|0|1010|0|Rn|0|ImmC:3|Rd|ImmC:8"           , "ARMv6T2+ IT=ANY"],
    ["ands"             , "Rd!=XX, Rn!=XX, #ImmC"                       , "T32", "1111|0|ImmC:1|0|1010|1|Rn|0|ImmC:3|Rd|ImmC:8"           , "ARMv6T2+ IT=ANY APSR.NZCV=W APSR_IF_NOT_PC"],
    ["and"              , "Rd    , Rn    , #ImmC"                       , "A32", "Cond|001|0000|0|Rn|Rd|ImmC:12"                          , "ARMv4+"],
    ["ands"             , "Rd!=PC, Rn    , #ImmC"                       , "A32", "Cond|001|0000|1|Rn|Rd|ImmC:12"                          , "ARMv4+ APSR.NZC=W"],
    ["and"              , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|000|000|Rm:3|Rx:3"                                 , "ARMv4T+  IT=IN"],
    ["ands"             , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|000|000|Rm:3|Rx:3"                                 , "ARMv4T+  IT=OUT APSR.NZ=W"],
    ["and"              , "Rd    , Rn    , Rm, {Sop #Shift}"            , "A32", "Cond|000|0000|0|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],
    ["ands"             , "Rd!=PC, Rn    , Rm, {Sop #Shift}"            , "A32", "Cond|000|0000|1|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+ APSR.NZC=W"],
    ["and"              , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|0000|0|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY"],
    ["ands"             , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|0000|1|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["and"              , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|0000|0|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+"],
    ["ands"             , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|0000|1|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+ APSR.NZC=W"],

    ["asr"              , "Rd!=HI, Rn!=HI, #Shift"                      , "T16", "0001|0|Shift:5|Rn:3|Rd:3"                               , "ARMv4T+  IT=IN"],
    ["asrs"             , "Rd!=HI, Rn!=HI, #Shift"                      , "T16", "0001|0|Shift:5|Rn:3|Rd:3"                               , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["asr"              , "Rd!=XX, Rn!=XX, #Shift"                      , "T32", "1110|101|0010|0|1111|0|Shift:3|Rd|Shift:2|10|Rn"        , "ARMv6T2+ IT=ANY"],
    ["asrs"             , "Rd!=XX, Rn!=XX, #Shift"                      , "T32", "1110|101|0010|1|1111|0|Shift:3|Rd|Shift:2|10|Rn"        , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["asr"              , "Rd    , Rn    , #Shift"                      , "A32", "Cond|000|1101|0|0000|Rd|Shift:5|100|Rn"                 , "ARMv4+"],
    ["asrs"             , "Rd    , Rn    , #Shift"                      , "A32", "Cond|000|1101|1|0000|Rd|Shift:5|100|Rn"                 , "ARMv4+ APSR.NZC=W"],
    ["asr"              , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|000|100|Rm:3|Rx:3"                                 , "ARMv4T+  IT=IN"],
    ["asrs"             , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|000|100|Rm:3|Rx:3"                                 , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["asr"              , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0010|0|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["asrs"             , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0010|1|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["asr"              , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1101|0|0000|Rd|Rm|0101|Rn"                     , "ARMv4+"],
    ["asrs"             , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1101|1|0000|Rd|Rm|0101|Rn"                     , "ARMv4+ APSR.NZC=W"],

    ["b"                , "#RelS*2"                                     , "T16", "1101|Cond|RelS:8"                                       , "ARMv4T+  IT=OUT"],
    ["b"                , "#RelS*2"                                     , "T16", "1110|0|RelS:11"                                         , "ARMv4T+  IT=OUT|LAST"],
    ["b"                , "#RelS*2"                                     , "T32", "1111|0|RelS[19]|Cond|RelS[16:11]|10|J|0|K|RelS[10:0]"   , "ARMv6T2+ IT=OUT"],
    ["b"                , "#RelS*2"                                     , "T32", "1111|0|RelS[23]|     RelS[20:11]|10|J|1|K|RelS[10:0]"   , "ARMv6T2+ IT=OUT|LAST"],
    ["b"                , "#RelS*4"                                     , "A32", "Cond|101|0|RelS:24"                                     , "ARMv4+"],

    ["bfc"              , "Rd!=XX, #LSB, #Width"                        , "T32", "1111|001|1011|0|1111|0|LSB:3|Rd|LSB:2|0|Width:5"        , "ARMv6T2+ IT=ANY"],
    ["bfc"              , "Rd!=PC, #LSB, #Width"                        , "A32", "Cond|011|1110|Width:5|Rd|LSB:5|001|1111"                , "ARMv6T2+"],
    ["bfi"              , "Rd!=XX, Rn!=XX, #LSB, #Width"                , "T32", "1111|001|1011|0|Rn|0|LSB:3|Rd|LSB:2|0|Width:5"          , "ARMv6T2+ IT=ANY"],
    ["bfi"              , "Rd!=PC, Rn!=PC, #LSB, #Width"                , "A32", "Cond|011|1110|Width:5|Rd|LSB:5|001|Rn"                  , "ARMv6T2+"],

    ["bic"              , "Rd!=XX, Rn!=XX, #ImmC"                       , "T32", "1111|0|ImmC:1|0|0001|0|Rn|0|ImmC:3|Rd|ImmC:8"           , "ARMv6T2+ IT=ANY"],
    ["bics"             , "Rd!=XX, Rn!=XX, #ImmC"                       , "T32", "1111|0|ImmC:1|0|0001|1|Rn|0|ImmC:3|Rd|ImmC:8"           , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["bic"              , "Rd    , Rn    , #ImmC"                       , "A32", "Cond|001|1110|0|Rn|Rd|ImmC:12"                          , "ARMv4+"],
    ["bics"             , "Rd!=PC, Rn    , #ImmC"                       , "A32", "Cond|001|1110|1|Rn|Rd|ImmC:12"                          , "ARMv4+ APSR.NZC=W"],
    ["bic"              , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|001|110|Rm:3|Rx:3"                                 , "ARMv4T+  IT=IN"],
    ["bics"             , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|001|110|Rm:3|Rx:3"                                 , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["bic"              , "Rd    , Rn    , Rm    , {Sop #Shift}"        , "A32", "Cond|000|1110|0|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],
    ["bics"             , "Rd!=PC, Rn    , Rm    , {Sop #Shift}"        , "A32", "Cond|000|1110|1|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+ APSR.NZC=W"],
    ["bic"              , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|0001|0|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY"],
    ["bics"             , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|0001|1|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["bic"              , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|1110|0|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+"],
    ["bics"             , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|1110|1|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+ APSR.NZC=W"],

    ["bkpt"             , "#ImmZ"                                       , "T16", "1011|111|0|ImmZ:8"                                      , "ARMv5T+  IT=UNCOND"],
    ["bkpt"             , "#ImmZ"                                       , "A32", "Cond|000|1001|0|ImmZ:12|0111|ImmZ:4"                    , "ARMv6+ ARMv5T"],

    ["bl"               , "#RelS*2"                                     , "T32", "1111|0|RelS[23]|RelS[20:11]|11|J1|1|J2|RelS[10:0]"      , "ARMv4T+  IT=OUT|LAST"],
    ["bl"               , "#RelS*4"                                     , "A32", "Cond|101|1|RelS:24"                                     , "ARMv4+"],

    ["blx"              , "#RelS*4"                                     , "T32", "1111|0|RelS[22]|RelS[19:10]|11|J1|0|J2|RelS[9:0]|0"     , "ARMv4T+  IT=OUT|LAST"],
    ["blx"              , "#RelS*2"                                     , "A32", "1111|101|RelS[0]|RelS[24:1]"                            , "ARMv4+"],
    ["blx"              , "Rm!=PC"                                      , "T16", "0100|011|11|Rm:4|000"                                   , "ARMv5T+  IT=OUT|LAST"],
    ["blx"              , "Rm!=PC"                                      , "A32", "Cond|000|1001|0|1111|1111|1111|0011|Rm"                 , "ARMv5T+"],

    ["bx"               , "Rm"                                          , "T16", "0100|011|10|Rm:4|000"                                   , "ARMv4T+  IT=OUT|LAST"],
    ["bx"               , "Rm"                                          , "A32", "Cond|000|1001|0|1111|1111|1111|0001|Rm"                 , "ARMv4T+"],

    ["bxj"              , "Rm!=XX"                                      , "T32", "1111|001|1110|0|Rm|1000|1111|00000000"                  , "ARMv6T2+ IT=OUT|LAST"],
    ["bxj"              , "Rm!=PC"                                      , "A32", "Cond|000|1001|0|1111|1111|1111|0010|Rm"                 , "ARMv5TEJ+"],

    ["cbz"              , "Rn!=HI, #RelZ*2"                             , "T16", "1011|00|RelZ:1|1|RelZ:5|Rn:3"                           , "ARMv6T2+ IT=OUT"],
    ["cbnz"             , "Rn!=HI, #RelZ*2"                             , "T16", "1011|10|RelZ:1|1|RelZ:5|Rn:3"                           , "ARMv6T2+ IT=OUT"],

    ["clrex"            , ""                                            , "T32", "1111|001|1101|1|1111|1000|1111|0010|1111"               , "ARMv7+   IT=ANY"],
    ["clrex"            , ""                                            , "A32", "1111|010|1011|1|1111|1111|0000|0001|1111"               , "ARMv7+ ARMv6K"],

    ["clz"              , "Rd!=XX, Rn!=XX"                              , "T32", "1111|101|0101|1|Rm|1111|Rd|1000|Rn"                     , "ARMv6T2+ IT=ANY"],
    ["clz"              , "Rd!=PC, Rn!=PC"                              , "A32", "Cond|000|1011|0|1111|Rd|1111|0001|Rn"                   , "ARMv6+ ARMv5T"],

    ["cmn"              , "Rn!=PC, #ImmA"                               , "T32", "1111|0|ImmA:1|0|1000|1|Rn|0|ImmA:3|1111|ImmA:8"         , "ARMv6T2+ IT=ANY APSR.NZCV=W"],
    ["cmn"              , "Rn    , #ImmA"                               , "A32", "Cond|001|1011|1|Rn|0000|ImmA:12"                        , "ARMv4+ APSR.NZCV=W"],
    ["cmn"              , "Rn!=HI, Rm!=HI"                              , "T16", "0100|001|011|Rm:3|Rn:3"                                 , "ARMv4T+  IT=ANY APSR.NZCV=W"],
    ["cmn"              , "Rn!=PC, Rm!=XX, {Sop #Shift}"                , "T32", "1110|101|1000|1|Rn|0|Shift:3|1111|Shift:2|Sop:2|Rm"     , "ARMv6T2+ IT=ANY APSR.NZCV=W"],
    ["cmn"              , "Rn    , Rm    , {Sop #Shift}"                , "A32", "Cond|000|1011|1|Rn|0000|Shift:5|Sop:2|0|Rm"             , "ARMv4+ APSR.NZCV=W"],
    ["cmn"              , "Rn!=PC, Rm!=PC, Sop Rs!=PC"                  , "A32", "Cond|000|1011|1|Rn|0000|Rs|0|Sop:2|1|Rm"                , "ARMv4+ APSR.NZCV=W"],

    ["cmp"              , "Rn!=HI, #ImmZ"                               , "T16", "0010|1|Rn:3|ImmZ:8"                                     , "ARMv4T+  IT=ANY APSR.NZCV=W"],
    ["cmp"              , "Rn!=PC, #ImmA"                               , "T32", "1111|0|ImmA:1|0|1101|1|Rn|0|ImmA:3|1111|ImmA:8"         , "ARMv6T2+ IT=ANY APSR.NZCV=W"],
    ["cmp"              , "Rn    , #ImmA"                               , "A32", "Cond|001|1010|1|Rn|0000|ImmA:12"                        , "ARMv4+ APSR.NZCV=W"],
    ["cmp"              , "Rn!=HI, Rm!=HI"                              , "T16", "0100|001|010|Rm:3|Rn:3"                                 , "ARMv4T+  IT=ANY APSR.NZCV=W"],
    ["cmp"              , "Rn!=PC, Rm!=PC"                              , "T16", "0100|010|1|Rn:1|Rm:4|Rn:3"                              , "ARMv4T+  IT=ANY APSR.NZCV=W UNPRED_IF_ALL_LOW"],
    ["cmp"              , "Rn!=PC, Rm!=XX, {Sop #Shift}"                , "T32", "1110|101|1101|1|Rn|0|Shift:3|1111|Shift:2|Sop:2|Rm"     , "ARMv6T2+ IT=ANY APSR.NZCV=W"],
    ["cmp"              , "Rn    , Rm    , {Sop #Shift}"                , "A32", "Cond|000|1010|1|Rn|0000|Shift:5|Sop:2|0|Rm"             , "ARMv4+ APSR.NZCV=W"],
    ["cmp"              , "Rn!=PC, Rm!=PC, Sop Rs!=PC"                  , "A32", "Cond|000|1010|1|Rn|0000|Rs|0|Sop:2|1|Rm"                , "ARMv4+ APSR.NZCV=W"],

    ["cps"              , "#ImmZ"                                       , "A32", "1111|000|1000|0|0010|0000|000|000|0|ImmZ:5"             , "?"],

    ["cpsid"            , "#AIF"                                        , "A32", "1111|000|1000|0|1100|0000|000|AIF:3|0|00000"            , "?"],
    ["cpsid"            , "#AIF, #ImmZ"                                 , "A32", "1111|000|1000|0|1110|0000|000|AIF:3|0|ImmZ:5"           , "?"],

    ["cpsie"            , "#AIF"                                        , "A32", "1111|000|1000|0|1000|0000|000|AIF:3|0|00000"            , "?"],
    ["cpsie"            , "#AIF, #ImmZ"                                 , "A32", "1111|000|1000|0|1010|0000|000|AIF:3|0|ImmZ:5"           , "?"],

    ["crc32b"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "T32", "1111|101|0110|0|Rn|1111|Rd|10|00|Rm"                    , "CRC32    IT=OUT"],
    ["crc32b"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1000|0|Rn|Rd|0000|0100|Rm"                     , "CRC32"],

    ["crc32h"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "T32", "1111|101|0110|0|Rn|1111|Rd|10|01|Rm"                    , "CRC32    IT=OUT"],
    ["crc32h"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1001|0|Rn|Rd|0000|0100|Rm"                     , "CRC32"],

    ["crc32w"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "T32", "1111|101|0110|0|Rn|1111|Rd|10|10|Rm"                    , "CRC32    IT=OUT"],
    ["crc32w"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1010|0|Rn|Rd|0000|0100|Rm"                     , "CRC32"],

    ["crc32cb"          , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "T32", "1111|101|0110|1|Rn|1111|Rd|10|00|Rm"                    , "CRC32    IT=OUT"],
    ["crc32cb"          , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1000|0|Rn|Rd|0010|0100|Rm"                     , "CRC32"],

    ["crc32ch"          , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "T32", "1111|101|0110|1|Rn|1111|Rd|10|01|Rm"                    , "CRC32    IT=OUT"],
    ["crc32ch"          , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1001|0|Rn|Rd|0010|0100|Rm"                     , "CRC32"],

    ["crc32cw"          , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "T32", "1111|101|0110|1|Rn|1111|Rd|10|10|Rm"                    , "CRC32    IT=OUT"],
    ["crc32cw"          , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1010|0|Rn|Rd|0010|0100|Rm"                     , "CRC32"],

    ["dbg"              , "#ImmZ"                                       , "T32", "1111|001|1101|0|1111|1000|0000|1111|ImmZ:4"             , "ARMv6T2+ IT=ANY"],
    ["dbg"              , "#ImmZ"                                       , "A32", "Cond|001|1001|0|0000|1111|0000|1111|ImmZ:4"             , "ARMv7+   ARMv8-"],

    ["dmb"              , "#ImmZ"                                       , "T32", "1111|001|1101|1|1111|1000|1111|0101|ImmZ:4"             , "ARMv7+   IT=ANY"],
    ["dmb"              , "#ImmZ"                                       , "A32", "1111|010|1011|1|1111|1111|0000|0101|ImmZ:4"             , "ARMv7+"],

    ["dsb"              , "#ImmZ"                                       , "T32", "1111|001|1101|1|1111|1000|1111|0100|ImmZ:4"             , "ARMv7+   IT=ANY"],
    ["dsb"              , "#ImmZ"                                       , "A32", "1111|010|1011|1|1111|1111|0000|0100|ImmZ:4"             , "ARMv7+"],

    ["eor"              , "Rd!=XX, Rn!=XX, #ImmC"                       , "T32", "1111|0|ImmC:1|0|0100|0|Rn|0|ImmC:3|Rd|ImmC:8"           , "ARMv6T2+ IT=ANY"],
    ["eors"             , "Rd!=XX, Rn!=XX, #ImmC"                       , "T32", "1111|0|ImmC:1|0|0100|1|Rn|0|ImmC:3|Rd|ImmC:8"           , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["eor"              , "Rd    , Rn    , #ImmC"                       , "A32", "Cond|001|0001|0|Rn|Rd|ImmC:12"                          , "ARMv4+"],
    ["eors"             , "Rd!=PC, Rn    , #ImmC"                       , "A32", "Cond|001|0001|1|Rn|Rd|ImmC:12"                          , "ARMv4+ APSR.NZC=W"],
    ["eor"              , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|000|001|Rm:3|Rx:3"                                 , "ARMv4T+  IT=IN"],
    ["eors"             , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|000|001|Rm:3|Rx:3"                                 , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["eor"              , "Rd    , Rn    , Rm    , {Sop #Shift}"        , "A32", "Cond|000|0001|0|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],
    ["eors"             , "Rd!=PC, Rn    , Rm    , {Sop #Shift}"        , "A32", "Cond|000|0001|1|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+ APSR.NZC=W"],
    ["eor"              , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|0100|0|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY"],
    ["eors"             , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|0100|1|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["eor"              , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|0001|0|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+"],
    ["eors"             , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|0001|1|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+ APSR.NZC=W"],

    ["eret"             , ""                                            , "A32", "Cond|000|1011|0|0000|0000|0000|0110|1110"               , "?"],

    ["hlt"              , "#ImmZ"                                       , "A32", "Cond|000|1000|0|ImmZ:12|0111|ImmZ:4"                    , "?"],
    ["hvc"              , "#ImmZ"                                       , "A32", "Cond|000|1010|0|ImmZ:12|0111|ImmZ:4"                    , "?"],

    ["isb"              , "#ImmZ"                                       , "A32", "1111|010|1011|1|1111|1111|0000|0110|ImmZ:4"             , "ARMv7+"],

    ["it{x}{y}{z}"      , "#FirstCond!=15"                              , "T16", "1011|111|1|FirstCond:4|Mask:4"                          , "ARMv6T2+ IT=OUT"],

    ["lda"              , "Rd!=PC, [Rn!=PC]"                            , "T32", "1110|100|0110|1|Rn|Rd|1111|1010|1111"                   , "ARMv8+   IT=ANY"],
    ["lda"              , "Rd!=PC, [Rn!=PC]"                            , "A32", "Cond|000|1100|1|Rn|Rd|1100|1001|1111"                   , "ARMv8+"],

    ["ldab"             , "Rd!=PC, [Rn!=PC]"                            , "T32", "1110|100|0110|1|Rn|Rd|1111|1000|1111"                   , "ARMv8+   IT=ANY"],
    ["ldab"             , "Rd!=PC, [Rn!=PC]"                            , "A32", "Cond|000|1110|1|Rn|Rd|1100|1001|1111"                   , "ARMv8+"],

    ["ldaex"            , "Rd!=PC, [Rn!=PC]"                            , "T32", "1110|100|0110|1|Rn|Rd|1111|1110|1111"                   , "ARMv8+   IT=ANY"],
    ["ldaex"            , "Rd!=PC, [Rn!=PC]"                            , "A32", "Cond|000|1100|1|Rn|Rd|1110|1001|1111"                   , "ARMv8+"],

    ["ldaexb"           , "Rd!=PC, [Rn!=PC]"                            , "T32", "1110|100|0110|1|Rn|Rd|1111|1100|1111"                   , "ARMv8+   IT=ANY"],
    ["ldaexb"           , "Rd!=PC, [Rn!=PC]"                            , "A32", "Cond|000|1110|1|Rn|Rd|1110|1001|1111"                   , "ARMv8+"],

    ["ldaexd"           , "Rd!=PC, Rd2!=PC  , [Rn!=PC]"                 , "T32", "1110|100|0110|1|Rn|Rd|Rd2|1111|1111"                    , "ARMv8+   IT=ANY"],
    ["ldaexd"           , "Rd<=13, Rd2==Rd+1, [Rn!=PC]"                 , "A32", "Cond|000|1101|1|Rn|Rd|1110|1001|1111"                   , "ARMv8+"],

    ["ldaexh"           , "Rd!=PC, [Rn!=PC]"                            , "T32", "1110|100|0110|1|Rn|Rd|1111|1101|1111"                   , "ARMv8+   IT=ANY"],
    ["ldaexh"           , "Rd!=PC, [Rn!=PC]"                            , "A32", "Cond|000|1111|1|Rn|Rd|1110|1001|1111"                   , "ARMv8+"],

    ["ldah"             , "Rd!=PC, [Rn!=PC]"                            , "T32", "1110|100|0110|1|Rn|Rd|1111|1001|1111"                   , "ARMv8+   IT=ANY"],
    ["ldah"             , "Rd!=PC, [Rn!=PC]"                            , "A32", "Cond|000|1111|1|Rn|Rd|1100|1001|1111"                   , "ARMv8+"],

    ["ldm"              , "[Rn!=HI]{!}, RdList"                         , "T16", "1100|1|Rn:3|RdList:8"                                   , "ARMv4T+  IT=ANY T16_LDM"],
    ["ldm"              , "[Rn!=PC]{!}, RdList"                         , "T32", "1110|100|010W|1|Rn|RdList[15:14]|0|RdList[12:0]"        , "ARMv6T2+ IT=ANY T32_LDM"],
    ["ldm"              , "[Rn!=PC]{!}, RdList"                         , "A32", "Cond|100|010W|1|Rn|RdList:16"                           , "ARMv4+"],
    ["ldm"              , "[Rn!=PC]{!}, RdList"                         , "A32", "Cond|100|011W|1|Rn|RdList:16"                           , "ARMv4+"],

    ["ldmda"            , "[Rn!=PC]{!}, RdList"                         , "A32", "Cond|100|000W|1|Rn|RdList:16"                           , "ARMv4+"],
    ["ldmda"            , "[Rn!=PC]{!}, RdList"                         , "A32", "Cond|100|001W|1|Rn|RdList:16"                           , "ARMv4+"],

    ["ldmdb"            , "[Rn!=PC]{!}, RdList"                         , "T32", "1110|100|100W|1|Rn|RdList[15:14]|0|RdList[12:0]"        , "ARMv6T2+ IT=ANY T32_LDM"],
    ["ldmdb"            , "[Rn!=PC]{!}, RdList"                         , "A32", "Cond|100|100W|1|Rn|RdList:16"                           , "ARMv4+"],
    ["ldmdb"            , "[Rn!=PC]{!}, RdList"                         , "A32", "Cond|100|101W|1|Rn|RdList:16"                           , "ARMv4+"],

    ["ldmib"            , "[Rn!=PC]{!}, RdList"                         , "A32", "Cond|100|110W|1|Rn|RdList:16"                           , "ARMv4+"],
    ["ldmib"            , "[Rn!=PC]{!}, RdList"                         , "A32", "Cond|100|111W|1|Rn|RdList:16"                           , "ARMv4+"],

    ["ldr"              , "Rd!=HI, [Rn!=HI, #ImmZ*4]"                   , "T16", "0110|1|ImmZ:5|Rn:3|Rd:3"                                , "ARMv4T+  IT=ANY"],
    ["ldr"              , "Rd!=HI, [Rn==SP, #ImmZ*4]"                   , "T16", "1001|1|Rd:3|ImmZ:8"                                     , "ARMv4T+  IT=ANY"],
    ["ldr"              , "Rd!=HI, [Rn==PC, #ImmZ*4]"                   , "T16", "0100|1|Rd:3|ImmZ:8"                                     , "ARMv6T2+ IT=ANY"],
    ["ldr"              , "Rd    , [Rn!=PC, #ImmZ]"                     , "T32", "1111|100|0110|1|Rn|Rd|ImmZ:12"                          , "ARMv6T2+ IT=ANY"],
    ["ldr"              , "Rd    , [Rn!=PC, #+/-ImmZ]{!}"               , "T32", "1111|100|0010|1|Rn|Rd|1PUW|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["ldr"              , "Rd    , [Rn==PC, #+/-ImmZ]"                  , "T32", "1111|100|0U10|1|Rn|Rd|ImmZ:12"                          , "ARMv6T2+ IT=ANY"],
    ["ldr"              , "Rd    , [Rn    , #+/-ImmZ]{!}"               , "A32", "Cond|010|PU0W|1|Rn|Rd|ImmZ:12"                          , "ARMv4+"],
    ["ldr"              , "Rd!=HI, [Rn!=HI, Rm!=HI]"                    , "T16", "0101|100|Rm:3|Rn:3|Rd:3"                                , "ARMv4T+  IT=ANY"],
    ["ldr"              , "Rd    , [Rn!=PC, Rm!=XX, {LSL #Shift}]"      , "T32", "1111|100|0010|1|Rn|Rd|0|00000|Shift:2|Rm"               , "ARMv6T2+ IT=ANY"],
    ["ldr"              , "Rd    , [Rn    , +/-Rm!=PC, {Sop #Shift}]{!}", "A32", "Cond|011|PU0W|1|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],

    ["ldrb"             , "Rd!=HI, [Rn!=HI, #ImmZ*4]"                   , "T16", "0111|1|ImmZ:5|Rn:3|Rd:3"                                , "ARMv4T+  IT=ANY"],
    ["ldrb"             , "Rd!=XX, [Rn!=PC, #ImmZ]"                     , "T32", "1111|100|0100|1|Rn|Rd|ImmZ:12"                          , "ARMv6T2+ IT=ANY"],
    ["ldrb"             , "Rd!=XX, [Rn!=PC, #+/-ImmZ]{!}"               , "T32", "1111|100|0000|1|Rn|Rd|1PUW|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["ldrb"             , "Rd!=XX, [Rn==PC, #+/-ImmZ]"                  , "T32", "1111|100|0U00|1|Rn|Rd|ImmZ:12"                          , "ARMv6T2+ IT=ANY"],
    ["ldrb"             , "Rd!=PC, [Rn    , #+/-ImmZ]{!}"               , "A32", "Cond|010|PU1W|1|Rn|Rd|ImmZ:12"                          , "ARMv4+"],
    ["ldrb"             , "Rd!=HI, [Rn!=HI, Rm!=HI]"                    , "T16", "0101|110|Rm:3|Rn:3|Rd:3"                                , "ARMv4T+  IT=ANY"],
    ["ldrb"             , "Rd!=XX, [Rn!=PC, Rm!=XX, {LSL #Shift}]"      , "T32", "1111|100|0000|1|Rn|Rd|0|00000|Shift:2|Rm"               , "ARMv6T2+ IT=ANY"],
    ["ldrb"             , "Rd!=PC, [Rn    , +/-Rm!=PC, {Sop #Shift}]{!}", "A32", "Cond|011|PU1W|1|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],

    ["ldrbt"            , "Rd!=XX, [Rn!=PC, #ImmZ]"                     , "T32", "1111|100|0000|1|Rn|Rd|1110|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["ldrbt"            , "Rd!=PC, [Rn!=PC, #+/-ImmZ]!"                 , "A32", "Cond|010|0U11|1|Rn|Rd|ImmZ:12"                          , "ARMv4+"],
    ["ldrbt"            , "Rd!=PC, [Rn!=PC, +/-Rm!=PC, {Sop #Shift}]!"  , "A32", "Cond|011|0U11|1|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],

    ["ldrd"             , "Rd!=XX, Rd2!=XX  , [Rn!=PC, #+/-ImmZ*4]{!}"  , "T32", "1110|100|PU1W|1|Rn|Rd|Rd2|ImmZ:8"                       , "ARMv6T2+ IT=ANY"],
    ["ldrd"             , "Rd!=XX, Rd2!=XX  , [Rn==PC, #+/-ImmZ*4]"     , "T32", "1110|100|PU10|1|Rn|Rd|Rd2|ImmZ:8"                       , "ARMv6T2+ IT=ANY"],
    ["ldrd"             , "Rd<=13, Rd2==Rd+1, [Rn    , #+/-ImmZ]{!}"    , "A32", "Cond|000|PU1W|0|Rn|Rd|ImmZ:4|1101|ImmZ:4"               , "ARMv5TE+"],
    ["ldrd"             , "Rd<=13, Rd2==Rd+1, [Rn    , +/-Rm]{!}"       , "A32", "Cond|000|PU0W|0|Rn|Rd|0000|1101|Rm"                     , "ARMv5TE+"],

    ["ldrex"            , "Rd!=XX, [Rn!=PC, #ImmZ*4]"                   , "T32", "1110|100|0010|1|Rn|Rd|1111|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["ldrex"            , "Rd!=PC, [Rn!=PC]"                            , "A32", "Cond|000|1100|1|Rn|Rd|1111|1001|1111"                   , "ARMv6+"],

    ["ldrexb"           , "Rd!=XX, [Rn!=PC]"                            , "T32", "1110|100|0110|1|Rn|Rd|1111|0100|1111"                   , "ARMv7+   IT=ANY"],
    ["ldrexb"           , "Rd!=PC, [Rn!=PC]"                            , "A32", "Cond|000|1110|1|Rn|Rd|1111|1001|1111"                   , "ARMv6K+"],

    ["ldrexd"           , "Rd!=XX, Rd2!=XX  , [Rn!=PC]"                 , "T32", "1110|100|0110|1|Rn|Rd|Rd2 |0111|1111"                   , "ARMv7+   IT=ANY"],
    ["ldrexd"           , "Rd<=13, Rd2==Rd+1, [Rn!=PC]"                 , "A32", "Cond|000|1101|1|Rn|Rd|1111|1001|1111"                   , "ARMv6K+"],

    ["ldrexh"           , "Rd!=XX, [Rn!=PC]"                            , "T32", "1110|100|0110|1|Rn|Rd|1111|0101|1111"                   , "ARMv7+   IT=ANY"],
    ["ldrexh"           , "Rd!=PC, [Rn!=PC]"                            , "A32", "Cond|000|1111|1|Rn|Rd|1111|1001|1111"                   , "ARMv6K+"],

    ["ldrh"             , "Rd!=HI, [Rn!=HI, #ImmZ*4]"                   , "T16", "1000|1|ImmZ:5|Rn:3|Rd:3"                                , "ARMv4T+  IT=ANY"],
    ["ldrh"             , "Rd!=XX, [Rn!=PC, #ImmZ]"                     , "T32", "1111|100|0101|1|Rn|Rd|ImmZ:12"                          , "ARMv6T2+ IT=ANY"],
    ["ldrh"             , "Rd!=XX, [Rn!=PC, #+/-ImmZ]{!}"               , "T32", "1111|100|0001|1|Rn|Rd|1PUW|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["ldrh"             , "Rd!=XX, [Rn==PC, #+/-ImmZ]"                  , "T32", "1111|100|0U01|1|Rn|Rd|ImmZ:12"                          , "ARMv6T2+ IT=ANY"],
    ["ldrh"             , "Rd!=PC, [Rn    , #+/-ImmZ]{!}"               , "A32", "Cond|000|PU1W|1|Rn|Rd|ImmZ:4|1011|ImmZ:4"               , "ARMv4+"],
    ["ldrh"             , "Rd!=HI, [Rn!=HI, Rm!=HI]"                    , "T16", "0101|101|Rm:3|Rn:3|Rd:3"                                , "ARMv4T+  IT=ANY"],
    ["ldrh"             , "Rd!=PC, [Rn    , +/-Rm!=PC]{!}"              , "A32", "Cond|000|PU0W|1|Rn|Rd|0000|1011|Rm"                     , "ARMv4+"],
    ["ldrh"             , "Rd!=XX, [Rn!=PC, Rm!=XX, {LSL #Shift}]"      , "T32", "1111|100|0001|1|Rn|Rd|0|00000|Shift:2|Rm"               , "ARMv6T2+ IT=ANY"],

    ["ldrht"            , "Rd!=XX, [Rn!=PC, #ImmZ]"                     , "T32", "1111|100|0001|1|Rn|Rd|1110|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["ldrht"            , "Rd!=PC, [Rn!=PC, #+/-ImmZ]!"                 , "A32", "Cond|000|0U11|1|Rn|Rd|ImmZ:4|1011|ImmZ:4"               , "ARMv6T2+"],
    ["ldrht"            , "Rd!=PC, [Rn!=PC, +/-Rm!=PC]!"                , "A32", "Cond|000|0U01|1|Rn|Rd|0000|1011|Rm"                     , "ARMv6T2+"],

    ["ldrsb"            , "Rd!=XX, [Rn!=PC, #ImmZ]"                     , "T32", "1111|100|1100|1|Rn|Rd|ImmZ:12"                          , "ARMv6T2+ IT=ANY"],
    ["ldrsb"            , "Rd!=XX, [Rn!=PC, #+/-ImmZ]{!}"               , "T32", "1111|100|1000|1|Rn|Rd|1PUW|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["ldrsb"            , "Rd!=XX, [Rn==PC, #+/-ImmZ]"                  , "T32", "1111|100|1U00|1|Rn|Rd|ImmZ:12"                          , "ARMv6T2+ IT=ANY"],
    ["ldrsb"            , "Rd!=PC, [Rn    , #+/-ImmZ]{!}"               , "A32", "Cond|000|PU1W|1|Rn|Rd|ImmZ:4|1101|ImmZ:4"               , "ARMv4+"],
    ["ldrsb"            , "Rd!=HI, [Rn!=HI, Rm!=HI]"                    , "T16", "0101|011|Rm:3|Rn:3|Rd:3"                                , "ARMv4T+  IT=ANY"],
    ["ldrsb"            , "Rd!=XX, [Rn!=PC, Rm!=XX, {LSL #Shift}]"      , "T32", "1111|100|1000|1|Rn|Rd|0|00000|Shift:2|Rm"               , "ARMv6T2+ IT=ANY"],
    ["ldrsb"            , "Rd!=PC, [Rn!=PC, +/-Rm!=PC]{!}"              , "A32", "Cond|000|PU0W|1|Rn|Rd|0000|1101|Rm"                     , "ARMv4+"],

    ["ldrsbt"           , "Rd!=XX, [Rn!=PC, #ImmZ]"                     , "T32", "1111|100|1000|1|Rn|Rd|1110|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["ldrsbt"           , "Rd!=PC, [Rn!=PC, #+/-ImmZ]!"                 , "A32", "Cond|000|0U11|1|Rn|Rd|ImmZ:4|1011|ImmZ:4"               , "ARMv6T2+"],
    ["ldrsbt"           , "Rd!=PC, [Rn!=PC, +/-Rm]!"                    , "A32", "Cond|000|0U01|1|Rn|Rd|0000|1011|Rm"                     , "ARMv6T2+"],

    ["ldrsh"            , "Rd!=XX, [Rn!=PC, #ImmZ]"                     , "T32", "1111|100|1101|1|Rn|Rd|ImmZ:12"                          , "ARMv6T2+ IT=ANY"],
    ["ldrsh"            , "Rd!=XX, [Rn!=PC, #+/-ImmZ]{!}"               , "T32", "1111|100|1001|1|Rn|Rd|1PUW|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["ldrsh"            , "Rd!=XX, [Rn==PC, #+/-ImmZ]"                  , "T32", "1111|100|1U01|1|Rn|Rd|ImmZ:12"                          , "ARMv6T2+ IT=ANY"],
    ["ldrsh"            , "Rd!=PC, [Rn    , #+/-ImmZ]{!}"               , "A32", "Cond|000|PU1W|1|Rn|Rd|ImmZ:4|1111|ImmZ:4"               , "ARMv4+"],
    ["ldrsh"            , "Rd!=HI, [Rn!=HI, Rm!=HI]"                    , "T16", "0101|111|Rm:3|Rn:3|Rd:3"                                , "ARMv4T+  IT=ANY"],
    ["ldrsh"            , "Rd!=XX, [Rn!=PC, Rm!=XX, {LSL #Shift}]"      , "T32", "1111|100|1001|1|Rn|Rd|0|00000|Shift:2|Rm"               , "ARMv6T2+ IT=ANY"],
    ["ldrsh"            , "Rd!=PC, [Rn    , +/-Rm!=PC]{!}"              , "A32", "Cond|000|PU0W|1|Rn|Rd|0000|1111|Rm"                     , "ARMv4+"],

    ["ldrsht"           , "Rd!=XX, [Rn!=PC, #ImmZ]"                     , "T32", "1111|100|1001|1|Rn|Rd|1110|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["ldrsht"           , "Rd!=PC, [Rn!=PC, #+/-ImmZ]!"                 , "A32", "Cond|000|0U11|1|Rn|Rd|ImmZ:4|1111|ImmZ:4"               , "ARMv6T2+"],
    ["ldrsht"           , "Rd!=PC, [Rn!=PC, +/-Rm!=PC]!"                , "A32", "Cond|000|0U01|1|Rn|Rd|0000|1111|Rm"                     , "ARMv6T2+"],

    ["ldrt"             , "Rd!=XX, [Rn!=PC, #ImmZ]"                     , "T32", "1111|100|0010|1|Rn|Rd|1110|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["ldrt"             , "Rd!=PC, [Rn!=PC, #+/-ImmZ]!"                 , "A32", "Cond|010|0U01|1|Rn|Rd|ImmZ:12"                          , "ARMv4+"],
    ["ldrt"             , "Rd!=PC, [Rn!=PC, +/-Rm!=PC, {Sop #Shift}]!"  , "A32", "Cond|011|0U01|1|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],

    ["lsl"              , "Rd!=HI, Rn!=HI, #Shift"                      , "T16", "0000|0|Shift:5|Rn:3|Rd:3"                               , "ARMv4T+  IT=IN"],
    ["lsls"             , "Rd!=HI, Rn!=HI, #Shift"                      , "T16", "0000|0|Shift:5|Rn:3|Rd:3"                               , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["lsl"              , "Rd!=XX, Rn!=XX, #Shift"                      , "T32", "1110|101|0010|0|1111|0|Shift:3|Rd|Shift:2|00|Rn"        , "ARMv6T2+ IT=ANY"],
    ["lsls"             , "Rd!=XX, Rn!=XX, #Shift"                      , "T32", "1110|101|0010|1|1111|0|Shift:3|Rd|Shift:2|00|Rn"        , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["lsl"              , "Rd    , Rn    , #Shift"                      , "A32", "Cond|000|1101|0|0000|Rd|Shift:5|000|Rn"                 , "ARMv4+"],
    ["lsls"             , "Rd    , Rn    , #Shift"                      , "A32", "Cond|000|1101|1|0000|Rd|Shift:5|000|Rn"                 , "ARMv4+ APSR.NZC=W"],
    ["lsl"              , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|000|010|Rm:3|Rx:3"                                 , "ARMv4T+  IT=IN"],
    ["lsls"             , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|000|010|Rm:3|Rx:3"                                 , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["lsl"              , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0000|0|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["lsls"             , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1110|101|0000|1|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["lsl"              , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1101|0|0000|Rd|Rm|0001|Rn"                     , "ARMv4+"],
    ["lsls"             , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1101|1|0000|Rd|Rm|0001|Rn"                     , "ARMv4+ APSR.NZC=W"],

    ["lsr"              , "Rd!=HI, Rn!=HI, #Shift"                      , "T16", "0000|1|Shift:5|Rn:3|Rd:3"                               , "ARMv4T+  IT=IN"],
    ["lsrs"             , "Rd!=HI, Rn!=HI, #Shift"                      , "T16", "0000|1|Shift:5|Rn:3|Rd:3"                               , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["lsr"              , "Rd!=XX, Rn!=XX, #Shift"                      , "T32", "1110|101|0010|0|1111|0|Shift:3|Rd|Shift:2|01|Rn"        , "ARMv6T2+ IT=ANY"],
    ["lsrs"             , "Rd!=XX, Rn!=XX, #Shift"                      , "T32", "1110|101|0010|1|1111|0|Shift:3|Rd|Shift:2|01|Rn"        , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["lsr"              , "Rd    , Rn    , #Shift"                      , "A32", "Cond|000|1101|0|0000|Rd|Shift:5|010|Rn"                 , "ARMv4+"],
    ["lsrs"             , "Rd    , Rn    , #Shift"                      , "A32", "Cond|000|1101|1|0000|Rd|Shift:5|010|Rn"                 , "ARMv4+ APSR.NZC=W"],
    ["lsr"              , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|000|011|Rm:3|Rx:3"                                 , "ARMv4T+  IT=IN"],
    ["lsrs"             , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|000|011|Rm:3|Rx:3"                                 , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["lsr"              , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0001|0|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["lsrs"             , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1110|101|0001|1|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["lsr"              , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1101|0|0000|Rd|Rm|0011|Rn"                     , "ARMv4+"],
    ["lsrs"             , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1101|1|0000|Rd|Rm|0011|Rn"                     , "ARMv4+ APSR.NZC=W"],

    ["isb"              , "#ImmZ"                                       , "T32", "1111|001|1101|1|1111|1000|1111|0110|ImmZ:4"             , "ARMv7+   IT=ANY"],

    ["mcr"              , "#CP, #Op1, Rs!=XX, Cn, Cm, {#Op2}"           , "T32", "1110|111|0|Op1:3|0|Cn:4|Rs|CP:4|Op2:3|1|Cm:4"           , "ARMv6T2+"],
    ["mcr"              , "#CP, #Op1, Rs!=PC, Cn, Cm, {#Op2}"           , "A32", "Cond|111|0|Op1:3|0|Cn:4|Rs|CP:4|Op2:3|1|Cm:4"           , "ARMv4+"],

    ["mcr2"             , "#CP, #Op1, Rs!=XX, Cn, Cm, {#Op2}"           , "T32", "1111|111|0|Op1:3|0|Cn:4|Rs|CP:4|Op2:3|1|Cm:4"           , "ARMv6T2+"],
    ["mcr2"             , "#CP, #Op1, Rs!=PC, Cn, Cm, {#Op2}"           , "A32", "1111|111|0|Op1:3|0|Cn:4|Rs|CP:4|Op2:3|1|Cm:4"           , "ARMv4+"],

    ["mcrr"             , "#CP, #Op1, Rs!=XX, Rs2!=XX, Cm"              , "T32", "1110|110|0010|0|Rs2|Rs|CP:4|Op1:4|Cm:4"                 , "ARMv6T2+"],
    ["mcrr"             , "#CP, #Op1, Rs!=PC, Rs2!=PC, Cm"              , "A32", "Cond|110|0010|0|Rs2|Rs|CP:4|Op1:4|Cm:4"                 , "ARMv5TE+"],

    ["mcrr2"            , "#CP, #Op1, Rs!=XX, Rs2!=XX, Cm"              , "T32", "1111|110|0010|0|Rs2|Rs|CP:4|Op1:4|Cm:4"                 , "ARMv6T2+"],
    ["mcrr2"            , "#CP, #Op1, Rs!=PC, Rs2!=PC, Cm"              , "A32", "1111|110|0010|0|Rs2|Rs|CP:4|Op1:4|Cm:4"                 , "ARMv5TE+"],

    ["mla"              , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1000|0|Rn|Ra|Rd|0000|Rm"                       , "ARMv6T2+ IT=ANY"],
    ["mla"              , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|000|0001|0|Rd|Ra|Rm|1001|Rn"                       , "ARMv4+"],
    ["mlas"             , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|000|0001|1|Rd|Ra|Rm|1001|Rn"                       , "ARMv4+ APSR.NZ=W"],

    ["mls"              , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1000|0|Rn|Ra|Rd|0001|Rm"                       , "ARMv6T2+ IT=ANY"],
    ["mls"              , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|000|0011|0|Rd|Ra|Rm|1001|Rn"                       , "ARMv6T2+"],

    ["mov"              , "Rd!=HI, #ImmZ"                               , "T16", "0010|0|Rd:3|ImmZ:8"                                     , "ARMv4T+  IT=IN"],
    ["movs"             , "Rd!=HI, #ImmZ"                               , "T16", "0010|0|Rd:3|ImmZ:8"                                     , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["mov"              , "Rd!=XX, #ImmC"                               , "T32", "1111|0|ImmC:1|0|0010|0|1111|0|ImmC:3|Rd|ImmC:8"         , "ARMv6T2+ IT=ANY"],
    ["movs"             , "Rd!=XX, #ImmC"                               , "T32", "1111|0|ImmC:1|0|0010|1|1111|0|ImmC:3|Rd|ImmC:8"         , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["mov"              , "Rd    , #ImmC"                               , "A32", "Cond|001|1101|0|0000|Rd|ImmC:12"                        , "ARMv4+"],
    ["movs"             , "Rd!=PC, #ImmC"                               , "A32", "Cond|001|1101|1|0000|Rd|ImmC:12"                        , "ARMv4+ APSR.NZC=W"],
    ["mov"              , "Rd    , Rn"                                  , "T16", "0100|0110|Rd:1|Rn:4|Rd:3"                               , "ARMv4T+  IT=IN  ARMv6T2_IF_LOW"],
    ["movs"             , "Rd!=HI, Rn!=HI"                              , "T16", "0000|000000|Rn:3|Rd:3"                                  , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["mov"              , "Rd!=PC, Rn"                                  , "T32", "1110|101|0010|0|1111|0000|Rd|0000|Rn"                   , "ARMv6T2+ IT=ANY UNPRED_COMPLEX"],
    ["movs"             , "Rd!=XX, Rn"                                  , "T32", "1110|101|0010|1|1111|0000|Rd|0000|Rn"                   , "ARMv6T2+ IT=ANY UNPRED_COMPLEX"],
    ["mov"              , "Rd!=HI, Rn!=HI, LSL #Shift"                  , "T16", "0000|0|Shift:5|Rn:3|Rd:3"                               , "ARMv4T+  IT=IN"],
    ["movs"             , "Rd!=HI, Rn!=HI, LSL #Shift"                  , "T16", "0000|0|Shift:5|Rn:3|Rd:3"                               , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["mov"              , "Rd!=HI, Rn!=HI, LSR #Shift"                  , "T16", "0000|1|Shift:5|Rn:3|Rd:3"                               , "ARMv4T+  IT=IN"],
    ["movs"             , "Rd!=HI, Rn!=HI, LSR #Shift"                  , "T16", "0000|1|Shift:5|Rn:3|Rd:3"                               , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["mov"              , "Rd!=HI, Rn!=HI, ASR #Shift"                  , "T16", "0001|0|Shift:5|Rn:3|Rd:3"                               , "ARMv4T+  IT=IN"],
    ["movs"             , "Rd!=HI, Rn!=HI, ASR #Shift"                  , "T16", "0001|0|Shift:5|Rn:3|Rd:3"                               , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["mov"              , "Rd!=XX, Rn!=XX, Sop #Shift"                  , "T32", "1110|101|0010|0|1111|0|Shift:3|Rd|Shift:2|Sop:2|Rn"     , "ARMv6T2+ IT=ANY"],
    ["movs"             , "Rd!=XX, Rn!=XX, Sop #Shift"                  , "T32", "1110|101|0010|1|1111|0|Shift:3|Rd|Shift:2|Sop:2|Rn"     , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["mov"              , "Rx!=HI, Rx!=HI, LSL Rm!=HI"                  , "T16", "0100|000|010|Rm:3|Rx:3"                                 , "ARMv4T+  IT=IN"],
    ["movs"             , "Rx!=HI, Rx!=HI, LSL Rm!=HI"                  , "T16", "0100|000|010|Rm:3|Rx:3"                                 , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["mov"              , "Rx!=HI, Rx!=HI, LSR Rm!=HI"                  , "T16", "0100|000|011|Rm:3|Rx:3"                                 , "ARMv4T+  IT=IN"],
    ["movs"             , "Rx!=HI, Rx!=HI, LSR Rm!=HI"                  , "T16", "0100|000|011|Rm:3|Rx:3"                                 , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["mov"              , "Rx!=HI, Rx!=HI, ASR Rm!=HI"                  , "T16", "0100|000|100|Rm:3|Rx:3"                                 , "ARMv4T+  IT=IN"],
    ["movs"             , "Rx!=HI, Rx!=HI, ASR Rm!=HI"                  , "T16", "0100|000|100|Rm:3|Rx:3"                                 , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["mov"              , "Rx!=HI, Rx!=HI, ROR Rm!=HI"                  , "T16", "0100|000|111|Rm:3|Rx:3"                                 , "ARMv4T+  IT=IN"],
    ["movs"             , "Rx!=HI, Rx!=HI, ROR Rm!=HI"                  , "T16", "0100|000|111|Rm:3|Rx:3"                                 , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["mov"              , "Rd!=XX, Rn!=XX, Sop Rm!=XX"                  , "T32", "1111|101|00|Sop:2|0|Rn|1111|Rd|0000|Rm"                 , "ARMv6T2+ IT=ANY"],
    ["movs"             , "Rd!=XX, Rn!=XX, Sop Rm!=XX"                  , "T32", "1110|101|00|Sop:2|1|Rn|1111|Rd|0000|Rm"                 , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["mov"              , "Rd    , Rn    , {Sop #Shift}"                , "A32", "Cond|000|1101|0|0000|Rd|Shift:5|Sop:2|0|Rn"             , "ARMv4+"],
    ["movs"             , "Rd!=PC, Rn    , {Sop #Shift}"                , "A32", "Cond|000|1101|1|0000|Rd|Shift:5|Sop:2|0|Rn"             , "ARMv4+ APSR.NZC=W"],
    ["mov"              , "Rd    , Rn    , Sop Rs"                      , "A32", "Cond|000|1101|0|0000|Rd|Rs|0|Sop:2|1|Rn"                , "ARMv4+"],
    ["movs"             , "Rd!=PC, Rn    , Sop Rs"                      , "A32", "Cond|000|1101|1|0000|Rd|Rs|0|Sop:2|1|Rn"                , "ARMv4+ APSR.NZC=W"],

    ["movt"             , "Rx!=XX, #ImmZ"                               , "T32", "1111|0|ImmZ:1|1|0110|0|ImmZ:4|0|ImmZ:3|Rx|ImmZ:8"       , "ARMv6T2+ IT=ANY"],
    ["movt"             , "Rx!=PC, #ImmZ"                               , "A32", "Cond|001|1010|0|ImmZ:4|Rx|ImmZ:12"                      , "ARMv6T2+"],

    ["movw"             , "Rd!=XX, #ImmZ"                               , "T32", "1111|0|ImmZ:1|1|0010|0|ImmZ:4|0|ImmZ:3|Rd|ImmZ:8"       , "ARMv6T2+ IT=ANY"],
    ["movw"             , "Rd!=PC, #ImmZ"                               , "A32", "Cond|001|1000|0|ImmZ:4|Rd|ImmZ:12"                      , "ARMv6T2+"],

    ["mrc"              , "#CP, #Op1, Rd!=XX, Cn, Cm, {#Op2}"           , "T32", "1110|111|0|Op1:3|1|Cn:4|Rd|CP:4|Op2:3|1|Cm:4"           , "ARMv4+"],
    ["mrc"              , "#CP, #Op1, Rd!=PC, Cn, Cm, {#Op2}"           , "A32", "Cond|111|0|Op1:3|1|Cn:4|Rd|CP:4|Op2:3|1|Cm:4"           , "ARMv4+"],

    ["mrc2"             , "#CP, #Op1, Rd!=XX, Cn, Cm, {#Op2}"           , "T32", "1111|111|0|Op1:3|1|Cn:4|Rd|CP:4|Op2:3|1|Cm:4"           , "ARMv4+"],
    ["mrc2"             , "#CP, #Op1, Rd!=PC, Cn, Cm, {#Op2}"           , "A32", "1111|111|0|Op1:3|1|Cn:4|Rd|CP:4|Op2:3|1|Cm:4"           , "ARMv4+"],

    ["mrrc"             , "#CP, #Op1, Rd!=XX, Rd2!=Rd, Cm"              , "T32", "1110|110|0010|1|Rd2|Rd|CP:4|Op1:4|Cm:4"                 , "ARMv5TE+"],
    ["mrrc"             , "#CP, #Op1, Rd!=PC, Rd2!=Rd, Cm"              , "A32", "Cond|110|0010|1|Rd2|Rd|CP:4|Op1:4|Cm:4"                 , "ARMv5TE+"],

    ["mrrc2"            , "#CP, #Op1, Rd!=XX, Rd2!=Rd, Cm"              , "T32", "1111|110|0010|1|Rd2|Rd|CP:4|Op1:4|Cm:4"                 , "ARMv5TE+"],
    ["mrrc2"            , "#CP, #Op1, Rd!=PC, Rd2!=Rd, Cm"              , "A32", "1111|110|0010|1|Rd2|Rd|CP:4|Op1:4|Cm:4"                 , "ARMv5TE+"],

    ["mrs"              , "Rd!=XX, #APSR"                               , "T32", "1111|001|1111|0|1111|1000|Rd|0000|0000"                 , "ARMv6T2+ IT=ANY"],
    ["mrs"              , "Rd!=PC, #APSR"                               , "A32", "Cond|000|1000|0|1111|Rd|0000|0000|0000"                 , "ARMv4+"],

    ["msr"              , "#APSR, #ImmA"                                , "A32", "Cond|001|1001|0|APSR:2|00|1111|ImmA:12"                 , "ARMv4+"],
    ["msr"              , "#APSR, Rn!=PC"                               , "T32", "1111|001|1100|0|Rn|1100|APSR:2|00|0000|0000"            , "ARMv6T2+ IT=ANY"],
    ["msr"              , "#APSR, Rn!=PC"                               , "A32", "Cond|000|1001|0|APSR:2|00|1111|0000|0000|Rn"            , "ARMv4+"],

    ["mul"              , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|001|101|Rm:3|Rx:3"                                 , "ARMv4T+  IT=IN"],
    ["muls"             , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|001|101|Rm:3|Rx:3"                                 , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["mul"              , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|1000|0|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["mul"              , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|0000|0|Rd|0000|Rm|1001|Rn"                     , "ARMv4+"],
    ["muls"             , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|0000|1|Rd|0000|Rm|1001|Rn"                     , "ARMv4+"],

    ["mvn"              , "Rd!=XX, #ImmC"                               , "T32", "1111|0|ImmC:1|0|0011|0|1111|0|ImmC:3|Rd|ImmC:8"         , "ARMv6T2+ IT=ANY"],
    ["mvns"             , "Rd!=XX, #ImmC"                               , "T32", "1111|0|ImmC:1|0|0011|1|1111|0|ImmC:3|Rd|ImmC:8"         , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["mvn"              , "Rd    , #ImmC"                               , "A32", "Cond|001|1111|0|0000|Rd|ImmC:12"                        , "ARMv4+"],
    ["mvns"             , "Rd!=PC, #ImmC"                               , "A32", "Cond|001|1111|1|0000|Rd|ImmC:12"                        , "ARMv4+ APSR.NZC=W"],
    ["mvn"              , "Rd!=HI, Rn!=HI"                              , "T16", "0100|001|111|Rm:3|Rd:3"                                 , "ARMv4T+  IT=IN"],
    ["mvns"             , "Rd!=HI, Rn!=HI"                              , "T16", "0100|001|111|Rm:3|Rd:3"                                 , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["mvn"              , "Rd!=XX, Rn!=XX, {Sop #Shift}"                , "T32", "1110|101|0011|0|1111|0|Shift:3|Rd|Shift:2|Sop:2|Rn"     , "ARMv6T2+ IT=ANY"],
    ["mvns"             , "Rd!=XX, Rn!=XX, {Sop #Shift}"                , "T32", "1110|101|0011|1|1111|0|Shift:3|Rd|Shift:2|Sop:2|Rn"     , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["mvn"              , "Rd    , Rn    , {Sop #Shift}"                , "A32", "Cond|000|1111|0|0000|Rd|Shift:5|Sop:2|0|Rn"             , "ARMv4+"],
    ["mvns"             , "Rd!=PC, Rn    , {Sop #Shift}"                , "A32", "Cond|000|1111|1|0000|Rd|Shift:5|Sop:2|0|Rn"             , "ARMv4+ APSR.NZC=W"],
    ["mvn"              , "Rd!=PC, Rn!=PC, Sop Rs!=PC"                  , "A32", "Cond|000|1111|0|0000|Rd|Rs|0|Sop:2|1|Rn"                , "ARMv4+"],
    ["mvns"             , "Rd!=PC, Rn!=PC, Sop Rs!=PC"                  , "A32", "Cond|000|1111|1|0000|Rd|Rs|0|Sop:2|1|Rn"                , "ARMv4+ APSR.NZC=W"],

    ["nop"              , ""                                            , "T16", "1011|111|1000|0|0000"                                   , "ARMv6T2+ IT=ANY"],
    ["nop"              , ""                                            , "T32", "1111|001|1101|0|1111|1000|0000|0000|0000"               , "ARMv6T2+ IT=ANY"],
    ["nop"              , ""                                            , "A32", "Cond|001|1001|0|0000|1111|0000|0000|0000"               , "ARMv6K+"],

    ["orn"              , "Rd!=XX, Rn!=XX, #ImmC"                       , "T32", "1111|0|ImmC:1|0|0011|0|Rn|0|ImmC:3|Rd|ImmC:8"           , "ARMv6T2+ IT=ANY"],
    ["orns"             , "Rd!=XX, Rn!=XX, #ImmC"                       , "T32", "1111|0|ImmC:1|0|0011|1|Rn|0|ImmC:3|Rd|ImmC:8"           , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["orn"              , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|0011|0|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY"],
    ["orns"             , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|0011|1|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY APSR.NZC=W"],

    ["orr"              , "Rd!=XX, Rn!=XX, #ImmC"                       , "T32", "1111|0|ImmC:1|0|0010|0|Rn|0|ImmC:3|Rd|ImmC:8"           , "ARMv6T2+ IT=ANY"],
    ["orrs"             , "Rd!=XX, Rn!=XX, #ImmC"                       , "T32", "1111|0|ImmC:1|0|0010|1|Rn|0|ImmC:3|Rd|ImmC:8"           , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["orr"              , "Rd    , Rn    , #ImmC"                       , "A32", "Cond|001|1100|0|Rn|Rd|ImmC:12"                          , "ARMv4+"],
    ["orrs"             , "Rd!=PC, Rn    , #ImmC"                       , "A32", "Cond|001|1100|1|Rn|Rd|ImmC:12"                          , "ARMv4+ APSR.NZC=W"],
    ["orr"              , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|001|100|Rm:3|Rx:3"                                 , "ARMv4T+  IT=IN"],
    ["orrs"             , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|001|100|Rm:3|Rx:3"                                 , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["orr"              , "Rd    , Rn    , Rm    , {Sop #Shift}"        , "A32", "Cond|000|1100|0|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],
    ["orrs"             , "Rd!=PC, Rn    , Rm    , {Sop #Shift}"        , "A32", "Cond|000|1100|1|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+ APSR.NZC=W"],
    ["orr"              , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|0010|0|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY"],
    ["orrs"             , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|0010|1|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["orr"              , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|1100|0|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+"],
    ["orrs"             , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|1100|1|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+ APSR.NZC=W"],

    ["pkhbt"            , "Rd!=XX, Rn!=XX, Rm!=XX, {LSL #Shift}"        , "T32", "1110|101|0110|0|Rn|0|Shift:3|Rd|Shift:2|00|Rm"          , "ARMv6T2+ IT=ANY"],
    ["pkhbt"            , "Rd!=PC, Rn!=PC, Rm!=PC, {LSL #Shift}"        , "A32", "Cond|011|0100|0|Rn|Rd|Shift:5|0|01|Rm"                  , "ARMv6+"],

    ["pkhtb"            , "Rd!=XX, Rn!=XX, Rm!=XX, {ASR #Shift}"        , "T32", "1110|101|0110|0|Rn|0|Shift:3|Rd|Shift:2|10|Rm"          , "ARMv6T2+ IT=ANY"],
    ["pkhtb"            , "Rd!=PC, Rn!=PC, Rm!=PC, {ASR #Shift}"        , "A32", "Cond|011|0100|0|Rn|Rd|Shift:5|1|01|Rm"                  , "ARMv6+"],

    ["pld"              , "[Rn!=PC, #ImmZ]"                             , "T32", "1111|100|0100|1|Rn|1111|ImmZ:12"                        , "ARMv6T2+ IT=ANY"],
    ["pld"              , "[Rn!=PC, #-ImmZ]"                            , "T32", "1111|100|0000|1|Rn|1111|1100|ImmZ:8"                    , "ARMv6T2+ IT=ANY"],
    ["pld"              , "[Rn==PC, #+/-ImmZ]"                          , "T32", "1111|100|0U00|1|1111|1111|ImmZ:12"                      , "ARMv6T2+ IT=ANY"],
    ["pld"              , "[Rn    , #+/-ImmZ]"                          , "A32", "1111|010|1U10|1|Rn|1111|ImmZ:12"                        , "ARMv5TE+"],
    ["pld"              , "[Rn!=PC,    Rm!=XX, {LSL #Shift}]"           , "T32", "1111|100|0000|1|Rn|1111|0000|00|Shift:2|Rm"             , "ARMv6T2+ IT=ANY"],
    ["pld"              , "[Rn    , +/-Rm!=PC, {Sop #Shift}]"           , "A32", "1111|011|1U10|1|Rn|1111|Shift:5|Sop:2|0|Rm"             , "ARMv5TE+"],

    ["pldw"             , "[Rn!=PC, #ImmZ]"                             , "T32", "1111|100|0101|1|Rn|1111|ImmZ:12"                        , "ARMv6T2+ IT=ANY"],
    ["pldw"             , "[Rn!=PC, #-ImmZ]"                            , "T32", "1111|100|0001|1|Rn|1111|1100|ImmZ:8"                    , "ARMv6T2+ IT=ANY"],
    ["pldw"             , "[Rn    , #+/-ImmZ]"                          , "A32", "1111|010|1U00|1|Rn|1111|ImmZ:12"                        , "ARMv7+ MP"],
    ["pldw"             , "[Rn!=PC,    Rm!=XX, {LSL #Shift}]"           , "T32", "1111|100|0001|1|Rn|1111|0000|00|Shift:2|Rm"             , "ARMv6T2+ IT=ANY"],
    ["pldw"             , "[Rn    , +/-Rm!=PC, {Sop #Shift}]"           , "A32", "1111|011|1U00|1|Rn|1111|Shift:5|Sop:2|0|Rm"             , "ARMv7+ MP"],

    ["pli"              , "[Rn!=PC, #ImmZ]"                             , "T32", "1111|100|1100|1|Rn|1111|ImmZ:12"                        , "ARMv7+   IT=ANY"],
    ["pli"              , "[Rn!=PC, #-ImmZ]"                            , "T32", "1111|100|1000|1|Rn|1111|1100|ImmZ:8"                    , "ARMv7+   IT=ANY"],
    ["pli"              , "[Rn==PC, #+/-ImmZ]"                          , "T32", "1111|100|1U00|1|1111|1111|ImmZ:12"                      , "ARMv7+   IT=ANY"],
    ["pli"              , "[Rn    , #+/-ImmZ]"                          , "A32", "1111|010|0U10|1|Rn|1111|ImmZ:12"                        , "ARMv7+"],
    ["pli"              , "[Rn!=PC,    Rm!=XX, {LSL #Shift}]"           , "T32", "1111|100|1000|1|Rn|1111|0000|00|Shift:2|Rm"             , "ARMv7+   IT=ANY"],
    ["pli"              , "[Rn    , +/-Rm!=PC, {Sop #Shift}]"           , "A32", "1111|011|0U10|1|Rn|1111|Shift:5|Sop:2|0|Rm"             , "ARMv7+"],

    ["pop"              , "Rd!=SP"                                      , "T32", "1111|100|0010|1|1101|Rd|1011|00000100"                  , "ARMv6T2+ IT=ANY"],
    ["pop"              , "Rd!=SP"                                      , "A32", "Cond|010|0100|1|1101|Rd|0000|0000|0100"                 , "ARMv4+"],
    ["pop"              , "RdList"                                      , "T16", "1011|110|RdList[15]|RdList[7:0]"                        , "ARMv4T+  IT=ANY"],
    ["pop"              , "RdList"                                      , "T32", "1110|100|0101|1|1101|RdList[15:14]|0|RdList[12:0]"      , "ARMv6T2+ IT=ANY"],
    ["pop"              , "RdList"                                      , "A32", "Cond|100|0101|1|1101|RdList:16"                         , "ARMv4+"],

    ["push"             , "Rs!=XX"                                      , "T32", "1111|100|0010|0|1101|Rs|1101|0000|0100"                 , "ARMv6T2+ IT=ANY"],
    ["push"             , "Rs!=SP"                                      , "A32", "Cond|010|1001|0|1101|Rs|0000|0000|0100"                 , "ARMv4+"],
    ["push"             , "RsList"                                      , "T16", "1011|010|RsList[14]|RsList[7:0]"                        , "ARMv4T+  IT=ANY"],
    ["push"             , "RsList"                                      , "T32", "1110|100|0101|0|1101|0|RsList[14]|0|RsList[12:0]"       , "ARMv6T2+ IT=ANY"],
    ["push"             , "RsList"                                      , "A32", "Cond|100|1001|0|1101|RsList:16"                         , "ARMv4+"],

    ["qadd"             , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0100|0|Rm|1111|Rd|1000|Rn"                     , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["qadd"             , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1000|0|Rm|Rd|0000|0101|Rn"                     , "ARMv5TE+ APSR.Q=X"],

    ["qadd16"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0100|1|Rm|1111|Rd|0001|Rn"                     , "ARMv6T2+ IT=ANY"],
    ["qadd16"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0001|0|Rn|Rd|1111|0001|Rm"                     , "ARMv6+"],

    ["qadd8"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0100|0|Rm|1111|Rd|0001|Rn"                     , "ARMv6T2+ IT=ANY"],
    ["qadd8"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0001|0|Rn|Rd|1111|1001|Rm"                     , "ARMv6+"],

    ["qasx"             , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0101|0|Rm|1111|Rd|0001|Rn"                     , "ARMv6T2+ IT=ANY"],
    ["qasx"             , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0001|0|Rn|Rd|1111|0011|Rm"                     , "ARMv6+"],

    ["qdadd"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0100|0|Rm|1111|Rd|1001|Rn"                     , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["qdadd"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1010|0|Rm|Rd|0000|0101|Rn"                     , "ARMv5TE+ APSR.Q=X"],

    ["qdsub"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0100|0|Rm|1111|Rd|1011|Rn"                     , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["qdsub"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1011|0|Rm|Rd|0000|0101|Rn"                     , "ARMv5TE+ APSR.Q=X"],

    ["qsax"             , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0111|0|Rm|1111|Rd|0001|Rn"                     , "ARMv6T2+ IT=ANY"],
    ["qsax"             , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0001|0|Rn|Rd|1111|0101|Rm"                     , "ARMv6+"],

    ["qsub"             , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0100|0|Rm|1111|Rd|1010|Rn"                     , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["qsub"             , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1001|0|Rm|Rd|0000|0101|Rn"                     , "ARMv5TE+ APSR.Q=X"],

    ["qsub16"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0110|1|Rm|1111|Rd|0001|Rn"                     , "ARMv6T2+ IT=ANY"],
    ["qsub16"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0001|0|Rn|Rd|1111|0111|Rm"                     , "ARMv6+"],

    ["qsub8"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0110|0|Rm|1111|Rd|0001|Rn"                     , "ARMv6T2+ IT=ANY"],
    ["qsub8"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0001|0|Rn|Rd|1111|1111|Rm"                     , "ARMv6+"],

    ["rbit"             , "Rd!=XX, Rn!=XX"                              , "T32", "1111|101|0100|1|Rm|1111|Rd|1010|Rn"                     , "ARMv6T2+ IT=ANY"],
    ["rbit"             , "Rd!=PC, Rn!=PC"                              , "A32", "Cond|011|0111|1|1111|Rd|1111|0011|Rn"                   , "ARMv6T2+"],

    ["rev"              , "Rd!=HI, Rn!=HI"                              , "T16", "1011|101|000|Rn:3|Rd:3"                                 , "ARMv6T+  IT=ANY"],
    ["rev"              , "Rd!=XX, Rn!=XX"                              , "T32", "1111|101|0100|1|Rm|1111|Rd|1000|Rn"                     , "ARMv6T2+ IT=ANY"],
    ["rev"              , "Rd!=PC, Rn!=PC"                              , "A32", "Cond|011|0101|1|1111|Rd|1111|0011|Rn"                   , "ARMv6+"],

    ["rev16"            , "Rd!=HI, Rn!=HI"                              , "T16", "1011|101|001|Rn:3|Rd:3"                                 , "ARMv6T+  IT=ANY"],
    ["rev16"            , "Rd!=XX, Rn!=XX"                              , "T32", "1111|101|0100|1|Rm|1111|Rd|1001|Rn"                     , "ARMv6T2+ IT=ANY"],
    ["rev16"            , "Rd!=PC, Rn!=PC"                              , "A32", "Cond|011|0101|1|1111|Rd|1111|1011|Rn"                   , "ARMv6+"],

    ["revsh"            , "Rd!=HI, Rn!=HI"                              , "T16", "1011|101|011|Rn:3|Rd:3"                                 , "ARMv6T+  IT=ANY"],
    ["revsh"            , "Rd!=XX, Rn!=XX"                              , "T32", "1111|101|0100|1|Rm|1111|Rd|1011|Rn"                     , "ARMv6T2+ IT=ANY"],
    ["revsh"            , "Rd!=PC, Rn!=PC"                              , "A32", "Cond|011|0111|1|1111|Rd|1111|1011|Rn"                   , "ARMv6+"],

    ["rfe"              , "[Rn!=PC]{!}"                                 , "A32", "1111|100|010|W|1|Rn|0000|1010|0000|0000"                , "ARMv6+ CSPR=W"],
    ["rfeda"            , "[Rn!=PC]{!}"                                 , "A32", "1111|100|000|W|1|Rn|0000|1010|0000|0000"                , "ARMv6+ CSPR=W"],
    ["rfedb"            , "[Rn!=PC]{!}"                                 , "A32", "1111|100|100|W|1|Rn|0000|1010|0000|0000"                , "ARMv6+ CSPR=W"],
    ["rfeib"            , "[Rn!=PC]{!}"                                 , "A32", "1111|100|110|W|1|Rn|0000|1010|0000|0000"                , "ARMv6+ CSPR=W"],

    ["ror"              , "Rd!=XX, Rn!=XX, #Shift"                      , "T32", "1110|101|0010|0|1111|0|Shift:3|Rd|Shift:2|11|Rn"        , "ARMv6T2+ IT=ANY"],
    ["rors"             , "Rd!=XX, Rn!=XX, #Shift"                      , "T32", "1110|101|0010|1|1111|0|Shift:3|Rd|Shift:2|11|Rn"        , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["ror"              , "Rd    , Rn    , #Shift"                      , "A32", "Cond|000|1101|0|0000|Rd|Shift:5|110|Rn"                 , "ARMv4+"],
    ["rors"             , "Rd    , Rn    , #Shift"                      , "A32", "Cond|000|1101|1|0000|Rd|Shift:5|110|Rn"                 , "ARMv4+ APSR.NZC=W"],
    ["ror"              , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|000|111|Rm:3|Rx:3"                                 , "ARMv4T+  IT=IN"],
    ["rors"             , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|000|111|Rm:3|Rx:3"                                 , "ARMv4T+  IT=OUT APSR.NZC=W"],
    ["ror"              , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0011|0|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["rors"             , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0011|1|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["ror"              , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1101|0|0000|Rd|Rm|0111|Rn"                     , "ARMv4+"],
    ["rors"             , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1101|1|0000|Rd|Rm|0111|Rn"                     , "ARMv4+ APSR.NZC=W"],

    ["rsb"              , "Rd!=HI, Rn!=HI, #0"                          , "T16", "0100|001001|Rn:3|Rd:3"                                  , "ARMv4T+  IT=IN"],
    ["rsbs"             , "Rd!=HI, Rn!=HI, #0"                          , "T16", "0100|001001|Rn:3|Rd:3"                                  , "ARMv4T+  IT=OUT APSR.NZCV=W"],
    ["rsb"              , "Rd!=XX, Rn!=XX, #ImmA"                       , "T32", "1111|0|ImmA:1|0|1110|0|Rn|0|ImmA:3|Rd|ImmA:8"           , "ARMv6T2+ IT=ANY"],
    ["rsbs"             , "Rd!=XX, Rn!=XX, #ImmA"                       , "T32", "1111|0|ImmA:1|0|1110|1|Rn|0|ImmA:3|Rd|ImmA:8"           , "ARMv6T2+ IT=ANY APSR.NZCV=W"],
    ["rsb"              , "Rd    , Rn    , #ImmA"                       , "A32", "Cond|001|0011|0|Rn|Rd|ImmA:12"                          , "ARMv4+"],
    ["rsbs"             , "Rd!=PC, Rn    , #ImmA"                       , "A32", "Cond|001|0011|1|Rn|Rd|ImmA:12"                          , "ARMv4+ APSR.NZCV=W"],
    ["rsb"              , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|1110|0|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY"],
    ["rsbs"             , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|1110|1|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY APSR.NZCV=W"],
    ["rsb"              , "Rd    , Rn    , Rm    , {Sop #Shift}"        , "A32", "Cond|000|0011|0|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],
    ["rsbs"             , "Rd!=PC, Rn    , Rm    , {Sop #Shift}"        , "A32", "Cond|000|0011|1|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+ APSR.NZCV=W"],
    ["rsb"              , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|0011|0|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+"],
    ["rsbs"             , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|0011|1|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+ APSR.NZCV=W"],

    ["rsc"              , "Rd    , Rn, #ImmA"                           , "A32", "Cond|001|0111|0|Rn|Rd|ImmA:12"                          , "ARMv4+"],
    ["rscs"             , "Rd!=PC, Rn, #ImmA"                           , "A32", "Cond|001|0111|1|Rn|Rd|ImmA:12"                          , "ARMv4+ APSR.NZCV=W"],
    ["rsc"              , "Rd    , Rn, Rm, {Sop #Shift}"                , "A32", "Cond|000|0111|0|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],
    ["rscs"             , "Rd!=PC, Rn, Rm, {Sop #Shift}"                , "A32", "Cond|000|0111|1|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+ APSR.NZCV=W"],
    ["rsc"              , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|0111|0|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+"],
    ["rscs"             , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|0111|1|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+ APSR.NZCV=W"],

    ["rrx"              , "Rd!=XX, Rn!=XX"                              , "T32", "1110|101|0010|0|1111|0000|Rd|0011|Rn"                   , "ARMv6T2+ IT=ANY"],
    ["rrxs"             , "Rd!=XX, Rn!=XX"                              , "T32", "1110|101|0010|1|1111|0000|Rd|0011|Rn"                   , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["rrx"              , "Rd    , Rn"                                  , "A32", "Cond|000|1101|0|0000|Rd|00000|110|Rn"                   , "ARMv4+"],
    ["rrxs"             , "Rd    , Rn"                                  , "A32", "Cond|000|1101|1|0000|Rd|00000|110|Rn"                   , "ARMv4+ APSR.NZ=W APSR.C=X"],

    ["sadd16"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0100|1|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY APSR.GE=W"],
    ["sadd16"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0000|1|Rn|Rd|1111|0001|Rm"                     , "ARMv6+ APSR.GE=W"],

    ["sadd8"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0100|0|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY APSR.GE=W"],
    ["sadd8"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0000|1|Rn|Rd|1111|1001|Rm"                     , "ARMv6+ APSR.GE=W"],

    ["sasx"             , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0101|0|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY APSR.GE=W"],
    ["sasx"             , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0000|1|Rn|Rd|1111|0011|Rm"                     , "ARMv6+ APSR.GE=W"],

    ["sbc"              , "Rd!=XX, Rn!=XX, #ImmA"                       , "T32", "1111|0|ImmA:1|0|1011|0|Rn|0|ImmA:3|Rd|ImmA:8"           , "ARMv6T2+ IT=ANY"],
    ["sbcs"             , "Rd!=XX, Rn!=XX, #ImmA"                       , "T32", "1111|0|ImmA:1|0|1011|1|Rn|0|ImmA:3|Rd|ImmA:8"           , "ARMv6T2+ IT=ANY APSR.NZCV=W"],
    ["sbc"              , "Rd    , Rn    , #ImmA"                       , "A32", "Cond|001|0110|0|Rn|Rd|ImmA:12"                          , "ARMv4+"],
    ["sbcs"             , "Rd!=PC, Rn    , #ImmA"                       , "A32", "Cond|001|0110|1|Rn|Rd|ImmA:12"                          , "ARMv4+ APSR.NZCV=W"],
    ["sbc"              , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|000|110|Rm:3|Rx:3"                                 , "ARMv4T+  IT=IN"],
    ["sbcs"             , "Rx!=HI, Rx!=HI, Rm!=HI"                      , "T16", "0100|000|110|Rm:3|Rx:3"                                 , "ARMv4T+  IT=OUT APSR.NZCV=W"],
    ["sbc"              , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|1011|0|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY"],
    ["sbcs"             , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|1011|1|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY"],
    ["sbc"              , "Rd    , Rn    , Rm    , {Sop #Shift}"        , "A32", "Cond|000|0110|0|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],
    ["sbcs"             , "Rd!=PC, Rn    , Rm    , {Sop #Shift}"        , "A32", "Cond|000|0110|1|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+ APSR.NZCV=W"],
    ["sbc"              , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|0110|0|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+"],
    ["sbcs"             , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|0110|1|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+ APSR.NZCV=W"],

    ["sbfx"             , "Rd!=XX, Rn!=XX, #LSB, #Width!=0"             , "T32", "1111|001|1010|0|Rn|0|LSB:3|Rd|LSB:2|0|Width-1:5"        , "ARMv6T2+ IT=ANY"],
    ["sbfx"             , "Rd!=PC, Rn!=PC, #LSB, #Width"                , "A32", "Cond|011|1101|Width-1:5|Rd|LSB:5|101|Rn"                , "ARMv6T2+"],

    ["sdiv"             , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|1100|1|Rn|1111|Rd|1111|Rm"                     , "IDIVT    IT=ANY"],
    ["sdiv"             , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|1000|1|Rd|1111|Rm|0001|Rn"                     , "IDIVA"],

    ["sel"              , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0101|0|Rn|1111|Rd|1000|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["sel"              , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0100|0|Rn|Rd|1111|1011|Rm"                     , "ARMv6+ APSR.GE=R"],

    ["setend"           , "#ImmZ"                                       , "T16", "1011|0110|010|1|ImmZ:1|000"                             , "ARMv6+   IT=OUT"],
    ["setend"           , "#ImmZ"                                       , "A32", "1111|000|1000|0|0001|0000|00|ImmZ:1|0|0000|0000"        , "ARMv6+ ARMv8-"],

    ["sev"              , ""                                            , "T16", "1011|1111|0100|0000"                                    , "ARMv6T2+ IT=ANY"],
    ["sev"              , ""                                            , "T32", "1111|001|1101|0|1111|1000|0000|00000000"                , "ARMv6T2+ IT=ANY"],
    ["sev"              , ""                                            , "A32", "Cond|001|1001|0|0000|1111|0000|0000|0100"               , "ARMv7+ ARMv6K"],

    ["sevl"             , ""                                            , "A32", "Cond|001|1001|0|0000|1111|0000|0000|0101"               , "?"],

    ["shadd16"          , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0100|1|Rn|1111|Rd|0010|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["shadd16"          , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0001|1|Rn|Rd|1111|0001|Rm"                     , "ARMv6+"],

    ["shadd8"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0100|0|Rn|1111|Rd|0010|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["shadd8"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0001|1|Rn|Rd|1111|1001|Rm"                     , "ARMv6+"],

    ["shasx"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0101|0|Rn|1111|Rd|0010|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["shasx"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0001|1|Rn|Rd|1111|0011|Rm"                     , "ARMv6+"],

    ["shsax"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0111|0|Rn|1111|Rd|0010|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["shsax"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0001|1|Rn|Rd|1111|0101|Rm"                     , "ARMv6+"],

    ["shsub16"          , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0110|1|Rn|1111|Rd|0010|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["shsub16"          , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0001|1|Rn|Rd|1111|0111|Rm"                     , "ARMv6+"],

    ["shsub8"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0110|0|Rn|1111|Rd|0010|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["shsub8"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0001|1|Rn|Rd|1111|1111|Rm"                     , "ARMv6+"],

    ["smc"              , "#ImmZ"                                       , "A32", "Cond|000|1|0|0|1|0|0000|0000|0000|0111|ImmZ:4"          , "SECURITY"],

    ["smlabb"           , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1001|1|Rn|Ra|Rd|0000|Rm"                       , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["smlabb"           , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|000|1000|0|Rd|Ra|Rm|1000|Rn"                       , "ARMv5TE+ APSR.Q=X"],

    ["smlabt"           , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1001|1|Rn|Ra|Rd|0001|Rm"                       , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["smlabt"           , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|000|1000|0|Rd|Ra|Rm|1100|Rn"                       , "ARMv5TE+ APSR.Q=X"],

    ["smlatb"           , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1001|1|Rn|Ra|Rd|0010|Rm"                       , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["smlatb"           , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|000|1000|0|Rd|Ra|Rm|1010|Rn"                       , "ARMv5TE+ APSR.Q=X"],

    ["smlatt"           , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1001|1|Rn|Ra|Rd|0011|Rm"                       , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["smlatt"           , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|000|1000|0|Rd|Ra|Rm|1110|Rn"                       , "ARMv5TE+ APSR.Q=X"],

    ["smlad"            , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1001|0|Rn|Ra|Rd|0000|Rm"                       , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["smlad"            , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|011|1000|0|Rd|Ra|Rm|0001|Rn"                       , "ARMv6+ APSR.Q=X"],

    ["smladx"           , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1001|0|Rn|Ra|Rd|0001|Rm"                       , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["smladx"           , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|011|1000|0|Rd|Ra|Rm|0011|Rn"                       , "ARMv6+ APSR.Q=X"],

    ["smlal"            , "RxLo!=XX, RxHi!=XX, Rn!=XX, Rm!=XX"          , "T32", "1111|101|1110|0|Rn|RxLo|RxHi|0000|Rm"                   , "ARMv6T2+ IT=ANY"],
    ["smlal"            , "RxLo!=PC, RxHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|000|0111|0|RxHi|RxLo|Rm|1001|Rn"                   , "ARMv4+"],
    ["smlals"           , "RxLo!=PC, RxHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|000|0111|1|RxHi|RxLo|Rm|1001|Rn"                   , "ARMv4+ APSR.NZ=W"],

    ["smlalbb"          , "RxLo!=XX, RxHi!=XX, Rn!=XX, Rm!=XX"          , "T32", "1111|101|1110|0|Rn|RxLo|RxHi|1000|Rm"                   , "ARMv6T2+ IT=ANY"],
    ["smlalbb"          , "RxLo!=PC, RxHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|000|1010|0|RxHi|RxLo|Rm|1000|Rn"                   , "ARMv5TE+"],

    ["smlalbt"          , "RxLo!=XX, RxHi!=XX, Rn!=XX, Rm!=XX"          , "T32", "1111|101|1110|0|Rn|RxLo|RxHi|1001|Rm"                   , "ARMv6T2+ IT=ANY"],
    ["smlalbt"          , "RxLo!=PC, RxHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|000|1010|0|RxHi|RxLo|Rm|1100|Rn"                   , "ARMv5TE+"],

    ["smlaltb"          , "RxLo!=XX, RxHi!=XX, Rn!=XX, Rm!=XX"          , "T32", "1111|101|1110|0|Rn|RxLo|RxHi|1010|Rm"                   , "ARMv6T2+ IT=ANY"],
    ["smlaltb"          , "RxLo!=PC, RxHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|000|1010|0|RxHi|RxLo|Rm|1010|Rn"                   , "ARMv5TE+"],

    ["smlaltt"          , "RxLo!=XX, RxHi!=XX, Rn!=XX, Rm!=XX"          , "T32", "1111|101|1110|0|Rn|RxLo|RxHi|1011|Rm"                   , "ARMv6T2+ IT=ANY"],
    ["smlaltt"          , "RxLo!=PC, RxHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|000|1010|0|RxHi|RxLo|Rm|1110|Rn"                   , "ARMv5TE+"],

    ["smlald"           , "RxLo!=XX, RxHi!=XX, Rn!=XX, Rm!=XX"          , "T32", "1111|101|1110|0|Rn|RxLo|RxHi|1100|Rm"                   , "ARMv6T2+ IT=ANY"],
    ["smlald"           , "RxLo!=PC, RxHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|011|1010|0|RxHi|RxLo|Rm|0001|Rn"                   , "ARMv6+"],
    ["smlaldx"          , "RxLo!=XX, RxHi!=XX, Rn!=XX, Rm!=XX"          , "T32", "1111|101|1110|0|Rn|RxLo|RxHi|1101|Rm"                   , "ARMv6T2+ IT=ANY"],
    ["smlaldx"          , "RxLo!=PC, RxHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|011|1010|0|RxHi|RxLo|Rm|0011|Rn"                   , "ARMv6+"],

    ["smlawb"           , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1001|1|Rn|Ra|Rd|0000|Rm"                       , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["smlawb"           , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|000|1001|0|Rd|Ra|Rm|1000|Rn"                       , "ARMv5TE+ APSR.Q=X"],
    ["smlawt"           , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1001|1|Rn|Ra|Rd|0001|Rm"                       , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["smlawt"           , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|000|1001|0|Rd|Ra|Rm|1100|Rn"                       , "ARMv5TE+ APSR.Q=X"],

    ["smlsd"            , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1010|1|Rn|Ra|Rd|0000|Rm"                       , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["smlsd"            , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|011|1000|0|Rd|Ra|Rm|0101|Rn"                       , "ARMv6+ APSR.Q=X"],

    ["smlsdx"           , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1010|1|Rn|Ra|Rd|0001|Rm"                       , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["smlsdx"           , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|011|1000|0|Rd|Ra|Rm|0111|Rn"                       , "ARMv6+ APSR.Q=X"],

    ["smlsld"           , "RxLo!=XX, RxHi!=XX, Rn!=XX, Rm!=XX"          , "T32", "1111|101|1110|1|Rn|RxLo|RxHi|1100|Rm"                   , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["smlsld"           , "RxLo!=PC, RxHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|011|1010|0|RxHi|RxLo|Rm|0101|Rn"                   , "ARMv6+"],

    ["smlsldx"          , "RxLo!=XX, RxHi!=XX, Rn!=XX, Rm!=XX"          , "T32", "1111|101|1110|1|Rn|RxLo|RxHi|1101|Rm"                   , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["smlsldx"          , "RxLo!=PC, RxHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|011|1010|0|RxHi|RxLo|Rm|0111|Rn"                   , "ARMv6+"],

    ["smmla"            , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1010|1|Rn|Ra|Rd|0000|Rm"                       , "ARMv6T2+ IT=ANY"],
    ["smmla"            , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|011|1010|1|Rd|Ra|Rm|0001|Rn"                       , "ARMv6+"],

    ["smmlar"           , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1010|1|Rn|Ra|Rd|0001|Rm"                       , "ARMv6T2+ IT=ANY"],
    ["smmlar"           , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|011|1010|1|Rd|Ra|Rm|0011|Rn"                       , "ARMv6+"],

    ["smmls"            , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1011|0|Rn|Ra|Rd|0000|Rm"                       , "ARMv6T2+ IT=ANY"],
    ["smmls"            , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|011|1010|1|Rd|Ra|Rm|1101|Rn"                       , "ARMv6+"],

    ["smmlsr"           , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1011|0|Rn|Ra|Rd|0001|Rm"                       , "ARMv6T2+ IT=ANY"],
    ["smmlsr"           , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|011|1010|1|Rd|Ra|Rm|1111|Rn"                       , "ARMv6+"],

    ["smmul"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|1010|1|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["smmul"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|1010|1|Rd|1111|Rm|0001|Rn"                     , "ARMv6+"],

    ["smmulr"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|1010|1|Rn|1111|Rd|0001|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["smmulr"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|1010|1|Rd|1111|Rm|0011|Rn"                     , "ARMv6+"],

    ["smuad"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|1001|0|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["smuad"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|1000|0|Rd|1111|Rm|0001|Rn"                     , "ARMv6+ APSR.Q=X"],

    ["smuadx"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|1001|0|Rn|1111|Rd|0001|Rm"                     , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["smuadx"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|1000|0|Rd|1111|Rm|0011|Rn"                     , "ARMv6+ APSR.Q=X"],

    ["smulbb"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|1000|1|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["smulbb"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1011|0|Rd|SBZ:4|Rm|1000|Rn"                    , "ARMv5TE+"],

    ["smulbt"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|1000|1|Rn|1111|Rd|0001|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["smulbt"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1011|0|Rd|SBZ:4|Rm|1100|Rn"                    , "ARMv5TE+"],

    ["smultb"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|1000|1|Rn|1111|Rd|0010|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["smultb"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1011|0|Rd|SBZ:4|Rm|1010|Rn"                    , "ARMv5TE+"],

    ["smultt"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|1000|1|Rn|1111|Rd|0011|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["smultt"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1011|0|Rd|SBZ:4|Rm|1110|Rn"                    , "ARMv5TE+"],

    ["smull"            , "RdLo!=XX, RdHi!=XX, Rn!=XX, Rm!=XX"          , "T32", "1111|101|1100|0|Rn|RdLo|RdHi|0000|Rm"                   , "ARMv6T2+ IT=ANY"],
    ["smull"            , "RdLo!=PC, RdHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|000|0110|0|RdHi|RdLo|Rm|1001|Rn"                   , "ARMv4+ APSR.NZ=W"],
    ["smulls"           , "RdLo!=PC, RdHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|000|0110|1|RdHi|RdLo|Rm|1001|Rn"                   , "ARMv4+ APSR.NZ=W"],

    ["smulwb"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|1001|1|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["smulwb"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1001|0|Rd|SBZ:4|Rm|1010|Rn"                    , "ARMv5TE+"],

    ["smulwt"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|1001|1|Rn|1111|Rd|0001|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["smulwt"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|000|1001|0|Rd|SBZ:4|Rm|1110|Rn"                    , "ARMv5TE+"],

    ["smusd"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|1010|0|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["smusd"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|1000|0|Rd|1111|Rm|0101|Rn"                     , "ARMv6+"],

    ["smusdx"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|1010|0|Rn|1111|Rd|0001|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["smusdx"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|1000|0|Rd|1111|Rm|0111|Rn"                     , "ARMv6+"],

    ["srs"              , "[Rn==SP]{!}, #Mode"                          , "A32", "1111|100|011|W|0|1101|0000|0101|000|Mode:5"             , "ARMv6+"],
    ["srsda"            , "[Rn==SP]{!}, #Mode"                          , "A32", "1111|100|001|W|0|1101|0000|0101|000|Mode:5"             , "ARMv6+"],
    ["srsdb"            , "[Rn==SP]{!}, #Mode"                          , "A32", "1111|100|101|W|0|1101|0000|0101|000|Mode:5"             , "ARMv6+"],
    ["srsib"            , "[Rn==SP]{!}, #Mode"                          , "A32", "1111|100|111|W|0|1101|0000|0101|000|Mode:5"             , "ARMv6+"],

    ["ssat"             , "Rd!=XX, #Sat, Rn!=XX, {Sop #Shift}"          , "T32", "1111|001|100|Sop[1]|0|Rn|0|Shift:3|Rd|Shift:2|0|Sat:5"  , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["ssat"             , "Rd!=PC, #Sat, Rn!=PC, {Sop #Shift}"          , "A32", "Cond|011|0101|Sat:5|Rd|Shift:5|Sop[1]|01|Rn"            , "ARMv6+ APSR.Q=X"],

    ["ssat16"           , "Rd!=XX, #Sat, Rn!=XX"                        , "T32", "1111|001|1001|0|Rn|0000|Rd|0000|Sat:4"                  , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["ssat16"           , "Rd!=PC, #Sat, Rn!=PC"                        , "A32", "Cond|011|0101|0|Sat:4|Rd|1111|0011|Rn"                  , "ARMv6+ APSR.Q=X"],

    ["ssax"             , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0111|0|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY APSR.GE=W"],
    ["ssax"             , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0000|1|Rn|Rd|1111|0101|Rm"                     , "ARMv6+ APSR.GE=W"],

    ["ssub16"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0110|1|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY APSR.GE=W"],
    ["ssub16"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0000|1|Rn|Rd|1111|0111|Rm"                     , "ARMv6+ APSR.GE=W"],

    ["ssub8"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0110|0|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY APSR.GE=W"],
    ["ssub8"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0000|1|Rn|Rd|1111|1111|Rm"                     , "ARMv6+ APSR.GE=W"],

    ["stl"              , "Rs!=PC, [Rn!=PC]"                            , "T32", "1110|100|0110|0|Rn|Rs|1111|1010|1111"                   , "ARMv8+"],
    ["stl"              , "Rs!=PC, [Rn!=PC]"                            , "A32", "Cond|000|1100|0|Rn|1111|1100|1001|Rs"                   , "ARMv8+"],

    ["stlb"             , "Rs!=PC, [Rn!=PC]"                            , "T32", "1110|100|0110|0|Rn|Rs|1111|1000|1111"                   , "ARMv8+"],
    ["stlb"             , "Rs!=PC, [Rn!=PC]"                            , "A32", "Cond|000|1110|0|Rn|1111|1100|1001|Rs"                   , "ARMv8+"],

    ["stlex"            , "Rd!=PC, Rs!=PC, [Rn!=PC]"                    , "T32", "1110|100|0110|0|Rn|Rs|1111|1110|Rd"                     , "ARMv8+"],
    ["stlex"            , "Rd!=PC, Rs!=PC, [Rn!=PC]"                    , "A32", "Cond|000|1100|0|Rn|Rd|1110|1001|Rs"                     , "ARMv8+"],

    ["stlexb"           , "Rd!=PC, Rs!=PC, [Rn!=PC]"                    , "T32", "1110|100|0110|0|Rn|Rs|1111|1100|Rd"                     , "ARMv8+"],
    ["stlexb"           , "Rd!=PC, Rs!=PC, [Rn!=PC]"                    , "A32", "Cond|000|1110|0|Rn|Rd|1110|1001|Rs"                     , "ARMv8+"],

    ["stlexd"           , "Rd!=PC, Rs!=PC, Rs2!=PC  , [Rn!=PC]"         , "T32", "1110|100|0110|0|Rn|Rs|Rs2|1111|Rd"                      , "ARMv8+"],
    ["stlexd"           , "Rd!=PC, Rs!=PC, Rs2!=Rs+1, [Rn!=PC]"         , "A32", "Cond|000|1101|0|Rn|Rd|1110|1001|Rs"                     , "ARMv8+"],

    ["stlexh"           , "Rd!=PC, Rs!=PC, [Rn!=PC]"                    , "T32", "1110|100|0110|0|Rn|Rs|1111|1101|Rd"                     , "ARMv8+"],
    ["stlexh"           , "Rd!=PC, Rs!=PC, [Rn!=PC]"                    , "A32", "Cond|000|1111|0|Rn|Rd|1110|1001|Rs"                     , "ARMv8+"],

    ["stlh"             , "Rs!=PC, [Rn!=PC]"                            , "T32", "1110|100|0110|0|Rn|Rs|1111|1001|1111"                   , "ARMv8+"],
    ["stlh"             , "Rs!=PC, [Rn!=PC]"                            , "A32", "Cond|000|1111|0|Rn|1111|1100|1001|Rs"                   , "ARMv8+"],

    ["stm"              , "[Rn!=HI]!, RsList"                           , "T16", "1100|0|Rn:3|RsList:8"                                   , "ARMv4T+  IT=ANY"],
    ["stm"              , "[Rn!=PC]{!}, RsList"                         , "T32", "1110|100|010W|0|Rn|0|RsList[14]|0|RsList[12:0]"         , "ARMv6T2+ IT=ANY"],
    ["stm"              , "[Rn!=PC]{!}, RsList"                         , "A32", "Cond|100|010W|0|Rn|RsList:16"                           , "ARMv4+"],
    ["stm"              , "[Rn!=PC]   , RsList"                         , "A32", "Cond|100|0110|0|Rn|RsList:16"                           , "ARMv4+"],

    ["stmda"            , "[Rn!=PC]{!}, RsList"                         , "A32", "Cond|100|000W|0|Rn|RsList:16"                           , "ARMv4+"],
    ["stmda"            , "[Rn!=PC]   , RsList"                         , "A32", "Cond|100|0010|0|Rn|RsList:16"                           , "ARMv4+"],

    ["stmdb"            , "[Rn!=PC]{!}, RsList"                         , "T32", "1110|100|100W|0|Rn|0|RsList[14]|0|RsList[12:0]"         , "ARMv6T2+ IT=ANY"],
    ["stmdb"            , "[Rn!=PC]{!}, RsList"                         , "A32", "Cond|100|100W|0|Rn|RsList:16"                           , "ARMv4+"],
    ["stmdb"            , "[Rn!=PC]   , RsList"                         , "A32", "Cond|100|1010|0|Rn|RsList:16"                           , "ARMv4+"],

    ["stmib"            , "[Rn!=PC]{!}, RsList"                         , "A32", "Cond|100|110W|0|Rn|RsList:16"                           , "ARMv4+"],
    ["stmib"            , "[Rn!=PC]   , RsList"                         , "A32", "Cond|100|1110|0|Rn|RsList:16"                           , "ARMv4+"],

    ["str"              , "Rs!=HI, [Rn!=HI, #ImmZ*4]"                   , "T16", "0110|0|ImmZ:5|Rn:3|Rs:3"                                , "ARMv4T+  IT=ANY"],
    ["str"              , "Rs!=HI, [Rn==SP, #ImmZ*4]"                   , "T16", "1001|0|Rs:3|ImmZ:8"                                     , "ARMv4T+  IT=ANY"],
    ["str"              , "Rs!=PC, [Rn!=PC, #ImmZ]"                     , "T32", "1111|100|0110|0|Rn|Rs|ImmZ:12"                          , "ARMv6T2+ IT=ANY"],
    ["str"              , "Rs!=PC, [Rn!=PC, #+/-ImmZ]{!}"               , "T32", "1111|100|0010|0|Rn|Rs|1PUW|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["str"              , "Rs    , [Rn    , #+/-ImmZ]{!}"               , "A32", "Cond|010|PU0W|0|Rn|Rs|ImmZ:12"                          , "ARMv4+"],
    ["str"              , "Rs!=HI, [Rn!=HI, Rm!=HI]"                    , "T16", "0101|000|Rm:3|Rn:3|Rs:3"                                , "ARMv4T+  IT=ANY"],
    ["str"              , "Rs!=PC, [Rn!=PC, Rm!=XX, {LSL #Shift}]"      , "T32", "1111|100|0010|0|Rn|Rs|0|00000|Shift:2|Rm"               , "ARMv6T2+ IT=ANY"],
    ["str"              , "Rs    , [Rn    , +/-Rm!=PC, {Sop #Shift}]{!}", "A32", "Cond|011|PU0W|0|Rn|Rs|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],

    ["strb"             , "Rs!=HI, [Rn!=HI, #ImmZ*4]"                   , "T16", "0111|0|ImmZ:5|Rn:3|Rs:3"                                , "ARMv4T+  IT=ANY"],
    ["strb"             , "Rs!=XX, [Rn!=PC, #ImmZ]"                     , "T32", "1111|100|0100|0|Rn|Rs|ImmZ:12"                          , "ARMv6T2+ IT=ANY"],
    ["strb"             , "Rs!=XX, [Rn!=PC, #+/-ImmZ]{!}"               , "T32", "1111|100|0000|0|Rn|Rs|1PUW|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["strb"             , "Rs!=HI, [Rn!=HI, Rm!=HI]"                    , "T16", "0101|010|Rm:3|Rn:3|Rs:3"                                , "ARMv4T+  IT=ANY"],
    ["strb"             , "Rs!=XX, [Rn!=PC, Rm!=XX, {LSL #Shift}]"      , "T32", "1111|100|0000|0|Rn|Rs|0|00000|Shift:2|Rm"               , "ARMv6T2+ IT=ANY"],
    ["strb"             , "Rs!=PC, [Rn    , #+/-ImmZ]{!}"               , "A32", "Cond|010|PU1W|0|Rn|Rs|ImmZ:12"                          , "ARMv4+"],
    ["strb"             , "Rs!=PC, [Rn    , +/-Rm!=PC, {Sop #Shift}]{!}", "A32", "Cond|011|PU1W|0|Rn|Rs|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],
    ["strbt"            , "Rs!=XX, [Rn!=PC, #ImmZ]"                     , "T32", "1111|100|0000|0|Rn|Rs|1110|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["strbt"            , "Rs!=PC, [Rn    , #+/-ImmZ]!"                 , "A32", "Cond|010|0U11|0|Rn|Rs|ImmZ:12"                          , "ARMv4+"],
    ["strbt"            , "Rs!=PC, [Rn!=PC, +/-Rm!=PC, {Sop #Shift}]!"  , "A32", "Cond|011|0U11|0|Rn|Rs|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],

    ["strd"             , "Rs!=XX, Rs2!=XX  , [Rn!=PC, #ImmZ]{!}"       , "T32", "1110|100|PU1W|0|Rn|Rs|Rs2|ImmZ:8"                       , "ARMv6T2+ IT=ANY"],
    ["strd"             , "Rs<=13, Rs2==Rs+1, [Rn    , #+/-ImmZ]{!}"    , "A32", "Cond|000|PU1W|0|Rn|Rs|ImmZ:4|1111|ImmZ:4"               , "ARMv4+"],
    ["strd"             , "Rs<=13, Rs2==Rs+1, [Rn    , +/-Rm!=PC]{!}"   , "A32", "Cond|000|PU0W|0|Rn|Rs|0000|1111|Rm"                     , "ARMv4+"],

    ["strex"            , "Rd!=XX, Rs!=XX, [Rn!=PC, #ImmZ]"             , "T32", "1110|100|0010|0|Rn|Rs|Rd|ImmZ:8"                        , "ARMv6T2+ IT=ANY UNPRED_COMPLEX"],
    ["strex"            , "Rd!=PC, Rs!=PC, [Rn!=PC]"                    , "A32", "Cond|000|1100|0|Rn|Rd|1111|1001|Rs"                     , "ARMv6+"],

    ["strexb"           , "Rd!=XX, Rs!=XX, [Rn!=PC]"                    , "T32", "1110|100|0110|0|Rn|Rs|1111|0100|Rd"                     , "ARMv6T2+ IT=ANY UNPRED_COMPLEX"],
    ["strexb"           , "Rd!=PC, Rs!=PC, [Rn!=PC]"                    , "A32", "Cond|000|1110|0|Rn|Rd|1111|1001|Rs"                     , "ARMv6K+"],

    ["strexd"           , "Rd!=XX, Rs!=XX, Rs2!=XX  , [Rn!=PC]"         , "T32", "1110|100|0110|0|Rn|Rs|Rs2|0111|Rd"                      , "ARMv6T2+ IT=ANY UNPRED_COMPLEX"],
    ["strexd"           , "Rd!=PC, Rs!=PC, Rs2==Rs+1, [Rn!=PC]"         , "A32", "Cond|000|1101|0|Rn|Rd|1111|1001|Rs"                     , "ARMv6K+"],

    ["strexh"           , "Rd!=XX, Rs!=XX, [Rn!=PC]"                    , "T32", "1110|100|0110|0|Rn|Rs|1111|0101|Rd"                     , "ARMv6T2+ IT=ANY UNPRED_COMPLEX"],
    ["strexh"           , "Rd!=PC, Rs!=PC, [Rn!=PC]"                    , "A32", "Cond|000|1111|0|Rn|Rd|1111|1001|Rs"                     , "ARMv6K+"],

    ["strh"             , "Rs!=HI, [Rn!=HI, #ImmZ*4]"                   , "T16", "1000|0|ImmZ:5|Rn:3|Rs:3"                                , "ARMv4T+  IT=ANY"],
    ["strh"             , "Rs!=XX, [Rn!=PC, #ImmZ]"                     , "T32", "1111|100|0101|0|Rn|Rs|ImmZ:12"                          , "ARMv6T2+ IT=ANY"],
    ["strh"             , "Rs!=XX, [Rn!=PC, #+/-ImmZ]{!}"               , "T32", "1111|100|0001|0|Rn|Rs|1PUW|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["strh"             , "Rs!=PC, [Rn    , #+/-ImmZ]{!}"               , "A32", "Cond|000|PU1W|0|Rn|Rs|ImmZ:4|1011|ImmZ:4"               , "ARMv4+"],
    ["strh"             , "Rs!=HI, [Rn!=HI, Rm!=HI]"                    , "T16", "0101|001|Rm:3|Rn:3|Rs:3"                                , "ARMv4T+  IT=ANY"],
    ["strh"             , "Rs!=XX, [Rn!=PC, Rm!=XX, {LSL #Shift}]"      , "T32", "1111|100|0001|0|Rn|Rs|0|00000|Shift:2|Rm"               , "ARMv6T2+ IT=ANY"],
    ["strh"             , "Rs!=PC, [Rn    , +/-Rm!=PC]{!}"              , "A32", "Cond|000|PU0W|0|Rn|Rs|0000|1011|Rm"                     , "ARMv4+"],

    ["strht"            , "Rs!=XX, [Rn!=PC, #ImmZ]"                     , "T32", "1111|100|0001|0|Rn|Rs|1110|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["strht"            , "Rs!=PC, [Rn!=PC, #+/-ImmZ]!"                 , "A32", "Cond|000|0U11|0|Rn|Rs|ImmZ:4|1011|ImmZ:4"               , "ARMv6T2+"],
    ["strht"            , "Rs!=PC, [Rn!=PC, +/-Rm!=PC]!"                , "A32", "Cond|000|0U01|0|Rn|Rs|0000|1011|Rm"                     , "ARMv6T2+"],

    ["strt"             , "Rs!=XX, [Rn!=PC, #ImmZ]"                     , "T32", "1111|100|0010|0|Rn|Rs|1110|ImmZ:8"                      , "ARMv6T2+ IT=ANY"],
    ["strt"             , "Rs    , [Rn!=PC, #+/-ImmZ]!"                 , "A32", "Cond|010|0U01|0|Rn|Rs|ImmZ:12"                          , "ARMv4+"],
    ["strt"             , "Rs    , [Rn!=PC, +/-Rm!=PC, {Sop #Shift}]!"  , "A32", "Cond|011|0U01|0|Rn|Rs|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],

    ["sub"              , "Rd!=HI, Rn!=HI, #ImmZ"                       , "T16", "0001|111|ImmZ:3|Rn:3|Rd:3"                              , "ARMv4T+  IT=IN"],
    ["subs"             , "Rd!=HI, Rn!=HI, #ImmZ"                       , "T16", "0001|111|ImmZ:3|Rn:3|Rd:3"                              , "ARMv4T+  IT=OUT APSR.NZCV=W"],
    ["sub"              , "Rx!=HI, Rx!=HI, #ImmZ"                       , "T16", "0011|1|Rx:3|ImmZ:8"                                     , "ARMv4T+  IT=IN"],
    ["subs"             , "Rx!=HI, Rx!=HI, #ImmZ"                       , "T16", "0001|1|Rx:3|ImmZ:8"                                     , "ARMv4T+  IT=OUT APSR.NZCV=W"],
    ["sub"              , "Rx==SP, Rx==SP, #ImmZ*4"                     , "T16", "1011|00001|ImmZ:7"                                      , "ARMv4T+  IT=ANY"],
    ["sub"              , "Rd!=XX, Rn!=XX, #ImmA"                       , "T32", "1111|0|ImmA:1|0|1101|0|Rn|0|ImmA:3|Rd|ImmA:8"           , "ARMv6T2+ IT=ANY"],
    ["subs"             , "Rd!=XX, Rn!=XX, #ImmA"                       , "T32", "1111|0|ImmA:1|0|1101|1|Rn|0|ImmA:3|Rd|ImmA:8"           , "ARMv6T2+ IT=ANY APSR.NZCV=W"],
    ["sub"              , "Rd!=PC, Rn==SP, #ImmA"                       , "T32", "1111|0|ImmA:1|0|1101|0|1101|0|ImmA:3|Rd|ImmA:8"         , "ARMv6T2+ IT=ANY"],
    ["subs"             , "Rd!=PC, Rn==SP, #ImmA"                       , "T32", "1111|0|ImmA:1|0|1101|1|1101|0|ImmA:3|Rd|ImmA:8"         , "ARMv6T2+ IT=ANY APSR.NZCV=W"],
    ["sub"              , "Rd!=XX, Rn!=XX, #ImmZ"                       , "T32", "1111|0|ImmZ:1|1|0101|0|Rn|0|ImmZ:3|Rd|ImmZ:8"           , "ARMv6T2+ IT=ANY"],
    ["subs"             , "Rd!=XX, Rn!=XX, #ImmZ"                       , "T32", "1111|0|ImmZ:1|1|0101|1|Rn|0|ImmZ:3|Rd|ImmZ:8"           , "ARMv6T2+ IT=ANY APSR.NZCV=W"],
    ["sub"              , "Rd    , Rn    , #ImmA"                       , "A32", "Cond|001|0010|0|Rn|Rd|ImmA:12"                          , "ARMv4+"],
    ["subs"             , "Rd!=PC, Rn    , #ImmA"                       , "A32", "Cond|001|0010|1|Rn|Rd|ImmA:12"                          , "ARMv4+ APSR.NZCV=W"],
    ["sub"              , "Rd!=HI, Rn!=HI, Rm!=HI"                      , "T16", "0001|101|Rm:3|Rn:3|Rd:3"                                , "ARMv4T+  IT=IN"],
    ["subs"             , "Rd!=HI, Rn!=HI, Rm!=HI"                      , "T16", "0001|101|Rm:3|Rn:3|Rd:3"                                , "ARMv4T+  IT=OUT APSR.NZCV=W"],
    ["sub"              , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|1101|0|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY"],
    ["subs"             , "Rd!=XX, Rn!=XX, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|1101|1|Rn|0|Shift:3|Rd|Shift:2|Sop:2|Rm"       , "ARMv6T2+ IT=ANY APSR.NZCV=W"],
    ["sub"              , "Rd!=PC, Rn==SP, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|1101|0|1101|0|Shift:3|Rd|Shift:2|Sop:2|Rm"     , "ARMv6T2+ IT=ANY"],
    ["subs"             , "Rd!=PC, Rn==SP, Rm!=XX, {Sop #Shift}"        , "T32", "1110|101|1101|1|1101|0|Shift:3|Rd|Shift:2|Sop:2|Rm"     , "ARMv6T2+ IT=ANY APSR.NZCV=W"],
    ["sub"              , "Rd    , Rn    , Rm    , {Sop #Shift}"        , "A32", "Cond|000|0010|0|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+"],
    ["subs"             , "Rd!=PC, Rn    , Rm    , {Sop #Shift}"        , "A32", "Cond|000|0010|1|Rn|Rd|Shift:5|Sop:2|0|Rm"               , "ARMv4+ APSR.NZCV=W"],
    ["sub"              , "Rd    , Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|0010|0|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+"],
    ["subs"             , "Rd!=PC, Rn!=PC, Rm!=PC, Sop Rs!=PC"          , "A32", "Cond|000|0010|1|Rn|Rd|Rs|0|Sop:2|1|Rm"                  , "ARMv4+ APSR.NZCV=W"],

    ["svc"              , "#ImmZ"                                       , "T16", "1101|1111|ImmZ:8"                                       , "ARMv4T+  IT=ANY"],
    ["svc"              , "#ImmZ"                                       , "A32", "Cond|1111|ImmZ:24"                                      , "ARMv4+"],

    ["swp"              , "Rd!=PC, Rs!=PC, [Rn!=PC]"                    , "A32", "Cond|000|1000|0|Rn|Rd|0000|1001|Rs"                     , "ARMv4+ ARMv6-"],
    ["swpb"             , "Rd!=PC, Rs!=PC, [Rn!=PC]"                    , "A32", "Cond|000|1010|0|Rn|Rd|0000|1001|Rs"                     , "ARMv4+ ARMv6-"],

    ["sxtab"            , "Rd!=XX, Rn!=XX, Rm!=XX, {#Rot*8}"            , "T32", "1111|101|0010|0|Rn|1111|Rd|1|0|Rot:2|Rm"                , "ARMv6T2+ IT=ANY"],
    ["sxtab"            , "Rd!=PC, Rn!=PC, Rm!=PC, {#Rot*8}"            , "A32", "Cond|011|0101|0|Rn|Rd|Rot:2|00|0111|Rm"                 , "ARMv6+"],
    ["sxtab16"          , "Rd!=XX, Rn!=XX, Rm!=XX, {#Rot*8}"            , "T32", "1111|101|0001|0|Rn|1111|Rd|1|0|Rot:2|Rm"                , "ARMv6T2+ IT=ANY"],
    ["sxtab16"          , "Rd!=PC, Rn!=PC, Rm!=PC, {#Rot*8}"            , "A32", "Cond|011|0100|0|Rn|Rd|Rot:2|00|0111|Rm"                 , "ARMv6+"],
    ["sxtah"            , "Rd!=XX, Rn!=XX, Rm!=XX, {#Rot*8}"            , "T32", "1111|101|0000|0|Rn|1111|Rd|1|0|Rot:2|Rm"                , "ARMv6T2+ IT=ANY"],
    ["sxtah"            , "Rd!=PC, Rn!=PC, Rm!=PC, {#Rot*8}"            , "A32", "Cond|011|0101|1|Rn|Rd|Rot:2|00|0111|Rm"                 , "ARMv6+"],

    ["sxtb"             , "Rd!=HI, Rn!=HI"                              , "T16", "1011|001|001|Rn:3|Rd:3"                                 , "ARMv6+   IT=ANY"],
    ["sxtb"             , "Rd!=XX, Rn!=XX, {#Rot*8}"                    , "T32", "1111|101|0010|0|1111|1111|Rd|10|Rot:2|Rn"               , "ARMv6T2+ IT=ANY"],
    ["sxtb"             , "Rd!=PC, Rn!=PC, {#Rot*8}"                    , "A32", "Cond|011|0101|0|1111|Rd|Rot:2|00|0111|Rn"               , "ARMv6+"],

    ["sxtb16"           , "Rd!=XX, Rn!=XX, {#Rot*8}"                    , "T32", "1111|101|0001|0|1111|1111|Rd|10|Rot:2|Rn"               , "ARMv6T2+ IT=ANY"],
    ["sxtb16"           , "Rd!=PC, Rn!=PC, {#Rot*8}"                    , "A32", "Cond|011|0100|0|1111|Rd|Rot:2|00|0111|Rn"               , "ARMv6+"],

    ["sxth"             , "Rd!=HI, Rn!=HI"                              , "T16", "1011|001|000|Rn:3|Rd:3"                                 , "ARMv6+   IT=ANY"],
    ["sxth"             , "Rd!=XX, Rn!=XX, {#Rot*8}"                    , "T32", "1111|101|0000|0|1111|1111|Rd|10|Rot:2|Rn"               , "ARMv6T2+ IT=ANY"],
    ["sxth"             , "Rd!=PC, Rn!=PC, {#Rot*8}"                    , "A32", "Cond|011|0101|1|1111|Rd|Rot:2|00|0111|Rn"               , "ARMv6+"],

    ["tbb"              , "Rn!=SP, Rn!=XX"                              , "T32", "1110|100|0110|1|Rn|1111|0000|0000|Rn"                   , "ARMv6T2+ IT=OUT|LAST"],
    ["tbh"              , "Rn!=SP, Rn!=XX"                              , "T32", "1110|100|0110|1|Rn|1111|0000|0001|Rn"                   , "ARMv6T2+ IT=OUT|LAST"],

    ["teq"              , "Rn!=XX, #ImmC"                               , "T32", "1111|0|ImmC:1|0|0100|1|Rn|0|ImmC:3|1111|ImmC:8"         , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["teq"              , "Rn    , #ImmC"                               , "A32", "Cond|001|1001|1|Rn|0000|ImmC:12"                        , "ARMv4+ APSR.NZC=W"],
    ["teq"              , "Rn!=XX, Rn!=XX, {Sop #Shift}"                , "T32", "1110|101|0100|1|Rn|0|Shift:3|1111|Shift:2|Sop:2|Rn"     , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["teq"              , "Rn    , Rm    , {Sop #Shift}"                , "A32", "Cond|000|1001|1|Rn|0000|Shift:5|Sop:2|0|Rm"             , "ARMv4+ APSR.NZC=W"],
    ["teq"              , "Rn!=PC, Rm!=PC, Sop Rs!=PC"                  , "A32", "Cond|000|1001|1|Rn|0000|Rs|0|Sop:2|1|Rm"                , "ARMv4+ APSR.NZC=W"],

    ["tst"              , "Rn!=XX, #ImmC"                               , "T32", "1111|0|ImmC:1|0|0000|1|Rn|0|ImmC:3|1111|ImmC:8"         , "ARMv4T+  IT=ANY APSR.NZC=W"],
    ["tst"              , "Rn    , #ImmC"                               , "A32", "Cond|001|1000|1|Rn|0000|ImmC:12"                        , "ARMv4+ APSR.NZC=W"],
    ["tst"              , "Rn!=HI, Rn!=HI"                              , "T16", "0100|00|1000|Rn:3|Rn:3"                                 , "ARMv4T+  IT=ANY APSR.NZC=W"],
    ["tst"              , "Rn!=XX, Rn!=XX, {Sop #Shift}"                , "T32", "1110|101|0000|1|Rn|0|Shift:3|1111|Shift:2|Sop:2|Rn"     , "ARMv6T2+ IT=ANY APSR.NZC=W"],
    ["tst"              , "Rn    , Rm    , {Sop #Shift}"                , "A32", "Cond|000|1000|1|Rn|0000|Shift:5|Sop:2|0|Rm"             , "ARMv4+ APSR.NZC=W"],
    ["tst"              , "Rn!=PC, Rm!=PC, Sop Rs!=PC"                  , "A32", "Cond|000|1000|1|Rn|0000|Rs|0|Sop:2|1|Rm"                , "ARMv4+ APSR.NZC=W"],

    ["uadd16"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0100|1|Rn|1111|Rd|0100|Rm"                     , "ARMv6T2+ IT=ANY APSR.GE=W"],
    ["uadd16"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0010|1|Rn|Rd|1111|0001|Rm"                     , "ARMv6+ APSR.GE=W"],

    ["uadd8"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0100|0|Rn|1111|Rd|0100|Rm"                     , "ARMv6T2+ IT=ANY APSR.GE=W"],
    ["uadd8"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0010|1|Rn|Rd|1111|1001|Rm"                     , "ARMv6+ APSR.GE=W"],

    ["uasx"             , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0101|0|Rn|1111|Rd|0100|Rm"                     , "ARMv6T2+ IT=ANY APSR.GE=W"],
    ["uasx"             , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0010|1|Rn|Rd|1111|0011|Rm"                     , "ARMv6+ APSR.GE=W"],

    ["ubfx"             , "Rd!=XX, Rn!=XX, #LSB, #Width!=0"             , "T32", "1111|001|1110|0|Rn|0|LSB:3|Rd|LSB:2|0|Width-1:5"        , "ARMv6T2+ IT=ANY"],
    ["ubfx"             , "Rd!=PC, Rn!=PC, #LSB, #Width"                , "A32", "Cond|011|1111|Width-1:5|Rd|LSB:5|101|Rn"                , "ARMv6T2+"],

    ["udiv"             , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|1101|1|Rn|1111|Rd|1111|Rm"                     , "IDIVT    IT=ANY"],
    ["udiv"             , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|1001|1|Rd|1111|Rm|0001|Rn"                     , "IDIVA"],

    ["udf"              , "#ImmZ"                                       , "A32", "1110|011|1111|1|ImmZ:12|1111|ImmZ:4"                    , "?"],

    ["uhadd8"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0100|0|Rn|1111|Rd|0110|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["uhadd8"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0011|1|Rn|Rd|1111|1001|Rm"                     , "ARMv6+"],

    ["uhadd16"          , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0100|1|Rn|1111|Rd|0110|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["uhadd16"          , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0011|1|Rn|Rd|1111|0001|Rm"                     , "ARMv6+"],

    ["uhasx"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0101|0|Rn|1111|Rd|0110|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["uhasx"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0011|1|Rn|Rd|1111|0011|Rm"                     , "ARMv6+"],

    ["uhsax"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0111|0|Rn|1111|Rd|0110|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["uhsax"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0011|1|Rn|Rd|1111|0101|Rm"                     , "ARMv6+"],

    ["uhsub16"          , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0110|1|Rn|1111|Rd|0110|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["uhsub16"          , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0011|1|Rn|Rd|1111|0111|Rm"                     , "ARMv6+"],

    ["uhsub8"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0110|0|Rn|1111|Rd|0110|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["uhsub8"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0011|1|Rn|Rd|1111|1111|Rm"                     , "ARMv6+"],

    ["umaal"            , "RxLo!=XX, RxHi!=XX, Rn!=XX, Rm!=XX"          , "T32", "1111|101|1111|0|Rn|RxLo|RxHi|0110|Rm"                   , "ARMv6T2+ IT=ANY"],
    ["umaal"            , "RxLo!=PC, RxHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|000|0010|0|RxHi|RxLo|Rm|1001|Rn"                   , "ARMv6+"],

    ["umlal"            , "RxLo!=XX, RxHi!=XX, Rn!=XX, Rm!=XX"          , "T32", "1111|101|1111|0|Rn|RxLo|RxHi|0000|Rm"                   , "ARMv6T2+ IT=ANY"],
    ["umlal"            , "RxLo!=PC, RxHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|000|0101|0|RxHi|RxLo|Rm|1001|Rn"                   , "ARMv4+"],
    ["umlals"           , "RxLo!=PC, RxHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|000|0101|1|RxHi|RxLo|Rm|1001|Rn"                   , "ARMv4+ APSR.NZ=W"],

    ["umull"            , "RdLo!=XX, RdHi!=XX, Rn!=XX, Rm!=XX"          , "T32", "1111|101|1101|0|Rn|RdLo|RdHi|0000|Rm"                   , "ARMv6T2+ IT=ANY"],
    ["umull"            , "RdLo!=PC, RdHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|000|0100|0|RdHi|RdLo|Rm|1001|Rn"                   , "ARMv4+"],
    ["umulls"           , "RdLo!=PC, RdHi!=PC, Rn!=PC, Rm!=PC"          , "A32", "Cond|000|0100|1|RdHi|RdLo|Rm|1001|Rn"                   , "ARMv4+ APSR.NZ=W"],

    ["uqadd16"          , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0100|1|Rn|1111|Rd|0101|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["uqadd16"          , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0011|0|Rn|Rd|1111|0001|Rm"                     , "ARMv6+"],

    ["uqadd8"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0100|0|Rn|1111|Rd|0101|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["uqadd8"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0011|0|Rn|Rd|1111|1001|Rm"                     , "ARMv6+"],

    ["uqasx"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0101|0|Rn|1111|Rd|0101|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["uqasx"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0011|0|Rn|Rd|1111|0011|Rm"                     , "ARMv6+"],

    ["uqsax"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0111|0|Rn|1111|Rd|0101|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["uqsax"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0011|0|Rn|Rd|1111|0101|Rm"                     , "ARMv6+"],

    ["uqsub16"          , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0110|1|Rn|1111|Rd|0101|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["uqsub16"          , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0011|0|Rn|Rd|1111|0111|Rm"                     , "ARMv6+"],

    ["uqsub8"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0110|0|Rn|1111|Rd|0101|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["uqsub8"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0011|0|Rn|Rd|1111|1111|Rm"                     , "ARMv6+"],

    ["usad8"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|1011|1|Rn|1111|Rd|0000|Rm"                     , "ARMv6T2+ IT=ANY"],
    ["usad8"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|1100|0|Rd|1111|Rm|0001|Rn"                     , "ARMv6+"],

    ["usada8"           , "Rd!=XX, Rn!=XX, Rm!=XX, Ra!=XX"              , "T32", "1111|101|1011|1|Rn|Ra|Rd|0000|Rm"                       , "ARMv6T2+ IT=ANY"],
    ["usada8"           , "Rd!=PC, Rn!=PC, Rm!=PC, Ra!=PC"              , "A32", "Cond|011|1100|0|Rd|Ra|Rm|0001|Rn"                       , "ARMv6+"],

    ["usat"             , "Rd!=XX, #Sat, Rn!=XX, {Sop #Shift}"          , "T32", "1111|001|110|Sop[1]|0|Rn|0|Shift:3|Rd|Shift:2|0|Sat:5"  , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["usat"             , "Rd!=PC, #Sat, Rn!=PC, {Sop #Shift}"          , "A32", "Cond|011|0111|Sat:5|Rd|Shift:5|Sop[1]|01|Rn"            , "ARMv6+"],

    ["usat16"           , "Rd!=XX, #Sat, Rn!=XX"                        , "T32", "1111|001|1101|0|Rn|0000|Rd|0000|Sat:4"                  , "ARMv6T2+ IT=ANY APSR.Q=X"],
    ["usat16"           , "Rd!=PC, #Sat, Rn!=PC"                        , "A32", "Cond|011|0111|0|Sat:4|Rd|1111|0011|Rn"                  , "ARMv6+"],

    ["usax"             , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0111|0|Rn|1111|Rd|0100|Rm"                     , "ARMv6T2+ IT=ANY APSR.GE=W"],
    ["usax"             , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0010|1|Rn|Rd|1111|0101|Rm"                     , "ARMv6+ APSR.GE=W"],

    ["usub16"           , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0110|1|Rn|1111|Rd|0100|Rm"                     , "ARMv6T2+ IT=ANY APSR.GE=W"],
    ["usub16"           , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0010|1|Rn|Rd|1111|0111|Rm"                     , "ARMv6+ APSR.GE=W"],

    ["usub8"            , "Rd!=XX, Rn!=XX, Rm!=XX"                      , "T32", "1111|101|0110|0|Rn|1111|Rd|0100|Rm"                     , "ARMv6T2+ IT=ANY APSR.GE=W"],
    ["usub8"            , "Rd!=PC, Rn!=PC, Rm!=PC"                      , "A32", "Cond|011|0010|1|Rn|Rd|1111|1111|Rm"                     , "ARMv6+ APSR.GE=W"],

    ["uxtab"            , "Rd!=XX, Rn!=XX, Rm!=XX, {#Rot*8}"            , "T32", "1111|101|0010|1|Rn|1111|Rd|10|Rot:2|Rm"                 , "ARMv6T2+ IT=ANY"],
    ["uxtab"            , "Rd!=PC, Rn!=PC, Rm!=PC, {#Rot*8}"            , "A32", "Cond|011|0111|0|Rn|Rd|Rot:2|00|0111|Rm"                 , "ARMv6+"],

    ["uxtab16"          , "Rd!=XX, Rn!=XX, Rm!=XX, {#Rot*8}"            , "T32", "1111|101|0001|1|Rn|1111|Rd|10|Rot:2|Rm"                 , "ARMv6T2+ IT=ANY"],
    ["uxtab16"          , "Rd!=PC, Rn!=PC, Rm!=PC, {#Rot*8}"            , "A32", "Cond|011|0110|0|Rn|Rd|Rot:2|00|0111|Rm"                 , "ARMv6+"],

    ["uxtah"            , "Rd!=XX, Rn!=XX, Rm!=XX, {#Rot*8}"            , "T32", "1111|101|0000|1|Rn|1111|Rd|10|Rot:2|Rm"                 , "ARMv6T2+ IT=ANY"],
    ["uxtah"            , "Rd!=PC, Rn!=PC, Rm!=PC, {#Rot*8}"            , "A32", "Cond|011|0111|1|Rn|Rd|Rot:2|00|0111|Rm"                 , "ARMv6+"],

    ["uxtb"             , "Rd!=HI, Rn!=HI"                              , "T16", "1011|001|011|Rn:3|Rd:3"                                 , "ARMv6+   IT=ANY"],
    ["uxtb"             , "Rd!=XX, Rn!=XX, {#Rot*8}"                    , "T32", "1111|101|0010|1|1111|1111|Rd|10|Rot:2|Rn"               , "ARMv6T2+ IT=ANY"],
    ["uxtb"             , "Rd!=PC, Rn!=PC, {#Rot*8}"                    , "A32", "Cond|011|0111|0|1111|Rd|Rot:2|00|0111|Rn"               , "ARMv6+"],

    ["uxtb16"           , "Rd!=XX, Rn!=XX, {#Rot*8}"                    , "T32", "1111|101|0001|1|1111|1111|Rd|10|Rot:2|Rn"               , "ARMv6T2+ IT=ANY"],
    ["uxtb16"           , "Rd!=PC, Rn!=PC, {#Rot*8}"                    , "A32", "Cond|011|0110|0|1111|Rd|Rot:2|00|0111|Rn"               , "ARMv6+"],

    ["uxth"             , "Rd!=HI, Rn!=HI"                              , "T16", "1011|001|010|Rn:3|Rd:3"                                 , "ARMv6+   IT=ANY"],
    ["uxth"             , "Rd!=XX, Rn!=XX, {#Rot*8}"                    , "T32", "1111|101|0000|1|1111|1111|Rd|10|Rot:2|Rn"               , "ARMv6T2+ IT=ANY"],
    ["uxth"             , "Rd!=PC, Rn!=PC, {#Rot*8}"                    , "A32", "Cond|011|0111|1|1111|Rd|Rot:2|00|0111|Rn"               , "ARMv6+"],

    ["wfe"              , ""                                            , "T16", "1011|1111|0010|0000"                                    , "ARMv6T2+ IT=ANY"],
    ["wfe"              , ""                                            , "T32", "1111|001|1101|0|1111|1000|0000|0000|0010"               , "ARMv6T2+ IT=ANY"],
    ["wfe"              , ""                                            , "A32", "Cond|001|1001|0|0000|1111|0000|0000|0010"               , "ARMv6K+"],

    ["wfi"              , ""                                            , "T16", "1011|1111|0011|0000"                                    , "ARMv6T2+ IT=ANY"],
    ["wfi"              , ""                                            , "T32", "1111|001|1101|0|1111|1000|0000|0000|0011"               , "ARMv6T2+ IT=ANY"],
    ["wfi"              , ""                                            , "A32", "Cond|001|1001|0|0000|1111|0000|0000|0011"               , "ARMv6K+"],

    ["yield"            , ""                                            , "T16", "1011|1111|0001|0000"                                    , "ARMv6T2+ IT=ANY"],
    ["yield"            , ""                                            , "T32", "1111|001|1101|0|1111|1000|0000|0000|0001"               , "ARMv6T2+ IT=ANY"],
    ["yield"            , ""                                            , "A32", "Cond|001|1001|0|0000|1111|0000|0000|0001"               , "ARMv6K+"],

    ["aesd.<dt>"        , "Vx, Vm"                                      , "T32", "1111|11111|Vx'|11|Sz|00|Vx|0|0110|1|Vm'|0|Vm"           , ""],
    ["aesd.<dt>"        , "Vx, Vm"                                      , "A32", "1111|00111|Vx'|11|Sz|00|Vx|0|0110|1|Vm'|0|Vm"           , ""],
    ["aese.<dt>"        , "Vx, Vm"                                      , "T32", "1111|11111|Vx'|11|Sz|00|Vx|0|0110|0|Vm'|0|Vm"           , ""],
    ["aese.<dt>"        , "Vx, Vm"                                      , "A32", "1111|00111|Vx'|11|Sz|00|Vx|0|0110|0|Vm'|0|Vm"           , ""],
    ["aesimc.<dt>"      , "Vd, Vm"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|0|0111|1|Vm'|0|Vm"           , ""],
    ["aesimc.<dt>"      , "Vd, Vm"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|0|0111|1|Vm'|0|Vm"           , ""],
    ["aesmc.<dt>"       , "Vd, Vm"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|0|0111|0|Vm'|0|Vm"           , ""],
    ["aesmc.<dt>"       , "Vd, Vm"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|0|0111|0|Vm'|0|Vm"           , ""],

    ["fldmdbx"          , "[Rn]!  , VdList"                             , "T32", "1110|11010|Vd'|11|Rn|Vd|1011|VdList[7:1]|1"             , ""],
    ["fldmdbx"          , "[Rn]!  , VdList"                             , "A32", "Cond|11010|Vd'|11|Rn|Vd|1011|VdList[7:1]|1"             , ""],
    ["fldmiax"          , "[Rn]{!}, VdList"                             , "T32", "1110|11001|Vd'|W1|Rn|Vd|1011|VdList[7:1]|1"             , ""],
    ["fldmiax"          , "[Rn]{!}, VdList"                             , "A32", "Cond|11001|Vd'|W1|Rn|Vd|1011|VdList[7:1]|1"             , ""],
    ["fstmdbx"          , "[Rn]   , VsList"                             , "T32", "1110|11010|Vs'|10|Rn|Vs|1011|VsList[7:1]|1"             , ""],
    ["fstmdbx"          , "[Rn]   , VsList"                             , "A32", "Cond|11010|Vs'|10|Rn|Vs|1011|VsList[7:1]|1"             , ""],
    ["fstmiax"          , "[Rn]{!}, VsList"                             , "T32", "1110|11001|Vs'|W0|Rn|Vs|1011|VsList[7:1]|1"             , ""],
    ["fstmiax"          , "[Rn]{!}, VsList"                             , "A32", "Cond|11001|Vs'|W0|Rn|Vs|1011|VsList[7:1]|1"             , ""],

    ["sha1c.32"         , "Vx, Vn, Vm"                                  , "T32", "1110|11110|Vx'|00|Vn|Vx|1100|Vn'|1|Vm'|0|Vm"            , ""],
    ["sha1c.32"         , "Vx, Vn, Vm"                                  , "A32", "1111|00100|Vx'|00|Vn|Vx|1100|Vn'|1|Vm'|0|Vm"            , ""],
    ["sha1h.32"         , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|1001|Vd|0|0101|1|Vn'|0|Vn"            , ""],
    ["sha1h.32"         , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|1001|Vd|0|0101|1|Vn'|0|Vn"            , ""],
    ["sha1m.32"         , "Vx, Vn, Vm"                                  , "T32", "1110|11110|Vx'|10|Vn|Vx|1100|Vn'|1|Vm'|0|Vm"            , ""],
    ["sha1m.32"         , "Vx, Vn, Vm"                                  , "A32", "1111|00100|Vx'|10|Vn|Vx|1100|Vn'|1|Vm'|0|Vm"            , ""],
    ["sha1p.32"         , "Vx, Vn, Vm"                                  , "T32", "1110|11110|Vx'|01|Vn|Vx|1100|Vn'|1|Vm'|0|Vm"            , ""],
    ["sha1p.32"         , "Vx, Vn, Vm"                                  , "A32", "1111|00100|Vx'|01|Vn|Vx|1100|Vn'|1|Vm'|0|Vm"            , ""],
    ["sha1su0.32"       , "Vx, Vn, Vm"                                  , "T32", "1110|11110|Vx'|11|Vn|Vx|1100|Vn'|1|Vm'|0|Vm"            , ""],
    ["sha1su0.32"       , "Vx, Vn, Vm"                                  , "A32", "1111|00100|Vx'|11|Vn|Vx|1100|Vn'|1|Vm'|0|Vm"            , ""],
    ["sha1su1.32"       , "Vx, Vn"                                      , "T32", "1111|11111|Vx'|11|1010|Vx|0|0111|0|Vn'|0|Vn"            , ""],
    ["sha1su1.32"       , "Vx, Vn"                                      , "A32", "1111|00111|Vx'|11|1010|Vx|0|0111|0|Vn'|0|Vn"            , ""],

    ["sha256h.32"       , "Vx, Vn, Vm"                                  , "T32", "1111|11110|Vx'|00|Vn|Vx|1100|Vn'|1|Vm'|0|Vm"            , ""],
    ["sha256h.32"       , "Vx, Vn, Vm"                                  , "A32", "1111|00110|Vx'|00|Vn|Vx|1100|Vn'|1|Vm'|0|Vm"            , ""],
    ["sha256h2.32"      , "Vx, Vn, Vm"                                  , "T32", "1111|11110|Vx'|01|Vn|Vx|1100|Vn'|1|Vm'|0|Vm"            , ""],
    ["sha256h2.32"      , "Vx, Vn, Vm"                                  , "A32", "1111|00110|Vx'|01|Vn|Vx|1100|Vn'|1|Vm'|0|Vm"            , ""],
    ["sha256su0.32"     , "Vx, Vn"                                      , "T32", "1111|11111|Vx'|11|1010|Vx|0|0111|1|Vn'|0|Vn"            , ""],
    ["sha256su0.32"     , "Vx, Vn"                                      , "A32", "1111|00111|Vx'|11|1010|Vx|0|0111|1|Vn'|0|Vn"            , ""],
    ["sha256su1.32"     , "Vx, Vn, Vm"                                  , "T32", "1111|11110|Vx'|10|Vn|Vx|1100|Vn'|1|Vm'|0|Vm"            , ""],
    ["sha256su1.32"     , "Vx, Vn, Vm"                                  , "A32", "1111|00110|Vx'|10|Vn|Vx|1100|Vn'|1|Vm'|0|Vm"            , ""],

    ["vaba.x8-32"       , "Dd, Dn, Dm"                                  , "T32", "111U|111U0|Vd'|Sz|Vn|Vd|0111|Vn'|0|Vm'|0|Vm"            , ""],
    ["vaba.x8-32"       , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0111|Vn'|0|Vm'|0|Vm"            , ""],
    ["vaba.x8-32"       , "Vd, Vn, Vm"                                  , "T32", "111U|111U0|Vd'|Sz|Vn|Vd|0111|Vn'|1|Vm'|0|Vm"            , ""],
    ["vaba.x8-32"       , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0111|Vn'|1|Vm'|0|Vm"            , ""],

    ["vabal.x8-32"      , "Vd, Dn, Dm"                                  , "T32", "111U|11111|Vd'|Sz|Vn|Vd|0101|Vn'|0|Vm'|0|Vm"            , ""],
    ["vabal.x8-32"      , "Vd, Dn, Dm"                                  , "A32", "1111|001U1|Vd'|Sz|Vn|Vd|0101|Vn'|0|Vm'|0|Vm"            , ""],

    ["vabd.f32"         , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|Sz|Vn|Vd|1101|Vn'|0|Vm'|0|Vm"            , ""],
    ["vabd.f32"         , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|Sz|Vn|Vd|1101|Vn'|0|Vm'|0|Vm"            , ""],
    ["vabd.f32"         , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|Sz|Vn|Vd|1101|Vn'|1|Vm'|0|Vm"            , ""],
    ["vabd.f32"         , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|Sz|Vn|Vd|1101|Vn'|1|Vm'|0|Vm"            , ""],

    ["vabd.x8-32"       , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0111|Vn'|0|Vm'|0|Vm"            , ""],
    ["vabd.x8-32"       , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0111|Vn'|0|Vm'|0|Vm"            , ""],
    ["vabd.x8-32"       , "Vd, Vn, Vm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0111|Vn'|1|Vm'|0|Vm"            , ""],
    ["vabd.x8-32"       , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0111|Vn'|1|Vm'|0|Vm"            , ""],

    ["vabdl.x8-32"      , "Vd, Dn, Dm"                                  , "T32", "111U|11111|Vd'|Sz|Vn|Vd|0111|Vn'|0|Vm'|0|Vm"            , ""],
    ["vabdl.x8-32"      , "Vd, Dn, Dm"                                  , "A32", "1111|001U1|Vd'|Sz|Vn|Vd|0111|Vn'|0|Vm'|0|Vm"            , ""],

    ["vabs.f32"         , "Sd, Sn"                                      , "T32", "1110|11101|'Vd|11|00|00|Vd|10|10|1|1|'Vn|0|Vn"          , ""],
    ["vabs.f32"         , "Sd, Sn"                                      , "A32", "Cond|11101|'Vd|11|00|00|Vd|10|10|1|1|'Vn|0|Vn"          , ""],
    ["vabs.f64"         , "Dd, Dn"                                      , "T32", "1110|11101|Vd'|11|00|00|Vd|10|11|1|1|Vn'|0|Vn"          , ""],
    ["vabs.f64"         , "Dd, Dn"                                      , "A32", "Cond|11101|Vd'|11|00|00|Vd|10|11|1|1|Vn'|0|Vn"          , ""],

    ["vabs.f32|x8-32"   , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|Sz|01|Vd|0F|11|0|0|Vn'|0|Vn"          , ""],
    ["vabs.f32|x8-32"   , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|Sz|01|Vd|0F|11|0|0|Vn'|0|Vn"          , ""],
    ["vabs.f32|x8-32"   , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|Sz|01|Vd|0F|11|0|1|Vn'|0|Vn"          , ""],
    ["vabs.f32|x8-32"   , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|Sz|01|Vd|0F|11|0|1|Vn'|0|Vn"          , ""],

    ["vacge.f32"        , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|00|Vn|Vd|1110|Vn'|0|Vm'|1|Vm"            , ""],
    ["vacge.f32"        , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|00|Vn|Vd|1110|Vn'|0|Vm'|1|Vm"            , ""],
    ["vacge.f32"        , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|00|Vn|Vd|1110|Vn'|1|Vm'|1|Vm"            , ""],
    ["vacge.f32"        , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|00|Vn|Vd|1110|Vn'|1|Vm'|1|Vm"            , ""],

    ["vacgt.f32"        , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|10|Vn|Vd|1110|Vn'|0|Vm'|1|Vm"            , ""],
    ["vacgt.f32"        , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|10|Vn|Vd|1110|Vn'|0|Vm'|1|Vm"            , ""],
    ["vacgt.f32"        , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|10|Vn|Vd|1110|Vn'|1|Vm'|1|Vm"            , ""],
    ["vacgt.f32"        , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|10|Vn|Vd|1110|Vn'|1|Vm'|1|Vm"            , ""],

    ["vacle.f32"        , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|00|Vm|Vd|1110|Vm'|0|Vn'|1|Vn"            , ""],
    ["vacle.f32"        , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|00|Vm|Vd|1110|Vm'|0|Vn'|1|Vn"            , ""],
    ["vacle.f32"        , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|00|Vm|Vd|1110|Vm'|1|Vn'|1|Vn"            , ""],
    ["vacle.f32"        , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|00|Vm|Vd|1110|Vm'|1|Vn'|1|Vn"            , ""],

    ["vaclt.f32"        , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|10|Vm|Vd|1110|Vm'|0|Vn'|1|Vn"            , ""],
    ["vaclt.f32"        , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|10|Vm|Vd|1110|Vm'|0|Vn'|1|Vn"            , ""],
    ["vaclt.f32"        , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|10|Vm|Vd|1110|Vm'|1|Vn'|1|Vn"            , ""],
    ["vaclt.f32"        , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|10|Vm|Vd|1110|Vm'|1|Vn'|1|Vn"            , ""],

    ["vadd.f32"         , "Sd, Sn, Sm"                                  , "T32", "1110|11100|Vd'|11|Vn|Vd|1010|Vn'|0|Vm'|0|Vm"            , ""],
    ["vadd.f32"         , "Sd, Sn, Sm"                                  , "A32", "Cond|11100|Vd'|11|Vn|Vd|1010|Vn'|0|Vm'|0|Vm"            , ""],
    ["vadd.f64"         , "Dd, Dn, Dm"                                  , "T32", "1110|11100|Vd'|11|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , ""],
    ["vadd.f64"         , "Dd, Dn, Dm"                                  , "A32", "Cond|11100|Vd'|11|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , ""],

    ["vadd.f32"         , "Dd, Dn, Dm"                                  , "T32", "1110|11110|Vd'|00|Vn|Vd|1101|Vn'|0|Vm'|0|Vm"            , ""],
    ["vadd.f32"         , "Dd, Dn, Dm"                                  , "A32", "1111|00100|Vd'|00|Vn|Vd|1101|Vn'|0|Vm'|0|Vm"            , ""],
    ["vadd.f32"         , "Vd, Vn, Vm"                                  , "T32", "1110|11110|Vd'|00|Vn|Vd|1101|Vn'|1|Vm'|0|Vm"            , ""],
    ["vadd.f32"         , "Vd, Vn, Vm"                                  , "A32", "1111|00100|Vd'|00|Vn|Vd|1101|Vn'|1|Vm'|0|Vm"            , ""],

    ["vadd.x8-64"       , "Dd, Dn, Dm"                                  , "T32", "1110|11110|Vd'|Sz|Vn|Vd|1000|Vn'|0|Vm'|0|Vm"            , ""],
    ["vadd.x8-64"       , "Dd, Dn, Dm"                                  , "A32", "1111|00100|Vd'|Sz|Vn|Vd|1000|Vn'|0|Vm'|0|Vm"            , ""],
    ["vadd.x8-64"       , "Vd, Vn, Vm"                                  , "T32", "1110|11110|Vd'|Sz|Vn|Vd|1000|Vn'|1|Vm'|0|Vm"            , ""],
    ["vadd.x8-64"       , "Vd, Vn, Vm"                                  , "A32", "1111|00100|Vd'|Sz|Vn|Vd|1000|Vn'|1|Vm'|0|Vm"            , ""],

    ["vaddhn.x8-32"     , "Dd, Vn, Vm"                                  , "T32", "1110|11111|Vd'|Sz|Vn|Vd|0100|Vn'|0|Vm'|0|Vm"            , "VEC_NARROW"],
    ["vaddhn.x8-32"     , "Dd, Vn, Vm"                                  , "A32", "1111|00100|Vd'|Sz|Vn|Vd|0100|Vn'|0|Vm'|0|Vm"            , "VEC_NARROW"],

    ["vaddl.x8-32"      , "Vd, Dn, Dm"                                  , "T32", "111U|11111|Vd'|Sz|Vn|Vd|0000|Vn'|0|Vm'|0|Vm"            , "VEC_WIDEN"],
    ["vaddl.x8-32"      , "Vd, Dn, Dm"                                  , "A32", "1111|001U1|Vd'|Sz|Vn|Vd|0000|Vn'|0|Vm'|0|Vm"            , "VEC_WIDEN"],

    ["vaddw.x8-32"      , "Vd, Vn, Dm"                                  , "T32", "111U|11111|Vd'|Sz|Vn|Vd|0001|Vn'|0|Vm'|0|Vm"            , "VEC_WIDEN"],
    ["vaddw.x8-32"      , "Vd, Vn, Dm"                                  , "A32", "1111|001U1|Vd'|Sz|Vn|Vd|0001|Vn'|0|Vm'|0|Vm"            , "VEC_WIDEN"],

    ["vand.any"         , "Dx, Dx, #ImmV"                               , "T32", "111|ImmV:1|11111|Vd'|000|ImmV:3|Vd|CMode|00|Op|1|ImmV:4", "Op_CMode=1.0xx1|1.10x1 EncodeAs=vbic"],
    ["vand.any"         , "Dx, Dx, #ImmV"                               , "A32", "1111001|ImmV:1|1|Vd'|000|ImmV:3|Vd|CMode|00|Op|1|ImmV:4", "Op_CMode=1.0xx1|1.10x1 EncodeAs=vbic"],
    ["vand.any"         , "Vx, Vx, #ImmV"                               , "T32", "111|ImmV:1|11111|Vd'|000|ImmV:3|Vd|CMode|01|Op|1|ImmV:4", "Op_CMode=1.0xx1|1.10x1 EncodeAs=vbic"],
    ["vand.any"         , "Vx, Vx, #ImmV"                               , "A32", "1111001|ImmV:1|1|Vd'|000|ImmV:3|Vd|CMode|01|Op|1|ImmV:4", "Op_CMode=1.0xx1|1.10x1 EncodeAs=vbic"],

    ["vand.any"         , "Dd, Dn, Dm"                                  , "T32", "1110|11110|Vd'|00|Vn|Vd|0001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vand.any"         , "Dd, Dn, Dm"                                  , "A32", "1111|00100|Vd'|00|Vn|Vd|0001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vand.any"         , "Vd, Vn, Vm"                                  , "T32", "1110|11110|Vd'|00|Vn|Vd|0001|Vn'|1|Vm'|1|Vm"            , ""],
    ["vand.any"         , "Vd, Vn, Vm"                                  , "A32", "1111|00100|Vd'|00|Vn|Vd|0001|Vn'|1|Vm'|1|Vm"            , ""],

    ["vbic.any"         , "Dx, Dx, #ImmV"                               , "T32", "111|ImmV:1|11111|Vd'|000|ImmV:3|Vd|CMode|00|Op|1|ImmV:4", "Op_CMode=1.0xx1|1.10x1"],
    ["vbic.any"         , "Dx, Dx, #ImmV"                               , "A32", "1111001|ImmV:1|1|Vd'|000|ImmV:3|Vd|CMode|00|Op|1|ImmV:4", "Op_CMode=1.0xx1|1.10x1"],
    ["vbic.any"         , "Vx, Vx, #ImmV"                               , "T32", "111|ImmV:1|11111|Vd'|000|ImmV:3|Vd|CMode|01|Op|1|ImmV:4", "Op_CMode=1.0xx1|1.10x1"],
    ["vbic.any"         , "Vx, Vx, #ImmV"                               , "A32", "1111001|ImmV:1|1|Vd'|000|ImmV:3|Vd|CMode|01|Op|1|ImmV:4", "Op_CMode=1.0xx1|1.10x1"],

    ["vbic.any"         , "Dd, Dn, Dm"                                  , "T32", "1110|11110|Vd'|01|Vn|Vd|0001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vbic.any"         , "Dd, Dn, Dm"                                  , "A32", "1111|00100|Vd'|01|Vn|Vd|0001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vbic.any"         , "Vd, Vn, Vm"                                  , "T32", "1110|11110|Vd'|01|Vn|Vd|0001|Vn'|1|Vm'|1|Vm"            , ""],
    ["vbic.any"         , "Vd, Vn, Vm"                                  , "A32", "1111|00100|Vd'|01|Vn|Vd|0001|Vn'|1|Vm'|1|Vm"            , ""],

    ["vbif.any"         , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|11|Vn|Vd|0001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vbif.any"         , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|11|Vn|Vd|0001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vbif.any"         , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|11|Vn|Vd|0001|Vn'|1|Vm'|1|Vm"            , ""],
    ["vbif.any"         , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|11|Vn|Vd|0001|Vn'|1|Vm'|1|Vm"            , ""],

    ["vbit.any"         , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|10|Vn|Vd|0001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vbit.any"         , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|10|Vn|Vd|0001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vbit.any"         , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|10|Vn|Vd|0001|Vn'|1|Vm'|1|Vm"            , ""],
    ["vbit.any"         , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|10|Vn|Vd|0001|Vn'|1|Vm'|1|Vm"            , ""],

    ["vbsl.any"         , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|01|Vn|Vd|0001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vbsl.any"         , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|01|Vn|Vd|0001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vbsl.any"         , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|01|Vn|Vd|0001|Vn'|1|Vm'|1|Vm"            , ""],
    ["vbsl.any"         , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|01|Vn|Vd|0001|Vn'|1|Vm'|1|Vm"            , ""],

    ["vceq.f32"         , "Dd, Dn, #0"                                  , "T32", "1111|11111|Vd'|11|10|01|Vd|01010|0|Vn'|0|Vn"            , ""],
    ["vceq.f32"         , "Dd, Dn, #0"                                  , "A32", "1111|00111|Vd'|11|10|01|Vd|01010|0|Vn'|0|Vn"            , ""],
    ["vceq.f32"         , "Vd, Vn, #0"                                  , "T32", "1111|11111|Vd'|11|10|01|Vd|01010|1|Vn'|0|Vn"            , ""],
    ["vceq.f32"         , "Vd, Vn, #0"                                  , "A32", "1111|00111|Vd'|11|10|01|Vd|01010|1|Vn'|0|Vn"            , ""],

    ["vceq.x8-32"       , "Dd, Dn, #0"                                  , "T32", "1111|11111|Vd'|11|Sz|01|Vd|00010|0|Vn'|0|Vn"            , ""],
    ["vceq.x8-32"       , "Dd, Dn, #0"                                  , "A32", "1111|00111|Vd'|11|Sz|01|Vd|00010|0|Vn'|0|Vn"            , ""],
    ["vceq.x8-32"       , "Vd, Vn, #0"                                  , "T32", "1111|11111|Vd'|11|Sz|01|Vd|00010|1|Vn'|0|Vn"            , ""],
    ["vceq.x8-32"       , "Vd, Vn, #0"                                  , "A32", "1111|00111|Vd'|11|Sz|01|Vd|00010|1|Vn'|0|Vn"            , ""],

    ["vceq.f32"         , "Dd, Dn, Dm"                                  , "T32", "1110|11110|Vd'|00|Vn|Vd|1110|Vn'|0|Vm'|0|Vm"            , ""],
    ["vceq.f32"         , "Dd, Dn, Dm"                                  , "A32", "1111|00100|Vd'|00|Vn|Vd|1110|Vn'|0|Vm'|0|Vm"            , ""],
    ["vceq.f32"         , "Vd, Vn, Vm"                                  , "T32", "1110|11110|Vd'|00|Vn|Vd|1110|Vn'|1|Vm'|0|Vm"            , ""],
    ["vceq.f32"         , "Vd, Vn, Vm"                                  , "A32", "1111|00100|Vd'|00|Vn|Vd|1110|Vn'|1|Vm'|0|Vm"            , ""],

    ["vceq.x8-32"       , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|Sz|Vn|Vd|1000|Vn'|0|Vm'|1|Vm"            , ""],
    ["vceq.x8-32"       , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|Sz|Vn|Vd|1000|Vn'|0|Vm'|1|Vm"            , ""],
    ["vceq.x8-32"       , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|Sz|Vn|Vd|1000|Vn'|1|Vm'|1|Vm"            , ""],
    ["vceq.x8-32"       , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|Sz|Vn|Vd|1000|Vn'|1|Vm'|1|Vm"            , ""],

    ["vcge.f32"         , "Dd, Dn, #0"                                  , "T32", "1111|11111|Vd'|11|10|01|Vd|01001|0|Vn'|0|Vn"            , ""],
    ["vcge.f32"         , "Dd, Dn, #0"                                  , "A32", "1111|00111|Vd'|11|10|01|Vd|01001|0|Vn'|0|Vn"            , ""],
    ["vcge.f32"         , "Vd, Vn, #0"                                  , "T32", "1111|11111|Vd'|11|10|01|Vd|01001|1|Vn'|0|Vn"            , ""],
    ["vcge.f32"         , "Vd, Vn, #0"                                  , "A32", "1111|00111|Vd'|11|10|01|Vd|01001|1|Vn'|0|Vn"            , ""],

    ["vcge.x8-32"       , "Dd, Dn, #0"                                  , "T32", "1111|11111|Vd'|11|Sz|01|Vd|00001|0|Vn'|0|Vn"            , ""],
    ["vcge.x8-32"       , "Dd, Dn, #0"                                  , "A32", "1111|00111|Vd'|11|Sz|01|Vd|00001|0|Vn'|0|Vn"            , ""],
    ["vcge.x8-32"       , "Vd, Vn, #0"                                  , "T32", "1111|11111|Vd'|11|Sz|01|Vd|00001|1|Vn'|0|Vn"            , ""],
    ["vcge.x8-32"       , "Vd, Vn, #0"                                  , "A32", "1111|00111|Vd'|11|Sz|01|Vd|00001|1|Vn'|0|Vn"            , ""],

    ["vcge.f32"         , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|00|Vn|Vd|1110|Vn'|0|Vm'|0|Vm"            , ""],
    ["vcge.f32"         , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|00|Vn|Vd|1110|Vn'|0|Vm'|0|Vm"            , ""],
    ["vcge.f32"         , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|00|Vn|Vd|1110|Vn'|1|Vm'|0|Vm"            , ""],
    ["vcge.f32"         , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|00|Vn|Vd|1110|Vn'|1|Vm'|0|Vm"            , ""],

    ["vcge.x8-x32"      , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0011|Vn'|0|Vm'|1|Vm"            , ""],
    ["vcge.x8-x32"      , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0011|Vn'|0|Vm'|1|Vm"            , ""],
    ["vcge.x8-x32"      , "Vd, Vn, Vm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0011|Vn'|1|Vm'|1|Vm"            , ""],
    ["vcge.x8-x32"      , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0011|Vn'|1|Vm'|1|Vm"            , ""],

    ["vcgt.f32"         , "Dd, Dn, #0"                                  , "T32", "1111|11111|Vd'|11|10|01|Vd|01000|0|Vn'|0|Vn"            , ""],
    ["vcgt.f32"         , "Dd, Dn, #0"                                  , "A32", "1111|00111|Vd'|11|10|01|Vd|01000|0|Vn'|0|Vn"            , ""],
    ["vcgt.f32"         , "Vd, Vn, #0"                                  , "T32", "1111|11111|Vd'|11|10|01|Vd|01000|1|Vn'|0|Vn"            , ""],
    ["vcgt.f32"         , "Vd, Vn, #0"                                  , "A32", "1111|00111|Vd'|11|10|01|Vd|01000|1|Vn'|0|Vn"            , ""],

    ["vcgt.x8-x32"      , "Dd, Dn, #0"                                  , "T32", "1111|11111|Vd'|11|Sz|01|Vd|00000|0|Vn'|0|Vn"            , ""],
    ["vcgt.x8-x32"      , "Dd, Dn, #0"                                  , "A32", "1111|00111|Vd'|11|Sz|01|Vd|00000|0|Vn'|0|Vn"            , ""],
    ["vcgt.x8-x32"      , "Vd, Vn, #0"                                  , "T32", "1111|11111|Vd'|11|Sz|01|Vd|00000|1|Vn'|0|Vn"            , ""],
    ["vcgt.x8-x32"      , "Vd, Vn, #0"                                  , "A32", "1111|00111|Vd'|11|Sz|01|Vd|00000|1|Vn'|0|Vn"            , ""],

    ["vcgt.f32"         , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|10|Vn|Vd|1110|Vn'|0|Vm'|0|Vm"            , ""],
    ["vcgt.f32"         , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|10|Vn|Vd|1110|Vn'|0|Vm'|0|Vm"            , ""],
    ["vcgt.f32"         , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|10|Vn|Vd|1110|Vn'|1|Vm'|0|Vm"            , ""],
    ["vcgt.f32"         , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|10|Vn|Vd|1110|Vn'|1|Vm'|0|Vm"            , ""],

    ["vcgt.x8-x32"      , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0011|Vn'|0|Vm'|0|Vm"            , ""],
    ["vcgt.x8-x32"      , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0011|Vn'|0|Vm'|0|Vm"            , ""],
    ["vcgt.x8-x32"      , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0011|Vn'|1|Vm'|0|Vm"            , ""],
    ["vcgt.x8-x32"      , "Vd, Vn, Vm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0011|Vn'|1|Vm'|0|Vm"            , ""],

    ["vcle.f32"         , "Dd, Dn, #0"                                  , "T32", "1111|11111|Vd'|11|10|01|Vd|01011|0|Vn'|0|Vn"            , ""],
    ["vcle.f32"         , "Dd, Dn, #0"                                  , "A32", "1111|00111|Vd'|11|10|01|Vd|01011|0|Vn'|0|Vn"            , ""],
    ["vcle.f32"         , "Vd, Vn, #0"                                  , "T32", "1111|11111|Vd'|11|10|01|Vd|01011|1|Vn'|0|Vn"            , ""],
    ["vcle.f32"         , "Vd, Vn, #0"                                  , "A32", "1111|00111|Vd'|11|10|01|Vd|01011|1|Vn'|0|Vn"            , ""],

    ["vcle.x8-x32"      , "Dd, Dn, #0"                                  , "T32", "1111|11111|Vd'|11|Sz|01|Vd|00011|0|Vn'|0|Vn"            , ""],
    ["vcle.x8-x32"      , "Dd, Dn, #0"                                  , "A32", "1111|00111|Vd'|11|Sz|01|Vd|00011|0|Vn'|0|Vn"            , ""],
    ["vcle.x8-x32"      , "Vd, Vn, #0"                                  , "T32", "1111|11111|Vd'|11|Sz|01|Vd|00011|1|Vn'|0|Vn"            , ""],
    ["vcle.x8-x32"      , "Vd, Vn, #0"                                  , "A32", "1111|00111|Vd'|11|Sz|01|Vd|00011|1|Vn'|0|Vn"            , ""],

    ["vcle.f32"         , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|00|Vm|Vd|1110|Vm'|0|Vn'|0|Vn"            , ""],
    ["vcle.f32"         , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|00|Vm|Vd|1110|Vm'|0|Vn'|0|Vn"            , ""],
    ["vcle.f32"         , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|00|Vm|Vd|1110|Vm'|1|Vn'|0|Vn"            , ""],
    ["vcle.f32"         , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|00|Vm|Vd|1110|Vm'|1|Vn'|0|Vn"            , ""],

    ["vcle.x8-x32"      , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vm|Vd|0011|Vm'|0|Vn'|1|Vn"            , ""],
    ["vcle.x8-x32"      , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vm|Vd|0011|Vm'|0|Vn'|1|Vn"            , ""],
    ["vcle.x8-x32"      , "Vd, Vn, Vm"                                  , "T32", "111U|11110|Vd'|Sz|Vm|Vd|0011|Vm'|1|Vn'|1|Vn"            , ""],
    ["vcle.x8-x32"      , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vm|Vd|0011|Vm'|1|Vn'|1|Vn"            , ""],

    ["vcls.x8-x32"      , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|01000|0|Vn'|0|Vn"            , ""],
    ["vcls.x8-x32"      , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|01000|0|Vn'|0|Vn"            , ""],
    ["vcls.x8-x32"      , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|01000|1|Vn'|0|Vn"            , ""],
    ["vcls.x8-x32"      , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|01000|1|Vn'|0|Vn"            , ""],

    ["vclt.f32"         , "Dd, Dn, #0"                                  , "T32", "1111|11111|Vd'|11|10|01|Vd|01100|0|Vn'|0|Vn"            , ""],
    ["vclt.f32"         , "Dd, Dn, #0"                                  , "A32", "1111|00111|Vd'|11|10|01|Vd|01100|0|Vn'|0|Vn"            , ""],
    ["vclt.f32"         , "Vd, Vn, #0"                                  , "T32", "1111|11111|Vd'|11|10|01|Vd|01100|1|Vn'|0|Vn"            , ""],
    ["vclt.f32"         , "Vd, Vn, #0"                                  , "A32", "1111|00111|Vd'|11|10|01|Vd|01100|1|Vn'|0|Vn"            , ""],

    ["vclt.x8-32"       , "Dd, Dn, #0"                                  , "T32", "1111|11111|Vd'|11|Sz|01|Vd|00100|0|Vn'|0|Vn"            , ""],
    ["vclt.x8-32"       , "Dd, Dn, #0"                                  , "A32", "1111|00111|Vd'|11|Sz|01|Vd|00100|0|Vn'|0|Vn"            , ""],
    ["vclt.x8-32"       , "Vd, Vn, #0"                                  , "T32", "1111|11111|Vd'|11|Sz|01|Vd|00100|1|Vn'|0|Vn"            , ""],
    ["vclt.x8-32"       , "Vd, Vn, #0"                                  , "A32", "1111|00111|Vd'|11|Sz|01|Vd|00100|1|Vn'|0|Vn"            , ""],

    ["vclt.f32"         , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|10|Vm|Vd|1110|Vm'|0|Vn'|0|Vn"            , ""],
    ["vclt.f32"         , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|10|Vm|Vd|1110|Vm'|0|Vn'|0|Vn"            , ""],
    ["vclt.f32"         , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|10|Vm|Vd|1110|Vm'|1|Vn'|0|Vn"            , ""],
    ["vclt.f32"         , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|10|Vm|Vd|1110|Vm'|1|Vn'|0|Vn"            , ""],

    ["vclt.x8-32"       , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vm|Vd|0011|Vm'|0|Vn'|0|Vn"            , ""],
    ["vclt.x8-32"       , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vm|Vd|0011|Vm'|0|Vn'|0|Vn"            , ""],
    ["vclt.x8-32"       , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vm|Vd|0011|Vm'|1|Vn'|0|Vn"            , ""],
    ["vclt.x8-32"       , "Vd, Vn, Vm"                                  , "T32", "111U|11110|Vd'|Sz|Vm|Vd|0011|Vm'|1|Vn'|0|Vn"            , ""],

    ["vclz.x8-32"       , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|01001|0|Vn'|0|Vn"            , ""],
    ["vclz.x8-32"       , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|01001|0|Vn'|0|Vn"            , ""],
    ["vclz.x8-32"       , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|01001|1|Vn'|0|Vn"            , ""],
    ["vclz.x8-32"       , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|01001|1|Vn'|0|Vn"            , ""],

    ["vcmp.f32"         , "Sn, #0"                                      , "T32", "1110|11101|'Vn|11|01|01|Vn|10100|1|0|0|0000"            , ""],
    ["vcmp.f32"         , "Sn, #0"                                      , "A32", "Cond|11101|'Vn|11|01|01|Vn|10100|1|0|0|0000"            , ""],
    ["vcmp.f64"         , "Dn, #0"                                      , "T32", "1110|11101|Vn'|11|01|01|Vn|10110|1|0|0|0000"            , ""],
    ["vcmp.f64"         , "Dn, #0"                                      , "A32", "Cond|11101|Vn'|11|01|01|Vn|10110|1|0|0|0000"            , ""],

    ["vcmp.f32"         , "Sn, Sm"                                      , "T32", "1110|11101|'Vn|11|01|00|Vn|10100|1|'Vm|0|Vm"            , ""],
    ["vcmp.f32"         , "Sn, Sm"                                      , "A32", "Cond|11101|'Vn|11|01|00|Vn|10100|1|'Vm|0|Vm"            , ""],
    ["vcmp.f64"         , "Dn, Dm"                                      , "T32", "1110|11101|Vn'|11|01|00|Vn|10110|1|Vm'|0|Vm"            , ""],
    ["vcmp.f64"         , "Dn, Dm"                                      , "A32", "Cond|11101|Vn'|11|01|00|Vn|10110|1|Vm'|0|Vm"            , ""],

    ["vcmpe.f32"        , "Sn, #0"                                      , "T32", "1110|11101|'Vn|11|01|01|Vn|10101|1|0|0|0000"            , ""],
    ["vcmpe.f32"        , "Sn, #0"                                      , "A32", "Cond|11101|'Vn|11|01|01|Vn|10101|1|0|0|0000"            , ""],
    ["vcmpe.f64"        , "Dn, #0"                                      , "T32", "1110|11101|Vn'|11|01|01|Vn|10111|1|0|0|0000"            , ""],
    ["vcmpe.f64"        , "Dn, #0"                                      , "A32", "Cond|11101|Vn'|11|01|01|Vn|10111|1|0|0|0000"            , ""],

    ["vcmpe.f32"        , "Sn, Sm"                                      , "T32", "1110|11101|'Vn|11|01|00|Vn|10101|1|'Vm|0|Vm"            , ""],
    ["vcmpe.f32"        , "Sn, Sm"                                      , "A32", "Cond|11101|'Vn|11|01|00|Vn|10101|1|'Vm|0|Vm"            , ""],
    ["vcmpe.f64"        , "Dn, Dm"                                      , "T32", "1110|11101|Vn'|11|01|00|Vn|10111|1|Vm'|0|Vm"            , ""],
    ["vcmpe.f64"        , "Dn, Dm"                                      , "A32", "Cond|11101|Vn'|11|01|00|Vn|10111|1|Vm'|0|Vm"            , ""],

    ["vcnt.x8-32"       , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|01010|0|Vn'|0|Vn"            , ""],
    ["vcnt.x8-32"       , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|01010|0|Vn'|0|Vn"            , ""],
    ["vcnt.x8-32"       , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|01010|1|Vn'|0|Vn"            , ""],
    ["vcnt.x8-32"       , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|01010|1|Vn'|0|Vn"            , ""],

    ["vcvt.f32.f64"     , "Sd, Dn"                                      , "T32", "1110|11101|'Vd|11|01|11|Vd|10111|1|'Vn|0|Vn"            , ""],
    ["vcvt.f32.f64"     , "Sd, Dn"                                      , "A32", "Cond|11101|'Vd|11|01|11|Vd|10111|1|'Vn|0|Vn"            , ""],
    ["vcvt.f64.f32"     , "Dd, Sn"                                      , "T32", "1110|11101|Vd'|11|01|11|Vd|10101|1|Vn'|0|Vn"            , ""],
    ["vcvt.f64.f32"     , "Dd, Sn"                                      , "A32", "Cond|11101|Vd'|11|01|11|Vd|10101|1|Vn'|0|Vn"            , ""],

    ["vcvt.f32.s32"     , "Sd, Sn"                                      , "T32", "1110|11101|'Vd|11|10|00|Vd|10101|1|'Vn|0|Vn"            , ""],
    ["vcvt.f32.s32"     , "Sd, Sn"                                      , "A32", "Cond|11101|'Vd|11|10|00|Vd|10101|1|'Vn|0|Vn"            , ""],
    ["vcvt.f64.s32"     , "Dd, Sn"                                      , "T32", "1110|11101|Vd'|11|10|00|Vd|10111|1|'Vn|0|Vn"            , ""],
    ["vcvt.f64.s32"     , "Dd, Sn"                                      , "A32", "Cond|11101|Vd'|11|10|00|Vd|10111|1|'Vn|0|Vn"            , ""],

    ["vcvt.f32.u32"     , "Sd, Sn"                                      , "T32", "1110|11101|'Vd|11|10|00|Vd|10100|1|'Vn|0|Vn"            , ""],
    ["vcvt.f32.u32"     , "Sd, Sn"                                      , "A32", "Cond|11101|'Vd|11|10|00|Vd|10100|1|'Vn|0|Vn"            , ""],
    ["vcvt.f64.u32"     , "Dd, Sn"                                      , "T32", "1110|11101|Vd'|11|10|00|Vd|10110|1|'Vn|0|Vn"            , ""],
    ["vcvt.f64.u32"     , "Dd, Sn"                                      , "A32", "Cond|11101|Vd'|11|10|00|Vd|10110|1|'Vn|0|Vn"            , ""],

    ["vcvt.f16.f32"     , "Dd, Vn"                                      , "T32", "1111|11111|Vd'|11|01|10|Vd|01100|0|Vn'|0|Vn"            , ""],
    ["vcvt.f16.f32"     , "Dd, Vn"                                      , "A32", "1111|00111|Vd'|11|01|10|Vd|01100|0|Vn'|0|Vn"            , ""],
    ["vcvt.f32.f16"     , "Vd, Dn"                                      , "T32", "1111|11111|Vd'|11|01|10|Vd|01110|0|Vn'|0|Vn"            , ""],
    ["vcvt.f32.f16"     , "Vd, Dn"                                      , "A32", "1111|00111|Vd'|11|01|10|Vd|01110|0|Vn'|0|Vn"            , ""],

    ["vcvt.f32.x32"     , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|10|11|Vd|0110U|0|Vn'|0|Vn"            , ""],
    ["vcvt.f32.x32"     , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|10|11|Vd|0110U|0|Vn'|0|Vn"            , ""],
    ["vcvt.f32.x32"     , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|10|11|Vd|0110U|1|Vn'|0|Vn"            , ""],
    ["vcvt.f32.x32"     , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|10|11|Vd|0110U|1|Vn'|0|Vn"            , ""],

    ["vcvt.x32.f32"     , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|10|11|Vd|0111U|0|Vn'|0|Vn"            , ""],
    ["vcvt.x32.f32"     , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|10|11|Vd|0111U|0|Vn'|0|Vn"            , ""],
    ["vcvt.x32.f32"     , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|10|11|Vd|0111U|1|Vn'|0|Vn"            , ""],
    ["vcvt.x32.f32"     , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|10|11|Vd|0111U|1|Vn'|0|Vn"            , ""],

    ["vcvt.f32.x32"     , "Dd, Dn, #Frac>=8"                            , "T32", "111U|11111|Vd'|Frac:6|Vd|11100|0|Vn'|1|Vn"              , ""],
    ["vcvt.f32.x32"     , "Dd, Dn, #Frac>=8"                            , "A32", "1111|001U1|Vd'|Frac:6|Vd|11100|0|Vn'|1|Vn"              , ""],
    ["vcvt.f32.x32"     , "Vd, Vn, #Frac>=8"                            , "T32", "111U|11111|Vd'|Frac:6|Vd|11100|1|Vn'|1|Vn"              , ""],
    ["vcvt.f32.x32"     , "Vd, Vn, #Frac>=8"                            , "A32", "1111|001U1|Vd'|Frac:6|Vd|11100|1|Vn'|1|Vn"              , ""],

    ["vcvt.x32.f32"     , "Dd, Dn, #Frac>=8"                            , "T32", "111U|11111|Vd'|Frac:6|Vd|11110|0|Vn'|1|Vn"              , ""],
    ["vcvt.x32.f32"     , "Dd, Dn, #Frac>=8"                            , "A32", "1111|001U1|Vd'|Frac:6|Vd|11110|0|Vn'|1|Vn"              , ""],
    ["vcvt.x32.f32"     , "Vd, Vn, #Frac>=8"                            , "T32", "111U|11111|Vd'|Frac:6|Vd|11110|1|Vn'|1|Vn"              , ""],
    ["vcvt.x32.f32"     , "Vd, Vn, #Frac>=8"                            , "A32", "1111|001U1|Vd'|Frac:6|Vd|11110|1|Vn'|1|Vn"              , ""],

    ["vcvt.f32.x16"     , "Sx, Sx, #Frac"                               , "T32", "1110|11101|'Vx|11|10|1U|Vx|10100|1|Frac[0]|0|Frac[4:1]" , ""],
    ["vcvt.f32.x16"     , "Sx, Sx, #Frac"                               , "A32", "Cond|11101|'Vx|11|10|1U|Vx|10100|1|Frac[0]|0|Frac[4:1]" , ""],
    ["vcvt.f32.x32"     , "Sx, Sx, #Frac"                               , "T32", "1110|11101|'Vx|11|10|1U|Vx|10101|1|Frac[0]|0|Frac[4:1]" , ""],
    ["vcvt.f32.x32"     , "Sx, Sx, #Frac"                               , "A32", "Cond|11101|'Vx|11|10|1U|Vx|10101|1|Frac[0]|0|Frac[4:1]" , ""],

    ["vcvt.x16.f32"     , "Sx, Sx, #Frac"                               , "T32", "1110|11101|'Vx|11|11|1U|Vx|10100|1|Frac[0]|0|Frac[4:1]" , ""],
    ["vcvt.x16.f32"     , "Sx, Sx, #Frac"                               , "A32", "Cond|11101|'Vx|11|11|1U|Vx|10100|1|Frac[0]|0|Frac[4:1]" , ""],
    ["vcvt.x32.f32"     , "Sx, Sx, #Frac"                               , "T32", "1110|11101|'Vx|11|11|1U|Vx|10101|1|Frac[0]|0|Frac[4:1]" , ""],
    ["vcvt.x32.f32"     , "Sx, Sx, #Frac"                               , "A32", "Cond|11101|'Vx|11|11|1U|Vx|10101|1|Frac[0]|0|Frac[4:1]" , ""],

    ["vcvt.f64.x16"     , "Dx, Dx, #Frac"                               , "T32", "1110|11101|Vx'|11|10|1U|Vx|10110|1|Frac[0]|0|Frac[4:1]" , ""],
    ["vcvt.f64.x16"     , "Dx, Dx, #Frac"                               , "A32", "Cond|11101|Vx'|11|10|1U|Vx|10110|1|Frac[0]|0|Frac[4:1]" , ""],
    ["vcvt.f64.x32"     , "Dx, Dx, #Frac"                               , "T32", "1110|11101|Vx'|11|10|1U|Vx|10111|1|Frac[0]|0|Frac[4:1]" , ""],
    ["vcvt.f64.x32"     , "Dx, Dx, #Frac"                               , "A32", "Cond|11101|Vx'|11|10|1U|Vx|10111|1|Frac[0]|0|Frac[4:1]" , ""],

    ["vcvt.x16.f64"     , "Dx, Dx, #Frac"                               , "T32", "1110|11101|Vx'|11|11|1U|Vx|10110|1|Frac[0]|0|Frac[4:1]" , ""],
    ["vcvt.x16.f64"     , "Dx, Dx, #Frac"                               , "A32", "Cond|11101|Vx'|11|11|1U|Vx|10110|1|Frac[0]|0|Frac[4:1]" , ""],
    ["vcvt.x32.f64"     , "Dx, Dx, #Frac"                               , "T32", "1110|11101|Vx'|11|11|1U|Vx|10111|1|Frac[0]|0|Frac[4:1]" , ""],
    ["vcvt.x32.f64"     , "Dx, Dx, #Frac"                               , "A32", "Cond|11101|Vx'|11|11|1U|Vx|10111|1|Frac[0]|0|Frac[4:1]" , ""],

    ["vcvta.s32.f32"    , "Sd, Sn"                                      , "T32", "1111|11101|'Vd|11|11|00|Vd|10101|1|Vn'|0|Vn"            , ""],
    ["vcvta.s32.f32"    , "Sd, Sn"                                      , "A32", "1111|11101|'Vd|11|11|00|Vd|10101|1|Vn'|0|Vn"            , ""],
    ["vcvta.s32.f64"    , "Dd, Dn"                                      , "T32", "1111|11101|'Vd|11|11|00|Vd|10111|1|Vn'|0|Vn"            , ""],
    ["vcvta.s32.f64"    , "Dd, Dn"                                      , "A32", "1111|11101|'Vd|11|11|00|Vd|10111|1|Vn'|0|Vn"            , ""],

    ["vcvta.u32.f32"    , "Sd, Sn"                                      , "T32", "1111|11101|'Vd|11|11|00|Vd|10100|1|Vn'|0|Vn"            , ""],
    ["vcvta.u32.f32"    , "Sd, Sn"                                      , "A32", "1111|11101|'Vd|11|11|00|Vd|10100|1|Vn'|0|Vn"            , ""],
    ["vcvta.u32.f64"    , "Dd, Dn"                                      , "T32", "1111|11101|'Vd|11|11|00|Vd|10110|1|Vn'|0|Vn"            , ""],
    ["vcvta.u32.f64"    , "Dd, Dn"                                      , "A32", "1111|11101|'Vd|11|11|00|Vd|10110|1|Vn'|0|Vn"            , ""],

    ["vcvtb.f32.f16"    , "Sd, Sn"                                      , "T32", "1110|11101|'Vd|11|00|10|Vd|10100|1|'Vn|0|Vn"            , ""],
    ["vcvtb.f32.f16"    , "Sd, Sn"                                      , "A32", "Cond|11101|'Vd|11|00|10|Vd|10100|1|'Vn|0|Vn"            , ""],
    ["vcvtb.f16.f32"    , "Sd, Sn"                                      , "T32", "1110|11101|'Vd|11|00|11|Vd|10100|1|'Vn|0|Vn"            , ""],
    ["vcvtb.f16.f32"    , "Sd, Sn"                                      , "A32", "Cond|11101|'Vd|11|00|11|Vd|10100|1|'Vn|0|Vn"            , ""],

    ["vcvtb.f64.f16"    , "Dd, Sn"                                      , "T32", "1110|11101|Vd'|11|00|10|Vd|10110|1|'Vn|0|Vn"            , ""],
    ["vcvtb.f64.f16"    , "Dd, Sn"                                      , "A32", "Cond|11101|Vd'|11|00|10|Vd|10110|1|'Vn|0|Vn"            , ""],
    ["vcvtb.f16.f64"    , "Sd, Dn"                                      , "T32", "1110|11101|'Vd|11|00|11|Vd|10110|1|Vn'|0|Vn"            , ""],
    ["vcvtb.f16.f64"    , "Sd, Dn"                                      , "A32", "Cond|11101|'Vd|11|00|11|Vd|10110|1|Vn'|0|Vn"            , ""],

    ["vcvtm.x32.f32"    , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|Sz|11|Vd|0011U|0|Vn'|0|Vn"            , ""],
    ["vcvtm.x32.f32"    , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|Sz|11|Vd|0011U|0|Vn'|0|Vn"            , ""],
    ["vcvtm.x32.f32"    , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|Sz|11|Vd|0011U|1|Vn'|0|Vn"            , ""],
    ["vcvtm.x32.f32"    , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|Sz|11|Vd|0011U|1|Vn'|0|Vn"            , ""],

    ["vcvtm.s32.f32"    , "Sd, Sn"                                      , "T32", "1111|11101|'Vd|11|11|11|Vd|10101|1|Vn'|0|Vn"            , ""],
    ["vcvtm.s32.f32"    , "Sd, Sn"                                      , "A32", "1111|11101|'Vd|11|11|11|Vd|10101|1|Vn'|0|Vn"            , ""],
    ["vcvtm.s32.f64"    , "Sd, Dn"                                      , "T32", "1111|11101|'Vd|11|11|11|Vd|10111|1|Vn'|0|Vn"            , ""],
    ["vcvtm.s32.f64"    , "Sd, Dn"                                      , "A32", "1111|11101|'Vd|11|11|11|Vd|10111|1|Vn'|0|Vn"            , ""],

    ["vcvtm.u32.f32"    , "Sd, Sn"                                      , "T32", "1111|11101|'Vd|11|11|11|Vd|10100|1|Vn'|0|Vn"            , ""],
    ["vcvtm.u32.f32"    , "Sd, Sn"                                      , "A32", "1111|11101|'Vd|11|11|11|Vd|10100|1|Vn'|0|Vn"            , ""],
    ["vcvtm.u32.f64"    , "Sd, Dn"                                      , "T32", "1111|11101|'Vd|11|11|11|Vd|10110|1|Vn'|0|Vn"            , ""],
    ["vcvtm.u32.f64"    , "Sd, Dn"                                      , "A32", "1111|11101|'Vd|11|11|11|Vd|10110|1|Vn'|0|Vn"            , ""],

    ["vcvtn.x32.f32"    , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|Sz|11|Vd|0001U|0|Vn'|0|Vn"            , ""],
    ["vcvtn.x32.f32"    , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|Sz|11|Vd|0001U|0|Vn'|0|Vn"            , ""],
    ["vcvtn.x32.f32"    , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|Sz|11|Vd|0001U|1|Vn'|0|Vn"            , ""],
    ["vcvtn.x32.f32"    , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|Sz|11|Vd|0001U|1|Vn'|0|Vn"            , ""],

    ["vcvtn.s32.f32"    , "Sd, Sn"                                      , "T32", "1111|11101|'Vd|11|11|01|Vd|10101|1|Vn'|0|Vn"            , ""],
    ["vcvtn.s32.f32"    , "Sd, Sn"                                      , "A32", "1111|11101|'Vd|11|11|01|Vd|10101|1|Vn'|0|Vn"            , ""],
    ["vcvtn.s32.f64"    , "Sd, Dn"                                      , "T32", "1111|11101|'Vd|11|11|01|Vd|10111|1|Vn'|0|Vn"            , ""],
    ["vcvtn.s32.f64"    , "Sd, Dn"                                      , "A32", "1111|11101|'Vd|11|11|01|Vd|10111|1|Vn'|0|Vn"            , ""],

    ["vcvtn.u32.f32"    , "Sd, Sn"                                      , "T32", "1111|11101|'Vd|11|11|01|Vd|10100|1|Vn'|0|Vn"            , ""],
    ["vcvtn.u32.f32"    , "Sd, Sn"                                      , "A32", "1111|11101|'Vd|11|11|01|Vd|10100|1|Vn'|0|Vn"            , ""],
    ["vcvtn.u32.f64"    , "Sd, Dn"                                      , "T32", "1111|11101|'Vd|11|11|01|Vd|10110|1|Vn'|0|Vn"            , ""],
    ["vcvtn.u32.f64"    , "Sd, Dn"                                      , "A32", "1111|11101|'Vd|11|11|01|Vd|10110|1|Vn'|0|Vn"            , ""],

    ["vcvtp.x32.f32"    , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|Sz|11|Vd|0010U|0|Vn'|0|Vn"            , ""],
    ["vcvtp.x32.f32"    , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|Sz|11|Vd|0010U|0|Vn'|0|Vn"            , ""],
    ["vcvtp.x32.f32"    , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|Sz|11|Vd|0010U|1|Vn'|0|Vn"            , ""],
    ["vcvtp.x32.f32"    , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|Sz|11|Vd|0010U|1|Vn'|0|Vn"            , ""],

    ["vcvtp.s32.f32"    , "Sd, Sn"                                      , "T32", "1111|11101|'Vd|11|11|10|Vd|10101|1|Vn'|0|Vn"            , ""],
    ["vcvtp.s32.f32"    , "Sd, Sn"                                      , "A32", "1111|11101|'Vd|11|11|10|Vd|10101|1|Vn'|0|Vn"            , ""],
    ["vcvtp.s32.f64"    , "Sd, Dn"                                      , "T32", "1111|11101|'Vd|11|11|10|Vd|10111|1|Vn'|0|Vn"            , ""],
    ["vcvtp.s32.f64"    , "Sd, Dn"                                      , "A32", "1111|11101|'Vd|11|11|10|Vd|10111|1|Vn'|0|Vn"            , ""],

    ["vcvtp.u32.f32"    , "Sd, Sn"                                      , "T32", "1111|11101|'Vd|11|11|10|Vd|10100|1|Vn'|0|Vn"            , ""],
    ["vcvtp.u32.f32"    , "Sd, Sn"                                      , "A32", "1111|11101|'Vd|11|11|10|Vd|10100|1|Vn'|0|Vn"            , ""],
    ["vcvtp.u32.f64"    , "Sd, Dn"                                      , "T32", "1111|11101|'Vd|11|11|10|Vd|10110|1|Vn'|0|Vn"            , ""],
    ["vcvtp.u32.f64"    , "Sd, Dn"                                      , "A32", "1111|11101|'Vd|11|11|10|Vd|10110|1|Vn'|0|Vn"            , ""],

    ["vcvtr.s32.f32"    , "Sd, Sn"                                      , "T32", "1110|11101|'Vd|11|11|01|Vd|10100|1|'Vn|0|Vn"            , ""],
    ["vcvtr.s32.f32"    , "Sd, Sn"                                      , "A32", "Cond|11101|'Vd|11|11|01|Vd|10100|1|'Vn|0|Vn"            , ""],
    ["vcvtr.s32.f64"    , "Sd, Dn"                                      , "T32", "1110|11101|'Vd|11|11|01|Vd|10110|1|Vn'|0|Vn"            , ""],
    ["vcvtr.s32.f64"    , "Sd, Dn"                                      , "A32", "Cond|11101|'Vd|11|11|01|Vd|10110|1|Vn'|0|Vn"            , ""],

    ["vcvtr.u32.f32"    , "Sd, Sn"                                      , "T32", "1110|11101|'Vd|11|11|00|Vd|10100|1|'Vn|0|Vn"            , ""],
    ["vcvtr.u32.f32"    , "Sd, Sn"                                      , "A32", "Cond|11101|'Vd|11|11|00|Vd|10100|1|'Vn|0|Vn"            , ""],
    ["vcvtr.u32.f64"    , "Sd, Dn"                                      , "T32", "1110|11101|'Vd|11|11|00|Vd|10110|1|Vn'|0|Vn"            , ""],
    ["vcvtr.u32.f64"    , "Sd, Dn"                                      , "A32", "Cond|11101|'Vd|11|11|00|Vd|10110|1|Vn'|0|Vn"            , ""],

    ["vcvtt.f32.f16"    , "Sd, Sn"                                      , "T32", "1110|11101|'Vd|11|00|10|Vd|10101|1|'Vn|0|Vn"            , ""],
    ["vcvtt.f32.f16"    , "Sd, Sn"                                      , "A32", "Cond|11101|'Vd|11|00|10|Vd|10101|1|'Vn|0|Vn"            , ""],
    ["vcvtt.f16.f32"    , "Sd, Sn"                                      , "T32", "1110|11101|'Vd|11|00|11|Vd|10101|1|'Vn|0|Vn"            , ""],
    ["vcvtt.f16.f32"    , "Sd, Sn"                                      , "A32", "Cond|11101|'Vd|11|00|11|Vd|10101|1|'Vn|0|Vn"            , ""],

    ["vcvtt.f64.f16"    , "Sd, Sn"                                      , "T32", "1110|11101|Vd'|11|00|10|Vd|10111|1|'Vn|0|Vn"            , ""],
    ["vcvtt.f64.f16"    , "Sd, Sn"                                      , "A32", "Cond|11101|Vd'|11|00|10|Vd|10111|1|'Vn|0|Vn"            , ""],
    ["vcvtt.f16.f64"    , "Sd, Sn"                                      , "T32", "1110|11101|'Vd|11|00|11|Vd|10111|1|Vn'|0|Vn"            , ""],
    ["vcvtt.f16.f64"    , "Sd, Sn"                                      , "A32", "Cond|11101|'Vd|11|00|11|Vd|10111|1|Vn'|0|Vn"            , ""],

    ["vdiv.f32"         , "Sd, Sn, Sm"                                  , "A32", "Cond|11101|'Vd|00|Vn|Vd|1010|'Vn|0|'Vm|0|Vm"            , ""],
    ["vdiv.f32"         , "Sd, Sn, Sm"                                  , "T32", "1110|11101|'Vd|00|Vn|Vd|1010|'Vn|0|'Vm|0|Vm"            , ""],
    ["vdiv.f64"         , "Dd, Dn, Dm"                                  , "A32", "Cond|11101|Vd'|00|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , ""],
    ["vdiv.f64"         , "Dd, Dn, Dm"                                  , "T32", "1110|11101|Vd'|00|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , ""],

    ["vdup.8"           , "Dd, Rn!=PC"                                  , "T32", "1110|11101|1|00|Vd|Rn|1011|Vd'|0|0|1|0000"              , ""],
    ["vdup.8"           , "Dd, Rn!=PC"                                  , "A32", "Cond|11101|1|00|Vd|Rn|1011|Vd'|0|0|1|0000"              , ""],
    ["vdup.8"           , "Qd, Rn!=PC"                                  , "T32", "1110|11101|1|10|Vd|Rn|1011|Vd'|0|0|1|0000"              , ""],
    ["vdup.8"           , "Qd, Rn!=PC"                                  , "A32", "Cond|11101|1|10|Vd|Rn|1011|Vd'|0|0|1|0000"              , ""],
    ["vdup.16"          , "Dd, Rn!=PC"                                  , "T32", "1110|11101|0|00|Vd|Rn|1011|Vd'|0|1|1|0000"              , ""],
    ["vdup.16"          , "Dd, Rn!=PC"                                  , "A32", "Cond|11101|0|00|Vd|Rn|1011|Vd'|0|1|1|0000"              , ""],
    ["vdup.16"          , "Qd, Rn!=PC"                                  , "T32", "1110|11101|0|10|Vd|Rn|1011|Vd'|0|1|1|0000"              , ""],
    ["vdup.16"          , "Qd, Rn!=PC"                                  , "A32", "Cond|11101|0|10|Vd|Rn|1011|Vd'|0|1|1|0000"              , ""],
    ["vdup.32"          , "Dd, Rn!=PC"                                  , "T32", "1110|11101|0|00|Vd|Rn|1011|Vd'|0|0|1|0000"              , ""],
    ["vdup.32"          , "Dd, Rn!=PC"                                  , "A32", "Cond|11101|0|00|Vd|Rn|1011|Vd'|0|0|1|0000"              , ""],
    ["vdup.32"          , "Qd, Rn!=PC"                                  , "T32", "1110|11101|0|10|Vd|Rn|1011|Vd'|0|0|1|0000"              , ""],
    ["vdup.32"          , "Qd, Rn!=PC"                                  , "A32", "Cond|11101|0|10|Vd|Rn|1011|Vd'|0|0|1|0000"              , ""],

    ["vdup.8"           , "Dd, Dn, #ImmZ"                               , "T32", "1111|11111|Vd'|11|ImmZ:3  |1|Vd|1100|0|0|Vn'|0|Vn"      , ""],
    ["vdup.8"           , "Dd, Dn, #ImmZ"                               , "A32", "1111|00111|Vd'|11|ImmZ:3  |1|Vd|1100|0|0|Vn'|0|Vn"      , ""],
    ["vdup.8"           , "Qd, Dn, #ImmZ"                               , "T32", "1111|11111|Vd'|11|ImmZ:3  |1|Vd|1100|0|1|Vn'|0|Vn"      , ""],
    ["vdup.8"           , "Qd, Dn, #ImmZ"                               , "A32", "1111|00111|Vd'|11|ImmZ:3  |1|Vd|1100|0|1|Vn'|0|Vn"      , ""],
    ["vdup.16"          , "Dd, Dn, #ImmZ"                               , "T32", "1111|11111|Vd'|11|ImmZ:2 |10|Vd|1100|0|0|Vn'|0|Vn"      , ""],
    ["vdup.16"          , "Dd, Dn, #ImmZ"                               , "A32", "1111|00111|Vd'|11|ImmZ:2 |10|Vd|1100|0|0|Vn'|0|Vn"      , ""],
    ["vdup.16"          , "Qd, Dn, #ImmZ"                               , "T32", "1111|11111|Vd'|11|ImmZ:2 |10|Vd|1100|0|1|Vn'|0|Vn"      , ""],
    ["vdup.16"          , "Qd, Dn, #ImmZ"                               , "A32", "1111|00111|Vd'|11|ImmZ:2 |10|Vd|1100|0|1|Vn'|0|Vn"      , ""],
    ["vdup.32"          , "Dd, Dn, #ImmZ"                               , "T32", "1111|11111|Vd'|11|ImmZ:1|100|Vd|1100|0|0|Vn'|0|Vn"      , ""],
    ["vdup.32"          , "Dd, Dn, #ImmZ"                               , "A32", "1111|00111|Vd'|11|ImmZ:1|100|Vd|1100|0|0|Vn'|0|Vn"      , ""],
    ["vdup.32"          , "Qd, Dn, #ImmZ"                               , "T32", "1111|11111|Vd'|11|ImmZ:1|100|Vd|1100|0|1|Vn'|0|Vn"      , ""],
    ["vdup.32"          , "Qd, Dn, #ImmZ"                               , "A32", "1111|00111|Vd'|11|ImmZ:1|100|Vd|1100|0|1|Vn'|0|Vn"      , ""],

    ["veor.any"         , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|00|Vn|Vd|0001|Vn'|0|Vm'|1|Vm"            , ""],
    ["veor.any"         , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|00|Vn|Vd|0001|Vn'|0|Vm'|1|Vm"            , ""],
    ["veor.any"         , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|00|Vn|Vd|0001|Vn'|1|Vm'|1|Vm"            , ""],
    ["veor.any"         , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|00|Vn|Vd|0001|Vn'|1|Vm'|1|Vm"            , ""],

    ["vext.8"           , "Dd, Dn, Dm, #ImmZ<=07"                       , "T32", "1110|11111|Vd'|11|Vn|Vd|ImmZ:4|Vn'|0|Vm'|0|Vm"          , ""],
    ["vext.8"           , "Dd, Dn, Dm, #ImmZ<=07"                       , "A32", "1111|00101|Vd'|11|Vn|Vd|ImmZ:4|Vn'|0|Vm'|0|Vm"          , ""],
    ["vext.8"           , "Qd, Qn, Qm, #ImmZ<=15"                       , "T32", "1110|11111|Vd'|11|Vn|Vd|ImmZ:4|Vn'|1|Vm'|0|Vm"          , ""],
    ["vext.8"           , "Qd, Qn, Qm, #ImmZ<=15"                       , "A32", "1111|00101|Vd'|11|Vn|Vd|ImmZ:4|Vn'|1|Vm'|0|Vm"          , ""],

    ["vfma.f32"         , "Sx, Sn, Sm"                                  , "T32", "1110|11101|Vx'|10|Vn|Vx|1010|Vn'|0|Vm'|0|Vm"            , ""],
    ["vfma.f32"         , "Sx, Sn, Sm"                                  , "A32", "Cond|11101|Vx'|10|Vn|Vx|1010|Vn'|0|Vm'|0|Vm"            , ""],
    ["vfma.f64"         , "Dx, Dn, Dm"                                  , "T32", "1110|11101|Vx'|10|Vn|Vx|1011|Vn'|0|Vm'|0|Vm"            , ""],
    ["vfma.f64"         , "Dx, Dn, Dm"                                  , "A32", "Cond|11101|Vx'|10|Vn|Vx|1011|Vn'|0|Vm'|0|Vm"            , ""],

    ["vfma.f32"         , "Dx, Dn, Dm"                                  , "T32", "1110|11110|Vx'|00|Vn|Vx|1100|Vn'|0|Vm'|1|Vm"            , ""],
    ["vfma.f32"         , "Dx, Dn, Dm"                                  , "A32", "1111|00100|Vx'|00|Vn|Vx|1100|Vn'|0|Vm'|1|Vm"            , ""],
    ["vfma.f32"         , "Vx, Vn, Vm"                                  , "T32", "1110|11110|Vx'|00|Vn|Vx|1100|Vn'|1|Vm'|1|Vm"            , ""],
    ["vfma.f32"         , "Vx, Vn, Vm"                                  , "A32", "1111|00100|Vx'|00|Vn|Vx|1100|Vn'|1|Vm'|1|Vm"            , ""],

    ["vfms.f32"         , "Sx, Sn, Sm"                                  , "T32", "1110|11101|Vx'|10|Vn|Vx|1010|Vn'|1|Vm'|0|Vm"            , ""],
    ["vfms.f32"         , "Sx, Sn, Sm"                                  , "A32", "Cond|11101|Vx'|10|Vn|Vx|1010|Vn'|1|Vm'|0|Vm"            , ""],
    ["vfms.f64"         , "Dx, Dn, Dm"                                  , "T32", "1110|11101|Vx'|10|Vn|Vx|1011|Vn'|1|Vm'|0|Vm"            , ""],
    ["vfms.f64"         , "Dx, Dn, Dm"                                  , "A32", "Cond|11101|Vx'|10|Vn|Vx|1011|Vn'|1|Vm'|0|Vm"            , ""],

    ["vfms.f32"         , "Dx, Dn, Dm"                                  , "T32", "1110|11110|Vx'|10|Vn|Vx|1100|Vn'|0|Vm'|1|Vm"            , ""],
    ["vfms.f32"         , "Dx, Dn, Dm"                                  , "A32", "1111|00100|Vx'|10|Vn|Vx|1100|Vn'|0|Vm'|1|Vm"            , ""],
    ["vfms.f32"         , "Vx, Vn, Vm"                                  , "T32", "1110|11110|Vx'|10|Vn|Vx|1100|Vn'|1|Vm'|1|Vm"            , ""],
    ["vfms.f32"         , "Vx, Vn, Vm"                                  , "A32", "1111|00100|Vx'|10|Vn|Vx|1100|Vn'|1|Vm'|1|Vm"            , ""],

    ["vfnma.f32"        , "Sx, Sn, Sm"                                  , "T32", "1110|11101|Vx'|01|Vn|Vx|1010|Vn'|1|Vm'|0|Vm"            , ""],
    ["vfnma.f32"        , "Sx, Sn, Sm"                                  , "A32", "Cond|11101|Vx'|01|Vn|Vx|1010|Vn'|1|Vm'|0|Vm"            , ""],
    ["vfnma.f64"        , "Dx, Dn, Dm"                                  , "T32", "1110|11101|Vx'|01|Vn|Vx|1011|Vn'|1|Vm'|0|Vm"            , ""],
    ["vfnma.f64"        , "Dx, Dn, Dm"                                  , "A32", "Cond|11101|Vx'|01|Vn|Vx|1011|Vn'|1|Vm'|0|Vm"            , ""],

    ["vfnms.f32"        , "Sx, Sn, Sm"                                  , "T32", "1110|11101|Vx'|01|Vn|Vx|1010|Vn'|0|Vm'|0|Vm"            , ""],
    ["vfnms.f32"        , "Sx, Sn, Sm"                                  , "A32", "Cond|11101|Vx'|01|Vn|Vx|1010|Vn'|0|Vm'|0|Vm"            , ""],
    ["vfnms.f64"        , "Dx, Dn, Dm"                                  , "T32", "1110|11101|Vx'|01|Vn|Vx|1011|Vn'|0|Vm'|0|Vm"            , ""],
    ["vfnms.f64"        , "Dx, Dn, Dm"                                  , "A32", "Cond|11101|Vx'|01|Vn|Vx|1011|Vn'|0|Vm'|0|Vm"            , ""],

    ["vhadd.x8-32"      , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0000|Vn'|0|Vm'|0|Vm"            , ""],
    ["vhadd.x8-32"      , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0000|Vn'|0|Vm'|0|Vm"            , ""],
    ["vhadd.x8-32"      , "Vd, Vn, Vm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0000|Vn'|1|Vm'|0|Vm"            , ""],
    ["vhadd.x8-32"      , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0000|Vn'|1|Vm'|0|Vm"            , ""],

    ["vhsub.x8-32"      , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0010|Vn'|0|Vm'|0|Vm"            , ""],
    ["vhsub.x8-32"      , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0010|Vn'|0|Vm'|0|Vm"            , ""],
    ["vhsub.x8-32"      , "Vd, Vn, Vm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0010|Vn'|1|Vm'|0|Vm"            , ""],
    ["vhsub.x8-32"      , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0010|Vn'|1|Vm'|0|Vm"            , ""],

    ["vmax.f32"         , "Dd, Dn, Dm"                                  , "T32", "1110|11110|Vd'|00|Vn|Vd|1111|Vn'|0|Vm'|0|Vm"            , ""],
    ["vmax.f32"         , "Dd, Dn, Dm"                                  , "A32", "1111|00100|Vd'|00|Vn|Vd|1111|Vn'|0|Vm'|0|Vm"            , ""],
    ["vmax.f32"         , "Vd, Vn, Vm"                                  , "T32", "1110|11110|Vd'|00|Vn|Vd|1111|Vn'|1|Vm'|0|Vm"            , ""],
    ["vmax.f32"         , "Vd, Vn, Vm"                                  , "A32", "1111|00100|Vd'|00|Vn|Vd|1111|Vn'|1|Vm'|0|Vm"            , ""],

    ["vmax.x8-32"       , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0110|Vn'|0|Vm'|0|Vm"            , ""],
    ["vmax.x8-32"       , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0110|Vn'|0|Vm'|0|Vm"            , ""],
    ["vmax.x8-32"       , "Vd, Vn, Vm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0110|Vn'|1|Vm'|0|Vm"            , ""],
    ["vmax.x8-32"       , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0110|Vn'|1|Vm'|0|Vm"            , ""],

    ["vmaxnm.f32"       , "Sd, Sn, Sm"                                  , "T32", "1111|11101|'Vd|00|Vn|Vd|1010|'Vn|0|'Vm|0|Vm"            , "IT=OUT"],
    ["vmaxnm.f32"       , "Sd, Sn, Sm"                                  , "A32", "1111|11101|'Vd|00|Vn|Vd|1010|'Vn|0|'Vm|0|Vm"            , ""],
    ["vmaxnm.f64"       , "Dd, Dn, Dm"                                  , "T32", "1111|11101|Vd'|00|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , "IT=OUT"],
    ["vmaxnm.f64"       , "Dd, Dn, Dm"                                  , "A32", "1111|11101|Vd'|00|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , ""],

    ["vmaxnm.f32"       , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|00|Vn|Vd|1111|Vn'|0|Vm'|1|Vm"            , "IT=OUT"],
    ["vmaxnm.f32"       , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|00|Vn|Vd|1111|Vn'|0|Vm'|1|Vm"            , ""],
    ["vmaxnm.f32"       , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|00|Vn|Vd|1111|Vn'|1|Vm'|1|Vm"            , "IT=OUT"],
    ["vmaxnm.f32"       , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|00|Vn|Vd|1111|Vn'|1|Vm'|1|Vm"            , ""],

    ["vmin.f32"         , "Dd, Dn, Dm"                                  , "T32", "1110|11110|Vd'|10|Vn|Vd|1111|Vn'|0|Vm'|0|Vm"            , ""],
    ["vmin.f32"         , "Dd, Dn, Dm"                                  , "A32", "1111|00100|Vd'|10|Vn|Vd|1111|Vn'|0|Vm'|0|Vm"            , ""],
    ["vmin.f32"         , "Vd, Vn, Vm"                                  , "T32", "1110|11110|Vd'|10|Vn|Vd|1111|Vn'|1|Vm'|0|Vm"            , ""],
    ["vmin.f32"         , "Vd, Vn, Vm"                                  , "A32", "1111|00100|Vd'|10|Vn|Vd|1111|Vn'|1|Vm'|0|Vm"            , ""],

    ["vmin.x8-32"       , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0110|Vn'|0|Vm'|1|Vm"            , ""],
    ["vmin.x8-32"       , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0110|Vn'|0|Vm'|1|Vm"            , ""],
    ["vmin.x8-32"       , "Vd, Vn, Vm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0110|Vn'|1|Vm'|1|Vm"            , ""],
    ["vmin.x8-32"       , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0110|Vn'|1|Vm'|1|Vm"            , ""],

    ["vminnm.f32"       , "Sd, Sn, Sm"                                  , "T32", "1111|11101|'Vd|00|Vn|Vd|1010|'Vn|1|'Vm|0|Vm"            , "IT=OUT"],
    ["vminnm.f32"       , "Sd, Sn, Sm"                                  , "A32", "1111|11101|'Vd|00|Vn|Vd|1010|'Vn|1|'Vm|0|Vm"            , ""],
    ["vminnm.f64"       , "Dd, Dn, Dm"                                  , "T32", "1111|11101|Vd'|00|Vn|Vd|1011|Vn'|1|Vm'|0|Vm"            , "IT=OUT"],
    ["vminnm.f64"       , "Dd, Dn, Dm"                                  , "A32", "1111|11101|Vd'|00|Vn|Vd|1011|Vn'|1|Vm'|0|Vm"            , ""],

    ["vminnm.f32"       , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|10|Vn|Vd|1111|Vn'|0|Vm'|1|Vm"            , "IT=OUT"],
    ["vminnm.f32"       , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|10|Vn|Vd|1111|Vn'|0|Vm'|1|Vm"            , ""],
    ["vminnm.f32"       , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|10|Vn|Vd|1111|Vn'|1|Vm'|1|Vm"            , "IT=OUT"],
    ["vminnm.f32"       , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|10|Vn|Vd|1111|Vn'|1|Vm'|1|Vm"            , ""],

    ["vmla.f32"         , "Sx, Sn, Sm"                                  , "T32", "1110|11100|'Vx|00|Vn|Vx|1010|'Vn|0|'Vm|0|Vm"            , ""],
    ["vmla.f32"         , "Sx, Sn, Sm"                                  , "A32", "Cond|11100|'Vx|00|Vn|Vx|1010|'Vn|0|'Vm|0|Vm"            , ""],
    ["vmla.f64"         , "Dx, Dn, Dm"                                  , "T32", "1110|11100|Vx'|00|Vn|Vx|1011|Vn'|0|Vm'|0|Vm"            , ""],
    ["vmla.f64"         , "Dx, Dn, Dm"                                  , "A32", "Cond|11100|Vx'|00|Vn|Vx|1011|Vn'|0|Vm'|0|Vm"            , ""],

    ["vmla.f32"         , "Dx, Dn, Dm"                                  , "T32", "1110|11110|Vx'|00|Vn|Vx|1101|Vn'|0|Vm'|1|Vm"            , ""],
    ["vmla.f32"         , "Dx, Dn, Dm"                                  , "A32", "1111|00100|Vx'|00|Vn|Vx|1101|Vn'|0|Vm'|1|Vm"            , ""],
    ["vmla.f32"         , "Vx, Vn, Vm"                                  , "T32", "1110|11110|Vx'|00|Vn|Vx|1101|Vn'|1|Vm'|1|Vm"            , ""],
    ["vmla.f32"         , "Vx, Vn, Vm"                                  , "A32", "1111|00100|Vx'|00|Vn|Vx|1101|Vn'|1|Vm'|1|Vm"            , ""],

    ["vmla.x8-32"       , "Dx, Dn, Dm"                                  , "T32", "1110|11110|Vx'|Sz|Vn|Vx|1001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vmla.x8-32"       , "Dx, Dn, Dm"                                  , "A32", "1111|00100|Vx'|Sz|Vn|Vx|1001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vmla.x8-32"       , "Vx, Vn, Vm"                                  , "T32", "1110|11110|Vx'|Sz|Vn|Vx|1001|Vn'|1|Vm'|1|Vm"            , ""],
    ["vmla.x8-32"       , "Vx, Vn, Vm"                                  , "A32", "1111|00100|Vx'|Sz|Vn|Vx|1001|Vn'|1|Vm'|1|Vm"            , ""],

    ["vmla.x16"         , "Dx, Dn, Dm<=07, #Idx"                        , "T32", "1110|11111|Vx'|01|Vn|Vx|0000|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , ""],
    ["vmla.x16"         , "Dx, Dn, Dm<=07, #Idx"                        , "A32", "1111|00101|Vx'|01|Vn|Vx|0000|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , ""],
    ["vmla.x16"         , "Vx, Vn, Dm<=07, #Idx"                        , "T32", "1111|11111|Vx'|01|Vn|Vx|0000|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , ""],
    ["vmla.x16"         , "Vx, Vn, Dm<=07, #Idx"                        , "A32", "1111|00111|Vx'|01|Vn|Vx|0000|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , ""],

    ["vmla.f32|x32"     , "Dx, Dn, Dm<=15, #Idx"                        , "T32", "1110|11111|Vx'|10|Vn|Vx|000F|Vn'|1|Idx:1|0|Vm"          , ""],
    ["vmla.f32|x32"     , "Dx, Dn, Dm<=15, #Idx"                        , "A32", "1111|00101|Vx'|10|Vn|Vx|000F|Vn'|1|Idx:1|0|Vm"          , ""],
    ["vmla.f32|x32"     , "Vx, Vn, Dm<=15, #Idx"                        , "T32", "1111|11111|Vx'|10|Vn|Vx|000F|Vn'|1|Idx:1|0|Vm"          , ""],
    ["vmla.f32|x32"     , "Vx, Vn, Dm<=15, #Idx"                        , "A32", "1111|00111|Vx'|10|Vn|Vx|000F|Vn'|1|Idx:1|0|Vm"          , ""],

    ["vmlal.x8-32"      , "Vx, Dn, Dm"                                  , "T32", "111U|11111|Vx'|Sz|Vn|Vx|1000|Vn'|0|Vm'|0|Vm"            , "VEC_WIDEN"],
    ["vmlal.x8-32"      , "Vx, Dn, Dm"                                  , "A32", "1111|001U1|Vx'|Sz|Vn|Vx|1000|Vn'|0|Vm'|0|Vm"            , "VEC_WIDEN"],

    ["vmlal.x16"        , "Vx, Dn, Dm<=07, #Idx"                        , "T32", "111U|11111|Vx'|01|Vn|Vx|0010|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "VEC_WIDEN"],
    ["vmlal.x16"        , "Vx, Dn, Dm<=07, #Idx"                        , "A32", "1111|001U1|Vx'|01|Vn|Vx|0010|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "VEC_WIDEN"],

    ["vmlal.x32"        , "Vx, Dn, Dm<=15, #Idx"                        , "T32", "111U|11111|Vx'|10|Vn|Vx|0010|Vn'|1|Idx:1|0|Vm"          , "VEC_WIDEN"],
    ["vmlal.x32"        , "Vx, Dn, Dm<=15, #Idx"                        , "A32", "1111|001U1|Vx'|10|Vn|Vx|0010|Vn'|1|Idx:1|0|Vm"          , "VEC_WIDEN"],

    ["vmls.f32"         , "Sx, Sn, Sm"                                  , "T32", "1110|11100|'Vx|00|Vn|Vx|1010|'Vn|1|'Vm|0|Vm"            , ""],
    ["vmls.f32"         , "Sx, Sn, Sm"                                  , "A32", "Cond|11100|'Vx|00|Vn|Vx|1010|'Vn|1|'Vm|0|Vm"            , ""],
    ["vmls.f64"         , "Dx, Dn, Dm"                                  , "T32", "1110|11100|Vx'|00|Vn|Vx|1011|Vn'|1|Vm'|0|Vm"            , ""],
    ["vmls.f64"         , "Dx, Dn, Dm"                                  , "A32", "Cond|11100|Vx'|00|Vn|Vx|1011|Vn'|1|Vm'|0|Vm"            , ""],

    ["vmls.f32"         , "Dx, Dn, Dm"                                  , "T32", "1110|11110|Vx'|10|Vn|Vx|1101|Vn'|0|Vm'|1|Vm"            , ""],
    ["vmls.f32"         , "Dx, Dn, Dm"                                  , "A32", "1111|00100|Vx'|10|Vn|Vx|1101|Vn'|0|Vm'|1|Vm"            , ""],
    ["vmls.f32"         , "Vx, Vn, Vm"                                  , "T32", "1110|11110|Vx'|10|Vn|Vx|1101|Vn'|1|Vm'|1|Vm"            , ""],
    ["vmls.f32"         , "Vx, Vn, Vm"                                  , "A32", "1111|00100|Vx'|10|Vn|Vx|1101|Vn'|1|Vm'|1|Vm"            , ""],

    ["vmls.x8-32"       , "Dx, Dn, Dm"                                  , "T32", "1111|11110|Vx'|Sz|Vn|Vx|1001|Vn'|0|Vm'|0|Vm"            , ""],
    ["vmls.x8-32"       , "Dx, Dn, Dm"                                  , "A32", "1111|00110|Vx'|Sz|Vn|Vx|1001|Vn'|0|Vm'|0|Vm"            , ""],
    ["vmls.x8-32"       , "Vx, Vn, Vm"                                  , "T32", "1111|11110|Vx'|Sz|Vn|Vx|1001|Vn'|1|Vm'|0|Vm"            , ""],
    ["vmls.x8-32"       , "Vx, Vn, Vm"                                  , "A32", "1111|00110|Vx'|Sz|Vn|Vx|1001|Vn'|1|Vm'|0|Vm"            , ""],

    ["vmls.x16"         , "Dx, Dn, Dm<=07, #Idx"                        , "T32", "1110|11111|Vx'|01|Vn|Vx|0100|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , ""],
    ["vmls.x16"         , "Dx, Dn, Dm<=07, #Idx"                        , "A32", "1111|00101|Vx'|01|Vn|Vx|0100|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , ""],
    ["vmls.x16"         , "Vx, Vn, Dm<=07, #Idx"                        , "T32", "1111|11111|Vx'|01|Vn|Vx|0100|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , ""],
    ["vmls.x16"         , "Vx, Vn, Dm<=07, #Idx"                        , "A32", "1111|00111|Vx'|01|Vn|Vx|0100|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , ""],

    ["vmls.f32|x32"     , "Dx, Dn, Dm<=15, #Idx"                        , "T32", "1110|11111|Vx'|10|Vn|Vx|010F|Vn'|1|Idx:1|0|Vm"          , ""],
    ["vmls.f32|x32"     , "Dx, Dn, Dm<=15, #Idx"                        , "A32", "1111|00101|Vx'|10|Vn|Vx|010F|Vn'|1|Idx:1|0|Vm"          , ""],
    ["vmls.f32|x32"     , "Vx, Vn, Dm<=15, #Idx"                        , "T32", "1111|11111|Vx'|10|Vn|Vx|010F|Vn'|1|Idx:1|0|Vm"          , ""],
    ["vmls.f32|x32"     , "Vx, Vn, Dm<=15, #Idx"                        , "A32", "1111|00111|Vx'|10|Vn|Vx|010F|Vn'|1|Idx:1|0|Vm"          , ""],

    ["vmlsl.x8-32"      , "Vx, Dn, Dm"                                  , "T32", "111U|11111|Vx'|Sz|Vn|Vx|1010|Vn'|0|Vm'|0|Vm"            , "VEC_WIDEN"],
    ["vmlsl.x8-32"      , "Vx, Dn, Dm"                                  , "A32", "1111|001U1|Vx'|Sz|Vn|Vx|1010|Vn'|0|Vm'|0|Vm"            , "VEC_WIDEN"],

    ["vmlsl.x16"        , "Vx, Dn, Dm<=07, #Idx"                        , "T32", "111U|11111|Vx'|01|Vn|Vx|0110|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "VEC_WIDEN"],
    ["vmlsl.x16"        , "Vx, Dn, Dm<=07, #Idx"                        , "A32", "1111|001U1|Vx'|01|Vn|Vx|0110|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "VEC_WIDEN"],

    ["vmlsl.x32"        , "Vx, Dn, Dm<=15, #Idx"                        , "T32", "111U|11111|Vx'|10|Vn|Vx|0110|Vn'|1|Idx:1|0|Vm"          , "VEC_WIDEN"],
    ["vmlsl.x32"        , "Vx, Dn, Dm<=15, #Idx"                        , "A32", "1111|001U1|Vx'|10|Vn|Vx|0110|Vn'|1|Idx:1|0|Vm"          , "VEC_WIDEN"],

    ["vmov.f32"         , "Sd, #ImmVFP"                                 , "T32", "1110|11101|'Vd|11|ImmVFP:4|Vd|1010|0000|ImmVFP:4"       , ""],
    ["vmov.f32"         , "Sd, #ImmVFP"                                 , "A32", "Cond|11101|'Vd|11|ImmVFP:4|Vd|1010|0000|ImmVFP:4"       , ""],
    ["vmov.f64"         , "Dd, #ImmVFP"                                 , "T32", "1110|11101|Vd'|11|ImmVFP:4|Vd|1011|0000|ImmVFP:4"       , ""],
    ["vmov.f64"         , "Dd, #ImmVFP"                                 , "A32", "Cond|11101|Vd'|11|ImmVFP:4|Vd|1011|0000|ImmVFP:4"       , ""],

    ["vmov.any"         , "Dd, #ImmV"                                   , "T32", "111|ImmV:1|11111|Vd'|000|ImmV:3|Vd|CMode|00|Op|1|ImmV:4", "Op_CMode=0.0xx0|0.10x0|0.11xx|1.1110"],
    ["vmov.any"         , "Dd, #ImmV"                                   , "A32", "1111001|ImmV:1|1|Vd'|000|ImmV:3|Vd|CMode|00|Op|1|ImmV:4", "Op_CMode=0.0xx0|0.10x0|0.11xx|1.1110"],
    ["vmov.any"         , "Vd, #ImmV"                                   , "T32", "111|ImmV:1|11111|Vd'|000|ImmV:3|Vd|CMode|01|Op|1|ImmV:4", "Op_CMode=0.0xx0|0.10x0|0.11xx|1.1110"],
    ["vmov.any"         , "Vd, #ImmV"                                   , "A32", "1111001|ImmV:1|1|Vd'|000|ImmV:3|Vd|CMode|01|Op|1|ImmV:4", "Op_CMode=0.0xx0|0.10x0|0.11xx|1.1110"],

    ["vmov"             , "Rd!=PC, Sn"                                  , "T32", "1110|11100|0|0|1|Vn|Rd|1010|'Vn|0|0|1|0000"             , ""],
    ["vmov"             , "Rd!=PC, Sn"                                  , "A32", "Cond|11100|0|0|1|Vn|Rd|1010|'Vn|0|0|1|0000"             , ""],
    ["vmov"             , "Sd    , Rn!=PC"                              , "T32", "1110|11100|0|0|0|Vd|Rs|1010|'Vd|0|0|1|0000"             , ""],
    ["vmov"             , "Sd    , Rn!=PC"                              , "A32", "Cond|11100|0|0|0|Vd|Rs|1010|'Vd|0|0|1|0000"             , ""],

    ["vmov"             , "Rd!=PC, Rd2!=PC  , Ss!=31, Ss2==Ss+1"        , "T32", "1110|11000|1|0|1|Rd2|Rd|101|000|Vd'|1|Vd"               , ""],
    ["vmov"             , "Rd!=PC, Rd2!=PC  , Ss!=31, Ss2==Ss+1"        , "A32", "Cond|11000|1|0|1|Rd2|Rd|101|000|Vd'|1|Vd"               , ""],
    ["vmov"             , "Sd!=31, Sd2==Sd+1, Rs!=PC, Rs2!=PC"          , "T32", "1110|11000|1|0|0|Rs2|Rs|101|000|Vs'|1|Vs"               , ""],
    ["vmov"             , "Sd!=31, Sd2==Sd+1, Rs!=PC, Rs2!=PC"          , "A32", "Cond|11000|1|0|0|Rs2|Rs|101|000|Vs'|1|Vs"               , ""],

    ["vmov"             , "Rd!=PC, Rd2!=PC, Ds"                         , "T32", "1110|11000|1|01|Rd2|Rd|1011|0|0|Vs'|1|Vs"               , ""],
    ["vmov"             , "Rd!=PC, Rd2!=PC, Ds"                         , "A32", "Cond|11000|1|01|Rd2|Rd|1011|0|0|Vs'|1|Vs"               , ""],
    ["vmov"             , "Dd    , Rs!=PC , Rs2!=PC"                    , "T32", "1110|11000|1|00|Rs2|Rs|1011|0|0|Vd'|1|Vd"               , ""],
    ["vmov"             , "Dd    , Rs!=PC , Rs2!=PC"                    , "A32", "Cond|11000|1|00|Rs2|Rs|1011|0|0|Vd'|1|Vd"               , ""],

    ["vmov.f32"         , "Sd, Sn"                                      , "T32", "1110|11101|'Vd|11|0000|Vd|1010|0|1|'Vn|0|Vn"            , ""],
    ["vmov.f32"         , "Sd, Sn"                                      , "A32", "Cond|11101|'Vd|11|0000|Vd|1010|0|1|'Vn|0|Vn"            , ""],
    ["vmov.f64"         , "Dd, Dn"                                      , "T32", "1110|11101|Vd'|11|0000|Vd|1011|0|1|Vn'|0|Vn"            , ""],
    ["vmov.f64"         , "Dd, Dn"                                      , "A32", "Cond|11101|Vd'|11|0000|Vd|1011|0|1|Vn'|0|Vn"            , ""],

    ["vmov.x8"          , "Dd, Rn!=PC, #Idx"                            , "T32", "1110|11100|1|Idx:1|0|Vd|Rn|1011|Vd'|Idx:2|1|0000"       , ""],
    ["vmov.x8"          , "Dd, Rn!=PC, #Idx"                            , "A32", "Cond|11100|1|Idx:1|0|Vd|Rn|1011|Vd'|Idx:2|1|0000"       , ""],
    ["vmov.x16"         , "Dd, Rn!=PC, #Idx"                            , "T32", "1110|11100|0|Idx:1|0|Vd|Rn|1011|Vd'|Idx:1|1|1|0000"     , ""],
    ["vmov.x16"         , "Dd, Rn!=PC, #Idx"                            , "A32", "Cond|11100|0|Idx:1|0|Vd|Rn|1011|Vd'|Idx:1|1|1|0000"     , ""],
    ["vmov.x32"         , "Dd, Rn!=PC, #Idx"                            , "T32", "1110|11100|0|Idx:1|0|Vd|Rn|1011|Vd'|1|0|1|0000"         , ""],
    ["vmov.x32"         , "Dd, Rn!=PC, #Idx"                            , "A32", "Cond|11100|0|Idx:1|0|Vd|Rn|1011|Vd'|1|0|1|0000"         , ""],

    ["vmov.x8"          , "Rd!=PC, Dn, #Idx"                            , "T32", "1110|1110U|1|Idx:1|1|Vn|Rd|1011|Vn'|Idx:2|1|0000"       , ""],
    ["vmov.x8"          , "Rd!=PC, Dn, #Idx"                            , "A32", "Cond|1110U|1|Idx:1|1|Vn|Rd|1011|Vn'|Idx:2|1|0000"       , ""],
    ["vmov.x16"         , "Rd!=PC, Dn, #Idx"                            , "T32", "1110|1110U|0|Idx:1|1|Vn|Rd|1011|Vn'|Idx:1|1|1|0000"     , ""],
    ["vmov.x16"         , "Rd!=PC, Dn, #Idx"                            , "A32", "Cond|1110U|0|Idx:1|1|Vn|Rd|1011|Vn'|Idx:1|1|1|0000"     , ""],
    ["vmov.x32"         , "Rd!=PC, Dn, #Idx"                            , "T32", "1110|11100|0|Idx:1|1|Vn|Rd|1011|Vn'|0|0|1|0000"         , ""],
    ["vmov.x32"         , "Rd!=PC, Dn, #Idx"                            , "A32", "Cond|11100|0|Idx:1|1|Vn|Rd|1011|Vn'|0|0|1|0000"         , ""],

    ["vmov.any"         , "Dd, Dn"                                      , "T32", "1110|11110|Vd'|10|Vn|Vd|0001|Vn'|0|Vn'|1|Vn"            , "AliasOf=vorr"],
    ["vmov.any"         , "Dd, Dn"                                      , "A32", "1111|00100|Vd'|10|Vn|Vd|0001|Vn'|0|Vn'|1|Vn"            , "AliasOf=vorr"],
    ["vmov.any"         , "Vd, Vn"                                      , "T32", "1110|11110|Vd'|10|Vn|Vd|0001|Vn'|1|Vn'|1|Vn"            , "AliasOf=vorr"],
    ["vmov.any"         , "Vd, Vn"                                      , "A32", "1111|00100|Vd'|10|Vn|Vd|0001|Vn'|1|Vn'|1|Vn"            , "AliasOf=vorr"],

    ["vmovl.x8"         , "Vd, Dn"                                      , "T32", "111U|11111|Vd'|00|1000|Vd|1010|0|0|Vn'|1|Vn"            , "VEC_WIDEN"],
    ["vmovl.x8"         , "Vd, Dn"                                      , "A32", "1111|001U1|Vd'|00|1000|Vd|1010|0|0|Vn'|1|Vn"            , "VEC_WIDEN"],
    ["vmovl.x16"        , "Vd, Dn"                                      , "T32", "111U|11111|Vd'|01|0000|Vd|1010|0|0|Vn'|1|Vn"            , "VEC_WIDEN"],
    ["vmovl.x16"        , "Vd, Dn"                                      , "A32", "1111|001U1|Vd'|01|0000|Vd|1010|0|0|Vn'|1|Vn"            , "VEC_WIDEN"],
    ["vmovl.x32"        , "Vd, Dn"                                      , "T32", "111U|11111|Vd'|10|0000|Vd|1010|0|0|Vn'|1|Vn"            , "VEC_WIDEN"],
    ["vmovl.x32"        , "Vd, Dn"                                      , "A32", "1111|001U1|Vd'|10|0000|Vd|1010|0|0|Vn'|1|Vn"            , "VEC_WIDEN"],

    ["vmovn.x8-32"      , "Dd, Vn"                                      , "T32", "1111|11111|Vd'|11|Sz|10|Vd|0010|0|0|Vn'|1|Vn"           , "VEC_NARROW"],
    ["vmovn.x8-32"      , "Dd, Vn"                                      , "A32", "1111|00111|Vd'|11|Sz|10|Vd|0010|0|0|Vn'|1|Vn"           , "VEC_NARROW"],

    ["vmul.f32"         , "Sd, Sn, Sm"                                  , "T32", "1110|11100|'Vd|10|Vn|Vd|1010|'Vn|0|'Vm|0|Vm"            , ""],
    ["vmul.f32"         , "Sd, Sn, Sm"                                  , "A32", "Cond|11100|'Vd|10|Vn|Vd|1010|'Vn|0|'Vm|0|Vm"            , ""],
    ["vmul.f64"         , "Dd, Dn, Dm"                                  , "T32", "1110|11100|Vd'|10|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , ""],
    ["vmul.f64"         , "Dd, Dn, Dm"                                  , "A32", "Cond|11100|Vd'|10|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , ""],

    ["vmul.f32"         , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|00|Vn|Vd|1101|Vn'|0|Vm'|1|Vm"            , ""],
    ["vmul.f32"         , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|00|Vn|Vd|1101|Vn'|0|Vm'|1|Vm"            , ""],
    ["vmul.f32"         , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|00|Vn|Vd|1101|Vn'|1|Vm'|1|Vm"            , ""],
    ["vmul.f32"         , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|00|Vn|Vd|1101|Vn'|1|Vm'|1|Vm"            , ""],

    ["vmul.x8-32|p8"    , "Dd, Dn, Dm"                                  , "T32", "111P|11110|Vd'|Sz|Vn|Vd|1001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vmul.x8-32|p8"    , "Dd, Dn, Dm"                                  , "A32", "1111|001P0|Vd'|Sz|Vn|Vd|1001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vmul.x8-32|p8"    , "Vd, Vn, Vm"                                  , "T32", "111P|11110|Vd'|Sz|Vn|Vd|1001|Vn'|1|Vm'|1|Vm"            , ""],
    ["vmul.x8-32|p8"    , "Vd, Vn, Vm"                                  , "A32", "1111|001P0|Vd'|Sz|Vn|Vd|1001|Vn'|1|Vm'|1|Vm"            , ""],

    ["vmul.x16"         , "Dd, Dn, Dm, #Idx"                            , "T32", "1110|11111|Vd'|01|Vn|Vd|1000|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , ""],
    ["vmul.x16"         , "Dd, Dn, Dm, #Idx"                            , "A32", "1111|00101|Vd'|01|Vn|Vd|1000|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , ""],
    ["vmul.x16"         , "Vd, Vn, Dm, #Idx"                            , "T32", "1111|11111|Vd'|01|Vn|Vd|1000|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , ""],
    ["vmul.x16"         , "Vd, Vn, Dm, #Idx"                            , "A32", "1111|00111|Vd'|01|Vn|Vd|1000|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , ""],

    ["vmul.f32|x32"     , "Dd, Dn, Dm, #Idx"                            , "T32", "1110|11111|Vd'|10|Vn|Vd|100F|Vn'|1|Idx:1|0|Vm"          , ""],
    ["vmul.f32|x32"     , "Dd, Dn, Dm, #Idx"                            , "A32", "1111|00101|Vd'|10|Vn|Vd|100F|Vn'|1|Idx:1|0|Vm"          , ""],
    ["vmul.f32|x32"     , "Vd, Vn, Dm, #Idx"                            , "T32", "1111|11111|Vd'|10|Vn|Vd|100F|Vn'|1|Idx:1|0|Vm"          , ""],
    ["vmul.f32|x32"     , "Vd, Vn, Dm, #Idx"                            , "A32", "1111|00111|Vd'|10|Vn|Vd|100F|Vn'|1|Idx:1|0|Vm"          , ""],

    ["vmull.x8-32|p8"   , "Vd, Dn, Dm"                                  , "T32", "111U|11111|Vd'|Sz|Vn|Vd|11P0|Vn'|0|Vm'|0|Vm"            , "VEC_WIDEN"],
    ["vmull.x8-32|p8"   , "Vd, Dn, Dm"                                  , "A32", "1111|001U1|Vd'|Sz|Vn|Vd|11P0|Vn'|0|Vm'|0|Vm"            , "VEC_WIDEN"],

    ["vmull.p64"        , "Vd, Dn, Dm"                                  , "T32", "1110|11111|Vd'|10|Vn|Vd|11P0|Vn'|0|Vm'|0|Vm"            , "VEC_WIDEN"],
    ["vmull.p64"        , "Vd, Dn, Dm"                                  , "A32", "1111|00101|Vd'|10|Vn|Vd|11P0|Vn'|0|Vm'|0|Vm"            , "VEC_WIDEN"],

    ["vmull.x16"        , "Vd, Dn, Dm, #Idx"                            , "T32", "111U|11111|Vd'|01|Vn|Vd|1010|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "VEC_WIDEN"],
    ["vmull.x16"        , "Vd, Dn, Dm, #Idx"                            , "A32", "1111|001U1|Vd'|01|Vn|Vd|1010|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "VEC_WIDEN"],

    ["vmull.x32"        , "Vd, Dn, Dm, #Idx"                            , "T32", "111U|11111|Vd'|10|Vn|Vd|1010|Vn'|1|Idx:1|0|Vm"          , "VEC_WIDEN"],
    ["vmull.x32"        , "Vd, Dn, Dm, #Idx"                            , "A32", "1111|001U1|Vd'|10|Vn|Vd|1010|Vn'|1|Idx:1|0|Vm"          , "VEC_WIDEN"],

    ["vmvn.any"         , "Dd, #ImmV"                                   , "T32", "111|ImmV:1|11111|Vd'|000|ImmV:3|Vd|CMode|00|Op|1|ImmV:4", "Op_CMode=1.0xx0|1.10x0|1.110x"],
    ["vmvn.any"         , "Dd, #ImmV"                                   , "A32", "1111001|ImmV:1|1|Vd'|000|ImmV:3|Vd|CMode|00|Op|1|ImmV:4", "Op_CMode=1.0xx0|1.10x0|1.110x"],
    ["vmvn.any"         , "Vd, #ImmV"                                   , "T32", "111|ImmV:1|11111|Vd'|000|ImmV:3|Vd|CMode|01|Op|1|ImmV:4", "Op_CMode=1.0xx0|1.10x0|1.110x"],
    ["vmvn.any"         , "Vd, #ImmV"                                   , "A32", "1111001|ImmV:1|1|Vd'|000|ImmV:3|Vd|CMode|01|Op|1|ImmV:4", "Op_CMode=1.0xx0|1.10x0|1.110x"],

    ["vmvn.any"         , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|0000|Vd|0101|1|0|Vn'|0|Vn"            , ""],
    ["vmvn.any"         , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|0000|Vd|0101|1|0|Vn'|0|Vn"            , ""],
    ["vmvn.any"         , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|0000|Vd|0101|1|1|Vn'|0|Vn"            , ""],
    ["vmvn.any"         , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|0000|Vd|0101|1|1|Vn'|0|Vn"            , ""],

    ["vneg.f32"         , "Sd, Sn"                                      , "T32", "1110|11101|Vd'|11|0001|Vd|1010|0|1|Vn'|0|Vn"            , ""],
    ["vneg.f32"         , "Sd, Sn"                                      , "A32", "Cond|11101|Vd'|11|0001|Vd|1010|0|1|Vn'|0|Vn"            , ""],
    ["vneg.f64"         , "Dd, Dn"                                      , "T32", "1110|11101|Vd'|11|0001|Vd|1011|0|1|Vn'|0|Vn"            , ""],
    ["vneg.f64"         , "Dd, Dn"                                      , "A32", "Cond|11101|Vd'|11|0001|Vd|1011|0|1|Vn'|0|Vn"            , ""],

    ["vneg.f32|x8-32"   , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|Sz|01|Vd|0F11|1|0|Vn'|0|Vn"           , ""],
    ["vneg.f32|x8-32"   , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|Sz|01|Vd|0F11|1|0|Vn'|0|Vn"           , ""],
    ["vneg.f32|x8-32"   , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|Sz|01|Vd|0F11|1|1|Vn'|0|Vn"           , ""],
    ["vneg.f32|x8-32"   , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|Sz|01|Vd|0F11|1|1|Vn'|0|Vn"           , ""],

    ["vnmla.f32"        , "Sx, Sn, Sm"                                  , "T32", "1110|11100|'Vx|01|Vn|Vx|1010|'Vn|1|'Vm|0|Vm"            , ""],
    ["vnmla.f32"        , "Sx, Sn, Sm"                                  , "A32", "Cond|11100|'Vx|01|Vn|Vx|1010|'Vn|1|'Vm|0|Vm"            , ""],
    ["vnmla.f64"        , "Dx, Dn, Dm"                                  , "T32", "1110|11100|Vx'|01|Vn|Vx|1011|Vn'|1|Vm'|0|Vm"            , ""],
    ["vnmla.f64"        , "Dx, Dn, Dm"                                  , "A32", "Cond|11100|Vx'|01|Vn|Vx|1011|Vn'|1|Vm'|0|Vm"            , ""],

    ["vnmls.f32"        , "Sx, Sn, Sm"                                  , "T32", "1110|11100|'Vx|01|Vn|Vx|1010|'Vn|0|'Vm|0|Vm"            , ""],
    ["vnmls.f32"        , "Sx, Sn, Sm"                                  , "A32", "Cond|11100|'Vx|01|Vn|Vx|1010|'Vn|0|'Vm|0|Vm"            , ""],
    ["vnmls.f64"        , "Dx, Dn, Dm"                                  , "T32", "1110|11100|Vx'|01|Vn|Vx|1011|Vn'|0|Vm'|0|Vm"            , ""],
    ["vnmls.f64"        , "Dx, Dn, Dm"                                  , "A32", "Cond|11100|Vx'|01|Vn|Vx|1011|Vn'|0|Vm'|0|Vm"            , ""],

    ["vnmul.f32"        , "Sd, Sn, Sm"                                  , "T32", "1110|11100|'Vd|10|Vn|Vd|1010|'Vn|1|'Vm|0|Vm"            , ""],
    ["vnmul.f32"        , "Sd, Sn, Sm"                                  , "A32", "Cond|11100|'Vd|10|Vn|Vd|1010|'Vn|1|'Vm|0|Vm"            , ""],
    ["vnmul.f64"        , "Dd, Dn, Dm"                                  , "T32", "1110|11100|Vd'|10|Vn|Vd|1011|Vn'|1|Vm'|0|Vm"            , ""],
    ["vnmul.f64"        , "Dd, Dn, Dm"                                  , "A32", "Cond|11100|Vd'|10|Vn|Vd|1011|Vn'|1|Vm'|0|Vm"            , ""],

    ["vorn.any"         , "Dx, Dx, #ImmV"                               , "T32", "111|ImmV:1|11111|Vd'|000|ImmV:3|Vd|CMode|00|Op|1|ImmV:4", "Op_CMode=0.0xx1|0.10x1 PseudoOf=vorr"],
    ["vorn.any"         , "Dx, Dx, #ImmV"                               , "A32", "1111001|ImmV:1|1|Vd'|000|ImmV:3|Vd|CMode|00|Op|1|ImmV:4", "Op_CMode=0.0xx1|0.10x1 PseudoOf=vorr"],
    ["vorn.any"         , "Vx, Vx, #ImmV"                               , "T32", "111|ImmV:1|11111|Vd'|000|ImmV:3|Vd|CMode|01|Op|1|ImmV:4", "Op_CMode=0.0xx1|0.10x1 PseudoOf=vorr"],
    ["vorn.any"         , "Vx, Vx, #ImmV"                               , "A32", "1111001|ImmV:1|1|Vd'|000|ImmV:3|Vd|CMode|01|Op|1|ImmV:4", "Op_CMode=0.0xx1|0.10x1 PseudoOf=vorr"],

    ["vorn.any"         , "Dd, Dn, Dm"                                  , "T32", "1110|11110|Vd'|11|Vn|Vd|0001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vorn.any"         , "Dd, Dn, Dm"                                  , "A32", "1111|00100|Vd'|11|Vn|Vd|0001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vorn.any"         , "Vd, Vn, Vm"                                  , "T32", "1110|11110|Vd'|11|Vn|Vd|0001|Vn'|1|Vm'|1|Vm"            , ""],
    ["vorn.any"         , "Vd, Vn, Vm"                                  , "A32", "1111|00100|Vd'|11|Vn|Vd|0001|Vn'|1|Vm'|1|Vm"            , ""],

    ["vorr.any"         , "Dx, Dx, #ImmV"                               , "T32", "111|ImmV:1|11111|Vd'|000|ImmV:3|Vd|CMode|00|Op|1|ImmV:4", "Op_CMode=0.0xx1|0.10x1"],
    ["vorr.any"         , "Dx, Dx, #ImmV"                               , "A32", "1111001|ImmV:1|1|Vd'|000|ImmV:3|Vd|CMode|00|Op|1|ImmV:4", "Op_CMode=0.0xx1|0.10x1"],
    ["vorr.any"         , "Vx, Vx, #ImmV"                               , "T32", "111|ImmV:1|11111|Vd'|000|ImmV:3|Vd|CMode|01|Op|1|ImmV:4", "Op_CMode=0.0xx1|0.10x1"],
    ["vorr.any"         , "Vx, Vx, #ImmV"                               , "A32", "1111001|ImmV:1|1|Vd'|000|ImmV:3|Vd|CMode|01|Op|1|ImmV:4", "Op_CMode=0.0xx1|0.10x1"],

    ["vorr.any"         , "Dd, Dn, Dm"                                  , "T32", "1110|11110|Vd'|10|Vn|Vd|0001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vorr.any"         , "Dd, Dn, Dm"                                  , "A32", "1111|00100|Vd'|10|Vn|Vd|0001|Vn'|0|Vm'|1|Vm"            , ""],
    ["vorr.any"         , "Vd, Vn, Vm"                                  , "T32", "1110|11110|Vd'|10|Vn|Vd|0001|Vn'|1|Vm'|1|Vm"            , ""],
    ["vorr.any"         , "Vd, Vn, Vm"                                  , "A32", "1111|00100|Vd'|10|Vn|Vd|0001|Vn'|1|Vm'|1|Vm"            , ""],

    ["vpadal.x8-32"     , "Dx, Dn"                                      , "T32", "1111|11111|Vx'|11|Sz|00|Vx|0110|U|0|Vn'|0|Vn"           , ""],
    ["vpadal.x8-32"     , "Dx, Dn"                                      , "A32", "1111|00111|Vx'|11|Sz|00|Vx|0110|U|0|Vn'|0|Vn"           , ""],
    ["vpadal.x8-32"     , "Vx, Vn"                                      , "T32", "1111|11111|Vx'|11|Sz|00|Vx|0110|U|1|Vn'|0|Vn"           , ""],
    ["vpadal.x8-32"     , "Vx, Vn"                                      , "A32", "1111|00111|Vx'|11|Sz|00|Vx|0110|U|1|Vn'|0|Vn"           , ""],

    ["vpadd.f32"        , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|00|Vn|Vd|1101|Vn'|0|Vm'|0|Vm"            , ""],
    ["vpadd.f32"        , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|00|Vn|Vd|1101|Vn'|0|Vm'|0|Vm"            , ""],

    ["vpaddl.x8-x32"    , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|0010|0|0|Vn'|0|Vn"           , ""],
    ["vpaddl.x8-x32"    , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|0010|0|0|Vn'|0|Vn"           , ""],
    ["vpaddl.x8-x32"    , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|0010|1|0|Vn'|0|Vn"           , ""],
    ["vpaddl.x8-x32"    , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|0010|1|0|Vn'|0|Vn"           , ""],

    ["vpmax.f32"        , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|00|Vn|Vd|1111|Vn'|0|Vm'|0|Vm"            , ""],
    ["vpmax.f32"        , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|00|Vn|Vd|1111|Vn'|0|Vm'|0|Vm"            , ""],

    ["vpmax.x8-32"      , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|1010|Vn'|0|Vm'|0|Vm"            , ""],
    ["vpmax.x8-32"      , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|1010|Vn'|0|Vm'|0|Vm"            , ""],

    ["vpmin.f32"        , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|10|Vn|Vd|1111|Vn'|0|Vm'|0|Vm"            , ""],
    ["vpmin.f32"        , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|10|Vn|Vd|1111|Vn'|0|Vm'|0|Vm"            , ""],

    ["vpmin.x8-32"      , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|1010|Vn'|0|Vm'|1|Vm"            , ""],
    ["vpmin.x8-32"      , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|1010|Vn'|0|Vm'|1|Vm"            , ""],

    ["vqabs.s8-32"      , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|0111|0|0|Vn'|1|Vn"           , "FPSR.QC=X"],
    ["vqabs.s8-32"      , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|0111|0|0|Vn'|1|Vn"           , "FPSR.QC=X"],
    ["vqabs.s8-32"      , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|0111|0|1|Vn'|1|Vn"           , "FPSR.QC=X"],
    ["vqabs.s8-32"      , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|0111|0|1|Vn'|1|Vn"           , "FPSR.QC=X"],

    ["vqadd.x8-64"      , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0000|Vn'|0|Vm'|1|Vm"            , "FPSR.QC=X"],
    ["vqadd.x8-64"      , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0000|Vn'|0|Vm'|1|Vm"            , "FPSR.QC=X"],
    ["vqadd.x8-64"      , "Vd, Vn, Vm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0000|Vn'|1|Vm'|1|Vm"            , "FPSR.QC=X"],
    ["vqadd.x8-64"      , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0000|Vn'|1|Vm'|1|Vm"            , "FPSR.QC=X"],

    ["vqdmlal.s16-32"   , "Vx, Dn, Dm"                                  , "T32", "1110|11111|Vx'|Sz|Vn|Vx|1001|Vn'|0|Vm'|0|Vm"            , "FPSR.QC=X VEC_WIDEN"],
    ["vqdmlal.s16-32"   , "Vx, Dn, Dm"                                  , "A32", "1111|00101|Vx'|Sz|Vn|Vx|1001|Vn'|0|Vm'|0|Vm"            , "FPSR.QC=X VEC_WIDEN"],

    ["vqdmlal.s16"      , "Vx, Dn, Dm<=07, #Idx"                        , "T32", "1110|11111|Vx'|01|Vn|Vx|0011|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "FPSR.QC=X VEC_WIDEN"],
    ["vqdmlal.s16"      , "Vx, Dn, Dm<=07, #Idx"                        , "A32", "1111|00101|Vx'|01|Vn|Vx|0011|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "FPSR.QC=X VEC_WIDEN"],
    ["vqdmlal.s32"      , "Vx, Dn, Dm<=15, #Idx"                        , "T32", "1110|11111|Vx'|10|Vn|Vx|0011|Vn'|1|Idx:1|0|Vm"          , "FPSR.QC=X VEC_WIDEN"],
    ["vqdmlal.s32"      , "Vx, Dn, Dm<=15, #Idx"                        , "A32", "1111|00101|Vx'|10|Vn|Vx|0011|Vn'|1|Idx:1|0|Vm"          , "FPSR.QC=X VEC_WIDEN"],

    ["vqdmlsl.s16-32"   , "Vx, Dn, Dm"                                  , "T32", "1110|11111|Vx'|Sz|Vn|Vx|1011|Vn'|0|Vm'|0|Vm"            , "FPSR.QC=X VEC_WIDEN"],
    ["vqdmlsl.s16-32"   , "Vx, Dn, Dm"                                  , "A32", "1111|00101|Vx'|Sz|Vn|Vx|1011|Vn'|0|Vm'|0|Vm"            , "FPSR.QC=X VEC_WIDEN"],

    ["vqdmlsl.s16"      , "Vx, Dn, Dm<=07, #Idx"                        , "T32", "1110|11111|Vx'|01|Vn|Vx|0111|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "FPSR.QC=X VEC_WIDEN"],
    ["vqdmlsl.s16"      , "Vx, Dn, Dm<=07, #Idx"                        , "A32", "1111|00101|Vx'|01|Vn|Vx|0111|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "FPSR.QC=X VEC_WIDEN"],
    ["vqdmlsl.s32"      , "Vx, Dn, Dm<=15, #Idx"                        , "T32", "1110|11111|Vx'|10|Vn|Vx|0111|Vn'|1|Idx:1|0|Vm"          , "FPSR.QC=X VEC_WIDEN"],
    ["vqdmlsl.s32"      , "Vx, Dn, Dm<=15, #Idx"                        , "A32", "1111|00101|Vx'|10|Vn|Vx|0111|Vn'|1|Idx:1|0|Vm"          , "FPSR.QC=X VEC_WIDEN"],

    ["vqdmulh.s16-32"   , "Dd, Dn, Dm"                                  , "T32", "1110|11110|Vd'|Sz|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , "FPSR.QC=X"],
    ["vqdmulh.s16-32"   , "Dd, Dn, Dm"                                  , "A32", "1111|00100|Vd'|Sz|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , "FPSR.QC=X"],
    ["vqdmulh.s16-32"   , "Vd, Vn, Vm"                                  , "T32", "1110|11110|Vd'|Sz|Vn|Vd|1011|Vn'|1|Vm'|0|Vm"            , "FPSR.QC=X"],
    ["vqdmulh.s16-32"   , "Vd, Vn, Vm"                                  , "A32", "1111|00100|Vd'|Sz|Vn|Vd|1011|Vn'|1|Vm'|0|Vm"            , "FPSR.QC=X"],

    ["vqdmulh.s16"      , "Dd, Dn, Dm<=07, #Idx"                        , "T32", "1110|11111|Vd'|01|Vn|Vd|1100|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "FPSR.QC=X"],
    ["vqdmulh.s16"      , "Dd, Dn, Dm<=07, #Idx"                        , "A32", "1111|00101|Vd'|01|Vn|Vd|1100|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "FPSR.QC=X"],
    ["vqdmulh.s16"      , "Vd, Vn, Dm<=07, #Idx"                        , "T32", "1111|11111|Vd'|01|Vn|Vd|1100|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "FPSR.QC=X"],
    ["vqdmulh.s16"      , "Vd, Vn, Dm<=07, #Idx"                        , "A32", "1111|00111|Vd'|01|Vn|Vd|1100|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "FPSR.QC=X"],

    ["vqdmulh.s32"      , "Dd, Dn, Dm<=15, #Idx"                        , "T32", "1110|11111|Vd'|10|Vn|Vd|1100|Vn'|1|Idx:1|0|Vm"          , "FPSR.QC=X"],
    ["vqdmulh.s32"      , "Dd, Dn, Dm<=15, #Idx"                        , "A32", "1111|00101|Vd'|10|Vn|Vd|1100|Vn'|1|Idx:1|0|Vm"          , "FPSR.QC=X"],
    ["vqdmulh.s32"      , "Vd, Vn, Dm<=15, #Idx"                        , "T32", "1111|11111|Vd'|10|Vn|Vd|1100|Vn'|1|Idx:1|0|Vm"          , "FPSR.QC=X"],
    ["vqdmulh.s32"      , "Vd, Vn, Dm<=15, #Idx"                        , "A32", "1111|00111|Vd'|10|Vn|Vd|1100|Vn'|1|Idx:1|0|Vm"          , "FPSR.QC=X"],

    ["vqdmull.s16-32"   , "Vd, Dn, Dm"                                  , "T32", "1110|11111|Vd'|Sz|Vn|Vd|1101|Vn'|1|Vm'|0|Vm"            , "FPSR.QC=X VEC_WIDEN"],
    ["vqdmull.s16-32"   , "Vd, Dn, Dm"                                  , "A32", "1111|00101|Vd'|Sz|Vn|Vd|1101|Vn'|1|Vm'|0|Vm"            , "FPSR.QC=X VEC_WIDEN"],

    ["vqdmull.s16"      , "Vd, Dn, Dm<=07, #Idx"                        , "T32", "1110|11111|Vd'|01|Vn|Vd|1011|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "FPSR.QC=X VEC_WIDEN"],
    ["vqdmull.s16"      , "Vd, Dn, Dm<=07, #Idx"                        , "A32", "1111|00101|Vd'|01|Vn|Vd|1011|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "FPSR.QC=X VEC_WIDEN"],
    ["vqdmull.s32"      , "Vd, Dn, Dm<=15, #Idx"                        , "T32", "1110|11111|Vd'|10|Vn|Vd|1011|Vn'|1|Idx:1|0|Vm"          , "FPSR.QC=X VEC_WIDEN"],
    ["vqdmull.s32"      , "Vd, Dn, Dm<=15, #Idx"                        , "A32", "1111|00101|Vd'|10|Vn|Vd|1011|Vn'|1|Idx:1|0|Vm"          , "FPSR.QC=X VEC_WIDEN"],

    ["vqmovn.x16-64"    , "Dd, Vn"                                      , "T32", "1111|11111|Vd'|11|Sz-1|10|Vd|0010|1|U|Vn'|0|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqmovn.x16-64"    , "Dd, Vn"                                      , "A32", "1111|00111|Vd'|11|Sz-1|10|Vd|0010|1|U|Vn'|0|Vn"         , "FPSR.QC=X VEC_NARROW"],

    ["vqmovun.s16-64"   , "Dd, Vn"                                      , "T32", "1111|11111|Vd'|11|Sz-1|10|Vd|0010|0|1|Vn'|0|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqmovun.s16-64"   , "Dd, Vn"                                      , "A32", "1111|00111|Vd'|11|Sz-1|10|Vd|0010|0|1|Vn'|0|Vn"         , "FPSR.QC=X VEC_NARROW"],

    ["vqneg.s8-32"      , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|0111|1|0|Vn'|0|Vn"           , "FPSR.QC=X"],
    ["vqneg.s8-32"      , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|0111|1|0|Vn'|0|Vn"           , "FPSR.QC=X"],
    ["vqneg.s8-32"      , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|0111|1|1|Vn'|0|Vn"           , "FPSR.QC=X"],
    ["vqneg.s8-32"      , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|0111|1|1|Vn'|0|Vn"           , "FPSR.QC=X"],

    ["vqrdmulh.s16-32"  , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|Sz|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , "FPSR.QC=X"],
    ["vqrdmulh.s16-32"  , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|Sz|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , "FPSR.QC=X"],
    ["vqrdmulh.s16-32"  , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|Sz|Vn|Vd|1011|Vn'|1|Vm'|0|Vm"            , "FPSR.QC=X"],
    ["vqrdmulh.s16-32"  , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|Sz|Vn|Vd|1011|Vn'|1|Vm'|0|Vm"            , "FPSR.QC=X"],

    ["vqrdmulh.s16"     , "Dd, Dn, Dm<=07, #Idx"                        , "T32", "1110|11111|Vd'|01|Vn|Vd|1101|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "FPSR.QC=X"],
    ["vqrdmulh.s16"     , "Dd, Dn, Dm<=07, #Idx"                        , "A32", "1111|00101|Vd'|01|Vn|Vd|1101|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "FPSR.QC=X"],
    ["vqrdmulh.s16"     , "Vd, Vn, Dm<=07, #Idx"                        , "T32", "1111|11111|Vd'|01|Vn|Vd|1101|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "FPSR.QC=X"],
    ["vqrdmulh.s16"     , "Vd, Vn, Dm<=07, #Idx"                        , "A32", "1111|00111|Vd'|01|Vn|Vd|1101|Vn'|1|Idx:1|0|Idx:1|Vm:3"  , "FPSR.QC=X"],

    ["vqrdmulh.s32"     , "Dd, Dn, Dm<=15, #Idx"                        , "T32", "1110|11111|Vd'|10|Vn|Vd|1101|Vn'|1|Idx:1|0|Vm"          , "FPSR.QC=X"],
    ["vqrdmulh.s32"     , "Dd, Dn, Dm<=15, #Idx"                        , "A32", "1111|00101|Vd'|10|Vn|Vd|1101|Vn'|1|Idx:1|0|Vm"          , "FPSR.QC=X"],
    ["vqrdmulh.s32"     , "Vd, Vn, Dm<=15, #Idx"                        , "T32", "1111|11111|Vd'|10|Vn|Vd|1101|Vn'|1|Idx:1|0|Vm"          , "FPSR.QC=X"],
    ["vqrdmulh.s32"     , "Vd, Vn, Dm<=15, #Idx"                        , "A32", "1111|00111|Vd'|10|Vn|Vd|1101|Vn'|1|Idx:1|0|Vm"          , "FPSR.QC=X"],

    ["vqrshl.x8-64"     , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0101|Vn'|0|Vm'|1|Vm"            , "FPSR.QC=X"],
    ["vqrshl.x8-64"     , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0101|Vn'|0|Vm'|1|Vm"            , "FPSR.QC=X"],
    ["vqrshl.x8-64"     , "Vd, Vn, Vm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0101|Vn'|1|Vm'|1|Vm"            , "FPSR.QC=X"],
    ["vqrshl.x8-64"     , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0101|Vn'|1|Vm'|1|Vm"            , "FPSR.QC=X"],

    ["vqrshrn.x8"       , "Dd, Vn, #ImmN>=1"                            , "T32", "111U|11111|Vd'|001|ImmN:3|Vd|1001|0|1|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqrshrn.x8"       , "Dd, Vn, #ImmN>=1"                            , "A32", "1111|001U1|Vd'|001|ImmN:3|Vd|1001|0|1|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqrshrn.x16"      , "Dd, Vn, #ImmN>=1"                            , "T32", "111U|11111|Vd'|01| ImmN:4|Vd|1001|0|1|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqrshrn.x16"      , "Dd, Vn, #ImmN>=1"                            , "A32", "1111|001U1|Vd'|01| ImmN:4|Vd|1001|0|1|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqrshrn.x32"      , "Dd, Vn, #ImmN>=1"                            , "T32", "111U|11111|Vd'|1|  ImmN:5|Vd|1001|0|1|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqrshrn.x32"      , "Dd, Vn, #ImmN>=1"                            , "A32", "1111|001U1|Vd'|1|  ImmN:5|Vd|1001|0|1|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],

    ["vqrshrun.s8"      , "Dd, Vn, #ImmN>=1"                            , "T32", "1111|11111|Vd'|001|ImmN:3|Vd|1000|0|1|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqrshrun.s8"      , "Dd, Vn, #ImmN>=1"                            , "A32", "1111|00111|Vd'|001|ImmN:3|Vd|1000|0|1|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqrshrun.s16"     , "Dd, Vn, #ImmN>=1"                            , "T32", "1111|11111|Vd'|01| ImmN:4|Vd|1000|0|1|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqrshrun.s16"     , "Dd, Vn, #ImmN>=1"                            , "A32", "1111|00111|Vd'|01| ImmN:4|Vd|1000|0|1|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqrshrun.s32"     , "Dd, Vn, #ImmN>=1"                            , "T32", "1111|11111|Vd'|1|  ImmN:5|Vd|1000|0|1|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqrshrun.s32"     , "Dd, Vn, #ImmN>=1"                            , "A32", "1111|00111|Vd'|1|  ImmN:5|Vd|1000|0|1|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],

    ["vqshl.x8"         , "Dd, Dn, #ImmZ"                               , "T32", "111U|11111|Vd'|001|ImmZ:3|Vd|0111|0|0|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshl.x8"         , "Dd, Dn, #ImmZ"                               , "A32", "1111|001U1|Vd'|001|ImmZ:3|Vd|0111|0|0|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshl.x8"         , "Vd, Vn, #ImmZ"                               , "T32", "111U|11111|Vd'|001|ImmZ:3|Vd|0111|0|1|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshl.x8"         , "Vd, Vn, #ImmZ"                               , "A32", "1111|001U1|Vd'|001|ImmZ:3|Vd|0111|0|1|Vn'|1|Vn"         , "FPSR.QC=X"],

    ["vqshl.x16"        , "Dd, Dn, #ImmZ"                               , "T32", "111U|11111|Vd'|01| ImmZ:4|Vd|0111|0|0|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshl.x16"        , "Dd, Dn, #ImmZ"                               , "A32", "1111|001U1|Vd'|01| ImmZ:4|Vd|0111|0|0|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshl.x16"        , "Vd, Vn, #ImmZ"                               , "T32", "111U|11111|Vd'|01| ImmZ:4|Vd|0111|0|1|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshl.x16"        , "Vd, Vn, #ImmZ"                               , "A32", "1111|001U1|Vd'|01| ImmZ:4|Vd|0111|0|1|Vn'|1|Vn"         , "FPSR.QC=X"],

    ["vqshl.x32"        , "Dd, Dn, #ImmZ"                               , "T32", "111U|11111|Vd'|1|  ImmZ:5|Vd|0111|0|0|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshl.x32"        , "Dd, Dn, #ImmZ"                               , "A32", "1111|001U1|Vd'|1|  ImmZ:5|Vd|0111|0|0|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshl.x32"        , "Vd, Vn, #ImmZ"                               , "T32", "111U|11111|Vd'|1|  ImmZ:5|Vd|0111|0|1|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshl.x32"        , "Vd, Vn, #ImmZ"                               , "A32", "1111|001U1|Vd'|1|  ImmZ:5|Vd|0111|0|1|Vn'|1|Vn"         , "FPSR.QC=X"],

    ["vqshl.x64"        , "Dd, Dn, #ImmZ"                               , "T32", "111U|11111|Vd'|    ImmZ:6|Vd|0111|1|0|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshl.x64"        , "Dd, Dn, #ImmZ"                               , "A32", "1111|001U1|Vd'|    ImmZ:6|Vd|0111|1|0|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshl.x64"        , "Vd, Vn, #ImmZ"                               , "T32", "111U|11111|Vd'|    ImmZ:6|Vd|0111|1|1|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshl.x64"        , "Vd, Vn, #ImmZ"                               , "A32", "1111|001U1|Vd'|    ImmZ:6|Vd|0111|1|1|Vn'|1|Vn"         , "FPSR.QC=X"],

    ["vqshlu.u8"        , "Dd, Dn, #ImmZ"                               , "T32", "1111|11111|Vd'|001|ImmZ:3|Vd|0110|0|0|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshlu.u8"        , "Dd, Dn, #ImmZ"                               , "A32", "1111|00111|Vd'|001|ImmZ:3|Vd|0110|0|0|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshlu.u8"        , "Vd, Vn, #ImmZ"                               , "T32", "1111|11111|Vd'|001|ImmZ:3|Vd|0110|0|1|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshlu.u8"        , "Vd, Vn, #ImmZ"                               , "A32", "1111|00111|Vd'|001|ImmZ:3|Vd|0110|0|1|Vn'|1|Vn"         , "FPSR.QC=X"],

    ["vqshlu.s16"       , "Dd, Dn, #ImmZ"                               , "T32", "1111|11111|Vd'|01| ImmZ:4|Vd|0110|0|0|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshlu.s16"       , "Dd, Dn, #ImmZ"                               , "A32", "1111|00111|Vd'|01| ImmZ:4|Vd|0110|0|0|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshlu.s16"       , "Vd, Vn, #ImmZ"                               , "T32", "1111|11111|Vd'|01| ImmZ:4|Vd|0110|0|1|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshlu.s16"       , "Vd, Vn, #ImmZ"                               , "A32", "1111|00111|Vd'|01| ImmZ:4|Vd|0110|0|1|Vn'|1|Vn"         , "FPSR.QC=X"],

    ["vqshlu.s32"       , "Dd, Dn, #ImmZ"                               , "T32", "1111|11111|Vd'|1|  ImmZ:5|Vd|0110|0|0|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshlu.s32"       , "Dd, Dn, #ImmZ"                               , "A32", "1111|00111|Vd'|1|  ImmZ:5|Vd|0110|0|0|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshlu.s32"       , "Vd, Vn, #ImmZ"                               , "T32", "1111|11111|Vd'|1|  ImmZ:5|Vd|0110|0|1|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshlu.s32"       , "Vd, Vn, #ImmZ"                               , "A32", "1111|00111|Vd'|1|  ImmZ:5|Vd|0110|0|1|Vn'|1|Vn"         , "FPSR.QC=X"],

    ["vqshlu.s64"       , "Dd, Dn, #ImmZ"                               , "T32", "1111|11111|Vd'|    ImmZ:6|Vd|0110|1|0|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshlu.s64"       , "Dd, Dn, #ImmZ"                               , "A32", "1111|00111|Vd'|    ImmZ:6|Vd|0110|1|0|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshlu.s64"       , "Vd, Vn, #ImmZ"                               , "T32", "1111|11111|Vd'|    ImmZ:6|Vd|0110|1|1|Vn'|1|Vn"         , "FPSR.QC=X"],
    ["vqshlu.s64"       , "Vd, Vn, #ImmZ"                               , "A32", "1111|00111|Vd'|    ImmZ:6|Vd|0110|1|1|Vn'|1|Vn"         , "FPSR.QC=X"],

    ["vqshl.x8-64"      , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0100|Vn'|0|Vm'|1|Vm"            , "FPSR.QC=X"],
    ["vqshl.x8-64"      , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0100|Vn'|0|Vm'|1|Vm"            , "FPSR.QC=X"],
    ["vqshl.x8-64"      , "Vd, Vn, Vm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0100|Vn'|1|Vm'|1|Vm"            , "FPSR.QC=X"],
    ["vqshl.x8-64"      , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0100|Vn'|1|Vm'|1|Vm"            , "FPSR.QC=X"],

    ["vqshrn.x8"        , "Dd, Vn, #ImmN>=1"                            , "T32", "111U|11111|Vd'|001|ImmN:3|Vd|1001|0|0|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqshrn.x8"        , "Dd, Vn, #ImmN>=1"                            , "A32", "1111|001U1|Vd'|001|ImmN:3|Vd|1001|0|0|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqshrn.x16"       , "Dd, Vn, #ImmN>=1"                            , "T32", "111U|11111|Vd'|01| ImmN:4|Vd|1001|0|0|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqshrn.x16"       , "Dd, Vn, #ImmN>=1"                            , "A32", "1111|001U1|Vd'|01| ImmN:4|Vd|1001|0|0|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqshrn.x32"       , "Dd, Vn, #ImmN>=1"                            , "T32", "111U|11111|Vd'|1|  ImmN:5|Vd|1001|0|0|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqshrn.x32"       , "Dd, Vn, #ImmN>=1"                            , "A32", "1111|001U1|Vd'|1|  ImmN:5|Vd|1001|0|0|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],

    ["vqshrun.s8"       , "Dd, Vn, #ImmN>=1"                            , "T32", "1111|11111|Vd'|001|ImmN:3|Vd|1000|0|0|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqshrun.s8"       , "Dd, Vn, #ImmN>=1"                            , "A32", "1111|00111|Vd'|001|ImmN:3|Vd|1000|0|0|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqshrun.s16"      , "Dd, Vn, #ImmN>=1"                            , "T32", "1111|11111|Vd'|01| ImmN:4|Vd|1000|0|0|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqshrun.s16"      , "Dd, Vn, #ImmN>=1"                            , "A32", "1111|00111|Vd'|01| ImmN:4|Vd|1000|0|0|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqshrun.s32"      , "Dd, Vn, #ImmN>=1"                            , "T32", "1111|11111|Vd'|1|  ImmN:5|Vd|1000|0|0|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],
    ["vqshrun.s32"      , "Dd, Vn, #ImmN>=1"                            , "A32", "1111|00111|Vd'|1|  ImmN:5|Vd|1000|0|0|Vn'|1|Vn"         , "FPSR.QC=X VEC_NARROW"],

    ["vqsub.x8-64"      , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0010|Vn'|0|Vm'|1|Vm"            , "FPSR.QC=X"],
    ["vqsub.x8-64"      , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0010|Vn'|0|Vm'|1|Vm"            , "FPSR.QC=X"],
    ["vqsub.x8-64"      , "Vd, Vn, Vm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0010|Vn'|1|Vm'|1|Vm"            , "FPSR.QC=X"],
    ["vqsub.x8-64"      , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0010|Vn'|1|Vm'|1|Vm"            , "FPSR.QC=X"],

    ["vraddhn.x8-32"    , "Dd, Vn, Vm"                                  , "T32", "1111|11111|Vd'|Sz|Vn|Vd|0100|Vn'|0|Vm'|0|Vm"            , "VEC_NARROW"],
    ["vraddhn.x8-32"    , "Dd, Vn, Vm"                                  , "A32", "1111|00111|Vd'|Sz|Vn|Vd|0100|Vn'|0|Vm'|0|Vm"            , "VEC_NARROW"],

    ["vrecpe.f32|u32"   , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|10|11|Vd|010F|0|0|Vn'|0|Vn"           , ""],
    ["vrecpe.f32|u32"   , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|10|11|Vd|010F|0|0|Vn'|0|Vn"           , ""],
    ["vrecpe.f32|u32"   , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|10|11|Vd|010F|0|1|Vn'|0|Vn"           , ""],
    ["vrecpe.f32|u32"   , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|10|11|Vd|010F|0|1|Vn'|0|Vn"           , ""],

    ["vrecps.f32"       , "Dd, Dn, Dm"                                  , "T32", "1110|11110|Vd'|00|Vn|Vd|1111|Vn'|0|Vm'|1|Vm"            , ""],
    ["vrecps.f32"       , "Dd, Dn, Dm"                                  , "A32", "1111|00100|Vd'|00|Vn|Vd|1111|Vn'|0|Vm'|1|Vm"            , ""],
    ["vrecps.f32"       , "Vd, Vn, Vm"                                  , "T32", "1110|11110|Vd'|00|Vn|Vd|1111|Vn'|1|Vm'|1|Vm"            , ""],
    ["vrecps.f32"       , "Vd, Vn, Vm"                                  , "A32", "1111|00100|Vd'|00|Vn|Vd|1111|Vn'|1|Vm'|1|Vm"            , ""],

    ["vrev16.x8"        , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|00|00|Vd|0001|0|0|Vn'|0|Vn"           , ""],
    ["vrev16.x8"        , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|00|00|Vd|0001|0|0|Vn'|0|Vn"           , ""],
    ["vrev16.x8"        , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|00|00|Vd|0001|0|1|Vn'|0|Vn"           , ""],
    ["vrev16.x8"        , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|00|00|Vd|0001|0|1|Vn'|0|Vn"           , ""],

    ["vrev32.x8-16"     , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|0000|1|0|Vn'|0|Vn"           , ""],
    ["vrev32.x8-16"     , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|0000|1|0|Vn'|0|Vn"           , ""],
    ["vrev32.x8-16"     , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|0000|1|1|Vn'|0|Vn"           , ""],
    ["vrev32.x8-16"     , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|0000|1|1|Vn'|0|Vn"           , ""],

    ["vrev64.x8-32"     , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|0000|0|0|Vn'|0|Vn"           , ""],
    ["vrev64.x8-32"     , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|0000|0|0|Vn'|0|Vn"           , ""],
    ["vrev64.x8-32"     , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|Sz|00|Vd|0000|0|1|Vn'|0|Vn"           , ""],
    ["vrev64.x8-32"     , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|Sz|00|Vd|0000|0|1|Vn'|0|Vn"           , ""],

    ["vrhadd.x8-32"     , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0001|Vn'|0|Vm'|0|Vm"            , ""],
    ["vrhadd.x8-32 "    , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0001|Vn'|0|Vm'|0|Vm"            , ""],
    ["vrhadd.x8-32"     , "Vd, Vn, Vm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0001|Vn'|1|Vm'|0|Vm"            , ""],
    ["vrhadd.x8-32 "    , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0001|Vn'|1|Vm'|0|Vm"            , ""],

    ["vrinta.f32"       , "Sx, Sn"                                      , "T32", "1111|11101|'Vd|11|10|00|Vd|1010|0|1|'Vn|0|Vn"           , ""],
    ["vrinta.f32"       , "Sx, Sn"                                      , "A32", "1111|11101|'Vd|11|10|00|Vd|1010|0|1|'Vn|0|Vn"           , ""],
    ["vrinta.f64"       , "Dx, Dn"                                      , "T32", "1111|11101|Vd'|11|10|00|Vd|1011|0|1|Vn'|0|Vn"           , ""],
    ["vrinta.f64"       , "Dx, Dn"                                      , "A32", "1111|11101|Vd'|11|10|00|Vd|1011|0|1|Vn'|0|Vn"           , ""],

    ["vrinta.f32"       , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|10|10|Vd|0101|0|0|Vn'|0|Vn"           , ""],
    ["vrinta.f32"       , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|10|10|Vd|0101|0|0|Vn'|0|Vn"           , ""],
    ["vrinta.f32"       , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|10|10|Vd|0101|0|1|Vn'|0|Vn"           , ""],
    ["vrinta.f32"       , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|10|10|Vd|0101|0|1|Vn'|0|Vn"           , ""],

    ["vrintm.f32"       , "Sx, Sn"                                      , "T32", "1111|11101|'Vd|11|10|11|Vd|1010|0|1|'Vn|0|Vn"           , ""],
    ["vrintm.f32"       , "Sx, Sn"                                      , "A32", "1111|11101|'Vd|11|10|11|Vd|1010|0|1|'Vn|0|Vn"           , ""],
    ["vrintm.f64"       , "Dx, Dn"                                      , "T32", "1111|11101|Vd'|11|10|11|Vd|1011|0|1|Vn'|0|Vn"           , ""],
    ["vrintm.f64"       , "Dx, Dn"                                      , "A32", "1111|11101|Vd'|11|10|11|Vd|1011|0|1|Vn'|0|Vn"           , ""],

    ["vrintm.f32"       , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|10|10|Vd|0110|1|0|Vn'|0|Vn"           , ""],
    ["vrintm.f32"       , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|10|10|Vd|0110|1|0|Vn'|0|Vn"           , ""],
    ["vrintm.f32"       , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|10|10|Vd|0110|1|1|Vn'|0|Vn"           , ""],
    ["vrintm.f32"       , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|10|10|Vd|0110|1|1|Vn'|0|Vn"           , ""],

    ["vrintn.f32"       , "Sx, Sn"                                      , "T32", "1111|11101|'Vd|11|10|01|Vd|1010|0|1|'Vn|0|Vn"           , ""],
    ["vrintn.f32"       , "Sx, Sn"                                      , "A32", "1111|11101|'Vd|11|10|01|Vd|1010|0|1|'Vn|0|Vn"           , ""],
    ["vrintn.f64"       , "Dx, Dn"                                      , "T32", "1111|11101|Vd'|11|10|01|Vd|1011|0|1|Vn'|0|Vn"           , ""],
    ["vrintn.f64"       , "Dx, Dn"                                      , "A32", "1111|11101|Vd'|11|10|01|Vd|1011|0|1|Vn'|0|Vn"           , ""],

    ["vrintn.f32"       , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|10|10|Vd|0100|0|0|Vn'|0|Vn"           , ""],
    ["vrintn.f32"       , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|10|10|Vd|0100|0|0|Vn'|0|Vn"           , ""],
    ["vrintn.f32"       , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|10|10|Vd|0100|0|1|Vn'|0|Vn"           , ""],
    ["vrintn.f32"       , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|10|10|Vd|0100|0|1|Vn'|0|Vn"           , ""],

    ["vrintp.f32"       , "Sx, Sn"                                      , "T32", "1111|11101|'Vd|11|10|10|Vd|1010|0|1|'Vn|0|Vn"           , ""],
    ["vrintp.f32"       , "Sx, Sn"                                      , "A32", "1111|11101|'Vd|11|10|10|Vd|1010|0|1|'Vn|0|Vn"           , ""],
    ["vrintp.f64"       , "Dx, Dn"                                      , "T32", "1111|11101|Vd'|11|10|10|Vd|1011|0|1|Vn'|0|Vn"           , ""],
    ["vrintp.f64"       , "Dx, Dn"                                      , "A32", "1111|11101|Vd'|11|10|10|Vd|1011|0|1|Vn'|0|Vn"           , ""],

    ["vrintp.f32"       , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|10|10|Vd|0111|1|0|Vn'|0|Vn"           , ""],
    ["vrintp.f32"       , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|10|10|Vd|0111|1|0|Vn'|0|Vn"           , ""],
    ["vrintp.f32"       , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|10|10|Vd|0111|1|1|Vn'|0|Vn"           , ""],
    ["vrintp.f32"       , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|10|10|Vd|0111|1|1|Vn'|0|Vn"           , ""],

    ["vrintr.f32"       , "Sx, Sn"                                      , "T32", "1110|11101|'Vd|11|01|10|Vd|1010|0|1|'Vn|0|Vn"           , ""],
    ["vrintr.f32"       , "Sx, Sn"                                      , "A32", "Cond|11101|'Vd|11|01|10|Vd|1010|0|1|'Vn|0|Vn"           , ""],
    ["vrintr.f64"       , "Dx, Dn"                                      , "T32", "1110|11101|Vd'|11|01|10|Vd|1011|0|1|Vn'|0|Vn"           , ""],
    ["vrintr.f64"       , "Dx, Dn"                                      , "A32", "Cond|11101|Vd'|11|01|10|Vd|1011|0|1|Vn'|0|Vn"           , ""],

    ["vrintx.f32"       , "Sx, Sn"                                      , "T32", "1110|11101|'Vd|11|01|11|Vd|1010|0|1|'Vn|0|Vn"           , ""],
    ["vrintx.f32"       , "Sx, Sn"                                      , "A32", "Cond|11101|'Vd|11|01|11|Vd|1010|0|1|'Vn|0|Vn"           , ""],
    ["vrintx.f64"       , "Dx, Dn"                                      , "T32", "1110|11101|Vd'|11|01|11|Vd|1011|0|1|Vn'|0|Vn"           , ""],
    ["vrintx.f64"       , "Dx, Dn"                                      , "A32", "Cond|11101|Vd'|11|01|11|Vd|1011|0|1|Vn'|0|Vn"           , ""],

    ["vrintx.f32"       , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|10|10|Vd|0100|1|0|Vn'|0|Vn"           , ""],
    ["vrintx.f32"       , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|10|10|Vd|0100|1|0|Vn'|0|Vn"           , ""],
    ["vrintx.f32"       , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|10|10|Vd|0100|1|1|Vn'|0|Vn"           , ""],
    ["vrintx.f32"       , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|10|10|Vd|0100|1|1|Vn'|0|Vn"           , ""],

    ["vrintz.f32"       , "Sx, Sn"                                      , "T32", "1110|11101|'Vd|11|01|10|Vd|1010|1|1|'Vn|0|Vn"           , ""],
    ["vrintz.f32"       , "Sx, Sn"                                      , "A32", "Cond|11101|'Vd|11|01|10|Vd|1010|1|1|'Vn|0|Vn"           , ""],
    ["vrintz.f64"       , "Dx, Dn"                                      , "T32", "1110|11101|Vd'|11|01|10|Vd|1011|1|1|Vn'|0|Vn"           , ""],
    ["vrintz.f64"       , "Dx, Dn"                                      , "A32", "Cond|11101|Vd'|11|01|10|Vd|1011|1|1|Vn'|0|Vn"           , ""],

    ["vrintz.f32"       , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|10|10|Vd|0101|1|0|Vn'|0|Vn"           , ""],
    ["vrintz.f32"       , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|10|10|Vd|0101|1|0|Vn'|0|Vn"           , ""],
    ["vrintz.f32"       , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|10|10|Vd|0101|1|1|Vn'|0|Vn"           , ""],
    ["vrintz.f32"       , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|10|10|Vd|0101|1|1|Vn'|0|Vn"           , ""],

    ["vrshl.x8-64"      , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0101|Vn'|0|Vm'|0|Vm"            , ""],
    ["vrshl.x8-64"      , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0101|Vn'|0|Vm'|0|Vm"            , ""],
    ["vrshl.x8-64"      , "Vd, Vn, Vm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0101|Vn'|1|Vm'|0|Vm"            , ""],
    ["vrshl.x8-64"      , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0101|Vn'|1|Vm'|0|Vm"            , ""],

    ["vrshr.x8"         , "Dd, Dn, #ImmN>=1"                            , "T32", "111U|11111|Vd'|001|ImmN:3|Vd|0010|0|0|Vn'|1|Vn"         , ""],
    ["vrshr.x8"         , "Dd, Dn, #ImmN>=1"                            , "A32", "1111|001U1|Vd'|001|ImmN:3|Vd|0010|0|0|Vn'|1|Vn"         , ""],
    ["vrshr.x8"         , "Vd, Vn, #ImmN>=1"                            , "T32", "111U|11111|Vd'|001|ImmN:3|Vd|0010|0|1|Vn'|1|Vn"         , ""],
    ["vrshr.x8"         , "Vd, Vn, #ImmN>=1"                            , "A32", "1111|001U1|Vd'|001|ImmN:3|Vd|0010|0|1|Vn'|1|Vn"         , ""],

    ["vrshr.x16"        , "Dd, Dn, #ImmN>=1"                            , "T32", "111U|11111|Vd'|01| ImmN:4|Vd|0010|0|0|Vn'|1|Vn"         , ""],
    ["vrshr.x16"        , "Dd, Dn, #ImmN>=1"                            , "A32", "1111|001U1|Vd'|01| ImmN:4|Vd|0010|0|0|Vn'|1|Vn"         , ""],
    ["vrshr.x16"        , "Vd, Vn, #ImmN>=1"                            , "T32", "111U|11111|Vd'|01| ImmN:4|Vd|0010|0|1|Vn'|1|Vn"         , ""],
    ["vrshr.x16"        , "Vd, Vn, #ImmN>=1"                            , "A32", "1111|001U1|Vd'|01| ImmN:4|Vd|0010|0|1|Vn'|1|Vn"         , ""],

    ["vrshr.x32"        , "Dd, Dn, #ImmN>=1"                            , "T32", "111U|11111|Vd'|1|  ImmN:5|Vd|0010|0|0|Vn'|1|Vn"         , ""],
    ["vrshr.x32"        , "Dd, Dn, #ImmN>=1"                            , "A32", "1111|001U1|Vd'|1|  ImmN:5|Vd|0010|0|0|Vn'|1|Vn"         , ""],
    ["vrshr.x32"        , "Vd, Vn, #ImmN>=1"                            , "T32", "111U|11111|Vd'|1|  ImmN:5|Vd|0010|0|1|Vn'|1|Vn"         , ""],
    ["vrshr.x32"        , "Vd, Vn, #ImmN>=1"                            , "A32", "1111|001U1|Vd'|1|  ImmN:5|Vd|0010|0|1|Vn'|1|Vn"         , ""],

    ["vrshrn.x16"       , "Dd, Vn, #ImmN>=8"                            , "T32", "1110|11111|Vd'|001|ImmN:3|Vd|1000|0|1|Vn'|1|Vn"         , "VEC_NARROW"],
    ["vrshrn.x16"       , "Dd, Vn, #ImmN>=8"                            , "A32", "1111|00101|Vd'|001|ImmN:3|Vd|1000|0|1|Vn'|1|Vn"         , "VEC_NARROW"],
    ["vrshrn.x32"       , "Dd, Vn, #ImmN>=16"                           , "T32", "1110|11111|Vd'|01| ImmN:4|Vd|1000|0|1|Vn'|1|Vn"         , "VEC_NARROW"],
    ["vrshrn.x32"       , "Dd, Vn, #ImmN>=16"                           , "A32", "1111|00101|Vd'|01| ImmN:4|Vd|1000|0|1|Vn'|1|Vn"         , "VEC_NARROW"],
    ["vrshrn.x64"       , "Dd, Vn, #ImmN>=32"                           , "T32", "1110|11111|Vd'|1|  ImmN:5|Vd|1000|0|1|Vn'|1|Vn"         , "VEC_NARROW"],
    ["vrshrn.x64"       , "Dd, Vn, #ImmN>=32"                           , "A32", "1111|00101|Vd'|1|  ImmN:5|Vd|1000|0|1|Vn'|1|Vn"         , "VEC_NARROW"],

    ["vrsqrte.f32|u32"  , "Dd, Dn"                                      , "T32", "1111|11111|Vd'|11|10|11|Vd|010F|1|0|Vn'|0|Vn"           , ""],
    ["vrsqrte.f32|u32"  , "Dd, Dn"                                      , "A32", "1111|00111|Vd'|11|10|11|Vd|010F|1|0|Vn'|0|Vn"           , ""],
    ["vrsqrte.f32|u32"  , "Vd, Vn"                                      , "T32", "1111|11111|Vd'|11|10|11|Vd|010F|1|1|Vn'|0|Vn"           , ""],
    ["vrsqrte.f32|u32"  , "Vd, Vn"                                      , "A32", "1111|00111|Vd'|11|10|11|Vd|010F|1|1|Vn'|0|Vn"           , ""],

    ["vrsqrts.f32"      , "Dd, Dn, Dm"                                  , "T32", "1110|11110|Vd'|10|Vn|Vd|1111|Vn'|0|Vm'|0|Vm"            , ""],
    ["vrsqrts.f32"      , "Dd, Dn, Dm"                                  , "A32", "1111|00100|Vd'|10|Vn|Vd|1111|Vn'|0|Vm'|0|Vm"            , ""],
    ["vrsqrts.f32"      , "Vd, Vn, Vm"                                  , "T32", "1110|11110|Vd'|10|Vn|Vd|1111|Vn'|1|Vm'|1|Vm"            , ""],
    ["vrsqrts.f32"      , "Vd, Vn, Vm"                                  , "A32", "1111|00100|Vd'|10|Vn|Vd|1111|Vn'|1|Vm'|1|Vm"            , ""],

    ["vrsra.x8"         , "Dx, Dn, #ImmZ"                               , "T32", "111U|11111|Vx'|001|ImmZ:3|Vx|0011|0|0|Vn'|1|Vn"         , ""],
    ["vrsra.x8"         , "Dx, Dn, #ImmZ"                               , "A32", "1111|001U1|Vx'|001|ImmZ:3|Vx|0011|0|0|Vn'|1|Vn"         , ""],
    ["vrsra.x8"         , "Vx, Vn, #ImmZ"                               , "T32", "111U|11111|Vx'|001|ImmZ:3|Vx|0011|0|1|Vn'|1|Vn"         , ""],
    ["vrsra.x8"         , "Vx, Vn, #ImmZ"                               , "A32", "1111|001U1|Vx'|001|ImmZ:3|Vx|0011|0|1|Vn'|1|Vn"         , ""],

    ["vrsra.x16"        , "Dx, Dn, #ImmZ"                               , "T32", "111U|11111|Vx'|01| ImmZ:4|Vx|0011|0|0|Vn'|1|Vn"         , ""],
    ["vrsra.x16"        , "Dx, Dn, #ImmZ"                               , "A32", "1111|001U1|Vx'|01| ImmZ:4|Vx|0011|0|0|Vn'|1|Vn"         , ""],
    ["vrsra.x16"        , "Vx, Vn, #ImmZ"                               , "T32", "111U|11111|Vx'|01| ImmZ:4|Vx|0011|0|1|Vn'|1|Vn"         , ""],
    ["vrsra.x16"        , "Vx, Vn, #ImmZ"                               , "A32", "1111|001U1|Vx'|01| ImmZ:4|Vx|0011|0|1|Vn'|1|Vn"         , ""],

    ["vrsra.x32"        , "Dx, Dn, #ImmZ"                               , "T32", "111U|11111|Vx'|1|  ImmZ:5|Vx|0011|0|0|Vn'|1|Vn"         , ""],
    ["vrsra.x32"        , "Dx, Dn, #ImmZ"                               , "A32", "1111|001U1|Vx'|1|  ImmZ:5|Vx|0011|0|0|Vn'|1|Vn"         , ""],
    ["vrsra.x32"        , "Vx, Vn, #ImmZ"                               , "T32", "111U|11111|Vx'|1|  ImmZ:5|Vx|0011|0|1|Vn'|1|Vn"         , ""],
    ["vrsra.x32"        , "Vx, Vn, #ImmZ"                               , "A32", "1111|001U1|Vx'|1|  ImmZ:5|Vx|0011|0|1|Vn'|1|Vn"         , ""],

    ["vrsra.x64"        , "Dx, Dn, #ImmZ"                               , "T32", "111U|11111|Vx'|    ImmZ:6|Vx|0011|1|0|Vn'|1|Vn"         , ""],
    ["vrsra.x64"        , "Dx, Dn, #ImmZ"                               , "A32", "1111|001U1|Vx'|    ImmZ:6|Vx|0011|1|0|Vn'|1|Vn"         , ""],
    ["vrsra.x64"        , "Vx, Vn, #ImmZ"                               , "T32", "111U|11111|Vx'|    ImmZ:6|Vx|0011|1|1|Vn'|1|Vn"         , ""],
    ["vrsra.x64"        , "Vx, Vn, #ImmZ"                               , "A32", "1111|001U1|Vx'|    ImmZ:6|Vx|0011|1|1|Vn'|1|Vn"         , ""],

    ["vrsubhn.x16-64"   , "Dd, Qn, Qm"                                  , "T32", "1111|11111|Vd'|Sz-1|Vn|Vd|0110|Vn'|0|Vm'|0|Vm"          , "VEC_NARROW"],
    ["vrsubhn.x16-64"   , "Dd, Qn, Qm"                                  , "A32", "1111|00111|Vd'|Sz-1|Vn|Vd|0110|Vn'|0|Vm'|0|Vm"          , "VEC_NARROW"],

    ["vseleq.f32"       , "Sd, Sn, Sm"                                  , "T32", "1111|11100|'Vd|00|Vn|Vd|1010|'Vn|0|'Vm|0|Vm"            , "IT=OUT"],
    ["vseleq.f32"       , "Sd, Sn, Sm"                                  , "A32", "1111|11100|'Vd|00|Vn|Vd|1010|'Vn|0|'Vm|0|Vm"            , ""],
    ["vseleq.f64"       , "Dd, Dn, Dm"                                  , "T32", "1111|11100|Vd'|00|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , "IT=OUT"],
    ["vseleq.f64"       , "Dd, Dn, Dm"                                  , "A32", "1111|11100|Vd'|00|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , ""],

    ["vselge.f32"       , "Sd, Sn, Sm"                                  , "T32", "1111|11100|'Vd|10|Vn|Vd|1010|'Vn|0|'Vm|0|Vm"            , "IT=OUT"],
    ["vselge.f32"       , "Sd, Sn, Sm"                                  , "A32", "1111|11100|'Vd|10|Vn|Vd|1010|'Vn|0|'Vm|0|Vm"            , ""],
    ["vselge.f64"       , "Dd, Dn, Dm"                                  , "T32", "1111|11100|Vd'|10|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , "IT=OUT"],
    ["vselge.f64"       , "Dd, Dn, Dm"                                  , "A32", "1111|11100|Vd'|10|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , ""],

    ["vselgt.f32"       , "Sd, Sn, Sm"                                  , "T32", "1111|11100|'Vd|11|Vn|Vd|1010|'Vn|0|'Vm|0|Vm"            , "IT=OUT"],
    ["vselgt.f32"       , "Sd, Sn, Sm"                                  , "A32", "1111|11100|'Vd|11|Vn|Vd|1010|'Vn|0|'Vm|0|Vm"            , ""],
    ["vselgt.f64"       , "Dd, Dn, Dm"                                  , "T32", "1111|11100|Vd'|11|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , "IT=OUT"],
    ["vselgt.f64"       , "Dd, Dn, Dm"                                  , "A32", "1111|11100|Vd'|11|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , ""],

    ["vselvs.f32"       , "Sd, Sn, Sm"                                  , "T32", "1111|11100|'Vd|01|Vn|Vd|1010|'Vn|0|'Vm|0|Vm"            , "IT=OUT"],
    ["vselvs.f32"       , "Sd, Sn, Sm"                                  , "A32", "1111|11100|'Vd|01|Vn|Vd|1010|'Vn|0|'Vm|0|Vm"            , ""],
    ["vselvs.f64"       , "Dd, Dn, Dm"                                  , "T32", "1111|11100|Vd'|01|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , "IT=OUT"],
    ["vselvs.f64"       , "Dd, Dn, Dm"                                  , "A32", "1111|11100|Vd'|01|Vn|Vd|1011|Vn'|0|Vm'|0|Vm"            , ""],

    ["vshl.x8"          , "Dd, Dn, #ImmZ"                               , "T32", "1110|11111|Vd'|001|ImmZ:3|Vd|0101|0|0|Vn'|1|Vn"         , ""],
    ["vshl.x8"          , "Dd, Dn, #ImmZ"                               , "A32", "1111|00101|Vd'|001|ImmZ:3|Vd|0101|0|0|Vn'|1|Vn"         , ""],
    ["vshl.x8"          , "Vd, Vn, #ImmZ"                               , "T32", "1110|11111|Vd'|001|ImmZ:3|Vd|0101|0|1|Vn'|1|Vn"         , ""],
    ["vshl.x8"          , "Vd, Vn, #ImmZ"                               , "A32", "1111|00101|Vd'|001|ImmZ:3|Vd|0101|0|1|Vn'|1|Vn"         , ""],

    ["vshl.x16"         , "Dd, Dn, #ImmZ"                               , "T32", "1110|11111|Vd'|01| ImmZ:4|Vd|0101|0|0|Vn'|1|Vn"         , ""],
    ["vshl.x16"         , "Dd, Dn, #ImmZ"                               , "A32", "1111|00101|Vd'|01| ImmZ:4|Vd|0101|0|0|Vn'|1|Vn"         , ""],
    ["vshl.x16"         , "Vd, Vn, #ImmZ"                               , "T32", "1110|11111|Vd'|01| ImmZ:4|Vd|0101|0|1|Vn'|1|Vn"         , ""],
    ["vshl.x16"         , "Vd, Vn, #ImmZ"                               , "A32", "1111|00101|Vd'|01| ImmZ:4|Vd|0101|0|1|Vn'|1|Vn"         , ""],

    ["vshl.x32"         , "Dd, Dn, #ImmZ"                               , "T32", "1110|11111|Vd'|1|  ImmZ:5|Vd|0101|0|0|Vn'|1|Vn"         , ""],
    ["vshl.x32"         , "Dd, Dn, #ImmZ"                               , "A32", "1111|00101|Vd'|1|  ImmZ:5|Vd|0101|0|0|Vn'|1|Vn"         , ""],
    ["vshl.x32"         , "Vd, Vn, #ImmZ"                               , "T32", "1110|11111|Vd'|1|  ImmZ:5|Vd|0101|0|1|Vn'|1|Vn"         , ""],
    ["vshl.x32"         , "Vd, Vn, #ImmZ"                               , "A32", "1111|00101|Vd'|1|  ImmZ:5|Vd|0101|0|1|Vn'|1|Vn"         , ""],

    ["vshl.x64"         , "Dd, Dn, #ImmZ"                               , "T32", "1110|11111|Vd'|    ImmZ:6|Vd|0101|1|0|Vn'|1|Vn"         , ""],
    ["vshl.x64"         , "Dd, Dn, #ImmZ"                               , "A32", "1111|00101|Vd'|    ImmZ:6|Vd|0101|1|0|Vn'|1|Vn"         , ""],
    ["vshl.x64"         , "Vd, Vn, #ImmZ"                               , "T32", "1110|11111|Vd'|    ImmZ:6|Vd|0101|1|1|Vn'|1|Vn"         , ""],
    ["vshl.x64"         , "Vd, Vn, #ImmZ"                               , "A32", "1111|00101|Vd'|    ImmZ:6|Vd|0101|1|1|Vn'|1|Vn"         , ""],

    ["vshl.x8-64"       , "Dd, Dn, Dm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0100|Vn'|0|Vm'|0|Vm"            , ""],
    ["vshl.x8-64"       , "Dd, Dn, Dm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0100|Vn'|0|Vm'|0|Vm"            , ""],
    ["vshl.x8-64"       , "Vd, Vn, Vm"                                  , "T32", "111U|11110|Vd'|Sz|Vn|Vd|0100|Vn'|1|Vm'|0|Vm"            , ""],
    ["vshl.x8-64"       , "Vd, Vn, Vm"                                  , "A32", "1111|001U0|Vd'|Sz|Vn|Vd|0100|Vn'|1|Vm'|0|Vm"            , ""],

    ["vshll.x8"         , "Vd, Dn, #ImmZ"                               , "T32", "111U|11111|Vd'|001|ImmZ:3|Vd|1010|0|0|Vn'|1|Vn"         , "VEC_WIDEN"],
    ["vshll.x8"         , "Vd, Dn, #ImmZ"                               , "A32", "1111|001U1|Vd'|001|ImmZ:3|Vd|1010|0|0|Vn'|1|Vn"         , "VEC_WIDEN"],
    ["vshll.x16"        , "Vd, Dn, #ImmZ"                               , "T32", "111U|11111|Vd'|01| ImmZ:4|Vd|1010|0|0|Vn'|1|Vn"         , "VEC_WIDEN"],
    ["vshll.x16"        , "Vd, Dn, #ImmZ"                               , "A32", "1111|001U1|Vd'|01| ImmZ:4|Vd|1010|0|0|Vn'|1|Vn"         , "VEC_WIDEN"],
    ["vshll.x32"        , "Vd, Dn, #ImmZ"                               , "T32", "111U|11111|Vd'|1|  ImmZ:5|Vd|1010|0|0|Vn'|1|Vn"         , "VEC_WIDEN"],
    ["vshll.x32"        , "Vd, Dn, #ImmZ"                               , "A32", "1111|001U1|Vd'|1|  ImmZ:5|Vd|1010|0|0|Vn'|1|Vn"         , "VEC_WIDEN"],

    ["vshll.x8-32"      , "Vd, Dn, Dm"                                  , "T32", "1111|11111|Vd'|11|Sz|10|Vd|0011|0|0|Vn'|0|Vn"           , "VEC_WIDEN"],
    ["vshll.x8-32"      , "Vd, Dn, Dm"                                  , "A32", "1111|00111|Vd'|11|Sz|10|Vd|0011|0|0|Vn'|0|Vn"           , "VEC_WIDEN"],

    ["vshr.x8"          , "Dd, Dn, #ImmN"                               , "T32", "111U|11111|Vd'|001|ImmN:3|Vd|0000|0|0|Vn'|1|Vn"         , ""],
    ["vshr.x8"          , "Dd, Dn, #ImmN"                               , "A32", "1111|001U1|Vd'|001|ImmN:3|Vd|0000|0|0|Vn'|1|Vn"         , ""],
    ["vshr.x8"          , "Vd, Vn, #ImmN"                               , "T32", "111U|11111|Vd'|001|ImmN:3|Vd|0000|0|1|Vn'|1|Vn"         , ""],
    ["vshr.x8"          , "Vd, Vn, #ImmN"                               , "A32", "1111|001U1|Vd'|001|ImmN:3|Vd|0000|0|1|Vn'|1|Vn"         , ""],

    ["vshr.x16"         , "Dd, Dn, #ImmN"                               , "T32", "111U|11111|Vd'|01| ImmN:4|Vd|0000|0|0|Vn'|1|Vn"         , ""],
    ["vshr.x16"         , "Dd, Dn, #ImmN"                               , "A32", "1111|001U1|Vd'|01| ImmN:4|Vd|0000|0|0|Vn'|1|Vn"         , ""],
    ["vshr.x16"         , "Vd, Vn, #ImmN"                               , "T32", "111U|11111|Vd'|01| ImmN:4|Vd|0000|0|1|Vn'|1|Vn"         , ""],
    ["vshr.x16"         , "Vd, Vn, #ImmN"                               , "A32", "1111|001U1|Vd'|01| ImmN:4|Vd|0000|0|1|Vn'|1|Vn"         , ""],

    ["vshr.x32"         , "Dd, Dn, #ImmN"                               , "T32", "111U|11111|Vd'|1|  ImmN:5|Vd|0000|0|0|Vn'|1|Vn"         , ""],
    ["vshr.x32"         , "Dd, Dn, #ImmN"                               , "A32", "1111|001U1|Vd'|1|  ImmN:5|Vd|0000|0|0|Vn'|1|Vn"         , ""],
    ["vshr.x32"         , "Vd, Vn, #ImmN"                               , "T32", "111U|11111|Vd'|1|  ImmN:5|Vd|0000|0|1|Vn'|1|Vn"         , ""],
    ["vshr.x32"         , "Vd, Vn, #ImmN"                               , "A32", "1111|001U1|Vd'|1|  ImmN:5|Vd|0000|0|1|Vn'|1|Vn"         , ""],

    ["vshr.x64"         , "Dd, Dn, #ImmN"                               , "T32", "111U|11111|Vd'|    ImmN:6|Vd|0000|1|0|Vn'|1|Vn"         , ""],
    ["vshr.x64"         , "Dd, Dn, #ImmN"                               , "A32", "1111|001U1|Vd'|    ImmN:6|Vd|0000|1|0|Vn'|1|Vn"         , ""],
    ["vshr.x64"         , "Vd, Vn, #ImmN"                               , "T32", "111U|11111|Vd'|    ImmN:6|Vd|0000|1|1|Vn'|1|Vn"         , ""],
    ["vshr.x64"         , "Vd, Vn, #ImmN"                               , "A32", "1111|001U1|Vd'|    ImmN:6|Vd|0000|1|1|Vn'|1|Vn"         , ""],

    ["vshrl.x16"        , "Dd, Vn, #ImmN>=8"                            , "T32", "1110|11111|Vd'|001|ImmN:3|Vd|1000|0|0|Vn'|1|Vn"         , "VEC_NARROW"],
    ["vshrl.x16"        , "Dd, Vn, #ImmN>=8"                            , "A32", "1111|00101|Vd'|001|ImmN:3|Vd|1000|0|0|Vn'|1|Vn"         , "VEC_NARROW"],
    ["vshrl.x32"        , "Dd, Vn, #ImmN>=16"                           , "T32", "1110|11111|Vd'|01| ImmN:4|Vd|1000|0|0|Vn'|1|Vn"         , "VEC_NARROW"],
    ["vshrl.x32"        , "Dd, Vn, #ImmN>=16"                           , "A32", "1111|00101|Vd'|01| ImmN:4|Vd|1000|0|0|Vn'|1|Vn"         , "VEC_NARROW"],
    ["vshrl.x64"        , "Dd, Vn, #ImmN>=32"                           , "T32", "1110|11111|Vd'|1|  ImmN:5|Vd|1000|0|0|Vn'|1|Vn"         , "VEC_NARROW"],
    ["vshrl.x64"        , "Dd, Vn, #ImmN>=32"                           , "A32", "1111|00101|Vd'|1|  ImmN:5|Vd|1000|0|0|Vn'|1|Vn"         , "VEC_NARROW"],

    ["vsli.x8"          , "Dx, Dn, #ImmZ"                               , "T32", "1111|11111|Vx'|001|ImmZ:3|Vx|0101|0|0|Vn'|1|Vn"         , ""],
    ["vsli.x8"          , "Dx, Dn, #ImmZ"                               , "A32", "1111|00111|Vx'|001|ImmZ:3|Vx|0101|0|0|Vn'|1|Vn"         , ""],
    ["vsli.x8"          , "Vx, Vn, #ImmZ"                               , "T32", "1111|11111|Vx'|001|ImmZ:3|Vx|0101|0|1|Vn'|1|Vn"         , ""],
    ["vsli.x8"          , "Vx, Vn, #ImmZ"                               , "A32", "1111|00111|Vx'|001|ImmZ:3|Vx|0101|0|1|Vn'|1|Vn"         , ""],

    ["vsli.x16"         , "Dx, Dn, #ImmZ"                               , "T32", "1111|11111|Vx'|01| ImmZ:4|Vx|0101|0|0|Vn'|1|Vn"         , ""],
    ["vsli.x16"         , "Dx, Dn, #ImmZ"                               , "A32", "1111|00111|Vx'|01| ImmZ:4|Vx|0101|0|0|Vn'|1|Vn"         , ""],
    ["vsli.x16"         , "Vx, Vn, #ImmZ"                               , "T32", "1111|11111|Vx'|01| ImmZ:4|Vx|0101|0|1|Vn'|1|Vn"         , ""],
    ["vsli.x16"         , "Vx, Vn, #ImmZ"                               , "A32", "1111|00111|Vx'|01| ImmZ:4|Vx|0101|0|1|Vn'|1|Vn"         , ""],

    ["vsli.x32"         , "Dx, Dn, #ImmZ"                               , "T32", "1111|11111|Vx'|1|  ImmZ:5|Vx|0101|0|0|Vn'|1|Vn"         , ""],
    ["vsli.x32"         , "Dx, Dn, #ImmZ"                               , "A32", "1111|00111|Vx'|1|  ImmZ:5|Vx|0101|0|0|Vn'|1|Vn"         , ""],
    ["vsli.x32"         , "Vx, Vn, #ImmZ"                               , "T32", "1111|11111|Vx'|1|  ImmZ:5|Vx|0101|0|1|Vn'|1|Vn"         , ""],
    ["vsli.x32"         , "Vx, Vn, #ImmZ"                               , "A32", "1111|00111|Vx'|1|  ImmZ:5|Vx|0101|0|1|Vn'|1|Vn"         , ""],

    ["vsli.x64"         , "Dx, Dn, #ImmZ"                               , "T32", "1111|11111|Vx'|    ImmZ:6|Vx|0101|1|0|Vn'|1|Vn"         , ""],
    ["vsli.x64"         , "Dx, Dn, #ImmZ"                               , "A32", "1111|00111|Vx'|    ImmZ:6|Vx|0101|1|0|Vn'|1|Vn"         , ""],
    ["vsli.x64"         , "Vx, Vn, #ImmZ"                               , "T32", "1111|11111|Vx'|    ImmZ:6|Vx|0101|1|1|Vn'|1|Vn"         , ""],
    ["vsli.x64"         , "Vx, Vn, #ImmZ"                               , "A32", "1111|00111|Vx'|    ImmZ:6|Vx|0101|1|1|Vn'|1|Vn"         , ""],

    ["vsqrt.f32"        , "Sd, Sn"                                      , "T32", "1110|11101|'Vd|11|0001|Vd|1010|1|1|'Vn|0|Vn"            , ""],
    ["vsqrt.f32"        , "Sd, Sn"                                      , "A32", "Cond|11101|'Vd|11|0001|Vd|1010|1|1|'Vn|0|Vn"            , ""],
    ["vsqrt.f64"        , "Dd, Dn"                                      , "T32", "1110|11101|Vd'|11|0001|Vd|1011|1|1|Vn'|0|Vn"            , ""],
    ["vsqrt.f64"        , "Dd, Dn"                                      , "A32", "Cond|11101|Vd'|11|0001|Vd|1011|1|1|Vn'|0|Vn"            , ""],

    ["vsra.x8"          , "Dx, Dn, #ImmN"                               , "T32", "111U|11111|Vx'|001|ImmN:3|Vx|0001|0|0|Vn'|1|Vn"         , ""],
    ["vsra.x8"          , "Dx, Dn, #ImmN"                               , "A32", "1111|001U1|Vx'|001|ImmN:3|Vx|0001|0|0|Vn'|1|Vn"         , ""],
    ["vsra.x8"          , "Vx, Vn, #ImmN"                               , "T32", "111U|11111|Vx'|001|ImmN:3|Vx|0001|0|1|Vn'|1|Vn"         , ""],
    ["vsra.x8"          , "Vx, Vn, #ImmN"                               , "A32", "1111|001U1|Vx'|001|ImmN:3|Vx|0001|0|1|Vn'|1|Vn"         , ""],

    ["vsra.x16"         , "Dx, Dn, #ImmN"                               , "T32", "111U|11111|Vx'|01| ImmN:4|Vx|0001|0|0|Vn'|1|Vn"         , ""],
    ["vsra.x16"         , "Dx, Dn, #ImmN"                               , "A32", "1111|001U1|Vx'|01| ImmN:4|Vx|0001|0|0|Vn'|1|Vn"         , ""],
    ["vsra.x16"         , "Vx, Vn, #ImmN"                               , "T32", "111U|11111|Vx'|01| ImmN:4|Vx|0001|0|1|Vn'|1|Vn"         , ""],
    ["vsra.x16"         , "Vx, Vn, #ImmN"                               , "A32", "1111|001U1|Vx'|01| ImmN:4|Vx|0001|0|1|Vn'|1|Vn"         , ""],

    ["vsra.x32"         , "Dx, Dn, #ImmN"                               , "T32", "111U|11111|Vx'|1|  ImmN:5|Vx|0001|0|0|Vn'|1|Vn"         , ""],
    ["vsra.x32"         , "Dx, Dn, #ImmN"                               , "A32", "1111|001U1|Vx'|1|  ImmN:5|Vx|0001|0|0|Vn'|1|Vn"         , ""],
    ["vsra.x32"         , "Vx, Vn, #ImmN"                               , "T32", "111U|11111|Vx'|1|  ImmN:5|Vx|0001|0|1|Vn'|1|Vn"         , ""],
    ["vsra.x32"         , "Vx, Vn, #ImmN"                               , "A32", "1111|001U1|Vx'|1|  ImmN:5|Vx|0001|0|1|Vn'|1|Vn"         , ""],

    ["vsra.x64"         , "Dx, Dn, #ImmN"                               , "T32", "111U|11111|Vx'|    ImmN:6|Vx|0001|1|0|Vn'|1|Vn"         , ""],
    ["vsra.x64"         , "Dx, Dn, #ImmN"                               , "A32", "1111|001U1|Vx'|    ImmN:6|Vx|0001|1|0|Vn'|1|Vn"         , ""],
    ["vsra.x64"         , "Vx, Vn, #ImmN"                               , "T32", "111U|11111|Vx'|    ImmN:6|Vx|0001|1|1|Vn'|1|Vn"         , ""],
    ["vsra.x64"         , "Vx, Vn, #ImmN"                               , "A32", "1111|001U1|Vx'|    ImmN:6|Vx|0001|1|1|Vn'|1|Vn"         , ""],

    ["vsri.x8"          , "Dx, Dn, #ImmN"                               , "T32", "1111|11111|Vx'|001|ImmN:3|Vx|0100|0|0|Vn'|1|Vn"         , ""],
    ["vsri.x8"          , "Dx, Dn, #ImmN"                               , "A32", "1111|00111|Vx'|001|ImmN:3|Vx|0100|0|0|Vn'|1|Vn"         , ""],
    ["vsri.x8"          , "Vx, Vn, #ImmN"                               , "T32", "1111|11111|Vx'|001|ImmN:3|Vx|0100|0|1|Vn'|1|Vn"         , ""],
    ["vsri.x8"          , "Vx, Vn, #ImmN"                               , "A32", "1111|00111|Vx'|001|ImmN:3|Vx|0100|0|1|Vn'|1|Vn"         , ""],

    ["vsri.x16"         , "Dx, Dn, #ImmN"                               , "T32", "1111|11111|Vx'|01| ImmN:4|Vx|0100|0|0|Vn'|1|Vn"         , ""],
    ["vsri.x16"         , "Dx, Dn, #ImmN"                               , "A32", "1111|00111|Vx'|01| ImmN:4|Vx|0100|0|0|Vn'|1|Vn"         , ""],
    ["vsri.x16"         , "Vx, Vn, #ImmN"                               , "T32", "1111|11111|Vx'|01| ImmN:4|Vx|0100|0|1|Vn'|1|Vn"         , ""],
    ["vsri.x16"         , "Vx, Vn, #ImmN"                               , "A32", "1111|00111|Vx'|01| ImmN:4|Vx|0100|0|1|Vn'|1|Vn"         , ""],

    ["vsri.x32"         , "Dx, Dn, #ImmN"                               , "T32", "1111|11111|Vx'|1|  Immn:5|Vx|0100|0|0|Vn'|1|Vn"         , ""],
    ["vsri.x32"         , "Dx, Dn, #ImmN"                               , "A32", "1111|00111|Vx'|1|  ImmN:5|Vx|0100|0|0|Vn'|1|Vn"         , ""],
    ["vsri.x32"         , "Vx, Vn, #ImmN"                               , "T32", "1111|11111|Vx'|1|  ImmN:5|Vx|0100|0|1|Vn'|1|Vn"         , ""],
    ["vsri.x32"         , "Vx, Vn, #ImmN"                               , "A32", "1111|00111|Vx'|1|  ImmN:5|Vx|0100|0|1|Vn'|1|Vn"         , ""],

    ["vsri.x64"         , "Dx, Dn, #ImmN"                               , "T32", "1111|11111|Vx'|    ImmN:6|Vx|0100|1|0|Vn'|1|Vn"         , ""],
    ["vsri.x64"         , "Dx, Dn, #ImmN"                               , "A32", "1111|00111|Vx'|    ImmN:6|Vx|0100|1|0|Vn'|1|Vn"         , ""],
    ["vsri.x64"         , "Vx, Vn, #ImmN"                               , "T32", "1111|11111|Vx'|    ImmN:6|Vx|0100|1|1|Vn'|1|Vn"         , ""],
    ["vsri.x64"         , "Vx, Vn, #ImmN"                               , "A32", "1111|00111|Vx'|    ImmN:6|Vx|0100|1|1|Vn'|1|Vn"         , ""],

    ["vsub.f32"         , "Sd, Sn, Sm"                                  , "T32", "1110|11100|Vd'|11|Vn|Vd|1010|Vn'|1|Vm'|0|Vm"            , ""],
    ["vsub.f32"         , "Sd, Sn, Sm"                                  , "A32", "Cond|11100|Vd'|11|Vn|Vd|1010|Vn'|1|Vm'|0|Vm"            , ""],
    ["vsub.f64"         , "Dd, Dn, Dm"                                  , "T32", "1110|11100|Vd'|11|Vn|Vd|1011|Vn'|1|Vm'|0|Vm"            , ""],
    ["vsub.f64"         , "Dd, Dn, Dm"                                  , "A32", "Cond|11100|Vd'|11|Vn|Vd|1011|Vn'|1|Vm'|0|Vm"            , ""],

    ["vsub.f32"         , "Dd, Dn, Dm"                                  , "T32", "1110|11110|Vd'|10|Vn|Vd|1101|Vn'|0|Vm'|0|Vm"            , ""],
    ["vsub.f32"         , "Dd, Dn, Dm"                                  , "A32", "1111|00100|Vd'|10|Vn|Vd|1101|Vn'|0|Vm'|0|Vm"            , ""],
    ["vsub.f32"         , "Vd, Vn, Vm"                                  , "T32", "1110|11110|Vd'|10|Vn|Vd|1101|Vn'|1|Vm'|0|Vm"            , ""],
    ["vsub.f32"         , "Vd, Vn, Vm"                                  , "A32", "1111|00100|Vd'|10|Vn|Vd|1101|Vn'|1|Vm'|0|Vm"            , ""],

    ["vsub.x8-64"       , "Dd, Dn, Dm"                                  , "T32", "1111|11110|Vd'|Sz|Vn|Vd|1000|Vn'|0|Vm'|0|Vm"            , ""],
    ["vsub.x8-64"       , "Dd, Dn, Dm"                                  , "A32", "1111|00110|Vd'|Sz|Vn|Vd|1000|Vn'|0|Vm'|0|Vm"            , ""],
    ["vsub.x8-64"       , "Vd, Vn, Vm"                                  , "T32", "1111|11110|Vd'|Sz|Vn|Vd|1000|Vn'|1|Vm'|0|Vm"            , ""],
    ["vsub.x8-64"       , "Vd, Vn, Vm"                                  , "A32", "1111|00110|Vd'|Sz|Vn|Vd|1000|Vn'|1|Vm'|0|Vm"            , ""],

    ["vsubhn.x8-32"     , "Dd, Vn, Vm"                                  , "T32", "1110|11111|Vd'|Sz|Vn|Vd|0110|Vn'|0|Vm'|0|Vm"            , "VEC_NARROW"],
    ["vsubhn.x8-32"     , "Dd, Vn, Vm"                                  , "A32", "1111|00101|Vd'|Sz|Vn|Vd|0110|Vn'|0|Vm'|0|Vm"            , "VEC_NARROW"],

    ["vsubl.x8-32"      , "Vd, Dn, Dm"                                  , "T32", "111U|11111|Vd'|Sz|Vn|Vd|0010|Vn'|0|Vm'|0|Vm"            , "VEC_WIDEN"],
    ["vsubl.x8-32"      , "Vd, Dn, Dm"                                  , "A32", "1111|001U1|Vd'|Sz|Vn|Vd|0010|Vn'|0|Vm'|0|Vm"            , "VEC_WIDEN"],

    ["vsubw.x8-32"      , "Vd, Vn, Dm"                                  , "T32", "111U|11111|Vd'|Sz|Vn|Vd|0011|Vn'|0|Vm'|0|Vm"            , "VEC_WIDEN"],
    ["vsubw.x8-32"      , "Vd, Vn, Dm"                                  , "A32", "1111|001U1|Vd'|Sz|Vn|Vd|0011|Vn'|0|Vm'|0|Vm"            , "VEC_WIDEN"],

    ["vswp.any"         , "Dx, Dx2"                                     , "T32", "1111|11111|Vx'|11|00|10|Vx|0000|0|0|Vx2'|0|Vx2"         , ""],
    ["vswp.any"         , "Dx, Dx2"                                     , "A32", "1111|00111|Vx'|11|00|10|Vx|0000|0|0|Vx2'|0|Vx2"         , ""],

    ["vswp.any"         , "Vx, Vx2!=Vx"                                 , "T32", "111U|11111|Vx'|11|00|10|Vx|0000|0|1|Vx2'|0|Vx2"         , ""],
    ["vswp.any"         , "Vx, Vx2!=Vx"                                 , "A32", "1111|001U1|Vx'|11|00|10|Vx|0000|0|1|Vx2'|0|Vx2"         , ""],

    ["vtbl.x8"          , "Dd, Dn, Dm"                                  , "T32", "1111|11111|Vd'|11|Vn|Vd|10|00|Vn'|0|Vm'|0|Vm"           , ""],
    ["vtbl.x8"          , "Dd, Dn, Dm"                                  , "A32", "1111|00111|Vd'|11|Vn|Vd|10|00|Vn'|0|Vm'|0|Vm"           , ""],
    ["vtbl.x8"          , "Dd, Dn, Dn2=Dn+1, Dm"                        , "T32", "1111|11111|Vd'|11|Vn|Vd|10|01|Vn'|0|Vm'|0|Vm"           , ""],
    ["vtbl.x8"          , "Dd, Dn, Dn2=Dn+1, Dm"                        , "A32", "1111|00111|Vd'|11|Vn|Vd|10|01|Vn'|0|Vm'|0|Vm"           , ""],
    ["vtbl.x8"          , "Dd, Dn, Dn2=Dn+1, Dn3=Dn+2, Dm"              , "T32", "1111|11111|Vd'|11|Vn|Vd|10|10|Vn'|0|Vm'|0|Vm"           , ""],
    ["vtbl.x8"          , "Dd, Dn, Dn2=Dn+1, Dn3=Dn+2, Dm"              , "A32", "1111|00111|Vd'|11|Vn|Vd|10|10|Vn'|0|Vm'|0|Vm"           , ""],
    ["vtbl.x8"          , "Dd, Dn, Dn2=Dn+1, Dn3=Dn+2, Dn4=Dn+3, Dm"    , "T32", "1111|11111|Vd'|11|Vn|Vd|10|11|Vn'|0|Vm'|0|Vm"           , ""],
    ["vtbl.x8"          , "Dd, Dn, Dn2=Dn+1, Dn3=Dn+2, Dn4=Dn+3, Dm"    , "A32", "1111|00111|Vd'|11|Vn|Vd|10|11|Vn'|0|Vm'|0|Vm"           , ""],

    ["vtbx.x8"          , "Dd, Dn, Dm"                                  , "T32", "1111|11111|Vd'|11|Vn|Vd|10|00|Vn'|1|Vm'|0|Vm"           , ""],
    ["vtbx.x8"          , "Dd, Dn, Dm"                                  , "A32", "1111|00111|Vd'|11|Vn|Vd|10|00|Vn'|1|Vm'|0|Vm"           , ""],
    ["vtbx.x8"          , "Dd, Dn, Dn2=Dn+1, Dm"                        , "T32", "1111|11111|Vd'|11|Vn|Vd|10|01|Vn'|1|Vm'|0|Vm"           , ""],
    ["vtbx.x8"          , "Dd, Dn, Dn2=Dn+1, Dm"                        , "A32", "1111|00111|Vd'|11|Vn|Vd|10|01|Vn'|1|Vm'|0|Vm"           , ""],
    ["vtbx.x8"          , "Dd, Dn, Dn2=Dn+1, Dn3=Dn+2, Dm"              , "T32", "1111|11111|Vd'|11|Vn|Vd|10|10|Vn'|1|Vm'|0|Vm"           , ""],
    ["vtbx.x8"          , "Dd, Dn, Dn2=Dn+1, Dn3=Dn+2, Dm"              , "A32", "1111|00111|Vd'|11|Vn|Vd|10|10|Vn'|1|Vm'|0|Vm"           , ""],
    ["vtbx.x8"          , "Dd, Dn, Dn2=Dn+1, Dn3=Dn+2, Dn4=Dn+3, Dm"    , "T32", "1111|11111|Vd'|11|Vn|Vd|10|11|Vn'|1|Vm'|0|Vm"           , ""],
    ["vtbx.x8"          , "Dd, Dn, Dn2=Dn+1, Dn3=Dn+2, Dn4=Dn+3, Dm"    , "A32", "1111|00111|Vd'|11|Vn|Vd|10|11|Vn'|1|Vm'|0|Vm"           , ""],

    ["vtrn.x8-32"       , "Dx, Dx2"                                     , "T32", "1111|11111|Vx'|11|Sz|10|Vx|0000|1|0|Vx2'|0|Vx2"         , ""],
    ["vtrn.x8-32"       , "Dx, Dx2"                                     , "A32", "1111|00111|Vx'|11|Sz|10|Vx|0000|1|0|Vx2'|0|Vx2"         , ""],
    ["vtrn.x8-32"       , "Vx, Vx2"                                     , "T32", "1111|11111|Vx'|11|Sz|10|Vx|0000|1|1|Vx2'|0|Vx2"         , ""],
    ["vtrn.x8-32"       , "Vx, Vx2"                                     , "A32", "1111|00111|Vx'|11|Sz|10|Vx|0000|1|1|Vx2'|0|Vx2"         , ""],

    ["vtst.x8-32"       , "Dd, Dn, Dm"                                  , "T32", "1110|11110|Vd'|Sz|Vn|Vd|1000|Vn'|0|Vm'|1|Vm"            , ""],
    ["vtst.x8-32"       , "Dd, Dn, Dm"                                  , "A32", "1111|00100|Vd'|Sz|Vn|Vd|1000|Vn'|0|Vm'|1|Vm"            , ""],
    ["vtst.x8-32"       , "Vd, Vn, Vm"                                  , "T32", "1110|11110|Vd'|Sz|Vn|Vd|1000|Vn'|1|Vm'|1|Vm"            , ""],
    ["vtst.x8-32"       , "Vd, Vn, Vm"                                  , "A32", "1111|00100|Vd'|Sz|Vn|Vd|1000|Vn'|1|Vm'|1|Vm"            , ""],

    ["vuzp.x8-16"       , "Dx, Dx2"                                     , "T32", "1111|11111|Vx'|11|Sz|10|Vx|0001|0|0|Vx2'|0|Vx2"         , ""],
    ["vuzp.x8-16"       , "Dx, Dx2"                                     , "A32", "1111|00111|Vx'|11|Sz|10|Vx|0001|0|0|Vx2'|0|Vx2"         , ""],
    ["vuzp.x32"         , "Dx, Dx2"                                     , "T32", "1111|11111|Vx'|11|Sz|10|Vx|0000|1|0|Vx2'|0|Vx2"         , "AliasOf=vtrn"],
    ["vuzp.x32"         , "Dx, Dx2"                                     , "A32", "1111|00111|Vx'|11|Sz|10|Vx|0000|1|0|Vx2'|0|Vx2"         , "AliasOf=vtrn"],
    ["vuzp.x8-32"       , "Vx, Vx2"                                     , "T32", "1111|11111|Vx'|11|Sz|10|Vx|0001|0|1|Vx2'|0|Vx2"         , ""],
    ["vuzp.x8-32"       , "Vx, Vx2"                                     , "A32", "1111|00111|Vx'|11|Sz|10|Vx|0001|0|1|Vx2'|0|Vx2"         , ""],

    ["vzip.x8-16"       , "Dx, Dx2"                                     , "T32", "1111|11111|Vx'|11|Sz|10|Vx|0001|1|0|Vx2'|0|Vx2"         , ""],
    ["vzip.x8-16"       , "Dx, Dx2"                                     , "A32", "1111|00111|Vx'|11|Sz|10|Vx|0001|1|0|Vx2'|0|Vx2"         , ""],
    ["vzip.x32"         , "Dx, Dx2"                                     , "T32", "1111|11111|Vx'|11|Sz|10|Vx|0000|1|0|Vx2'|0|Vx2"         , "AliasOf=vtrn"],
    ["vzip.x32"         , "Dx, Dx2"                                     , "A32", "1111|00111|Vx'|11|Sz|10|Vx|0000|1|0|Vx2'|0|Vx2"         , "AliasOf=vtrn"],
    ["vzip.x8-32"       , "Vx, Vx2"                                     , "T32", "1111|11111|Vx'|11|Sz|10|Vx|0001|1|1|Vx2'|0|Vx2"         , ""],
    ["vzip.x8-32"       , "Vx, Vx2"                                     , "A32", "1111|00111|Vx'|11|Sz|10|Vx|0001|1|1|Vx2'|0|Vx2"         , ""]
  ]
}
// ${JSON:END}
;

}).apply(this, typeof module === "object" && module && module.exports
  ? [module, "exports"] : [this.asmdb || (this.asmdb = {}), "armdata"]);