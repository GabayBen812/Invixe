import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Button from "../components/ui/Button";
import theme from "../theme";
import { useUser } from '../context/UserContext';
import Svg, { Path, G, Mask, Ellipse, Defs } from 'react-native-svg';
import TopBar from '../components/ui/TopBar';

// Gold coin SVG (same as TopBar)
const CoinIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 27 28" fill="none">
    <Path d="M13.5 27.0933C20.5416 27.0933 26.25 21.3849 26.25 14.3433C26.25 7.30163 20.5416 1.59326 13.5 1.59326C6.45837 1.59326 0.75 7.30163 0.75 14.3433C0.75 21.3849 6.45837 27.0933 13.5 27.0933Z" fill="#F4900C"/>
    <Path d="M13.5 0.593262C20.2655 0.593262 25.75 6.07777 25.75 12.8433C25.75 19.6087 20.2655 25.0933 13.5 25.0933C6.73451 25.0933 1.25 19.6087 1.25 12.8433C1.25 6.07777 6.73451 0.593262 13.5 0.593262Z" fill="#FFCC4D" stroke="#F4900C"/>
    <Path d="M13.5 24.0933C19.299 24.0933 24 19.3923 24 13.5933C24 7.79427 19.299 3.09326 13.5 3.09326C7.70101 3.09326 3 7.79427 3 13.5933C3 19.3923 7.70101 24.0933 13.5 24.0933Z" fill="#FFE8B6"/>
    <Path d="M13.5 23.3433C19.299 23.3433 24 18.6423 24 12.8433C24 7.04427 19.299 2.34326 13.5 2.34326C7.70101 2.34326 3 7.04427 3 12.8433C3 18.6423 7.70101 23.3433 13.5 23.3433Z" fill="#FFAC33"/>
    <Path d="M7.16016 8.23543C7.16016 7.82668 7.56141 7.66318 7.56141 7.66318L13.4699 4.88818L19.4347 7.66318C19.4347 7.66318 19.8457 7.75468 19.8457 8.23843V8.71918H7.16016V8.23543Z" fill="#FFE8B6"/>
    <Path d="M19.4455 9.72C19.4455 9.282 19.0668 8.92725 18.6003 8.92725H8.34553C7.87828 8.92725 7.55278 9.282 7.55278 9.72C7.55278 10.0177 7.70578 10.2742 7.94953 10.41V10.9095H9.53503V10.5127H11.1205V10.9095H12.706V10.5127H14.2915V10.9095H15.877V10.5127H17.4625V10.9095H19.0488V10.3897C19.2865 10.2487 19.4455 10.002 19.4455 9.72ZM20.6343 18.093C20.6343 18.2507 20.5716 18.402 20.4601 18.5135C20.3485 18.6251 20.1973 18.6877 20.0395 18.6877H6.95803C6.80029 18.6877 6.64902 18.6251 6.53748 18.5135C6.42594 18.402 6.36328 18.2507 6.36328 18.093C6.36328 17.9353 6.42594 17.784 6.53748 17.6724C6.64902 17.5609 6.80029 17.4982 6.95803 17.4982H20.0403C20.368 17.4982 20.6343 17.7645 20.6343 18.093Z" fill="#F4900C"/>
    <Path d="M19.8423 9.24319C19.8421 9.34835 19.8002 9.44915 19.7259 9.52351C19.6515 9.59787 19.5507 9.63974 19.4455 9.63994H7.55278C7.45177 9.63372 7.35694 9.58922 7.28761 9.5155C7.21829 9.44177 7.17969 9.34438 7.17969 9.24319C7.17969 9.14199 7.21829 9.0446 7.28761 8.97088C7.35694 8.89715 7.45177 8.85265 7.55278 8.84644L19.4455 8.84869C19.4975 8.84849 19.549 8.85854 19.5971 8.87827C19.6452 8.898 19.6889 8.92701 19.7257 8.96366C19.7626 9.0003 19.7918 9.04385 19.8118 9.09181C19.8318 9.13978 19.8422 9.19122 19.8423 9.24319ZM9.13903 9.70369H17.8608V10.5932H9.13903V9.70369Z" fill="#F4900C"/>
    <Path d="M9.53937 15.7149C9.53937 16.1529 9.30237 16.5076 9.01062 16.5076H8.48187C8.19012 16.5076 7.95312 16.1529 7.95312 15.7149V9.70437C7.95312 9.26637 8.19012 8.91162 8.48187 8.91162H9.01062C9.30237 8.91162 9.53937 9.26637 9.53937 9.70437V15.7149ZM19.0539 15.7149C19.0539 16.1529 18.8176 16.5076 18.5251 16.5076H17.9964C17.7046 16.5076 17.4676 16.1529 17.4676 15.7149V9.70437C17.4676 9.26637 17.7039 8.91162 17.9964 8.91162H18.5251C18.8169 8.91162 19.0539 9.26637 19.0539 9.70437V15.7149ZM12.7111 15.7149C12.7111 16.1529 12.4741 16.5076 12.1824 16.5076H11.6536C11.3619 16.5076 11.1249 16.1529 11.1249 15.7149V9.70437C11.1249 9.26637 11.3619 8.91162 11.6536 8.91162H12.1824C12.4741 8.91162 12.7111 9.26637 12.7111 9.70437V15.7149ZM15.8821 15.7149C15.8821 16.1529 15.6451 16.5076 15.3534 16.5076H14.8254C14.5336 16.5076 14.2966 16.1529 14.2966 15.7149V9.70437C14.2966 9.26637 14.5336 8.91162 14.8254 8.91162H15.3534C15.6451 8.91162 15.8821 9.26637 15.8821 9.70437V15.7149Z" fill="#FFD983"/>
    <Path d="M19.4474 16.1109C19.4474 16.5489 19.0927 16.9036 18.6547 16.9036H8.34744C8.13719 16.9036 7.93555 16.8201 7.78688 16.6714C7.63821 16.5228 7.55469 16.3211 7.55469 16.1109C7.55469 15.9006 7.63821 15.699 7.78688 15.5503C7.93555 15.4016 8.13719 15.3181 8.34744 15.3181H18.6547C19.0919 15.3181 19.4474 15.6729 19.4474 16.1109Z" fill="#FFCC4D"/>
    <Path d="M20.2407 16.9036C20.2407 17.3416 19.886 17.6963 19.448 17.6963H7.55447C7.34422 17.6963 7.14258 17.6128 6.99391 17.4641C6.84524 17.3155 6.76172 17.1138 6.76172 16.9036C6.76172 16.6933 6.84524 16.4917 6.99391 16.343C7.14258 16.1944 7.34422 16.1108 7.55447 16.1108H19.4472C19.8852 16.1108 20.2407 16.4656 20.2407 16.9036Z" fill="#FFD983"/>
    <Path d="M20.6343 17.4986C20.6343 17.6563 20.5716 17.8076 20.4601 17.9191C20.3485 18.0306 20.1973 18.0933 20.0395 18.0933H6.95803C6.87993 18.0933 6.80259 18.0779 6.73043 18.048C6.65827 18.0181 6.59271 17.9743 6.53748 17.9191C6.48225 17.8639 6.43844 17.7983 6.40855 17.7262C6.37867 17.654 6.36328 17.5767 6.36328 17.4986C6.36328 17.4205 6.37867 17.3431 6.40855 17.271C6.43844 17.1988 6.48225 17.1332 6.53748 17.078C6.59271 17.0228 6.65827 16.979 6.73043 16.9491C6.80259 16.9192 6.87993 16.9038 6.95803 16.9038H20.0403C20.368 16.9038 20.6343 17.1701 20.6343 17.4986Z" fill="#FFD983"/>
    <Path d="M19.4474 9.30789C19.4474 8.86989 19.0687 8.51514 18.6022 8.51514H8.34744C7.88019 8.51514 7.55469 8.86989 7.55469 9.30789C7.55469 9.60564 7.70769 9.86214 7.95144 9.99789V10.4974H9.53694V10.1006H11.1224V10.4974H12.7079V10.1006H14.2934V10.4974H15.8789V10.1006H17.4644V10.4974H19.0507V9.97764C19.2884 9.83664 19.4474 9.58989 19.4474 9.30789Z" fill="#FFCC4D"/>
    <Path d="M7.16016 8.69051C7.16016 8.28176 7.56141 8.11826 7.56141 8.11826L13.4699 5.34326L19.4347 8.11826C19.4347 8.11826 19.8457 8.20976 19.8457 8.69351V8.91176H7.16016V8.69051Z" fill="#FFD983"/>
    <Path d="M13.4993 6.35034C13.4993 6.35034 9.40801 8.27859 9.00001 8.45259C8.59126 8.62584 8.72776 8.91084 9.00076 8.91084H17.9783C18.3998 8.91084 18.3 8.58909 17.9655 8.41509C17.631 8.24184 13.4993 6.35034 13.4993 6.35034Z" fill="#FFAC33"/>
    <Path d="M19.8423 8.91091C19.8421 9.01607 19.8002 9.11687 19.7259 9.19124C19.6515 9.2656 19.5507 9.30746 19.4455 9.30766H7.55278C7.45177 9.30145 7.35694 9.25694 7.28761 9.18322C7.21829 9.1095 7.17969 9.01211 7.17969 8.91091C7.17969 8.80971 7.21829 8.71232 7.28761 8.6386C7.35694 8.56488 7.45177 8.52037 7.55278 8.51416L19.4455 8.51641C19.4975 8.51621 19.549 8.52627 19.5971 8.54599C19.6452 8.56572 19.6889 8.59474 19.7257 8.63138C19.7626 8.66802 19.7918 8.71157 19.8118 8.75954C19.8318 8.8075 19.8422 8.85894 19.8423 8.91091Z" fill="#FFD983"/>
  </Svg>
);

