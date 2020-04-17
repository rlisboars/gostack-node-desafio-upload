import path from 'path';
import fs from 'fs';

import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';

class ImportTransactionsService {
  public async execute(filename: string): Promise<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, filename);
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
    const fileRows = fileContent.split('\n');
    const importedTransactions: Transaction[] = [];
    fileRows.shift();
    for (let i = 0; i < fileRows.length; i++) {
      const fileLine = fileRows[i];
      const lineData = fileLine
        .split(',')
        .map(dt => dt.replace(/\s+/g, ' ').trim());
      if (lineData.length === 4) {
        const createTransaction = new CreateTransactionService();
        // eslint-disable-next-line no-await-in-loop
        const transaction = await createTransaction.execute({
          title: lineData[0],
          type: lineData[1] as 'income' | 'outcome',
          value: parseFloat(lineData[2]),
          category: lineData[3],
        });
        importedTransactions.push(transaction);
      }
    }
    return importedTransactions;
  }
}

export default ImportTransactionsService;
