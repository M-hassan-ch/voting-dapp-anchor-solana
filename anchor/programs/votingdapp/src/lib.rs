#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod votingdapp {
    use super::*;

    pub fn initialize_poll(
        ctx: Context<InitializePoll>,
        poll_id: u64,
        description: String,
        poll_start_ts: u64,
        poll_end_ts: u64,
    ) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        poll.poll_id = poll_id;
        poll.description = description;
        poll.poll_start_ts = poll_start_ts;
        poll.poll_end_ts = poll_end_ts;
        poll.candidate_participated = 0;
        Ok(())
    }

    pub fn initialize_candidate(
        ctx: Context<InitializeCandidate>,
        _poll_id: u64,
        candidate_name: String,
    ) -> Result<()> {
        let poll: &mut Account<'_, Poll> = &mut ctx.accounts.poll;
        let candidate = &mut ctx.accounts.candidate;
        candidate.candidate_name = candidate_name;
        poll.candidate_participated += 1;
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, _poll_id: u64, _candidate_name: String) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;
        candidate.candidate_votes += 1;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
      init,
      space = 8 + Poll::INIT_SPACE,
      payer = signer,
      seeds = [b"poll".as_ref(), poll_id.to_le_bytes().as_ref()],
      bump
    )]
    pub poll: Account<'info, Poll>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_name: String)]
pub struct InitializeCandidate<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
      mut,
      seeds = [b"poll".as_ref(), poll_id.to_le_bytes().as_ref()],
      bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        init,
        space = 8 + Poll::INIT_SPACE,
        payer = signer,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
        bump
      )]
    pub candidate: Account<'info, Candidate>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_name: String)]
pub struct Vote<'info> {
    pub signer: Signer<'info>,

    #[account(
        seeds = [b"poll".as_ref(), poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
        bump
    )]
    pub candidate: Account<'info, Candidate>,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    #[max_len(40)]
    candidate_name: String,
    candidate_votes: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    poll_id: u64,
    #[max_len(280)]
    description: String,
    poll_start_ts: u64,
    poll_end_ts: u64,
    candidate_participated: u64,
}
