import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import TopBar from "../components/ui/TopBar";
import BottomNavbar from "../components/ui/BottomNavbar";
import { useUser } from "../context/UserContext";
import theme from "../theme";
import Svg, { Path } from "react-native-svg";

type Props = NativeStackScreenProps<RootStackParamList, 'Shop'>;

// Lightning icon component
const LightningIcon = ({ size = 32 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 28 27" fill="none">
    <Path
      d="M17.6562 1.99915L17.8369 2.00989C18.0164 2.03171 18.1915 2.08566 18.3525 2.17004C18.567 2.28245 18.7507 2.44566 18.8887 2.64465C19.0267 2.84383 19.1147 3.07411 19.1445 3.31458C19.1743 3.55485 19.1455 3.79879 19.0605 4.02551L16.8203 9.99915H19.6562L19.8584 10.0128C20.0587 10.04 20.2521 10.1075 20.4268 10.212C20.6596 10.3515 20.8504 10.5519 20.9785 10.7911C21.1066 11.0306 21.1675 11.3011 21.1543 11.5724C21.1411 11.8433 21.0548 12.1055 20.9043 12.3312L12.9043 24.3312C12.7171 24.6127 12.4406 24.8234 12.1191 24.9279C11.7974 25.0324 11.4489 25.0243 11.1318 24.9064C10.815 24.7884 10.5472 24.5667 10.3721 24.2775C10.197 23.9882 10.1246 23.6481 10.167 23.3126L10.957 16.9991H7.65625C7.42338 16.9991 7.19363 16.9451 6.98535 16.8409C6.77713 16.7368 6.59576 16.5858 6.45605 16.3995C6.31639 16.2133 6.22234 15.9967 6.18066 15.7677C6.13902 15.5387 6.15067 15.3027 6.21582 15.0792L9.71582 3.07922C9.80668 2.76771 9.99629 2.49368 10.2559 2.29895C10.5155 2.10422 10.8317 1.99915 11.1562 1.99915H17.6562Z"
      fill="#62D24C"
      stroke="#368642"
    />
  </Svg>
);

// Coin icon component
const CoinIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 27 27" fill="none">
    <Path
      d="M13.5 27C20.9558 27 27 21.2916 27 14.25C27 7.20837 20.9558 1.5 13.5 1.5C6.04416 1.5 0 7.20837 0 14.25C0 21.2916 6.04416 27 13.5 27Z"
      fill="#F4900C"
    />
    <Path
      d="M13.5 0.5C20.707 0.5 26.5 6.01105 26.5 12.75C26.5 19.4889 20.707 25 13.5 25C6.29299 25 0.5 19.4889 0.5 12.75C0.5 6.01105 6.29299 0.5 13.5 0.5Z"
      fill="#FFCC4D"
      stroke="#F4900C"
    />
    <Path
      d="M13.5005 24C19.6406 24 24.6181 19.299 24.6181 13.5C24.6181 7.70101 19.6406 3 13.5005 3C7.36035 3 2.38281 7.70101 2.38281 13.5C2.38281 19.299 7.36035 24 13.5005 24Z"
      fill="#FFE8B6"
    />
    <Path
      d="M13.5005 23.25C19.6406 23.25 24.6181 18.549 24.6181 12.75C24.6181 6.95101 19.6406 2.25 13.5005 2.25C7.36035 2.25 2.38281 6.95101 2.38281 12.75C2.38281 18.549 7.36035 23.25 13.5005 23.25Z"
      fill="#FFAC33"
    />
  </Svg>
);

// Shop item interface
interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  category: 'lightning' | 'boost' | 'cosmetic';
}

// Shop items data
const shopItems: ShopItem[] = [
  {
    id: 'lightning_1',
    name: 'ברק אחד',
    description: 'השתמש בברק כדי לבצע שיעורים באינביקסי',
    price: 50,
    icon: <LightningIcon size={36} />,
    category: 'lightning'
  },
  {
    id: 'lightning_3',
    name: '3 מטבעות',
    description: 'חבילה של 3 מטבעות במחיר מוזל',
    price: 120,
    icon: (
      <View style={{ flexDirection: 'row', gap: 2, width: 80, justifyContent: 'center' }}>
        <LightningIcon size={26} />
        <LightningIcon size={26} />
        <LightningIcon size={26} />
      </View>
    ),
    category: 'lightning'
  },
  {
    id: 'lightning_5',
    name: '5 מטבעות',
    description: 'חבילה גדולה של 5 מטבעות',
    price: 180,
    icon: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, width: 80, justifyContent: 'center' }}>
        <LightningIcon size={24} />
        <LightningIcon size={24} />
        <LightningIcon size={24} />
        <LightningIcon size={24} />
        <LightningIcon size={24} />
      </View>
    ),
    category: 'lightning'
  },
  {
    id: 'lightning_10',
    name: '10 מטבעות',
    description: 'חבילה ענקית של 10 מטבעות במחיר הטוב ביותר',
    price: 300,
    icon: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, width: 80, justifyContent: 'center' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <LightningIcon key={i} size={20} />
        ))}
      </View>
    ),
    category: 'lightning'
  }
];

