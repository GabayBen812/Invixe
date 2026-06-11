import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, {
  Path,
  G,
  Circle,
  Rect,
  Mask,
  Defs,
  Stop,
  LinearGradient,
} from "react-native-svg";
import { useUser } from "../../context/UserContext";
import { useDictionary } from "../../context/DictionaryContext";
import theme from "../../theme";
import MoneyIconSource from "../../assets/money.svg";

// Invixe logo SVG (converted)
const InvixeLogo = () => (
  <Svg width={106} height={38} viewBox="0 0 106 38" fill="none">
    <Path
      d="M91.4316 11.7417L86.1475 10.2134L78.0723 27.313V27.5571L83.4365 37.0933H76.6816L73.4531 31.0337L70.3242 37.0933H63.4697L68.8838 27.5571L63.8174 18.02H70.6719L73.3564 23.7261L85.0752 4.00244L89.9014 7.03271L95.1221 0.561035L91.4316 11.7417ZM96.1699 17.4243C97.6104 17.4243 98.9148 17.6472 100.082 18.0942C101.249 18.5413 102.246 19.1918 103.074 20.0444C103.902 20.8888 104.539 21.915 104.986 23.1235C105.433 24.3322 105.657 25.6945 105.657 27.2095V28.7983H93.2393V29.0962C93.2393 29.7088 93.3684 30.2557 93.625 30.7358C93.8816 31.2158 94.2495 31.5926 94.7295 31.8657C95.2095 32.1389 95.7891 32.2758 96.4678 32.2759C96.9396 32.2759 97.3707 32.2091 97.7598 32.0767C98.1571 31.9442 98.4969 31.7537 98.7783 31.5054C99.0596 31.2488 99.266 30.9423 99.3984 30.5864H105.657C105.442 31.9109 104.933 33.0617 104.13 34.0386C103.327 35.0071 102.263 35.7602 100.938 36.2983C99.6223 36.8281 98.0826 37.0932 96.3193 37.0933C94.2829 37.0933 92.5273 36.7044 91.0537 35.9263C89.5886 35.1398 88.4587 34.0135 87.6641 32.5483C86.8777 31.0748 86.4844 29.3112 86.4844 27.2583C86.4844 25.2883 86.8821 23.5667 87.6768 22.0933C88.4715 20.6197 89.5933 19.4734 91.042 18.6538C92.4906 17.8343 94.1998 17.4244 96.1699 17.4243ZM7.82715 36.7456H0.972656V17.6724H7.82715V36.7456ZM23.8867 17.4243C25.2358 17.4244 26.4071 17.7343 27.4004 18.355C28.402 18.9675 29.1763 19.8121 29.7227 20.8882C30.2773 21.9644 30.5503 23.1942 30.542 24.5767V36.7456H23.6875V26.0171C23.6958 25.0735 23.456 24.3325 22.9678 23.7944C22.4877 23.2564 21.8169 22.9869 20.9561 22.9868C20.3932 22.9868 19.9007 23.1116 19.4785 23.3599C19.0646 23.5999 18.745 23.9475 18.5215 24.4028C18.2981 24.8498 18.1821 25.3881 18.1738 26.0171V36.7456H11.3193V17.6724H17.8262V21.2983H18.0254C18.4393 20.0897 19.1679 19.1417 20.2109 18.4546C21.2623 17.7676 22.4877 17.4243 23.8867 17.4243ZM41.9854 30.2886H42.1846L45.2637 17.6724H52.4658L46.0586 36.7456H38.1113L31.7041 17.6724H38.9062L41.9854 30.2886ZM61.2686 36.7456H54.4141V17.6724H61.2686V36.7456ZM96.3193 22.2417C95.7648 22.2417 95.2555 22.362 94.792 22.6021C94.3284 22.8338 93.9553 23.1569 93.6738 23.5708C93.4007 23.9847 93.2558 24.4694 93.2393 25.0239H99.3486C99.3404 24.4776 99.1999 23.9974 98.9268 23.5835C98.6619 23.1613 98.302 22.8338 97.8467 22.6021C97.3997 22.362 96.8905 22.2417 96.3193 22.2417ZM4.40039 9.42725C5.33564 9.42735 6.1303 9.7337 6.78418 10.3462C7.44631 10.9587 7.77729 11.6953 7.77734 12.5562C7.77734 13.4171 7.44645 14.1545 6.78418 14.7671C6.13033 15.3795 5.33557 15.6859 4.40039 15.686C3.47328 15.686 2.67787 15.3796 2.01562 14.7671C1.35335 14.1545 1.02246 13.4171 1.02246 12.5562C1.02251 11.6953 1.3535 10.9587 2.01562 10.3462C2.6779 9.73359 3.47321 9.42725 4.40039 9.42725ZM57.8418 9.42725C58.7771 9.42734 59.5717 9.73368 60.2256 10.3462C60.8877 10.9587 61.2187 11.6953 61.2188 12.5562C61.2188 13.4171 60.8879 14.1545 60.2256 14.7671C59.5717 15.3795 58.777 15.6859 57.8418 15.686C56.9147 15.686 56.1193 15.3796 55.457 14.7671C54.7948 14.1545 54.4639 13.4171 54.4639 12.5562C54.4639 11.6954 54.7949 10.9587 55.457 10.3462C56.1193 9.73359 56.9146 9.42725 57.8418 9.42725Z"
      fill="#3F9FFF"
    />
  </Svg>
);

