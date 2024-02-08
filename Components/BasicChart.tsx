import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { PieChart } from '../PieChart';

interface PieDataItem {
  value: number;
  color: string;
  name: string;
  text: string;
}
interface StatItem {
  name: string;
  pourcentage: number;
}

const BasicChart : React.FC<{StatData: StatItem[]}> = ({StatData}) => {
  const [Data, setData] = useState<StatItem[]>([]);
  useEffect(() =>{setData(StatData)},[StatData])
  const Color = ['#177AD5', '#79D2DE', '#ED6665','#FE7A36'];

  const pieData: PieDataItem[] = [];
  const getNbPieData = (data:any) => {
    return data.length;
  };
  const checkCase = (index:any) => {
    return ((index+1)-5)%4==0;
  };

  const assignColorsToPieData = (data:any, colors:any) => {
    const pieDataCount = getNbPieData(pieData);
    let startIndex= 0; 
    let color:any;
    return data.map((item:any, index:any) => {
      if(index<4){color=colors[index]}
      else{
        if(index==4 && pieDataCount>5){startIndex=0;color=colors[(startIndex + index) % colors.length];}
        else if(index==4){startIndex=1;color=colors[(startIndex + index) % colors.length];}
        else if(index%4==0 && pieDataCount>index+1) {startIndex=0;color=colors[(startIndex + index) % colors.length];}
        else if(index>=8 && checkCase(index)){startIndex=1;color=colors[(startIndex + index) % colors.length];}           
        else{color=colors[(startIndex + index) % colors.length];}
      }
      return { ...item, color };
    });
  };
  
  let coloredPieData: PieDataItem[] = [];
  
  Data.forEach((StatItem, index) => {
    const { name, pourcentage } = StatItem;
    const value = pourcentage;
    const text = `${pourcentage}%`;
    pieData.push({ value, color: '', name, text });
    coloredPieData = assignColorsToPieData(pieData, Color);
  });
  
  const renderChart = () => {
    if (!coloredPieData || coloredPieData.length === 0) {
      return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{fontSize:18,marginTop:'25%',marginBottom:'35%'}}>No data available</Text>
        </View>
      );
    }

  return (
    <View style={{width: '100%', alignItems: 'flex-start', marginTop: '2%', height: '35%', justifyContent: 'flex-start', flexDirection: 'row' ,paddingLeft:10,marginBottom:'3%'}}>
      <PieChart
        donut
        showText
        textSize={12}
        textColor="black"
        innerRadius={70}
        showTextBackground
        textBackgroundColor="white"
        textBackgroundRadius={22}
        data={coloredPieData}
      />
      <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'flex-start', height: 'auto' }}>
        <ScrollView horizontal={false} showsVerticalScrollIndicator={true}>
          {coloredPieData.map((item, index) => (
            <View key={index} style={{ alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', width: '100%', height: 'auto', marginTop: '3%', marginLeft: 10 }}>
              <View style={{ backgroundColor: item.color,width: 30, height: 30 ,borderRadius:15}}></View>
              <View style={{ flexDirection: 'column', marginLeft: 2 }}>
                <Text style={{ color: 'black', fontSize: 11 }}>{item.name}</Text>
                <Text style={{ color: 'black', fontSize: 12 }}>{item.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
  };
    return renderChart();
};
export default BasicChart;