import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, G, Rect } from 'react-native-svg';
import { RegularDoji } from '../../assets/Candels';

interface DojiLessonVisualsProps {
  type: 'intro' | 'definition' | 'characteristics' | 'rule' | 'uptrend' | 'reversal' | 'summary';
  width?: number;
  height?: number;
}

const DojiLessonVisuals: React.FC<DojiLessonVisualsProps> = ({ 
  type, 
  width = 300, 
  height = 200 
}) => {
  const renderIntro = () => (
    <View style={styles.container}>
      <RegularDoji width={80} height={100} />
    </View>
  );

  const renderDefinition = () => (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <G>
          {/* Multiple Doji candles arranged in a grid */}
          <Rect x={20} y={80} width={15} height={8} fill="#FFFFFF" stroke="#000000" strokeWidth={1} />
          <Line x1={27.5} y1={72} x2={27.5} y2={80} stroke="#000000" strokeWidth={2} />
          <Line x1={27.5} y1={88} x2={27.5} y2={96} stroke="#000000" strokeWidth={2} />
          
          <Rect x={50} y={75} width={15} height={10} fill="#FFFFFF" stroke="#000000" strokeWidth={1} />
          <Line x1={57.5} y1={67} x2={57.5} y2={75} stroke="#000000" strokeWidth={2} />
          <Line x1={57.5} y1={85} x2={57.5} y2={93} stroke="#000000" strokeWidth={2} />
          
          <Rect x={80} y={70} width={15} height={12} fill="#FFFFFF" stroke="#000000" strokeWidth={1} />
          <Line x1={87.5} y1={62} x2={87.5} y2={70} stroke="#000000" strokeWidth={2} />
          <Line x1={87.5} y1={82} x2={87.5} y2={90} stroke="#000000" strokeWidth={2} />
          
          <Rect x={110} y={85} width={15} height={6} fill="#FFFFFF" stroke="#000000" strokeWidth={1} />
          <Line x1={117.5} y1={77} x2={117.5} y2={85} stroke="#000000" strokeWidth={2} />
          <Line x1={117.5} y1={91} x2={117.5} y2={99} stroke="#000000" strokeWidth={2} />
          
          {/* Crosshairs */}
          <Circle cx={27.5} cy={84} r={2} fill="#000000" />
          <Circle cx={57.5} cy={79} r={2} fill="#000000" />
          <Circle cx={87.5} cy={74} r={2} fill="#000000" />
          <Circle cx={117.5} cy={89} r={2} fill="#000000" />
        </G>
      </Svg>
    </View>
  );

  const renderCharacteristics = () => (
    <View style={styles.container}>
      <RegularDoji width={80} height={100} />
    </View>
  );

  const renderRule = () => (
    <View style={styles.container}>
      <RegularDoji width={80} height={100} />
    </View>
  );

  const renderUptrend = () => (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <G>
          {/* Three bullish candles */}
          <Rect x={20} y={80} width={20} height={40} fill="#4CAF50" />
          <Line x1={30} y1={40} x2={30} y2={80} stroke="#4CAF50" strokeWidth={2} />
          <Line x1={30} y1={120} x2={30} y2={140} stroke="#4CAF50" strokeWidth={2} />
          
          <Rect x={50} y={70} width={20} height={50} fill="#4CAF50" />
          <Line x1={60} y1={30} x2={60} y2={70} stroke="#4CAF50" strokeWidth={2} />
          <Line x1={60} y1={120} x2={60} y2={150} stroke="#4CAF50" strokeWidth={2} />
          
          <Rect x={80} y={60} width={20} height={60} fill="#4CAF50" />
          <Line x1={90} y1={20} x2={90} y2={60} stroke="#4CAF50" strokeWidth={2} />
          <Line x1={90} y1={120} x2={90} y2={160} stroke="#4CAF50" strokeWidth={2} />
          
          {/* Doji candle */}
          <Rect x={110} y={95} width={20} height={10} fill="#FFFFFF" stroke="#000000" strokeWidth={1} />
          <Line x1={120} y1={85} x2={120} y2={95} stroke="#000000" strokeWidth={2} />
          <Line x1={120} y1={105} x2={120} y2={115} stroke="#000000" strokeWidth={2} />
          
          {/* Trend arrow */}
          <Path d="M 20 180 Q 60 160 100 140" stroke="#87CEEB" strokeWidth={3} fill="none" />
          <Path d="M 95 145 L 100 140 L 95 135" stroke="#87CEEB" strokeWidth={3} fill="none" />
          
          {/* Crosshair */}
          <Circle cx={120} cy={100} r={3} fill="#000000" />
          <Line x1={120} y1={97} x2={120} y2={103} stroke="#000000" strokeWidth={1} />
          <Line x1={117} y1={100} x2={123} y2={100} stroke="#000000" strokeWidth={1} />
          
          {/* Arrow to Doji */}
          <Path d="M 140 100 L 150 100" stroke="#87CEEB" strokeWidth={2} fill="none" />
          <Path d="M 145 95 L 150 100 L 145 105" stroke="#87CEEB" strokeWidth={2} fill="none" />
          
          {/* Text */}
          <SvgText x={155} y={105} fontSize="12" fill="#87CEEB" textAnchor="start">
            נר "דוג'י"
          </SvgText>
        </G>
      </Svg>
    </View>
  );

  const renderReversal = () => (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <G>
          {/* Three green candles */}
          <Rect x={20} y={80} width={20} height={40} fill="#4CAF50" />
          <Line x1={30} y1={40} x2={30} y2={80} stroke="#4CAF50" strokeWidth={2} />
          <Line x1={30} y1={120} x2={30} y2={140} stroke="#4CAF50" strokeWidth={2} />
          
          <Rect x={50} y={70} width={20} height={50} fill="#4CAF50" />
          <Line x1={60} y1={30} x2={60} y2={70} stroke="#4CAF50" strokeWidth={2} />
          <Line x1={60} y1={120} x2={60} y2={150} stroke="#4CAF50" strokeWidth={2} />
          
          <Rect x={80} y={60} width={20} height={60} fill="#4CAF50" />
          <Line x1={90} y1={20} x2={90} y2={60} stroke="#4CAF50" strokeWidth={2} />
          <Line x1={90} y1={120} x2={90} y2={160} stroke="#4CAF50" strokeWidth={2} />
          
          {/* Red candle */}
          <Rect x={110} y={90} width={20} height={50} fill="#F44336" />
          <Line x1={120} y1={50} x2={120} y2={90} stroke="#F44336" strokeWidth={2} />
          <Line x1={120} y1={140} x2={120} y2={170} stroke="#F44336" strokeWidth={2} />
          
          {/* Doji candle */}
          <Rect x={140} y={95} width={20} height={10} fill="#FFFFFF" stroke="#000000" strokeWidth={1} />
          <Line x1={150} y1={85} x2={150} y2={95} stroke="#000000" strokeWidth={2} />
          <Line x1={150} y1={105} x2={150} y2={115} stroke="#000000" strokeWidth={2} />
          
          {/* Crosshair */}
          <Circle cx={150} cy={100} r={3} fill="#000000" />
          <Line x1={150} y1={97} x2={150} y2={103} stroke="#000000" strokeWidth={1} />
          <Line x1={147} y1={100} x2={153} y2={100} stroke="#000000" strokeWidth={1} />
          
          {/* Arrow to Doji */}
          <Path d="M 170 100 L 180 100" stroke="#87CEEB" strokeWidth={2} fill="none" />
          <Path d="M 175 95 L 180 100 L 175 105" stroke="#87CEEB" strokeWidth={2} fill="none" />
          
          {/* Text */}
          <SvgText x={185} y={105} fontSize="12" fill="#87CEEB" textAnchor="start">
            שינוי מגמה
          </SvgText>
        </G>
      </Svg>
    </View>
  );

  const renderSummary = () => (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <G>
          {/* Two Doji candles for summary */}
          <Rect x={60} y={80} width={20} height={10} fill="#FFFFFF" stroke="#000000" strokeWidth={1} />
          <Line x1={70} y1={72} x2={70} y2={80} stroke="#000000" strokeWidth={2} />
          <Line x1={70} y1={90} x2={70} y2={98} stroke="#000000" strokeWidth={2} />
          
          <Rect x={120} y={75} width={20} height={10} fill="#FFFFFF" stroke="#000000" strokeWidth={1} />
          <Line x1={130} y1={67} x2={130} y2={75} stroke="#000000" strokeWidth={2} />
          <Line x1={130} y1={85} x2={130} y2={93} stroke="#000000" strokeWidth={2} />
        </G>
      </Svg>
    </View>
  );

  const renderVisual = () => {
    switch (type) {
      case 'intro':
        return renderIntro();
      case 'definition':
        return renderDefinition();
      case 'characteristics':
        return renderCharacteristics();
      case 'rule':
        return renderRule();
      case 'uptrend':
        return renderUptrend();
      case 'reversal':
        return renderReversal();
      case 'summary':
        return renderSummary();
      default:
        return renderIntro();
    }
  };

  return renderVisual();
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
});

export default DojiLessonVisuals;
