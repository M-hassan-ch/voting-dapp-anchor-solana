import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Votingdapp } from '../target/types/votingdapp'
// import IDL from '../target/idl/votingdapp.json'
import { BankrunProvider, startAnchor } from 'anchor-bankrun'

const IDL = require('../target/idl/votingdapp.json');

describe('votingdapp', () => {
  const votingdappPublicKey = new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
  const pollId = 1;


  it("Initialize poll", async () => {
    const context = await startAnchor('', [{ name: 'votingdapp', programId: votingdappPublicKey }], []);
    const provider = new BankrunProvider(context);
    const votingProgram = new Program<Votingdapp>(IDL, provider);

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), new anchor.BN(pollId).toArrayLike(Buffer, "le", 8)],
      votingdappPublicKey
    );

    await votingProgram.methods.initializePoll(
      new anchor.BN(pollId),
      "What is your favourite type of peanut butter",
      new anchor.BN(1),
      new anchor.BN(1),
    ).rpc();

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    expect(poll.pollId.toNumber()).toEqual(pollId);
    expect(poll.description).toEqual("What is your favourite type of peanut butter");

  });
})
