import React, {useEffect, useState} from 'react';
import {Image,StyleSheet,Text,View,TouchableOpacity,SafeAreaView,TextInput,Switch,ScrollView,ToastAndroid} from 'react-native';
import {MultipleSelectList,SelectList,} from 'react-native-dropdown-select-list';
import ImagePicker from 'react-native-image-crop-picker';
import {useNavigation} from '@react-navigation/native';
import Database from '../Database';

interface Currency {
  [x: string]: any;
  key: string;
  value: string;
}

const Settings = () => {
  const curr: Currency[] = [
    {key: '1', value: 'TND'},
    {key: '2', value: 'EUR'},
    {key: '3', value: 'USD'},
    {key: '4', value: 'GBP'},
  ];
  const defaultLogo =require('../assets/addLogo.png');

  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [logoUri, setLogoUri] = useState<any>();
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const showToastWithGravity = (text:string) => {
    ToastAndroid.showWithGravity(
      text,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
      
    );
  };
  const db = Database();
  useEffect(() => {

    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM welcome WHERE id = ?',[1], 
        (_, { rows }) => {
          const data = rows.item(0);
          if (data) {
            setName(data.name);
            setLogoUri(data.logo ? { uri: data.logo } : defaultLogo);
            setSelectedCurrency(data.mainCurrency);
            setSelectedCurrencies(data.othersCurrencies.split(','));
            setIsChecked(data.deviceLock === 'true');
          }
        },
        (error) => {
          console.log('Error fetching data from the database', error);
        }
      );
    });


  }, []);

  const handleSaveSettings = () => {
    if (!name || !selectedCurrency || selectedCurrencies.length === 0) {
      showToastWithGravity('Please fill in all required fields');
      return;
    }
  
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT logo FROM welcome WHERE id = ?',
        [1],
        (_, { rows }) => {
          const existingLogo = rows.item(0)?.logo;
  
          tx.executeSql(
            'INSERT OR REPLACE INTO welcome (id, name, logo, mainCurrency, otherCurrencies, deviceLock) VALUES (?, ?, ?, ?, ?, ?)',
            [
              1,
              name,
              logoUri && logoUri !== existingLogo ? logoUri.uri : existingLogo,
              selectedCurrency,
              selectedCurrencies.join(','),
              isChecked ? 'true' : 'false',
            ],
            (sqlTxn, res) => {
              console.log('Data saved to the database');
            },
            (error) => {
              console.log('Error saving data to the database', error);
            }
          );
        },
        (error) => {
          console.log('Error fetching existing logo from the database', error);
        }
      );
    });
  
    showToastWithGravity('Settings updated successfully!');
  };
  

  const handlePress = () => {
    navigation.goBack();
  };
  const toggleIsChecked = () => {
    setIsChecked(value => !value);
  };


  const handleNameChange = (text: string) => {
    setName(text);
  };

  
  const handleUploadImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        cropping: true,
        width: 300,
        height: 300,
        includeBase64: true,
      });
  
      if ('data' in image) {
        if (image.data) {
          setLogoUri({ uri: `data:${image.mime};base64,${image.data}` });
        } else {
          console.log('Image data is missing.');
        }
      } else {
        console.log('Selected file is a video:', image);
      }
    } catch (error) {
      console.log('Error selecting image:', error);
    }
  };
  return (
    <ScrollView>
      <SafeAreaView style={styles.background}>
        <View
          style={{
            backgroundColor: '#BD1839',
            justifyContent: 'center',
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
            height: '8%',
            alignItems: 'center',
          }}>
          <SafeAreaView
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              height: '60%',
              width: '95%',
              marginBottom: '2%',
            }}>
            <TouchableOpacity onPress={handlePress}>
              <Image
                source={require('../assets/leftArrow.png')}
                style={styles.settingImage}
              />
            </TouchableOpacity>

            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 25,
                color: 'black',
                marginRight: '50%',
                paddingBottom: '1.4%',
              }}>
              Settings
            </Text>
            <Image
              source={require('../assets/setting.png')}
              style={styles.settingImage}
            />
          </SafeAreaView>
        </View>

        <SafeAreaView style={styles.container}>
          <View style={{marginRight: '63%'}}>
            <Text style={{fontWeight: 'bold', fontSize: 23, color: 'black'}}>
              Edit profile
            </Text>
          </View>

          <View>
            {logoUri && logoUri.uri && logoUri.uri !== '' ? (
              <Image source={logoUri} style={styles.image} />
            ) : (
              <Image
                source={defaultLogo}
                style={styles.image}
              />
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUploadImage}>
              <Text style={styles.uploadButtonText}>Upload image</Text>
            </TouchableOpacity>
          </View>


          <View style={{width: '95%'}}>
            <Text
              style={{
                marginTop: '10%',
                fontSize: 20,
                fontWeight: 'bold',
                color: 'black',
              }}>
              Name
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Lorem Ipsum"
              value={name}
              onChangeText={handleNameChange}
              accessible={true}
              accessibilityLabel="Name input"
            />
          </View>

          <View style={{width: '95%', marginBottom: '10%'}}>
            <SelectList
              data={curr}
              save="value"
              placeholder="Main currencies"
              setSelected={(val: any) => setSelectedCurrency(val)}
              boxStyles={{
                borderRadius: 5,
                borderColor: '#BD1839',
                borderStyle: 'solid',
                backgroundColor: '#BD1839',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                height: 50,
              }}
              inputStyles={{color: 'black', fontWeight: 'bold', fontSize: 17}}
              dropdownTextStyles={{color: 'black', fontWeight: 'bold'}}
              dropdownItemStyles={{
                backgroundColor: '#BD1839',
                marginHorizontal: 6,
              }}
              dropdownStyles={{
                backgroundColor: '#BD1839',
                borderRadius: 8,
                borderColor: 'white',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
            />
          </View>

          <View style={{width: '95%'}}>
            <MultipleSelectList
              setSelected={(val: any) => setSelectedCurrencies(val)}
              data={curr}
              placeholder="Other currencies"
              save="value"
              onSelect={() => {}}
              label="Currencies"
              boxStyles={{
                borderRadius: 5,
                borderColor: '#BD1839',
                borderStyle: 'solid',
                backgroundColor: '#BD1839',
              }}
              inputStyles={{color: 'black', fontWeight: 'bold', fontSize: 17}}
              dropdownTextStyles={{color: 'black', fontWeight: 'bold'}}
              checkBoxStyles={{
                backgroundColor: '#FFFFFF',
                borderColor: 'black',
              }}
              badgeStyles={{backgroundColor: '#FFFFFF'}}
              badgeTextStyles={{
                color: 'black',
                fontWeight: 'bold',
                fontSize: 14,
              }}
              labelStyles={{
                color: 'black',
                fontWeight: 'bold',
                fontSize: 16,
                marginLeft: 2,
              }}
              dropdownItemStyles={{
                backgroundColor: '#BD1839',
                marginHorizontal: 5,
                borderRadius: 5,
              }}
              dropdownStyles={{
                backgroundColor: '#BD1839',
                borderRadius: 8,
                borderColor: '#BD1839',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
            />
          </View>

          <View style={styles.switch}>
            <Switch
              value={isChecked}
              onValueChange={toggleIsChecked}
              thumbColor={isChecked ? 'white' : 'white'}
              trackColor={{false: 'red', true: 'green'}}
              style={{}}
            />
            <Text style={styles.textSwitch}>Enable device lock</Text>
          </View>

          <View
            style={{
              width: '95%',
              alignItems: 'center',
              flexDirection: 'row',
              marginTop: '7%',
              justifyContent: 'center',
            }}>
            <TouchableOpacity onPress={handleSaveSettings} style={styles.button}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column',
    padding: 20,
    width: '90%',
    height: '90%',
    marginLeft: '5%',
    marginTop: '5%',
    alignContent: 'center',
  },
  settingImage: {
    width: 25,
    height: 25,
  },
  background: {
    height: 900,
    backgroundColor: 'white',
  },
  image: {
    width: 120,
    height: 120,
    margin: '5%',
    borderRadius: 80,
  },
  button: {
    width: '50%',
    height: 55,
    marginTop: '1%',
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
  uploadButton: {
    width: 150,
    height: 40,
    backgroundColor: '#BD1839',
    borderRadius: 5,
    marginTop: '1%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadButtonText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 17,
    color: '#000',
    paddingTop: 8,
    fontFamily: 'Verdana',
  },
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
    color: '#FFFFFF',
    paddingTop: 12,
    fontFamily: 'Verdana',
  },
  input: {
    borderStyle: 'solid',
    borderBottomColor: 'black',
    borderBottomWidth: 2,
    fontSize: 17,
    fontWeight: 'bold',
    height: 50,
    backgroundColor: '#FFFFFF',
    marginTop: '0%',
    padding: 10,
    color:'black',
    width: '100%',
    marginBottom: '10%',
  },
  switch: {
    marginRight: '35%',
    marginTop: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    width: '62%',
  },
  textSwitch: {
    color: 'black',
    fontSize: 17,
    paddingBottom: '1.5%',
    paddingLeft: '3%',
    fontWeight: 'bold',
  },
});

export default Settings;