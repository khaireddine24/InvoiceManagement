import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ToastAndroid,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Database from '../Database';

interface DataItem {
  idCat: any;
  categoryName: string; 
  categoryImage: string;
}

const CategoriesList: React.FC<{ categoriesData: DataItem[] }> = ({ categoriesData }) => {
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [editedCategory, setEditedCategory] = useState<DataItem | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState<string>('');
  const [logoUri, setLogoUri] = useState<string>('');
  const [CategoriesData, setCategoriesData] = useState<DataItem[]>([]);

  const db = Database();

  useEffect(() => {
    setCategoriesData(categoriesData);
  }, [categoriesData]);

  // const displayCategoriesTable = async () => {
  //   try {
  //     await db.transaction(async (txn) => {
  //       const selectQuery = 'SELECT idCat, name FROM categories;';
  //       txn.executeSql(selectQuery, [], (tx, res) => {
  //         const rows = res.rows;
  //         for (let i = 0; i < rows.length; i++) {
  //           const categorydata = rows.item(i);
  //           //console.log('Category Data - idCat:', categorydata.idCat, 'name:', categorydata.name);
  //         }
  //       });
  //     });
  //   } catch (error) {
  //     console.error('Error displaying categories table: ', error);
  //   }
  // };

  const showToastWithGravity = (text: string) => {
    ToastAndroid.showWithGravity(
      text,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER
    );
  };

  const Delete = async (id: number) => {
    try {
      await db.transaction(async (txn) => {
        const deleteQuery = `DELETE FROM categories WHERE idCat = ?;`;
        await txn.executeSql(deleteQuery, [id], (tx, res) => {
          console.log('Category deleted successfully !');
          //displayCategoriesTable();
        });
      });
    } catch (error) {
      console.error('Error deleting category: ', error);
    }
  };

  const handleDeleteCategory = (id:number,index: number) => {
    const newCategories = [...CategoriesData];
    newCategories.splice(index, 1);
    setCategoriesData(newCategories);
    //console.log('index = ', index);
    Delete(id);
    showToastWithGravity('Category deleted successfully!');
  };

  const updateCategoryInDatabase = async (id: number, name: string, categoryImage: string) => {
    try {
      await db.transaction(async (txn) => {
        const updateQuery = `
          UPDATE categories
          SET categoryName = ?, categoryImage = ?
          WHERE idCat = ?;
        `;
        await txn.executeSql(updateQuery, [name, categoryImage, id], (tx, res) => {
          console.log('Category updated successfully in the database');
          //displayCategoriesTable();
        });
      });
    } catch (error) {
      console.error('Error updating category: ', error);
    }
  };

  const handleSaveEditCategory = () => {
    if (editedCategory) {
      const updatedCategories = CategoriesData.map((category) =>
        category.idCat === editedCategory.idCat
          ? {
              ...category,
              name: editedCategoryName || category.categoryName,
              categoryImage: logoUri || category.categoryImage,
            }
          : category
      );

      showToastWithGravity('Category updated');
      updateCategoryInDatabase(editedCategory.idCat, editedCategoryName, logoUri);
      setCategoriesData(updatedCategories);
      setEditModalVisible(false);
      setEditedCategory(null);
      setEditedCategoryName('');
      setLogoUri('');
    }
  };

  const handleButtonImportSelect = () => {
    handleImageSelect();
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

  const handleEditCategory = (index: number) => {
    setEditedCategory(categoriesData[index]);
    setEditedCategoryName(categoriesData[index].categoryName);
    setLogoUri(categoriesData[index].categoryImage);
    setEditModalVisible(true);
  };

  const handleCancelEditCategory = () => {
    setEditModalVisible(false);
    setEditedCategory(null);
    setEditedCategoryName('');
    setLogoUri('');
  };

  return (
    <View>
      {CategoriesData.length > 0 ? (
        CategoriesData.map((category: any, index: any) => (
          <View key={index} style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Category</Text>
              <Image source={{ uri: category.categoryImage }} style={styles.SoftHardicons} />
            </View>
  
            <View style={styles.cardContent}>
              <View style={styles.cardContentColumn}>
                <Text style={styles.cardContentText}>Name : {category.categoryName}</Text>
              </View>
  
              <View style={styles.cardContentRow}>
                <TouchableOpacity onPress={() => handleEditCategory(index)}>
                  <Image source={require('../assets/edit.png')} style={styles.icons} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCategory(category.idCat, index)} style={{ marginLeft: '2%' }}>
                  <Image source={require('../assets/delete.png')} style={styles.iconDelete} />
                </TouchableOpacity>
              </View>
            </View>
  
            {/* Edit Modal */}
            <Modal visible={editModalVisible} transparent animationType="slide">
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalHeaderText}>Edit Category</Text>
                  <TextInput
                    placeholder="Category Name"
                    value={editedCategoryName}
                    onChangeText={(text: any) => setEditedCategoryName(text)}
                    style={styles.input}
                  />
                  <TouchableOpacity onPress={handleButtonImportSelect} style={styles.importButton}>
                    <Text style={styles.importButtonText}>Pick Icon</Text>
                  </TouchableOpacity>
  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.button} onPress={handleSaveEditCategory}>
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleCancelEditCategory}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        ))
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data found</Text>
        </View>
      )}
    </View>
  );
  
};
const styles = StyleSheet.create({
  noDataContainer: {
    marginTop:'20%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'gray',
  },
  importButton:{
    textAlign:'center',
    width: '100%',
    height:44,
    marginTop:'4%',
    marginBottom:'5%',
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
    SoftHardicons: {
        width: 40,
        height: 40,
        borderRadius:50,
      },
    icons: {
        width: 33,
        height: 33,
        borderRadius: 8,
        marginLeft:5,
      },
    iconDelete: {
        width: 35,
        height: 33,
        marginLeft: '10%',
      },
    cardContent: {
        justifyContent: 'space-between',
        alignItems:'center',
        flexDirection: 'row',
      },
      cardContentColumn: {
        marginRight: '2%',
        marginTop: '5%',
        height:'70%',
        width:'70%',
      },
      cardContentRow:{
        flexDirection: 'row',
        marginTop:'5%',
      },
      cardContentText: {
        color: 'black',
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: '5%',
        marginLeft: '3%',
      },
    cardHeader: {
        backgroundColor: '#D9D9D9',
        width: '100%',
        height: '40%',
        justifyContent: 'space-between',
        flexDirection: 'row',
        padding: '2.5%',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
      },
      cardHeaderText: {
        color: 'black',
        fontSize: 17,
        fontWeight: 'bold',
      },
  modalContainer: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    padding: 20,
    borderRadius: 10,
  },
  modalHeaderText: {
    color: 'black',
    fontWeight: 'bold',
    marginBottom: '20%',
    fontSize: 20,
    textAlign: 'center',
  },
  input: {
    color:'white',
    paddingLeft: 15,
    backgroundColor: '#2196F5',
    borderRadius: 2,
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    height:44,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  button: {
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
  buttonText: {
    fontWeight: 'bold',
    fontSize: 19,
    color: '#FFFFFF',
    paddingTop: 7,
    fontFamily: 'Verdana',
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor:'white',
    width: '90%',
    height: 140,
    marginLeft: '5%',
    marginTop: '2.5%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2, 
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
});

export default CategoriesList;

