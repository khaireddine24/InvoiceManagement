import React, { useEffect,useState } from 'react';
import {Text, StyleSheet, View, SafeAreaView ,Image,TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Database from '../Database';

  interface DrawerProps {
    closeDrawer: () => void
  }
 
const Drawer=({ closeDrawer }: DrawerProps) =>{
  const db = Database();

  const navigation = useNavigation();
      const [isPressedCategories, setIsPressedCategories] = useState(false);
      const [isPressedExpenses, setIsPressedExpenses] = useState(false);
      const [isPressedIncomes, setIsPressedIncomes] = useState(false);
      const [isPressedStatistics, setIsPressedStatistics] = useState(false);
      const [isPressedSettings, setIsPressedSettings] = useState(false);
      const [welcomeData, setWelcomeData] = useState<any>(null);

      useEffect(() => {
        const fetchData = async () => {
          db.transaction(
            (tx) => {
              tx.executeSql(
                'SELECT name,logo FROM welcome WHERE id = 1',
                [],
                (sqlTxn, res) => {
                  if (res.rows.length > 0) {
                    const rowData = res.rows.item(0);
                    //console.log('Fetched data:', rowData);
                    setWelcomeData(rowData);
                  }
                },
                (error) => {
                  console.log('Error fetching data from the database', error);
                }
              );
            },
            (error) => {
              console.error('Transaction error:', error);
            }
          );
        };
    
        fetchData();
  
      }, []);

  const logoImage = welcomeData?.logo ? { uri: welcomeData.logo } : require('../assets/userLogo.png');

      const handlePressInCategories = () => {
        setIsPressedExpenses(true);
        navigation.navigate('Categories');
      };
      const handlePressOutCategories = () => {
        setIsPressedCategories(false);
        closeDrawer();
      };
      const handlePressInExpenses = () => {
        setIsPressedExpenses(true);
        navigation.navigate('Expenses');
      };

      const handlePressOutExpenses = () => {
        setIsPressedExpenses(false);
        closeDrawer();
      };

      const handlePressInIncomes = () => {
        setIsPressedIncomes(true);
        navigation.navigate('Incomes');
      };

      const handlePressOutIncomes = () => {
        setIsPressedIncomes(false);
        closeDrawer();
      };

      const handlePressInStatistics = () => {
        setIsPressedStatistics(true);
        navigation.navigate('Statistics');
      };

      const handlePressOutStatistics = () => {
        setIsPressedStatistics(false);
        closeDrawer();
      };

      const handlePressInSettings = () => {
        setIsPressedSettings(true);
        navigation.navigate('Settings');
      };

      const handlePressOutSettings = () => {
        setIsPressedSettings(false);
        closeDrawer();
      };

      return (
        <SafeAreaView style={[styles.container, styles.navigationContainer]}>
          <View style={styles.drawerHeader}>

            <TouchableOpacity onPress={closeDrawer}>
              <Image source={require('../assets/closeIcon.png')} style={styles.closeIcon} />
            </TouchableOpacity>
      
            <View style={styles.NameLogo}>
              <View style={{ width: '65%', height: '100%', justifyContent: 'center' }}>
                <Text style={styles.nameStyle}>{welcomeData?.name || 'Welcome'}</Text>
              </View>
              <Image source={logoImage} style={styles.userLogo} />
            </View>

          </View>   

          <View style={styles.navigations}>
            <TouchableOpacity
              style={[styles.Links, isPressedExpenses ? { backgroundColor: '#FF2652' } : null]}
              onPress={() => {}}
              onPressIn={handlePressInExpenses}
              onPressOut={handlePressOutExpenses}
            >
                <Image source={require('../assets/ShareMoneyDollar.png')} style={styles.navigationsIcons} />
                <Text style={styles.linksText}>Expenses</Text>
            </TouchableOpacity>
      
            <TouchableOpacity
              style={[styles.Links, isPressedIncomes ? { backgroundColor: '#FF2652' } : null]}
              onPress={() => {}}
              onPressIn={handlePressInIncomes}
              onPressOut={handlePressOutIncomes}
            >
            
                <Image source={require('../assets/wallet.png')} style={styles.navigationsIcons} />
                <Text style={styles.linksText}>Incomes</Text>
            </TouchableOpacity>
      
            <TouchableOpacity
              style={[styles.Links, isPressedStatistics ? { backgroundColor: '#FF2652' } : null]}
              onPress={() => {}}
              onPressIn={handlePressInStatistics}
              onPressOut={handlePressOutStatistics}
            >
                <Image source={require('../assets/singleMan.png')} style={styles.navigationsIcons} />
                <Text style={styles.linksText}>Statistics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.Links, isPressedCategories ? { backgroundColor: '#FF2652' } : null]}
              onPress={() => {}}
              onPressIn={handlePressInCategories}
              onPressOut={handlePressOutCategories}
            >
                <Image source={require('../assets/categories.png')} style={styles.navigationsIcons} />
                <Text style={styles.linksText}>Categories</Text>
            </TouchableOpacity>
      
            <TouchableOpacity
              style={[styles.Links, isPressedSettings ? { backgroundColor: '#FF2652' } : null]}
              onPress={() => {}}
              onPressIn={handlePressInSettings}
              onPressOut={handlePressOutSettings}
            >
                <Image source={require('../assets/setting.png')} style={styles.navigationsIcons} />
                <Text style={styles.linksText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  navigationContainer: {
    backgroundColor: '#ecf0f1',
  },
  drawerHeader:{
        width: '100%',
        height: '22%',
        backgroundColor:'#BD1839',
  },
  closeIcon:{
    margin:8,
    width: 20,
    height: 20,
    backgroundColor:'#BD1839',
},
    NameLogo:{
      paddingLeft:10,
      paddingRight:10,
      flexDirection:'row',
      width: '100%',
      height: '60%',
      justifyContent: 'space-between',
      alignItems:'center',

    },
    userLogo:{
      margin:8,
      width: 70,
      height: 70,
      borderRadius:50,
  },
  nameStyle:{
    color: 'white',
    fontWeight:'bold',
    fontSize:22,
  },
  navigations:{
    marginTop:'15%',
    width: '100%',
    height: '50%',
  },
  navigationsIcons:{
    width: 30,
    height: 30,
    marginRight: 30,
},
  Links:{
    paddingLeft:15,
    borderColor:'transparent',
    marginLeft:'5%',
    marginTop:'0%',
    width: '90%',
    height: '15%',
    borderRadius:5,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight:'30%',
  },
  linksText:{
    color:'black',
    fontSize:24,
    fontWeight:'bold',
  },
});

export default Drawer;