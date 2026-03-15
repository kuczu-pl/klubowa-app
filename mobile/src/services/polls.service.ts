// ═══════════════════════════════════════════════════════════════════
// POLLS SERVICE — extracted from App.jsx lines 1134-1180
// ═══════════════════════════════════════════════════════════════════

import firestore from '@react-native-firebase/firestore';
import type { Poll, PollOption } from '../types';

export async function createPoll(
  data: {
    title: string;
    description?: string;
    options: string; // newline-separated
    multiSelect: boolean;
    deadline?: string;
  },
  authorId: string
): Promise<{ id: string; item: Poll } | { error: string }> {
  const opts: PollOption[] = data.options
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text, i) => ({ id: String(i), text, voters: [] }));

  if (opts.length < 2) return { error: 'Podaj co najmniej 2 opcje!' };

  const item: Omit<Poll, 'id'> = {
    title: data.title,
    description: data.description || '',
    options: opts,
    multiSelect: data.multiSelect,
    deadline: data.deadline || null,
    authorId,
    date: new Date().toISOString().split('T')[0],
    closed: false,
    totalVoters: [],
  };
  const ref = await firestore().collection('polls').add(item);
  return { id: ref.id, item: { id: ref.id, ...item } };
}

export async function votePoll(
  pollId: string,
  optionId: string,
  userId: string,
  isMultiSelect: boolean
): Promise<Poll> {
  const pollRef = firestore().collection('polls').doc(pollId);

  await firestore().runTransaction(async (tx) => {
    const snap = await tx.get(pollRef);
    if (!snap.exists) return;
    const d = snap.data()!;
    let opts = d.options.map((o: PollOption) => ({ ...o, voters: [...o.voters] }));
    let totalVoters = [...(d.totalVoters || [])];

    const alreadyVotedThis = opts.find((o: PollOption) => o.id === optionId)?.voters.includes(userId);

    if (!isMultiSelect) {
      opts = opts.map((o: PollOption) => ({ ...o, voters: o.voters.filter((v: string) => v !== userId) }));
      totalVoters = totalVoters.filter((v: string) => v !== userId);
    }

    const opt = opts.find((o: PollOption) => o.id === optionId);
    if (alreadyVotedThis) {
      opt.voters = opt.voters.filter((v: string) => v !== userId);
      if (!opts.some((o: PollOption) => o.voters.includes(userId))) {
        totalVoters = totalVoters.filter((v: string) => v !== userId);
      }
    } else {
      opt.voters.push(userId);
      if (!totalVoters.includes(userId)) totalVoters.push(userId);
    }

    tx.update(pollRef, { options: opts, totalVoters });
  });

  const updated = await pollRef.get();
  return { id: pollId, ...updated.data() } as Poll;
}

export async function closePoll(id: string): Promise<void> {
  await firestore().collection('polls').doc(id).update({ closed: true });
}

export async function deletePoll(id: string): Promise<void> {
  await firestore().collection('polls').doc(id).delete();
}
