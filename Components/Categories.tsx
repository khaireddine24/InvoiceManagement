import React, { useState, useRef, useEffect } from 'react';
import {Image,StyleSheet,Text,View,TouchableOpacity,
  SafeAreaView,
  ScrollView,
  DrawerLayoutAndroid,
  TextInput,
  Modal,
  ToastAndroid,
  RefreshControl,
} from 'react-native';
import Drawer from './Drawer';
import CategoriesList from './CategoriesList';
import ImagePicker from 'react-native-image-crop-picker';
import Database from '../Database';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface DataItem {
  idCat : any; 
  categoryName: string;
  categoryImage: string;
}

const Categories = () => {
  const [categoriesData, setCategoriesData] = useState<DataItem[]>([]);
  const drawer = useRef<DrawerLayoutAndroid>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [logoUri, setLogoUri] = useState<string>('');
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      displayCategoriesTable();
    }, 1000);
  }, []);
  const db = Database();

  useEffect(() => {
    displayCategoriesTable();
  }, []);

  useEffect(() => {
    //dropCategoriesTable();
    //console.log('table categories deleted succeffully');
    db.transaction((txn) => {
      txn.executeSql(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='categories';`,
        [],
        (sqlTxn, res) => {
          if (res.rows.length === 0) {
            txn.executeSql(
              `CREATE TABLE categories (
                idCat INTEGER PRIMARY KEY AUTOINCREMENT,
                categoryName VARCHAR(50) NOT NULL,
                categoryImage BLOB
              );`,
              [],
              (createTableTxn, createTableRes) => {
                console.log('Table categories created successfully');
              },
              (createTableError) => {
                console.log('Error creating table categories ' + createTableError);
              }
            );
          } else {
            console.log('Table categories already exists');
          }
        },
        (error) => {
          console.log('Error checking if table categories exists ' + error);
        }
      );
    });
  }, []);

  // const dropCategoriesTable = async () => {
  //   try {
  //     await db.transaction(async (txn) => {
  //       txn.executeSql(
  //         `DROP TABLE IF EXISTS categories;`,
  //         [],
  //         (tx, res) => {
  //           console.log('Table categories dropped successfully');
  //         },
  //         (error) => {
  //           console.log('Error dropping table categories ' + error);
  //         }
  //       );
  //     });
  //   } catch (error) {
  //     console.error('Error dropping table categories: ', error);
  //   }
  // };

  const showToastWithGravity = (text: string) => {
    ToastAndroid.showWithGravity(
      text,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER
    );
  };

  const handleButtonImportSelect = () => {
    handleImageSelect();
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

  const handleSaveNewCategory = async () => {
    try {
      if (!newName || !logoUri) {
        showToastWithGravity('Name and icon are required.');
        return;
      }
      await db.transaction(async (txn) => {
        const insertQuery = `INSERT INTO categories (categoryName, categoryImage) VALUES (?, ?);`;
        const values = [newName, logoUri];

        await txn.executeSql(insertQuery, values, (tx, res) => {
          const newCategory: DataItem = {
            categoryName: newName,
            categoryImage: logoUri,
            idCat: undefined
          };
          console.log('Category added successfully');
          displayCategoriesTable();
        });
      });

      setNewName('');
      setLogoUri('');
      setAddModalVisible(false);
      showToastWithGravity('Category Added Successfully!');
    } catch (error) {
      console.error('Error inserting Category: ', error);
      showToastWithGravity('Failed to add Category');
    }
  };

  const displayCategoriesTable = async () => {
    try {
      await db.transaction(async (txn) => {
        const selectQuery = 'SELECT * FROM categories;';
        txn.executeSql(selectQuery, [], (tx, res) => {
          const rows = res.rows;
          const newCategoriesData: DataItem[] = [];
          for (let i = 0; i < rows.length; i++) {
            const categoryData = rows.item(i);
            newCategoriesData.push({
              idCat: categoryData.idCat,
              categoryName: categoryData.categoryName,
              categoryImage: categoryData.categoryImage,
            });
            console.log('Category Data - idCat:', categoryData.idCat, 'name:', categoryData.categoryName);
          }
          setCategoriesData(newCategoriesData);
        });
      });
    } catch (error) {
      console.error('Error displaying categories table: ', error);
    }
  };

  const handleImageSelect = async () => {
    try {
      const image = await ImagePicker.openPicker({
        cropping: true,
        width: 300,
        height: 300,
        includeBase64: true,
      });

      if ('data' in image && image.data) {
        setLogoUri(`data:${image.mime};base64,${image.data}`);
        showToastWithGravity('Icon picked successfully!');
      } else {
        console.log('Selected file is not an image:', image);
      }
    } catch (error) {
      console.log('Error selecting image:', error);
    }
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
            <Image source={require('../assets/categories.png')} style={styles.categoryIcon} />
            <Text style={{ fontWeight: 'bold', fontSize: 25, color: 'black', marginRight: '50%' }}>Categories</Text>
          </SafeAreaView>
        </View>
        <View style={styles.container}>
          <View style={{ width: '100%', height: '75%' }}>
            <ScrollView horizontal={false} showsVerticalScrollIndicator={true} refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
              <CategoriesList categoriesData={categoriesData}/>
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
              <Text style={{ color: 'black', fontWeight: 'bold', marginBottom: '20%', fontSize: 20, textAlign: 'center' }}>Add category</Text>
              <TextInput
                placeholder="Name"
                value={newName}
                onChangeText={(text: any) => setNewName(text)}
                keyboardType="default"
                style={{
                  color:'white',
                  paddingLeft: 15,
                  backgroundColor: '#2196F5',
                  borderRadius: 2,
                  marginBottom: '10%',
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                }}
              />
               <TouchableOpacity onPress={handleButtonImportSelect} style={styles.importButton}>
                  <Text style={styles.importButtonText}>Pick Icon</Text>
                </TouchableOpacity>
              
              <View style={{ flexDirection: 'row', width: '100%', height: '20%', alignItems: 'center', justifyContent: 'space-around',marginTop:'5%',}}>

                <TouchableOpacity onPress={handleSaveNewCategory} style={styles.SaveCancel}>
                  <Text style={styles.SaveCancelText} onPress={handleSaveNewCategory}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.SaveCancel}>
                  <Text style={styles.SaveCancelText} onPress={() => setAddModalVisible(false)}>Cancel</Text>
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
  importButton:{
    textAlign:'center',
    width: '100%',
    height:44,
    backgroundColor:'#2196F5',
    borderRadius:2,
    alignItems:'center',
    justifyContent:'center',
  },
  importButtonText:{
    fontSize:16,
    color:'white',
    fontWeight:'bold',
    textAlign:'center',
  },
    container: {
      flexDirection: 'column',
      marginTop: '9%',
      width: '100%',
      height: '75%',
      alignContent: 'center',
    },
    SaveCancel: {
      marginTop:'8%',
      width: '40%',
      height: 44,
      backgroundColor: '#2196F5',
      borderRadius: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 10,
      elevation: 5,
    },
    SaveCancelText: {
      fontWeight: 'bold',
      fontSize: 18,
      color: '#FFFFFF',
      textAlign: 'center',
      paddingTop: 7,
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
    categoryIcon: {
      width: 25,
      height: 25,
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
export default Categories
