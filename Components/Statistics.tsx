import React, { useState ,useRef, useEffect} from 'react';
import {Image,StyleSheet,Text,View,TouchableOpacity,SafeAreaView,ScrollView,DrawerLayoutAndroid} from 'react-native';
import ExpensesList from './ExpensesList';
import IncomesList from './IncomesList';
import BasicChart from './BasicChart';
import Drawer from './Drawer';
import RNPrint from 'react-native-print';
import Database from '../Database';

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

interface DataItemExtremeInc {
  idInc:any;
  idCurr:any;
  category:any;
  amount: string;
  dateIncome: string;
  pdfFile: string;
  categoryName: string;
  categoryImage: string;
  mainCurrency: string;
  otherCurrencies: string;
}

interface DataItemCategory2 {
  key : string; 
  value: string;
  cselected?: boolean;
}
interface StatItem{
  name: string;
  pourcentage: number;
}
const Statistics=() =>{
  const [isExpensesActive, setIsExpensesActive] = useState<boolean>(true);
  const [isIncomesActive, setIsIncomesActive] = useState<boolean>(false);    
  const [isYearlyActive, setIsYearlyActive] = useState<boolean>(true);
  const [isMonthlyActive, setIsMonthlyActive] =  useState<boolean>(false)
  const [incomesData, setIncomesData] = useState<DataItemExtremeInc[]>([]);
  const [expensesData, setExpensesData] = useState<DataItemExtreme[]>([]);
  const [categoryData, setCategoryData] = useState<DataItemCategory2[]>([]);

  const [StatExpensesData, setStatExpensesData] = useState<StatItem[]>([]);
  const [StatIncomesData, setStatIncomesData] = useState<StatItem[]>([]);

  const db = Database();

  useEffect(() => {
    db.transaction(() => {
      console.log('Database opened');
    });
    displayExpensesTable();
    displayIncomesTable();
  }, []);

  useEffect(() => {
    fillCategoriesSelectList();
  }, []);

  useEffect(() => {
    if (isYearlyActive) {
      setStatExpensesData(generateStatExpensesDataYearly(expensesData));
    } else if (isMonthlyActive) {
      setStatExpensesData(generateStatExpensesDataMonthly(expensesData));
    }
  }, [expensesData, isYearlyActive, isMonthlyActive]);
  
  useEffect(() => {
    if (isYearlyActive) {
      setStatIncomesData(generateStatIncomesDataYearly(incomesData));
    } else if (isMonthlyActive) {
      setStatIncomesData(generateStatIncomesDataMonthly(incomesData));
    }
  }, [incomesData, isYearlyActive, isMonthlyActive]);
  
 // Yearly expenses
const generateStatExpensesDataYearly = (expensesData: DataItemExtreme[]): StatItem[] => {
  const statData: { [key: string]: { totalAmount: number, count: number, categoryName: string } } = {};

  expensesData.forEach((expense) => {
    const year = new Date(expense.dateExpense).getFullYear();
    const key = `${year}_${expense.categoryName}`;

    if (!statData[key]) {
      statData[key] = { totalAmount: 0, count: 0, categoryName: expense.categoryName };
    }

    statData[key].totalAmount += parseFloat(expense.amount);
    statData[key].count++;
  });


  const totalSum = Object.values(statData).reduce((sum, category) => sum + category.totalAmount, 0);

  // Create statExpensesData with normalized percentages
  const statExpensesData: StatItem[] = Object.entries(statData).map(([key, value]) => ({
    name: value.categoryName,
    pourcentage: parseFloat((value.totalAmount / totalSum * 100).toFixed(1)) || 0,
  }));

  return statExpensesData;
};

// Monthly Expenses
const generateStatExpensesDataMonthly = (expensesData: DataItemExtreme[]): StatItem[] => {
  const statData: { [key: string]: { totalAmount: number, count: number, categoryName: string } } = {};

  expensesData.forEach((expense) => {
    const date = new Date(expense.dateExpense);
    const key = `${date.getFullYear()}_${date.getMonth() + 1}_${expense.categoryName}`;

    if (!statData[key]) {
      statData[key] = { totalAmount: 0, count: 0, categoryName: expense.categoryName };
    }

    statData[key].totalAmount += parseFloat(expense.amount);
    statData[key].count++;
  });

  const uniqueCategories = new Set<string>();

  expensesData.forEach((expense) => {
    uniqueCategories.add(expense.categoryName);
  });

  const totalSum = Array.from(uniqueCategories).reduce((sum, categoryName) => {
    const key = `${new Date().getFullYear()}_${new Date().getMonth() + 1}_${categoryName}`;
    return sum + (statData[key]?.totalAmount || 0);
  }, 0);

  const statExpensesData: StatItem[] = Array.from(uniqueCategories).map((categoryName) => {
    const key = `${new Date().getFullYear()}_${new Date().getMonth() + 1}_${categoryName}`;
    const value = statData[key];

    return {
      name: categoryName,
      pourcentage: parseFloat(((value?.totalAmount / totalSum) * 100).toFixed(1)),
    };
  });

  return statExpensesData;
};

// Yearly Incomes
const generateStatIncomesDataYearly = (incomesData: DataItemExtremeInc[]): StatItem[] => {
  const statData: { [key: string]: { totalAmount: number, count: number, categoryName: string } } = {};

  incomesData.forEach((income) => {
    const year = new Date(income.dateIncome).getFullYear();
    const key = `${year}_${income.categoryName}`;

    if (!statData[key]) {
      statData[key] = { totalAmount: 0, count: 0, categoryName: income.categoryName };
    }

    statData[key].totalAmount += parseFloat(income.amount);
    statData[key].count++;
  }); 
  const totalSum = Object.values(statData).reduce((sum, category) => sum + category.totalAmount, 0);
  const statIncomesData: StatItem[] = Object.entries(statData).map(([key, value]) => ({
    name: value.categoryName,
    pourcentage: parseFloat((value.totalAmount / totalSum * 100).toFixed(1)) || 0,
  }));

  return statIncomesData;
};

  
// Monthly Incomes
const generateStatIncomesDataMonthly = (incomesData: DataItemExtremeInc[]): StatItem[] => {
  const statData: { [key: string]: { totalAmount: number, count: number, categoryName: string } } = {};

  incomesData.forEach((income) => {
    const date = new Date(income.dateIncome);
    const key = `${date.getFullYear()}_${date.getMonth() + 1}_${income.categoryName}`;

    if (!statData[key]) {
      statData[key] = { totalAmount: 0, count: 0, categoryName: income.categoryName };
    }

    statData[key].totalAmount += parseFloat(income.amount);
    statData[key].count++;
  });

  const uniqueCategories = new Set<string>();

  incomesData.forEach((income) => {
    uniqueCategories.add(income.categoryName);
  });

  const totalSum = Array.from(uniqueCategories).reduce((sum, categoryName) => {
    const key = `${new Date().getFullYear()}_${new Date().getMonth() + 1}_${categoryName}`;
    return sum + (statData[key]?.totalAmount || 0);
  }, 0);
  const statIncomesData: StatItem[] = Array.from(uniqueCategories).map((categoryName) => {
    const key = `${new Date().getFullYear()}_${new Date().getMonth() + 1}_${categoryName}`;
    const value = statData[key];

    return {
      name: categoryName,
      pourcentage: parseFloat((value.totalAmount / totalSum * 100).toFixed(1)) || 0,
    };
  });

  return statIncomesData;
};

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

  const displayIncomesTable= async () => {
    try {
      await db.transaction(async (txn) => {
        const selectQuery = 'SELECT idInc,idCurr,category,categoryName,amount,dateIncome,pdfFile,categoryImage,mainCurrency,otherCurrencies FROM incomes e, categories c, welcome w WHERE e.category = c.idCat AND e.idCurr = w.id;';      
        txn.executeSql(selectQuery, [], (tx, res) => {
          const rows = res.rows;
          const newIncomesData: DataItemExtremeInc[] = [];
          for (let i = 0; i < rows.length; i++) {
            const income = rows.item(i);
            //console.log('Incomes Data - idInc:', income.idInc, 'idCurr:', income.idCurr, 'idCat:', income.category, 'Amount:', income.amount, 'dateIncome:', income.dateIncome, 'pdf file:', income.pdfFile,'name: ',income.categoryName, 'mainCurrency:', income.mainCurrency,'otherCurrencies:', income.otherCurrencies);
            newIncomesData.push({
                idInc: income.idInc,
                amount: income.amount,
                dateIncome: income.dateIncome,
                pdfFile: income.pdfFile,
                idCurr: income.idCurr,
                category: income.category,
                categoryImage: income.categoryImage ,
                categoryName:income.categoryName ,
                mainCurrency: income.mainCurrency ,
                otherCurrencies: income.otherCurrencies ,
            });
          }
          setIncomesData(newIncomesData);
        });
      });
    } catch (error) {
      console.error('Error displaying incomes table: ', error);
    }
  };

  const fillCategoriesSelectList = async () => {
    try {
      await db.transaction(async (txn) => {
        const selectQuery = 'SELECT idCat,categoryName FROM categories;';
        txn.executeSql(selectQuery, [], (tx, res) => {
          const rows = res.rows;
          for (let i = 0; i < rows.length; i++) {
            const categorydata2 = rows.item(i);
            categoryData.push({
              key: categorydata2.idCat,
              value: categorydata2.categoryName,
            });
          }
        });
      });
    } catch (error) {
      console.error('Error displaying categories table: ', error);
    }          
  };
  
  const printHTML = async () => {
    const expensesRows = expensesData.map((item) => `
      <tr>
        <td style="text-align:center;">${item.amount}</td>
        <td style="text-align:center;">${item.dateExpense}</td>
        <td style="text-align:center;">${item.mainCurrency}</td>
      </tr>
    `).join('');

    const incomesRows=incomesData.map((item) => `
    <tr>
      <td style="text-align:center;">${item.amount}</td>
      <td style="text-align:center;">${item.dateIncome}</td>
      <td style="text-align:center;">${item.mainCurrency}</td>
    </tr>
  `).join('');

    const StatRowsExpenses = StatExpensesData.map((item) => `
    <tr>
      <td style="text-align:center;">${item.name}</td>
      <td style="text-align:center;">${item.pourcentage}</td>
    </tr>
  `).join('');

  const StatRowsIncomes = StatIncomesData.map((item) => `
    <tr>
      <td style="text-align:center;">${item.name}</td>
      <td style="text-align:center;">${item.pourcentage}</td>
    </tr>
  `).join('');

    const res:String=isYearlyActive?"Yearly":"Monthly";
    const tit:String=isExpensesActive?"Expenses":"Incomes";
    const sw=isExpensesActive?expensesRows:incomesRows;
    const st=isExpensesActive?StatRowsExpenses:StatRowsIncomes;

    let options = {
      html: `
        <h1 style="text-align:center;margin-bottom:8%;margin-top:8%">${tit} List</h1>
        <h2 style="text-align:center;margin-bottom:8%">${res}</h2>
        <table style="width:90%;border-collapse:collapse;margin-left:5%;margin-bottom:5%" border='1'>
          <tr>
            <th style="text-align:center;">Amount</th>
            <th style="text-align:center;">DateTime</th>
            <th style="text-align:center;">Currency</th>
          </tr>
          ${sw}
        </table>
        <h2 style="text-align:center;margin-bottom:8%">Statistics</h2>
        <table style="width:90%;border-collapse:collapse;margin-left:5%;margin-bottom:5%" border='1'>
          <tr>
            <th style="text-align:center;">Name</th>
            <th style="text-align:center;">Pourcentage</th>
          </tr>
          ${st}
        </table>
      `,
      fileName: 'Invoice',
      base64: true,
    };
  
    const file = await RNPrint.print(options);
  };

  const toggleExpenses = () => {
    setIsExpensesActive(true);
    setIsIncomesActive(false);
    console.log('Expenses button pressed');
  };
  const toggleIncomes = () => {
    setIsIncomesActive(true);
    setIsExpensesActive(false);
    console.log('Incomes button pressed');
  };
  const Style1 = {
    color: isExpensesActive ? 'white' : '#868686',
  };
  const Style2 = {
    color: isIncomesActive ? 'white' : '#868686',
  };

  const textStyle1= { ...Style1,flexDirection: 'row', fontWeight: 'bold', fontSize: 22, textAlign: 'center' };
  const textStyle2= { ...Style2,flexDirection: 'row', fontWeight: 'bold', fontSize: 22, textAlign: 'center' };

  const drawer = useRef<DrawerLayoutAndroid>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const handleYearlyPress = () => {
    setIsYearlyActive(true);
    setIsMonthlyActive(false);
    console.log('Yearly button pressed');
  };

  const handleMonthlyPress = () => {
    setIsMonthlyActive(true);
    setIsYearlyActive(false);
    console.log('Monthly button pressed');
  };

  const Style3 = {
    color: isYearlyActive ? 'white' : 'black',
  };
  const Style4 = {
    color: isMonthlyActive ? 'white' : 'black',
  };

  const StyleSelected = {
    marginTop: '1%',
    backgroundColor: 'white',
    height: '30%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  };

  const textStyle3= { ...Style3, justifyContent: 'space-around', flexDirection: 'row', fontWeight: 'bold', fontSize: 22, textAlign: 'center',marginTop:'-3%' };
  const textStyle4= { ...Style4, justifyContent: 'space-around', flexDirection: 'row', fontWeight: 'bold', fontSize: 22, textAlign: 'center',marginTop:'-3%' };


  const ButtonStyle1={
    marginRight:'1%',
    marginTop:20,
    width: '41%',
    backgroundColor: '#BD1839',
    borderRadius:50,
    height: '80%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  }

  const ButtonStyle2={
    marginRight:'1%',
    marginTop:20,
    width: '41%',
    color:'#868686',
  }
  

  return (
      <SafeAreaView style={styles.background}>
        {/**Partie Header */}
        <DrawerLayoutAndroid
        ref={drawer}
        drawerWidth={300}
        drawerPosition="left"
        onDrawerStateChanged={handleDrawerStateChange}
        renderNavigationView={() => <Drawer closeDrawer={closeDrawer} />}>
    <View style={{ backgroundColor: '#BD1839', justifyContent: 'center', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, height: '10.5%', alignItems: 'center' }}>
      <SafeAreaView style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', height: '40%', width: '95%', marginTop: '3%' ,marginLeft: '5%'}}>
        <TouchableOpacity onPress={toggleDrawer}>
          <Image source={require('../assets/humbergerMenu.png')} style={styles.icons} />
        </TouchableOpacity>

        <Image source={require('../assets/singleMan.png')} style={styles.singleMan} />
        <Text style={{ fontWeight: 'bold', fontSize: 25, color: 'black', marginRight: '50%', paddingBottom: '1%' }}>Statistics</Text>
      </SafeAreaView>

      <View style={{width: '100%', height: '50%', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, justifyContent: 'space-around', flexDirection: 'row', alignItems: 'center' }}>

        <TouchableOpacity onPress={handleYearlyPress} style={styles.button2}>
          <Text style={textStyle3}>Yearly</Text>
          <View style={isYearlyActive ? StyleSelected : {}}></View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleMonthlyPress} style={styles.button2}>
          <Text style={textStyle4}>Monthly</Text>
          <View style={isMonthlyActive ? StyleSelected : {}}></View>
        </TouchableOpacity>
      </View>
    </View>
    {/**Fin partie Header */}
        <SafeAreaView style={styles.container}>
          <View style={{width: '95%', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around',height:'7%' }}>

              <TouchableOpacity onPress={toggleExpenses} style={isExpensesActive ? ButtonStyle1 : ButtonStyle2}>
                <Text style={textStyle1}>Expenses</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleIncomes} style={isIncomesActive ? ButtonStyle1 : ButtonStyle2}>
                <Text style={textStyle2}>Incomes</Text>
              </TouchableOpacity>
          </View>

          <View style={{ width: '100%', alignItems: 'center', marginTop: '5%' }}>
          <Text style={{ color: '#735757', fontSize: 20, fontWeight: 'bold' }}>
              Total {isExpensesActive ? 'expenses' : 'incomes'}
            </Text>
          </View>

          {isIncomesActive ? <BasicChart StatData={StatIncomesData} /> : <BasicChart StatData={StatExpensesData} />}

          {isExpensesActive?(
          <View style={{ width: '100%', alignItems: 'center',backgroundColor:'#BD1839',borderTopLeftRadius: 25, borderTopRightRadius: 25,height:210 }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: '1%', textAlign: 'center', marginBottom: '0%' }}>
              List of {isExpensesActive ? 'expenses' : 'incomes'}
            </Text>
            <ScrollView horizontal={false} showsVerticalScrollIndicator={true}> 
             <ExpensesList expensesData={expensesData} CategoryData={categoryData} showButtons={false} selectedCurrency={0}/>
            </ScrollView>
          </View>
          ):
          <View style={{ width: '100%', alignItems: 'center',backgroundColor:'#BD1839',borderTopLeftRadius: 25, borderTopRightRadius: 25,height:210 }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: '1%', textAlign: 'center', marginBottom: '0%' }}>
            List of {isExpensesActive ? 'expenses' : 'incomes'}
          </Text>
          <ScrollView horizontal={false} showsVerticalScrollIndicator={true}> 
           <IncomesList incomesData={incomesData} CategoryData={categoryData} showButtons={false} selectedCurrency={0}/>
          </ScrollView>
        </View>
        }

          <TouchableOpacity  onPress={printHTML} style={styles.button}>
          <Text style={styles.buttonText} >Print</Text>
          </TouchableOpacity>
        </SafeAreaView>
        </DrawerLayoutAndroid>
      </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%',
    height: '69.7%',
    marginTop: '2.5%',
    alignContent: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#FFFFFF', 
    paddingTop: 11,
    fontFamily: 'Verdana',
    textAlign: 'center',
  },

  background: {
    height: 1000,
    backgroundColor: 'white',
  },
  button: {
    width: '40%',
    height: 50,
    marginTop: '5%',
    backgroundColor: '#BD1839',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  button2: {
    width: '40%',
    height: '80%',
    marginTop: '4%'
  },
  icons: {
    width: 35,
    height: 35,
  },
  singleMan: {
    width: 30,
    height: 30,
    marginBottom: '1.5%',
    marginLeft: '17%',
    marginRight: '4%',
  },
});

export default Statistics;