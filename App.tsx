import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './Components/Login';
import WelcomePage from './Components/WelcomePage';
import Settings from './Components/Settings';
import Expenses from './Components/Expenses';
import Incomes from './Components/Incomes';
import Statistics from './Components/Statistics';
import Categories from './Components/Categories';
import Database from './Database';

const Stack = createStackNavigator();

function App() {
  const db = Database();


  const [welcomeExists, setWelcomeExists] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      await db.transaction(
        (txn) => {
          txn.executeSql(
            'SELECT name FROM sqlite_master WHERE type="table" AND name="welcome"',
            [],
            (_txn, res) => {
              if (res.rows.length > 0) {
                setWelcomeExists(true);
                console.log("welcome table exists !");
              } else {
                setWelcomeExists(false);
                console.log("welcome table n'exists pas .");
              }
            },
            (error) => {
              console.error('Error checking if welcome table exists:', error);
            }
          );
        },
        (error) => {
          console.error('Transaction error:', error);
        }
      );
    };
  
    fetchData();
  }, [db]);
  
  
  const initialRouteName = welcomeExists ? 'Login' : 'WelcomePage';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
          
          {/* <Stack.Screen name="Login" component={Login} /> */}
          <Stack.Screen name="WelcomePage" component={WelcomePage} /> 
          <Stack.Screen name="Expenses" component={Expenses} />
          <Stack.Screen name="Incomes" component={Incomes} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="Statistics" component={Statistics} />
          <Stack.Screen name="Categories" component={Categories} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;

