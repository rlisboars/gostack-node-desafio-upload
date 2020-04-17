import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const currentBalance = await transactionRepository.getBalance();

      if (currentBalance.total - value < 0) {
        throw new AppError('Balance cannot be negative', 400);
      }
    }

    let categoryId;
    const registeredCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    let newCategory;
    if (!registeredCategory) {
      newCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(newCategory);
      categoryId = newCategory.id;
    } else categoryId = registeredCategory.id;

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: categoryId,
    });

    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