// Money SVG (new asset rendered via SvgXml)

const MoneyIcon = () => <MoneyIconSource width={27} height={27} />;

// Lightning SVG (converted, simple)
const LightningIcon = () => (
  // <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
  //   <Path d="M7 2L17 11H10L13 22L3 13H10L7 2Z" fill="#3F9FFF"/>
  // </Svg>

  <Svg width="28" height="27" viewBox="0 0 28 27" fill="none">
    <Path
      d="M17.6562 1.99915L17.8369 2.00989C18.0164 2.03171 18.1915 2.08566 18.3525 2.17004C18.567 2.28245 18.7507 2.44566 18.8887 2.64465C19.0267 2.84383 19.1147 3.07411 19.1445 3.31458C19.1743 3.55485 19.1455 3.79879 19.0605 4.02551L16.8203 9.99915H19.6562L19.8584 10.0128C20.0587 10.04 20.2521 10.1075 20.4268 10.212C20.6596 10.3515 20.8504 10.5519 20.9785 10.7911C21.1066 11.0306 21.1675 11.3011 21.1543 11.5724C21.1411 11.8433 21.0548 12.1055 20.9043 12.3312L12.9043 24.3312C12.7171 24.6127 12.4406 24.8234 12.1191 24.9279C11.7974 25.0324 11.4489 25.0243 11.1318 24.9064C10.815 24.7884 10.5472 24.5667 10.3721 24.2775C10.197 23.9882 10.1246 23.6481 10.167 23.3126L10.957 16.9991H7.65625C7.42338 16.9991 7.19363 16.9451 6.98535 16.8409C6.77713 16.7368 6.59576 16.5858 6.45605 16.3995C6.31639 16.2133 6.22234 15.9967 6.18066 15.7677C6.13902 15.5387 6.15067 15.3027 6.21582 15.0792L9.71582 3.07922C9.80668 2.76771 9.99629 2.49368 10.2559 2.29895C10.5155 2.10422 10.8317 1.99915 11.1562 1.99915H17.6562Z"
      fill="#62D24C"
      stroke="#368642"
    />
  </Svg>
);

// Dictionary/Book Icon SVG
const DictionaryIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 2H5C3.89543 2 3 2.89543 3 4V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V4C21 2.89543 20.1046 2 19 2Z"
      stroke="#3F9FFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 2V22"
      stroke="#3F9FFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 7H16"
      stroke="#3F9FFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 11H16"
      stroke="#3F9FFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 15H16"
      stroke="#3F9FFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function TopBar() {
  const { coins, lightnings } = useUser();
  const { openDictionary } = useDictionary();

  return (
    <View style={styles.container}>
      <InvixeLogo />
      <View style={styles.rightSection}>
        <View style={styles.iconWithText}>
          <MoneyIcon />
          <Text style={styles.count} numberOfLines={1}>
            {coins}
          </Text>
        </View>
        <View style={styles.iconWithText}>
          <LightningIcon />
          <Text style={styles.count} numberOfLines={1}>
            {lightnings}
          </Text>
        </View>
        <Pressable
          onPress={() => openDictionary()}
          style={styles.dictionaryButton}
          accessibilityRole="button"
          accessibilityLabel="מילון מושגים"
        >
          <DictionaryIcon />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    height: 90,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    flexShrink: 1,
    justifyContent: "flex-end",
  },
  dictionaryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.info[100],
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  iconWithText: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    flexShrink: 1,
  },
  count: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 4,
    color: "#222",
  },
});