const COINS_REWARD = 10;
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/user/add-coins`;

// Character SVG from provided design (simplified version)
const CharacterSVG = () => (
  <Svg width={172} height={168} viewBox="0 0 172 168" fill="none">
    <Defs>
      <Mask id="characterMask" maskUnits="userSpaceOnUse" x="0" y="0" width="172" height="168">
        <Ellipse cx="86" cy="83.7935" rx="86" ry="83.7935" fill="white"/>
      </Mask>
    </Defs>
    <Ellipse cx="86" cy="83.7935" rx="86" ry="83.7935" fill="#FFA73B"/>
    <G mask="url(#characterMask)">
      <Path d="M114.116 126.589C116.269 127.212 145.019 145.954 145.407 147.988L145.221 149.219C143.674 150.726 141.734 152.392 142.286 154.709C142.439 155.343 143.062 155.896 143.209 156.509C143.554 157.968 140.837 162.734 139.908 164.294C137.093 169.007 107.202 163.019 101.272 163.36C99.7576 163.445 98.7574 162.875 97.4566 162.785C85.2463 161.943 75.6759 156.858 66.0509 149.717C57.3442 143.257 20.4358 152.874 17.375 142.367C17.465 142.059 26.1364 133.299 33.0953 129.336C39.4006 125.746 50.5339 120.822 50.5339 120.822C50.5339 120.822 54.8409 119.07 55.6334 118.335C56.2619 117.755 56.5735 116.013 57.1638 115.034C57.8688 113.862 59.3719 112.254 59.7764 111.157C60.4213 109.416 58.235 106.758 58.328 104.777C43.3083 105.864 35.0771 91.9116 31.2949 79.7275C30.0159 75.6058 28.2505 68.7203 28.8353 64.5347C28.9228 63.9223 29.0758 63.4857 29.7317 63.278C33.4538 62.7029 36.8316 64.5188 40.3241 65.3442C40.1656 60.3332 39.3239 55.2316 39.7666 50.1567C40.98 36.2473 48.8232 29.5535 61.0881 24.0685C83.8744 13.8868 112.504 21.9864 124.943 43.3404C131.633 54.8216 130.25 67.3731 129.452 80.0257C128.418 87.2592 128.634 87.9869 129.972 93.8233C130.999 105.251 124.621 116.663 116.308 124.204C115.439 124.992 113.903 125.226 114.105 126.584L114.116 126.589Z" fill="#0D2033"/>
      <Path d="M128.326 74.4025C128.108 76.4772 128.143 77.5949 128.108 77.7058C128.083 77.7073 128.095 77.7454 128.108 77.7058L126.648 87.9818C131.283 100.145 123.691 118.277 112.3 124.555C100.899 130.839 83.9829 126.387 73.2921 120.295C66.613 116.493 59.4749 109.767 60.5462 101.561C59.3984 101.476 58.7753 102.429 57.5291 102.61C43.5152 104.644 35.7649 87.8646 32.8244 77.1823C31.764 73.3322 30.8458 69.3489 31.0371 65.3444C31.6001 64.7586 38.8803 67.3786 40.1593 67.9058C51.4131 72.5494 59.6006 80.1271 64.3557 91.1183C64.7657 92.0715 66.2578 91.4378 66.5584 90.1012C67.0558 87.87 66.8317 85.3352 67.1487 83.2211C69.2092 69.3649 77.3531 59.3535 68.6517 45.4707C67.5039 43.6388 65.8588 42.2649 64.9242 40.3159C65.7276 40.3053 66.5365 40.2627 67.34 40.3532C76.5496 41.4129 91.2577 47.2547 99.5436 51.5787C101.97 52.8461 107.682 57.1169 108.081 59.7689C108.294 61.2014 108.065 63.0279 108.097 64.5509C108.108 65.0035 107.84 66.3987 108.912 65.8769C111.3 64.716 114.886 57.0477 115.771 54.449C117.398 49.3702 119.424 42.9631 118.477 37.6533C119.958 41.9721 123.489 45.0766 125.314 49.3688C126.801 52.8674 127.663 55.9181 128.32 60.2854C129.141 65.7381 128.32 74.3972 128.32 74.3972L128.326 74.4025Z" fill="#62D24C"/>
      <Path d="M90.0649 159.606C80.7515 157.582 72.5038 152.023 65.1689 146.298C66.262 143.156 68.1586 140.185 67.6612 136.708L60.7076 137.205L58.6598 137.595L65.464 138.854L62.0453 147.102C62.0453 147.102 70.9702 152.864 79.1568 157.618C84.3916 160.659 97.3097 161.294 97.3097 161.294L113.907 163.576L128.908 165.763L79.1568 171.895L70.6561 166.95C60.3878 171.127 17.6552 167.333 18.5853 144.886C18.5853 144.886 27.0632 135.047 34.0297 130.642C41.6386 125.83 55.6313 120.205 55.6313 120.205C56.6151 122.559 55.9483 125.003 56.1669 127.41C56.3746 129.657 58.6598 137.595 58.6598 137.595L60.7076 137.205C60.7076 137.205 58.5664 131.313 58.3915 130.03C57.905 126.43 58.0253 122.005 57.7957 118.325C57.9761 116.126 60.0148 114.422 61.3703 112.755C62.3103 113.319 62.6164 114.491 63.2668 115.162C63.8353 115.753 64.8847 115.993 65.2017 116.472C65.5843 117.047 65.5241 118.16 65.9013 118.985C71.9026 132.171 81.2816 142.635 87.9825 154.984C88.3542 155.671 90.371 159.324 90.0649 159.611V159.606Z" fill="#FFE435"/>
    </G>
  </Svg>
);

type Props = NativeStackScreenProps<RootStackParamList, "LessonComplete">;

export default function LessonCompleteScreen({ navigation, route }: Props) {
  const { coins, setCoins, lightnings } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const addCoins = async () => {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coins: COINS_REWARD }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to add coins");
        }
        const data = await res.json();
        // Update local coins state
        setCoins(data.newCoins);
      } catch (e: any) {
        console.error("Error adding coins:", e);
        setError(e.message || "Network error");
      } finally {
        setLoading(false);
      }
    };
    addCoins();
  }, []);

  const handleContinue = () => {
    navigation.navigate("Map");
  };
  
  // Performance stats (placeholders for now - can be calculated from lesson data)
  const totalDollars = coins || 0;
  const accuracy = 88; // Can be calculated from lesson performance
  const timeSpent = "3:20"; // Can be tracked during lesson

  return (
    <View style={{ flex: 1, backgroundColor: '#D3E9FF' }}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Character Avatar */}
        <View style={styles.characterContainer}>
          <CharacterSVG />
        </View>

        {/* Hebrew Heading */}
        <Text style={styles.heading}>השיעור הושלם!</Text>

        {/* Hebrew Paragraph */}
        <Text style={styles.paragraph}>
          עכשיו שאתה מבין איך לקרוא נרות, כל מה שנשאר זה ללמוד איך להשתמש בזה בחוכמה.
        </Text>

        {/* Performance Summary Boxes */}
        <View style={styles.summaryBoxes}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryHeader}>TOTAL $</Text>
            <View style={styles.summaryContent}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.5v-1.68c1.51-.29 2.72-1.16 2.72-2.77-.01-1.54-1.31-2.46-3.66-3.09z" fill="#24AE5F"/>
              </Svg>
              <Text style={styles.summaryValue}>{totalDollars}</Text>
            </View>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryHeader}>GOOD</Text>
            <View style={styles.summaryContent}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#FF6B6B"/>
              </Svg>
              <Text style={styles.summaryValue}>{accuracy}%</Text>
            </View>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryHeader}>SPEEDY</Text>
            <View style={styles.summaryContent}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#FF6B6B"/>
              </Svg>
              <Text style={styles.summaryValue}>{timeSpent}</Text>
            </View>
          </View>
        </View>

        {/* CLAIM Button */}
        {loading ? (
          <ActivityIndicator size="large" color="#FFA73B" style={{ marginTop: theme.spacing.md }} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <Pressable style={styles.claimButton} onPress={handleContinue}>
            <Text style={styles.claimButtonText}>CLAIM $</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  characterContainer: {
    marginTop: 20,
    marginBottom: 20,
    width: 172,
    height: 168,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 32,
    fontFamily: theme.font.bold,
    color: "#FFA73B",
    marginBottom: 16,
    textAlign: "center",
  },
  paragraph: {
    fontSize: 18,
    color: "#0D2033",
    marginBottom: 32,
    textAlign: "center",
    fontFamily: theme.font.family,
    paddingHorizontal: 20,
    lineHeight: 26,
  },
  summaryBoxes: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 500,
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFA73B",
    marginHorizontal: 6,
    overflow: "hidden",
  },
  summaryHeader: {
    fontSize: 14,
    fontWeight: "bold",
    backgroundColor: "#FFA73B",
    color: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    textAlign: "center",
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0D2033",
    marginLeft: 8,
  },
  claimButton: {
    backgroundColor: "#FFA73B",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  claimButtonText: {
    color: "#0D2033",
    fontSize: 18,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  error: {
    color: theme.colors.error,
    fontSize: 16,
    marginTop: theme.spacing.md,
    fontFamily: theme.font.family,
    textAlign: "center",
  },
}); 