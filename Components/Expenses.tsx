import React, { useState, useRef, useEffect, createContext } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, DrawerLayoutAndroid, TextInput, Modal, Button, RefreshControl,ToastAndroid, Platform } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import ExpensesList from './ExpensesList';
import Drawer from './Drawer';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import Database from '../Database';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface DataItem {
  idExp:any;
  idCurr:any;
  category:any;
  amount: string;
  dateExpense: string;
  pdfFile: string;
}
interface DataItemExtreme {
  idExp:any;
  idCurr:any;
  category:any;
  amount: string;
  dateExpense: string;
  pdfFile: string;
  categoryName: string;
  categoryImage: string;
  mainCurrency: string;
  otherCurrencies: string;
}
interface DataItemCategory {
  idCat : any; 
  categoryName: string;
  categoryImage: string;
}
interface DataItemCategory2 {
  key : any; 
  value: string;
  selected?: boolean;
}

interface DataItemCurrency {
  id : any; 
  mainCurrency: string;
  otherCurrencies: string;
}

const Expenses = () => {
  const [expensesData, setExpensesData] = useState<DataItemExtreme[]>([]);
  const [CategoryData, setCategoryData] = useState<DataItemCategory[]>([]);
  const [CategoryData2, setCategoryData2] = useState<DataItemCategory2[]>([]);
  const [CurrencyData, setCurrencyData] = useState<DataItemCurrency[]>([])
  const [selectedIdCategory, setSelectedIdCategory] = useState<number | undefined>();
  const [selectedIdCurrency, setSelectedIdCurrency] = useState<number | undefined>();
  
  const [pathPdf,setPathPdf]=useState<string>('')
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [newExpense, setNewExpense] = useState<DataItem | null>(null);
  const [newAmount, setNewAmount] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const drawer = useRef<DrawerLayoutAndroid>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  let MyPath:any[]=[]
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      displayExpensesTable();
    }, 1000);
  }, []);

  const db = Database();
  useEffect(() => {
    db.transaction(() => {
      console.log('Database opened');
    });
    displayExpensesTable();

  }, []);

  useEffect(() => {
    displayWelcomeTable();
    fillCategoriesSelectList();
  }, []);

  useEffect(() => {
    // dropExpensesTable();
    //console.log('table expenses deleted successfully');
    db.transaction((txn) => {
      txn.executeSql(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='expenses';`,
        [],
        (sqlTxn, res) => {
          if (res.rows.length === 0) {
            txn.executeSql(
              `CREATE TABLE expenses (
                idExp INTEGER PRIMARY KEY AUTOINCREMENT,
                amount VARCHAR(15) NOT NULL,
                dateExpense DATETIME ,
                pdfFile BLOB,
                idCurr,  
                category,
                FOREIGN KEY (idCurr) REFERENCES welcome(id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (category) REFERENCES categories(idCat) ON DELETE CASCADE ON UPDATE CASCADE
              );`,
              [],
              (createTableTxn, createTableRes) => {
                console.log('Table expenses created successfully');
              },
              (createTableError) => {
                console.log('Error creating table expenses:', createTableError);
              }
            );
          } else {
            console.log('Table expenses already exists');
          }
        },
        (error) => {
          console.log('Error checking if table expenses exists:', error);
        }
      );
    });
  }, []);

  const displayExpensesTable= async () => {
    try {
      await db.transaction(async (txn) => {
        const selectQuery = 'SELECT idExp,idCurr,category,categoryName,amount,dateExpense,pdfFile,categoryImage,mainCurrency,otherCurrencies FROM expenses e, categories c, welcome w WHERE e.category = c.idCat AND e.idCurr = w.id;';      
        txn.executeSql(selectQuery, [], (tx, res) => {
          const rows = res.rows;
          const newExpensesData: DataItemExtreme[] = [];
          for (let i = 0; i < rows.length; i++) {
            const expense = rows.item(i);
            //console.log('Expenses Data - idExp:', expense.idExp, 'idCurr:', expense.idCurr, 'idCat:', expense.category, 'Amount:', expense.amount, 'dateExpense:', expense.dateExpense, 'pdf file:', expense.pdfFile,'name: ',expense.categoryName, 'mainCurrency:', expense.mainCurrency,'otherCurrencies:', expense.otherCurrencies);
            setSelectedIdCurrency(expense.idCurr);
            newExpensesData.push({
                idExp: expense.idExp,
                amount: expense.amount,
                dateExpense: expense.dateExpense,
                pdfFile: expense.pdfFile,
                idCurr: expense.idCurr,
                category: expense.category,
                categoryImage: expense.categoryImage ,
                categoryName:expense.categoryName ,
                mainCurrency: expense.mainCurrency ,
                otherCurrencies: expense.otherCurrencies ,
            });
          }
          setExpensesData(newExpensesData);
        });
      });
    } catch (error) {
      console.error('Error displaying expenses table: ', error);
    }
  };
  
  // const dropExpensesTable = async () => {
  //   try {
  //     await db.transaction(async (txn) => {


  //       txn.executeSql(
  //         `DROP TABLE IF EXISTS expenses;`,
  //         [],
  //         (tx, res) => {
  //           console.log('Table expenses dropped successfully');
  //         },
  //         (error) => {
  //           console.log('Error dropping table expenses ' + error);
  //         }
  //       );
  //     });
  //   } catch (error) {
  //     console.error('Error dropping table expenses: ', error);
  //   }
  // };

  const showToastWithGravity = (text:string) => {
    ToastAndroid.showWithGravity(
      text,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
     
    );
  };
  const toggleDrawer = () => {
    if (drawer.current) {
      if (isDrawerOpen) {
        drawer.current.closeDrawer();
      } else {
        drawer.current.openDrawer();
      }
    }
  };

  const handleDrawerStateChange = (newState: 'Idle' | 'Dragging' | 'Settling') => {
    setIsDrawerOpen(newState !== 'Idle');
  };

  const closeDrawer = () => {
    if (drawer.current) {
      drawer.current.closeDrawer();
    }
  };

  const handleSaveNewExpense = async () => {
    try {
      if (!newAmount || !selectedIdCategory || !pathPdf) {
        showToastWithGravity('Data required.');
        return;
      }
      await db.transaction(async (txn) => {
        const formattedDate = `${formatDate(selectedDate)} ${formatTime(selectedTime)}`;
        const insertQuery = 'INSERT INTO expenses (amount, dateExpense, pdfFile, idCurr, category) VALUES (?, ?, ?, ?, ?);';
        const values = [newAmount, formattedDate, pathPdf, selectedIdCurrency, selectedIdCategory];
        txn.executeSql(insertQuery, values, async (tx, res) => {
          console.log('SQL Execution Result:', res);
          if (res.rowsAffected > 0) {
            try {
              await displayCategoriesTable(selectedIdCategory);
              const newExpense: DataItemExtreme = {
                idExp: res.insertId,
                amount: newAmount,
                dateExpense: formattedDate,
                pdfFile: pathPdf,
                idCurr: selectedIdCurrency,
                category: selectedIdCategory,
                categoryImage: CategoryData.length > 0 ? CategoryData[0].categoryImage : '',
                categoryName: CategoryData.length > 0 ? CategoryData[0].categoryName : '',
                mainCurrency: CurrencyData.length > 0 ? CurrencyData[0].mainCurrency : '',
                otherCurrencies: CurrencyData.length > 0 ? CurrencyData[0].otherCurrencies : '',
              };
              setNewAmount('');
              setAddModalVisible(false);
              showToastWithGravity('Expense Added Successfully!');
              displayExpensesTable();
            } catch (error) {
              console.error('Error fetching category data: ', error);
              showToastWithGravity('Failed to add expense');
            }
          } else {
            showToastWithGravity('Failed to add expense');
          }
        });
      });
    } catch (error) {
      console.error('Error inserting expense: ', error);
      showToastWithGravity('Failed to add expense');
    }
  };
  
  
  const displayCategoriesTable = async (id: any): Promise<void> => {
    try {
      return new Promise<void>((resolve, reject) => {
        db.transaction((txn) => {
          const selectQuery = 'SELECT categoryName, categoryImage FROM categories WHERE idCat=?;';
          txn.executeSql(selectQuery, [id], (_tx, res) => {
            const rows = res.rows;
            if (rows.length > 0) {
              const categorydata = rows.item(0);
              CategoryData.push({
                idCat: id,
                categoryName: categorydata.categoryName,
                categoryImage: categorydata.categoryImage,
              });
              resolve();
            } else {
              reject(new Error('No data found.'));
            }
          });
        });
      });
    } catch (error) {
      console.error('Error displaying categories table: ', error);
      throw error;
    }
  };
  
  const fillCategoriesSelectList = async () => {
    try {
      await db.transaction(async (txn) => {
        const selectQuery = 'SELECT idCat,categoryName FROM categories;';
        txn.executeSql(selectQuery, [], (tx, res) => {
          const rows = res.rows;
          for (let i = 0; i < rows.length; i++) {
            const categorydata = rows.item(i);
            CategoryData2.push({
              key: categorydata.idCat,
              value: categorydata.categoryName,
            });
          }
        });
      });
    } catch (error) {
      console.error('Error displaying categories table: ', error);
    }          
  };

  const displayWelcomeTable = async () => {
    try {
      await db.transaction(async (txn) => {
        const selectQuery = 'SELECT id,mainCurrency,otherCurrencies FROM welcome where id=?;';
        txn.executeSql(selectQuery, [1], (tx, res) => {
          const rows = res.rows;
          const currencies: DataItemCurrency[] = [];
          for (let i = 0; i < rows.length; i++) {
            const currencydata = rows.item(i);
            currencies.push({
              id: currencydata.id,
              mainCurrency: currencydata.mainCurrency,
              otherCurrencies: currencydata.otherCurrencies,
            });
          }
  
          setCurrencyData(currencies);
          if (currencies.length > 0) {
            setSelectedIdCurrency(currencies[0].id);
          }
        });
      });
    } catch (error) {
      console.error('Error displaying welcome table: ', error);
    }
  };
  

  const AddPDF = async () => {
    try {
      const docs = await DocumentPicker.pick({
        type: DocumentPicker.types.pdf,
        copyTo: 'cachesDirectory',
      });
      if (docs?.length) {
        const uri = docs[0]?.fileCopyUri || '';
        MyPath.push(uri);
        let ind=MyPath.indexOf(uri);
        setPathPdf(uri);
        showToastWithGravity('PDF picked succesfully');
      }
    } catch (e) {
      console.log(e);
    }
  };
  const showTimePickerHandler = () => {
    setShowTimePicker(true);
  };

  const showDatePickerVisible = () => {
    setIsDatePickerVisible(true);
  };

  const handleDateChange = (_event: any, newDate: any) => {
    setIsDatePickerVisible(Platform.OS === 'ios');
    if (newDate) {
      setSelectedDate(newDate);
    }
  };
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
  
  
  const handleTimeChange = (_event: any, selectedDate: any) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };
  const handleCancelAdd = () => {
    setAddModalVisible(false);
    setNewExpense(null);
    setNewAmount('');
  };
  return (
    <SafeAreaView style={styles.background}>
      <DrawerLayoutAndroid
        ref={drawer}
        drawerWidth={300}
        drawerPosition="left"
        onDrawerStateChanged={handleDrawerStateChange}
        renderNavigationView={() => <Drawer closeDrawer={closeDrawer} />}>
        <View style={{ backgroundColor: '#BD1839', justifyContent: 'center', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, height: '11%', alignItems: 'center' }}>
          <SafeAreaView style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', height: '60%', width: '95%', marginBottom: '2%', marginLeft: '5%' }}>
            <TouchableOpacity onPress={toggleDrawer}>
              <Image source={require('../assets/humbergerMenu.png')} style={styles.icons} />
            </TouchableOpacity>
            <Image source={require('../assets/ShareMoneyDollar.png')} style={styles.ShareMoneyDollar} />
            <Text style={{ fontWeight: 'bold', fontSize: 25, color: 'black', marginRight: '50%',  }}>Expenses</Text>
          </SafeAreaView>
        </View>
        <View style={styles.container}>
          <View style={{ width: '100%', height: '75%' }}>
            <ScrollView horizontal={false} showsVerticalScrollIndicator={true} refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <ExpensesList expensesData={expensesData} CategoryData={CategoryData2}  showButtons={true} selectedCurrency={selectedIdCurrency}/>
            </ScrollView>
          </View>
          <View style={{ width: '95%', alignItems: 'center', flexDirection: 'row', marginTop: '7%', justifyContent: 'center', }}>
            <TouchableOpacity style={styles.button} onPress={() => setAddModalVisible(true)}>
              <Text style={styles.buttonText}>Add</Text>
              <Image source={require('../assets/folder.png')} style={styles.iconFolder} />
            </TouchableOpacity>
          </View>
        </View>
        {/**Modal Add */}
        <Modal visible={addModalVisible} transparent animationType="slide">
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={{ color: 'black', fontWeight: 'bold', marginBottom: '20%', fontSize: 20, textAlign: 'center' }}>Add expense</Text>
                  <TextInput
                    placeholder="Amount"
                    value={newAmount}
                    onChangeText={(text: any) => setNewAmount(text)}
                    keyboardType="numeric"
                    style={{
                      color:'white',
                      paddingLeft: 15,
                      backgroundColor: '#2196F5',
                      borderRadius: 2,
                      marginBottom: '7%',
                      elevation: 5,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 3,
                      height:44,
                    }}
                  />
                  <View style={{marginBottom:20}} >
                    <Button title={formatDate(selectedDate)} onPress={showDatePickerVisible} />

                    {isDatePickerVisible && (
                      <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}/>)}

                  </View>

                  <View style={{marginBottom:20}}>
                    <Button title={formatTime(selectedTime)} onPress={()=>showTimePickerHandler()} />

                    {showTimePicker && (
                      <DateTimePicker
                        value={selectedTime}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={handleTimeChange}
                      />)}
                  </View>

                  <SelectList
                    data={CategoryData2}
                    save="key" 
                    placeholder='Category'
                    setSelected={(key: any) => setSelectedIdCategory(key)}
                    boxStyles={{
                      borderRadius: 2,
                      borderColor: '#2196F5',
                      borderStyle: 'solid',
                      backgroundColor: '#2196F5',
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                      height: 44,
                    }}
                    inputStyles={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}
                    dropdownTextStyles={{ color: 'black', fontWeight: 'bold' }}
                    badgeTextStyles={{ color: 'white', fontSize: 14 }}
                    badgeStyles={{ backgroundColor: '#2196F5' }}
                    labelStyles={{ color: 'white', fontWeight: 'bold', fontSize: 15, marginLeft: 2, borderRadius: 5 }}
                    dropdownItemStyles={{
                      backgroundColor: '#2196F5',
                      marginHorizontal: 6
                    }}
                    dropdownStyles={{
                      backgroundColor: '#2196F5',
                      borderRadius: 8,
                      borderColor: '#2196F5',
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.25,
                      shadowRadius: 8,
                      elevation: 5
                    }}
                  />

            <TouchableOpacity style={styles.buttonImport} onPress={AddPDF}>
              <Text style={styles.buttonImportText} >Pick PDF</Text>
              </TouchableOpacity>
                  <View style={{ flexDirection: 'row', width: '100%', height: '20%', alignItems: 'center', justifyContent: 'space-around' }}>
                    <TouchableOpacity onPress={handleSaveNewExpense} style={styles.SaveCancel}>
                      <Text style={styles.SaveCancelText} >Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCancelAdd} style={styles.SaveCancel}>
                      <Text style={styles.SaveCancelText} >Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
      </DrawerLayoutAndroid>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  buttonImport: {
    width: '100%',
    height: 44,
    marginTop: '7%',
    backgroundColor: '#2196F5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  container: {
    flexDirection: 'column',
    marginTop: '9%',
    width: '100%',
    height: '75%',
    alignContent: 'center',
  },
  SaveCancel: {
    alignContent:'center',
    alignItems:'center',
    width: '40%',
    height: 44,
    backgroundColor: '#2196F5',
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    }, 
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  SaveCancelText: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#FFFFFF', 
    textAlign: 'center',
    paddingTop:6,
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    padding: 20,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 23,
    color: '#FFFFFF',
    paddingTop: 12,
    fontFamily: 'Verdana',
    marginLeft: '5%'
  },
  buttonImportText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#FFFFFF', 
    paddingTop: 10,
    fontFamily: 'Verdana',
    textAlign: 'center',
  },
  icons: {
    width: 35,
    height: 35,
  },
  iconFolder: {
    width: 25,
    height: 25,
    marginLeft: '10%',
    marginTop: '8%'
  },
  ShareMoneyDollar: {
    width: 30,
    height: 30,
    marginLeft: '17%',
    marginRight: '4%',
  },
  background: {
    height: hp('100%'),
    backgroundColor: 'transparent',
  },
  button: {
    marginLeft:'5%',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '45%',
    height: 55,
    marginTop: '15%',
    backgroundColor: '#BD1839',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

});

export default Expenses;
