import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface FormattedTransaction {
  id: string;
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getAllTransactionsFormatted(): Promise<FormattedTransaction[]> {
    const transactions = await this.find({
      relations: ['category'],
    });

    const formattedTransactions: FormattedTransaction[] = transactions.map(
      transaction => {
        return {
          id: transaction.id,
          title: transaction.title,
          value: transaction.value,
          type: transaction.type,
          category: transaction.category.title,
        };
      },
    );

    return formattedTransactions;
  }

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    if (transactions) {
      const totalIncome = this.getTotalOfType('income', transactions);
      const totalOutcome = this.getTotalOfType('outcome', transactions);
      return {
        income: totalIncome,
        outcome: totalOutcome,
        total: totalIncome - totalOutcome,
      };
    }
    return { income: 0, outcome: 0, total: 0 };
  }

  private getTotalOfType(
    type: 'income' | 'outcome',
    transactions: Transaction[],
  ): number {
    let totalOfType = 0;
    totalOfType = transactions.reduce((acc, cur): number => {
      if (cur.type === type) return +acc + +cur.value;
      return acc;
    }, 0);
    return totalOfType;
  }
}

export default TransactionsRepository;
