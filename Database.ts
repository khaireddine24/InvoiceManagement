import SQLite from 'react-native-sqlite-storage';

const Database = () => {
  const db = SQLite.openDatabase(
    {
      name: 'ExpensesAndIncomesDB',
      location: 'default',
    },
    () =>
      (error: any) => console.error('Error opening database', error)
  );

  return db;
};

export default Database;