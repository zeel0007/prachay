import { Counter } from '../models/Counter.js';

export const getNextVoucherNumber = async () => {
  const year = new Date().getFullYear();
  const counterId = `voucher_${year}`;

  const counter = await Counter.findOneAndUpdate(
    { id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const sequence = String(counter.seq).padStart(4, '0');
  return `VOUCH-${year}-${sequence}`;
};
