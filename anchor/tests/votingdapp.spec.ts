import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Votingdapp } from "../target/types/votingdapp";
// import IDL from '../target/idl/votingdapp.json'
import { BankrunProvider, startAnchor } from "anchor-bankrun";

const IDL = require("../target/idl/votingdapp.json");

describe("votingdapp", () => {
  const votingdappPublicKey = new PublicKey(
    "coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF"
  );
  const pollId = 1;

  let provider: BankrunProvider;
  let context: any;
  let votingProgram: anchor.Program<Votingdapp>;

  beforeEach(async () => {
    context = await startAnchor(
      "",
      [{ name: "votingdapp", programId: votingdappPublicKey }],
      []
    );
    provider = new BankrunProvider(context);
    votingProgram = new Program<Votingdapp>(IDL, provider);
  });

  it("Initialize poll", async () => {
    const [pollAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), new anchor.BN(pollId).toArrayLike(Buffer, "le", 8)],
      votingdappPublicKey
    );

    await votingProgram.methods
      .initializePoll(
        new anchor.BN(pollId),
        "What is your favourite type of peanut butter",
        new anchor.BN(1),
        new anchor.BN(1)
      )
      .rpc();

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    expect(poll.pollId.toNumber()).toEqual(pollId);
    expect(poll.description).toEqual(
      "What is your favourite type of peanut butter"
    );
  });

  it("Initialize candidate", async () => {
    const [crunchyCandidateAddress] = PublicKey.findProgramAddressSync(
      [
        new anchor.BN(pollId).toArrayLike(Buffer, "le", 8),
        Buffer.from("crunchy"),
      ],
      votingdappPublicKey
    );
    const [smoothCandidateAddress] = PublicKey.findProgramAddressSync(
      [
        new anchor.BN(pollId).toArrayLike(Buffer, "le", 8),
        Buffer.from("smooth"),
      ],
      votingdappPublicKey
    );
    const [pollAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), new anchor.BN(pollId).toArrayLike(Buffer, "le", 8)],
      votingdappPublicKey
    );

    await votingProgram.methods
      .initializePoll(
        new anchor.BN(pollId),
        "What is your favourite type of peanut butter",
        new anchor.BN(1),
        new anchor.BN(1)
      )
      .rpc();

    await votingProgram.methods
      .initializeCandidate(new anchor.BN(pollId), "crunchy")
      .rpc();

    const candidate = await votingProgram.account.candidate.fetch(
      crunchyCandidateAddress
    );
    const poll = await votingProgram.account.poll.fetch(pollAddress);

    expect(candidate.candidateName).toEqual("crunchy");
    expect(candidate.candidateVotes.toNumber()).toEqual(0);
    expect(poll.candidateParticipated.toNumber()).toEqual(1);
  });
});