export default function ShopScreen({ navigation }: Props) {
  const { coins, lightnings, setCoins, setLightnings } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<'lightning' | 'boost' | 'cosmetic'>('lightning');

  const handlePurchase = async (item: ShopItem) => {
    if (coins < item.price) {
      Alert.alert(
        "מטבעות לא מספיקים",
        "אין לך מספיק מטבעות לרכישה זו. המשך ללמוד כדי להרוויח יותר מטבעות!",
        [{ text: "הבנתי", style: "default" }]
      );
      return;
    }

    try {
      const newCoins = coins - item.price;
      let newLightnings = lightnings;

      if (item.category === 'lightning') {
        const lightningCount = parseInt(item.id.split('_')[1]);
        newLightnings = lightnings + lightningCount;
      }

      await setCoins(newCoins);
      if (item.category === 'lightning') {
        await setLightnings(newLightnings);
      }

      Alert.alert(
        "רכישה מוצלחת!",
        `קנית ${item.name} בהצלחה!`,
        [{ text: "מעולה!", style: "default" }]
      );
    } catch (error) {
      Alert.alert(
        "שגיאה",
        "אירעה שגיאה בעת הרכישה. נסה שוב.",
        [{ text: "אישור", style: "default" }]
      );
    }
  };

  const handleTabPress = (tab: 'map' | 'profile' | 'shop' | 'graph') => {
    switch (tab) {
      case 'map':
        navigation.navigate('Map');
        break;
      case 'graph':
        navigation.navigate('Sandbox');
        break;
      case 'profile':
        navigation.navigate('Profile');
        break;
      case 'shop':
        // Already on shop screen, do nothing
        break;
    }
  };

  const filteredItems = shopItems.filter(item => item.category === selectedCategory);

  return (
    <View style={styles.container}>
      <TopBar />
      
      <View style={styles.header}>
        <Text style={styles.title}>החנות</Text>
        <Text style={styles.subtitle}>קנה פריטים שיעזרו לך בהמשך הדרך</Text>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        <TouchableOpacity
          style={[
            styles.categoryTab,
            selectedCategory === 'lightning' && styles.categoryTabActive
          ]}
          onPress={() => setSelectedCategory('lightning')}
        >
          <LightningIcon size={20} />
          <Text style={[
            styles.categoryTabText,
            selectedCategory === 'lightning' && styles.categoryTabTextActive
          ]}>
            מטבעות
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.categoryTab,
            selectedCategory === 'boost' && styles.categoryTabActive
          ]}
          onPress={() => setSelectedCategory('boost')}
        >
          <Text style={[
            styles.categoryTabText,
            selectedCategory === 'boost' && styles.categoryTabTextActive
          ]}>
            בוסטרים
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.categoryTab,
            selectedCategory === 'cosmetic' && styles.categoryTabActive
          ]}
          onPress={() => setSelectedCategory('cosmetic')}
        >
          <Text style={[
            styles.categoryTabText,
            selectedCategory === 'cosmetic' && styles.categoryTabTextActive
          ]}>
            פריטים
          </Text>
        </TouchableOpacity>
      </View>

      {/* Shop Items */}
      <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
        {filteredItems.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemIcon}>
              {item.icon}
            </View>
            
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
            
            <View style={styles.itemPrice}>
              <View style={styles.priceContainer}>
                <CoinIcon size={20} />
                <Text style={styles.priceText}>{item.price}</Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.buyButton,
                  coins < item.price && styles.buyButtonDisabled
                ]}
                onPress={() => handlePurchase(item)}
                disabled={coins < item.price}
              >
                <Text style={[
                  styles.buyButtonText,
                  coins < item.price && styles.buyButtonTextDisabled
                ]}>
                  קנה
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {selectedCategory === 'boost' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>בקרוב יגיעו פריטי דחיפה חדשים!</Text>
          </View>
        )}
        
        {selectedCategory === 'cosmetic' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>בקרוב יגיעו פריטים קוסמטיים!</Text>
          </View>
        )}
      </ScrollView>

      <BottomNavbar activeTab="shop" onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D3E9FF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: theme.radius.pill,
    gap: 8,
  },
  categoryTabActive: {
    backgroundColor: theme.colors.primaryBlue,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  categoryTabTextActive: {
    color: theme.colors.white,
  },
  itemsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemIcon: {
    width: 80,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    lineHeight: 20,
  },
  itemPrice: {
    alignItems: 'flex-end',
    gap: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.optimismOrangeDark,
  },
  buyButton: {
    backgroundColor: theme.colors.growthGreen,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    minWidth: 60,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: theme.colors.gray,
  },
  buyButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  buyButtonTextDisabled: {
    color: theme.colors.text,
    opacity: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.6,
    textAlign: 'center',
  },
}); 